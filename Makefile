.PHONY: build destroy frontend core-api rust-service logs up down restart ollama-pull-models ollama-list test clean-containers dev dev-up dev-down migrate

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

# Rebuild core-api and start all services
core-api:
	docker compose build core-api
	docker compose up -d

# Alias for backward compatibility
backend: core-api

# Rebuild rust-service and start all services
rust-service:
	docker compose build rust-service
	docker compose up -d rust-service

# View logs for all services (follow mode)
logs:
	docker compose logs -f

# View logs for specific service (follow mode)
logs-core-api:
	docker compose logs -f core-api

# Alias for backward compatibility
logs-backend: logs-core-api

logs-rust-service:
	docker compose logs -f rust-service

logs-frontend:
	docker compose logs -f frontend

logs-ollama:
	docker compose logs -f ollama

# View logs without Ollama verbose model loading
logs-clean:
	docker compose logs -f --tail=100 | grep -v "llama_model_loader\|llama_context\|print_info\|load_tensors"

# Pull required Ollama models
ollama-pull-models:
	@echo "Pulling Ollama models (this may take a while)..."
	docker exec sigmachain-ollama ollama pull llama2 || echo "Failed to pull llama2"
	docker exec sigmachain-ollama ollama pull llava || echo "Failed to pull llava"
	@echo "Models pulled! Check with: docker exec sigmachain-ollama ollama list"

# List Ollama models
ollama-list:
	docker exec sigmachain-ollama ollama list

# Pull faster/smaller models for better performance
ollama-pull-fast:
	@echo "Pulling faster models..."
	docker exec sigmachain-ollama ollama pull phi3:mini || echo "Failed to pull phi3:mini"
	docker exec sigmachain-ollama ollama pull mistral:7b-instruct || echo "Failed to pull mistral:7b-instruct"
	@echo "Fast models pulled! Update OLLAMA_MODEL in docker-compose.yml to use them"

# Check Ollama resource usage
ollama-stats:
	docker stats sigmachain-ollama --no-stream

# Test core-api services
test:
	docker exec sigmachain-core-api python scripts/test_backend.py

# Run database migration to add user fields
migrate:
	@echo "Running database migration to add user fields..."
	docker exec sigmachain-core-api python scripts/apply_user_fields_migration.py
	@echo "Migration completed!"

# Remove all Docker containers (running and stopped)
clean-containers:
	@echo "Removing all Docker containers..."
	@if [ -n "$$(docker ps -aq)" ]; then docker rm -f $$(docker ps -aq); else echo "No containers to remove"; fi

# Development mode commands
# Build and start development frontend (with hot reload)
# Stops production frontend to avoid port conflicts
dev:
	docker compose stop frontend || true
	docker compose build frontend-dev
	docker compose --profile dev up -d

# Start development frontend (assumes already built)
# Stops production frontend to avoid port conflicts
dev-up:
	docker compose stop frontend || true
	docker compose --profile dev up -d

# Stop development frontend
dev-down:
	docker compose stop frontend-dev

# View development frontend logs
logs-frontend-dev:
	docker compose logs -f frontend-dev

# Build everything from scratch (useful after major changes)
build-all:
	docker compose build --no-cache

# Start all services including rust-service
up-all:
	docker compose up -d

# Check status of all services
status:
	docker compose ps

# Restart a specific service
restart-core-api:
	docker compose restart core-api

restart-rust-service:
	docker compose restart rust-service

restart-frontend:
	docker compose restart frontend
