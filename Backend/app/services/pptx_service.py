import re
from io import BytesIO
from pptx import Presentation
from pptx.enum.text import MSO_AUTO_SIZE
from pptx.enum.dml import MSO_COLOR_TYPE

def _transfer_font_properties(source_font, target_font):
    """
    A helper function to manually copy key font properties from one
    run to another. This is a robust way to preserve styling.
    """
    target_font.name = source_font.name
    target_font.size = source_font.size
    target_font.bold = source_font.bold
    target_font.italic = source_font.italic
    target_font.underline = source_font.underline
    if source_font.color.type == MSO_COLOR_TYPE.RGB:
        target_font.color.rgb = source_font.color.rgb

def extract_placeholders(file_stream: BytesIO) -> list:
    """
    [cite_start]Parses a .pptx file stream to find unique placeholders[cite: 296].

    This function is used by the /api/upload endpoint to analyze a template
    [cite_start]without needing to search inside complex elements like tables or charts[cite: 299, 300].

    Args:
        [cite_start]file_stream: A file-like object representing the .pptx file[cite: 296].

    Returns:
        A list of unique dictionaries, where each dictionary represents a
        [cite_start]placeholder with its "name" and "type"[cite: 305, 306].
        Example: [{"name": "client", "type": "text"}, {"name": "logo", "type": "image"}]
    """
    # [cite_start]Regex to find placeholders in two formats: {{name}} and {{type:name}}[cite: 302].
    pattern = re.compile(r'\{\{(?:(\w+):)?(\w+)\}\}')
    
    # [cite_start]Use a set to store unique (name, type) tuples to handle duplicates[cite: 307].
    found_placeholders = set()

    try:
        prs = Presentation(file_stream)
        
        for slide in prs.slides:
            for shape in slide.shapes:
                if not shape.has_text_frame:
                    continue
                
                for paragraph in shape.text_frame.paragraphs:
                    # Find all matches in the paragraph's text
                    matches = pattern.findall(paragraph.text)
                    for ph_type, ph_name in matches:
                        # [cite_start]Default to "text" if the type is not specified[cite: 304].
                        final_type = ph_type if ph_type else "text"
                        found_placeholders.add((ph_name, final_type))

    except Exception as e:
        print(f"Error extracting placeholders: {e}")
        # In a real app, you might raise a custom exception here
        raise ValueError("Could not process the presentation file.")

    # Convert the set of tuples to a sorted list of dictionaries for consistent output.
    return sorted(
        [{"name": name, "type": type_} for name, type_ in found_placeholders],
        key=lambda x: x['name']
    )
    
def generate_presentation(template_stream: BytesIO, data: dict, s3_service) -> BytesIO:
    """
    Generates a presentation by manually replacing placeholders in a template stream.
    This function uses the base python-pptx library for all manipulations.
    """
    ppt = Presentation(template_stream)

    for slide in ppt.slides:
        shapes_to_delete = []
        for shape in list(slide.shapes): # Use list() to allow safe deletion
            if not shape.has_text_frame:
                continue

            # --- Image Replacement Logic ---
            if '{{image:' in shape.text_frame.text:
                match = re.search(r'\{\{image:(\w+)\}\}', shape.text_frame.text)
                if match:
                    ph_name = match.group(1)
                    s3_key = data.get(ph_name)
                    
                    if s3_key:
                        try:
                            image_stream = s3_service.download_file_as_stream(s3_key)
                            slide.shapes.add_picture(
                                image_stream, shape.left, shape.top, 
                                width=shape.width, height=shape.height
                            )
                            shapes_to_delete.append(shape)
                        except Exception as e:
                            print(f"ERROR: Could not add image for '{ph_name}'. Details: {e}")
                            shape.text_frame.text = f"[Image Error]"
                    else:
                        shape.text_frame.text = f"[Image Missing: {ph_name}]"
                    continue # Skip other replacements for this shape

            # --- List Replacement Logic ---
            if '{{list:' in shape.text_frame.text:
                match = re.search(r'\{\{list:(\w+)\}\}', shape.text_frame.text)
                if match:
                    ph_name = match.group(1)
                    items = data.get(ph_name, [])
                    
                    tf = shape.text_frame
                    tf.clear() # Clear existing placeholder text

                    if items and isinstance(items, list):
                        # Set the first item in the first paragraph
                        p = tf.paragraphs[0] if tf.paragraphs else tf.add_paragraph()
                        p.text = str(items[0])
                        p.level = 0
                        
                        # Add subsequent items as new paragraphs
                        for item in items[1:]:
                            p = tf.add_paragraph()
                            p.text = str(item)
                            p.level = 0
                        
                        # Disable auto-fitting for the shape to prevent text shrinking
                        tf.auto_size = MSO_AUTO_SIZE.NONE
                    else:
                        # Handle case where data is missing or not a list
                        p = tf.add_paragraph()
                        p.text = f"[List data for '{ph_name}' is invalid or missing]"
                    continue

            # --- Text Replacement Logic (preserving formatting) ---
                        # --- Text Replacement Logic (preserving formatting) ---
            for para in shape.text_frame.paragraphs:
                full_text = ''.join(run.text for run in para.runs)
                if '{{' not in full_text:
                    continue

                matches = re.findall(r'\{\{(?:text:)?(\w+)\}\}', full_text)
                for ph_name in matches:
                    replacement_value = str(data.get(ph_name, ""))
                    placeholder_tag = f"{{{{text:{ph_name}}}}}"
                    simple_placeholder_tag = f"{{{{{ph_name}}}}}"
                    
                    current_text = "".join(run.text for run in para.runs)
                    
                    if placeholder_tag in current_text or simple_placeholder_tag in current_text:
                        # THE FIX: Instead of .duplicate(), we read the font properties
                        # from the first run and apply them to the new, combined run.
                        source_font = para.runs[0].font if para.runs else None
                        
                        # Replace placeholder in the full text string
                        if placeholder_tag in current_text:
                           new_text = current_text.replace(placeholder_tag, replacement_value)
                        else:
                           new_text = current_text.replace(simple_placeholder_tag, replacement_value)
                        
                        # Clear old runs and create a new one
                        para.clear()
                        new_run = para.add_run()
                        new_run.text = new_text
                        
                        # Apply the saved font properties
                        if source_font:
                            _transfer_font_properties(source_font, new_run.font)
                        
        # After iterating all shapes, delete the placeholder shapes
        for shape in shapes_to_delete:
            sp_element = shape.element
            sp_element.getparent().remove(sp_element)

    # Save the final presentation to a new in-memory stream
    output_stream = BytesIO()
    ppt.save(output_stream)
    output_stream.seek(0)
    
    return output_stream
