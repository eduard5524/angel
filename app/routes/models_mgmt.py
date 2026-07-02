import requests
from flask import Blueprint, current_app, jsonify, render_template
from flask_login import current_user, login_required

models_bp = Blueprint("models_mgmt", __name__)

AVAILABLE_MODELS = [
    {
        "id": "deepseek-r1:7b",
        "name": "DeepSeek R1 7B",
        "family": "DeepSeek",
        "parameters": "7B",
        "vram": "~6 GB",
        "context": "128K",
        "description": "Reasoning and coding with chain-of-thought.",
    },
    {
        "id": "deepseek-r1:32b",
        "name": "DeepSeek R1 32B",
        "family": "DeepSeek",
        "parameters": "32B",
        "vram": "~24 GB",
        "context": "128K",
        "description": "Larger reasoning model for complex tasks.",
    },
    {
        "id": "qwen2.5:7b",
        "name": "Qwen 2.5 7B",
        "family": "Qwen",
        "parameters": "7B",
        "vram": "~6 GB",
        "context": "128K",
        "description": "Multilingual general-purpose model.",
    },
    {
        "id": "qwen2.5:32b",
        "name": "Qwen 2.5 32B",
        "family": "Qwen",
        "parameters": "32B",
        "vram": "~24 GB",
        "context": "128K",
        "description": "Larger Qwen for advanced multilingual tasks.",
    },
    {
        "id": "llama3.3:8b",
        "name": "Llama 3.3 8B",
        "family": "Llama",
        "parameters": "8B",
        "vram": "~6 GB",
        "context": "128K",
        "description": "Meta's general-purpose open model.",
    },
    {
        "id": "llama3.3:70b",
        "name": "Llama 3.3 70B",
        "family": "Llama",
        "parameters": "70B",
        "vram": "~48 GB",
        "context": "128K",
        "description": "Large Llama model for demanding tasks.",
    },
    {
        "id": "mistral:7b",
        "name": "Mistral 7B",
        "family": "Mistral",
        "parameters": "7B",
        "vram": "~6 GB",
        "context": "32K",
        "description": "Efficient, fast inference model.",
    },
    {
        "id": "mixtral:8x7b",
        "name": "Mixtral 8x7B",
        "family": "Mistral",
        "parameters": "8x7B MoE",
        "vram": "~26 GB",
        "context": "32K",
        "description": "Mixture-of-Experts for balanced performance.",
    },
    {
        "id": "codellama:7b",
        "name": "Code Llama 7B",
        "family": "Code Llama",
        "parameters": "7B",
        "vram": "~6 GB",
        "context": "100K",
        "description": "Specialized for code generation and debugging.",
    },
    {
        "id": "codellama:34b",
        "name": "Code Llama 34B",
        "family": "Code Llama",
        "parameters": "34B",
        "vram": "~24 GB",
        "context": "100K",
        "description": "Larger code model for complex programming tasks.",
    },
]


@models_bp.route("/models")
@login_required
def index():
    running = _get_running_models()
    return render_template("models/index.html", available=AVAILABLE_MODELS, running=running)


@models_bp.route("/models/running")
@login_required
def running_models():
    return jsonify(_get_running_models())


@models_bp.route("/models/pull/<model_id>", methods=["POST"])
@login_required
def pull_model(model_id):
    if not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    inference_url = current_app.config["INFERENCE_URL"]

    # Try Ollama pull
    try:
        resp = requests.post(
            f"{inference_url}/api/pull",
            json={"name": model_id, "stream": False},
            timeout=600,
        )
        if resp.status_code == 200:
            return jsonify({"ok": True, "message": f"Model {model_id} pulled successfully."})
    except requests.RequestException:
        pass

    return jsonify(
        {
            "ok": False,
            "message": (
                f"Could not pull {model_id}. "
                "Ensure Ollama or your model server is running."
            ),
        }
    )


def _get_running_models():
    """Query the inference backend for available models."""
    inference_url = current_app.config["INFERENCE_URL"]

    # Try OpenAI-compatible
    try:
        resp = requests.get(f"{inference_url}/v1/models", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return [m.get("id", m.get("name", "unknown")) for m in data.get("data", [])]
    except requests.RequestException:
        pass

    # Try Ollama
    try:
        resp = requests.get(f"{inference_url}/api/tags", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return [m["name"] for m in data.get("models", [])]
    except requests.RequestException:
        pass

    return []
