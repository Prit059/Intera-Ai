const quizPrompt = (level, topic, numberOfQuestions) => {
  return `
Generate a JSON array of ${numberOfQuestions} multiple-choice questions on the topic "${topic}" with difficulty "${level}".

Each question should include:
- A string "question"
- An array of 4 string "options"
- A string "correctAnswer" that exactly matches one of the options.

Example:
[
  {
    "question": "What is JSX in React?",
    "options": ["A JavaScript compiler", "An extension of JavaScript syntax", "A server framework", "A type system"],
    "correctAnswer": "An extension of JavaScript syntax"
  },
  ...
]

Do NOT include any explanation or intro. Just the clean JSON array.
`;
};

module.exports = { quizPrompt };
