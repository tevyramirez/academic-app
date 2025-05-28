export interface ParsedOption {
  letter: string;
  text: string;
}

/**
 * Parses options (A, B, C, D) from a question's text_content.
 * @param text The raw text_content of a question.
 * @returns An array of ParsedOption objects.
 */
export function parseOptions(text: string): ParsedOption[] {
  if (typeof text !== 'string' || !text.trim()) {
    console.warn("parseOptions received invalid or empty text, returning empty array:", text);
    return [];
  }

  try {
    // Regex tries to find lines starting with A), B), C), or D)
    // It captures the letter (A-D) and the text following it.
    // It looks ahead for the next option or the end of the string.
    const regex = /(?:^|\n)\s*([A-D])\)\s*(.+?)(?=(?:\s*\n[A-D]\)|$))/gis;
    let matches = [...text.matchAll(regex)];

    // Fallback regex if the primary one doesn't find matches (e.g. if options are not on new lines but follow " A) ... B) ...")
    if (matches.length === 0) {
      const fallbackRegex = /([A-D])\)\s*(.+?)(?=(?:\s*[A-D]\)|$))/gis;
      matches = [...text.matchAll(fallbackRegex)];
    }

    if (matches.length === 0) {
      console.warn("parseOptions: No options found for text snippet:", text.substring(0, 100) + "...");
      return [];
    }

    return matches.map((match) => {
      if (match && match.length > 2) {
        return {
          letter: match[1].toUpperCase(),
          text: match[2].trim(),
        };
      }
      console.warn("parseOptions: Invalid match structure found:", match);
      return null;
    }).filter(option => option !== null) as ParsedOption[];

  } catch (e) {
    console.error("Error in parseOptions:", e, "for text:", text);
    return [];
  }
}

/**
 * Cleans the question text by removing the option lines.
 * @param text The raw text_content of a question.
 * @returns The cleaned question statement.
 */
export function cleanQuestionText(text: string): string {
  if (typeof text !== 'string' || !text.trim()) {
    return '';
  }
  // This regex is the same as in parseOptions, used to remove the option parts.
  const cleanedText = text.replace(/(?:^|\n)\s*[A-D]\)\s*.*?(?=(?:\s*\n[A-D]\)|$))/gis, '');
  
  // Fallback if first regex did not clean anything (e.g. options are inline)
  if (cleanedText.trim() === text.trim() && text.match(/[A-D]\)/)) {
    return text.replace(/\s*[A-D]\)\s*(.+?)(?=(?:\s*[A-D]\)|$))/gis, '').trim();
  }
  return cleanedText.trim();
}
