// src/constants/listChoices.js

/**
 * Configuration mapping known list placeholder names to their predefined choices.
 * Placeholders of type 'list' not listed here will render a dynamic multi-input.
 */
export const PREDEFINED_LIST_CHOICES = {
  // Example: Add your known list placeholder names and their choices here
  nearby_amenities: ["Supermarket", "Park", "Bus Stop", "Gym", "Restaurant"],
  list_of_documents_required: [
    "Site and Block Plan",
    "Existing and Proposed Floor Plan",
    "Existing and Proposed Elevations",
    "Existing and Proposed Sections",
    "Planning statement",
    "Design and Access Statement",
    "Fire Strategy (a third party document)",
    "Heritage statement (a third party document)",
    "CIL (a third party document)",
    "Structural Survey (a third party document)",
    "Sustainable Drainage assessment (a third party document)",
    "Arboculture Statement (a third party document)",
    "Sunlight and Daylight Assessment (a third party document)",
    "Landscape Plan (a third party document)",
    "Waste management",
    "Ventilation statement (a third party document)",
    "EMAQ statement (a third party document)",
    "Noise Survey (a third party document)",
    "Radon Risk Assessment (a third party document)",
  ],
  constraints: [
    "Conservation area",
    "Article 4",
    "Flood Zone",
    "Green Belt",
    "AONB",
    "Surface flooding",
    "Listed Building",
    "Grey belt",
    "High street",
    "Restrictive covenant",
    "National Park",
    "Affordable housing",
    "Tree Preservation Orders",
    "Ecology",
    "Contaminated land",
    "Sites of Scientific Interest",
    "CIL",
  ],
  // another_list_placeholder: ["Option X", "Option Y"],
  // constraints: ["Heritage Overlay", "Flood Zone", "Vegetation Protection"], // Example
};
