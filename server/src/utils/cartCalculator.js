/**
 * Reusable utility to calculate cart financials.
 * Can be imported in cart controllers and checkout/order controllers.
 * 
 * @param {Array} items - Array of cart/order items containing unitPrice and quantity
 * @returns {Object} subtotal, tax, shippingCharge, total
 */
export const calculateCartTotals = (items = []) => {
  // 1. Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.unitPrice) * Number(item.quantity));
  }, 0);

  // 2. Calculate tax (18% GST)
  const tax = Math.round(subtotal * 0.18 * 100) / 100;

  // 3. Shipping charge (Free above ₹999, else flat ₹79)
  const shippingCharge = subtotal >= 999 || subtotal === 0 ? 0 : 79;

  // 4. Calculate total
  const total = Math.round((subtotal + tax + shippingCharge) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    shippingCharge,
    total,
  };
};
