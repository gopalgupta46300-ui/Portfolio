import os
from functools import wraps

from flask import Blueprint, current_app, jsonify, request, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from supabase import create_client

from services.supabase_client import supabase_admin

limiter = Limiter(key_func=get_remote_address)
admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def require_admin_header(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if request.headers.get("X-Requested-With") != "portfolio-admin":
            return jsonify({
                "success": False,
                "message": "Invalid request origin."
            }), 403

        return func(*args, **kwargs)

    return wrapper


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
            supabase_admin.table("bio_descriptions")
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
@require_admin_header
def save_bio():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON object is required."
        }), 400

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
        supabase_admin.table("bio_descriptions").upsert({
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
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON object is required."
        }), 400

    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({
            "success": False,
            "message": "Email and password must be text."
        }), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = (
        os.getenv("SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
        or os.getenv("SUPABASE_KEY")
    )

    if not admin_email or not supabase_url or not supabase_key:
        current_app.logger.error("Admin authentication environment variables are missing.")
        return jsonify({
            "success": False,
            "message": "Authentication is not configured."
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
                "message": "Invalid credentials."
            }), 401

        if user.email.lower() != admin_email:
            return jsonify({
                "success": False,
                "message": "This account is not authorized as admin."
            }), 403

        session.clear()
        session["admin_user_id"] = str(user.id)
        session["admin_email"] = user.email

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "admin": {
                "email": user.email
            }
        }), 200

    except Exception:
        current_app.logger.exception("Admin login failed")
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
@admin_required
@require_admin_header
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200


def _normalize_project_payload(data):
    if not isinstance(data, dict):
        return None, "A JSON object is required."

    title = data.get("title")
    description = data.get("description")
    tech_stack = data.get("tech_stack")
    demo_url = data.get("demo_url")
    github_url = data.get("github_url")
    published = data.get("published", False)

    if not isinstance(title, str) or not title.strip():
        return None, "Project title is required."

    if not isinstance(description, str) or not description.strip():
        return None, "Project description is required."

    if isinstance(tech_stack, str):
        tech_stack = [item.strip() for item in tech_stack.split(",") if item.strip()]
    elif tech_stack is None:
        tech_stack = []
    elif not isinstance(tech_stack, list):
        return None, "Project technology stack must be a list or comma-separated string."

    if demo_url is not None and not isinstance(demo_url, str):
        return None, "Demo URL must be a string or null."

    if github_url is not None and not isinstance(github_url, str):
        return None, "GitHub URL must be a string or null."

    if not isinstance(published, bool):
        return None, "Published must be a boolean."

    payload = {
        "title": title.strip(),
        "description": description.strip(),
        "tech_stack": tech_stack,
        "demo_url": demo_url.strip() if demo_url else None,
        "github_url": github_url.strip() if github_url else None,
        "published": published,
    }

    return payload, None


@admin_bp.post("/projects")
@admin_required
@require_admin_header
def create_project():
    payload, error = _normalize_project_payload(request.get_json(silent=True))

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    try:
        result = supabase_admin.table("projects").insert(payload).execute()
        return jsonify({
            "success": True,
            "message": "Project created successfully.",
            "project": result.data[0] if result.data else payload
        }), 201
    except Exception:
        current_app.logger.exception("Failed to create project")
        return jsonify({
            "success": False,
            "message": "Unable to create project."
        }), 500


@admin_bp.put("/projects/<project_id>")
@admin_required
@require_admin_header
def update_project(project_id):
    payload, error = _normalize_project_payload(request.get_json(silent=True))

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    try:
        result = supabase_admin.table("projects").update(payload).eq("id", project_id).execute()
        return jsonify({
            "success": True,
            "message": "Project updated successfully.",
            "project": result.data[0] if result.data else payload
        }), 200
    except Exception:
        current_app.logger.exception("Failed to update project")
        return jsonify({
            "success": False,
            "message": "Unable to update project."
        }), 500


@admin_bp.delete("/projects/<project_id>")
@admin_required
@require_admin_header
def delete_project(project_id):
    try:
        supabase_admin.table("projects").delete().eq("id", project_id).execute()
        return jsonify({
            "success": True,
            "message": "Project deleted successfully."
        }), 200
    except Exception:
        current_app.logger.exception("Failed to delete project")
        return jsonify({
            "success": False,
            "message": "Unable to delete project."
        }), 500
