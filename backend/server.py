"""The Blooming Branch Team — FastAPI backend."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Request, Header, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt as pyjwt
import requests
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Config ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
ADMIN_USERNAME = os.environ["ADMIN_USERNAME"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "blooming-branch")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
storage_key: Optional[str] = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ---------- App setup ----------
app = FastAPI(title="Blooming Branch API")
api_router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# ---------- Storage helpers ----------
def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_LLM_KEY:
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Object storage initialized")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage not available")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Auth helpers ----------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> str:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = pyjwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        username = payload.get("sub")
        if not username:
            raise HTTPException(401, "Invalid token")
        return username
    except pyjwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")


# ---------- Models ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str = "Digital Download"
    image_url: Optional[str] = None
    file_path: Optional[str] = None  # storage path of downloadable asset
    original_filename: Optional[str] = None
    is_published: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str = "Digital Download"
    image_url: Optional[str] = None
    is_published: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class BookingRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None


class CheckoutCreate(BaseModel):
    product_id: str
    email: EmailStr
    origin_url: str


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


class CheckoutStatus(BaseModel):
    status: str
    payment_status: str
    amount_total: int
    currency: str
    download_token: Optional[str] = None
    product_name: Optional[str] = None


# ---------- Routes: Auth ----------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    admin = await db.admins.find_one({"username": body.username}, {"_id": 0})
    if not admin or not verify_password(body.password, admin["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    return LoginResponse(token=create_token(admin["username"]), username=admin["username"])


@api_router.get("/auth/me")
async def me(username: str = Depends(require_admin)):
    return {"username": username}


# ---------- Routes: Products (public) ----------
@api_router.get("/products", response_model=List[Product])
async def list_products():
    rows = await db.products.find({"is_published": True}, {"_id": 0}).to_list(500)
    return [Product(**r) for r in rows]


@api_router.get("/products/{pid}", response_model=Product)
async def get_product(pid: str):
    row = await db.products.find_one({"id": pid}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Product not found")
    return Product(**row)


# ---------- Routes: Admin products ----------
@api_router.get("/admin/products", response_model=List[Product])
async def admin_list_products(_: str = Depends(require_admin)):
    rows = await db.products.find({}, {"_id": 0}).to_list(1000)
    return [Product(**r) for r in rows]


@api_router.post("/admin/products", response_model=Product)
async def admin_create_product(body: ProductCreate, _: str = Depends(require_admin)):
    p = Product(**body.model_dump())
    await db.products.insert_one(p.model_dump())
    return p


@api_router.put("/admin/products/{pid}", response_model=Product)
async def admin_update_product(pid: str, body: ProductUpdate, _: str = Depends(require_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.products.update_one({"id": pid}, {"$set": updates})
    row = await db.products.find_one({"id": pid}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Product not found")
    return Product(**row)


@api_router.delete("/admin/products/{pid}")
async def admin_delete_product(pid: str, _: str = Depends(require_admin)):
    r = await db.products.delete_one({"id": pid})
    if r.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


@api_router.post("/admin/products/{pid}/file")
async def admin_upload_product_file(
    pid: str, file: UploadFile = File(...), _: str = Depends(require_admin)
):
    row = await db.products.find_one({"id": pid}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Product not found")
    ext = (file.filename or "bin").split(".")[-1]
    path = f"{APP_NAME}/products/{pid}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    put_object(path, data, file.content_type or "application/octet-stream")
    await db.products.update_one(
        {"id": pid},
        {"$set": {"file_path": path, "original_filename": file.filename}},
    )
    return {"file_path": path, "original_filename": file.filename}


# ---------- Routes: Contact & Booking ----------
@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(body: ContactCreate):
    msg = ContactMessage(**body.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    return msg


@api_router.get("/admin/contacts", response_model=List[ContactMessage])
async def admin_list_contacts(_: str = Depends(require_admin)):
    rows = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ContactMessage(**r) for r in rows]


@api_router.post("/booking", response_model=BookingRequest)
async def create_booking(body: BookingCreate):
    b = BookingRequest(**body.model_dump())
    await db.booking_requests.insert_one(b.model_dump())
    return b


@api_router.get("/admin/bookings", response_model=List[BookingRequest])
async def admin_list_bookings(_: str = Depends(require_admin)):
    rows = await db.booking_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [BookingRequest(**r) for r in rows]


# ---------- Routes: Stripe Checkout ----------
def _stripe(request: Request) -> StripeCheckout:
    host = str(request.base_url).rstrip("/")
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host}/api/webhook/stripe")


@api_router.post("/checkout/session", response_model=CheckoutResponse)
async def create_checkout_session(body: CheckoutCreate, request: Request):
    product = await db.products.find_one({"id": body.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Product not found")
    if not product.get("is_published", True):
        raise HTTPException(400, "Product unavailable")

    amount = float(product["price"])
    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/shop/{product['id']}"

    stripe = _stripe(request)
    req = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "product_id": product["id"],
            "product_name": product["name"],
            "customer_email": body.email,
        },
    )
    session: CheckoutSessionResponse = await stripe.create_checkout_session(req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "product_id": product["id"],
        "product_name": product["name"],
        "amount": amount,
        "currency": "usd",
        "email": body.email,
        "status": "initiated",
        "payment_status": "unpaid",
        "download_token": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return CheckoutResponse(url=session.url, session_id=session.session_id)


@api_router.get("/checkout/status/{session_id}", response_model=CheckoutStatus)
async def checkout_status(session_id: str, request: Request):
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(404, "Session not found")

    stripe = _stripe(request)
    status: CheckoutStatusResponse = await stripe.get_checkout_status(session_id)

    # Idempotent update
    download_token = txn.get("download_token")
    if status.payment_status == "paid" and not download_token:
        download_token = uuid.uuid4().hex
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status.status,
                "payment_status": status.payment_status,
                "download_token": download_token,
                "paid_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
    else:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": status.status, "payment_status": status.payment_status}},
        )

    return CheckoutStatus(
        status=status.status,
        payment_status=status.payment_status,
        amount_total=status.amount_total,
        currency=status.currency,
        download_token=download_token,
        product_name=txn.get("product_name"),
    )


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe = _stripe(request)
    try:
        evt = await stripe.handle_webhook(body, sig)
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(400, "Invalid webhook")
    if evt.session_id:
        txn = await db.payment_transactions.find_one({"session_id": evt.session_id}, {"_id": 0})
        if txn and not txn.get("download_token") and evt.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": evt.session_id},
                {"$set": {
                    "payment_status": evt.payment_status,
                    "download_token": uuid.uuid4().hex,
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
    return {"received": True}


@api_router.get("/download/{token}")
async def download(token: str):
    txn = await db.payment_transactions.find_one({"download_token": token}, {"_id": 0})
    if not txn or txn.get("payment_status") != "paid":
        raise HTTPException(404, "Invalid download link")
    product = await db.products.find_one({"id": txn["product_id"]}, {"_id": 0})
    if not product or not product.get("file_path"):
        raise HTTPException(404, "File not available")
    data, ctype = get_object(product["file_path"])
    fname = product.get("original_filename") or "download"
    return Response(
        content=data,
        media_type=ctype,
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


# ---------- Seed ----------
async def seed_admin_and_products():
    existing = await db.admins.find_one({"username": ADMIN_USERNAME}, {"_id": 0})
    if not existing:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "username": ADMIN_USERNAME,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {ADMIN_USERNAME}")

    count = await db.products.count_documents({})
    if count == 0:
        demo = [
            {
                "name": "Early Speech Milestones Toolkit",
                "description": "A 28-page illustrated guide for parents of children 2-5, with daily speech-building activities, milestone trackers, and printable flashcards.",
                "price": 18.00,
                "category": "Parent Guide",
                "image_url": "https://images.pexels.com/photos/5206088/pexels-photo-5206088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            },
            {
                "name": "Executive Functioning Workbook — Teens",
                "description": "60 printable pages covering time management, working memory, task initiation, and emotional regulation — designed for ages 11-18.",
                "price": 24.00,
                "category": "Workbook",
                "image_url": "https://images.pexels.com/photos/8872203/pexels-photo-8872203.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            },
            {
                "name": "Parent Coaching Conversation Cards",
                "description": "A deck of 40 conversation starter cards to build connection, communication, and regulation skills at home. Digital PDF, print at home.",
                "price": 14.00,
                "category": "Printable",
                "image_url": "https://images.unsplash.com/photo-1676116777245-1cc40079cd38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwcHJvZHVjdHMlMjBtb2NrdXAlMjB0YWJsZXR8ZW58MHx8fHwxNzc2OTI0NTczfDA&ixlib=rb-4.1.0&q=85",
            },
            {
                "name": "Adult Cognitive Wellness Journal",
                "description": "A weekly journal for adults (including nursing home & independent living) focused on memory, routine, and sense of purpose. 52-week workbook.",
                "price": 22.00,
                "category": "Journal",
                "image_url": "https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            },
        ]
        for d in demo:
            p = Product(**d)
            await db.products.insert_one(p.model_dump())
        logger.info(f"Seeded {len(demo)} demo products")


@app.on_event("startup")
async def on_startup():
    await seed_admin_and_products()
    init_storage()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- Mount ----------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
