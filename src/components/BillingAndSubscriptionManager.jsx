import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { 
  CreditCard, 
  Crown, 
  Check, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Zap,
  Building2
} from 'lucide-react'
import { useStore } from '../store/useStore'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    period: 'month',
    stripePriceId: 'price_basic_monthly',
    features: [
      '5 projects per month',
      '10 layout generations',
      'Basic compliance checking',
      'Email support',
      '2D layout viewer'
    ],
    limits: {
      projects: 5,
      layouts: 10,
      exports: 5
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    period: 'month',
    stripePriceId: 'price_pro_monthly',
    popular: true,
    features: [
      'Unlimited projects',
      'Unlimited layout generations',
      'Advanced compliance checking',
      'Performance optimization',
      'Priority support',
      'Export to CAD formats',
      '3D layout viewer',
      'Advanced parametric controls'
    ],
    limits: {
      projects: -1, // unlimited
      layouts: -1,
      exports: -1
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: 'month',
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'Everything in Pro',
      'Custom building codes integration',
      'Team collaboration',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'White-label options'
    ],
    limits: {
      projects: -1,
      layouts: -1,
      exports: -1,
      teamMembers: -1
    }
  }
]

function PaymentForm({ selectedPlan, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        setPaymentError(error.message)
        setIsProcessing(false)
        return
      }

      // In a real app, you would send the payment method to your backend
      // to create a subscription with Stripe
      const response = await createSubscription({
        paymentMethodId: paymentMethod.id,
        priceId: selectedPlan.stripePriceId,
      })

      if (response.success) {
        onSuccess(response.subscription)
      } else {
        setPaymentError(response.error)
      }
    } catch (err) {
      setPaymentError('An unexpected error occurred')
      onError(err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {paymentError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{paymentError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Subscribe to {selectedPlan.name} - ${selectedPlan.price}/{selectedPlan.period}
          </>
        )}
      </button>
    </form>
  )
}

// Mock API function - replace with actual backend integration
async function createSubscription({ paymentMethodId, priceId }) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock successful response
  return {
    success: true,
    subscription: {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      plan: priceId
    }
  }
}

function PlanCard({ plan, isCurrentPlan, onSelectPlan }) {
  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all ${
      plan.popular 
        ? 'border-blue-500 bg-blue-50' 
        : isCurrentPlan 
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-600">/{plan.period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelectPlan(plan)}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : plan.popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
      </button>
    </div>
  )
}

function UsageStats({ currentPlan }) {
  const { projects, layouts } = useStore()
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthProjects = projects.filter(p => {
    const projectDate = new Date(p.createdAt)
    return projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear
  }).length

  const thisMonthLayouts = layouts.filter(l => {
    const layoutDate = new Date(l.createdAt)
    return layoutDate.getMonth() === currentMonth && layoutDate.getFullYear() === currentYear
  }).length

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan) || SUBSCRIPTION_PLANS[0]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-600" />
        Usage This Month
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{thisMonthProjects}</div>
          <div className="text-sm text-gray-600">
            Projects {plan.limits.projects > 0 ? `/ ${plan.limits.projects}` : '(Unlimited)'}
          </div>
          {plan.limits.projects > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((thisMonthProjects / plan.limits.projects) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{thisMonthLayouts}</div>
          <div className="text-sm text-gray-600">
            Layouts {plan.limits.layouts > 0 ? `/ ${plan.limits.layouts}` : '(Unlimited)'}
          </div>
          {plan.limits.layouts > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min((thisMonthLayouts / plan.limits.layouts) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">
            Exports {plan.limits.exports > 0 ? `/ ${plan.limits.exports}` : '(Unlimited)'}
          </div>
          {plan.limits.exports > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${Math.min((3 / plan.limits.exports) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BillingAndSubscriptionManager({ variant = 'default' }) {
  const { user, updateUser } = useStore()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState('active')

  const currentPlan = user.subscriptionTier || 'basic'
  const nextBillingDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = (subscription) => {
    // Update user subscription in store
    updateUser({
      subscriptionTier: selectedPlan.id,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status
    })
    
    setShowPaymentForm(false)
    setSelectedPlan(null)
    
    // Show success message
    alert(`Successfully upgraded to ${selectedPlan.name} plan!`)
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center mb-6">
            <Crown className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to {selectedPlan.name}
            </h2>
            <p className="text-gray-600">
              Complete your subscription to unlock all features
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>

          <button
            onClick={() => setShowPaymentForm(false)}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Current Subscription
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-medium text-gray-900 capitalize">
                {currentPlan} Plan
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                subscriptionStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscriptionStatus}
              </span>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next billing: {nextBillingDate.toLocaleDateString()}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)?.price || 29}
            </div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <UsageStats currentPlan={currentPlan} />

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Choose Your Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlan}
              onSelectPlan={handlePlanSelection}
            />
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Billing History
        </h3>
        
        <div className="space-y-3">
          {[
            { date: '2024-01-15', amount: 79, status: 'paid', invoice: 'INV-001' },
            { date: '2023-12-15', amount: 79, status: 'paid', invoice: 'INV-002' },
            { date: '2023-11-15', amount: 29, status: 'paid', invoice: 'INV-003' },
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-gray-900">{bill.invoice}</div>
                <div className="text-sm text-gray-600">{bill.date}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">${bill.amount}</div>
                <div className="text-sm text-green-600 capitalize">{bill.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
