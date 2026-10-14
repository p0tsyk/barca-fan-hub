from flask import Blueprint, jsonify, request

from .auth import require_auth
from .extensions import db
from .models import Lineup, LineupItem, Match, Player, Post, Product, Source

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


@api.post("/lineups")
@require_auth
def create_lineup():
    data = request.get_json(silent=True) or {}
    formation = data.get("formation") or "4-3-3"
    title = (data.get("title") or f"Мой {formation}")[:120]
    match_id = data.get("match_id")
    slots = data.get("slots") or {}  # { "GK": player_id, "ST": player_id, ... }

    if len(slots) != 11:
        return jsonify({"error": "Нужно ровно 11 игроков"}), 400

    lineup = Lineup(user_id=request.user_id, match_id=match_id,
                    formation=formation, title=title)
    db.session.add(lineup)
    db.session.flush()

    for role_label, player_id in slots.items():
        if player_id is None:
            continue
        player = Player.query.get(player_id)
        if not player:
            return jsonify({"error": f"Игрок #{player_id} не найден"}), 404
        db.session.add(LineupItem(
            lineup_id=lineup.id, player_id=player.id,
            role_label=role_label[:10], x=0, y=0,
        ))
    db.session.commit()
    return jsonify({"id": lineup.id, "title": lineup.title, "formation": lineup.formation}), 201


@api.get("/lineups")
@require_auth
def my_lineups():
    items = Lineup.query.filter_by(user_id=request.user_id).order_by(
        Lineup.created_at.desc()).all()
    return jsonify([_lineup_dict(l) for l in items])


@api.get("/lineups/<int:lid>")
def get_lineup(lid):
    l = Lineup.query.get_or_404(lid)
    return jsonify(_lineup_dict(l, with_items=True))


@api.delete("/lineups/<int:lid>")
@require_auth
def delete_lineup(lid):
    l = Lineup.query.get_or_404(lid)
    if l.user_id != request.user_id:
        return jsonify({"error": "Не твой состав"}), 403
    db.session.delete(l)
    db.session.commit()
    return jsonify({"ok": True})


def _lineup_dict(l, with_items=False):
    d = {"id": l.id, "title": l.title, "formation": l.formation,
         "match_id": l.match_id, "is_public": l.is_public,
         "likes_count": l.likes_count,
         "created_at": str(l.created_at),
         "author": l.user.username if l.user else None}
    if with_items:
        d["items"] = [
            {"id": it.id, "player_id": it.player_id,
             "role_label": it.role_label, "x": it.x, "y": it.y,
             "player": it.player.to_dict() if it.player else None}
            for it in l.items
        ]
    return d