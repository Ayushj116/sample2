export const calculateEscrowFee = (amount, userType = 'personal') => {
  let percentage;
  let minFee;
  let maxFee;

  if (userType === 'business') {
    percentage = 0.02; // 2.0% for business
    minFee = 1000;     // Minimum ₹1,000
    maxFee = 50000;    // Maximum ₹50,000
  } else {
    percentage = 0.025; // 2.5% for personal
    minFee = 500;       // Minimum ₹500
    maxFee = 25000;     // Maximum ₹25,000
  }

  const calculatedFee = amount * percentage;
  const fee = Math.min(Math.max(calculatedFee, minFee), maxFee);

  const gst = fee * 0.18;
  const totalFee = fee + gst;

  return {
    amount,
    percentage: percentage * 100,
    baseFee: fee,
    gst,
    totalFee,
    breakdown: {
      escrowFee: fee,
      gst,
      total: totalFee
    }
  };
};

export const calculatePaymentGatewayFee = (amount, paymentMethod) => {
  let gatewayFee = 0;
  
  switch (paymentMethod) {
    case 'upi':
      gatewayFee = Math.min(amount * 0.005, 15);
      break;
    case 'netbanking':
      gatewayFee = Math.min(amount * 0.009, 25);
      break;
    case 'debit_card':
      gatewayFee = Math.min(amount * 0.008, 20);
      break;
    case 'credit_card':
      gatewayFee = Math.min(amount * 0.018, 50);
      break;
    case 'wallet':
      gatewayFee = Math.min(amount * 0.004, 10);
      break;
    default:
      gatewayFee = Math.min(amount * 0.01, 30);
  }

  const gst = gatewayFee * 0.18;
  const totalGatewayFee = gatewayFee + gst;

  return {
    baseFee: gatewayFee,
    gst,
    totalFee: totalGatewayFee
  };
};