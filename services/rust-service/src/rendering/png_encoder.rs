use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use image::RgbImage;

pub fn encode_png(img: RgbImage) -> Result<Vec<u8>, String> {
    let mut png_bytes: Vec<u8> = Vec::new();
    let (width, height) = img.dimensions();
    let encoder = image::codecs::png::PngEncoder::new(&mut png_bytes);
    let raw_pixels = img.into_raw();

    encoder
        .encode(&raw_pixels, width, height, image::ColorType::Rgb8)
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    Ok(png_bytes)
}

pub fn create_png_response(png_bytes: Vec<u8>) -> Response {
    Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "image/png")
        .header("Content-Length", png_bytes.len().to_string())
        .body(axum::body::Body::from(png_bytes))
        .unwrap()
        .into_response()
}
