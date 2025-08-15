'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateLateCredit, getLateCreditPolicy } from '@/lib/service-promises';
import { formatNPR } from '@/lib/currency';

interface LateCreditCalculatorProps {
  serviceSlug: string;
  basePrice: number;
  className?: string;
}

export default function LateCreditCalculator({ 
  serviceSlug, 
  basePrice, 
  className = '' 
}: LateCreditCalculatorProps) {
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [calculatedCredit, setCalculatedCredit] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(false);

  const policy = getLateCreditPolicy(serviceSlug);

  const handleCalculate = () => {
    const credit = calculateLateCredit(basePrice, delayMinutes);
    setCalculatedCredit(credit);
    setIsCalculated(true);
  };

  const handleReset = () => {
    setDelayMinutes(0);
    setCalculatedCredit(0);
    setIsCalculated(false);
  };

  const isEligible = delayMinutes > policy.thresholdMinutes;
  const creditPercentage = policy.creditType === 'percentage' ? policy.creditAmount : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5 text-blue-600" />
          Late Credit Calculator
        </CardTitle>
        <CardDescription>
          Calculate your credit if we're late to your service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Policy Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {creditPercentage}% Credit
            </div>
            <div className="text-blue-800 text-sm">
              If we're more than {policy.thresholdMinutes} minutes late
            </div>
          </div>
          <div className="text-center text-xs text-blue-600">
            Maximum credit: {formatNPR(policy.maxCredit)}
          </div>
        </div>

        {/* Calculator Input */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="delayMinutes" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              How many minutes late was the provider?
            </Label>
            <Input
              id="delayMinutes"
              type="number"
              min="0"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              placeholder="Enter delay in minutes"
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCalculate}
              disabled={delayMinutes <= 0}
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Credit
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        {isCalculated && (
          <div className="space-y-4">
            <div className={`text-center p-4 rounded-lg border ${
              isEligible 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              {isEligible ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-800 mb-1">
                    You're eligible for a credit!
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatNPR(calculatedCredit)}
                  </div>
                  <div className="text-sm text-green-700">
                    Credit will be applied to your next service
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800 mb-1">
                    No credit applicable
                  </div>
                  <div className="text-sm text-gray-600">
                    Provider was not late enough to qualify
                  </div>
                </>
              )}
            </div>

            {/* Eligibility Details */}
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Delay threshold:</span>
                <span className="font-medium">{policy.thresholdMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Your delay:</span>
                <span className={`font-medium ${isEligible ? 'text-green-600' : 'text-gray-600'}`}>
                  {delayMinutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Credit rate:</span>
                <span className="font-medium">{creditPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Base price:</span>
                <span className="font-medium">{formatNPR(basePrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Policy Conditions */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Credit Terms & Conditions:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {policy.conditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Claim */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            How to Claim Your Credit
          </h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Report the delay within 24 hours of service</p>
            <p>2. Contact our support team with booking details</p>
            <p>3. Credit will be applied to your next service booking</p>
            <p>4. Credit expires after 30 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
