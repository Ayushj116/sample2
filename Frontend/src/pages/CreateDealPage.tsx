import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Shield, Clock, Users } from 'lucide-react';

const CreateDealPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    dealType: '',
    itemTitle: '',
    itemDescription: '',
    dealAmount: '',
    sellerEmail: '',
    buyerEmail: '',
    sellerName: '',
    buyerName: '',
    sellerPhone: '',
    buyerPhone: '',
    deliveryMethod: '',
    inspectionPeriod: '3',
    additionalTerms: ''
  });

  const dealTypes = [
    { value: 'vehicle', label: 'Vehicle Sale', icon: '🚗' },
    { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
    { value: 'domain', label: 'Domain Name', icon: '🌐' },
    { value: 'freelancing', label: 'Freelancing', icon: '💼' }
  ];

  const steps = [
    { number: 1, title: 'Deal Details', description: 'Basic information about your transaction' },
    { number: 2, title: 'Parties Information', description: 'Buyer and seller contact details' },
    { number: 3, title: 'Terms & Conditions', description: 'Delivery and inspection terms' },
    { number: 4, title: 'Review & Submit', description: 'Confirm all details before submission' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Deal created:', formData);
    // Redirect to deal dashboard or confirmation page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Escrow Deal</h1>
          <p className="text-gray-600">Secure your high-value transaction with our escrow protection</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-6 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Deal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Deal Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of transaction is this?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dealTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, dealType: type.value })}
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          formData.dealType === type.value
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Item/Service Title *
                  </label>
                  <input
                    type="text"
                    id="itemTitle"
                    name="itemTitle"
                    value={formData.itemTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Honda City 2019 Model, 2BHK Apartment in Koramangala"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="itemDescription"
                    name="itemDescription"
                    value={formData.itemDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide detailed description of the item/service..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dealAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="dealAmount"
                    name="dealAmount"
                    value={formData.dealAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This amount will be held in escrow until the transaction is complete
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Parties Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Parties Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Seller Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Seller Information
                    </h3>
                    
                    <div>
                      <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="sellerName"
                        name="sellerName"
                        value={formData.sellerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="sellerEmail"
                        name="sellerEmail"
                        value={formData.sellerEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="sellerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="sellerPhone"
                        name="sellerPhone"
                        value={formData.sellerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      Buyer Information
                    </h3>
                    
                    <div>
                      <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="buyerName"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="buyerEmail"
                        name="buyerEmail"
                        value={formData.buyerEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="buyerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="buyerPhone"
                        name="buyerPhone"
                        value={formData.buyerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Terms & Conditions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
                
                <div>
                  <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method *
                  </label>
                  <select
                    id="deliveryMethod"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select delivery method</option>
                    <option value="in-person">In-Person Pickup</option>
                    <option value="courier">Courier/Shipping</option>
                    <option value="digital">Digital Transfer</option>
                    <option value="other">Other (specify in terms)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inspectionPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Period (Days)
                  </label>
                  <select
                    id="inspectionPeriod"
                    name="inspectionPeriod"
                    value={formData.inspectionPeriod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Time allowed for buyer to inspect and confirm receipt
                  </p>
                </div>

                <div>
                  <label htmlFor="additionalTerms" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Terms & Conditions
                  </label>
                  <textarea
                    id="additionalTerms"
                    name="additionalTerms"
                    value={formData.additionalTerms}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific terms or conditions for this transaction..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Escrow Protection</h3>
                      <p className="text-blue-800 text-sm">
                        Funds will be held securely until both parties confirm the transaction is complete. 
                        Our dispute resolution process protects both buyers and sellers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Deal Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Deal Type:</span>
                        <span className="ml-2 font-medium capitalize">{formData.dealType?.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-2 font-medium text-green-600">₹{formData.dealAmount}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Item:</span>
                        <span className="ml-2 font-medium">{formData.itemTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Fee Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Transaction Amount</span>
                        <span>₹{formData.dealAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escrow Fee (2.5%)</span>
                        <span>₹{Math.round(Number(formData.dealAmount) * 0.025)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total to be Deposited</span>
                        <span>₹{Number(formData.dealAmount) + Math.round(Number(formData.dealAmount) * 0.025)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-6 h-6 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">Next Steps</h3>
                        <p className="text-yellow-800 text-sm">
                          After submitting, both parties will receive email invitations to complete KYC verification 
                          and upload required documents before funds can be deposited.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                disabled={currentStep === 1}
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Create Deal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDealPage;