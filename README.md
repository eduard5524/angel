# Angel

**Self-host your own AI models. Eliminate API costs.**

Angel lets you run powerful open-source language models on your own infrastructure and gives you a private, OpenAI-compatible inference endpoint — plus a web UI with login, chat, model management, and usage dashboard.

## Supported Models

| Model | Parameters | Context | Best For |
|-------|-----------|---------|----------|
| **DeepSeek** | 7B – 671B (MoE) | 128K | Reasoning, math, code |
| **Qwen** | 0.5B – 72B | 128K | Multilingual, general tasks |
| **Llama** | 8B – 405B | 128K | General purpose, chat |
| **Mistral** | 7B – 8x22B (MoE) | 32K | Fast inference, efficiency |
| **Code Llama** | 7B – 70B | 100K | Code generation, debugging |

## Infrastructure

Run on the hardware that works best for you:

- **Azure GPU VMs** — NC, ND, NV-series with A100, H100, T4
- **DigitalOcean GPU Droplets** — H100 with simple flat pricing
- **Your own server** — Any Linux machine with an NVIDIA GPU
- **Multi-GPU workstation** — Tensor parallelism across multiple GPUs

## Quick Start

### 1. Start an inference backend

You need an OpenAI-compatible or Ollama inference server running. For example, with [Ollama](https://ollama.ai):

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull and run a model
ollama pull deepseek-r1:7b
ollama serve
```

### 2. Run the Angel web app

```bash
# Clone and install
git clone https://github.com/eduard5524/angel.git
cd angel
pip install -r requirements.txt

# Point to your inference backend (Ollama default: http://localhost:11434)
export ANGEL_INFERENCE_URL=http://localhost:11434

# Start the app
python run.py
```

Open `http://localhost:5000` in your browser, register an account, and start chatting.

### 3. Use the API directly

Your inference backend also exposes an OpenAI-compatible API:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="deepseek-r1:7b",
    messages=[
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ]
)

print(response.choices[0].message.content)
```

## Web App Features

The Angel web app (`app/`) provides a full-featured interface for your self-hosted models:

- **Authentication** — Register and login; first user automatically becomes admin
- **Chat** — Create conversations, pick models, chat with your self-hosted AI
- **Model Management** — Browse available models, see which are running, pull new models (admin)
- **Dashboard** — Track usage stats (conversations, messages, tokens), model usage breakdown, admin overview of all users

### Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `ANGEL_INFERENCE_URL` | Inference backend URL (Ollama or OpenAI-compatible) | `http://localhost:11434` |
| `ANGEL_SECRET_KEY` | Flask session secret key | `change-me-in-production` |
| `ANGEL_DATABASE_URL` | SQLAlchemy database URI | `sqlite:///angel.db` |

### Production Deployment

```bash
# With gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## Features

- **Zero API costs** — No per-token pricing, no rate limits, no surprise bills
- **Full data privacy** — Your data never leaves your infrastructure
- **OpenAI-compatible API** — Drop-in replacement; no code changes needed
- **Multi-GPU support** — Automatic tensor parallelism for large models
- **Low latency** — No network hops to external APIs
- **Fully customizable** — Fine-tune models, adjust parameters, configure inference
- **Web UI with login** — Chat, manage models, and track usage from the browser

## Requirements

- Python 3.10+
- NVIDIA GPU with CUDA 12.1+ (compute capability 7.0+)
- 16 GB+ RAM (model-dependent)
- Linux (Ubuntu 22.04+ recommended) or WSL2

## Project Structure

```
angel/
├── index.html              # Landing page
├── docs/index.html         # Documentation
├── css/style.css           # Landing page styles
├── js/main.js              # Landing page scripts
├── run.py                  # App entry point
├── requirements.txt        # Python dependencies
└── app/
    ├── __init__.py          # Flask app factory
    ├── models/user.py       # User, Conversation, Message models
    ├── routes/
    │   ├── auth.py          # Login, register, logout
    │   ├── chat.py          # Chat interface and message handling
    │   ├── dashboard.py     # Usage stats and admin dashboard
    │   └── models_mgmt.py   # Model listing and pulling
    ├── static/
    │   ├── css/app.css      # App styles (dark theme)
    │   └── js/chat.js       # Chat interactivity
    └── templates/           # Jinja2 HTML templates
```

## Documentation

Full documentation is available at [`docs/index.html`](docs/index.html), covering:

- Installation & configuration
- Model reference (parameters, VRAM, context length)
- Infrastructure setup guides (Azure, DigitalOcean, own server, multi-GPU)
- OpenAI-compatible API reference
- Quantization, performance tuning, monitoring
- Troubleshooting

## CLI Reference

```bash
angel pull <model>            # Download a model
angel serve <model>           # Start inference server
angel list                    # List downloaded models
angel list --remote           # List available models
angel rm <model>              # Remove a model
angel doctor                  # Check system requirements
angel benchmark <model>       # Run performance benchmarks
angel dashboard               # Launch monitoring dashboard
```

## License

MIT
