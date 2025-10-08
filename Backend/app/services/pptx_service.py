import re
from pptx import Presentation

def extract_placeholders(file_stream):
    """
    Parses a .pptx file stream to find unique placeholders.

    Placeholders can be in the format {{name}} or {{type:name}}. If the type
    is not specified, it defaults to 'text'.

    Args:
        file_stream: A file-like object representing the .pptx file.

    Returns:
        A list of unique dictionaries, where each dictionary represents a
        placeholder with its 'name' and 'type'.
        Example: [{"name": "client", "type": "text"}, {"name": "logo", "type": "image"}]
    """
    # Regex to find placeholders in two formats: {{name}} and {{type:name}}
    # Group 1: Optional type (\w+)
    # Group 2: Mandatory name (\w+)
    pattern = re.compile(r'\{\{(?:(\w+):)?(\w+)\}\}')
    
    # Use a set to store unique (name, type) tuples to handle duplicates
    found_placeholders = set()

    prs = Presentation(file_stream)
    
    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            
            for paragraph in shape.text_frame.paragraphs:
                # Find all matches in the paragraph's text
                matches = pattern.findall(paragraph.text)
                for match in matches:
                    ph_type, ph_name = match
                    
                    # Default to "text" if the type is not specified
                    final_type = ph_type if ph_type else "text"
                    
                    found_placeholders.add((ph_name, final_type))

    # Convert the set of tuples to a sorted list of dictionaries for consistent output
    return sorted(
        [{"name": name, "type": type_} for name, type_ in found_placeholders],
        key=lambda x: x['name']
    )