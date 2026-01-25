"""Tests for address normalization."""

import pytest
from app.pipelines.normalize_address import (
    normalize_address,
    parse_address_components,
    create_address_key,
    addresses_match,
)


class TestNormalizeAddress:
    """Tests for address normalization."""
    
    def test_lowercase_and_trim(self):
        result = normalize_address("  MUSTERSTRASSE 123  ")
        assert result == "musterstraße 123"
        
    def test_street_abbreviation(self):
        result = normalize_address("Musterstr. 42")
        assert "straße" in result
        
    def test_city_normalization(self):
        result = normalize_address("50667 Koeln")
        assert "köln" in result
        
    def test_remove_whitespace(self):
        result = normalize_address("Muster   Straße    1")
        assert "  " not in result
        
    def test_empty_input(self):
        assert normalize_address("") == ""
        assert normalize_address(None) == ""


class TestParseAddressComponents:
    """Tests for address component parsing."""
    
    def test_full_address(self):
        result = parse_address_components("musterstraße 42 50667 köln")
        assert result["street"] == "musterstraße"
        assert result["house_number"] == "42"
        assert result["postal_code"] == "50667"
        assert result["city"] == "köln"
        
    def test_plz_city_only(self):
        result = parse_address_components("40239 düsseldorf")
        assert result["postal_code"] == "40239"
        assert result["city"] == "düsseldorf"
        assert result["street"] is None
        
    def test_street_only(self):
        result = parse_address_components("hauptstraße 1a")
        assert result["street"] == "hauptstraße"
        assert result["house_number"] == "1a"
        assert result["postal_code"] is None


class TestCreateAddressKey:
    """Tests for address key creation."""
    
    def test_full_key(self):
        key = create_address_key("musterstraße", "42", "50667")
        assert key == "50667:musterstraße:42"
        
    def test_no_house_number(self):
        key = create_address_key("musterstraße", None, "50667")
        assert key == "50667:musterstraße:"
        
    def test_missing_required(self):
        assert create_address_key(None, "42", "50667") is None
        assert create_address_key("musterstraße", "42", None) is None


class TestAddressesMatch:
    """Tests for address matching."""
    
    def test_exact_match(self):
        assert addresses_match(
            "musterstraße 42 50667 köln",
            "musterstraße 42 50667 köln"
        ) is True
        
    def test_similar_match(self):
        assert addresses_match(
            "musterstraße 42 köln",
            "musterstraße 42 50667 köln",
            threshold=0.7
        ) is True
        
    def test_no_match(self):
        assert addresses_match(
            "hauptstraße 1 berlin",
            "nebenstraße 99 münchen"
        ) is False
        
    def test_empty_input(self):
        assert addresses_match("", "something") is False
        assert addresses_match("something", "") is False
