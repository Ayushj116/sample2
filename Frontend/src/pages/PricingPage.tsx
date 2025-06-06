import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  Calculator, 
  Shield, 
  Clock, 
  Star,
  ArrowRight,
  Zap,
  Award,
  Users,
  Building,
  CreditCard
} from 'lucide-react';

const PricingPage = () => {
  const [calculatorAmount, setCalculatorAmount] = useState(250000);

  const plans = [
    {
      name: 'Personal',
      description: 'Perfect for individual buyers and sellers',
      fee: '2.5%',
      minFee: '₹500',
      maxFee: '₹25,000',
      color: 'border-blue-200',
      headerColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Escrow protection up to ₹10 lakhs',
        'Standard KYC verification',
        'Email & SMS notifications',
        'Digital contract signing',
        '3-7 day inspection period',
        'Basic customer support',
        'Transaction history',
        'Mobile optimized interface'
      ],
      limitations: [
        'Business verification not included',
        'No priority support',
        'Standard processing time'
      ],
      popular: false
    },
    {
      name: 'Business',
      description: 'For businesses and high-value transactions',
      fee: '2.0%',
      minFee: '₹1,000',
      maxFee: '₹50,000',
      color: 'border-green-500',
      headerColor: 'bg-green-50',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      features: [
        'Escrow protection up to ₹1 crore',
        'Business KYC & GST verification',
        'Priority email & SMS support',
        'Advanced contract templates',
        'Flexible inspection periods',
        'Dedicated account manager',
        'Detailed transaction analytics',
        'API integration support',
        'Bulk transaction discounts',
        'White-label solutions'
      ],
      limitations: [
        'Minimum transaction ₹50,000'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      fee: 'Custom',
      minFee: 'Negotiable',
      maxFee: 'Volume-based',
      color: 'border-purple-200',
      headerColor: 'bg-purple-50',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      features: [
        'Unlimited transaction value',
        'Custom compliance workflows',
        '24/7 phone & email support',
        'Custom contract templates',
        'Flexible terms & conditions',
        'Dedicated success team',
        'Advanced reporting & analytics',
        'Full API access',
        'Custom integrations',
        'On-premise deployment options',
        'SLA guarantees',
        'Training & onboarding'
      ],
      limitations: [],
      popular: false
    }
  ];

  const additionalFees = [
    {
      service: 'Failed Payment Recovery',
      fee: '₹100 + gateway charges',
      description: 'When buyer payment fails and needs to be retried'
    },
    {
      service: 'Dispute Resolution',
      fee: '₹2,500 per case',
      description: 'Manual intervention for disputed transactions'
    },
    {
      service: 'Document Verification',
      fee: '₹500 per additional document',
      description: 'Extra documents beyond standard KYC requirements'
    },
    {
      service: 'Express Processing',
      fee: '1% additional',
      description: 'Priority processing within 24 hours'
    },
    {
      service: 'International Wire',
      fee: '₹2,000 + bank charges',
      description: 'Cross-border payments (future feature)'
    }
  ];

  const calculateFee = (amount: number, plan: string) => {
    let percentage = 0.025; // Personal plan default
    let minFee = 500;
    let maxFee = 25000;

    if (plan === 'Business') {
      percentage = 0.02;
      minFee = 1000;
      maxFee = 50000;
    }

    const calculatedFee = amount * percentage;
    return Math.min(Math.max(calculatedFee, minFee), maxFee);
  };

  const comparisonFeatures = [
    { feature: 'Transaction Value Limit', personal: '₹10 lakhs', business: '₹1 crore', enterprise: 'Unlimited' },
    { feature: 'KYC Verification', personal: 'Standard', business: 'Business + GST', enterprise: 'Custom' },
    { feature: 'Support Level', personal: 'Email/SMS', business: 'Priority', enterprise: '24/7 Dedicated' },
    { feature: 'Processing Time', personal: '2-4 hours', business: '1-2 hours', enterprise: 'Instant' },
    { feature: 'Contract Templates', personal: 'Basic', business: 'Advanced', enterprise: 'Custom' },
    { feature: 'API Access', personal: '❌', business: 'Limited', enterprise: 'Full Access' },
    { feature: 'Custom Integration', personal: '❌', business: 'Available', enterprise: 'Included' },
    { feature: 'Dedicated Manager', personal: '❌', business: '✅', enterprise: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transparent Pricing for Every Need
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              India's most competitive escrow fees with no hidden charges. 
              Choose the plan that fits your transaction requirements.
            </p>
            <div className="bg-white text-blue-600 px-6 py-3 rounded-lg inline-flex items-center font-semibold">
              <Award className="w-5 h-5 mr-2" />
              Lowest fees in India - Starting at just 2%
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-16 -mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculate Your Escrow Fee</h2>
              <p className="text-gray-600">See exactly what you'll pay before starting your transaction</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="250000"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Personal Plan Fee (2.5%)</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{calculateFee(calculatorAmount, 'Personal').toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Business Plan Fee (2.0%)</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{calculateFee(calculatorAmount, 'Business').toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  * Fees include payment gateway charges and GST. No additional hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              All plans include our core escrow protection and security features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg ${plan.color} border-2 relative overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`${plan.headerColor} p-6 ${plan.popular ? 'pt-12' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.fee}</span>
                    {plan.fee !== 'Custom' && <span className="text-gray-600"> per transaction</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Min: {plan.minFee}</div>
                    <div>Max: {plan.maxFee}</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <X className="w-5 h-5 text-red-400" />
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/create-deal"
                    className={`w-full ${plan.buttonColor} text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Detailed Plan Comparison
            </h2>
            <p className="text-xl text-gray-600">
              Compare features across all our pricing tiers
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Personal</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Business</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{item.personal}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{item.business}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{item.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600">
              Optional services with transparent, pay-as-you-go pricing
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {additionalFees.map((service, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.service}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-blue-600">{service.fee}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Safe Transfer?
            </h2>
            <p className="text-xl text-gray-600">
              The most competitive and transparent pricing in the Indian market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lowest Fees</h3>
              <p className="text-gray-600">
                Up to 50% lower than traditional escrow services with no hidden charges
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Processing</h3>
              <p className="text-gray-600">
                Fastest KYC verification and transaction processing in the industry
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Secure</h3>
              <p className="text-gray-600">
                Bank-grade security with zero fraud incidents and full insurance coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Save on Your Next Transaction?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have saved money and time 
            with Safe Transfer's transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-deal"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center"
            >
              Start Your Deal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/how-it-works"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;