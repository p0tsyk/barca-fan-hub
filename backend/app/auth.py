from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db
from .models import User

auth = Blueprint("auth", __name__)


@auth.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not username or not email or len(password) < 6:
        return jsonify({"error": "Нужны username, email и пароль от 6 символов"}), 400
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "Такой пользователь уже есть"}), 409
    user = User(username=username, email=email,
                password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username}), 201


@auth.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Неверный email или пароль"}), 401
    token = jwt.encode(
        {"sub": user.id, "username": user.username,
         "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({"token": token, "username": user.username})


def require_auth(fn):
    """Декоратор для закрытых эндпоинтов: ждёт заголовок Authorization: Bearer <token>."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Нужен токен"}), 401
        try:
            payload = jwt.decode(header[7:], current_app.config["SECRET_KEY"],
                                 algorithms=["HS256"])
        except jwt.PyJWTError:
            return jsonify({"error": "Токен недействителен"}), 401
        request.user_id = payload["sub"]
        request.username = payload["username"]
        return fn(*args, **kwargs)
    return wrapper