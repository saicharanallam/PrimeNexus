mod fractals;
mod rendering;
mod utils;

use axum::{
    extract::Query,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use fractals::julia::JuliaSet;
use fractals::koch::KochSnowflake;
use fractals::mandelbrot::MandelbrotSet;
use fractals::sierpinski::SierpinskiTriangle;
use fractals::traits::{Fractal, FractalParams};
use rendering::png_encoder::{create_png_response, encode_png};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};

#[derive(Deserialize)]
struct FractalQuery {
    #[serde(rename = "type")]
    fractal_type: Option<String>,

    // Common parameters
    width: Option<u32>,
    height: Option<u32>,
    zoom: Option<f64>,
    center_x: Option<f64>,
    center_y: Option<f64>,
    max_iterations: Option<u32>,
    color_scheme: Option<String>,

    // Julia-specific parameters
    julia_c_real: Option<f64>,
    julia_c_imag: Option<f64>,

    // Geometric fractal parameters
    recursion_depth: Option<u32>,
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

// Unified fractal generation endpoint
async fn generate_fractal(Query(query): Query<FractalQuery>) -> Response {
    let fractal_type = query.fractal_type.unwrap_or_else(|| "mandelbrot".to_string());

    // Create FractalParams with defaults
    let params = FractalParams {
        width: query.width.unwrap_or(800),
        height: query.height.unwrap_or(600),
        zoom: query.zoom.unwrap_or(1.0),
        center_x: query.center_x.unwrap_or(0.0),
        center_y: query.center_y.unwrap_or(0.0),
        max_iterations: query.max_iterations.unwrap_or(100),
        color_scheme: query.color_scheme,
        julia_c_real: query.julia_c_real,
        julia_c_imag: query.julia_c_imag,
        recursion_depth: query.recursion_depth,
    };

    // Select fractal implementation based on type
    let fractal: Box<dyn Fractal> = match fractal_type.to_lowercase().as_str() {
        "mandelbrot" => Box::new(MandelbrotSet),
        "julia" => Box::new(JuliaSet),
        "sierpinski" => Box::new(SierpinskiTriangle),
        "koch" => Box::new(KochSnowflake),
        _ => {
            let error = ErrorResponse {
                error: format!(
                    "Unknown fractal type: {}. Supported types: mandelbrot, julia, sierpinski, koch",
                    fractal_type
                ),
            };
            return (StatusCode::BAD_REQUEST, axum::Json(error)).into_response();
        }
    };

    // Generate the fractal
    match fractal.generate(params) {
        Ok(img) => {
            // Encode as PNG
            match encode_png(img) {
                Ok(png_bytes) => create_png_response(png_bytes),
                Err(e) => {
                    let error = ErrorResponse { error: e };
                    (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(error)).into_response()
                }
            }
        }
        Err(e) => {
            let error = ErrorResponse { error: e };
            (StatusCode::BAD_REQUEST, axum::Json(error)).into_response()
        }
    }
}

// Legacy endpoint for backwards compatibility
async fn generate_mandelbrot(query: Query<FractalQuery>) -> Response {
    let mut query = query.0;
    query.fractal_type = Some("mandelbrot".to_string());
    generate_fractal(Query(query)).await
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
        .route("/api/fractal", get(generate_fractal))
        .route("/api/mandelbrot", get(generate_mandelbrot)) // Legacy endpoint
        .layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8001")
        .await
        .expect("Failed to bind to address");

    tracing::info!("Rust service listening on http://0.0.0.0:8001");
    tracing::info!("Health check: http://0.0.0.0:8001/health");
    tracing::info!("Unified endpoint: http://0.0.0.0:8001/api/fractal");
    tracing::info!("  - Mandelbrot: ?type=mandelbrot");
    tracing::info!("  - Julia: ?type=julia&julia_c_real=-0.7&julia_c_imag=0.27");
    tracing::info!("  - Sierpinski: ?type=sierpinski&recursion_depth=6");
    tracing::info!("  - Koch: ?type=koch&recursion_depth=4");
    tracing::info!("Legacy Mandelbrot endpoint: http://0.0.0.0:8001/api/mandelbrot");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}
