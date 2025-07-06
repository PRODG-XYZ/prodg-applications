'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Save, Users, Mail, Bell, Shield, Database, Globe, Key, Palette, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const settingsSections: SettingsSection[] = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'advanced', label: 'Advanced', icon: Settings }
];

export default function SettingsPanel() {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    organizationName: 'ProDG Applications',
    adminEmail: 'admin@example.com',
    defaultLanguage: 'English',
    timezone: 'America/New_York',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: false,
    slackIntegration: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataRetention: 90,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Organization Name</label>
        <Input
          className="bg-slate-800/50 border-slate-700 text-white"
          value={settings.organizationName}
          onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Admin Email</label>
        <Input
          className="bg-slate-800/50 border-slate-700 text-white"
          value={settings.adminEmail}
          onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
          type="email"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Default Language</label>
        <select 
          className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700 focus:border-blue-500 focus:outline-none"
          value={settings.defaultLanguage}
          onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Timezone</label>
        <select 
          className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700 focus:border-blue-500 focus:outline-none"
          value={settings.timezone}
          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
        >
          <option value="America/New_York">Eastern Time (US)</option>
          <option value="America/Chicago">Central Time (US)</option>
          <option value="America/Denver">Mountain Time (US)</option>
          <option value="America/Los_Angeles">Pacific Time (US)</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Email Notifications</h4>
            <p className="text-sm text-slate-400">Receive email updates about applications and personnel</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Push Notifications</h4>
            <p className="text-sm text-slate-400">Get browser push notifications for important updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Slack Integration</h4>
            <p className="text-sm text-slate-400">Send notifications to your Slack workspace</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.slackIntegration}
              onChange={(e) => setSettings({ ...settings, slackIntegration: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.twoFactorAuth}
              onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Session Timeout (minutes)</label>
          <Input
            type="number"
            className="bg-slate-800/50 border-slate-700 text-white"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
          />
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white">
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Data Retention Period (days)</label>
          <Input
            type="number"
            className="bg-slate-800/50 border-slate-700 text-white"
            value={settings.dataRetention}
            onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) || 90 })}
          />
          <p className="text-xs text-slate-500">How long to keep deleted records in the database</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Automatic Backups</h4>
            <p className="text-sm text-slate-400">Automatically backup your data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.autoBackup}
              onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {settings.autoBackup && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Backup Frequency</label>
            <select 
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700 focus:border-blue-500 focus:outline-none"
              value={settings.backupFrequency}
              onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white">
            Export Data
          </Button>
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white">
            Import Data
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'data':
        return renderDataSettings();
      default:
        return (
          <div className="text-center py-8 text-slate-400">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700/50 p-4">
            <div className="space-y-1">
              {settingsSections.map(section => {
                const Icon = section.icon;
                return (
                  <Button 
                    key={section.id}
                    variant="ghost" 
                    className={`w-full justify-start text-left relative ${
                      activeSection === section.id 
                        ? 'bg-slate-700/50 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{section.label}</span>
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              {settingsSections.find(s => s.id === activeSection) && (
                <>
                  {React.createElement(settingsSections.find(s => s.id === activeSection)!.icon, { className: "h-5 w-5 mr-2" })}
                  {settingsSections.find(s => s.id === activeSection)!.label} Settings
                </>
              )}
            </h3>
            
            {renderCurrentSection()}
            
            <Separator className="bg-slate-700/50 my-6" />
            
            <div className="flex justify-end">
              <Button 
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 