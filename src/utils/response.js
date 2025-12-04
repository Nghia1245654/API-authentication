//dùng xử lý thành công (mặc định status = 200)
export const successResponse = (res, data, message = "Success") => {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
}
//dùng xử lý lỗi (mặc định status = 400)
export const errorResponse = (res, message, status = 400,errorcode = null) => {
    return res.status(status).json({
        success: false,
        message,
        errorcode,
    });
}