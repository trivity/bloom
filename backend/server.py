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


class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    cover_image: Optional[str] = None
    author: str = "The Blooming Branch Team"
    is_published: bool = True
    published_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BlogCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    cover_image: Optional[str] = None
    author: str = "The Blooming Branch Team"
    is_published: bool = True


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    author: Optional[str] = None
    is_published: Optional[bool] = None


class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote: str
    name: str
    role: Optional[str] = None
    image_url: Optional[str] = None
    rating: Optional[int] = 5
    is_published: bool = True
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TestimonialCreate(BaseModel):
    quote: str
    name: str
    role: Optional[str] = None
    image_url: Optional[str] = None
    rating: Optional[int] = 5
    is_published: bool = True
    sort_order: int = 0


class TestimonialUpdate(BaseModel):
    quote: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    image_url: Optional[str] = None
    rating: Optional[int] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None


class OrderRow(BaseModel):
    id: str
    session_id: str
    product_id: str
    product_name: str
    amount: float
    currency: str
    email: str
    status: str
    payment_status: str
    download_token: Optional[str] = None
    created_at: str
    paid_at: Optional[str] = None


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

    # Try to refresh from Stripe; if the emergent test proxy can't retrieve,
    # fall back to the DB state (webhook will have updated it when payment completes).
    stripe = _stripe(request)
    live_status: Optional[str] = None
    live_payment_status: Optional[str] = None
    live_amount: Optional[int] = None
    live_currency: Optional[str] = None
    try:
        s: CheckoutStatusResponse = await stripe.get_checkout_status(session_id)
        live_status = s.status
        live_payment_status = s.payment_status
        live_amount = s.amount_total
        live_currency = s.currency
    except Exception as e:
        logger.warning(f"Stripe retrieve failed for {session_id}: {e}. Falling back to DB.")

    # Decide effective payment_status (prefer "paid" if either source says so)
    effective_payment_status = live_payment_status or txn.get("payment_status") or "unpaid"
    if txn.get("payment_status") == "paid":
        effective_payment_status = "paid"

    # Idempotent mint of download_token
    download_token = txn.get("download_token")
    if effective_payment_status == "paid" and not download_token:
        download_token = uuid.uuid4().hex
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": live_status or "complete",
                "payment_status": "paid",
                "download_token": download_token,
                "paid_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
    elif live_status or live_payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": live_status or txn.get("status", "pending"),
                "payment_status": effective_payment_status,
            }},
        )

    return CheckoutStatus(
        status=live_status or txn.get("status", "pending"),
        payment_status=effective_payment_status,
        amount_total=live_amount if live_amount is not None else int(float(txn.get("amount", 0)) * 100),
        currency=live_currency or txn.get("currency", "usd"),
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


# ---------- Routes: Admin Orders ----------
@api_router.get("/admin/orders", response_model=List[OrderRow])
async def admin_list_orders(_: str = Depends(require_admin)):
    rows = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    out: List[OrderRow] = []
    for r in rows:
        out.append(OrderRow(
            id=r.get("id", ""),
            session_id=r.get("session_id", ""),
            product_id=r.get("product_id", ""),
            product_name=r.get("product_name", ""),
            amount=float(r.get("amount", 0)),
            currency=r.get("currency", "usd"),
            email=r.get("email", ""),
            status=r.get("status", ""),
            payment_status=r.get("payment_status", ""),
            download_token=r.get("download_token"),
            created_at=r.get("created_at", ""),
            paid_at=r.get("paid_at"),
        ))
    return out


@api_router.post("/admin/orders/{order_id}/reissue")
async def admin_reissue_download(order_id: str, _: str = Depends(require_admin)):
    txn = await db.payment_transactions.find_one({"id": order_id}, {"_id": 0})
    if not txn:
        raise HTTPException(404, "Order not found")
    if txn.get("payment_status") != "paid":
        raise HTTPException(400, "Order is not paid yet")
    new_token = uuid.uuid4().hex
    await db.payment_transactions.update_one(
        {"id": order_id},
        {"$set": {"download_token": new_token, "reissued_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"download_token": new_token}


# ---------- Routes: Blog ----------
@api_router.get("/blog", response_model=List[BlogPost])
async def list_blog():
    rows = await db.blog_posts.find({"is_published": True}, {"_id": 0}).sort("published_at", -1).to_list(500)
    return [BlogPost(**r) for r in rows]


@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog(slug: str):
    row = await db.blog_posts.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Post not found")
    return BlogPost(**row)


@api_router.get("/admin/blog", response_model=List[BlogPost])
async def admin_list_blog(_: str = Depends(require_admin)):
    rows = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [BlogPost(**r) for r in rows]


@api_router.post("/admin/blog", response_model=BlogPost)
async def admin_create_blog(body: BlogCreate, _: str = Depends(require_admin)):
    existing = await db.blog_posts.find_one({"slug": body.slug}, {"_id": 0})
    if existing:
        raise HTTPException(400, "A post with this slug already exists")
    post = BlogPost(**body.model_dump())
    if post.is_published and not post.published_at:
        post.published_at = datetime.now(timezone.utc).isoformat()
    await db.blog_posts.insert_one(post.model_dump())
    return post


@api_router.put("/admin/blog/{pid}", response_model=BlogPost)
async def admin_update_blog(pid: str, body: BlogUpdate, _: str = Depends(require_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    current = await db.blog_posts.find_one({"id": pid}, {"_id": 0})
    if not current:
        raise HTTPException(404, "Post not found")
    if updates.get("is_published") and not current.get("published_at"):
        updates["published_at"] = datetime.now(timezone.utc).isoformat()
    if updates:
        await db.blog_posts.update_one({"id": pid}, {"$set": updates})
    row = await db.blog_posts.find_one({"id": pid}, {"_id": 0})
    return BlogPost(**row)


@api_router.delete("/admin/blog/{pid}")
async def admin_delete_blog(pid: str, _: str = Depends(require_admin)):
    r = await db.blog_posts.delete_one({"id": pid})
    if r.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    return {"ok": True}


# ---------- Routes: Testimonials ----------
@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    rows = (
        await db.testimonials.find({"is_published": True}, {"_id": 0})
        .sort("sort_order", 1)
        .to_list(500)
    )
    return [Testimonial(**r) for r in rows]


@api_router.get("/admin/testimonials", response_model=List[Testimonial])
async def admin_list_testimonials(_: str = Depends(require_admin)):
    rows = await db.testimonials.find({}, {"_id": 0}).sort("sort_order", 1).to_list(1000)
    return [Testimonial(**r) for r in rows]


@api_router.post("/admin/testimonials", response_model=Testimonial)
async def admin_create_testimonial(body: TestimonialCreate, _: str = Depends(require_admin)):
    t = Testimonial(**body.model_dump())
    await db.testimonials.insert_one(t.model_dump())
    return t


@api_router.put("/admin/testimonials/{tid}", response_model=Testimonial)
async def admin_update_testimonial(tid: str, body: TestimonialUpdate, _: str = Depends(require_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.testimonials.update_one({"id": tid}, {"$set": updates})
    row = await db.testimonials.find_one({"id": tid}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Testimonial not found")
    return Testimonial(**row)


@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _: str = Depends(require_admin)):
    r = await db.testimonials.delete_one({"id": tid})
    if r.deleted_count == 0:
        raise HTTPException(404, "Testimonial not found")
    return {"ok": True}


# ---------- Routes: Image uploads (admin) + public file serving ----------
@api_router.post("/admin/uploads/image")
async def admin_upload_image(file: UploadFile = File(...), _: str = Depends(require_admin)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")
    ext = (file.filename or "img").split(".")[-1].lower()
    path = f"{APP_NAME}/uploads/images/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 8 MB)")
    put_object(path, data, file.content_type)
    await db.uploaded_files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": path,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": len(data),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": path, "url": f"/api/uploads/{path}"}


@api_router.get("/uploads/{file_path:path}")
async def serve_upload(file_path: str):
    record = await db.uploaded_files.find_one({"storage_path": file_path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(404, "File not found")
    data, ctype = get_object(file_path)
    return Response(content=data, media_type=record.get("content_type", ctype), headers={"Cache-Control": "public, max-age=86400"})


# ---------- SEO: Sitemap ----------
@api_router.get("/sitemap.xml")
async def sitemap(request: Request):
    # Build absolute URLs honoring proxy headers; force https for SEO
    proto = request.headers.get("x-forwarded-proto", "https").split(",")[0].strip() or "https"
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.hostname
    base = f"{proto}://{host}"
    static_paths = ["/", "/about", "/services", "/shop", "/blog", "/booking", "/contact"]
    posts = await db.blog_posts.find({"is_published": True}, {"_id": 0, "slug": 1, "published_at": 1}).to_list(1000)
    products = await db.products.find({"is_published": True}, {"_id": 0, "id": 1, "created_at": 1}).to_list(1000)

    urls = []
    today = datetime.now(timezone.utc).date().isoformat()
    for p in static_paths:
        urls.append(f"<url><loc>{base}{p}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq></url>")
    for post in posts:
        lm = (post.get("published_at") or today).split("T")[0]
        urls.append(f"<url><loc>{base}/blog/{post['slug']}</loc><lastmod>{lm}</lastmod><changefreq>monthly</changefreq></url>")
    for prod in products:
        lm = (prod.get("created_at") or today).split("T")[0]
        urls.append(f"<url><loc>{base}/shop/{prod['id']}</loc><lastmod>{lm}</lastmod><changefreq>monthly</changefreq></url>")

    body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>"
    return Response(content=body, media_type="application/xml")


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

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        demo_t = [
            {
                "quote": "Within three months of starting with The Blooming Branch Team, our daughter went from one-word answers to full sentences. They didn't just teach her to talk — they taught us how to listen.",
                "name": "Lauren M.",
                "role": "Parent of a 4-year-old",
                "rating": 5,
                "sort_order": 1,
            },
            {
                "quote": "As a special-ed teacher, I rely on their downloads weekly. They're the only therapy materials I've found that respect both the research and the kid in front of me.",
                "name": "Daniel R.",
                "role": "Special education teacher",
                "rating": 5,
                "sort_order": 2,
            },
            {
                "quote": "I'm 72, in independent living, and I thought I was past learning new things. Their executive functioning program gave me my mornings back.",
                "name": "Margaret S.",
                "role": "Adult client, age 72",
                "rating": 5,
                "sort_order": 3,
            },
        ]
        for d in demo_t:
            t = Testimonial(**d)
            await db.testimonials.insert_one(t.model_dump())
        logger.info(f"Seeded {len(demo_t)} testimonials")

    # Seed blog
    if await db.blog_posts.count_documents({}) == 0:
        now_iso = datetime.now(timezone.utc).isoformat()
        demo_b = [
            {
                "title": "Five Gentle Ways to Build Speech at the Kitchen Table",
                "slug": "five-gentle-ways-kitchen-table",
                "excerpt": "Real-life moments are the most powerful therapy. Here are five quiet rituals that turn dinner into a language-rich classroom — without anyone noticing.",
                "content": "Mealtimes are sacred ground for speech development. The repetition, the predictability, and the shared attention create the perfect conditions for language to flourish.\n\n**1. Narrate the obvious.** \"You're choosing the green spoon. The green spoon is cold.\" Your child hears words bound to real things in real time.\n\n**2. Pause before passing.** When your toddler reaches for the bread, count to five before handing it over. Give them space to ask, gesture, or even point.\n\n**3. Offer a forced choice.** \"Banana or strawberry?\" is far easier than \"What do you want?\" — and it builds a sense of agency.\n\n**4. Sing the boring bits.** Singing slows speech down and stretches sounds. Even \"please pass the salt\" can become a small song.\n\n**5. End with a recap.** Before clearing the table, ask \"What did we eat tonight?\" Recap activates memory and gives your child a chance to use their new words again.\n\nThese five moves aren't fancy. They're not even therapy, technically. They're just attention — slow, focused, loving attention. And that, in the end, is what makes language grow.",
                "cover_image": "https://images.unsplash.com/photo-1764267703828-843753961a1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBhbmQlMjBjaGlsZCUyMGxlYXJuaW5nJTIwdG9nZXRoZXIlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzc2OTI0NTYyfDA&ixlib=rb-4.1.0&q=85",
                "is_published": True,
                "published_at": now_iso,
            },
            {
                "title": "Executive Functioning Isn't Just for Kids",
                "slug": "executive-functioning-isnt-just-for-kids",
                "excerpt": "From college freshmen to retirees in independent living, executive functioning skills shape how we move through life. Here's why we work with adults, too.",
                "content": "When most people hear \"executive functioning,\" they picture a frazzled middle-schooler with a lost worksheet. But the same skills that help an eleven-year-old finish their homework — planning, working memory, task initiation, emotional regulation — are the skills that help a 72-year-old adapt to retirement, or a 45-year-old navigate a career change.\n\nWe believe these skills are not fixed. They're rehearsable. With the right scaffolding, the right rhythm, and a respectful, evidence-based program, an adult of any age can rebuild structure, confidence, and a sense of forward motion.\n\nOur adult program runs for 8 weeks, includes weekly one-on-one sessions, and is adapted entirely to where you live and what your week looks like. We've worked with executives, retirees, college students, and residents of nursing homes. The scaffolding looks different — the work is the same.\n\nIf you're curious, our free 15-minute consult is the place to start. No pressure. Just conversation.",
                "cover_image": "https://images.pexels.com/photos/8872203/pexels-photo-8872203.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "is_published": True,
                "published_at": now_iso,
            },
            {
                "title": "What Parent Coaching Actually Looks Like",
                "slug": "what-parent-coaching-actually-looks-like",
                "excerpt": "Parent coaching is not advice-giving. It's practice — together, in real moments, with a clinician beside you. Here's what to expect.",
                "content": "When parents hear \"coaching,\" they often picture being lectured at, handed a worksheet, and sent home. That is not what we do.\n\nIn a typical session, we sit on the floor with your child while you sit nearby. We model. You try. We give a word, a gesture, a one-second pause. You try again. By the end of the session, you'll have moved a strategy from your head into your hands — which is the only place strategies actually live.\n\nWe coach one parent at a time, in the home or virtually, in 50-minute sessions. Most families schedule weekly for 8 to 12 weeks. By the end, the routines are running themselves — and the kids are thriving alongside you.",
                "cover_image": "https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "is_published": True,
                "published_at": now_iso,
            },
        ]
        for d in demo_b:
            p = BlogPost(**d)
            await db.blog_posts.insert_one(p.model_dump())
        logger.info(f"Seeded {len(demo_b)} blog posts")


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
