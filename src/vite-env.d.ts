/// <reference types="vite/client" />

// Allow using the Babylon Viewer custom element in TSX without type errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'babylon-viewer': any;
    }
  }
}
export {};
