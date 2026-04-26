"""
AUREUM CRM — Luxury Real Estate AI-Powered CRM
Complete Backend API — FastAPI + SQLAlchemy + JWT Auth
"""

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
import hashlib
import hmac
import json
import base64
import os
import enum
import secrets

# ============================================================
# DATABASE SETUP
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aureum.db")

# Handle both sqlite and postgres
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================
# ENUMS
# ============================================================

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"

class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    PENTHOUSE = "penthouse"
    COMMERCIAL = "commercial"
    LAND = "land"

class DealStage(str, enum.Enum):
    DISCOVERY = "discovery"
    VIEWING = "viewing"
    OFFER = "offer"
    NEGOTIATION = "negotiation"
    LEGAL = "legal"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# ============================================================
# DATABASE MODELS
# ============================================================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    company = Column(String(255))
    role = Column(String(50), default="agent")  # agent, manager, admin
    language = Column(String(10), default="en")  # en, ar, es, zh
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    leads = relationship("Lead", back_populates="owner")
    deals = relationship("Deal", back_populates="owner")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), index=True)
    phone = Column(String(50))
    company = Column(String(255))
    source = Column(String(100))  # website, referral, social, portal, cold
    status = Column(String(20), default=LeadStatus.NEW)
    priority = Column(String(10), default=Priority.MEDIUM)
    
    # AI Scoring
    ai_score = Column(Float, default=0.0)  # 0-100
    ai_score_reasons = Column(Text)  # JSON array of reasons
    
    # Preferences
    budget_min = Column(Float)
    budget_max = Column(Float)
    preferred_locations = Column(Text)  # JSON array
    property_types = Column(Text)  # JSON array
    bedrooms_min = Column(Integer)
    notes = Column(Text)
    
    # Tracking
    last_contacted = Column(DateTime)
    next_follow_up = Column(DateTime)
    response_time_seconds = Column(Integer)  # Time to first response
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="leads")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    property_type = Column(String(20), default=PropertyType.APARTMENT)
    
    # Location
    address = Column(String(500))
    city = Column(String(100), index=True)
    county = Column(String(100))
    country = Column(String(100), default="Ireland")
    eircode = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Details
    price = Column(Float, nullable=False)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    area_sqm = Column(Float)
    ber_rating = Column(String(10))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    listing_url = Column(String(500))  # Original listing URL (Daft/MyHome)
    source = Column(String(50))  # daft, myhome, manual, api
    
    # Media
    images = Column(Text)  # JSON array of image URLs
    virtual_tour_url = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    stage = Column(String(20), default=DealStage.DISCOVERY)
    value = Column(Float, default=0.0)
    commission_rate = Column(Float, default=1.5)  # percentage
    
    lead_id = Column(Integer, ForeignKey("leads.id"))
    property_id = Column(Integer, ForeignKey("properties.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="deals")
    lead = relationship("Lead")
    property = relationship("Property")
    
    expected_close_date = Column(DateTime)
    actual_close_date = Column(DateTime)
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50))  # call, email, viewing, meeting, note
    description = Column(Text)
    
    lead_id = Column(Integer, ForeignKey("leads.id"))
    deal_id = Column(Integer, ForeignKey("deals.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================
# CREATE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)

# ============================================================
# AUTH HELPERS
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"

def verify_password(password: str, stored: str) -> bool:
    salt, hashed = stored.split(":")
    check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return hmac.compare_digest(check.hex(), hashed)

def create_token(data: dict) -> str:
    payload = {**data, "exp": (datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)).isoformat()}
    payload_bytes = json.dumps(payload).encode()
    signature = hmac.new(SECRET_KEY.encode(), payload_bytes, hashlib.sha256).hexdigest()
    token = base64.urlsafe_b64encode(payload_bytes).decode() + "." + signature
    return token

def decode_token(token: str) -> dict:
    try:
        parts = token.split(".")
        payload_bytes = base64.urlsafe_b64decode(parts[0])
        signature = hmac.new(SECRET_KEY.encode(), payload_bytes, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, parts[1]):
            raise HTTPException(status_code=401, detail="Invalid token")
        payload = json.loads(payload_bytes)
        if datetime.fromisoformat(payload["exp"]) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================================================
# DEPENDENCIES
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    company: Optional[str] = None
    language: Optional[str] = "en"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    company: Optional[str]
    role: str
    language: str
    is_active: bool
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = "manual"
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_locations: Optional[List[str]] = None
    property_types: Optional[List[str]] = None
    bedrooms_min: Optional[int] = None
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

class LeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    company: Optional[str]
    source: Optional[str]
    status: str
    priority: str
    ai_score: float
    ai_score_reasons: Optional[str]
    budget_min: Optional[float]
    budget_max: Optional[float]
    last_contacted: Optional[datetime]
    next_follow_up: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: Optional[str] = "apartment"
    address: Optional[str] = None
    city: Optional[str] = "Dublin"
    county: Optional[str] = None
    country: Optional[str] = "Ireland"
    price: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[float] = None
    ber_rating: Optional[str] = None
    images: Optional[List[str]] = None

class PropertyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    property_type: str
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    price: float
    bedrooms: Optional[int]
    bathrooms: Optional[int]
    area_sqm: Optional[float]
    ber_rating: Optional[str]
    is_active: bool
    is_featured: bool
    created_at: datetime
    class Config:
        from_attributes = True

class DealCreate(BaseModel):
    title: str
    lead_id: Optional[int] = None
    property_id: Optional[int] = None
    value: Optional[float] = 0.0
    commission_rate: Optional[float] = 1.5
    expected_close_date: Optional[datetime] = None
    notes: Optional[str] = None

class DealUpdate(BaseModel):
    stage: Optional[str] = None
    value: Optional[float] = None
    notes: Optional[str] = None
    expected_close_date: Optional[datetime] = None

class DealResponse(BaseModel):
    id: int
    title: str
    stage: str
    value: float
    commission_rate: float
    lead_id: Optional[int]
    property_id: Optional[int]
    expected_close_date: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

class ActivityCreate(BaseModel):
    activity_type: str
    description: str
    lead_id: Optional[int] = None
    deal_id: Optional[int] = None

class DashboardStats(BaseModel):
    total_leads: int
    new_leads_this_month: int
    total_properties: int
    active_deals: int
    total_pipeline_value: float
    total_commission_potential: float
    won_deals_this_month: int
    revenue_this_month: float
    avg_ai_score: float
    leads_by_status: dict
    deals_by_stage: dict

# ============================================================
# AI LEAD SCORING ENGINE
# ============================================================

def calculate_ai_score(lead: Lead, db: Session) -> tuple[float, list]:
    """
    AI Lead Scoring — calculates 0-100 score based on:
    - Budget (higher = better for luxury)
    - Completeness of profile
    - Source quality
    - Response time
    - Engagement level
    """
    score = 0.0
    reasons = []
    
    # Budget scoring (0-30 points)
    if lead.budget_max:
        if lead.budget_max >= 2000000:
            score += 30
            reasons.append("Ultra-high budget (€2M+) — priority VIP client")
        elif lead.budget_max >= 1000000:
            score += 25
            reasons.append("High budget (€1M+) — premium client")
        elif lead.budget_max >= 500000:
            score += 20
            reasons.append("Strong budget (€500K+)")
        elif lead.budget_max >= 250000:
            score += 12
            reasons.append("Moderate budget (€250K+)")
        else:
            score += 5
            reasons.append("Entry-level budget")
    
    # Profile completeness (0-20 points)
    completeness = 0
    if lead.email: completeness += 4
    if lead.phone: completeness += 4
    if lead.budget_min and lead.budget_max: completeness += 4
    if lead.preferred_locations: completeness += 4
    if lead.property_types: completeness += 4
    score += completeness
    if completeness >= 16:
        reasons.append("Complete profile — serious buyer signals")
    elif completeness >= 8:
        reasons.append("Partial profile — needs nurturing")
    
    # Source quality (0-20 points)
    source_scores = {
        "referral": 20, "website": 15, "portal": 12,
        "social": 10, "cold": 5, "manual": 8
    }
    source_pts = source_scores.get(lead.source, 8)
    score += source_pts
    if source_pts >= 15:
        reasons.append(f"High-quality source: {lead.source}")
    
    # Engagement (0-15 points)
    activities = db.query(Activity).filter(Activity.lead_id == lead.id).count()
    if activities >= 5:
        score += 15
        reasons.append(f"Highly engaged — {activities} interactions")
    elif activities >= 3:
        score += 10
        reasons.append(f"Good engagement — {activities} interactions")
    elif activities >= 1:
        score += 5
        reasons.append("Initial engagement recorded")
    
    # Response time bonus (0-15 points)
    if lead.response_time_seconds:
        if lead.response_time_seconds <= 60:
            score += 15
            reasons.append("Lightning response (<60s) — top priority")
        elif lead.response_time_seconds <= 300:
            score += 10
            reasons.append("Fast response (<5min)")
        elif lead.response_time_seconds <= 3600:
            score += 5
            reasons.append("Responded within 1 hour")
    
    return min(score, 100), reasons

# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AUREUM CRM API",
    description="Luxury Real Estate AI-Powered CRM — Global Licensing Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register AI + Selenium routes
from ai_routes import router as ai_router
app.include_router(ai_router)

# ============================================================
# AUTH ENDPOINTS
# ============================================================

@app.post("/api/auth/register", response_model=TokenResponse, tags=["Auth"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        company=user_data.company,
        language=user_data.language or "en"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_token({"user_id": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"user_id": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@app.get("/api/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

# ============================================================
# LEADS ENDPOINTS
# ============================================================

@app.post("/api/leads", response_model=LeadResponse, tags=["Leads"])
def create_lead(lead_data: LeadCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = Lead(
        **lead_data.model_dump(exclude={"preferred_locations", "property_types"}),
        preferred_locations=json.dumps(lead_data.preferred_locations) if lead_data.preferred_locations else None,
        property_types=json.dumps(lead_data.property_types) if lead_data.property_types else None,
        owner_id=user.id
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    # Calculate AI score
    score, reasons = calculate_ai_score(lead, db)
    lead.ai_score = score
    lead.ai_score_reasons = json.dumps(reasons)
    db.commit()
    db.refresh(lead)
    
    return LeadResponse.model_validate(lead)

@app.get("/api/leads", response_model=List[LeadResponse], tags=["Leads"])
def list_leads(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    min_score: Optional[float] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lead).filter(Lead.owner_id == user.id)
    if status:
        query = query.filter(Lead.status == status)
    if priority:
        query = query.filter(Lead.priority == priority)
    if min_score:
        query = query.filter(Lead.ai_score >= min_score)
    if search:
        query = query.filter(
            (Lead.first_name.ilike(f"%{search}%")) |
            (Lead.last_name.ilike(f"%{search}%")) |
            (Lead.email.ilike(f"%{search}%"))
        )
    return [LeadResponse.model_validate(l) for l in query.order_by(Lead.ai_score.desc()).offset(skip).limit(limit).all()]

@app.get("/api/leads/{lead_id}", response_model=LeadResponse, tags=["Leads"])
def get_lead(lead_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)

@app.patch("/api/leads/{lead_id}", response_model=LeadResponse, tags=["Leads"])
def update_lead(lead_id: int, data: LeadUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)
    
    # Recalculate AI score
    score, reasons = calculate_ai_score(lead, db)
    lead.ai_score = score
    lead.ai_score_reasons = json.dumps(reasons)
    
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)

@app.delete("/api/leads/{lead_id}", tags=["Leads"])
def delete_lead(lead_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"status": "deleted"}

# ============================================================
# PROPERTIES ENDPOINTS
# ============================================================

@app.post("/api/properties", response_model=PropertyResponse, tags=["Properties"])
def create_property(data: PropertyCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = Property(
        **data.model_dump(exclude={"images"}),
        images=json.dumps(data.images) if data.images else None
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)

@app.get("/api/properties", response_model=List[PropertyResponse], tags=["Properties"])
def list_properties(
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Property).filter(Property.is_active == True)
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    if bedrooms:
        query = query.filter(Property.bedrooms >= bedrooms)
    return [PropertyResponse.model_validate(p) for p in query.order_by(Property.price.desc()).offset(skip).limit(limit).all()]

@app.get("/api/properties/{prop_id}", response_model=PropertyResponse, tags=["Properties"])
def get_property(prop_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyResponse.model_validate(prop)

@app.patch("/api/properties/{prop_id}", response_model=PropertyResponse, tags=["Properties"])
def update_property(prop_id: int, updates: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    for k, v in updates.items():
        if hasattr(prop, k):
            setattr(prop, k, v)
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)

# ============================================================
# DEALS ENDPOINTS
# ============================================================

@app.post("/api/deals", response_model=DealResponse, tags=["Deals"])
def create_deal(data: DealCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = Deal(**data.model_dump(), owner_id=user.id)
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return DealResponse.model_validate(deal)

@app.get("/api/deals", response_model=List[DealResponse], tags=["Deals"])
def list_deals(
    stage: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Deal).filter(Deal.owner_id == user.id)
    if stage:
        query = query.filter(Deal.stage == stage)
    return [DealResponse.model_validate(d) for d in query.order_by(Deal.value.desc()).all()]

@app.patch("/api/deals/{deal_id}", response_model=DealResponse, tags=["Deals"])
def update_deal(deal_id: int, data: DealUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.owner_id == user.id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(deal, key, value)
    db.commit()
    db.refresh(deal)
    return DealResponse.model_validate(deal)

# ============================================================
# ACTIVITIES ENDPOINTS
# ============================================================

@app.post("/api/activities", tags=["Activities"])
def create_activity(data: ActivityCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activity = Activity(**data.model_dump(), user_id=user.id)
    db.add(activity)
    
    # Update lead last_contacted
    if data.lead_id:
        lead = db.query(Lead).filter(Lead.id == data.lead_id).first()
        if lead:
            lead.last_contacted = datetime.utcnow()
            # Recalculate score
            score, reasons = calculate_ai_score(lead, db)
            lead.ai_score = score
            lead.ai_score_reasons = json.dumps(reasons)
    
    db.commit()
    return {"status": "created", "id": activity.id}

@app.get("/api/activities", tags=["Activities"])
def list_activities(
    lead_id: Optional[int] = None,
    deal_id: Optional[int] = None,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(Activity.user_id == user.id)
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if deal_id:
        query = query.filter(Activity.deal_id == deal_id)
    activities = query.order_by(Activity.created_at.desc()).limit(limit).all()
    return [{"id": a.id, "activity_type": a.activity_type, "description": a.description,
             "lead_id": a.lead_id, "deal_id": a.deal_id, "created_at": a.created_at.isoformat()} for a in activities]

# ============================================================
# DASHBOARD / ANALYTICS
# ============================================================

@app.get("/api/dashboard", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    leads = db.query(Lead).filter(Lead.owner_id == user.id)
    deals = db.query(Deal).filter(Deal.owner_id == user.id)
    props = db.query(Property).filter(Property.is_active == True)
    
    active_deals = deals.filter(Deal.stage.notin_(["closed_won", "closed_lost"])).all()
    won_this_month = deals.filter(Deal.stage == "closed_won", Deal.actual_close_date >= month_start).all()
    
    pipeline_value = sum(d.value for d in active_deals)
    commission_potential = sum(d.value * (d.commission_rate / 100) for d in active_deals)
    revenue_month = sum(d.value * (d.commission_rate / 100) for d in won_this_month)
    
    all_leads = leads.all()
    avg_score = sum(l.ai_score for l in all_leads) / len(all_leads) if all_leads else 0
    
    # Leads by status
    leads_by_status = {}
    for l in all_leads:
        leads_by_status[l.status] = leads_by_status.get(l.status, 0) + 1
    
    # Deals by stage
    all_deals = deals.all()
    deals_by_stage = {}
    for d in all_deals:
        deals_by_stage[d.stage] = deals_by_stage.get(d.stage, 0) + 1
    
    return DashboardStats(
        total_leads=len(all_leads),
        new_leads_this_month=leads.filter(Lead.created_at >= month_start).count(),
        total_properties=props.count(),
        active_deals=len(active_deals),
        total_pipeline_value=pipeline_value,
        total_commission_potential=commission_potential,
        won_deals_this_month=len(won_this_month),
        revenue_this_month=revenue_month,
        avg_ai_score=round(avg_score, 1),
        leads_by_status=leads_by_status,
        deals_by_stage=deals_by_stage
    )

# ============================================================
# DELETE DEAL
# ============================================================

@app.delete("/api/deals/{deal_id}", tags=["Deals"])
def delete_deal(deal_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.owner_id == user.id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db.delete(deal)
    db.commit()
    return {"status": "deleted"}

# ============================================================
# ACTIVITY UPDATE / DELETE
# ============================================================

@app.put("/api/activities/{activity_id}", tags=["Activities"])
def update_activity(activity_id: int, data: ActivityCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == user.id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, key, value)
    db.commit()
    db.refresh(activity)
    return {"status": "updated", "id": activity.id}

@app.delete("/api/activities/{activity_id}", tags=["Activities"])
def delete_activity(activity_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == user.id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"status": "deleted"}

# ============================================================
# ANALYTICS ENDPOINT
# ============================================================

@app.get("/api/analytics", tags=["Analytics"])
def get_analytics(
    period: Optional[str] = "month",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    if period == "week":
        start = now - timedelta(days=7)
    elif period == "year":
        start = now - timedelta(days=365)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    leads = db.query(Lead).filter(Lead.owner_id == user.id).all()
    deals = db.query(Deal).filter(Deal.owner_id == user.id).all()
    activities = db.query(Activity).filter(Activity.user_id == user.id).all()

    # Revenue over last 6 months
    monthly_revenue = {}
    for i in range(6):
        month_dt = now.replace(day=1) - timedelta(days=30 * i)
        key = month_dt.strftime("%b %Y")
        monthly_revenue[key] = 0
    for d in deals:
        if d.stage == "closed_won" and d.actual_close_date:
            key = d.actual_close_date.strftime("%b %Y")
            if key in monthly_revenue:
                monthly_revenue[key] += d.value * (d.commission_rate / 100)

    # Leads by source
    leads_by_source = {}
    for l in leads:
        src = l.source or "unknown"
        leads_by_source[src] = leads_by_source.get(src, 0) + 1

    # Leads by status
    leads_by_status = {}
    for l in leads:
        leads_by_status[l.status] = leads_by_status.get(l.status, 0) + 1

    # Deal conversion rate
    total_deals = len(deals)
    won_deals = len([d for d in deals if d.stage == "closed_won"])
    conversion_rate = round((won_deals / total_deals * 100) if total_deals else 0, 1)

    # Activity breakdown
    activity_types = {}
    for a in activities:
        t = a.activity_type or "other"
        activity_types[t] = activity_types.get(t, 0) + 1

    # AI score distribution
    score_buckets = {"0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0}
    for l in leads:
        s = l.ai_score or 0
        if s <= 25: score_buckets["0-25"] += 1
        elif s <= 50: score_buckets["26-50"] += 1
        elif s <= 75: score_buckets["51-75"] += 1
        else: score_buckets["76-100"] += 1

    total_pipeline = sum(d.value for d in deals if d.stage not in ["closed_won", "closed_lost"])
    total_revenue = sum(d.value * (d.commission_rate / 100) for d in deals if d.stage == "closed_won")

    return {
        "period": period,
        "summary": {
            "total_leads": len(leads),
            "total_deals": total_deals,
            "won_deals": won_deals,
            "conversion_rate": conversion_rate,
            "total_pipeline": total_pipeline,
            "total_revenue": total_revenue,
            "avg_ai_score": round(sum(l.ai_score for l in leads) / len(leads), 1) if leads else 0,
        },
        "monthly_revenue": [{"month": k, "revenue": v} for k, v in reversed(list(monthly_revenue.items()))],
        "leads_by_source": [{"source": k, "count": v} for k, v in leads_by_source.items()],
        "leads_by_status": [{"status": k, "count": v} for k, v in leads_by_status.items()],
        "activity_types": [{"type": k, "count": v} for k, v in activity_types.items()],
        "ai_score_distribution": [{"range": k, "count": v} for k, v in score_buckets.items()],
    }

# ============================================================
# USERS ENDPOINTS
# ============================================================

@app.get("/api/users", tags=["Users"])
def list_users(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True).all()
    return [UserResponse.model_validate(u) for u in users]

@app.put("/api/users/{user_id}", tags=["Users"])
def update_user(user_id: int, updates: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    allowed = {"full_name", "company", "language"}
    for k, v in updates.items():
        if k in allowed:
            setattr(target, k, v)
    db.commit()
    db.refresh(target)
    return UserResponse.model_validate(target)

@app.post("/api/users/invite", tags=["Users"])
def invite_user(data: UserCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Only admins can invite users")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        company=data.company or current_user.company,
        role="agent",
        language=data.language or "en"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse.model_validate(new_user)

# ============================================================
# AI ROUTE ALIASES (fix frontend mismatch)
# ============================================================

@app.get("/api/ai/match/{lead_id}", tags=["AI"])
def match_properties_alias(lead_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Alias for /api/ai/match-properties/{lead_id} — matches frontend api.js"""
    return match_properties(lead_id, user, db)

@app.get("/api/ai/score/{lead_id}", tags=["AI"])
def score_lead_get(lead_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """GET endpoint for lead AI score — matches frontend api.js"""
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    score, reasons = calculate_ai_score(lead, db)
    lead.ai_score = score
    lead.ai_score_reasons = json.dumps(reasons)
    db.commit()
    return {
        "lead_id": lead_id,
        "score": score,
        "tier": "Hot" if score >= 70 else "Warm" if score >= 40 else "Cold",
        "reasons": reasons,
    }

# ============================================================
# AI MATCHING ENDPOINT
# ============================================================

@app.get("/api/ai/match-properties/{lead_id}", tags=["AI"])
def match_properties(lead_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI-powered property matching for a lead based on preferences"""
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.owner_id == user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    query = db.query(Property).filter(Property.is_active == True)
    
    # Filter by budget
    if lead.budget_min:
        query = query.filter(Property.price >= lead.budget_min)
    if lead.budget_max:
        query = query.filter(Property.price <= lead.budget_max)
    
    # Filter by bedrooms
    if lead.bedrooms_min:
        query = query.filter(Property.bedrooms >= lead.bedrooms_min)
    
    # Filter by property type
    if lead.property_types:
        types = json.loads(lead.property_types)
        if types:
            query = query.filter(Property.property_type.in_(types))
    
    # Filter by location
    if lead.preferred_locations:
        locations = json.loads(lead.preferred_locations)
        if locations:
            from sqlalchemy import or_
            location_filters = [Property.city.ilike(f"%{loc}%") for loc in locations]
            query = query.filter(or_(*location_filters))
    
    matches = query.order_by(Property.is_featured.desc(), Property.price.desc()).limit(10).all()
    
    results = []
    for prop in matches:
        match_score = 0
        match_reasons = []
        
        # Price match
        if lead.budget_min and lead.budget_max:
            mid_budget = (lead.budget_min + lead.budget_max) / 2
            price_diff = abs(prop.price - mid_budget) / mid_budget
            if price_diff < 0.1:
                match_score += 40
                match_reasons.append("Perfect price match")
            elif price_diff < 0.25:
                match_score += 25
                match_reasons.append("Good price range")
            else:
                match_score += 10
                match_reasons.append("Within budget")
        
        # Bedroom match
        if lead.bedrooms_min and prop.bedrooms:
            if prop.bedrooms >= lead.bedrooms_min:
                match_score += 20
                match_reasons.append(f"{prop.bedrooms} bedrooms meets requirement")
        
        # Location match
        if lead.preferred_locations:
            locs = json.loads(lead.preferred_locations)
            if prop.city and any(loc.lower() in prop.city.lower() for loc in locs):
                match_score += 30
                match_reasons.append(f"Preferred location: {prop.city}")
        
        # Type match
        if lead.property_types:
            types = json.loads(lead.property_types)
            if prop.property_type in types:
                match_score += 10
                match_reasons.append(f"Preferred type: {prop.property_type}")
        
        results.append({
            "property": PropertyResponse.model_validate(prop).model_dump(),
            "match_score": min(match_score, 100),
            "match_reasons": match_reasons
        })
    
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"lead_id": lead_id, "matches": results, "total": len(results)}

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health", tags=["System"])
def health():
    return {
        "status": "healthy",
        "app": "AUREUM CRM",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================
# SEED DATA
# ============================================================

@app.post("/api/seed", tags=["System"])
def seed_data(db: Session = Depends(get_db)):
    """Seed database with sample luxury properties and demo data"""
    
    # Check if already seeded
    if db.query(User).first():
        return {"status": "already seeded"}
    
    # Create demo user
    demo = User(
        email="agent@aureum.ai",
        full_name="Alex Aurelio",
        hashed_password=hash_password("aureum2026"),
        company="AUREUM Luxury Properties",
        role="admin",
        language="en"
    )
    db.add(demo)
    db.commit()
    db.refresh(demo)
    
    # Dublin luxury properties
    properties = [
        Property(title="Penthouse at The Lansdowne", description="Stunning 3-bed penthouse with panoramic views of Dublin Bay",
                 property_type="penthouse", address="Lansdowne Road, Ballsbridge", city="Dublin", county="Dublin",
                 country="Ireland", price=2850000, bedrooms=3, bathrooms=3, area_sqm=245, ber_rating="A2",
                 source="manual", is_featured=True),
        Property(title="Georgian Townhouse, Merrion Square", description="Magnificent restored Georgian residence in prime Dublin 2",
                 property_type="house", address="Merrion Square East", city="Dublin", county="Dublin",
                 country="Ireland", price=4500000, bedrooms=6, bathrooms=5, area_sqm=520, ber_rating="B1",
                 source="manual", is_featured=True),
        Property(title="Luxury Apartment, Grand Canal Dock", description="Modern 2-bed apartment with canal views in Silicon Docks",
                 property_type="apartment", address="Grand Canal Square", city="Dublin", county="Dublin",
                 country="Ireland", price=875000, bedrooms=2, bathrooms=2, area_sqm=110, ber_rating="A1",
                 source="daft"),
        Property(title="Seafront Villa, Dalkey", description="Exceptional 5-bed villa with direct sea access",
                 property_type="villa", address="Coliemore Road, Dalkey", city="Dublin", county="Dublin",
                 country="Ireland", price=6200000, bedrooms=5, bathrooms=4, area_sqm=380, ber_rating="B2",
                 source="manual", is_featured=True),
        Property(title="Detached Home, Howth Summit", description="Architecturally designed home with breathtaking sea views",
                 property_type="house", address="Summit Road, Howth", city="Dublin", county="Dublin",
                 country="Ireland", price=1950000, bedrooms=4, bathrooms=3, area_sqm=290, ber_rating="A3",
                 source="myhome"),
        Property(title="Mews House, Donnybrook", description="Charming period mews in sought-after Dublin 4",
                 property_type="house", address="Donnybrook Road", city="Dublin", county="Dublin",
                 country="Ireland", price=1350000, bedrooms=3, bathrooms=2, area_sqm=165, ber_rating="C1",
                 source="manual"),
        Property(title="Waterfront Penthouse, Dun Laoghaire", description="Ultra-luxury penthouse overlooking the harbour",
                 property_type="penthouse", address="Harbour Road, Dun Laoghaire", city="Dublin", county="Dublin",
                 country="Ireland", price=3100000, bedrooms=4, bathrooms=3, area_sqm=310, ber_rating="A1",
                 source="manual", is_featured=True),
        Property(title="Garden Square Apartment, Blackrock", description="Elegant 2-bed in prestigious garden development",
                 property_type="apartment", address="Rock Road, Blackrock", city="Dublin", county="Dublin",
                 country="Ireland", price=725000, bedrooms=2, bathrooms=2, area_sqm=95, ber_rating="A2",
                 source="daft"),
    ]
    db.add_all(properties)
    db.commit()
    
    # Sample leads with varying AI scores
    leads = [
        Lead(first_name="Sheikh", last_name="Al-Rashid", email="rashid@investuae.com", phone="+971501234567",
             company="Al-Rashid Investments", source="referral", status="qualified", priority="urgent",
             budget_min=2000000, budget_max=7000000, preferred_locations=json.dumps(["Dublin", "Dalkey"]),
             property_types=json.dumps(["villa", "penthouse"]), bedrooms_min=4, owner_id=demo.id,
             notes="HNW investor from Dubai, looking for multiple properties"),
        Lead(first_name="Emma", last_name="Chen", email="emma.chen@techcorp.cn", phone="+8613912345678",
             company="TechCorp Shanghai", source="website", status="contacted", priority="high",
             budget_min=800000, budget_max=1500000, preferred_locations=json.dumps(["Dublin", "Blackrock"]),
             property_types=json.dumps(["apartment", "penthouse"]), bedrooms_min=2, owner_id=demo.id,
             notes="Relocating to Dublin for tech role, wants premium address"),
        Lead(first_name="Carlos", last_name="Rodriguez", email="carlos@luxhomes.es", phone="+34612345678",
             company="LuxHomes Madrid", source="portal", status="new", priority="medium",
             budget_min=500000, budget_max=900000, preferred_locations=json.dumps(["Dublin"]),
             property_types=json.dumps(["apartment"]), bedrooms_min=2, owner_id=demo.id),
        Lead(first_name="Sarah", last_name="O'Brien", email="sarah.ob@gmail.com", phone="+353871234567",
             source="social", status="new", priority="medium",
             budget_min=300000, budget_max=600000, preferred_locations=json.dumps(["Dublin", "Howth"]),
             property_types=json.dumps(["house", "apartment"]), bedrooms_min=3, owner_id=demo.id),
        Lead(first_name="James", last_name="Worthington", email="j.worthington@londoncap.uk", phone="+447911234567",
             company="London Capital Partners", source="referral", status="proposal", priority="high",
             budget_min=3000000, budget_max=10000000, preferred_locations=json.dumps(["Dalkey", "Killiney"]),
             property_types=json.dumps(["villa", "house"]), bedrooms_min=5, owner_id=demo.id,
             notes="London-based PE fund, portfolio acquisition"),
    ]
    db.add_all(leads)
    db.commit()
    
    # Calculate AI scores for all leads
    for lead in leads:
        db.refresh(lead)
        score, reasons = calculate_ai_score(lead, db)
        lead.ai_score = score
        lead.ai_score_reasons = json.dumps(reasons)
    db.commit()
    
    # Sample deals
    deals = [
        Deal(title="Al-Rashid — Dalkey Villa", stage="negotiation", value=6200000,
             commission_rate=1.5, lead_id=1, property_id=4, owner_id=demo.id,
             expected_close_date=datetime(2026, 5, 1)),
        Deal(title="Chen — Grand Canal Apt", stage="viewing", value=875000,
             commission_rate=2.0, lead_id=2, property_id=3, owner_id=demo.id,
             expected_close_date=datetime(2026, 4, 15)),
        Deal(title="Worthington — Portfolio", stage="discovery", value=9500000,
             commission_rate=1.0, lead_id=5, property_id=2, owner_id=demo.id,
             expected_close_date=datetime(2026, 6, 30)),
    ]
    db.add_all(deals)
    db.commit()
    
    # Sample activities
    activities = [
        Activity(activity_type="call", description="Initial discovery call — very interested in Dalkey properties",
                 lead_id=1, user_id=demo.id),
        Activity(activity_type="email", description="Sent property brochure for Lansdowne Penthouse",
                 lead_id=1, user_id=demo.id),
        Activity(activity_type="viewing", description="Property viewing at Dalkey Villa — extremely positive",
                 lead_id=1, deal_id=1, user_id=demo.id),
        Activity(activity_type="call", description="Follow-up call — discussing relocation timeline",
                 lead_id=2, user_id=demo.id),
        Activity(activity_type="email", description="Welcome email with Dublin luxury market overview",
                 lead_id=3, user_id=demo.id),
    ]
    db.add_all(activities)
    db.commit()
    
    # Recalculate scores after activities
    for lead in db.query(Lead).all():
        score, reasons = calculate_ai_score(lead, db)
        lead.ai_score = score
        lead.ai_score_reasons = json.dumps(reasons)
    db.commit()
    
    return {
        "status": "seeded",
        "users": 1,
        "properties": len(properties),
        "leads": len(leads),
        "deals": len(deals),
        "activities": len(activities),
        "login": {"email": "agent@aureum.ai", "password": "aureum2026"}
    }

# ============================================================
# FRONTEND STATIC FILES
# ============================================================

_frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.isdir(_frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
