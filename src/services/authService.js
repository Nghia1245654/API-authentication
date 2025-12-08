import { authorize } from '../middleware/authMiddleware.js';
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
export const registerUser = async ({ email, password, name ,role}) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('EMAIL_EXIST');
  }

  // Model sẽ tự động hash password nhờ pre('save')
  const newUser = await User.create({ email, password, name ,role});

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
    refreshToken: tokens.refreshToken,
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
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshTokenFromCookie) {
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
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { success: true };
  } catch (err) {
    throw new Error('LOGOUT_FAILED');
  }
};
export const getMe = async (user) => {
  return user;
};
//delete user
export const deleteUser = async (userId) => {
  try {
    // nếu user id ko tồn tại thì throw error
    if (!userId) {
      throw new Error('USER_NOT_FOUND');
    }
    await User.findByIdAndDelete(userId);
    return { success: true };
  } catch (err) {
    throw new Error('DELETE_USER_FAILED');
  }
};
//updateUser
export const updateUser = async (targetUserId, currentUserId, currentUserRole, data) => {
  // Tìm user cần update
  const user = await User.findById(targetUserId);
  
  if (!user) throw new Error('USER_NOT_FOUND');

  // CHECK QUYỀN:
  // 1. User tự update chính mình: OK
  // 2. Admin update bất kỳ ai: OK
  // 3. User update người khác: FORBIDDEN
  const isSelf = targetUserId === currentUserId;
  const isAdmin = currentUserRole === 'admin';

  if (!isSelf && !isAdmin) {
    throw new Error('FORBIDDEN'); // Không có quyền
  }

  // Hash password nếu có trong data
  if (data.password) {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  // Chỉ cho phép update các field: name, email, role, password
  const allowedUpdates = {};
  if (data.name) allowedUpdates.name = data.name;
  if (data.email) allowedUpdates.email = data.email;
  if (data.password) allowedUpdates.password = data.password;
  
  // Chỉ admin mới được đổi role
  if (data.role) {
    allowedUpdates.role = data.role;
  }

  // Cập nhật user với ID đúng và data object đúng
  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,  // ID của user cần update
    allowedUpdates, // Object chứa data update
    { new: true, runValidators: true }
  ).select('-password -refreshToken');
  
  return updatedUser;
};
//get all users
export const getAllUsers = async () => {
  try {
    const users = await User.find().select('-password -refreshToken');
    return users;
  } catch (err) {
    throw new Error('GET_ALL_USERS_FAILED');
  }
};