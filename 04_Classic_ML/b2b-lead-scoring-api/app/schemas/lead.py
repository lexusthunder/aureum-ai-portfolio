from pydantic import BaseModel, Field, field_validator


class LeadFeatures(BaseModel):
    """
    Features pentru un lead B2B.
    Toate valorile trebuie normalizate în intervalul [0, 1].
    """

    company_size: float = Field(..., ge=0.0, le=1.0, description="Dimensiune companie (0=micro, 1=enterprise)")
    budget: float = Field(..., ge=0.0, le=1.0, description="Buget disponibil estimat (0=mic, 1=mare)")
    engagement_score: float = Field(..., ge=0.0, le=1.0, description="Scor engagement (vizite, emailuri, demo-uri)")
    industry_match: float = Field(..., ge=0.0, le=1.0, description="Potrivire industrie (0=nepotrivit, 1=perfect)")
    decision_maker_contact: float = Field(..., ge=0.0, le=1.0, description="Contact cu decidentul (0=nu, 1=da)")


class LeadScoreRequest(BaseModel):
    leads: list[LeadFeatures] = Field(..., min_length=1, max_length=1000, description="Lista de lead-uri de scoring")
    threshold: float = Field(0.5, ge=0.0, le=1.0, description="Threshold pentru clasificare pozitiv/negativ")


class LeadScoreResult(BaseModel):
    index: int
    probability: float = Field(..., description="Probabilitate conversie (0-1)")
    label: int = Field(..., description="0=negativ, 1=pozitiv")
    category: str = Field(..., description="hot/warm/cold")


class LeadScoreResponse(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    results: list[LeadScoreResult]


class TrainRequest(BaseModel):
    features: list[list[float]] = Field(..., description="Matrix NxM de features (normalizate 0-1)")
    labels: list[float] = Field(..., description="Lista N de etichete (0 sau 1)")
    epochs: int = Field(500, ge=10, le=5000)
    learning_rate: float = Field(0.1, ge=0.0001, le=10.0)

    @field_validator("labels")
    @classmethod
    def labels_must_be_binary(cls, v: list[float]) -> list[float]:
        for val in v:
            if val not in (0, 1, 0.0, 1.0):
                raise ValueError(f"Label invalid: {val}. Acceptat: 0 sau 1.")
        return v


class TrainResponse(BaseModel):
    message: str
    epochs_trained: int
    final_loss: float
    loss_history: list[float]
