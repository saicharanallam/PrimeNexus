mod mandelbrot;

use axum::{
    extract::Query,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};

#[derive(Deserialize)]
struct MandelbrotQuery {
    width: Option<u32>,
    height: Option<u32>,
    zoom: Option<f64>,
    center_x: Option<f64>,
    center_y: Option<f64>,
    max_iterations: Option<u32>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

// Health check endpoint
async fn health() -> impl IntoResponse {
    let response = HealthResponse {
        status: "healthy".to_string(),
        service: "rust-service".to_string(),
    };
    (StatusCode::OK, axum::Json(response))
}

// Mandelbrot generation endpoint
async fn generate_mandelbrot(Query(params): Query<MandelbrotQuery>) -> Response {
    // Set defaults
    let width = params.width.unwrap_or(800);
    let height = params.height.unwrap_or(600);
    let zoom = params.zoom.unwrap_or(1.0);
    let center_x = params.center_x.unwrap_or(0.0);
    let center_y = params.center_y.unwrap_or(0.0);
    let max_iterations = params.max_iterations.unwrap_or(100);

    // Validate parameters
    if width == 0 || height == 0 || width > 4096 || height > 4096 {
        let error = ErrorResponse {
            error: "Invalid dimensions. Width and height must be between 1 and 4096.".to_string(),
        };
        return (StatusCode::BAD_REQUEST, axum::Json(error)).into_response();
    }

    if zoom <= 0.0 || zoom > 1e10 {
        let error = ErrorResponse {
            error: "Invalid zoom. Must be between 0 and 1e10.".to_string(),
        };
        return (StatusCode::BAD_REQUEST, axum::Json(error)).into_response();
    }

    if max_iterations == 0 || max_iterations > 10000 {
        let error = ErrorResponse {
            error: "Invalid max_iterations. Must be between 1 and 10000.".to_string(),
        };
        return (StatusCode::BAD_REQUEST, axum::Json(error)).into_response();
    }

    // Generate Mandelbrot set
    let mandelbrot_params = mandelbrot::MandelbrotParams {
        width,
        height,
        zoom,
        center_x,
        center_y,
        max_iterations,
    };

    let img = mandelbrot::generate_mandelbrot(mandelbrot_params);

    // Convert to PNG bytes
    let mut png_bytes: Vec<u8> = Vec::new();
    {
        let mut encoder = image::codecs::png::PngEncoder::new(&mut png_bytes);
        let raw_pixels = img.into_raw();
        if let Err(e) = encoder.encode(
            &raw_pixels,
            width,
            height,
            image::ColorType::Rgb8,
        ) {
            let error = ErrorResponse {
                error: format!("Failed to encode image: {}", e),
            };
            return (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(error)).into_response();
        }
    }

    // Return PNG image
    Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "image/png")
        .header("Content-Length", png_bytes.len().to_string())
        .body(axum::body::Body::from(png_bytes))
        .unwrap()
        .into_response()
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/mandelbrot", get(generate_mandelbrot))
        .layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8001")
        .await
        .expect("Failed to bind to address");

    tracing::info!("Rust service listening on http://0.0.0.0:8001");
    tracing::info!("Health check: http://0.0.0.0:8001/health");
    tracing::info!("Mandelbrot endpoint: http://0.0.0.0:8001/api/mandelbrot");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}
