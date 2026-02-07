pub enum ColorScheme {
    Default,
    Fire,
    Ice,
    Rainbow,
    Grayscale,
}

impl ColorScheme {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "fire" => ColorScheme::Fire,
            "ice" => ColorScheme::Ice,
            "rainbow" => ColorScheme::Rainbow,
            "grayscale" => ColorScheme::Grayscale,
            _ => ColorScheme::Default,
        }
    }
}

pub fn iterations_to_color(iterations: u32, max_iterations: u32, scheme: &ColorScheme) -> [u8; 3] {
    if iterations == max_iterations {
        // Inside the set - black
        return [0, 0, 0];
    }

    let normalized = iterations as f64 / max_iterations as f64;

    match scheme {
        ColorScheme::Default => {
            let r = (normalized * 255.0) as u8;
            let g = ((normalized * 2.0).sin() * 127.0 + 128.0) as u8;
            let b = ((normalized * 3.0).sin() * 127.0 + 128.0) as u8;
            [r, g, b]
        }
        ColorScheme::Fire => {
            let r = (normalized * 255.0).min(255.0) as u8;
            let g = (normalized * 200.0).min(255.0) as u8;
            let b = (normalized * 50.0).min(255.0) as u8;
            [r, g, b]
        }
        ColorScheme::Ice => {
            let r = (normalized * 100.0).min(255.0) as u8;
            let g = (normalized * 200.0).min(255.0) as u8;
            let b = (normalized * 255.0).min(255.0) as u8;
            [r, g, b]
        }
        ColorScheme::Rainbow => {
            let hue = normalized * 6.0;
            let sector = hue as u32 % 6;
            let fraction = hue - sector as f64;

            let p = 0.0;
            let q = 1.0 - fraction;
            let t = fraction;

            let (r, g, b) = match sector {
                0 => (1.0, t, p),
                1 => (q, 1.0, p),
                2 => (p, 1.0, t),
                3 => (p, q, 1.0),
                4 => (t, p, 1.0),
                _ => (1.0, p, q),
            };

            [(r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8]
        }
        ColorScheme::Grayscale => {
            let gray = (normalized * 255.0) as u8;
            [gray, gray, gray]
        }
    }
}
