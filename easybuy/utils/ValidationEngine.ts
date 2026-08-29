import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppError, ErrorCode } from './AppError';

export interface ValidationResult {
  isValid: boolean;
  product?: any;
  error?: AppError;
}

export class ValidationEngine {
  /**
   * Verifies a product directly against the Firebase source of truth.
   * Checks existence, active status, price matching, and stock.
   */
  static async validateProductForPurchase(
    productId: string,
    requestedQuantity: number,
    expectedPriceStr?: string
  ): Promise<ValidationResult> {
    try {
      const docRef = doc(db, 'products', productId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        return {
          isValid: false,
          error: new AppError(ErrorCode.PRODUCT_NOT_FOUND, 'This product is no longer available in our catalog.'),
        };
      }

      const product = snap.data();

      // 1. Check if product is active/discontinued
      if (product.isActive === false || product.isDiscontinued) {
        return {
          isValid: false,
          error: new AppError(ErrorCode.PRODUCT_NOT_FOUND, 'This product has been discontinued and cannot be purchased.'),
        };
      }

      // 2. Check Stock Integrity
      const currentStock = Number(product.stock || product.inventory || 0);
      if (currentStock < requestedQuantity) {
        return {
          isValid: false,
          error: new AppError(
            ErrorCode.OUT_OF_STOCK,
            currentStock === 0 
              ? 'This product is currently out of stock.' 
              : `Only ${currentStock} units available. Please reduce your quantity.`
          ),
        };
      }

      // 3. Check Price Integrity (if expectedPrice is provided)
      if (expectedPriceStr) {
        const expectedNumeric = parseInt(String(expectedPriceStr).replace(/[^\d]/g, ''), 10) || 0;
        const actualNumeric = parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 0;

        if (expectedNumeric !== actualNumeric) {
          return {
            isValid: false,
            product, // Return the product so the UI can update the price
            error: new AppError(
              ErrorCode.UNKNOWN_ERROR, // Or a specific PRICE_CHANGED error if we added it, but we'll use a descriptive message
              `The price of this item has changed from ₹${expectedNumeric} to ₹${actualNumeric}. Please review your cart.`
            ),
          };
        }
      }

      return { isValid: true, product };
    } catch (e) {
      console.error('[ValidationEngine] Error validating product:', e);
      return {
        isValid: false,
        error: new AppError(ErrorCode.FIREBASE_ERROR, 'Could not verify product details with the server. Please check your connection.'),
      };
    }
  }

  /**
   * Validates an entire cart array before checkout.
   * Throws an AppError if ANY item fails validation.
   */
  static async validateCartItems(cartItems: any[]): Promise<boolean> {
    if (!cartItems || cartItems.length === 0) {
      throw new AppError(ErrorCode.CART_ERROR, 'Your cart is empty.');
    }

    for (const item of cartItems) {
      const result = await this.validateProductForPurchase(item.id, item.quantity, item.price);
      if (!result.isValid && result.error) {
        // If it's a price change, we could throw a specific error, but for now we throw the generic validation error returned.
        throw result.error;
      }
    }

    return true;
  }
}
