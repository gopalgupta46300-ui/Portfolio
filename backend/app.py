import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

from public import public_bp
from admin import admin_bp, limiter

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY") or os.getenv("SECRET_KEY")

is_vercel = os.getenv("VERCEL") == "1" or os.getenv("VERCEL_ENV") == "production"

if is_vercel and not app.config["SECRET_KEY"]:
    raise RuntimeError("FLASK_SECRET_KEY or SECRET_KEY must be set when running on Vercel.")

if not app.config["SECRET_KEY"]:
    app.config["SECRET_KEY"] = "portfolio-dev-secret-key"

if is_vercel:
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=True,
    )
else:
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=False,
    )

base_allowed_origins = [
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
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True,
        }
    },
    supports_credentials=True,
)

limiter.init_app(app)

@app.get("/")
def health_check():
    return jsonify({"success": True, "message": "API running"}), 200

app.register_blueprint(public_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=False)
