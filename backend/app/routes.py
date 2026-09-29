from flask import Blueprint, jsonify, request

from .models import Match, Player, Post, Product, Source

api = Blueprint("api", __name__)


@api.get("/health")
def health():
    return jsonify({"status": "ok"})


@api.get("/posts")
def list_posts():
    query = Post.query.filter_by(status="published")
    post_type = request.args.get("type")
    if post_type in ("official", "insider"):
        query = query.filter_by(post_type=post_type)
    posts = query.order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@api.get("/sources")
def list_sources():
    return jsonify([s.to_dict() for s in Source.query.all()])


@api.get("/matches")
def list_matches():
    query = Match.query
    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)
    matches = query.order_by(Match.kickoff_at.desc()).all()
    return jsonify([m.to_dict() for m in matches])


@api.get("/players")
def list_players():
    query = Player.query
    group = request.args.get("group")
    if group:
        query = query.filter_by(position_group=group)
    players = query.order_by(Player.shirt_number).all()
    return jsonify([p.to_dict() for p in players])


@api.get("/products")
def list_products():
    return jsonify([p.to_dict() for p in
                    Product.query.filter_by(is_available=True).all()])