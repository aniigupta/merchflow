import { checkValidTransition } from '../controllers/orderController.js';

const runTests = () => {
  console.log('🧪 Starting Order Workflow Transition Unit Tests...\n');

  const testCases = [
    { current: 'Order Placed', target: 'Payment Verified', expected: true },
    { current: 'Order Placed', target: 'Design Approved', expected: false }, // skipped Payment Verified
    { current: 'Design Approved', target: 'Printing In Progress', expected: true },
    { current: 'Printing In Progress', target: 'Quality Check', expected: true },
    { current: 'Printing In Progress', target: 'Delivered', expected: false }, // skipped multiple steps
    { current: 'Delivered', target: 'Order Placed', expected: false }, // backward transition
    { current: 'Cancelled', target: 'Order Placed', expected: false }, // cancelled state is terminal
    { current: 'Delivered', target: 'Cancelled', expected: false } // delivered state is terminal
  ];

  let passed = 0;
  testCases.forEach((tc, idx) => {
    const result = checkValidTransition(tc.current, tc.target);
    const success = result === tc.expected;
    if (success) {
      passed++;
      console.log(`✅ Test #${idx + 1}: "${tc.current}" -> "${tc.target}" | Got: ${result} | Expected: ${tc.expected}`);
    } else {
      console.log(`❌ Test #${idx + 1}: "${tc.current}" -> "${tc.target}" | Got: ${result} | Expected: ${tc.expected}`);
    }
  });

  console.log(`\n🎉 Passed ${passed}/${testCases.length} tests successfully!`);
};

runTests();
