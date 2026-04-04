const jwt = require('jsonwebtoken');
const Token = require('../Models/Token.model');

const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = async (userId, role = 'user') => {
  try {
    // Create refresh token
    const refreshToken = jwt.sign(
      { id: userId, role: role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Save to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Delete old refresh tokens for this user
    await Token.deleteMany({ userId });
    
    // Create new refresh token
    await Token.create({
      userId,
      refreshToken,
      expiresAt
    });
    
    return refreshToken;
    
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

const verifyRefreshToken = async (token) => {
  try {
    // Find token in database
    const tokenDoc = await Token.findOne({ refreshToken: token });
    if (!tokenDoc) {
      throw new Error('Refresh token not found');
    }
    
    // Check if expired
    if (tokenDoc.expiresAt < new Date()) {
      await Token.deleteOne({ _id: tokenDoc._id });
      throw new Error('Refresh token expired');
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const deleteRefreshToken = async (token) => {
  await Token.deleteOne({ refreshToken: token });
};

const deleteAllUserTokens = async (userId) => {
  await Token.deleteMany({ userId });
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = await verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(decoded.id, decoded.role);
    return newAccessToken;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
  refreshAccessToken
};