const companyQuestionAnswerPrompt = (company, jobRole, experience, description, numberOfQuestions) => (
  `
    You are an AI trained to generate company-specific interview questions and answers.

    Task: 
    - Company: ${company}
    - Job Role: ${jobRole}
    - Experience: ${experience} year${experience > 1 ? 's' : ''}
    - Additional context: ${description || 'General interview preparation'}
    - Write ${numberOfQuestions} comprehensive interview questions.

    Question Distribution:
    - 40% Technical questions specific to the role
    - 30% Behavioral questions (company culture, scenarios, leadership)
    - 20% Company-specific questions (products, values, recent news)
    - 10% Problem-solving/case studies

    Requirements:
    - Generate realistic questions that are actually asked at ${company}
    - Include questions about ${company}'s specific technologies, products, or services
    - For technical questions, provide detailed answers with code examples when relevant
    - For behavioral questions, provide ideal answer structures and key points
    - Mention specific years or recent developments at ${company} when relevant (e.g., "Since 2020, ${company} has...")
    - Keep answers practical and interview-focused

    - Return a pure JSON array like:
    [
      {
        "question": "Question here?",
        "answer": "Detailed answer here with practical examples.",
        "type": "technical|behavioral|company|problem-solving"
      },
      ...
    ]
    Important: Do NOT add any extra text. Only return valid JSON.
  `
);

const companyConceptExplainPrompt = (question, company) => (
  `
   You are an AI trained to generate company-specific explanations for interview questions.

   Task:
   - Explain the following interview question in the context of ${company}
   - Question: "${question}"
   - Provide insights into why ${company} might ask this question
   - Include ${company}-specific examples or scenarios when relevant
   - After the explanation, provide a short title that summarizes the concept
   - If applicable, mention any year-specific context or recent developments at ${company}

   - Return the result as a valid JSON object in the following format:

  {
    "title": "Short title here (${company} context)",
    "explanation": "Explanation here with ${company} specific insights." 
  }
  
  Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
  `
);

module.exports = { companyQuestionAnswerPrompt, companyConceptExplainPrompt };