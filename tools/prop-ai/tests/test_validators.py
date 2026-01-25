"""Tests for validators."""

import pytest
from app.utils.validators import (
    is_valid_url,
    is_same_domain,
    is_listing_url,
    is_excluded_url,
    is_valid_postal_code,
    is_valid_price,
    is_valid_area,
    is_valid_year,
    sanitize_string,
)


class TestIsValidUrl:
    """Tests for URL validation."""
    
    def test_valid_http(self):
        assert is_valid_url("http://example.com") is True
        
    def test_valid_https(self):
        assert is_valid_url("https://example.com/path") is True
        
    def test_invalid_protocol(self):
        assert is_valid_url("ftp://example.com") is False
        
    def test_no_protocol(self):
        assert is_valid_url("example.com") is False
        
    def test_empty(self):
        assert is_valid_url("") is False


class TestIsSameDomain:
    """Tests for domain comparison."""
    
    def test_same_domain(self):
        assert is_same_domain(
            "https://example.com/path1",
            "https://example.com/path2"
        ) is True
        
    def test_different_domain(self):
        assert is_same_domain(
            "https://example.com",
            "https://other.com"
        ) is False
        
    def test_subdomain(self):
        # Subdomains are different domains
        assert is_same_domain(
            "https://www.example.com",
            "https://api.example.com"
        ) is False


class TestIsListingUrl:
    """Tests for listing URL detection."""
    
    def test_immobilie_pattern(self):
        assert is_listing_url("https://makler.de/immobilien/123") is True
        
    def test_expose_pattern(self):
        assert is_listing_url("https://makler.de/expose/456") is True
        
    def test_objekt_pattern(self):
        assert is_listing_url("https://makler.de/objekt/789") is True
        
    def test_normal_page(self):
        assert is_listing_url("https://makler.de/about") is False


class TestIsExcludedUrl:
    """Tests for excluded URL detection."""
    
    def test_impressum(self):
        assert is_excluded_url("https://example.com/impressum") is True
        
    def test_datenschutz(self):
        assert is_excluded_url("https://example.com/datenschutz") is True
        
    def test_pdf(self):
        assert is_excluded_url("https://example.com/file.pdf") is True
        
    def test_normal_page(self):
        assert is_excluded_url("https://example.com/angebote") is False


class TestValidPostalCode:
    """Tests for postal code validation."""
    
    def test_valid_plz(self):
        assert is_valid_postal_code("50667") is True
        assert is_valid_postal_code("01234") is True
        
    def test_invalid_plz(self):
        assert is_valid_postal_code("1234") is False
        assert is_valid_postal_code("123456") is False
        assert is_valid_postal_code("ABCDE") is False
        
    def test_empty(self):
        assert is_valid_postal_code("") is False
        assert is_valid_postal_code(None) is False


class TestValidPrice:
    """Tests for price validation."""
    
    def test_valid_prices(self):
        assert is_valid_price(50000) is True
        assert is_valid_price(1500000) is True
        assert is_valid_price(10000000) is True
        
    def test_too_low(self):
        assert is_valid_price(5000) is False
        
    def test_too_high(self):
        assert is_valid_price(500000000) is False


class TestValidArea:
    """Tests for area validation."""
    
    def test_valid_areas(self):
        assert is_valid_area(50) is True
        assert is_valid_area(150) is True
        assert is_valid_area(500) is True
        
    def test_too_small(self):
        assert is_valid_area(5) is False
        
    def test_too_large(self):
        assert is_valid_area(50000) is False


class TestValidYear:
    """Tests for year validation."""
    
    def test_valid_years(self):
        assert is_valid_year(1900) is True
        assert is_valid_year(1985) is True
        assert is_valid_year(2024) is True
        
    def test_too_old(self):
        assert is_valid_year(1700) is False
        
    def test_future(self):
        assert is_valid_year(2050) is False


class TestSanitizeString:
    """Tests for string sanitization."""
    
    def test_remove_null_bytes(self):
        result = sanitize_string("test\x00string")
        assert "\x00" not in result
        
    def test_normalize_whitespace(self):
        result = sanitize_string("test    string")
        assert result == "test string"
        
    def test_truncate(self):
        long_string = "a" * 2000
        result = sanitize_string(long_string, max_length=100)
        assert len(result) == 100
        assert result.endswith("...")
        
    def test_empty(self):
        assert sanitize_string("") == ""
        assert sanitize_string(None) == ""
