"""Tests for text extraction utilities."""

import pytest
from app.utils.text_extract import (
    extract_price,
    extract_living_area,
    extract_rooms,
    extract_year_built,
    extract_address,
    extract_postal_code,
    extract_balcony,
    extract_elevator,
    extract_property_type,
)


class TestExtractPrice:
    """Tests for price extraction."""
    
    def test_german_format_with_euro(self):
        assert extract_price("Kaufpreis: 450.000 €") == 450000.0
        
    def test_german_format_with_decimals(self):
        assert extract_price("1.234.567,00 EUR") == 1234567.0
        
    def test_simple_number(self):
        assert extract_price("Preis: 350000€") == 350000.0
        
    def test_large_price(self):
        assert extract_price("Verkaufspreis 2.500.000 Euro") == 2500000.0
        
    def test_no_price(self):
        assert extract_price("Keine Preisangabe") is None
        
    def test_price_too_low(self):
        # Prices under 10000 should be rejected (likely room count or sqm)
        assert extract_price("Nur 500 €") is None


class TestExtractLivingArea:
    """Tests for living area extraction."""
    
    def test_standard_format(self):
        assert extract_living_area("Wohnfläche: 85 m²") == 85.0
        
    def test_with_decimals(self):
        assert extract_living_area("ca. 120,5 qm") == 120.5
        
    def test_compact_format(self):
        assert extract_living_area("75m²") == 75.0
        
    def test_wfl_abbreviation(self):
        assert extract_living_area("Wfl. 95 m2") == 95.0
        
    def test_no_area(self):
        assert extract_living_area("Keine Angabe") is None


class TestExtractRooms:
    """Tests for room count extraction."""
    
    def test_zimmer_format(self):
        assert extract_rooms("3 Zimmer") == 3.0
        
    def test_half_room(self):
        assert extract_rooms("3,5 Zimmer") == 3.5
        
    def test_abbreviation(self):
        assert extract_rooms("4 Zi.") == 4.0
        
    def test_hyphenated(self):
        assert extract_rooms("3-Zimmer-Wohnung") == 3.0
        
    def test_no_rooms(self):
        assert extract_rooms("Keine Zimmerangabe") is None


class TestExtractYearBuilt:
    """Tests for year built extraction."""
    
    def test_baujahr_format(self):
        assert extract_year_built("Baujahr 1985") == 1985
        
    def test_bj_abbreviation(self):
        assert extract_year_built("Bj. 2010") == 2010
        
    def test_erbaut_format(self):
        assert extract_year_built("erbaut 1995") == 1995
        
    def test_new_building(self):
        assert extract_year_built("Fertigstellung 2024") == 2024
        
    def test_no_year(self):
        assert extract_year_built("Altbau ohne Angabe") is None


class TestExtractAddress:
    """Tests for address extraction."""
    
    def test_full_address(self):
        result = extract_address("Musterstraße 123, 50667 Köln")
        assert result is not None
        assert "musterstraße" in result.lower() or "50667" in result
        
    def test_plz_city_only(self):
        result = extract_address("in 40239 Düsseldorf")
        assert result is not None
        assert "40239" in result
        
    def test_no_address(self):
        assert extract_address("Keine Adresse vorhanden") is None


class TestExtractPostalCode:
    """Tests for postal code extraction."""
    
    def test_standard_plz(self):
        assert extract_postal_code("50667 Köln") == "50667"
        
    def test_plz_in_address(self):
        assert extract_postal_code("Musterstr. 1, 40239 Düsseldorf") == "40239"
        
    def test_no_plz(self):
        assert extract_postal_code("Berlin Mitte") is None


class TestExtractFeatures:
    """Tests for feature extraction."""
    
    def test_has_balcony(self):
        assert extract_balcony("Wohnung mit Balkon") is True
        assert extract_balcony("Loggia vorhanden") is True
        
    def test_no_balcony(self):
        assert extract_balcony("Wohnung ohne Balkon") is False
        assert extract_balcony("kein Balkon") is False
        
    def test_balcony_not_mentioned(self):
        assert extract_balcony("Schöne Wohnung") is None
        
    def test_has_elevator(self):
        assert extract_elevator("mit Aufzug") is True
        assert extract_elevator("Fahrstuhl vorhanden") is True
        
    def test_no_elevator(self):
        assert extract_elevator("ohne Aufzug") is False


class TestExtractPropertyType:
    """Tests for property type extraction."""
    
    def test_etw(self):
        assert extract_property_type("Eigentumswohnung zu verkaufen") == "eigentumswohnung"
        
    def test_efh(self):
        assert extract_property_type("Einfamilienhaus mit Garten") == "einfamilienhaus"
        
    def test_mfh(self):
        assert extract_property_type("Mehrfamilienhaus als Kapitalanlage") == "mehrfamilienhaus"
        
    def test_penthouse(self):
        assert extract_property_type("Luxuriöses Penthouse") == "penthouse"
        
    def test_unknown_type(self):
        assert extract_property_type("Immobilie zu verkaufen") is None
