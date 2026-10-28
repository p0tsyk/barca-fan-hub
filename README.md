# Barça Fan Hub

Unofficial fan platform for FC Barcelona supporters (educational project).

## Features
- News & insider feed with source reliability tiers (Tier 1–5)
- Match center: fixtures, results, squads
- Squad catalog + interactive lineup builder
- Fan community: comments, player-of-the-match voting
- Fan shop with cart and delivery regions

## Stack
- Backend: Python + Flask + SQLAlchemy, psycopg
- Database: PostgreSQL (Supabase), 16 tables, 3NF
- Frontend: React + TypeScript (in progress)

## Run locally
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
python run.py

API: http://127.0.0.1:5000/api/health

> Unofficial fan project. Not affiliated with FC Barcelona.


## Run locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

API поднимется на http://127.0.0.1:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI поднимется на http://localhost:5173

### Docker

```bash
docker build -t barca-fan-hub .
docker run -p 5000:5000 -e DATABASE_URL="<connection-string>" -e SECRET_KEY=fanhub-dev barca-fan-hub
```