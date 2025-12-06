const jwt = require('jsonwebtoken');

const generateToken = (id, role, name, email) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
  return jwt.sign({ id, role, name, email }, secret, {
    expiresIn: '24h',
  });
};

module.exports = generateToken;