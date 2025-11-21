
import { QAItem } from './types';

export const DEFAULT_QA_ITEMS: QAItem[] = [
  {
    id: 1,
    question: "How does the card expansion work?",
    answer: "On desktop, simply hover your mouse over the question to see the answer. Move it away to close. On mobile or touch devices, tap the question to toggle the answer open and closed."
  },
  {
    id: 2,
    question: "Can I upload my own questions?",
    answer: "Yes! Click the 'Upload JSON' button in the header. Your file should be a JSON object containing an 'items' array, where each item has a 'question' and 'answer'."
  },
  {
    id: 3,
    question: "Is this accessible for screen readers?",
    answer: "Absolutely. The board uses proper ARIA attributes (aria-expanded, aria-controls) and semantic HTML buttons. You can navigate through questions using the Tab key and toggle them with Enter or Space."
  },
  {
    id: 4,
    question: "What about layout on different screens?",
    answer: "The layout adapts automatically using a masonry-style approach. It shows 1 column on mobile, 2 on tablets, and 3 on larger desktop screens."
  },
  {
    id: 5,
    question: "Is there a strict JSON format?",
    answer: "The system expects a JSON file with a root object containing an 'items' array. Each object in the array needs 'id', 'question', and 'answer' properties."
  },
  {
    id: 6,
    question: "Does it support dark mode?",
    answer: "Currently, the design is optimized for a clean, light theme with high contrast for readability, but the codebase uses Tailwind CSS, making theming easy to implement in the future."
  },
  {
    id: 7,
    question: "Performance with many items?",
    answer: "The app is built with React and optimized for rendering. It handles lists of hundreds of items smoothly by only updating the DOM where necessary."
  }
];
