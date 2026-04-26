import numpy as np
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_api_key
from app.models.ml_model import score_leads, retrain_model
from app.schemas.lead import (
    LeadScoreRequest,
    LeadScoreResponse,
    LeadScoreResult,
    TrainRequest,
    TrainResponse,
)

router = APIRouter(prefix="/leads", tags=["Lead Scoring"])


def _categorize(prob: float) -> str:
    if prob >= 0.7:
        return "hot"
    if prob >= 0.4:
        return "warm"
    return "cold"


@router.post("/score", response_model=LeadScoreResponse, summary="Scorează lead-uri B2B")
def score(request: LeadScoreRequest, _: str = Depends(require_api_key)):
    """
    Preia o listă de lead-uri și returnează probabilitatea de conversie
    pentru fiecare, plus clasificare hot/warm/cold.
    """
    matrix = np.array([
        [
            lead.company_size,
            lead.budget,
            lead.engagement_score,
            lead.industry_match,
            lead.decision_maker_contact,
        ]
        for lead in request.leads
    ])

    probabilities = score_leads(matrix).flatten()

    results = []
    for i, prob in enumerate(probabilities):
        label = int(prob >= request.threshold)
        results.append(LeadScoreResult(
            index=i,
            probability=round(float(prob), 4),
            label=label,
            category=_categorize(float(prob)),
        ))

    hot = sum(1 for r in results if r.category == "hot")
    warm = sum(1 for r in results if r.category == "warm")
    cold = sum(1 for r in results if r.category == "cold")

    return LeadScoreResponse(
        total_leads=len(results),
        hot_leads=hot,
        warm_leads=warm,
        cold_leads=cold,
        results=results,
    )


@router.post("/train", response_model=TrainResponse, summary="Reantrenează modelul cu date noi")
def train(request: TrainRequest, _: str = Depends(require_api_key)):
    """
    Reantrenează modelul ML cu date proprii.
    Trimite features normalizate (0-1) și etichete binare.
    """
    if not request.features:
        raise HTTPException(status_code=422, detail="features nu poate fi gol")

    X = np.array(request.features, dtype=float)
    y = np.array(request.labels, dtype=float).reshape(-1, 1)

    if X.shape[0] != y.shape[0]:
        raise HTTPException(
            status_code=422,
            detail=f"features are {X.shape[0]} rânduri dar labels are {y.shape[0]}"
        )

    loss_history = retrain_model(X, y, request.epochs, request.learning_rate)

    return TrainResponse(
        message="Model reantrenat cu succes.",
        epochs_trained=request.epochs,
        final_loss=round(loss_history[-1], 6),
        loss_history=[round(l, 6) for l in loss_history],
    )
