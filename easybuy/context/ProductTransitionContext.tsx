/**
 * ProductTransitionContext
 *
 * Single source of truth for the cinematic card → PDP transition.
 * Stores:
 *  - origin: the measured screen-space bounds of the card image that was tapped
 *  - overlayRef: imperative ref to the ProductTransitionOverlay mounted in _layout.tsx
 *
 * Usage:
 *   1. On card press → measure image with measureInWindow → setOrigin(...)
 *   2. Navigate with animation:'none'
 *   3. PDP reads origin and coordinates with overlayRef
 */
import React, { createContext, useContext, useRef, useState } from 'react';

export interface TransitionOrigin {
  /** Absolute x position of the card image on the screen */
  x: number;
  /** Absolute y position of the card image on the screen */
  y: number;
  /** Width of the card image */
  width: number;
  /** Height of the card image */
  height: number;
  /** URL of the product image */
  imageUrl: string;
  /** Product ID – used so PDP can validate we have the right origin */
  productId: string;
  /** Border radius of the card image */
  borderRadius?: number;
}

// Forward declaration of interface to break circular import
export interface ProductTransitionOverlayRef {
  animateForward: (origin: TransitionOrigin, onSettled: () => void) => void;
  animateBack: (origin: TransitionOrigin, onDone: () => void) => void;
  hide: () => void;
}

interface ProductTransitionContextValue {
  origin: TransitionOrigin | null;
  setOrigin: (o: TransitionOrigin | null) => void;
  overlayRef: React.RefObject<ProductTransitionOverlayRef | null>;
}

const ProductTransitionContext = createContext<ProductTransitionContextValue>({
  origin: null,
  setOrigin: () => {},
  overlayRef: { current: null },
});

export const ProductTransitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [origin, setOrigin] = useState<TransitionOrigin | null>(null);
  const overlayRef = useRef<ProductTransitionOverlayRef | null>(null);

  // Lazy load import to avoid any dependency cycle at import execution time
  const OverlayComponent = require('../components/transition/ProductTransitionOverlay').ProductTransitionOverlay;

  return (
    <ProductTransitionContext.Provider value={{ origin, setOrigin, overlayRef }}>
      {children}
      <OverlayComponent ref={overlayRef} />
    </ProductTransitionContext.Provider>
  );
};

export const useProductTransition = () => useContext(ProductTransitionContext);
