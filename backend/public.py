from flask import Blueprint, current_app, jsonify

from services.supabase_client import supabase_public

public_bp = Blueprint("public", __name__, url_prefix="/api")


@public_bp.get("/bio")
def get_public_bio():
    try:
        result = (
            supabase_public.table("bio_descriptions")
            .select("content")
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
        current_app.logger.exception("Failed to load public bio")
        return jsonify({
            "success": False,
            "message": "Unable to load bio."
        }), 500


@public_bp.get("/projects")
def get_projects():
    try:
        response = (
            supabase_public.table("projects")
            .select("id, title, description, tech_stack, demo_url, github_url, created_at")
            .eq("published", True)
            .order("created_at", desc=True)
            .execute()
        )

        return jsonify({
            "success": True,
            "count": len(response.data),
            "data": response.data
        }), 200

    except Exception:
        current_app.logger.exception("Failed to fetch public projects")
        return jsonify({
            "success": False,
            "message": "Unable to fetch projects"
        }), 500
