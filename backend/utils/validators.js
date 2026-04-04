const validateRegister = (data) => {
  try {
    const error = [];
    if(!data.email || !data.password || !data.firstname || !data.lastname){
      error.push('All fields are required.');
    }

    // format
      const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(data.email && !emailregex.test(data.email)){
        error.push('Invalid email format.');
      }

      if(data.password && data.password.length < 8){
        error.push('Password must be at least 8 characters.');
      }

      const hasUpperCase = /[A-Z]/.test(data.password);
      const hasLowerCase = /[a-z]/.test(data.password);
      const hasNumbers = /\d/.test(data.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password);

      if(!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar){
        error.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      }

      //allow domain emails only
      const allowedDomains = ["gmail.com","yahoo.com"]                // you can write any domains you can access the register.

      const lower = data.email.toLowerCase();
      const domain = lower.substring(lower.lastIndexOf("@") + 1);

      if(!allowedDomains.includes(domain)){
        error.push('Only domain emails are allowed.');
      }

    return error;
  } catch (error) {
    console.log("Validators:",error.message);
    throw error;
  }
}

const validateLogin = (data) => {
  try {
    const error = [];
    if(!data.email || !data.password){
      error.push('Email and Password are required.');
    }
    return error;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}


module.exports = {
  validateRegister,
  validateLogin
}