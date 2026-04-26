"""
AUREUM CRM — Claude AI + Selenium Routes
Adds /api/ai/* endpoints to the main FastAPI app
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'), override=True)

router = APIRouter(prefix="/api/ai", tags=["AI"])

# ── Claude client (lazy init so missing key doesn't crash server) ──────────

def get_claude():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "your-new-key-here":
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not configured. Add it to .env"
        )
    try:
        import anthropic
        return anthropic.Anthropic(api_key=api_key)
    except ImportError:
        raise HTTPException(status_code=503, detail="anthropic package not installed")


# ── Schemas ────────────────────────────────────────────────────────────────

class LeadScoreRequest(BaseModel):
    name: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    city: str
    source: Optional[str] = None
    notes: Optional[str] = None

class EmailDraftRequest(BaseModel):
    template: str          # cold_intro | post_viewing | negotiation | hnw
    lead_name: str
    lead_city: str
    property_name: Optional[str] = None
    agent_name: str = "Ionel Alexandru"
    extra_context: Optional[str] = None

class PropertyMatchRequest(BaseModel):
    lead_name: str
    budget_max: float
    city: str
    preferences: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None   # e.g. current page / lead info

class ScrapeRequest(BaseModel):
    url: str
    extract: str   # what to extract: "listings" | "contacts" | "prices"


# ── Lead Scoring ────────────────────────────────────────────────────────────

@router.post("/score")
async def score_lead(req: LeadScoreRequest):
    """Use Claude to score a lead 0-100 with reasoning."""
    client = get_claude()

    prompt = f"""You are an expert luxury real estate analyst for Aureum CRM.

Score this lead from 0 to 100 based on purchase likelihood and quality.
Return ONLY valid JSON with this exact structure:
{{
  "score": <integer 0-100>,
  "tier": "<Hot|Warm|Cold>",
  "reasoning": "<2-3 sentences>",
  "recommended_action": "<specific next step for the agent>",
  "estimated_close_probability": "<percentage>"
}}

Lead details:
- Name: {req.name}
- Budget: €{req.budget_min:,.0f} – €{req.budget_max:,.0f} {f"({req.budget_max/1e6:.1f}M)" if req.budget_max else ""}
- Target city: {req.city}
- Source: {req.source or "Unknown"}
- Notes: {req.notes or "None"}

Scoring criteria: budget clarity (25pts), city match to our portfolio (20pts), lead source quality (20pts), urgency signals in notes (20pts), completeness of profile (15pts)."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    try:
        result = json.loads(message.content[0].text)
    except Exception:
        result = {
            "score": 50,
            "tier": "Warm",
            "reasoning": message.content[0].text,
            "recommended_action": "Review lead manually",
            "estimated_close_probability": "25%"
        }

    return result


# ── Email Drafting ──────────────────────────────────────────────────────────

@router.post("/draft-email")
async def draft_email(req: EmailDraftRequest):
    """Generate a personalised outreach email with Claude."""
    client = get_claude()

    template_descriptions = {
        "cold_intro": "a warm but professional first contact email introducing Aureum",
        "post_viewing": "a personalised follow-up email after a property viewing",
        "negotiation": "a tactful negotiation email to move a deal forward",
        "hnw": "an exclusive, VIP-tone invitation for a high-net-worth prospect",
    }

    tone = template_descriptions.get(req.template, "a professional real estate email")

    prompt = f"""Write {tone} for a luxury real estate agent at Aureum.

Agent: {req.agent_name}
Recipient: {req.lead_name}
City: {req.lead_city}
Property: {req.property_name or "our current portfolio"}
Extra context: {req.extra_context or "None"}

Requirements:
- Luxury, professional tone — sophisticated but warm
- 150-200 words max
- No generic phrases like "I hope this finds you well"
- Include a clear, low-pressure call to action
- Sign off as {req.agent_name}, Aureum Real Estate

Return ONLY the email body (no subject line, no JSON wrapper)."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "email": message.content[0].text,
        "template": req.template,
        "recipient": req.lead_name,
    }


# ── Property Matching ───────────────────────────────────────────────────────

@router.post("/match-properties")
async def match_properties(req: PropertyMatchRequest):
    """Use Claude to recommend property types for a lead."""
    client = get_claude()

    prompt = f"""You are a luxury real estate advisor at Aureum.

A client is looking for property in {req.city} with a budget up to €{req.budget_max:,.0f}.
Client: {req.lead_name}
Preferences: {req.preferences or "Not specified"}

Recommend 3 specific property types/areas in {req.city} that would suit this client.
Return ONLY valid JSON:
{{
  "matches": [
    {{
      "property_type": "<type>",
      "area": "<neighbourhood/area>",
      "price_range": "<range>",
      "why": "<1-2 sentence explanation>",
      "match_score": <integer 0-100>
    }}
  ],
  "summary": "<1 sentence overall recommendation>"
}}"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    try:
        result = json.loads(message.content[0].text)
    except Exception:
        result = {"matches": [], "summary": message.content[0].text}

    return result


# ── CRM Chat Assistant ──────────────────────────────────────────────────────

@router.post("/chat")
async def crm_chat(req: ChatRequest):
    """General-purpose Claude assistant for the CRM user."""
    client = get_claude()

    system_prompt = """You are Aureum AI — an intelligent assistant built into the Aureum luxury real estate CRM.
You help agents with: lead analysis, email drafting, market insights, negotiation tactics, and CRM navigation.
Be concise, professional, and specific to luxury real estate. Keep responses under 200 words unless asked for more.
Context about the user: They are a luxury real estate agent operating in Dublin, Dubai, and London."""

    messages = [{"role": "user", "content": req.message}]
    if req.context:
        messages[0]["content"] = f"Context: {req.context}\n\nQuestion: {req.message}"

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=600,
        system=system_prompt,
        messages=messages
    )

    return {"reply": response.content[0].text}


# ── Selenium Web Scraping ───────────────────────────────────────────────────

@router.post("/scrape")
async def scrape_url(req: ScrapeRequest):
    """
    Use Selenium to scrape a property listing page.
    Returns extracted data based on the 'extract' parameter.
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from webdriver_manager.chrome import ChromeDriverManager
    except ImportError:
        raise HTTPException(status_code=503, detail="selenium/webdriver-manager not installed. Run: pip install selenium webdriver-manager")

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

    driver = None
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.set_page_load_timeout(20)
        driver.get(req.url)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        page_text = driver.find_element(By.TAG_NAME, "body").text[:8000]
        page_title = driver.title

        # Use Claude to extract structured data from the scraped text
        client = get_claude()

        extract_prompts = {
            "listings": "Extract all property listings. For each, return: address, price, bedrooms, bathrooms, size_sqm, key_features. Return as JSON array.",
            "contacts": "Extract all contact information: names, emails, phone numbers, company names. Return as JSON array.",
            "prices": "Extract all property prices mentioned. Return as JSON array with: address and price fields.",
        }

        extract_instruction = extract_prompts.get(req.extract, f"Extract: {req.extract}. Return as JSON.")

        ai_message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": f"Page title: {page_title}\n\nPage content:\n{page_text}\n\nTask: {extract_instruction}"
            }]
        )

        import json
        raw = ai_message.content[0].text
        try:
            data = json.loads(raw)
        except Exception:
            data = raw

        return {
            "url": req.url,
            "title": page_title,
            "extract_type": req.extract,
            "data": data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scrape failed: {str(e)}")
    finally:
        if driver:
            driver.quit()


# ── Photo Caption Generator ────────────────────────────────────────────────

class PhotoCaptionRequest(BaseModel):
    image_base64: str          # base64 encoded image (no data: prefix)
    image_type: str = "jpeg"   # jpeg | png | webp
    property_name: Optional[str] = None
    city: Optional[str] = None
    price: Optional[str] = None
    bedrooms: Optional[int] = None
    agent_name: str = "Ionel Alexandru"
    extra_notes: Optional[str] = None


@router.post("/caption-from-photo")
async def caption_from_photo(req: PhotoCaptionRequest):
    """
    Upload a property photo → Claude Vision analyses it →
    Returns ready-to-post captions for Instagram, Reels, TikTok, LinkedIn.
    """
    client = get_claude()

    property_context = []
    if req.property_name:
        property_context.append(f"Property: {req.property_name}")
    if req.city:
        property_context.append(f"City: {req.city}")
    if req.price:
        property_context.append(f"Price: {req.price}")
    if req.bedrooms:
        property_context.append(f"Bedrooms: {req.bedrooms}")
    if req.extra_notes:
        property_context.append(f"Notes: {req.extra_notes}")

    context_str = "\n".join(property_context) if property_context else "Luxury property listing"

    prompt = f"""You are a luxury real estate social media expert for Aureum — a premium property agency in Dublin, Dubai & London.

Analyse this property photo and generate platform-optimised captions.

Property details:
{context_str}
Agent: {req.agent_name}

Generate captions for all 4 formats. Return ONLY valid JSON with this exact structure:
{{
  "photo_description": "<2-sentence description of what you see in the photo>",
  "instagram_post": {{
    "caption": "<150-200 word caption, luxury tone, ends with CTA>",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
  }},
  "instagram_reels": {{
    "caption": "<60-80 words, punchy, hooks in first line, Reels-optimised>",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }},
  "tiktok": {{
    "caption": "<50-70 words, conversational, trending tone, starts with hook>",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }},
  "linkedin": {{
    "caption": "<120-150 words, professional market insight tone, no emojis in first line>",
    "hashtags": ["tag1", "tag2", "tag3"]
  }},
  "google_business": "<50 words, factual, SEO-friendly, includes city and property type>"
}}"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": f"image/{req.image_type}",
                        "data": req.image_base64,
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }]
    )

    import json
    raw = message.content[0].text

    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        result = json.loads(raw.strip())
    except Exception:
        result = {"error": "Could not parse JSON", "raw": raw}

    return result
