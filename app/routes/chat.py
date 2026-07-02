from datetime import datetime, timezone

import requests
from flask import Blueprint, current_app, jsonify, render_template, request
from flask_login import current_user, login_required

from app import db
from app.models.user import Conversation, Message

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/")
@login_required
def index():
    conversations = (
        Conversation.query.filter_by(user_id=current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return render_template("chat/index.html", conversations=conversations)


@chat_bp.route("/chat/new", methods=["POST"])
@login_required
def new_conversation():
    model = request.json.get("model", "deepseek-r1:7b")
    conv = Conversation(user_id=current_user.id, model_name=model, title="New conversation")
    db.session.add(conv)
    db.session.commit()
    return jsonify({"id": conv.id, "model": conv.model_name})


@chat_bp.route("/chat/<int:conv_id>")
@login_required
def conversation(conv_id):
    conv = Conversation.query.get_or_404(conv_id)
    if conv.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    conversations = (
        Conversation.query.filter_by(user_id=current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return render_template("chat/index.html", conversations=conversations, active_conv=conv)


@chat_bp.route("/chat/<int:conv_id>/send", methods=["POST"])
@login_required
def send_message(conv_id):
    conv = Conversation.query.get_or_404(conv_id)
    if conv.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    user_content = request.json.get("message", "").strip()
    if not user_content:
        return jsonify({"error": "Empty message"}), 400

    user_msg = Message(conversation_id=conv.id, role="user", content=user_content)
    db.session.add(user_msg)

    if conv.title == "New conversation":
        conv.title = user_content[:80]

    history = []
    for msg in conv.messages:
        history.append({"role": msg.role, "content": msg.content})
    history.append({"role": "user", "content": user_content})

    inference_url = current_app.config["INFERENCE_URL"]
    assistant_content = _call_inference(inference_url, conv.model_name, history)

    tokens = len(assistant_content.split())
    assistant_msg = Message(
        conversation_id=conv.id, role="assistant", content=assistant_content, tokens_used=tokens
    )
    db.session.add(assistant_msg)

    conv.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(
        {
            "reply": assistant_content,
            "tokens": tokens,
            "title": conv.title,
        }
    )


@chat_bp.route("/chat/<int:conv_id>/delete", methods=["POST"])
@login_required
def delete_conversation(conv_id):
    conv = Conversation.query.get_or_404(conv_id)
    if conv.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    Message.query.filter_by(conversation_id=conv.id).delete()
    db.session.delete(conv)
    db.session.commit()
    return jsonify({"ok": True})


def _call_inference(base_url, model, messages):
    """Call the inference backend (OpenAI-compatible or Ollama)."""
    # Try OpenAI-compatible endpoint first
    openai_url = f"{base_url}/v1/chat/completions"
    ollama_url = f"{base_url}/api/chat"

    payload_openai = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    try:
        resp = requests.post(openai_url, json=payload_openai, timeout=120)
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except requests.RequestException:
        pass

    # Fallback to Ollama-style endpoint
    payload_ollama = {
        "model": model,
        "messages": messages,
        "stream": False,
    }

    try:
        resp = requests.post(ollama_url, json=payload_ollama, timeout=120)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("message", {}).get("content", "No response from model.")
    except requests.RequestException:
        pass

    return (
        "Could not reach the inference server. "
        "Make sure your model server is running at "
        f"`{base_url}`. See the docs for setup instructions."
    )
