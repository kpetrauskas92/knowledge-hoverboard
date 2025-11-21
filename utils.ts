
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'as', 'from', 
  'how', 'what', 'why', 'when', 'where', 'who', 'which', 
  'this', 'that', 'these', 'those', 'it', 'its', 
  'can', 'could', 'would', 'should', 'do', 'does', 'did', 'will', 
  'questions', 'question', 'answer', 'answers', 'item', 'items',
  'i', 'you', 'he', 'she', 'they', 'we', 'my', 'your', 'format', 'file'
]);

export const getTopKeywords = (items: { question: string }[], limit = 12): string[] => {
  const wordCounts: Record<string, number> = {};

  items.forEach(item => {
    // Normalize: lowercase, remove punctuation
    const words = item.question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);

    words.forEach(word => {
      if (word.length > 2 && !STOP_WORDS.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // Sort by frequency and take top N
  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
};
