import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = (
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_KEY")
)
SUPABASE_SECRET_ROLE_KEY = os.getenv("SUPABASE_SECRET_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing")

if not SUPABASE_PUBLISHABLE_KEY:
    raise RuntimeError("SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_KEY is missing")

if not SUPABASE_SECRET_ROLE_KEY:
    raise RuntimeError("SUPABASE_SECRET_ROLE_KEY is missing")

supabase_public = create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SECRET_ROLE_KEY)

# NOTE: RLS policies must allow public SELECT access to the published projects table,
# and public SELECT access to bio_descriptions for the portfolio landing page.
