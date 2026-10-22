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

# Local development runs over http://localhost, so Secure cookies must stay off there.
# Vercel/HTTPS deployments require Secure cookies and SameSite=None for cross-site
# credentialed requests from the frontend domain.
is_vercel = os.getenv("VERCEL") == "1" or os.getenv("VERCEL_ENV") == "production"

if is_vercel:
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True,
    )
else:
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=False,
    )

base_allowed_origins = [
    "https://portfolio-team-vibe5.vercel.app",
    "https://portfolio-frontend-git-main-team-vibe5.vercel.app",
    "https://portfolio-frontend-jet-kappa.vercel.app",
    "https://unique-gopalgupta.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
]

env_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip()
    for origin in env_allowed_origins.split(",")
    if origin.strip()
]

for origin in base_allowed_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

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
