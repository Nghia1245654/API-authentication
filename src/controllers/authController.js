import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body); 
    return successResponse(res, 'Đăng ký thành công', newUser, 201);
  } catch (err) {
       if (err.message === 'EMAIL_EXIST') {
      return errorResponse(res, 'Email đã được đăng ký', 400, 'EMAIL_ALREADY_REGISTERED');
    }
    return errorResponse(res, 'Lỗi hệ thống', 500, err.message);
  }
};
const COOKIE_OPTIONS = {
  httpOnly: true, // Cookie chỉ đọc từ server, client không truy cập được → tăng bảo mật
  secure: false, // Để false khi chạy local. Lên production (HTTPS) thì set thành true
  sameSite: 'strict', // Giảm nguy cơ tấn công CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000 // Thời gian sống của cookie: 7 ngày
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Gọi service đăng nhập, trả về token + thông tin người dùng
    const { tokens, user } = await authService.loginUser({ email, password });

    // Lưu refreshToken vào cookie httpOnly
    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);

    // Trả về accessToken + thông tin user cho client
    res.status(200).json({
      accessToken: tokens.accessToken,
      user,
    });
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return errorResponse(res, 'Sai mật khẩu hoặc tài khoản', 401, 'INVALID_CREDENTIALS');
    }
   
    return errorResponse(res, 'Lỗi hệ thống', 500, err.message);
  }
};
// 2. Controller refresh token
export const refresh = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const refreshTokenFromCookie = req.cookies.refreshToken;
    
    console.log('🍪 Cookies received:', req.cookies);
    console.log('🔑 Refresh token from cookie:', refreshTokenFromCookie);

    // Gọi service để tạo access token mới
    const tokens = await authService.refreshTokenProcess(refreshTokenFromCookie);

    res.status(200).json({
      message: "Lấy token mới thành công",
      accessToken: tokens.accessToken,
    });

  } catch (error) {
    console.log('❌ Refresh token error:', error.message);
    res.status(401).json({ message: error.message });
  }
};

// Hàm này cần đăng nhập mới gọi được
export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user);
    return successResponse(res, 'Lấy thông tin thành công', user);
  } catch (err) {
    return errorResponse(res, 'Lỗi hệ thống', 500, err.message);
  }
};
// hàm logout
export const logout = async (req, res) => {
  try {
     if (req.user) await authService.logoutUser(req.user.id);
    // Xóa cookie refreshToken
    res.clearCookie('refreshToken');
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (err) {
    return errorResponse(res, 'Lỗi hệ thống', 500, err.message);
  }
};