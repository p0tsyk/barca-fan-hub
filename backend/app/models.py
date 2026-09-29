from .extensions import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    reputation = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())


class Source(db.Model):
    __tablename__ = "sources"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    source_type = db.Column(db.String(20), nullable=False)
    tier = db.Column(db.Integer, nullable=False)
    reliability_score = db.Column(db.Numeric(5, 2))
    description = db.Column(db.Text)

    def to_dict(self):
        return {"id": self.id, "name": self.name,
                "source_type": self.source_type, "tier": self.tier}


class Team(db.Model):
    __tablename__ = "teams"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    code = db.Column(db.String(10))
    country = db.Column(db.String(60))
    stadium = db.Column(db.String(120))


class PlayerPosition(db.Model):
    __tablename__ = "player_positions"
    player_id = db.Column(db.Integer,
                          db.ForeignKey("players.id", ondelete="CASCADE"),
                          primary_key=True)
    position_code = db.Column(db.String(10), primary_key=True)


class Player(db.Model):
    __tablename__ = "players"
    id = db.Column(db.Integer, primary_key=True)
    shirt_number = db.Column(db.Integer)
    name = db.Column(db.String(120), nullable=False)
    position_group = db.Column(db.String(10), nullable=False)
    nationality = db.Column(db.String(60))
    status = db.Column(db.String(20), nullable=False, default="available")
    photo_url = db.Column(db.Text)

    positions = db.relationship("PlayerPosition",
                                cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "shirt_number": self.shirt_number,
                "name": self.name, "position_group": self.position_group,
                "positions": [p.position_code for p in self.positions],
                "nationality": self.nationality, "status": self.status}


class Match(db.Model):
    __tablename__ = "matches"
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(50))
    competition = db.Column(db.String(80), nullable=False)
    home_team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    kickoff_at = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="scheduled")
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    home_team = db.relationship("Team", foreign_keys=[home_team_id])
    away_team = db.relationship("Team", foreign_keys=[away_team_id])

    def to_dict(self):
        return {"id": self.id, "competition": self.competition,
                "home_team": self.home_team.name,
                "away_team": self.away_team.name,
                "stadium": self.home_team.stadium,
                "kickoff_at": str(self.kickoff_at), "status": self.status,
                "home_score": self.home_score, "away_score": self.away_score}


class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    post_type = db.Column(db.String(20), nullable=False)
    source_id = db.Column(db.Integer, db.ForeignKey("sources.id"))
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"))
    status = db.Column(db.String(20), nullable=False, default="published")
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    source = db.relationship("Source")

    def to_dict(self):
        return {"id": self.id, "title": self.title, "content": self.content,
                "post_type": self.post_type, "status": self.status,
                "created_at": str(self.created_at),
                "source": self.source.to_dict() if self.source else None}


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"))
    parent_id = db.Column(db.Integer, db.ForeignKey("comments.id"))
    content = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())


class MatchVote(db.Model):
    __tablename__ = "match_votes"
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey("players.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    __table_args__ = (db.UniqueConstraint("match_id", "user_id", "player_id"),)


class Lineup(db.Model):
    __tablename__ = "lineups"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"))
    formation = db.Column(db.String(10), nullable=False, default="4-3-3")
    title = db.Column(db.String(120))
    is_public = db.Column(db.Boolean, nullable=False, default=True)
    likes_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())


class LineupItem(db.Model):
    __tablename__ = "lineup_items"
    id = db.Column(db.Integer, primary_key=True)
    lineup_id = db.Column(db.Integer,
                          db.ForeignKey("lineups.id", ondelete="CASCADE"),
                          nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey("players.id"), nullable=False)
    role_label = db.Column(db.String(10))
    x = db.Column(db.Integer, nullable=False)
    y = db.Column(db.Integer, nullable=False)
    __table_args__ = (db.UniqueConstraint("lineup_id", "player_id"),)


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(60))
    image_url = db.Column(db.Text)
    is_available = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "price": float(self.price),
                "category": self.category, "is_available": self.is_available}


class ProductVariant(db.Model):
    __tablename__ = "product_variants"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer,
                           db.ForeignKey("products.id", ondelete="CASCADE"),
                           nullable=False)
    size = db.Column(db.String(10), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)


class DeliveryRegion(db.Model):
    __tablename__ = "delivery_regions"
    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String(40), unique=True, nullable=False)
    base_price = db.Column(db.Numeric(10, 2), nullable=False)


class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="created")
    delivery_region_id = db.Column(db.Integer, db.ForeignKey("delivery_regions.id"))
    delivery_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    total_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    tracking_number = db.Column(db.String(60))
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer,
                         db.ForeignKey("orders.id", ondelete="CASCADE"),
                         nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey("product_variants.id"),
                           nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Numeric(10, 2), nullable=False)