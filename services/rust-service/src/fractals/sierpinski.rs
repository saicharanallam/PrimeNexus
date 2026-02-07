use super::traits::{default_validate_params, Fractal, FractalParams};
use crate::rendering::colors::{iterations_to_color, ColorScheme};
use crate::utils::validation::validate_recursion_depth;
use image::{ImageBuffer, Rgb, RgbImage};

pub struct SierpinskiTriangle;

impl Fractal for SierpinskiTriangle {
    fn generate(&self, params: FractalParams) -> Result<RgbImage, String> {
        self.validate_params(&params)?;

        let FractalParams {
            width,
            height,
            recursion_depth,
            color_scheme,
            ..
        } = params;

        let depth = recursion_depth.unwrap_or(6);
        validate_recursion_depth(depth)?;

        let scheme = ColorScheme::from_str(color_scheme.as_deref().unwrap_or("default"));

        // Create white background
        let mut img: RgbImage = ImageBuffer::from_pixel(width, height, Rgb([255, 255, 255]));

        // Define the three vertices of the main triangle
        // Center it and scale to fit the image with padding
        let padding = 20.0;
        let size = (width.min(height) as f64 - 2.0 * padding).min(width as f64 - 2.0 * padding);

        let p1 = (width as f64 / 2.0, padding);
        let p2 = (
            width as f64 / 2.0 - size / 2.0,
            height as f64 - padding,
        );
        let p3 = (
            width as f64 / 2.0 + size / 2.0,
            height as f64 - padding,
        );

        // Draw Sierpinski triangle recursively
        draw_sierpinski(
            &mut img,
            p1,
            p2,
            p3,
            depth,
            0,
            &scheme,
        );

        Ok(img)
    }

    fn name(&self) -> &str {
        "sierpinski"
    }

    fn validate_params(&self, params: &FractalParams) -> Result<(), String> {
        default_validate_params(params)?;

        // Validate recursion depth
        if let Some(depth) = params.recursion_depth {
            validate_recursion_depth(depth)?;
        }

        Ok(())
    }
}

fn draw_sierpinski(
    img: &mut RgbImage,
    p1: (f64, f64),
    p2: (f64, f64),
    p3: (f64, f64),
    max_depth: u32,
    current_depth: u32,
    scheme: &ColorScheme,
) {
    if current_depth >= max_depth {
        // Base case: draw filled triangle
        draw_filled_triangle(img, p1, p2, p3, current_depth, max_depth, scheme);
    } else {
        // Calculate midpoints
        let m1 = ((p1.0 + p2.0) / 2.0, (p1.1 + p2.1) / 2.0);
        let m2 = ((p2.0 + p3.0) / 2.0, (p2.1 + p3.1) / 2.0);
        let m3 = ((p3.0 + p1.0) / 2.0, (p3.1 + p1.1) / 2.0);

        // Recursively draw three smaller triangles
        draw_sierpinski(img, p1, m1, m3, max_depth, current_depth + 1, scheme);
        draw_sierpinski(img, m1, p2, m2, max_depth, current_depth + 1, scheme);
        draw_sierpinski(img, m3, m2, p3, max_depth, current_depth + 1, scheme);
    }
}

fn draw_filled_triangle(
    img: &mut RgbImage,
    p1: (f64, f64),
    p2: (f64, f64),
    p3: (f64, f64),
    current_depth: u32,
    max_depth: u32,
    scheme: &ColorScheme,
) {
    // Use depth to determine color
    let color = iterations_to_color(current_depth, max_depth, scheme);

    // Get bounding box
    let min_x = p1.0.min(p2.0).min(p3.0) as i32;
    let max_x = p1.0.max(p2.0).max(p3.0) as i32;
    let min_y = p1.1.min(p2.1).min(p3.1) as i32;
    let max_y = p1.1.max(p2.1).max(p3.1) as i32;

    // Scan through bounding box and fill pixels inside triangle
    for y in min_y..=max_y {
        for x in min_x..=max_x {
            if is_inside_triangle((x as f64, y as f64), p1, p2, p3) {
                if x >= 0 && x < img.width() as i32 && y >= 0 && y < img.height() as i32 {
                    img.put_pixel(x as u32, y as u32, Rgb(color));
                }
            }
        }
    }
}

fn is_inside_triangle(p: (f64, f64), v1: (f64, f64), v2: (f64, f64), v3: (f64, f64)) -> bool {
    // Use barycentric coordinates to check if point is inside triangle
    let d1 = sign(p, v1, v2);
    let d2 = sign(p, v2, v3);
    let d3 = sign(p, v3, v1);

    let has_neg = d1 < 0.0 || d2 < 0.0 || d3 < 0.0;
    let has_pos = d1 > 0.0 || d2 > 0.0 || d3 > 0.0;

    !(has_neg && has_pos)
}

fn sign(p1: (f64, f64), p2: (f64, f64), p3: (f64, f64)) -> f64 {
    (p1.0 - p3.0) * (p2.1 - p3.1) - (p2.0 - p3.0) * (p1.1 - p3.1)
}
