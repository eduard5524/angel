# Angel

**Self-host your own AI models. Eliminate API costs.**

Angel lets you run powerful open-source language models on your own infrastructure and gives you a private, OpenAI-compatible inference endpoint.

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

```bash
# Install
pip install angel-ai

# Pull a model
angel pull deepseek-r1:7b

# Start serving
angel serve deepseek-r1:7b --port 8000
```

Your OpenAI-compatible endpoint is now live at `http://localhost:8000/v1`.

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
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

## Features

- **Zero API costs** — No per-token pricing, no rate limits, no surprise bills
- **Full data privacy** — Your data never leaves your infrastructure
- **OpenAI-compatible API** — Drop-in replacement; no code changes needed
- **Multi-GPU support** — Automatic tensor parallelism for large models
- **Low latency** — No network hops to external APIs
- **Fully customizable** — Fine-tune models, adjust parameters, configure inference

## Requirements

- Python 3.10+
- NVIDIA GPU with CUDA 12.1+ (compute capability 7.0+)
- 16 GB+ RAM (model-dependent)
- Linux (Ubuntu 22.04+ recommended) or WSL2

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
