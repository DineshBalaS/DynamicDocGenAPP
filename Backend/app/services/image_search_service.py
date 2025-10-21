# app/services/image_search_service.py

import requests

class ImageSearchError(Exception):
    """Custom exception for image search failures."""
    pass

def search_images(query: str, count: int = 12):
    """
    Searches for images using an external API.

    NOTE: This implementation uses a free placeholder API (picsum.photos) for demonstration.
    In a real production environment, you would replace this with a robust image search API
    like Google Custom Search JSON API, Bing Image Search API, or a stock photo service API.
    These services would require API keys stored securely in your .env file.

    Args:
        query (str): The search term. For this placeholder service, the query is ignored.
        count (int): The number of images to return.

    Returns:
        list: A list of dictionaries, where each dictionary contains image URLs.
              Example: [{'thumbnail': '...', 'original': '...'}]

    Raises:
        ImageSearchError: If the API request fails.
    """
    try:
        # Using picsum.photos to get a list of random images as a placeholder
        # The 'page' and 'limit' parameters help get different sets of images
        api_url = f"https://picsum.photos/v2/list?page=1&limit={count}"
        
        response = requests.get(api_url, timeout=10)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        results = response.json()
        
        # Format the results to match what our frontend will expect
        formatted_results = [
            {
                "thumbnail": f"https://picsum.photos/id/{item['id']}/200/200", # Smaller thumbnail
                "original": item['download_url'] # Full-size image URL
            }
            for item in results
        ]
        
        return formatted_results

    except requests.exceptions.RequestException as e:
        print(f"Error fetching images from external API: {e}")
        raise ImageSearchError("Failed to connect to the image search service.")
    except Exception as e:
        print(f"An unexpected error occurred during image search: {e}")
        raise ImageSearchError("An unexpected error occurred while searching for images.")