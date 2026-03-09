/**
 * Formats a comment as a compact `file:line: comment` string.
 * Used for both copy-to-clipboard and the synthetic text part sent to OpenCode.
 */
export function formatCommentNote(
  filePath: string,
  lineNumber: number,
  comment: string,
): string {
  return `${filePath}:${lineNumber}: ${comment}`
}
