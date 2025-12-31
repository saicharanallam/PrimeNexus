# SigmaChain - Agentic Image Generation Tool

An intelligent agentic system that enhances prompts, generates images locally, and validates anatomical correctness through a multi-agent workflow.

## 🎯 What is This?

This is a **learning project** that demonstrates how **agentic AI systems** work. It shows:
- How multiple AI agents work together
- How to orchestrate agent workflows
- How to build extensible AI systems
- How prompt engineering enhances results
- How to validate AI-generated content
- How to run AI models locally without cloud services

## 🏗️ Architecture

### Backend (FastAPI)
- **Workflow Orchestrator**: Manages multi-agent pipeline
- **Prompt Enhancement Agent**: Enhances user prompts with technical details (GPT-4)
- **Image Generation Agent**: Generates images locally using Stable Diffusion
- **Validation Agent**: Checks anatomical correctness and image quality (GPT-4 Vision)

### Frontend (Next.js)
- Modern React-based UI
- Real-time workflow visualization
- Image display and feedback

### Agentic Workflow
```
User Input → Prompt Enhancement → Local Image Generation → Validation → Result
```

## ✨ Features

- 🤖 **Multi-agent orchestration**: See how agents work together
- 🎨 **Intelligent prompt engineering**: Automatic prompt enhancement
- 🖼️ **Local image generation**: Runs Stable Diffusion locally (no cloud services)
- ✅ **Anatomical validation**: Quality and correctness checks
- 🐳 **Docker support**: Easy deployment with Docker Compose
- 🔄 **Extensible workflow system**: Easy to add new agents
- 🎯 **Learning-focused**: Clear code structure and documentation
- 🚀 **GPU acceleration**: Optional CUDA support for faster generation

## 🚀 Quick Start

### Option 1: Docker (Recommended for Ubuntu 24)

The easiest way to run SigmaChain is using Docker Compose:

```bash
# 1. Create .env file with your OpenAI API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 2. Start services
docker compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

**Note**: Use `docker compose` (with space) - this is Docker Compose V2 syntax.

**Note**: The first run will download the Stable Diffusion model (several GB), which may take 10-20 minutes depending on your internet connection.

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker setup instructions.

### Option 2: Local Development

#### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key
- CUDA-enabled GPU (optional, but recommended for faster image generation)
- 8GB+ RAM (16GB+ recommended)

#### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Create .env file with your API keys
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:3000
```

See [SETUP.md](SETUP.md) for detailed local setup instructions.

## 📚 Learning Resources

### How Agentic Tools Work

1. **Agent Specialization**: Each agent has a specific role
   - Prompt Enhancer: Improves prompts using GPT-4
   - Image Generator: Creates images using local Stable Diffusion
   - Validator: Checks quality using GPT-4 Vision

2. **Workflow Orchestration**: The orchestrator manages the flow
   - Passes data between agents
   - Handles errors
   - Tracks state

3. **Extensibility**: Easy to add new agents
   - See `agents/example_custom_agent.py`
   - Inherit from `BaseAgent`
   - Add to orchestrator

### Key Concepts

- **Agentic Pattern**: Specialized components working together
- **Pipeline Processing**: Sequential agent execution
- **State Management**: Data flowing through the pipeline
- **Error Handling**: Graceful failure handling
- **Observability**: Workflow step tracking
- **Local AI**: Running models without cloud dependencies

## 📖 Documentation

- [SETUP.md](SETUP.md) - Detailed local setup instructions
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker setup for Ubuntu 24
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture documentation
- [ARCHITECTURE_CHOICES.md](ARCHITECTURE_CHOICES.md) - Design decisions
- [backend/agents/example_custom_agent.py](backend/agents/example_custom_agent.py) - Example custom agent

## 🔧 Adding New Agents

1. Create a new agent class inheriting from `BaseAgent`
2. Implement the `process()` method
3. Add the agent to the orchestrator in `workflow/orchestrator.py`
4. The system automatically handles the new workflow step

See `backend/agents/example_custom_agent.py` for a complete example.

## 🎓 What You'll Learn

- How to build agentic AI systems
- How to orchestrate multi-agent workflows
- How to run Stable Diffusion locally
- How to validate AI-generated content
- How to build extensible AI applications
- How to create modern React UIs for AI tools
- How to Dockerize AI applications

## 🐳 Docker Features

- **Multi-stage builds** for optimized image sizes
- **Volume persistence** for generated images and model cache
- **Health checks** for service monitoring
- **GPU support** (optional) for accelerated generation
- **Hot reload** support for development

## ⚡ Performance

- **CPU Mode**: ~30-60 seconds per image (512x512)
- **GPU Mode**: ~5-10 seconds per image (512x512)
- **Model Loading**: First load takes ~30 seconds, subsequent loads are cached

## 🤝 Contributing

This is a learning project! Feel free to:
- Add new agents
- Improve existing agents
- Enhance the UI
- Add new features
- Fix bugs
- Optimize performance

## 📝 License

This project is for educational purposes.

## 🆘 Troubleshooting

### Model Download Issues
- The Stable Diffusion model is downloaded on first run
- Ensure you have sufficient disk space (5GB+)
- Check your internet connection

### Out of Memory
- Reduce image resolution in `backend/agents/image_generator.py`
- Use a smaller model
- Increase Docker memory limits

### Slow Generation
- Enable GPU support (see DOCKER_SETUP.md)
- Reduce image resolution
- Use fewer inference steps

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for more troubleshooting tips.
