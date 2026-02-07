use crate::fractals::traits::FractalParams;

pub fn validate_dimensions(width: u32, height: u32) -> Result<(), String> {
    if width == 0 || height == 0 || width > 4096 || height > 4096 {
        return Err(
            "Invalid dimensions. Width and height must be between 1 and 4096.".to_string(),
        );
    }
    Ok(())
}

pub fn validate_zoom(zoom: f64) -> Result<(), String> {
    if zoom <= 0.0 || zoom > 1e10 {
        return Err("Invalid zoom. Must be between 0 and 1e10.".to_string());
    }
    Ok(())
}

pub fn validate_iterations(max_iterations: u32) -> Result<(), String> {
    if max_iterations == 0 || max_iterations > 10000 {
        return Err("Invalid max_iterations. Must be between 1 and 10000.".to_string());
    }
    Ok(())
}

pub fn validate_julia_params(c_real: f64, c_imag: f64) -> Result<(), String> {
    if c_real.abs() > 2.0 || c_imag.abs() > 2.0 {
        return Err(
            "Invalid Julia parameters. c_real and c_imag must be between -2 and 2.".to_string(),
        );
    }
    Ok(())
}

pub fn validate_recursion_depth(depth: u32) -> Result<(), String> {
    if depth == 0 || depth > 12 {
        return Err("Invalid recursion_depth. Must be between 1 and 12.".to_string());
    }
    Ok(())
}
