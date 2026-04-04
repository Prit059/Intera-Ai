const tokenService = require('../services/Token.Service');
const AuthService = require('../services/Auth.Service');

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const userId = await tokenService.verifyRefreshToken(refreshToken);
    
    // Delete old refresh token
    await tokenService.deleteRefreshToken(refreshToken);
    
    // Get user
    const user = await AuthService.getprofile(userId);
    
    // Generate new tokens
    const newAccessToken = tokenService.generateAccessToken(userId);
    const newRefreshToken = await tokenService.generateRefreshToken(userId);
    
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
          },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {

    
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    await tokenService.deleteRefreshToken(refreshToken);
    
    res.json({ success: true, message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error details:', error);
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
};
module.exports = { refreshToken, logout };