use image::RgbImage;
use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct FractalParams {
    pub width: u32,
    pub height: u32,
    pub zoom: f64,
    pub center_x: f64,
    pub center_y: f64,
    pub max_iterations: u32,
    pub color_scheme: Option<String>,

    // Julia-specific parameters
    pub julia_c_real: Option<f64>,
    pub julia_c_imag: Option<f64>,

    // Geometric fractal parameters
    pub recursion_depth: Option<u32>,
}

impl Default for FractalParams {
    fn default() -> Self {
        Self {
            width: 800,
            height: 600,
            zoom: 1.0,
            center_x: 0.0,
            center_y: 0.0,
            max_iterations: 100,
            color_scheme: None,
            julia_c_real: None,
            julia_c_imag: None,
            recursion_depth: None,
        }
    }
}

pub trait Fractal: Send + Sync {
    /// Generate the fractal image with the given parameters
    fn generate(&self, params: FractalParams) -> Result<RgbImage, String>;

    /// Get the name of this fractal type
    fn name(&self) -> &str;

    /// Validate parameters for this fractal type
    fn validate_params(&self, params: &FractalParams) -> Result<(), String> {
        // Common validations
        if params.width == 0 || params.height == 0 || params.width > 4096 || params.height > 4096 {
            return Err(
                "Invalid dimensions. Width and height must be between 1 and 4096.".to_string(),
            );
        }

        if params.zoom <= 0.0 || params.zoom > 1e10 {
            return Err("Invalid zoom. Must be between 0 and 1e10.".to_string());
        }

        if params.max_iterations == 0 || params.max_iterations > 10000 {
            return Err("Invalid max_iterations. Must be between 1 and 10000.".to_string());
        }

        Ok(())
    }
}
