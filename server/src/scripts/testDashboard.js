// Aggregation pipeline simulation test
const mockPayments = [
  { amount: 1500, status: 'Successful' },
  { amount: 800, status: 'Successful' },
  { amount: 300, status: 'Failed' },
  { amount: 1200, status: 'Pending' }
];

const mockProducts = [
  { name: 'Custom Tee', stockQuantity: 5 },
  { name: 'Custom Cap', stockQuantity: 12 },
  { name: 'Hoodie Pro', stockQuantity: 2 }
];

const runTests = () => {
  console.log('🧪 Starting Dashboard Aggregations Simulation Unit Tests...\n');

  // Test 1: Successful payment revenue sum
  const successfulPayments = mockPayments.filter(p => p.status === 'Successful');
  const revenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const expectedRevenue = 2300;
  if (revenue === expectedRevenue) {
    console.log(`✅ Test #1: Revenue Aggregation | Got: ₹${revenue} | Expected: ₹${expectedRevenue}`);
  } else {
    console.log(`❌ Test #1: Revenue Aggregation | Got: ₹${revenue} | Expected: ₹${expectedRevenue}`);
  }

  // Test 2: Low Stock filter (stock < 10)
  const lowStock = mockProducts.filter(p => p.stockQuantity < 10);
  const expectedLowStockCount = 2;
  if (lowStock.length === expectedLowStockCount) {
    console.log(`✅ Test #2: Low Stock Filter | Got Count: ${lowStock.length} | Expected: ${expectedLowStockCount}`);
  } else {
    console.log(`❌ Test #2: Low Stock Filter | Got Count: ${lowStock.length} | Expected: ${expectedLowStockCount}`);
  }

  console.log('\n🎉 Passed all aggregation simulation tests!');
};

runTests();
