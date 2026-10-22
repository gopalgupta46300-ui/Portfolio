import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Load local environment variables before importing project modules.
load_dotenv()

from public import public_bp
from admin import admin_bp

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")

if not app.config["SECRET_KEY"]:
    raise RuntimeError("FLASK_SECRET_KEY is missing")

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,
)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://portfolio-frontend-git-main-team-vibe5.vercel.app",
                "https://portfolio-frontend-jet-kappa.vercel.app",
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
    supports_credentials=True,
)

app.register_blueprint(public_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(debug=False)
