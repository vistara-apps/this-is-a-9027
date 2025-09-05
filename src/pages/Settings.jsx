import React, { useState } from 'react'
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Building2,
  Crown,
  Check,
  Settings as SettingsIcon
} from 'lucide-react'
import { useStore } from '../store/useStore'

export function Settings() {
  const { user } = useStore()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ]

  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: 'month',
      features: [
        '5 projects per month',
        '10 layout generations',
        'Basic compliance checking',
        'Email support'
      ],
      current: false
    },
    {
      name: 'Pro',
      price: '$79',
      period: 'month',
      features: [
        'Unlimited projects',
        'Unlimited layout generations',
        'Advanced compliance checking',
        'Performance optimization',
        'Priority support',
        'Export to CAD formats'
      ],
      current: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom building codes',
        'API access',
        'Dedicated support',
        'On-premise deployment'
      ],
      current: false
    }
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold text-text mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Demo User"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Your company name"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Role
                      </label>
                      <select className="input">
                        <option>Architect</option>
                        <option>Designer</option>
                        <option>Student</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button className="btn-primary">Save Changes</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold text-text mb-6">Current Plan</h2>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Crown className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900">Pro Plan</h3>
                      <p className="text-green-700">$79/month • Billing monthly</p>
                      <p className="text-sm text-green-600">Next billing date: February 15, 2024</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-semibold text-text mb-6">Available Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`border rounded-lg p-6 ${
                          plan.current 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                          <div className="mt-2">
                            <span className="text-3xl font-bold text-text">{plan.price}</span>
                            <span className="text-gray-600">/{plan.period}</span>
                          </div>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                            plan.current
                              ? 'bg-gray-100 text-gray-600 cursor-default'
                              : 'btn-primary'
                          }`}
                          disabled={plan.current}
                        >
                          {plan.current ? 'Current Plan' : 'Upgrade'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold text-text mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive email updates about your projects</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text">Layout Generation Complete</h3>
                        <p className="text-sm text-gray-600">Get notified when AI finishes generating layouts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text">Compliance Alerts</h3>
                        <p className="text-sm text-gray-600">Alerts about compliance issues in your layouts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text">Product Updates</h3>
                        <p className="text-sm text-gray-600">News about new features and improvements</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold text-text mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-text mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Current Password
                          </label>
                          <input type="password" className="input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            New Password
                          </label>
                          <input type="password" className="input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Confirm New Password
                          </label>
                          <input type="password" className="input" />
                        </div>
                        <button className="btn-primary">Update Password</button>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-6">
                      <h3 className="font-medium text-text mb-4">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button className="btn-secondary">Enable 2FA</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}