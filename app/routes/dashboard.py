from flask import Blueprint, render_template
from flask_login import current_user, login_required
from sqlalchemy import func

from app import db
from app.models.user import Conversation, Message, User

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard")
@login_required
def index():
    if current_user.is_admin:
        stats = _admin_stats()
    else:
        stats = _user_stats(current_user.id)

    return render_template("dashboard/index.html", stats=stats, is_admin=current_user.is_admin)


def _user_stats(user_id):
    total_conversations = Conversation.query.filter_by(user_id=user_id).count()
    total_messages = (
        db.session.query(func.count(Message.id))
        .join(Conversation)
        .filter(Conversation.user_id == user_id)
        .scalar()
    ) or 0
    total_tokens = (
        db.session.query(func.sum(Message.tokens_used))
        .join(Conversation)
        .filter(Conversation.user_id == user_id)
        .scalar()
    ) or 0

    models_used = (
        db.session.query(Conversation.model_name, func.count(Conversation.id))
        .filter(Conversation.user_id == user_id)
        .group_by(Conversation.model_name)
        .all()
    )

    recent = (
        Conversation.query.filter_by(user_id=user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_tokens": total_tokens,
        "models_used": models_used,
        "recent_conversations": recent,
    }


def _admin_stats():
    total_users = User.query.count()
    total_conversations = Conversation.query.count()
    total_messages = db.session.query(func.count(Message.id)).scalar() or 0
    total_tokens = db.session.query(func.sum(Message.tokens_used)).scalar() or 0

    models_used = (
        db.session.query(Conversation.model_name, func.count(Conversation.id))
        .group_by(Conversation.model_name)
        .all()
    )

    top_users = (
        db.session.query(User.username, func.count(Conversation.id))
        .join(Conversation, User.id == Conversation.user_id)
        .group_by(User.username)
        .order_by(func.count(Conversation.id).desc())
        .limit(10)
        .all()
    )

    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_tokens": total_tokens,
        "models_used": models_used,
        "top_users": top_users,
        "recent_users": recent_users,
    }
