import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
PUBLIC_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
ADMIN_KEY = os.getenv("SUPABASE_SECRET_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing")

if not PUBLIC_KEY:
    raise RuntimeError("SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_KEY is missing")

public_supabase = create_client(SUPABASE_URL, PUBLIC_KEY)
admin_supabase = create_client(SUPABASE_URL, ADMIN_KEY) if ADMIN_KEY else None

# NOTE: RLS policies must allow public SELECT access to the published projects table,
# and public SELECT access to bio_descriptions for the portfolio landing page.
