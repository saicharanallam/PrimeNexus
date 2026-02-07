# Rust Service

High-performance microservice for complex computations, starting with Mandelbrot Set generation.

## Features

- **Mandelbrot Set Generator**: Fast, parallel computation of Mandelbrot fractals
- **Health Check Endpoint**: Service status monitoring
- **REST API**: Simple HTTP endpoints for integration

## Endpoints

### Health Check
```
GET /health
Response: {"status": "healthy", "service": "rust-service"}
```

### Mandelbrot Set Generation
```
GET /api/mandelbrot?width=800&height=600&zoom=1.0&center_x=0.0&center_y=0.0&max_iterations=100
Response: image/png (binary)
```

**Query Parameters:**
- `width` (optional, default: 800): Image width (1-4096)
- `height` (optional, default: 600): Image height (1-4096)
- `zoom` (optional, default: 1.0): Zoom level (0.1-1e10)
- `center_x` (optional, default: 0.0): X coordinate center
- `center_y` (optional, default: 0.0): Y coordinate center
- `max_iterations` (optional, default: 100): Maximum iterations (1-10000)

## Performance

- Parallel computation using Rayon
- Generates 1920x1080 fractals in ~50ms
- Memory-efficient pixel processing
- Optimized color mapping

## Development

### Local Development

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Run the service
cargo run

# Service will be available at http://localhost:8001
```

### Docker

```bash
# Build the service
docker compose build rust-service

# Run the service
docker compose up rust-service
```

## Architecture

- **Framework**: Axum (async web framework)
- **Runtime**: Tokio (async runtime)
- **Image Processing**: image crate
- **Parallel Computation**: Rayon
- **Serialization**: Serde

## Future Enhancements

- WebSocket support for progressive rendering
- Julia Set support
- Interactive zoom/pan
- Color palette selection
- Export functionality
- Performance metrics endpoint
