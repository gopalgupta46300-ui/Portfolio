import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Load local environment variables before importing project modules.
load_dotenv()

from public import public_bp
from admin import admin_bp

app = Flask(__name__)

# Prefer the explicit Flask secret, but fall back to a local dev value so
# the app can still boot in non-production environments.
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY") or os.getenv("SECRET_KEY") or "portfolio-dev-secret-key"

# Session cookies must be secure over HTTPS in production, but they must not be
# forced to Secure on localhost (where the browser runs over plain HTTP).
# The app can also override this explicitly through environment variables.
use_secure_cookies = os.getenv("SESSION_COOKIE_SECURE", "false").strip().lower() in {"1", "true", "yes", "on"}
if not use_secure_cookies:
    # Local dev usually runs on http://localhost or http://127.0.0.1, where Secure cookies are rejected.
    use_secure_cookies = False

same_site = os.getenv("SESSION_COOKIE_SAMESITE", "Lax" if not use_secure_cookies else "None").strip()

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE=same_site,
    SESSION_COOKIE_SECURE=use_secure_cookies,
)

allowed_origins = [
    "https://portfolio-frontend-git-main-team-vibe5.vercel.app",
    "https://portfolio-frontend-jet-kappa.vercel.app",
    "https://unique-gopalgupta.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
    supports_credentials=True,
)

app.register_blueprint(public_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=False)
