import { AppError, ErrorCode, handleError } from './AppError';
import { Alert } from 'react-native';

/**
 * DevTools for simulating edge cases safely in the UI
 * without altering production logic or Firebase state.
 */
export class DevTools {
  static simulateError(code: ErrorCode) {
    let msg = 'Simulated error message for development testing.';
    
    switch(code) {
      case ErrorCode.PRODUCT_NOT_FOUND:
        msg = 'Simulated: Product deleted from database.';
        break;
      case ErrorCode.OUT_OF_STOCK:
        msg = 'Simulated: Product just went out of stock during checkout.';
        break;
      case ErrorCode.PAYMENT_ERROR:
        msg = 'Simulated: Payment gateway timed out.';
        break;
      case ErrorCode.LOCATION_UNAVAILABLE:
        msg = 'Simulated: Delivery not available in this pin code.';
        break;
    }

    const err = new AppError(code, msg);
    handleError(err);
  }

  static triggerTestMenu() {
    Alert.alert(
      'Developer Test Mode',
      'Select a scenario to simulate:',
      [
        { text: 'Simulate Out of Stock', onPress: () => this.simulateError(ErrorCode.OUT_OF_STOCK) },
        { text: 'Simulate Payment Failure', onPress: () => this.simulateError(ErrorCode.PAYMENT_ERROR) },
        { text: 'Simulate Location Error', onPress: () => this.simulateError(ErrorCode.LOCATION_UNAVAILABLE) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
}
