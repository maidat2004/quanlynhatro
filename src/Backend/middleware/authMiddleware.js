import User from '../models/User.js';
import { verifyToken } from '../utils/jwtUtils.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ'
        });
      }

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token, vui lòng đăng nhập'
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ'
        });
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
  }

  return next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} không có quyền truy cập`
      });
    }
    next();
  };
};
