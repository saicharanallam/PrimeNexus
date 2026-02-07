pub struct SvgBuilder {
    width: u32,
    height: u32,
    elements: Vec<String>,
}

impl SvgBuilder {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            elements: Vec::new(),
        }
    }

    pub fn add_line(&mut self, x1: f64, y1: f64, x2: f64, y2: f64, stroke: &str, stroke_width: f64) {
        self.elements.push(format!(
            r#"  <line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{}" stroke-width="{}"/>"#,
            x1, y1, x2, y2, stroke, stroke_width
        ));
    }

    pub fn add_polygon(&mut self, points: &[(f64, f64)], fill: &str, stroke: &str) {
        let points_str = points
            .iter()
            .map(|(x, y)| format!("{},{}", x, y))
            .collect::<Vec<_>>()
            .join(" ");

        self.elements.push(format!(
            r#"  <polygon points="{}" fill="{}" stroke="{}"/>"#,
            points_str, fill, stroke
        ));
    }

    pub fn build(self) -> String {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}" viewBox="0 0 {} {}">
{}
</svg>"#,
            self.width,
            self.height,
            self.width,
            self.height,
            self.elements.join("\n")
        )
    }
}
