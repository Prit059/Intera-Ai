const User = require('../Models/User');
const emailservice = require('./Email.Service');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const tokenService = require('./Token.Service');

const registerService = async (userdata) => {
  try {
    const finduser = await User.findOne({ email: userdata.email });
    if(finduser){
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(userdata.password, salt);
    userdata.password = hashpassword;

    const user = await User.create({
      email: userdata.email,
      password: userdata.password,
      firstname: userdata.firstname,
      lastname: userdata.lastname,
      role: userdata.role || 'user'
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; 
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();
    
    await emailservice.sendVerificationEmail(user.email, user.verificationToken);

    const accessToken = tokenService.generateAccessToken(user.id, user.role);
    const refreshToken = await tokenService.generateRefreshToken(user.id, user.role);

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      accessToken,
      refreshToken
    }
    
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

const loginService = async (userdata) => {
  try {
    const finduser = await User.findOne({ email: userdata.email });
    if(!finduser){
      throw new Error('User not found.');
    }

    const isMatch = await finduser.comparePassword(userdata.password);
    if(!isMatch){
      throw new Error('Invalid password.');
    }

    if(!finduser.emailverified){
      throw new Error('Please verify your email before logging in.');
    }

    if(!finduser.isActive){
      throw new Error('Your account is deactivated. Please contact support.');
    }

    const accessToken = tokenService.generateAccessToken(finduser.id, finduser.role);
    const refreshToken = await tokenService.generateRefreshToken(finduser.id, finduser.role);

    return {
      id: finduser.id,
      email: finduser.email,
      firstname: finduser.firstname,
      lastname: finduser.lastname,
      role: finduser.role,
      profileImageUrl: finduser.profileImageUrl,
      mustChangePassword: finduser.teacherProfile?.mustChangePassword || false,
      accessToken,
      refreshToken
    }
  } catch (error) {
    throw error;
  }
}

const verifyEmail = async (token) => {
  try {
    const finduser = await User.findOne({ 
      verificationToken: token, 
      verificationTokenExpiry: { $gt: Date.now() } 
    });
    
    if(!finduser){
      throw new Error('Invalid or expired token.');
    }

    finduser.isActive = true;
    finduser.emailverified = true;
    finduser.verificationToken = undefined;
    finduser.verificationTokenExpiry = undefined;
    await finduser.save();

    return { success: true, message: 'Email verified successfully. You can now login.' };
  } catch (error) {
    throw error;
  }
}

const forgotpassword = async (email) => {
  try {
    const finduser = await User.findOne({ email: email });

    if(finduser){
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      finduser.passwordResetToken = hashedToken;
      finduser.passwordResetTokenExpiry = resetTokenExpiry;
      await finduser.save();
      
      await emailservice.sendResetPasswordEmail(finduser.email, resetToken);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

const resetpassword = async (token, newpassword) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const finduser = await User.findOne({ 
      passwordResetToken: hashedToken, 
      passwordResetTokenExpiry: { $gt: Date.now() } 
    });
    if(!finduser){
      throw new Error('Invalid or expired token.');
    }

    if(newpassword.length < 8){
      throw new Error('Password must be at least 8 characters.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(newpassword, salt);
    finduser.password = hashpassword;
    finduser.passwordResetToken = undefined;
    finduser.passwordResetTokenExpiry = undefined;
    
    // Clear mustChangePassword if teacher
    if(finduser.role === 'teacher' && finduser.teacherProfile) {
      finduser.teacherProfile.mustChangePassword = false;
    }
    
    await finduser.save();

    // Delete all refresh tokens for this user
    await tokenService.deleteAllUserTokens(finduser.id);

    return true;
  } catch (error) {
    throw error;
  }
}

const getprofile = async (userData) => {
  try {
    const userid = userData.id || userData;
    if (!userid) {
      throw new Error('User ID is required');
    }
    
    const user = await User.findById(userid).select('-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Get profile error:', error.message);
    throw error;
  }
}

const refreshToken = async (refreshToken) => {
  try {
    const newAccessToken = await tokenService.refreshAccessToken(refreshToken);
    return { accessToken: newAccessToken };
  } catch (error) {
    throw error;
  }
}

const logout = async (refreshToken) => {
  try {
    await tokenService.deleteRefreshToken(refreshToken);
    return true;
  } catch (error) {
    throw error;
  }
}

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    
    if (user.role === 'teacher' && user.teacherProfile) {
      user.teacherProfile.mustChangePassword = false;
    }
    
    await user.save();

    // Delete all refresh tokens (force re-login)
    await tokenService.deleteAllUserTokens(userId);

    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerService,
  loginService,
  verifyEmail,
  forgotpassword,
  resetpassword,
  getprofile,
  refreshToken,
  logout,
  changePassword
}