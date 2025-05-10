import React, { useState, useEffect } from 'react';
import { Download, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

const CustomerRetentionCalculator = () => {
  // State for input values
  const [customerBase, setCustomerBase] = useState(1000);
  const [multiPurchaseRate, setMultiPurchaseRate] = useState(20);
  const [inactiveCustomersCount, setInactiveCustomersCount] = useState(300);
  const [aov, setAov] = useState(100);
  const [purchaseFrequency, setPurchaseFrequency] = useState(2);
  const [ltv, setLtv] = useState(200);
  
  // State for improvement goals
  const [multiPurchaseImprovement, setMultiPurchaseImprovement] = useState(5);
  const [churnReduction, setChurnReduction] = useState(5);
  const [purchaseFreqImprovement, setPurchaseFreqImprovement] = useState(0.5);
  
  // Client info for Google Sheets
  const [clientName, setClientName] = useState('');
  const [salesRepName, setSalesRepName] = useState('');
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  
  // State for save status
  const [saveStatus, setSaveStatus] = useState('');
  
  // State for UI toggles
  const [showCallInfo, setShowCallInfo] = useState(true);
  const [showSaveSection, setShowSaveSection] = useState(true);
  
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
    const currentInactive = inactiveCustomersCount;
    const currentInactiveRate = (currentInactive / customerBase) * 100;
    const currentActiveCustomers = customerBase - currentInactive;
    const currentAnnualRevenue = currentActiveCustomers * aov * purchaseFrequency;
    const currentTotalLtv = customerBase * ltv;
    
    const improvedMultiPurchaseRate = Math.min(multiPurchaseRate + multiPurchaseImprovement, 100);
    const improvedMultiPurchasers = Math.round(customerBase * (improvedMultiPurchaseRate / 100));
    const improvedInactiveCount = Math.max(currentInactive - Math.round((churnReduction / 100) * customerBase), 0);
    const improvedInactiveRate = (improvedInactiveCount / customerBase) * 100;
    const improvedActiveCustomers = customerBase - improvedInactiveCount;
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
        inactiveRate: currentInactiveRate.toFixed(1),
        annualRevenue: currentAnnualRevenue,
        totalLtv: currentTotalLtv,
      },
      improvedState: {
        multiPurchaseCustomers: improvedMultiPurchasers,
        inactiveCustomers: improvedInactiveCount,
        inactiveRate: improvedInactiveRate.toFixed(1),
        annualRevenue: improvedAnnualRevenue,
        totalLtv: improvedTotalLtv,
      },
      impact: {
        additionalCustomers: improvedMultiPurchasers - currentMultiPurchasers,
        reducedChurn: currentInactive - improvedInactiveCount,
        revenueIncrease: improvedAnnualRevenue - currentAnnualRevenue,
        ltvIncrease: improvedTotalLtv - currentTotalLtv,
      }
    });
  }, [
    customerBase, 
    multiPurchaseRate, 
    inactiveCustomersCount, 
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

  // Save to Google Sheets
  const saveToGoogleSheets = async () => {
    if (!googleSheetUrl) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }

    const data = {
      timestamp: new Date().toISOString(),
      callDate: callDate,
      salesRep: salesRepName,
      clientName: clientName,
      customerBase: customerBase,
      multiPurchaseRate: multiPurchaseRate,
      inactiveCustomersCount: inactiveCustomersCount,
      aov: aov,
      purchaseFrequency: purchaseFrequency,
      ltv: ltv,
      multiPurchaseImprovement: multiPurchaseImprovement,
      churnReduction: churnReduction,
      purchaseFreqImprovement: purchaseFreqImprovement,
      currentMultiPurchaseCustomers: results.currentState.multiPurchaseCustomers,
      currentInactiveCustomers: results.currentState.inactiveCustomers,
      currentAnnualRevenue: results.currentState.annualRevenue,
      currentTotalLtv: results.currentState.totalLtv,
      improvedMultiPurchaseCustomers: results.improvedState.multiPurchaseCustomers,
      improvedInactiveCustomers: results.improvedState.inactiveCustomers,
      improvedAnnualRevenue: results.improvedState.annualRevenue,
      improvedTotalLtv: results.improvedState.totalLtv,
      additionalCustomers: results.impact.additionalCustomers,
      reducedChurn: results.impact.reducedChurn,
      revenueIncrease: results.impact.revenueIncrease,
      ltvIncrease: results.impact.ltvIncrease
    };

    try {
      // Create a FormData object for Google Apps Script
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      const response = await fetch(googleSheetUrl, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Download as CSV
  const downloadAsCSV = () => {
    const csvData = [
      ['Call Information'],
      ['Date', callDate],
      ['Sales Rep', salesRepName],
      ['Client Name', clientName],
      [''],
      ['Current Metrics'],
      ['Customer Base', customerBase],
      ['Multi-Purchase Rate (%)', multiPurchaseRate],
      ['Inactive Customers', inactiveCustomersCount],
      ['AOV', aov],
      ['Purchase Frequency', purchaseFrequency],
      ['LTV', ltv],
      [''],
      ['Improvement Goals'],
      ['Multi-Purchase Rate Improvement (%)', multiPurchaseImprovement],
      ['Churn Reduction (%)', churnReduction],
      ['Purchase Freq Improvement', purchaseFreqImprovement],
      [''],
      ['Results'],
      ['Metric', 'Current', 'Improved', 'Impact'],
      ['Multi-Purchase Customers', results.currentState.multiPurchaseCustomers, results.improvedState.multiPurchaseCustomers, results.impact.additionalCustomers],
      ['Inactive Customers', results.currentState.inactiveCustomers, results.improvedState.inactiveCustomers, results.impact.reducedChurn],
      ['Annual Revenue', results.currentState.annualRevenue, results.improvedState.annualRevenue, results.impact.revenueIncrease],
      ['Total LTV', results.currentState.totalLtv, results.improvedState.totalLtv, results.impact.ltvIncrease]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-analysis-${clientName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${callDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Retention Calculator with Klaviyo Data</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSaveSection(!showSaveSection)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
          >
            {showSaveSection ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Save Section
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Save Section
              </>
            )}
          </button>
          <button
            onClick={() => setShowCallInfo(!showCallInfo)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          >
            {showCallInfo ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Call Info
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Call Info
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Call Information - Collapsible */}
      {showCallInfo && (
        <div className="bg-white p-4 rounded shadow mb-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Call Information</h2>
            <button
              onClick={() => setShowCallInfo(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Rep Name
              </label>
              <input
                type="text"
                value={salesRepName}
                onChange={(e) => setSalesRepName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Date
              </label>
              <input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}
      
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
              <p className="text-xs text-gray-500 mt-1">
                This represents {Math.round(customerBase * (multiPurchaseRate / 100)).toLocaleString()} customers
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inactive Customers (Count) - From Klaviyo
              </label>
              <input
                type="number"
                value={inactiveCustomersCount}
                onChange={(e) => setInactiveCustomersCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers with no purchase in 12+ months ({customerBase > 0 ? ((inactiveCustomersCount / customerBase) * 100).toFixed(1) : '0'}% of total customer base)
              </p>
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
            
            <div className="mt-4 bg-gray-100 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Inactive Customer Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Count:</span>
                  <span className="ml-1 font-semibold">{inactiveCustomersCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Percentage:</span>
                  <span className="ml-1 font-semibold">{customerBase > 0 ? ((inactiveCustomersCount / customerBase) * 100).toFixed(1) : '0'}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Active Customers:</span>
                  <span className="ml-1 font-semibold">{(customerBase - inactiveCustomersCount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Active Rate:</span>
                  <span className="ml-1 font-semibold">{customerBase > 0 ? (100 - (inactiveCustomersCount / customerBase) * 100).toFixed(1) : '0'}%</span>
                </div>
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
              <p className="text-xs text-gray-500 mt-1">
                This would add {Math.round(customerBase * (multiPurchaseImprovement / 100)).toLocaleString()} multi-purchase customers
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Churn Reduction (percentage points)
              </label>
              <input
                type="number"
                value={churnReduction}
                onChange={(e) => setChurnReduction(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                This would reactivate {Math.round((churnReduction / 100) * customerBase).toLocaleString()} customers ({inactiveCustomersCount > 0 ? Math.round((Math.round((churnReduction / 100) * customerBase) / inactiveCustomersCount) * 100) : 0}% of inactive base)
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                From {purchaseFrequency.toFixed(1)} to {(purchaseFrequency + purchaseFreqImprovement).toFixed(1)} purchases per year ({purchaseFrequency > 0 ? ((purchaseFreqImprovement / purchaseFrequency) * 100).toFixed(0) : '0'}% increase)
              </p>
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
                <span className="font-semibold">{results.currentState.inactiveCustomers.toLocaleString()} ({results.currentState.inactiveRate}%)</span>
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
                <span className="font-semibold">{results.improvedState.inactiveCustomers.toLocaleString()} ({results.improvedState.inactiveRate}%)</span>
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
            <p className="text-xs text-green-600">{results.currentState.multiPurchaseCustomers > 0 ? ((results.impact.additionalCustomers / results.currentState.multiPurchaseCustomers) * 100).toFixed(1) : '0'}% increase</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Reactivated Customers</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">+{results.impact.reducedChurn.toLocaleString()}</p>
            <p className="text-xs text-green-600">{inactiveCustomersCount > 0 ? ((results.impact.reducedChurn / inactiveCustomersCount) * 100).toFixed(1) : '0'}% of inactive base</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Annual Revenue Increase</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(results.impact.revenueIncrease)}</p>
            <p className="text-xs text-green-600">{results.currentState.annualRevenue > 0 ? ((results.impact.revenueIncrease / results.currentState.annualRevenue) * 100).toFixed(1) : '0'}% growth</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Total LTV Increase</h4>
            <p className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(results.impact.ltvIncrease)}</p>
            <p className="text-xs text-green-600">{results.currentState.totalLtv > 0 ? ((results.impact.ltvIncrease / results.currentState.totalLtv) * 100).toFixed(1) : '0'}% growth</p>
          </div>
        </div>
        
        {/* ROI Calculator */}
        <div className="mt-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Return on Investment</h3>
          <p className="text-blue-700 mb-4">
            Based on our pricing model, your investment in our retention solution would generate a <span className="font-bold text-blue-800">
              {results.currentState.annualRevenue > 0 ? Math.round((results.impact.revenueIncrease / (results.currentState.annualRevenue * 0.02)) * 100) : '0'}% ROI
            </span> in the first year alone.
          </p>
          <p className="text-sm text-blue-600">*Assumption: Our solution cost is approximately 2% of your current annual revenue</p>
        </div>
      </div>
      
      {/* Save to Google Sheets Section - Collapsible */}
      {showSaveSection && (
        <div className="mt-8 bg-white p-6 rounded shadow transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Save Your Analysis</h2>
            <button
              onClick={() => setShowSaveSection(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://script.google.com/macros/s/your-script-id/exec"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste your Google Apps Script Web App URL here to save data directly to sheets
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={saveToGoogleSheets}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={!googleSheetUrl || !clientName}
            >
              <Download className="h-4 w-4" />
              Save to Google Sheets
            </button>
            
            <button
              onClick={downloadAsCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
          </div>
          
          {saveStatus && (
            <div className={`text-sm ${saveStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveStatus === 'success' ? '✓ Data saved successfully!' : '✗ Error saving data. Please check your URL and try again.'}
            </div>
          )}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">How to set up Google Sheets integration:</h3>
            <ol className="text-xs text-gray-600 space-y-1">
              <li>1. Open Google Sheets and create a new spreadsheet</li>
              <li>2. Go to Extensions → Apps Script</li>
              <li>3. Replace the code with the Google Apps Script code (see instructions below)</li>
              <li>4. Deploy as a Web App and copy the URL</li>
              <li>5. Paste the URL above to enable saving</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-gray-700 text-gray-100 rounded-md text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap">{`// Google Apps Script Code to paste in your Apps Script editor
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Retention Analysis') || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('Retention Analysis');
  
  // If this is the first time, add headers
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Call Date', 'Sales Rep', 'Client', 'Customer Base', 'Multi-Purchase Rate', 
      'Inactive Customers', 'AOV', 'Purchase Frequency', 'LTV', 'Multi-Purchase Improvement', 
      'Churn Reduction', 'Purchase Freq Improvement', 'Current Multi-Purchase Customers', 
      'Current Inactive', 'Current Annual Revenue', 'Current Total LTV', 'Improved Multi-Purchase', 
      'Improved Inactive', 'Improved Annual Revenue', 'Improved Total LTV', 'Additional Customers', 
      'Reduced Churn', 'Revenue Increase', 'LTV Increase'
    ]);
  }
  
  // Parse the form data
  const data = e.parameter;
  
  // Append the new row
  sheet.appendRow([
    data.timestamp, data.callDate, data.salesRep, data.clientName, data.customerBase,
    data.multiPurchaseRate, data.inactiveCustomersCount, data.aov, data.purchaseFrequency,
    data.ltv, data.multiPurchaseImprovement, data.churnReduction, data.purchaseFreqImprovement,
    data.currentMultiPurchaseCustomers, data.currentInactiveCustomers, data.currentAnnualRevenue,
    data.currentTotalLtv, data.improvedMultiPurchaseCustomers, data.improvedInactiveCustomers,
    data.improvedAnnualRevenue, data.improvedTotalLtv, data.additionalCustomers,
    data.reducedChurn, data.revenueIncrease, data.ltvIncrease
  ]);
  
  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRetentionCalculator;
