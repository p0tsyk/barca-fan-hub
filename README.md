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