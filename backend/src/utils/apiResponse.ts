export const sendSuccess = (res: any, data: any = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res: any, code: string, message: string, statusCode = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};
