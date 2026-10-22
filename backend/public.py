from flask import Blueprint, jsonify, current_app
from services.supabase_client import supabase

public_bp = Blueprint("public", __name__, url_prefix="/api")


@public_bp.get("/bio")
def get_public_bio():
    try:
        result = (
            supabase.table("bio_descriptions")
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


#  --------------------------  projects -----------------
@public_bp.get("/projects")
def get_projects():
    try:
        response = (
            supabase.table("projects")
            .select("*")
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
        import traceback
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Unable to fetch projects"
        }), 500
