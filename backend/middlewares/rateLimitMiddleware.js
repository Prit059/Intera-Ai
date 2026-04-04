const ratelimit = require('express-rate-limit');

const rateLimitMiddleware = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

module.exports = { rateLimitMiddleware };