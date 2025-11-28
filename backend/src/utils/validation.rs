use regex::Regex;
use once_cell::sync::Lazy;

static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap()
});

static PHONE_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^\+?[0-9]{10,15}$").unwrap()
});

static URL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^https?://[^\s/$.?#].[^\s]*$").unwrap()
});

/// Validate email format
pub fn is_valid_email(email: &str) -> bool {
    EMAIL_REGEX.is_match(email)
}

/// Validate phone number format
pub fn is_valid_phone(phone: &str) -> bool {
    PHONE_REGEX.is_match(phone)
}

/// Validate URL format
pub fn is_valid_url(url: &str) -> bool {
    URL_REGEX.is_match(url)
}

/// Validate password strength
pub fn is_strong_password(password: &str) -> (bool, Vec<&'static str>) {
    let mut errors = Vec::new();

    if password.len() < 8 {
        errors.push("Password must be at least 8 characters");
    }
    if !password.chars().any(|c| c.is_uppercase()) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if !password.chars().any(|c| c.is_lowercase()) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if !password.chars().any(|c| c.is_numeric()) {
        errors.push("Password must contain at least one number");
    }
    if !password.chars().any(|c| !c.is_alphanumeric()) {
        errors.push("Password must contain at least one special character");
    }

    (errors.is_empty(), errors)
}

/// Sanitize HTML to prevent XSS
pub fn sanitize_html(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

/// Validate Swiss VAT number (CHE format)
pub fn is_valid_swiss_vat(vat: &str) -> bool {
    let re = Regex::new(r"^CHE-\d{3}\.\d{3}\.\d{3}$").unwrap();
    re.is_match(vat)
}

/// Validate German VAT number (DE format)
pub fn is_valid_german_vat(vat: &str) -> bool {
    let re = Regex::new(r"^DE\d{9}$").unwrap();
    re.is_match(vat)
}

/// Validate Austrian VAT number (ATU format)
pub fn is_valid_austrian_vat(vat: &str) -> bool {
    let re = Regex::new(r"^ATU\d{8}$").unwrap();
    re.is_match(vat)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_validation() {
        assert!(is_valid_email("test@example.com"));
        assert!(is_valid_email("user.name@domain.co.uk"));
        assert!(!is_valid_email("invalid"));
        assert!(!is_valid_email("@domain.com"));
    }

    #[test]
    fn test_password_strength() {
        let (valid, _) = is_strong_password("Str0ng!Pass");
        assert!(valid);

        let (valid, errors) = is_strong_password("weak");
        assert!(!valid);
        assert!(!errors.is_empty());
    }

    #[test]
    fn test_vat_validation() {
        assert!(is_valid_swiss_vat("CHE-123.456.789"));
        assert!(is_valid_german_vat("DE123456789"));
        assert!(is_valid_austrian_vat("ATU12345678"));
    }
}

