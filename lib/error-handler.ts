import { toast } from 'sonner'

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public code: string
  public statusCode: number
  public isOperational: boolean

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error codes for the application
 */
export const ErrorCodes = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Database errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_DUPLICATE: 'DB_DUPLICATE',
  
  // Business logic errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  RAFFLE_CLOSED: 'RAFFLE_CLOSED',
  EVENT_FULL: 'EVENT_FULL',
  TICKET_ALREADY_SOLD: 'TICKET_ALREADY_SOLD',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const

/**
 * Error messages in Spanish
 */
const errorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ErrorCodes.AUTH_UNAUTHORIZED]: 'No tienes permiso para realizar esta acción.',
  [ErrorCodes.AUTH_FORBIDDEN]: 'Acceso denegado.',
  [ErrorCodes.VALIDATION_ERROR]: 'Por favor, verifica los datos ingresados.',
  [ErrorCodes.INVALID_INPUT]: 'Datos inválidos.',
  [ErrorCodes.DB_CONNECTION_ERROR]: 'Error de conexión con la base de datos.',
  [ErrorCodes.DB_QUERY_ERROR]: 'Error al procesar la solicitud.',
  [ErrorCodes.DB_NOT_FOUND]: 'El registro no fue encontrado.',
  [ErrorCodes.DB_DUPLICATE]: 'Este registro ya existe.',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Fondos insuficientes para realizar esta operación.',
  [ErrorCodes.BUDGET_EXCEEDED]: 'El presupuesto ha sido excedido.',
  [ErrorCodes.RAFFLE_CLOSED]: 'Esta rifa ya ha sido cerrada.',
  [ErrorCodes.EVENT_FULL]: 'El evento ha alcanzado su capacidad máxima.',
  [ErrorCodes.TICKET_ALREADY_SOLD]: 'Este número de boleto ya ha sido vendido.',
  [ErrorCodes.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
  [ErrorCodes.TIMEOUT_ERROR]: 'La solicitud tardó demasiado. Intenta de nuevo.',
  [ErrorCodes.UNKNOWN_ERROR]: 'Ha ocurrido un error inesperado.',
  [ErrorCodes.SERVER_ERROR]: 'Error del servidor. Intenta más tarde.',
}

/**
 * Get error message from code
 */
export const getErrorMessage = (code: string): string => {
  return errorMessages[code] || errorMessages[ErrorCodes.UNKNOWN_ERROR]
}

/**
 * Handle error and show toast notification
 */
export const handleError = (error: unknown, showToast: boolean = true): AppError => {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    // Parse common error patterns
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      appError = new AppError(
        getErrorMessage(ErrorCodes.NETWORK_ERROR),
        ErrorCodes.NETWORK_ERROR,
        0
      )
    } else if (message.includes('timeout')) {
      appError = new AppError(
        getErrorMessage(ErrorCodes.TIMEOUT_ERROR),
        ErrorCodes.TIMEOUT_ERROR,
        408
      )
    } else if (message.includes('unauthorized') || message.includes('401')) {
      appError = new AppError(
        getErrorMessage(ErrorCodes.AUTH_UNAUTHORIZED),
        ErrorCodes.AUTH_UNAUTHORIZED,
        401
      )
    } else if (message.includes('forbidden') || message.includes('403')) {
      appError = new AppError(
        getErrorMessage(ErrorCodes.AUTH_FORBIDDEN),
        ErrorCodes.AUTH_FORBIDDEN,
        403
      )
    } else if (message.includes('not found') || message.includes('404')) {
      appError = new AppError(
        getErrorMessage(ErrorCodes.DB_NOT_FOUND),
        ErrorCodes.DB_NOT_FOUND,
        404
      )
    } else {
      appError = new AppError(error.message, ErrorCodes.UNKNOWN_ERROR)
    }
  } else {
    appError = new AppError(
      getErrorMessage(ErrorCodes.UNKNOWN_ERROR),
      ErrorCodes.UNKNOWN_ERROR
    )
  }

  // Log error for debugging
  console.error('[AppError]', {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    stack: appError.stack,
  })

  // Show toast notification
  if (showToast) {
    toast.error(appError.message)
  }

  return appError
}

/**
 * Create specific error instances
 */
export const createAuthError = (code: keyof typeof ErrorCodes) => {
  return new AppError(getErrorMessage(code), code, 401)
}

export const createValidationError = (message: string) => {
  return new AppError(message, ErrorCodes.VALIDATION_ERROR, 400)
}

export const createNotFoundError = (resource: string) => {
  return new AppError(`${resource} no encontrado`, ErrorCodes.DB_NOT_FOUND, 404)
}

export const createDuplicateError = (resource: string) => {
  return new AppError(`${resource} ya existe`, ErrorCodes.DB_DUPLICATE, 409)
}

/**
 * Async error wrapper for API routes
 */
export const asyncHandler = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args) as ReturnType<T>
    } catch (error) {
      throw handleError(error, false)
    }
  }
}

/**
 * Format error for API response
 */
export const formatErrorResponse = (error: AppError) => {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
    },
  }
}

/**
 * Validate and throw if invalid
 */
export const validateOrThrow = <T>(
  data: T,
  validator: (data: T) => boolean,
  errorMessage: string
): void => {
  if (!validator(data)) {
    throw createValidationError(errorMessage)
  }
}
