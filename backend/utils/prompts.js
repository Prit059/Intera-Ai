const questionAnswerPrompt = (role, experience, topicsFocus, numberOfQuestions, difficulty = "mixed") => (
  `
  You are an expert technical interviewer at a top tech company (Google, Microsoft, Amazon). 
  Generate REALISTIC interview questions for a ${role} position requiring ${experience} years of experience.

  CONTEXT:
  - Role: ${role}
  - Experience Level: ${experience} years
  - Topics to Focus: ${topicsFocus || "Core concepts and best practices"}
  - Number of Questions: ${numberOfQuestions}
  - Difficulty Distribution: Mix of easy, medium, and hard questions appropriate for ${experience} years experience

  REQUIREMENTS FOR EACH QUESTION:
  1. The question MUST be realistic and actually asked in real interviews
  2. The answer MUST be detailed, accurate, and educational
  3. Include specific examples, code snippets, or scenarios where applicable
  4. For coding questions, include the actual code solution
  5. For behavioral questions, include the STAR method structure
  6. For system design, include architecture considerations

  OUTPUT FORMAT - Return ONLY this exact JSON structure:
  [
    {
      "question": "Clear, specific interview question text",
      "answer": "COMPREHENSIVE answer with explanation, examples, and key points. For coding questions, include the actual code solution.",
      "difficulty": "easy/medium/hard",
      "keyPoints": ["Key point 1 to remember", "Key point 2 to remember", "Key point 3 to remember"],
      "commonMistakes": ["Mistake 1 candidates make", "Mistake 2 candidates make"],
      "tags": ["relevant-tag-1", "relevant-tag-2", "relevant-tag-3"],
      "category": "technical/behavioral/system-design/coding",
      "estimatedTime": "2-3 minutes"
    }
  ]

  IMPORTANT GUIDELINES:
  - For ${experience} years experience, focus on ${experience < 2 ? 'fundamentals and basic concepts' : experience < 5 ? 'practical application and design patterns' : 'architecture and complex problem-solving'}
  - Ensure answers are COMPLETE and THOROUGH
  - Include REAL code examples when applicable
  - For JavaScript/Web questions, include modern ES6+ syntax
  - For backend questions, include API design considerations
  - NEVER return empty or placeholder answers

  Generate ${numberOfQuestions} high-quality interview questions now.
  `
);

const conceptExplainPrompt = (question) => (
  `
  You are an expert technical educator and mentor. Explain the following concept in detail:

  QUESTION/CONCEPT: "${question}"

  YOUR TASK:
  Create a comprehensive, educational explanation that would help a junior developer understand this concept deeply.

  REQUIREMENTS:
  1. Start with a simple, intuitive explanation (like you're explaining to a beginner)
  2. Then provide a detailed technical deep-dive
  3. Include REAL code examples with proper syntax
  4. Explain common use cases and real-world applications
  5. Cover edge cases and potential pitfalls
  6. Include best practices and industry standards
  7. Provide analogies to help understanding
  8. Mention related concepts and prerequisites

  OUTPUT FORMAT - Return ONLY this exact JSON:
  {
    "title": "Clear, concise title that captures the essence (e.g., 'Understanding JavaScript Closures')",
    "simpleExplanation": "A simple, beginner-friendly explanation using analogies and plain English",
    "detailedExplanation": "COMPREHENSIVE technical explanation with depth and nuance",
    "codeExample": "// Actual working code example\n// With comments explaining each part\nfunction example() {\n  // implementation\n}",
    "useCases": [
      "Real-world use case 1 with explanation",
      "Real-world use case 2 with explanation",
      "Real-world use case 3 with explanation"
    ],
    "commonPitfalls": [
      "Pitfall 1 and how to avoid it",
      "Pitfall 2 and how to avoid it"
    ],
    "bestPractices": [
      "Best practice 1 with reasoning",
      "Best practice 2 with reasoning"
    ],
    "keyPoints": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ],
    "relatedConcepts": ["Concept 1", "Concept 2", "Concept 3"],
    "difficulty": "beginner/intermediate/advanced",
    "estimatedReadTime": "5-7 minutes"
  }

  IMPORTANT:
  - Make the explanation THOROUGH and COMPLETE
  - Code examples MUST be syntactically correct
  - Include both theory and practical application
  - Never leave fields empty - provide meaningful content
  `
);

module.exports = { questionAnswerPrompt, conceptExplainPrompt };