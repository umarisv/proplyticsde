"""
PropAI - Main CLI application.

Usage:
    python -m app.main init_db
    python -m app.main scrape_brokers --seed_urls seeds/brokers.txt
    python -m app.main enrich_features --limit 50
    python -m app.main check_sources
"""

import argparse
import asyncio
import sys

from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.core.db import init_db

logger = None


def cmd_init_db(args):
    """Initialize database tables."""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")


def cmd_scrape_brokers(args):
    """Scrape broker websites."""
    from app.pipelines.broker_scraper import scrape_brokers_from_file
    from app.pipelines.snapshot_builder import build_snapshots_from_listings
    
    seed_file = args.seed_urls
    max_pages = args.max_pages
    
    logger.info(
        "Starting broker scrape job",
        seed_file=seed_file,
        max_pages=max_pages
    )
    
    # Run async scraper
    listings = asyncio.run(
        scrape_brokers_from_file(seed_file, max_pages_per_site=max_pages)
    )
    
    if listings:
        # Build snapshots from listings
        stats = build_snapshots_from_listings(
            listings,
            source_type="broker",
            source_name=seed_file
        )
        
        logger.info("Scrape job completed", **stats)
    else:
        logger.warning("No listings found")


def cmd_enrich_features(args):
    """Enrich snapshots with Overpass features."""
    from app.pipelines.overpass_features import enrich_snapshots_with_features
    
    limit = args.limit
    
    logger.info("Starting feature enrichment", limit=limit)
    asyncio.run(enrich_snapshots_with_features(limit=limit))
    logger.info("Feature enrichment completed")


def cmd_check_sources(args):
    """Check availability of open data sources."""
    from app.pipelines.open_data_sources import check_all_sources
    
    logger.info("Checking open data sources...")
    results = asyncio.run(check_all_sources())
    
    for source, available in results.items():
        status = "available" if available else "unavailable"
        logger.info(f"  {source}: {status}")


def cmd_run_api(args):
    """Run the FastAPI server."""
    import uvicorn
    from app.api import app as api_app
    
    settings = get_settings()
    
    logger.info(
        "Starting API server",
        host=settings.api_host,
        port=settings.api_port
    )
    
    uvicorn.run(
        api_app,
        host=settings.api_host,
        port=settings.api_port,
    )


def main():
    global logger
    
    # Setup logging first
    setup_logging()
    logger = get_logger("app.main")
    
    # Create argument parser
    parser = argparse.ArgumentParser(
        description="PropAI - Immobilienanalyse Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # init_db command
    parser_init = subparsers.add_parser("init_db", help="Initialize database tables")
    parser_init.set_defaults(func=cmd_init_db)
    
    # scrape_brokers command
    parser_scrape = subparsers.add_parser(
        "scrape_brokers",
        help="Scrape broker websites for property listings"
    )
    parser_scrape.add_argument(
        "--seed_urls",
        required=True,
        help="Path to file with seed URLs (one per line)"
    )
    parser_scrape.add_argument(
        "--max_pages",
        type=int,
        default=50,
        help="Maximum pages to crawl per site (default: 50)"
    )
    parser_scrape.set_defaults(func=cmd_scrape_brokers)
    
    # enrich_features command
    parser_enrich = subparsers.add_parser(
        "enrich_features",
        help="Enrich snapshots with Overpass features"
    )
    parser_enrich.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum snapshots to process (default: 50)"
    )
    parser_enrich.set_defaults(func=cmd_enrich_features)
    
    # check_sources command
    parser_check = subparsers.add_parser(
        "check_sources",
        help="Check availability of open data sources"
    )
    parser_check.set_defaults(func=cmd_check_sources)
    
    # run_api command
    parser_api = subparsers.add_parser(
        "run_api",
        help="Run the FastAPI server"
    )
    parser_api.set_defaults(func=cmd_run_api)
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Run command
    try:
        args.func(args)
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error("Command failed", error=str(e), exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
