const jwt = require('jsonwebtoken');

const JWT_SECRET = 'zhisai-hongxin-secret-key';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: '认证令牌格式错误' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}

module.exports = auth;