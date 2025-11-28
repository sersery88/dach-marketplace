//! VAT calculation utilities for DACH region

use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};

/// VAT rates for DACH countries (as of 2024)
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum VatRate {
    /// Switzerland standard rate: 8.1%
    SwitzerlandStandard,
    /// Switzerland reduced rate: 2.6%
    SwitzerlandReduced,
    /// Switzerland special rate for accommodation: 3.8%
    SwitzerlandAccommodation,
    /// Germany standard rate: 19%
    GermanyStandard,
    /// Germany reduced rate: 7%
    GermanyReduced,
    /// Austria standard rate: 20%
    AustriaStandard,
    /// Austria reduced rate: 10%
    AustriaReduced,
    /// Austria special reduced rate: 13%
    AustriaSpecialReduced,
    /// No VAT (e.g., B2B with valid VAT ID)
    Exempt,
}

impl VatRate {
    /// Get the VAT rate as a decimal percentage
    pub fn rate(&self) -> Decimal {
        match self {
            VatRate::SwitzerlandStandard => dec!(8.1),
            VatRate::SwitzerlandReduced => dec!(2.6),
            VatRate::SwitzerlandAccommodation => dec!(3.8),
            VatRate::GermanyStandard => dec!(19.0),
            VatRate::GermanyReduced => dec!(7.0),
            VatRate::AustriaStandard => dec!(20.0),
            VatRate::AustriaReduced => dec!(10.0),
            VatRate::AustriaSpecialReduced => dec!(13.0),
            VatRate::Exempt => dec!(0.0),
        }
    }

    /// Get the standard VAT rate for a country
    pub fn standard_for_country(country: &str) -> Self {
        match country.to_uppercase().as_str() {
            "CH" | "SWITZERLAND" | "SCHWEIZ" => VatRate::SwitzerlandStandard,
            "DE" | "GERMANY" | "DEUTSCHLAND" => VatRate::GermanyStandard,
            "AT" | "AUSTRIA" | "ÖSTERREICH" => VatRate::AustriaStandard,
            _ => VatRate::Exempt,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VatCalculation {
    pub net_amount: Decimal,
    pub vat_rate: Decimal,
    pub vat_amount: Decimal,
    pub gross_amount: Decimal,
    pub country_code: String,
}

/// Calculate VAT for a given net amount
pub fn calculate_vat(net_amount: Decimal, vat_rate: VatRate) -> VatCalculation {
    let rate = vat_rate.rate();
    let vat_amount = (net_amount * rate) / dec!(100);
    let gross_amount = net_amount + vat_amount;

    VatCalculation {
        net_amount,
        vat_rate: rate,
        vat_amount,
        gross_amount,
        country_code: match vat_rate {
            VatRate::SwitzerlandStandard | VatRate::SwitzerlandReduced | VatRate::SwitzerlandAccommodation => "CH".to_string(),
            VatRate::GermanyStandard | VatRate::GermanyReduced => "DE".to_string(),
            VatRate::AustriaStandard | VatRate::AustriaReduced | VatRate::AustriaSpecialReduced => "AT".to_string(),
            VatRate::Exempt => "".to_string(),
        },
    }
}

/// Calculate net amount from gross (reverse VAT calculation)
pub fn calculate_net_from_gross(gross_amount: Decimal, vat_rate: VatRate) -> VatCalculation {
    let rate = vat_rate.rate();
    let net_amount = (gross_amount * dec!(100)) / (dec!(100) + rate);
    let vat_amount = gross_amount - net_amount;

    VatCalculation {
        net_amount,
        vat_rate: rate,
        vat_amount,
        gross_amount,
        country_code: match vat_rate {
            VatRate::SwitzerlandStandard | VatRate::SwitzerlandReduced | VatRate::SwitzerlandAccommodation => "CH".to_string(),
            VatRate::GermanyStandard | VatRate::GermanyReduced => "DE".to_string(),
            VatRate::AustriaStandard | VatRate::AustriaReduced | VatRate::AustriaSpecialReduced => "AT".to_string(),
            VatRate::Exempt => "".to_string(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_swiss_vat() {
        let calc = calculate_vat(dec!(100), VatRate::SwitzerlandStandard);
        assert_eq!(calc.vat_rate, dec!(8.1));
        assert_eq!(calc.vat_amount, dec!(8.1));
        assert_eq!(calc.gross_amount, dec!(108.1));
    }

    #[test]
    fn test_german_vat() {
        let calc = calculate_vat(dec!(100), VatRate::GermanyStandard);
        assert_eq!(calc.vat_rate, dec!(19.0));
        assert_eq!(calc.vat_amount, dec!(19.0));
        assert_eq!(calc.gross_amount, dec!(119.0));
    }

    #[test]
    fn test_austrian_vat() {
        let calc = calculate_vat(dec!(100), VatRate::AustriaStandard);
        assert_eq!(calc.vat_rate, dec!(20.0));
        assert_eq!(calc.vat_amount, dec!(20.0));
        assert_eq!(calc.gross_amount, dec!(120.0));
    }
}

