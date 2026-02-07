use super::traits::{default_validate_params, Fractal, FractalParams};
use crate::rendering::colors::{iterations_to_color, ColorScheme};
use crate::utils::validation::validate_julia_params;
use image::{ImageBuffer, Rgb, RgbImage};
use rayon::prelude::*;

pub struct JuliaSet;

impl Fractal for JuliaSet {
    fn generate(&self, params: FractalParams) -> Result<RgbImage, String> {
        self.validate_params(&params)?;

        let FractalParams {
            width,
            height,
            zoom,
            center_x,
            center_y,
            max_iterations,
            color_scheme,
            julia_c_real,
            julia_c_imag,
            ..
        } = params;

        // Julia set requires c values
        let c_real = julia_c_real.ok_or("julia_c_real parameter is required for Julia set")?;
        let c_imag = julia_c_imag.ok_or("julia_c_imag parameter is required for Julia set")?;

        validate_julia_params(c_real, c_imag)?;

        let scheme = ColorScheme::from_str(color_scheme.as_deref().unwrap_or("default"));

        // Calculate the complex plane bounds
        let aspect_ratio = width as f64 / height as f64;
        let scale = 4.0 / zoom;
        let min_x = center_x - scale * aspect_ratio;
        let max_x = center_x + scale * aspect_ratio;
        let min_y = center_y - scale;
        let max_y = center_y + scale;

        // Pre-calculate all pixel data in parallel (clone scheme per row for parallel capture)
        let pixels: Vec<[u8; 3]> = (0..height)
            .into_par_iter()
            .flat_map(|y| {
                let scheme = scheme.clone();
                (0..width)
                    .map(move |x| {
                        // Map pixel coordinates to complex plane
                        let zx = min_x + (x as f64 / width as f64) * (max_x - min_x);
                        let zy = min_y + (y as f64 / height as f64) * (max_y - min_y);

                        // Compute Julia iteration
                        let iterations = julia_iterations(zx, zy, c_real, c_imag, max_iterations);

                        // Map iterations to color
                        iterations_to_color(iterations, max_iterations, &scheme)
                    })
                    .collect::<Vec<_>>()
            })
            .collect();

        // Create image buffer and fill with computed pixels
        let mut img: RgbImage = ImageBuffer::new(width, height);
        for (idx, pixel) in img.pixels_mut().enumerate() {
            *pixel = Rgb(pixels[idx]);
        }

        Ok(img)
    }

    fn name(&self) -> &str {
        "julia"
    }

    fn validate_params(&self, params: &FractalParams) -> Result<(), String> {
        default_validate_params(params)?;

        // Validate Julia-specific parameters
        if let (Some(c_real), Some(c_imag)) = (params.julia_c_real, params.julia_c_imag) {
            validate_julia_params(c_real, c_imag)?;
        }

        Ok(())
    }
}

fn julia_iterations(mut zx: f64, mut zy: f64, cx: f64, cy: f64, max_iterations: u32) -> u32 {
    let mut iteration = 0;

    // Julia set: z = z^2 + c where c is constant
    while zx * zx + zy * zy <= 4.0 && iteration < max_iterations {
        let zx_temp = zx * zx - zy * zy + cx;
        zy = 2.0 * zx * zy + cy;
        zx = zx_temp;
        iteration += 1;
    }

    iteration
}
