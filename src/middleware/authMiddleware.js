import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { errorResponse } from '../utils/response.js';
export const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra xem header có gửi Token không
  // Format chuẩn: "Bearer eyJhbGciOiJIUzI1..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy chuỗi token phía sau chữ "Bearer "
      token = req.headers.authorization.split(' ')[1];

      // 2. Giải mã Token (Verify)
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // 3. Tìm user tương ứng với token đó và gắn vào req.user
      // req.user sẽ được dùng ở các Controller phía sau
      req.user = await User.findById(decoded.id).select('-password'); // Bỏ qua field password

      return next(); // Cho phép đi tiếp
    } catch (err) {
      console.log('❌ Token verification error:', err.message);
      return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 401, 'TOKEN_INVALID');
    }
  }

  // Nếu không có token trong header
  return errorResponse(res, 'Bạn chưa đăng nhập', 401, 'NOT_AUTHORIZED');
};
export const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user đã có được từ middleware 'protect' chạy trước đó
        // 1) Nếu protect chưa gán req.user → lỗi 401
    if (!req.user) {
      return errorResponse(
        res,
        'Bạn chưa đăng nhập hoặc token không hợp lệ',
        401,
        'UNAUTHENTICATED'
      );
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 
        'Bạn không có quyền thực hiện hành động này', 
        403, 
        'FORBIDDEN'
      );
    }
    next();
  };
};