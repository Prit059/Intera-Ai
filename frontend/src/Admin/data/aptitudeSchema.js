// Complete schema for aptitude topics
export const aptitudeTopicSchema = {
  title: "", // "Percentages"
  slug: "", // "percentages"
  category: "", // "Quantitative Aptitude"
  subCategory: "", // "Arithmetic"
  description: "",
  icon: "📊", // Emoji or icon name
  colorScheme: "blue", // For UI theme
  
  // Main sections
  conceptExplanation: {
    summary: "", // Short summary (2-3 lines)
    detailedExplanation: "", // Detailed explanation with points
    keyPoints: [] // ["Point 1", "Point 2"]
  },
  
  importantFormulas: [
    {
      id: 1,
      formula: "Percentage = (Part/Whole) × 100",
      explanation: "Basic percentage calculation",
      variables: [
        { name: "Part", description: "The portion being measured" },
        { name: "Whole", description: "Total quantity" }
      ],
      example: {
        problem: "If 25 out of 100 students passed, what percentage passed?",
        solution: "Percentage = (25/100) × 100 = 25%"
      },
      usage: "Basic percentage problems"
    }
  ],
  
  solvedExamples: [
    {
      id: 1,
      question: "A number increased by 20% gives 180. Find the original number.",
      solutionSteps: [
        "Let original number = x",
        "Increased number = x + 20% of x = 1.2x",
        "1.2x = 180",
        "x = 180/1.2 = 150"
      ],
      explanation: "When a number increases by 20%, it becomes 1.2 times",
      difficulty: "Easy",
      timeRequired: "30 seconds",
      formulaUsed: "Percentage Increase"
    }
  ],
  
  practiceQuestions: [
    {
      id: 1,
      question: "If the price of sugar increases by 25%, by what percent should a housewife reduce consumption to keep expenditure same?",
      options: ["20%", "25%", "16.67%", "15%"],
      correctAnswer: "20%",
      solution: "Let original price = ₹100, increased price = ₹125\nLet original consumption = 100 units\nOriginal expenditure = 100×100 = ₹10000\nNew consumption = 10000/125 = 80 units\nReduction = (100-80)/100×100 = 20%",
      difficulty: "Medium",
      category: "Percentage",
      hint: "Use unitary method",
      timeLimit: 60 // seconds
    }
  ],
  
  commonMistakes: [
    "Confusing percentage increase with percentage points",
    "Forgetting to convert percentage to decimal before calculation",
    "Mixing up base value in successive percentage changes"
  ],
  
  timeSavingTricks: [
    "For x% increase, equivalent single decrease = [x/(100+x)]×100",
    "10% of a number = move decimal one place left",
    "Successive changes: Use multiplication factors instead of adding percentages"
  ],
  
  difficulty: "Medium", // Easy/Medium/Hard
  estimatedPreparationTime: 120, // minutes
  prerequisiteTopics: ["basic-arithmetic", "fractions"],
  tags: ["percentage", "aptitude", "quantitative"],
  popularity: 0, // Will be updated based on user interactions
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublished: true
};

// Initial data for testing
export const initialTopics = [
  {
    id: 1,
    title: "Percentages",
    slug: "percentages",
    category: "Quantitative Aptitude",
    subCategory: "Arithmetic",
    description: "Master percentage calculations for aptitude tests",
    icon: "📊",
    colorScheme: "blue",
    
    conceptExplanation: {
      summary: "Percentage means per hundred. It's a way to express a number as a fraction of 100.",
      detailedExplanation: "Percentage is one of the most important topics in quantitative aptitude. It's used in profit-loss, interest, data interpretation, and many other topics. Understanding percentages is fundamental to solving many aptitude problems.",
      keyPoints: [
        "Percentage = (Value/Total Value) × 100",
        "To convert percentage to fraction: divide by 100",
        "To convert fraction to percentage: multiply by 100"
      ]
    },
    
    importantFormulas: [
      {
        id: 1,
        formula: "Percentage = (Part/Whole) × 100",
        explanation: "To find what percentage one number is of another",
        variables: [
          { name: "Part", description: "The portion being measured" },
          { name: "Whole", description: "Total quantity" }
        ],
        example: {
          problem: "If 30 out of 150 students are girls, what percentage are girls?",
          solution: "Percentage = (30/150) × 100 = 20%"
        },
        usage: "Finding percentage composition"
      },
      {
        id: 2,
        formula: "Percentage Change = [(New - Original)/Original] × 100",
        explanation: "Calculate percentage increase or decrease",
        variables: [
          { name: "New", description: "New value after change" },
          { name: "Original", description: "Original value before change" }
        ],
        example: {
          problem: "Price increased from ₹80 to ₹100. Find percentage increase.",
          solution: "Increase = [(100-80)/80] × 100 = 25%"
        },
        usage: "Price changes, growth rates"
      }
    ],
    
    solvedExamples: [
      {
        id: 1,
        question: "A number increased by 20% gives 180. Find the original number.",
        solutionSteps: [
          "Let original number = x",
          "Increased number = x + 20% of x = 1.2x",
          "1.2x = 180",
          "x = 180/1.2 = 150"
        ],
        explanation: "When a number increases by 20%, it becomes 1.2 times the original",
        difficulty: "Easy",
        timeRequired: "30 seconds",
        formulaUsed: "Percentage Increase"
      },
      {
        id: 2,
        question: "If the price of an article is first increased by 25% and then decreased by 20%, what is the net percentage change?",
        solutionSteps: [
          "Let original price = ₹100",
          "After 25% increase = 100 × 1.25 = ₹125",
          "After 20% decrease = 125 × 0.80 = ₹100",
          "Net change = 100 - 100 = 0",
          "Net percentage change = 0%"
        ],
        explanation: "For successive percentage changes, multiply the factors",
        difficulty: "Medium",
        timeRequired: "45 seconds",
        formulaUsed: "Successive Percentage Changes"
      }
    ],
    
    practiceQuestions: [
      {
        id: 1,
        question: "If the price of sugar increases by 25%, by what percent should consumption be reduced to keep expenditure same?",
        options: ["20%", "25%", "16.67%", "15%"],
        correctAnswer: "20%",
        solution: "Let original price = ₹100, increased price = ₹125\nLet original consumption = 100 units\nOriginal expenditure = 100×100 = ₹10000\nNew consumption = 10000/125 = 80 units\nReduction = (100-80)/100×100 = 20%",
        difficulty: "Medium",
        category: "Percentage Application",
        hint: "Keep expenditure constant = Price × Consumption constant",
        timeLimit: 60
      }
    ],
    
    commonMistakes: [
      "Confusing 'increased by 20%' with 'increased to 120%'",
      "Using wrong base for percentage calculation in successive changes",
      "Forgetting that percentage decrease is not simply subtraction"
    ],
    
    timeSavingTricks: [
      "x% of y = y% of x",
      "For 10% of any number, just move decimal one place left",
      "For successive changes a% and b%, effective change = a + b + (a×b)/100"
    ],
    
    difficulty: "Medium",
    estimatedPreparationTime: 120,
    prerequisiteTopics: ["basic-arithmetic"],
    tags: ["percentage", "quantitative", "aptitude"],
    popularity: 85,
    isPublished: true
  }
];