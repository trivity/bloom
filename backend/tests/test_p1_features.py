"""Tests for P1 features: orders/reissue, blog, testimonials."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "bloom2026"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_headers(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------- Blog (public) ----------
class TestBlogPublic:
    def test_list_blog_seeded(self, api):
        r = api.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 3
        for p in items:
            assert p["is_published"] is True
            assert "slug" in p and "title" in p

    def test_get_blog_by_slug(self, api):
        r = api.get(f"{BASE_URL}/api/blog/five-gentle-ways-kitchen-table")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "five-gentle-ways-kitchen-table"
        assert "Mealtimes" in d["content"]

    def test_get_blog_404(self, api):
        r = api.get(f"{BASE_URL}/api/blog/nonexistent-slug-xyz")
        assert r.status_code == 404


# ---------- Blog (admin) ----------
class TestBlogAdmin:
    created_id = None
    slug = f"test-pytest-{uuid.uuid4().hex[:8]}"

    def test_admin_list_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/blog")
        assert r.status_code == 401

    def test_admin_list_with_token(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/blog", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_blog(self, api, auth_headers):
        payload = {
            "title": "TEST Pytest Post",
            "slug": TestBlogAdmin.slug,
            "excerpt": "Pytest excerpt",
            "content": "Pytest content **bold**.",
            "is_published": True,
        }
        r = api.post(f"{BASE_URL}/api/admin/blog", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["slug"] == TestBlogAdmin.slug
        assert d["published_at"] is not None
        TestBlogAdmin.created_id = d["id"]

    def test_create_duplicate_slug(self, api, auth_headers):
        payload = {
            "title": "Dup",
            "slug": TestBlogAdmin.slug,
            "excerpt": "x",
            "content": "x",
        }
        r = api.post(f"{BASE_URL}/api/admin/blog", json=payload, headers=auth_headers)
        assert r.status_code == 400

    def test_update_blog(self, api, auth_headers):
        pid = TestBlogAdmin.created_id
        r = api.put(f"{BASE_URL}/api/admin/blog/{pid}", json={"title": "TEST Updated Title"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST Updated Title"
        # verify persisted via public endpoint
        g = api.get(f"{BASE_URL}/api/blog/{TestBlogAdmin.slug}")
        assert g.status_code == 200
        assert g.json()["title"] == "TEST Updated Title"

    def test_delete_blog(self, api, auth_headers):
        pid = TestBlogAdmin.created_id
        r = api.delete(f"{BASE_URL}/api/admin/blog/{pid}", headers=auth_headers)
        assert r.status_code == 200
        # verify gone
        g = api.get(f"{BASE_URL}/api/blog/{TestBlogAdmin.slug}")
        assert g.status_code == 404


# ---------- Testimonials ----------
class TestTestimonials:
    created_id = None

    def test_public_list(self, api):
        r = api.get(f"{BASE_URL}/api/testimonials")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 3
        # sorted asc by sort_order
        orders = [t.get("sort_order", 0) for t in items]
        assert orders == sorted(orders)
        for t in items:
            assert t["is_published"] is True

    def test_admin_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/testimonials")
        assert r.status_code == 401

    def test_admin_create(self, api, auth_headers):
        payload = {
            "quote": "TEST quote pytest",
            "name": "TEST_Tester",
            "role": "QA",
            "rating": 5,
            "sort_order": 99,
            "is_published": True,
        }
        r = api.post(f"{BASE_URL}/api/admin/testimonials", json=payload, headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "TEST_Tester"
        TestTestimonials.created_id = d["id"]

    def test_admin_update(self, api, auth_headers):
        tid = TestTestimonials.created_id
        r = api.put(f"{BASE_URL}/api/admin/testimonials/{tid}", json={"role": "Updated Role"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["role"] == "Updated Role"

    def test_admin_delete(self, api, auth_headers):
        tid = TestTestimonials.created_id
        r = api.delete(f"{BASE_URL}/api/admin/testimonials/{tid}", headers=auth_headers)
        assert r.status_code == 200


# ---------- Orders / Reissue ----------
class TestOrders:
    def test_admin_orders_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/orders")
        assert r.status_code == 401

    def test_admin_orders_list(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers)
        assert r.status_code == 200
        orders = r.json()
        assert isinstance(orders, list)
        # Schema check
        for o in orders:
            for k in ("id", "session_id", "product_id", "product_name", "amount",
                      "currency", "email", "status", "payment_status"):
                assert k in o

    def test_reissue_unknown_order(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/admin/orders/does-not-exist/reissue", headers=auth_headers)
        assert r.status_code == 404

    def test_reissue_unpaid_returns_400(self, api, auth_headers):
        # Find an unpaid order or create one via /checkout/session
        orders = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers).json()
        unpaid = next((o for o in orders if o.get("payment_status") != "paid"), None)
        if not unpaid:
            products = api.get(f"{BASE_URL}/api/products").json()
            api.post(f"{BASE_URL}/api/checkout/session", json={
                "product_id": products[0]["id"], "email": "unpaid@test.com", "origin_url": BASE_URL,
            })
            orders = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers).json()
            unpaid = next((o for o in orders if o.get("payment_status") != "paid"), None)
        assert unpaid, "No unpaid order found to test 400 path"
        r = api.post(f"{BASE_URL}/api/admin/orders/{unpaid['id']}/reissue", headers=auth_headers)
        assert r.status_code == 400

    def test_reissue_paid_mints_token(self, api, auth_headers):
        orders = api.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers).json()
        paid = next((o for o in orders if o.get("payment_status") == "paid"), None)
        if not paid:
            pytest.skip("No paid order present in DB to test reissue success path")
        old_token = paid.get("download_token")
        r = api.post(f"{BASE_URL}/api/admin/orders/{paid['id']}/reissue", headers=auth_headers)
        assert r.status_code == 200, r.text
        new_token = r.json()["download_token"]
        assert new_token and new_token != old_token


# ---------- Stripe checkout status (re-verify fix) ----------
class TestCheckoutStatusFallback:
    def test_status_returns_200_for_initiated(self, api):
        products = api.get(f"{BASE_URL}/api/products").json()
        c = api.post(f"{BASE_URL}/api/checkout/session", json={
            "product_id": products[0]["id"], "email": "fallback@test.com", "origin_url": BASE_URL,
        })
        assert c.status_code == 200
        sid = c.json()["session_id"]
        r = api.get(f"{BASE_URL}/api/checkout/status/{sid}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["payment_status"] in ("unpaid", "paid")
        assert "status" in d
