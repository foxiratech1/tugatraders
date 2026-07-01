/**
 * Helper function to scroll the browser window to the absolute top (0, 0).
 * Safe for Server-Side Rendering (SSR) in Next.js.
 * 
 * @param behavior The scroll behavior ('smooth' | 'instant' | 'auto'). Defaults to 'instant'.
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior,
      });
    }, 100);
  }
};
