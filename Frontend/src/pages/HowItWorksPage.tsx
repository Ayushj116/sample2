import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Users, CheckCircle, FileText, CreditCard, Handshake as HandShake, Star, ArrowDown, ArrowRight, Smartphone, Lock, Award } from 'lucide-react';

const HowItWorksPage = () => {
  const steps = [
    {
      step: '1',
      title: 'Create Escrow Deal',
      description: 'Seller or buyer initiates the escrow transaction with deal details',
      details: [
        'Enter transaction amount and item/service details',
        'Specify delivery method and inspection period',
        'Invite counterparty via email or phone',
        'Set terms and conditions for the deal'
      ],
      icon: FileText,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      step: '2',
      title: 'Identity Verification',
      description: 'Both parties complete KYC verification with Indian documents',
      details: [
        'Upload PAN card and Aadhaar documents',
        'Provide bank statements and address proof',
        'Business users submit GST and registration docs',
        'Admin review and approval within 2-4 hours'
      ],
      icon: Users,
      color: 'bg-green-50 text-green-600'
    },
    {
      step: '3',
      title: 'Upload Documents',
      description: 'Submit all required transaction and ownership documents',
      details: [
        'Vehicle RC, insurance, and service records',
        'Property documents and ownership papers',
        'Domain transfer authorization codes',
        'Work samples or project specifications'
      ],
      icon: Shield,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      step: '4',
      title: 'Secure Payment',
      description: 'Buyer deposits funds securely through integrated payment gateway',
      details: [
        'Multiple payment options: UPI, Net Banking, Cards',
        'Funds held in secure escrow account',
        'Real-time payment confirmation',
        'Automatic notifications to both parties'
      ],
      icon: CreditCard,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      step: '5',
      title: 'Digital Contract',
      description: 'Both parties review and digitally sign the transaction agreement',
      details: [
        'Legally binding digital contract',
        'All terms and conditions included',
        'Secure e-signature process',
        'Permanent record stored in system'
      ],
      icon: HandShake,
      color: 'bg-red-50 text-red-600'
    },
    {
      step: '6',
      title: 'Delivery & Inspection',
      description: 'Seller delivers item/service, buyer inspects and confirms',
      details: [
        'In-person delivery or digital transfer',
        'Inspection period as agreed (1-14 days)',
        'Real-time status updates',
        'Photo/video proof of delivery'
      ],
      icon: Clock,
      color: 'bg-teal-50 text-teal-600'
    },
    {
      step: '7',
      title: 'Release Funds',
      description: 'Upon buyer confirmation, funds are instantly released to seller',
      details: [
        'Instant fund transfer to seller',
        'Transaction completion certificates',
        'All documents archived securely',
        'Feedback and rating system'
      ],
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600'
    }
  ];

  const safetyFeatures = [
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      description: 'SSL encryption and secure data storage'
    },
    {
      icon: Shield,
      title: 'KYC Verification',
      description: 'Mandatory identity verification for all users'
    },
    {
      icon: Award,
      title: 'Regulatory Compliance',
      description: 'Compliant with RBI and Indian fintech regulations'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Continuous fraud detection and prevention'
    }
  ];

  const useCases = [
    {
      title: 'Vehicle Sales',
      amount: '₹2,50,000',
      scenario: 'Honda City 2019',
      description: 'Secure car transactions with document verification and inspection period.',
      image: '🚗'
    },
    {
      title: 'Real Estate',
      amount: '₹50,00,000',
      scenario: '2BHK Apartment',
      description: 'Property sales with legal document verification and registration support.',
      image: '🏠'
    },
    {
      title: 'Freelancing',
      amount: '₹75,000',
      scenario: 'Website Development',
      description: 'Project-based payments with milestone tracking and delivery confirmation.',
      image: '💼'
    },
    {
      title: 'Domain Sales',
      amount: '₹1,25,000',
      scenario: 'Premium Domain',
      description: 'Digital asset transfers with secure escrow and instant delivery.',
      image: '🌐'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Safe Transfer Works
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Our proven 7-step process ensures every high-value transaction in India 
              is secure, transparent, and completed with confidence.
            </p>
            <Link
              to="/create-deal"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center"
            >
              Start Your Deal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Secure, and Transparent Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every transaction follows our carefully designed process to protect both buyers and sellers.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mr-4`}>
                        <step.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Step {step.step}</div>
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <div className="text-center">
                        <div className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <step.icon className="w-12 h-12" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center mt-12">
                    <ArrowDown className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every High-Value Transaction
            </h2>
            <p className="text-xl text-gray-600">
              Real examples of how Safe Transfer protects buyers and sellers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{useCase.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <div className="text-2xl font-bold text-green-600 mb-2">{useCase.amount}</div>
                <div className="text-sm font-medium text-gray-700 mb-3">{useCase.scenario}</div>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Safety is Our Priority
            </h2>
            <p className="text-xl text-gray-600">
              Multiple layers of security protect every transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Experience */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Optimized for Mobile India
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built specifically for Indian mobile networks and usage patterns. 
                Complete transactions on the go with our mobile-first design.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Low Bandwidth Optimized</div>
                    <div className="text-gray-600">Works seamlessly on 2G/3G networks</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Instant Notifications</div>
                    <div className="text-gray-600">SMS and app alerts for every update</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Regional Language Support</div>
                    <div className="text-gray-600">Interface available in Hindi and English</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl text-white">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Mobile App Coming Soon</h3>
                  <p className="text-blue-100 mb-4">
                    Native Android and iOS apps with enhanced security and offline capabilities.
                  </p>
                  <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
                    Join Waitlist
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Common questions about using Safe Transfer for your transactions.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How long does the escrow process take?</h3>
              <p className="text-gray-600">
                The typical process takes 3-7 days depending on the transaction type and inspection period. 
                KYC verification is completed within 2-4 hours for individuals and 24-48 hours for businesses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What documents are required for KYC?</h3>
              <p className="text-gray-600">
                For individuals: PAN card, Aadhaar card, bank statement, and address proof. 
                For businesses: GST certificate, business registration, and authorized signatory documents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What are the fees for using Safe Transfer?</h3>
              <p className="text-gray-600">
                Our fees start at 2.5% of the transaction value, which is significantly lower than traditional escrow services. 
                View our detailed pricing page for complete fee structure.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is my money safe during the escrow period?</h3>
              <p className="text-gray-600">
                Yes, all funds are held in secure, regulated escrow accounts with leading Indian banks. 
                Your money is protected by bank-grade security and insurance coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Secure Transaction?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of Indians who trust Safe Transfer for their high-value transactions. 
            Create your first deal in just a few minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-deal"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center"
            >
              Create Deal Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;