.PHONY: build destroy frontend logs backend up down restart ollama-pull-models ollama-list test-backend

# Build all images
build:
	docker compose build

# Stop and remove all services
destroy:
	docker compose down

# Alias for destroy
down:
	docker compose down

up:
	docker compose up -d

restart:
	docker compose down
	docker compose up -d

# Rebuild frontend and start all services
frontend:
	docker compose build frontend
	docker compose up -d

# Rebuild backend and start all services
backend:
	docker compose build backend
	docker compose up -d

# View logs for all services (follow mode)
logs:
	docker compose logs -f

# Pull required Ollama models
ollama-pull-models:
	@echo "Pulling Ollama models (this may take a while)..."
	docker exec sigmachain-ollama ollama pull llama2 || echo "Failed to pull llama2"
	docker exec sigmachain-ollama ollama pull llava || echo "Failed to pull llava"
	@echo "Models pulled! Check with: docker exec sigmachain-ollama ollama list"

# List Ollama models
ollama-list:
	docker exec sigmachain-ollama ollama list

# Test backend services
test:
	docker exec sigmachain-backend python scripts/test_backend.py
