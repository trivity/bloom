"""Backend API tests for The Blooming Branch Team."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://grow-speak-bloom.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "bloom2026"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        data = r.json()
        assert data["username"] == ADMIN_USER
        assert isinstance(data["token"], str) and len(data["token"]) > 20

    def test_login_bad_credentials(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"username": "admin", "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["username"] == ADMIN_USER


# ---------- Products (public) ----------
class TestProducts:
    def test_list_products_seeded(self, api):
        r = api.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 4, f"Expected >=4 seeded products, got {len(items)}"
        for p in items:
            assert "id" in p and "name" in p and "price" in p
            assert p.get("is_published") is True

    def test_get_product_by_id(self, api):
        items = api.get(f"{BASE_URL}/api/products").json()
        pid = items[0]["id"]
        r = api.get(f"{BASE_URL}/api/products/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_get_product_404(self, api):
        r = api.get(f"{BASE_URL}/api/products/does-not-exist")
        assert r.status_code == 404


# ---------- Admin Products ----------
class TestAdminProducts:
    def test_admin_list_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/products")
        assert r.status_code == 401

    def test_admin_list_with_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_update_delete_flow(self, api, auth_headers):
        payload = {
            "name": "TEST_Pytest Product",
            "description": "Temporary pytest product",
            "price": 9.99,
            "category": "Digital Download",
            "image_url": "https://example.com/x.jpg",
            "is_published": True,
        }
        # CREATE
        r = api.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == payload["name"]
        assert created["price"] == payload["price"]
        pid = created["id"]

        # GET verify persisted
        g = api.get(f"{BASE_URL}/api/products/{pid}")
        assert g.status_code == 200
        assert g.json()["name"] == payload["name"]

        # UPDATE
        u = api.put(
            f"{BASE_URL}/api/admin/products/{pid}",
            json={"name": "TEST_Updated", "price": 11.5},
            headers=auth_headers,
        )
        assert u.status_code == 200
        assert u.json()["name"] == "TEST_Updated"
        assert u.json()["price"] == 11.5

        # Verify persisted
        g2 = api.get(f"{BASE_URL}/api/products/{pid}")
        assert g2.json()["name"] == "TEST_Updated"

        # DELETE
        d = api.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
        assert d.status_code == 200
        assert d.json().get("ok") is True

        # Verify deleted
        g3 = api.get(f"{BASE_URL}/api/products/{pid}")
        assert g3.status_code == 404


# ---------- Contact ----------
class TestContact:
    def test_create_contact(self, api):
        r = api.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Jane",
            "email": "test_jane@example.com",
            "phone": "555-0100",
            "subject": "Inquiry",
            "message": "Hello from pytest",
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST_Jane"
        assert data["email"] == "test_jane@example.com"
        assert "id" in data and "created_at" in data

    def test_admin_list_contacts_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/contacts")
        assert r.status_code == 401

    def test_admin_list_contacts(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/contacts", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(c.get("email") == "test_jane@example.com" for c in items)


# ---------- Booking ----------
class TestBooking:
    def test_create_booking(self, api):
        r = api.post(f"{BASE_URL}/api/booking", json={
            "name": "TEST_Booker",
            "email": "test_booker@example.com",
            "phone": "555-0200",
            "service": "Speech Therapy",
            "preferred_date": "2026-02-01",
            "preferred_time": "10:00",
            "notes": "pytest booking",
        })
        assert r.status_code == 200, r.text
        assert r.json()["service"] == "Speech Therapy"

    def test_admin_list_bookings_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 401

    def test_admin_list_bookings(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/bookings", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert any(b.get("email") == "test_booker@example.com" for b in items)


# ---------- Stripe Checkout ----------
class TestCheckout:
    def test_create_checkout_session(self, api):
        products = api.get(f"{BASE_URL}/api/products").json()
        pid = products[0]["id"]
        r = api.post(f"{BASE_URL}/api/checkout/session", json={
            "product_id": pid,
            "email": "buyer@example.com",
            "origin_url": BASE_URL,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("https://")
        assert "session_id" in data
        # Stash for next test
        TestCheckout.session_id = data["session_id"]

    def test_checkout_status_initiated(self, api):
        sid = getattr(TestCheckout, "session_id", None)
        assert sid, "session_id missing from prior test"
        r = api.get(f"{BASE_URL}/api/checkout/status/{sid}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["payment_status"] in ("unpaid", "paid")
        assert "status" in data

    def test_checkout_status_unknown_session(self, api):
        r = api.get(f"{BASE_URL}/api/checkout/status/cs_does_not_exist")
        assert r.status_code == 404

    def test_checkout_invalid_product(self, api):
        r = api.post(f"{BASE_URL}/api/checkout/session", json={
            "product_id": "nope",
            "email": "x@y.com",
            "origin_url": BASE_URL,
        })
        assert r.status_code == 404
