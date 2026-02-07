use image::{ImageBuffer, Rgb, RgbImage};
use rayon::prelude::*;

pub struct MandelbrotParams {
    pub width: u32,
    pub height: u32,
    pub zoom: f64,
    pub center_x: f64,
    pub center_y: f64,
    pub max_iterations: u32,
}

pub fn generate_mandelbrot(params: MandelbrotParams) -> RgbImage {
    let MandelbrotParams {
        width,
        height,
        zoom,
        center_x,
        center_y,
        max_iterations,
    } = params;

    // Calculate the complex plane bounds
    let aspect_ratio = width as f64 / height as f64;
    let scale = 4.0 / zoom;
    let min_x = center_x - scale * aspect_ratio;
    let max_x = center_x + scale * aspect_ratio;
    let min_y = center_y - scale;
    let max_y = center_y + scale;

    // Pre-calculate all pixel data in parallel
    let pixels: Vec<[u8; 3]> = (0..height)
        .into_par_iter()
        .flat_map(|y| {
            (0..width)
                .map(move |x| {
                    // Map pixel coordinates to complex plane
                    let cx = min_x + (x as f64 / width as f64) * (max_x - min_x);
                    let cy = min_y + (y as f64 / height as f64) * (max_y - min_y);

                    // Compute Mandelbrot iteration
                    let iterations = mandelbrot_iterations(cx, cy, max_iterations);

                    // Map iterations to color
                    iterations_to_color(iterations, max_iterations)
                })
                .collect::<Vec<_>>()
        })
        .collect();

    // Create image buffer and fill with computed pixels
    let mut img: RgbImage = ImageBuffer::new(width, height);
    for (idx, pixel) in img.pixels_mut().enumerate() {
        *pixel = Rgb(pixels[idx]);
    }

    img
}

fn mandelbrot_iterations(cx: f64, cy: f64, max_iterations: u32) -> u32 {
    let mut x = 0.0;
    let mut y = 0.0;
    let mut iteration = 0;

    while x * x + y * y <= 4.0 && iteration < max_iterations {
        let x_temp = x * x - y * y + cx;
        y = 2.0 * x * y + cy;
        x = x_temp;
        iteration += 1;
    }

    iteration
}

fn iterations_to_color(iterations: u32, max_iterations: u32) -> [u8; 3] {
    if iterations == max_iterations {
        // Inside the set - black
        [0, 0, 0]
    } else {
        // Smooth coloring using normalized iteration count
        let normalized = iterations as f64 / max_iterations as f64;
        
        // Create a smooth color gradient
        let r = (normalized * 255.0) as u8;
        let g = ((normalized * 2.0).sin() * 127.0 + 128.0) as u8;
        let b = ((normalized * 3.0).sin() * 127.0 + 128.0) as u8;
        
        [r, g, b]
    }
}
