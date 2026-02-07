# Backend Test Scripts

This directory contains scripts for testing and debugging the backend.

## test_backend.py

Comprehensive test script that verifies all backend components.

### Usage

```bash
# From the backend directory
cd backend
python scripts/test_backend.py

# Or from project root
python backend/scripts/test_backend.py
```

### What it tests:

1. **Database Connection** - Verifies PostgreSQL connection and initialization
2. **LLM Providers** - Tests OpenAI/Ollama connectivity and model availability
3. **Prompt Enhancer** - Tests prompt enhancement with actual LLM call
4. **Stable Diffusion Setup** - Verifies PyTorch, diffusers, and CUDA setup
5. **Image Generator** - Tests image generator agent initialization
6. **Validator** - Tests validation agent setup
7. **Workflow Orchestrator** - Tests template loading and orchestrator setup
8. **Full Workflow** (optional) - Runs a complete workflow end-to-end

### Prerequisites

- Docker services must be running (`make up`)
- Ollama models must be pulled (if using Ollama):
  ```bash
  make ollama-pull-models
  ```

### Example Output

```
============================================================
SigmaChain Backend Test Suite
============================================================

============================================================
Testing Database Connection...
============================================================
✓ Database initialized successfully
✓ Database connection working - Found 3 templates

============================================================
Testing LLM Providers...
============================================================
✓ LLM Provider initialized: ollama
✓ Ollama model 'llama2' is available
✓ Chat completion working: Hello, backend test!

...
```

### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

