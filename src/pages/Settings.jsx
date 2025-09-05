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
import { BillingAndSubscriptionManager } from '../components/BillingAndSubscriptionManager'

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
              <BillingAndSubscriptionManager />
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
