#!/bin/bash
# ─────────────────────────────────────────
#  AUREUM CRM — Start Script
# ─────────────────────────────────────────

cd "$(dirname "$0")"

echo ""
echo "  ╔══════════════════════════════════╗"
echo "  ║       AUREUM CRM — STARTING      ║"
echo "  ╚══════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "  ❌ Python3 nu e instalat. Instaleaza de la https://python.org"
    exit 1
fi

# Install dependencies if needed
echo "  → Verificare dependinte..."
pip3 install -r requirements.txt -q --break-system-packages 2>/dev/null || pip3 install -r requirements.txt -q

# Seed database if empty
echo "  → Initializare baza de date..."
python3 -c "
from aureum_backend import SessionLocal, User, seed_data
db = SessionLocal()
if not db.query(User).first():
    print('  → Adaugare date demo...')
    from fastapi.testclient import TestClient
    from aureum_backend import app
    client = TestClient(app)
    client.post('/api/seed')
db.close()
" 2>/dev/null

# Open browser after 2 seconds
echo "  → Deschidere browser..."
(sleep 2 && open "http://localhost:8000" 2>/dev/null || xdg-open "http://localhost:8000" 2>/dev/null || start "http://localhost:8000" 2>/dev/null) &

echo ""
echo "  ✅ Aureum CRM pornit la http://localhost:8000"
echo ""
echo "  Login:    agent@aureum.ai"
echo "  Parola:   aureum2026"
echo ""
echo "  (Apasa CTRL+C pentru a opri serverul)"
echo ""

# Start server
python3 -m uvicorn aureum_backend:app --host 0.0.0.0 --port 8000
