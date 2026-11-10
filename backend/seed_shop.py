from app import create_app
from app.extensions import db
from app.models import DeliveryRegion, Product, ProductVariant

app = create_app()
with app.app_context():
    if ProductVariant.query.count() == 0:
        for p in Product.query.all():
            for i, size in enumerate(["S", "M", "L", "XL"]):
                db.session.add(ProductVariant(product_id=p.id, size=size,
                                              stock=10 + i * 5))
    if DeliveryRegion.query.count() == 0:
        for region, price in [("Новосибирск", 300), ("Москва", 500),
                              ("Санкт-Петербург", 450), ("Другой регион", 600)]:
            db.session.add(DeliveryRegion(region=region, base_price=price))
    db.session.commit()
    print("Shop seed:", ProductVariant.query.count(), "variants,",
          DeliveryRegion.query.count(), "regions")