export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const catchAsync = (fn: (c: any) => Promise<any>) => {
  return async (c: any) => {
    try {
      return await fn(c);
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof AppError) {
        return c.json({ message: error.message }, error.statusCode);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  };
};
