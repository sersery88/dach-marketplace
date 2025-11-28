/// Generate a URL-friendly slug from a string
pub fn generate_slug(input: &str) -> String {
    input
        .to_lowercase()
        .chars()
        .map(|c| match c {
            'ä' => "ae".to_string(),
            'ö' => "oe".to_string(),
            'ü' => "ue".to_string(),
            'ß' => "ss".to_string(),
            c if c.is_alphanumeric() => c.to_string(),
            _ => "-".to_string(),
        })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Generate a unique slug by appending a random suffix
pub fn generate_unique_slug(input: &str) -> String {
    let base_slug = generate_slug(input);
    let suffix = uuid::Uuid::new_v4().to_string()[..8].to_string();
    format!("{}-{}", base_slug, suffix)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_slug() {
        assert_eq!(generate_slug("Hello World"), "hello-world");
        assert_eq!(generate_slug("Workflow Automatisierung"), "workflow-automatisierung");
        assert_eq!(generate_slug("Größe & Qualität"), "groesse-qualitaet");
        assert_eq!(generate_slug("  Multiple   Spaces  "), "multiple-spaces");
    }

    #[test]
    fn test_generate_unique_slug() {
        let slug1 = generate_unique_slug("Test");
        let slug2 = generate_unique_slug("Test");
        assert_ne!(slug1, slug2);
        assert!(slug1.starts_with("test-"));
    }
}

