use super::traits::{default_validate_params, Fractal, FractalParams};
use crate::utils::validation::validate_recursion_depth;
use image::{ImageBuffer, Rgb, RgbImage};

pub struct KochSnowflake;

impl Fractal for KochSnowflake {
    fn generate(&self, params: FractalParams) -> Result<RgbImage, String> {
        self.validate_params(&params)?;

        let FractalParams {
            width,
            height,
            recursion_depth,
            ..
        } = params;

        let depth = recursion_depth.unwrap_or(4);
        validate_recursion_depth(depth)?;

        // Create white background
        let mut img: RgbImage = ImageBuffer::from_pixel(width, height, Rgb([255, 255, 255]));

        // Define the three vertices of an equilateral triangle
        // Center it and scale to fit the image with padding
        let padding = 40.0;
        let size = (width.min(height) as f64 - 2.0 * padding).min(width as f64 - 2.0 * padding);

        let center_x = width as f64 / 2.0;
        let center_y = height as f64 / 2.0;

        // Equilateral triangle vertices
        let height_offset = size * (3.0_f64.sqrt() / 2.0);

        let p1 = (center_x, center_y - height_offset * 0.6);
        let p2 = (center_x - size / 2.0, center_y + height_offset * 0.4);
        let p3 = (center_x + size / 2.0, center_y + height_offset * 0.4);

        // Draw Koch snowflake on each of the three sides
        let mut lines = Vec::new();
        koch_curve(p1, p2, depth, &mut lines);
        koch_curve(p2, p3, depth, &mut lines);
        koch_curve(p3, p1, depth, &mut lines);

        // Draw all lines
        for (start, end) in lines {
            draw_line(&mut img, start, end, Rgb([0, 100, 200]));
        }

        Ok(img)
    }

    fn name(&self) -> &str {
        "koch"
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

fn koch_curve(
    start: (f64, f64),
    end: (f64, f64),
    depth: u32,
    lines: &mut Vec<((f64, f64), (f64, f64))>,
) {
    if depth == 0 {
        lines.push((start, end));
    } else {
        // Divide the line into 3 parts
        let dx = end.0 - start.0;
        let dy = end.1 - start.1;

        // First third point
        let p1 = (start.0 + dx / 3.0, start.1 + dy / 3.0);

        // Second third point
        let p2 = (start.0 + 2.0 * dx / 3.0, start.1 + 2.0 * dy / 3.0);

        // Peak of the equilateral triangle
        let angle = 60.0_f64.to_radians();
        let cos60 = angle.cos();
        let sin60 = angle.sin();

        let mid_x = p1.0 + (p2.0 - p1.0) * cos60 - (p2.1 - p1.1) * sin60;
        let mid_y = p1.1 + (p2.0 - p1.0) * sin60 + (p2.1 - p1.1) * cos60;
        let peak = (mid_x, mid_y);

        // Recursively generate four segments
        koch_curve(start, p1, depth - 1, lines);
        koch_curve(p1, peak, depth - 1, lines);
        koch_curve(peak, p2, depth - 1, lines);
        koch_curve(p2, end, depth - 1, lines);
    }
}

fn draw_line(img: &mut RgbImage, start: (f64, f64), end: (f64, f64), color: Rgb<u8>) {
    // Bresenham's line algorithm
    let x0 = start.0 as i32;
    let y0 = start.1 as i32;
    let x1 = end.0 as i32;
    let y1 = end.1 as i32;

    let dx = (x1 - x0).abs();
    let dy = -(y1 - y0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut err = dx + dy;

    let mut x = x0;
    let mut y = y0;

    loop {
        if x >= 0 && x < img.width() as i32 && y >= 0 && y < img.height() as i32 {
            img.put_pixel(x as u32, y as u32, color);
        }

        if x == x1 && y == y1 {
            break;
        }

        let e2 = 2 * err;
        if e2 >= dy {
            err += dy;
            x += sx;
        }
        if e2 <= dx {
            err += dx;
            y += sy;
        }
    }
}
