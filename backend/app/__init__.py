import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .extensions import db
from .auth import auth as auth_bp


def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/barca_fan_hub",
    )
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "connect_args": {"prepare_threshold": None},
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # ЖЕСТКО ЗАДАЕМ КЛЮЧ, ЧТОБЫ ИСКЛЮЧИТЬ ОШИБКИ ЧТЕНИЯ .ENV
    app.config["SECRET_KEY"] = "sb_secret_ochensecretno"
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    db.init_app(app)
    CORS(app)

    from .routes import api
    app.register_blueprint(api, url_prefix="/api")

    with app.app_context():
        db.create_all()  
    return app