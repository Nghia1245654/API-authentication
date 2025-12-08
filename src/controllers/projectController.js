import * as projectService from '../services/projectService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const create = async (req, res) => {
  try {
    // req.user.id lấy từ Token
    const newProject = await projectService.createProject(req.body, req.user.id);
    return successResponse(res, newProject, 'Tạo dự án thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const updated = await projectService.updateProject(
      req.params.id, 
      req.body, 
      req.user.id,  // ID người đang thao tác
      req.user.role // Role người đang thao tác
    );
    return successResponse(res, updated, 'Cập nhật thành công');
  } catch (err) {
    if (err.message === 'FORBIDDEN') return errorResponse(res, 'Bạn không có quyền sửa dự án này', 403, 'FORBIDDEN');
    if (err.message === 'PROJECT_NOT_FOUND') return errorResponse(res, 'Không tìm thấy', 404);
    return errorResponse(res, 'Lỗi server', 500, err.message);
  }
};

// ... Các hàm delete, get tương tự
export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(
      req.params.id,
      req.user.id,  // ID người đang thao tác
      req.user.role // Role người đang thao tác
    );
    return successResponse(res, null, 'Xóa dự án thành công');
  } catch (err) {
    if (err.message === 'FORBIDDEN') return errorResponse(res, 'Bạn không có quyền xóa dự án này', 403, 'FORBIDDEN');
    if (err.message === 'PROJECT_NOT_FOUND') return errorResponse(res, 'Không tìm thấy', 404);
    return errorResponse(res, 'Lỗi server', 500, err.message);
  }
};
export const getMyProjects = async (req, res) => {
  try {
    const projects = await projectService.getMyProjects(
      req.user.id,  // ID người đang thao tác
      req.user.role // Role người đang thao tác
    );
    return successResponse(res, projects, 'Danh sách dự án');
  } catch (err) {
    return errorResponse(res, 'Lỗi server', 500, err.message);
  }
};