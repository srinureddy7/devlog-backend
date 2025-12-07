import { Response } from 'express';

interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response<IApiResponse<T>> {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    error?: string
  ): Response<IApiResponse<null>> {
    const response: IApiResponse<null> = {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: any[],
    message: string = 'Validation Failed'
  ): Response<IApiResponse<null>> {
    const response: IApiResponse<null> = {
      success: false,
      message,
      error: errors.map(err => err.msg).join(', '),
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }
}

export default ApiResponse;