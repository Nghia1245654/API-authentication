import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Hàm tạo Access Token và Refresh Token
const generateTokens = (userId) => {
  // Tạo access token
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
  });

  // Tạo refresh token
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

  return { accessToken, refreshToken };
};


// 1. Đăng ký
export const registerUser = async ({ email, password, name }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('EMAIL_EXIST');
  }

  // Model sẽ tự động hash password nhờ pre('save')
  const newUser = await User.create({ email, password, name });

  return newUser;
};

// 2. Đăng nhập
// 1. Đăng nhập
export const loginUser = async ({ email, password }) => {
  // Kiểm tra email có tồn tại không
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  // Kiểm tra mật khẩu có đúng không
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Mật khẩu không đúng");
  }

  // Tạo token cho người dùng
  const tokens = generateTokens(user._id);

  // Lưu refresh token vào DB
  await User.findByIdAndUpdate(user._id, {
    refreshTokens: tokens.refreshToken,
  });

  // Trả về thông tin người dùng + token
  return {
    tokens,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

// 2. Refresh Token
export const refreshTokenProcess = async (refreshTokenFromCookie) => {
  // Kiểm tra refresh token có được gửi lên không
  if (!refreshTokenFromCookie) {
    throw new Error("Refresh token không tồn tại");
  }

  let decoded;
  try {
    // Giải mã refresh token
    decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (error) {
    throw new Error("Refresh token không hợp lệ");
  }

  // Kiểm tra refresh token có khớp với DB không
  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || user.refreshTokens !== refreshTokenFromCookie) {
    throw new Error("Refresh token không hợp lệ");
  }

  // Tạo access token mới
  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
    }
  );

  return {
    accessToken: newAccessToken,
  };
};
// 3. Đăng xuất
export const logoutUser = async (userId) => {
 try {
    // Xóa token khỏi cookie
     await User.findByIdAndUpdate(userId, { refreshTokens: null });
    return successResponse(res, 'Đăng xuất thành công');
  } catch (err) {
    throw new Error('LOGOUT_FAILED');
  }
};
export const getMe = async (user) => {
  return user;
};