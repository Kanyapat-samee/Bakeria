export function clearGuestCart() {
    try {
      localStorage.removeItem('bakeria-cart')
      console.log('[Cart] Guest cart cleared on logout')
    } catch (e) {
      console.warn('[Cart] Failed to clear guest cart:', e)
    }
  }
  