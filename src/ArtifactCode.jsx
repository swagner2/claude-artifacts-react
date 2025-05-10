import React, { useState, useEffect } from 'react';

const CustomerRetentionCalculator = () => {
  // State for input values
  const [customerBase, setCustomerBase] = useState(1000);
  const [multiPurchaseRate, setMultiPurchaseRate] = useState(20);
  const [inactiveCustomers, setInactiveCustomers] = useState(30);
  const [aov, setAov] = useState(100);
  const [purchaseFrequency, setPurchaseFrequency] = useState(2);
  const [ltv, setLtv] = useState(200);
  
  // State for improvement goals
  const [multiPurchaseImprovement, setMultiPurchaseImprovement] = useState(5);
  const [churnReduction, setChurnReduction] = useState(5);
  const [purchaseFreqImprovement, setPurchaseFreqImprovement] = useState(0.5);
  
  // Calculated results
  const [results, setResults] = useState({
    currentState: {
      multiPurchaseCustomers: 0,
      inactiveCustomers: 0,
      annualRevenue: 0,
      totalLtv: 0,
    },
    improvedState: {
      multiPurchaseCustomers: 0,
      inactiveCustomers: 0,
      annualRevenue: 0,
      totalLtv: 0,
    },
    impact: {
      additionalCustomers: 0,
      reducedChurn: 0,
      revenueIncrease: 0,
      ltvIncrease: 0,
    }
  });

  // Calculate results when inputs change
  useEffect(() => {
    const currentMultiPurchasers = Math.round(customerBase * (multiPurchaseRate / 100));
    const currentInactive = Math.round(customerBase * (inactiveCustomers / 100));
    const currentActiveCustomers = customerBase - currentInactive;
    const currentAnnualRevenue = currentActiveCustomers * aov * purchaseFrequency;
    const currentTotalLtv = customerBase * ltv;
    
    const improvedMultiPurchaseRate = Math.min(multiPurchaseRate + multiPurchaseImprovement, 100);
    const improvedMultiPurchasers = Math.round(customerBase * (improvedMultiPurchaseRate / 100));
    const improvedInactiveRate = Math.max(inactiveCustomers - churnReduction, 0);
    const improvedInactive = Math.round(customerBase * (improvedInactiveRate / 100));
    const improvedActiveCustomers = customerBase - improvedInactive;
    const improvedPurchaseFreq = purchaseFrequency + purchaseFreqImprovement;
    const improvedAnnualRevenue = improvedActiveCustomers * aov * improvedPurchaseFreq;
    
    // Calculate the new LTV based on improved purchase frequency and reduced churn
    const churnFactor = 1 + (churnReduction / 100);
    const freqFactor = improvedPurchaseFreq / purchaseFrequency;
    const improvedLtv = ltv * churnFactor * freqFactor;
    const improvedTotalLtv = customerBase * improvedLtv;
    
    setResults({
      currentState: {
        multiPurchaseCustomers: currentMultiPurchasers,
        inactiveCustomers: currentInactive,
        annualRevenue: currentAnnualRevenue,
        totalLtv: currentTotalLtv,
      },
      improvedState: {
        multiPurchaseCustomers: improvedMultiPurchasers,
        inactiveCustomers: improvedInactive,
        annualRevenue: improvedAnnualRevenue,
        totalLtv: improvedTotalLtv,
      },
      impact: {
        additionalCustomers: improvedMultiPurchasers - currentMultiPurchasers,
        reducedChurn: currentInactive - improvedInactive,
        revenueIncrease: improvedAnnualRevenue - currentAnnualRevenue,
        ltvIncrease: improvedTotalLtv - currentTotalLtv,
      }
    });
  }, [
    customerBase, 
    multiPurchaseRate, 
    inactiveCustomers, 
    aov, 
    purchaseFrequency, 
    ltv,
    multiPurchaseImprovement,
    churnReduction,
    purchaseFreqImprovement
  ]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Retention Calculator</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Metrics Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Customer Metrics</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Customer Base
              </label>
              <input
                type="number"
                value={customerBase}
                onChange={(e) => setCustomerBase(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Multi-Purchase Rate (%) - Customers who bought 2+ times
              </label>
              <input
                type="number"
                value={multiPurchaseRate}
                onChange={(e) => setMultiPurchaseRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inactive Customers (%) - No purchase in 12+ months
              </label>
              <input
                type="number"
                value={inactiveCustomers}
                onChange={(e) => setInactiveCustomers(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Order Value (AOV)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  value={aov}
                  onChange={(e) => setAov(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Purchase Frequency
              </label>
              <input
                type="number"
                value={purchaseFrequency}
                onChange={(e) => setPurchaseFrequency(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Lifetime Value (LTV)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  value={ltv}
                  onChange={(e) => setLtv(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Improvement Goals Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Improvement Goals</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Multi-Purchase Rate Improvement (percentage points)
              </label>
              <input
                type="number"
                value={multiPurchaseImprovement}
                onChange={(e) => setMultiPurchaseImprovement(Math.min(100 - multiPurchaseRate, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Churn Reduction (percentage points)
              </label>
              <input
                type="number"
                value={churnReduction}
                onChange={(e) => setChurnReduction(Math.min(inactiveCustomers, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Frequency Improvement
              </label>
              <input
                type="number"
                value={purchaseFreqImprovement}
                onChange={(e) => setPurchaseFreqImprovement(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="0.1"
              />
            </div>
            
            <div className="mt-8 bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Our Solution Delivers</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized customer engagement strategies
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Smart reactivation campaigns for dormant customers
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Predictive analytics to identify at-risk customers
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Loyalty programs that increase purchase frequency
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Projected Impact</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Current State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Multi-Purchase Customers:</span>
                <span className="font-semibold">{results.currentState.multiPurchaseCustomers.toLocaleString()} ({multiPurchaseRate}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive Customers:</span>
                <span className="font-semibold">{results.currentState.inactiveCustomers.toLocaleString()} ({inactiveCustomers}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Revenue:</span>
                <span className="font-semibold">{formatCurrency(results.currentState.annualRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Customer LTV:</span>
                <span className="font-semibold">{formatCurrency(results.currentState.totalLtv)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Improved State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Multi-Purchase Customers:</span>
                <span className="font-semibold">{results.improvedState.multiPurchaseCustomers.toLocaleString()} ({(multiPurchaseRate + multiPurchaseImprovement).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive Customers:</span>
                <span className="font-semibold">{results.improvedState.inactiveCustomers.toLocaleString()} ({(inactiveCustomers - churnReduction).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Revenue:</span>
                <span className="font-semibold">{formatCurrency(results.improvedState.annualRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Customer LTV:</span>
                <span className="font-semibold">{formatCurrency(results.improvedState.totalLtv)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Impact Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Additional Multi-Purchase Customers</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">+{results.impact.additionalCustomers.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Reactivated Customers</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">+{results.impact.reducedChurn.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Annual Revenue Increase</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(results.impact.revenueIncrease)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Total LTV Increase</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(results.impact.ltvIncrease)}</p>
          </div>
        </div>
        
        {/* ROI Calculator */}
        <div className="mt-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Return on Investment</h3>
          <p className="text-blue-700 mb-4">
            Based on our pricing model, your investment in our retention solution would generate a <span className="font-bold text-blue-800">
              {Math.round((results.impact.revenueIncrease / (results.currentState.annualRevenue * 0.02)) * 100)}% ROI
            </span> in the first year alone.
          </p>
          <p className="text-sm text-blue-600">*Assumption: Our solution cost is approximately 2% of your current annual revenue</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRetentionCalculator;
