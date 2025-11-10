import requests
from requests.exceptions import RequestException
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from flask import current_app

MIN_DIMENSION = 50

# --- Custom Exception Classes ---

class ScrapeError(Exception):
    """Base exception for scraping service errors."""
    pass

class ScrapeRequestError(ScrapeError):
    """Raised when the URL fetch itself fails (e.g., timeout, DNS error, 404)."""
    pass

# --- Service Function ---

def fetch_images_from_url(page_url: str) -> list[str]:
    """
    Fetches a webpage and scrapes all unique, absolute image URLs.
    
    This service is designed to be robust by:
    1. Mimicking a real browser's User-Agent.
    2. Checking the content-type before parsing to avoid non-HTML files.
    3. Handling both relative ('/img/foo.png') and absolute URLs.
    4. Filtering out data-URIs and non-http links.

    Args:
        page_url: The full URL of the webpage to scrape.

    Returns:
        A list of unique, absolute image URL strings.

    Raises:
        ScrapeRequestError: If the URL cannot be fetched or returns an error.
        ScrapeError: If parsing fails or any other unexpected error occurs.
    """
    current_app.logger.info(f"[Scrape Service] Starting scrape for URL: {page_url}")

    # Set a common User-Agent to avoid simple bot-blocking.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        # 1. Fetch the URL
        # Use stream=True to check headers before downloading the entire body.
        with requests.get(page_url, headers=headers, timeout=10, allow_redirects=True, stream=True) as response:
            # Check for HTTP errors (e.g., 404 Not Found, 500 Server Error)
            response.raise_for_status()

            # --- Production-Ready Check 1: Content-Type ---
            # Only parse if the content is HTML.
            content_type = response.headers.get('Content-Type', '').lower()
            
            # If the user pasted a direct link to an image, just return that URL.
            if 'image/' in content_type:
                current_app.logger.info(f"[Scrape Service] URL is a direct image. Returning: {page_url}")
                return [page_url]
            
            # If it's not HTML, log it and return an empty list.
            if 'text/html' not in content_type:
                current_app.logger.warning(f"[Scrape Service] Skipped non-HTML content at {page_url} (Type: {content_type})")
                return []

            # We've confirmed it's HTML, so now we can read the content.
            html_content = response.text

    except RequestException as e:
        current_app.logger.error(f"[Scrape Service] Failed to fetch URL {page_url}: {e}")
        # This exception will be caught by the route
        raise ScrapeRequestError(f"Failed to fetch or access the URL. It may be offline or invalid.")
    
    try:
        # 2. Parse the HTML
        current_app.logger.debug(f"[Scrape Service] Parsing HTML content for {page_url}...")
        soup = BeautifulSoup(html_content, 'html.parser')
        images = soup.find_all('img')
        unique_image_urls = set()

        if not images:
            current_app.logger.info(f"[Scrape Service] No <img> tags found at {page_url}.")
            return []

        # 3. Extract and clean URLs
        for img in images:
            src = img.get('src')

            # --- Production-Ready Check 2: Filter bad/irrelevant 'src' attributes ---
            if not src:
                current_app.logger.debug("[Scrape Service] Skipping img tag with no 'src' attribute.")
                continue
            
            # Filter out base64-encoded data URIs
            if src.startswith('data:image/'):
                current_app.logger.debug("[Scrape Service] Skipping data URI image.")
                continue
            
            try:
               width_str = img.get('width', '').replace('px', '').strip()
               height_str = img.get('height', '').replace('px', '').strip()
               
               if width_str:
                   width = int(float(width_str)) # Use float() to handle "100.0"
                   if width < MIN_DIMENSION:
                       current_app.logger.debug(f"[Scrape Service] Skipping small image (width: {width}px).")
                       continue
               
               if height_str:
                   height = int(float(height_str))
                   if height < MIN_DIMENSION:
                       current_app.logger.debug(f"[Scrape Service] Skipping small image (height: {height}px).")
                       continue
                       
            except ValueError:
                # Catches "auto" or other non-integer values, which we allow
                current_app.logger.debug(f"[Scrape Service] Skipping image with non-pixel dimensions (w: {img.get('width')}, h: {img.get('height')}).")
                pass

            # --- Production-Ready Check 3: Resolve relative URLs ---
            # This turns '/images/foo.png' into 'https://example.com/images/foo.png'
            absolute_url = urljoin(page_url, src)

            # --- Production-Ready Check 4: Final validation ---
            # Ensure we only return downloadable http/https links
            parsed_url = urlparse(absolute_url)
            if parsed_url.scheme in ['http', 'https'] and parsed_url.netloc:
                unique_image_urls.add(absolute_url)
            else:
                current_app.logger.debug(f"[Scrape Service] Skipping invalid or non-http URL: {absolute_url}")
        
        final_list = list(unique_image_urls)
        current_app.logger.info(f"[Scrape Service] Scrape successful: Found {len(final_list)} unique images for {page_url}.")
        return final_list

    except Exception as e:
        current_app.logger.error(f"[Scrape Service] Failed to parse HTML from {page_url}: {e}")
        # This will be caught by the route as a 500 Internal Server Error
        raise ScrapeError(f"Failed to parse the content from the URL.")