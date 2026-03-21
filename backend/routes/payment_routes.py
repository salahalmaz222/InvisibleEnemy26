
from flask import Blueprint, request

payment_routes = Blueprint("payment_routes", __name__)

paid_users=set()

@payment_routes.route("/pay", methods=["POST"])
def pay():
    token=request.json.get("token")
    paid_users.add(token)
    return {"status":"paid"}
