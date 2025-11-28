use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::Rng;

/// Generate a random token (URL-safe base64)
pub fn generate_token(length: usize) -> String {
    let mut rng = rand::rng();
    let bytes: Vec<u8> = (0..length).map(|_| rng.random()).collect();
    URL_SAFE_NO_PAD.encode(&bytes)
}

/// Generate a verification token
pub fn generate_verification_token() -> String {
    generate_token(32)
}

/// Generate a password reset token
pub fn generate_reset_token() -> String {
    generate_token(32)
}

/// Generate a short code (6 digits)
pub fn generate_short_code() -> String {
    let mut rng = rand::rng();
    format!("{:06}", rng.random_range(0..1000000))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_token() {
        let token1 = generate_token(32);
        let token2 = generate_token(32);
        
        assert_ne!(token1, token2);
        assert!(!token1.is_empty());
    }

    #[test]
    fn test_generate_short_code() {
        let code = generate_short_code();
        assert_eq!(code.len(), 6);
        assert!(code.chars().all(|c| c.is_numeric()));
    }
}

