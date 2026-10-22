import os
from functools import wraps

from flask import Blueprint, jsonify, request, session, current_app
from supabase import create_client
from services.supabase_client import supabase

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not session.get("admin_user_id"):
            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401

        return func(*args, **kwargs)

    return wrapper

@admin_bp.get("/settings/bio")
@admin_required
def get_bio():
    try:
        result = (
            supabase.table("bio_descriptions")
            .select("id, content")
            .eq("id", 1)
            .limit(1)
            .execute()
        )

        rows = result.data or []
        content = rows[0].get("content", "") if rows else ""

        return jsonify({
            "success": True,
            "content": content
        }), 200

    except Exception:
        current_app.logger.exception("Failed to load bio")
        return jsonify({
            "success": False,
            "message": "Unable to load bio."
        }), 500


@admin_bp.put("/settings/bio")
@admin_required
def save_bio():
    data = request.get_json(silent=True) or {}
    content = data.get("content")

    if not isinstance(content, str):
        return jsonify({
            "success": False,
            "message": "Bio must be text."
        }), 400

    content = content.strip()

    if not content:
        return jsonify({
            "success": False,
            "message": "Please enter your bio."
        }), 400

    if len(content) > 3000:
        return jsonify({
            "success": False,
            "message": "Bio must be 3000 characters or fewer."
        }), 400

    try:
        supabase.table("bio_descriptions").upsert({
            "id": 1,
            "content": content
        }).execute()

        return jsonify({
            "success": True,
            "message": "Bio saved successfully."
        }), 200

    except Exception:
        current_app.logger.exception("Failed to save bio")
        return jsonify({
            "success": False,
            "message": "Unable to save bio."
        }), 500



@admin_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
supabase_url = os.getenv("SUPABASE_URL")

# Prefer the publishable key; support legacy environment-variable names.
supabase_key = (
os.getenv("SUPABASE_PUBLISHABLE_KEY")
 or os.getenv("SUPABASE_ANON_KEY")
 or os.getenv("SUPABASE_KEY")
)

if not admin_email or not supabase_url or not supabase_key:
    return jsonify({
        "success": False,
        "message": "Authentication is not configured"
}), 500

    try:
        auth_client = create_client(supabase_url, supabase_key)

        result = auth_client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        user = result.user

        if not user or not user.email:
            return jsonify({
                "success": False,
                "message": "Invalid credentials"
            }), 401

        if user.email.lower() != admin_email:
            return jsonify({
                "success": False,
                "message": "This account is not authorized as admin"
            }), 403

        session.clear()
        session["admin_user_id"] = str(user.id)
        session["admin_email"] = user.email

        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {"email": user.email}
        }), 200

    except Exception:
        # Keep provider errors and sensitive details in server logs only.
        import logging
        logging.exception("Admin login failed")

        return jsonify({
            "success": False,
            "message": "Login failed. Check credentials and server logs."
        }), 401


@admin_bp.get("/me")
@admin_required
def current_admin():
    return jsonify({
        "success": True,
        "admin": {
            "email": session.get("admin_email")
        }
    }), 200


@admin_bp.post("/logout")
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200
