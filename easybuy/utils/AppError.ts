import { Alert } from 'react-native';

export enum ErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  CART_ERROR = 'CART_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  ORDER_ERROR = 'ORDER_ERROR',
  DELIVERY_ERROR = 'DELIVERY_ERROR',
  AI_ERROR = 'AI_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export const handleError = (error: unknown, defaultMessage: string = 'Something went wrong') => {
  if (error instanceof AppError) {
    let title = 'Error';
    switch (error.code) {
      case ErrorCode.PRODUCT_NOT_FOUND:
        title = 'Product Missing';
        break;
      case ErrorCode.OUT_OF_STOCK:
        title = 'Out of Stock';
        break;
      case ErrorCode.LOCATION_UNAVAILABLE:
        title = 'Location Error';
        break;
      case ErrorCode.NETWORK_ERROR:
        title = 'Connection Issue';
        break;
      case ErrorCode.FIREBASE_ERROR:
        title = 'Database Error';
        break;
      case ErrorCode.AUTH_ERROR:
        title = 'Authentication Error';
        break;
      case ErrorCode.CART_ERROR:
        title = 'Cart Error';
        break;
      case ErrorCode.PAYMENT_ERROR:
        title = 'Payment Failed';
        break;
      case ErrorCode.ORDER_ERROR:
        title = 'Order Issue';
        break;
      case ErrorCode.DELIVERY_ERROR:
        title = 'Delivery Error';
        break;
      case ErrorCode.AI_ERROR:
        title = 'AI Processing Error';
        break;
      case ErrorCode.UNKNOWN_ERROR:
      default:
        title = 'Unknown Error';
        break;
    }
    Alert.alert(title, error.message);
  } else if (error instanceof Error) {
    Alert.alert('Unexpected Error', error.message || defaultMessage);
  } else {
    Alert.alert('Error', defaultMessage);
  }
};
