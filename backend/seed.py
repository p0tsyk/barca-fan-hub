from datetime import datetime, timezone

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import (DeliveryRegion, Match, Player, PlayerPosition, Post,
                        Product, ProductVariant, Source, Team, User)

app = create_app()

SOURCES = [
    ("Official Website", "official", 1, 99.0),
    ("Fabrizio Romano", "journalist", 1, 95.0),
    ("Mundo Deportivo", "media", 2, 80.0),
    ("Gerard Romero", "journalist", 3, 65.0),
    ("Jota Jordi", "journalist", 4, 45.0),
    ("Unverified forum", "media", 5, 15.0),
]

TEAMS = [
    ("FC Barcelona", "BAR", "Spain", "Spotify Camp Nou"),
    ("Getafe", "GET", "Spain", "Coliseum Alfonso Pérez"),
    ("Sevilla", "SEV", "Spain", "Ramon Sanchez Pizjuan"),
    ("Racing Club", "RAC", "Spain", "El Sardinero"),
    ("Levante", "LEV", "Spain", "Ciudad de Valencia"),
    ("Feyenoord", "FEY", "Netherlands", "De Kuip"),
    ("Galatasaray", "GAL", "Turkey", "Rams Park"),
]

REGIONS = [("Europe", 9.0), ("CIS", 14.0), ("North America", 19.0),
           ("South America", 19.0), ("Asia", 22.0)]

# (номер, имя, группа, страна, статус, [позиции])
PLAYERS = [
    (13, "Wojciech Szczęsny", "GK", "Poland", "available", ["GK"]),
    (1, "Joan García", "GK", "Spain", "injured", ["GK"]),
    (25, "Dominik Livaković", "GK", "Croatia", "available", ["GK"]),
    (35, "Iker Rodríguez", "GK", "Spain", "available", ["GK"]),
    (2, "João Cancelo", "DEF", "Portugal", "available", ["DR", "DL"]),
    (3, "Alejandro Balde", "DEF", "Spain", "available", ["DL"]),
    (5, "Pau Cubarsí", "DEF", "Spain", "available", ["DC"]),
    (12, "Xavi Espart", "DEF", "Spain", "available", ["DR"]),
    (15, "Andreas Christensen", "DEF", "Denmark", "injured", ["DC"]),
    (18, "Gerard Martín", "DEF", "Spain", "available", ["DL", "DC"]),
    (23, "Jules Koundé", "DEF", "France", "available", ["DR"]),
    (24, "Eric García", "DEF", "Spain", "injured", ["DC", "DR", "MC"]),
    (33, "Jordi Pesquer", "DEF", "Spain", "available", ["DL"]),
    (4, "Brian Fariñas", "MID", "Spain", "available", ["MC"]),
    (6, "Gavi", "MID", "Spain", "available", ["MC", "LW"]),
    (7, "Fermín López", "MID", "Spain", "available", ["AM", "MC"]),
    (8, "Pedri", "MID", "Spain", "available", ["MC", "CM"]),
    (10, "Lamine Yamal", "MID", "Spain", "available", ["RW"]),
    (11, "Raphinha", "MID", "Brazil", "available", ["LW"]),
    (16, "Rodri", "MID", "Spain", "available", ["DM", "MC"]),
    (20, "Dani Olmo", "MID", "Spain", "available", ["AM", "MC"]),
    (21, "Frenkie de Jong", "MID", "Netherlands", "injured", ["MC", "CM"]),
    (22, "Marc Bernal", "MID", "Spain", "available", ["MC", "DM"]),
    (74, "Jesse Bisiwu", "MID", "Belgium", "available", ["LW"]),
    (9, "Gabriel Jesus", "FWD", "Brazil", "available", ["ST"]),
    (14, "Karim Adeyemi", "FWD", "Germany", "available", ["RW", "LW", "AM"]),
    (17, "Anthony Gordon", "FWD", "England", "available", ["LW"]),
    (19, "Roony Bardghji", "FWD", "Sweden", "injured", ["RW"]),
    (29, "Hamza Abdelkarim", "FWD", "Egypt", "available", ["ST"]),
]

MATCHES = [
    ("UCL", "Galatasaray", "FC Barcelona", "2026-10-14 21:00", "scheduled", None, None),
    ("La Liga", "FC Barcelona", "Getafe", "2026-10-10 18:30", "scheduled", None, None),
    ("La Liga", "Sevilla", "FC Barcelona", "2026-09-19 21:00", "finished", 1, 3),
    ("La Liga", "FC Barcelona", "Racing Club", "2026-09-16 21:30", "finished", 7, 2),
    ("La Liga", "Levante", "FC Barcelona", "2026-09-13 16:15", "finished", 2, 4),
    ("UCL", "FC Barcelona", "Feyenoord", "2026-09-09 18:45", "finished", 5, 1),
]

POSTS = [
    ("Matchday squad announced for Camp Nou clash", "official", 0),
    ("Marc Bernal has agreed to sign a new long-term contract", "insider", 1),
    ("Club monitors CB targets for January window", "insider", 3),
    ("Yamal returns to full training ahead of weekend", "insider", 2),
    ("Rumor: surprise striker bid rejected by board", "insider", 5),
    ("Barcelona will attempt to sign Alvarez in January", "insider", 4),
]

PRODUCTS = [
    ("Home Kit 2026/27", "Kits", 99.99, ["S", "M", "L", "XL"]),
    ("Away Kit 2026/27", "Kits", 99.99, ["S", "M", "L"]),
    ("Fan Scarf", "Accessories", 24.99, ["One size"]),
    ("Ceramic Mug", "Souvenirs", 14.99, ["One size"]),
]

with app.app_context():
    if User.query.first():
        print("База уже заполнена — выходим.")
        raise SystemExit

    admin = User(username="admin", email="admin@fanhub.dev",
                 password_hash=generate_password_hash("admin123"), role="admin")
    fan = User(username="cule_fan", email="fan@fanhub.dev",
               password_hash=generate_password_hash("fan123"), role="user")
    db.session.add_all([admin, fan])

    sources = [Source(name=n, source_type=t, tier=tier, reliability_score=s)
               for n, t, tier, s in SOURCES]
    db.session.add_all(sources)

    teams = [Team(name=n, code=c, country=co, stadium=s)
             for n, c, co, s in TEAMS]
    db.session.add_all(teams)
    db.session.add_all([DeliveryRegion(region=r, base_price=p)
                        for r, p in REGIONS])
    db.session.flush()
    team_id = {t.name: t.id for t in teams}

    players = [Player(shirt_number=n, name=name, position_group=g,
                      nationality=nat, status=st)
               for n, name, g, nat, st, _ in PLAYERS]
    db.session.add_all(players)
    db.session.flush()
    for row, p in zip(PLAYERS, players):
        for code in row[5]:
            db.session.add(PlayerPosition(player_id=p.id, position_code=code))

    matches = [Match(competition=c,
                     home_team_id=team_id[h], away_team_id=team_id[a],
                     kickoff_at=datetime.fromisoformat(dt).replace(tzinfo=timezone.utc),
                     status=st, home_score=hs, away_score=as_)
               for c, h, a, dt, st, hs, as_ in MATCHES]
    db.session.add_all(matches)
    db.session.flush()

    for i, (title, ptype, src_idx) in enumerate(POSTS):
        db.session.add(Post(title=title, content=f"Content of news #{i + 1}.",
                            post_type=ptype, source_id=sources[src_idx].id,
                            author_id=admin.id))

    for name, category, price, sizes in PRODUCTS:
        product = Product(name=name, category=category, price=price)
        db.session.add(product)
        db.session.flush()
        for size in sizes:
            db.session.add(ProductVariant(product_id=product.id, size=size, stock=25))

    db.session.commit()
    print("Seed готово:",
          User.query.count(), "users,",
          Team.query.count(), "teams,",
          Player.query.count(), "players,",
          Post.query.count(), "posts,",
          Match.query.count(), "matches,",
          Product.query.count(), "products.")