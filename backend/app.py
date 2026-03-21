
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.ai_routes import ai_routes
from routes.payment_routes import payment_routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(ai_routes)
app.register_blueprint(payment_routes)

@app.route("/")
def home():
    return {"platform":"Ultra AI Tutor Platform Running"}

if __name__ == "__main__":
    app.run(port=5000)
