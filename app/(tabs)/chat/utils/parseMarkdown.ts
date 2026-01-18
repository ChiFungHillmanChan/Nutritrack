/**
 * Markdown Text Parsing Utility
 *
 * Parses markdown-style **bold** text into structured segments
 * for rendering in React Native Text components.
 */

export interface TextSegment {
  text: string;
  isBold: boolean;
}

/**
 * Parse markdown-style text into structured segments for rendering.
 * Currently supports **bold** patterns.
 *
 * @param content - The markdown string to parse
 * @returns Array of text segments with bold indicators
 */
export function parseMarkdownText(content: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Match **bold** patterns
  const boldPatternRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldPatternRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ text: content.slice(lastIndex, match.index), isBold: false });
    }
    // Add bold text
    segments.push({ text: match[1], isBold: true });
    lastIndex = boldPatternRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), isBold: false });
  }

  return segments.length > 0 ? segments : [{ text: content, isBold: false }];
}
