import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .extensions import db


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/barca_fan_hub",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")

    db.init_app(app)
    CORS(app)

    from .routes import api
    app.register_blueprint(api, url_prefix="/api")

    with app.app_context():
        db.create_all()  # таблицы уже созданы в Supabase — создаст только недостающие
    return app