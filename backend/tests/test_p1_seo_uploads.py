"""P1 batch 2: SEO sitemap + image uploads + robots.txt + uploaded file serving."""
import os
import io
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "bloom2026"

# Minimal valid 1x1 PNG bytes
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    return s


@pytest.fixture(scope="module")
def auth_headers(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------- Sitemap ----------
class TestSitemap:
    def test_sitemap_returns_xml(self, api):
        r = api.get(f"{BASE_URL}/api/sitemap.xml")
        assert r.status_code == 200
        assert "xml" in (r.headers.get("Content-Type") or "")
        body = r.text
        assert body.startswith('<?xml')
        assert "<urlset" in body and "</urlset>" in body

    def test_sitemap_has_main_pages(self, api):
        body = api.get(f"{BASE_URL}/api/sitemap.xml").text
        for path in ["/", "/about", "/services", "/shop", "/blog", "/booking", "/contact"]:
            assert f"<loc>https://" in body  # https forced
            # the path should appear as an absolute URL ending with that path
            assert (path == "/" and "/<" in body) or (path != "/" and path + "<" in body), f"missing {path}"

    def test_sitemap_includes_blog_slugs(self, api):
        body = api.get(f"{BASE_URL}/api/sitemap.xml").text
        # Seeded blog post known from previous tests
        assert "/blog/five-gentle-ways-kitchen-table" in body

    def test_sitemap_includes_products(self, api):
        body = api.get(f"{BASE_URL}/api/sitemap.xml").text
        prods = api.get(f"{BASE_URL}/api/products").json()
        assert len(prods) > 0
        # at least one product id must appear in shop/<id>
        assert any(f"/shop/{p['id']}" in body for p in prods)

    def test_sitemap_uses_https_and_host(self, api):
        # Send forwarded headers — backend should honor them
        r = api.get(f"{BASE_URL}/api/sitemap.xml", headers={
            "x-forwarded-proto": "https",
        })
        assert r.status_code == 200
        # Body should use https scheme
        assert "<loc>https://" in r.text
        # Should NOT contain raw internal hostnames like 'localhost' or '0.0.0.0'
        assert "localhost" not in r.text
        assert "0.0.0.0" not in r.text


# ---------- Image upload ----------
class TestImageUpload:
    uploaded_path = None
    uploaded_url = None

    def test_upload_requires_auth(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/uploads/image",
            files={"file": ("a.png", io.BytesIO(PNG_1x1), "image/png")},
        )
        assert r.status_code == 401

    def test_upload_rejects_non_image(self, api, auth_headers):
        r = api.post(
            f"{BASE_URL}/api/admin/uploads/image",
            headers=auth_headers,
            files={"file": ("note.txt", io.BytesIO(b"hello"), "text/plain")},
        )
        assert r.status_code == 400

    def test_upload_rejects_oversize(self, api, auth_headers):
        # 9 MB content-type image/png
        big = b"\x89PNG\r\n\x1a\n" + b"0" * (9 * 1024 * 1024)
        r = api.post(
            f"{BASE_URL}/api/admin/uploads/image",
            headers=auth_headers,
            files={"file": ("big.png", io.BytesIO(big), "image/png")},
        )
        assert r.status_code == 400

    def test_upload_success_returns_path_and_url(self, api, auth_headers):
        r = api.post(
            f"{BASE_URL}/api/admin/uploads/image",
            headers=auth_headers,
            files={"file": ("tiny.png", io.BytesIO(PNG_1x1), "image/png")},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "path" in d and "url" in d
        assert d["url"].startswith("/api/uploads/")
        assert d["path"].endswith(".png")
        TestImageUpload.uploaded_path = d["path"]
        TestImageUpload.uploaded_url = d["url"]


# ---------- Serve uploaded file ----------
class TestServeUpload:
    def test_serve_uploaded_image_ok(self, api):
        path = TestImageUpload.uploaded_path
        assert path, "Upload test must run first"
        r = api.get(f"{BASE_URL}/api/uploads/{path}")
        assert r.status_code == 200
        assert (r.headers.get("Content-Type") or "").startswith("image/")
        assert "Cache-Control" in r.headers
        # Returned bytes should equal the uploaded PNG bytes
        assert r.content == PNG_1x1

    def test_serve_unknown_path_404(self, api):
        r = api.get(f"{BASE_URL}/api/uploads/blooming-branch/uploads/images/does-not-exist.png")
        assert r.status_code == 404


# ---------- robots.txt (frontend public) ----------
class TestRobots:
    def test_robots_served(self, api):
        # robots.txt is served from the frontend root, not under /api
        # REACT_APP_BACKEND_URL is the public host -> ingress routes / to frontend
        r = api.get(f"{BASE_URL}/robots.txt")
        assert r.status_code == 200, r.text
        body = r.text
        assert "Disallow: /admin" in body
        assert "Sitemap: /api/sitemap.xml" in body
