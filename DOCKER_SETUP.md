# Docker Setup Guide for Ubuntu 24

This guide explains how to run SigmaChain using Docker on Ubuntu 24.

## Prerequisites

1. **Docker** (version 20.10 or higher)
2. **Docker Compose V2** (included with Docker Desktop and newer Docker installations)
3. **OpenAI API Key** (for prompt enhancement and validation)

## Installation

### 1. Install Docker

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

### 2. Verify Installation

```bash
docker --version
docker compose version
```

**Note**: Docker Compose V2 is included with Docker. Use `docker compose` (with space) instead of `docker-compose` (with hyphen).

## Setup

### 1. Clone or Navigate to Project Directory

```bash
cd /path/to/SigmaChain
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:3000
```

### 3. Create Required Directories

```bash
mkdir -p backend/generated_images
```

## Running with Docker Compose

### Start Services

```bash
docker compose up -d
```

This will:
- Build the backend and frontend Docker images
- Start both services
- Download the Stable Diffusion model on first run (this may take several minutes)

### View Logs

```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend
```

### Stop Services

```bash
docker compose down
```

### Stop and Remove Volumes

```bash
docker compose down -v
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## GPU Support (Optional)

If you have an NVIDIA GPU and want to accelerate image generation:

### 1. Install NVIDIA Container Toolkit

```bash
# Add NVIDIA package repositories
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install nvidia-container-toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker
```

### 2. Update docker-compose.yml

Uncomment the GPU configuration in `docker-compose.yml`:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### 3. Update Backend Dockerfile

For GPU support, use a CUDA-enabled base image in `backend/Dockerfile`:

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
# ... rest of Dockerfile
```

## Troubleshooting

### Model Download Takes Too Long

The first time you run the application, it will download the Stable Diffusion model (several GB). This is normal and only happens once. The model is cached in a Docker volume.

### Out of Memory Errors

If you encounter out of memory errors:

1. **Reduce image resolution** in `backend/agents/image_generator.py`:
   ```python
   width=512,  # Reduce from 1024
   height=512,  # Reduce from 1024
   ```

2. **Use a smaller model** in `backend/workflow/orchestrator.py`:
   ```python
   model_name="runwayml/stable-diffusion-v1-5"  # Smaller than SDXL
   ```

3. **Increase Docker memory limit** in Docker Desktop settings (if using Docker Desktop)

### Port Already in Use

If ports 3000 or 8000 are already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change frontend port
  - "8001:8000"  # Change backend port
```

### Permission Errors

If you encounter permission errors with generated images:

```bash
sudo chown -R $USER:$USER backend/generated_images
```

### View Container Status

```bash
docker compose ps
```

### Restart a Specific Service

```bash
docker compose restart backend
docker compose restart frontend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker compose up -d --build

# Or rebuild a specific service
docker compose up -d --build backend
```

## Data Persistence

- **Generated Images**: Stored in `backend/generated_images/` (persisted via volume)
- **Model Cache**: Stored in Docker volume `huggingface_cache` (persisted)

## Performance Tips

1. **Use GPU**: Significantly speeds up image generation
2. **Model Caching**: Models are cached in volumes, so subsequent starts are faster
3. **Resource Allocation**: Allocate sufficient RAM (8GB+ recommended)
4. **SSD Storage**: Use SSD for better I/O performance

## Cleanup

### Remove All Containers and Volumes

```bash
docker compose down -v
docker system prune -a
```

### Remove Only Generated Images

```bash
rm -rf backend/generated_images/*
```

## Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Set up reverse proxy (nginx, traefik)
3. Enable HTTPS
4. Configure resource limits
5. Set up monitoring and logging
6. Use Docker secrets for API keys
7. Configure backup for generated images

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

