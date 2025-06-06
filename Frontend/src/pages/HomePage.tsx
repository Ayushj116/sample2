import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  Star, 
  Car, 
  Home, 
  Globe, 
  Briefcase,
  ArrowRight,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';

const HomePage = () => {
  const stats = [
    { number: '50,000+', label: 'Transactions Completed', icon: CheckCircle },
    { number: '₹500Cr+', label: 'Transaction Value', icon: TrendingUp },
    { number: '99.9%', label: 'Success Rate', icon: Award },
    { number: '24/7', label: 'Customer Support', icon: Clock }
  ];

  const services = [
    {
      icon: Car,
      title: 'Vehicle Sales',
      description: 'Secure car, bike, and commercial vehicle transactions',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Home,
      title: 'Real Estate',
      description: 'Property sales, rentals, and investment deals',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Globe,
      title: 'Domain Names',
      description: 'Safe transfer of digital assets and domains',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Briefcase,
      title: 'Freelancing',
      description: 'Project-based payments and service delivery',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Create Deal',
      description: 'Both parties agree on terms and create an escrow deal'
    },
    {
      step: '2',
      title: 'Verify & Upload',
      description: 'Complete KYC verification and upload required documents'
    },
    {
      step: '3',
      title: 'Deposit Funds',
      description: 'Buyer securely deposits payment into escrow account'
    },
    {
      step: '4',
      title: 'Complete Transaction',
      description: 'Seller delivers, buyer confirms, funds are released'
    }
  ];

  const testimonials = [
    {
      name: 'Riya Sharma',
      location: 'Mumbai',
      rating: 5,
      text: 'Bought my car through Safe Transfer. The process was smooth and I felt completely secure throughout.'
    },
    {
      name: 'Manoj Kumar',
      location: 'Bangalore',
      rating: 5,
      text: 'As a freelancer, Safe Transfer gives me confidence that I\'ll get paid for my work. Highly recommended!'
    },
    {
      name: 'Priya Patel',
      location: 'Pune',
      rating: 5,
      text: 'Sold my apartment through Safe Transfer. The digital documentation made everything so easy.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                India's Most Trusted
                <span className="text-blue-200 block">Escrow Platform</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Secure high-value transactions with confidence. From vehicles to real estate, 
                we protect both buyers and sellers with our advanced escrow technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/create-deal"
                  className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  Start Your Deal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-800 transition-colors flex items-center justify-center"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Deal Status</div>
                      <div className="font-semibold text-gray-900">Funds Secured</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">₹2,50,000</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">KYC Verified</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Documents Uploaded</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Funds Deposited</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                    <span className="text-gray-500">Awaiting Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Secure Transactions for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From high-value purchases to professional services, we provide 
              escrow protection across all major transaction categories.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                <div className={`w-16 h-16 ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Safe Transfer Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven 4-step process ensures every transaction is secure, 
              transparent, and completed with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 transform translate-x-8 w-full h-0.5 bg-blue-200"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Bank-Grade Security for Every Transaction
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Your money and data are protected by enterprise-level security 
                measures used by leading financial institutions.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">SSL Encryption</div>
                    <div className="text-gray-600">256-bit encryption for all data transfers</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Regulatory Compliance</div>
                    <div className="text-gray-600">RBI guidelines and KYC verification</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Fraud Protection</div>
                    <div className="text-gray-600">AI-powered transaction monitoring</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-8 rounded-2xl text-white">
                <div className="text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">₹0 Fraud Loss</h3>
                  <p className="text-green-100">
                    In over 50,000 transactions, we've maintained a perfect record 
                    of zero fraud-related losses for our users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands of Indians
            </h2>
            <p className="text-xl text-gray-600">
              See what our satisfied customers have to say about their experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make Your Next Transaction Safe?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Safe Transfer 
            for their high-value transactions. Start your secure deal today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-deal"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center"
            >
              Start Your Deal Now
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

export default HomePage;