const ALLOWED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "example.com"
];

const CHARUSAT_BRANCHES = [
  "ce", "cse", "aiml", "it", "ec", "bba", "bca", "me"
];

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  // Basic email syntax check
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(email)) return false;

  const lower = email.toLowerCase().trim();
  const [localPart, domain] = lower.split("@");

  if (!domain || !localPart) return false;

  // Allow common public providers
  if (ALLOWED_DOMAINS.includes(domain)) return true;

  // CHARUSAT emails validation
  if (domain === "charusat.edu.in") {
    const branchesPattern = CHARUSAT_BRANCHES.join("|");
    const charusatRegex = new RegExp(
      `^\\d{2}(?:${branchesPattern})\\d{3}$`
    );

    return charusatRegex.test(localPart);
  }

  return false;
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: "Password is required" };
  
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 16) {
    return { isValid: false, message: "Password must not exceed 16 characters" };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];
  
  if (!hasUpperCase) {
    errors.push("at least one uppercase letter (A-Z)");
  }
  
  if (!hasLowerCase) {
    errors.push("at least one lowercase letter (a-z)");
  }
  
  if (!hasNumbers) {
    errors.push("at least one number (0-9)");
  }
  
  if (!hasSpecialChar) {
    errors.push("at least one special character (!@#$%^&* etc.)");
  }

  if (errors.length > 0) {
    return { 
      isValid: false, 
      message: `Password must contain: ${errors.join(", ")}`
    };
  }

  return { isValid: true, message: "Password is valid" };
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: "none", score: 0 };

  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Determine strength level
  if (score <= 2) return { strength: "weak", score };
  if (score <= 4) return { strength: "medium", score };
  if (score <= 6) return { strength: "strong", score };
  
  return { strength: "very strong", score };
};

export const getInitials = (title) => {
  if(!title) return "";

  const words = title.split(" ");
  let initials = "";

  for(let i=0; i < Math.min(words.length, 2); i++){
    initials = initials + words[i][0];
  }

  return initials.toUpperCase();
};