
from flask import Blueprint, jsonify
from ai.tutor_engine import tutor_response

ai_routes = Blueprint("ai_routes", __name__)

@ai_routes.route("/ai/<topic>")
def ai(topic):
    return jsonify({"response": tutor_response(topic)})
