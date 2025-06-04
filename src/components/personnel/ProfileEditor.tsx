'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Clock, 
  Bell, 
  Shield, 
  Camera,
  Plus,
  X,
  Save,
  Edit3,
  Github,
  Linkedin,
  Globe,
  Award,
  Briefcase
} from 'lucide-react';

interface ProfileEditorProps {
  personnel: any;
  onSave?: (updates: any) => void;
  onCancel?: () => void;
}

const ProfileEditor = ({ personnel, onSave, onCancel }: ProfileEditorProps) => {
  const [formData, setFormData] = useState({
    name: personnel?.name || '',
    email: personnel?.email || '',
    bio: personnel?.profile?.bio || '',
    skills: personnel?.profile?.skills || [],
    certifications: personnel?.profile?.certifications || [],
    socialLinks: {
      github: personnel?.profile?.socialLinks?.github || '',
      linkedin: personnel?.profile?.socialLinks?.linkedin || '',
      portfolio: personnel?.profile?.socialLinks?.portfolio || ''
    },
    preferences: {
      timezone: personnel?.preferences?.timezone || 'America/New_York',
      workingHours: {
        start: personnel?.preferences?.workingHours?.start || '09:00',
        end: personnel?.preferences?.workingHours?.end || '17:00'
      },
      notifications: {
        email: personnel?.preferences?.notifications?.email ?? true,
        push: personnel?.preferences?.notifications?.push ?? true,
        slack: personnel?.preferences?.notifications?.slack ?? false
      }
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(personnel?.profile?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleDeepNestedChange = (parent: string, child: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [child]: {
          ...(prev[parent as keyof typeof prev] as any)[child],
          [field]: value
        }
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((s: string) => s !== skill)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((c: string) => c !== cert)
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates = {
        ...formData,
        profile: {
          ...personnel?.profile,
          bio: formData.bio,
          skills: formData.skills,
          certifications: formData.certifications,
          socialLinks: formData.socialLinks,
          avatar: avatarPreview
        },
        preferences: formData.preferences
      };

      // API call to update profile
      const response = await fetch('/api/personnel/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      onSave?.(updates);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles', 
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-slate-400 mt-1">Update your personal information and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-slate-700 rounded-full overflow-hidden mx-auto">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-slate-400 text-sm mt-3">
                Click the camera icon to upload a new photo
              </p>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={personnel?.role || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={personnel?.department || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Bio
            </h3>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Skills
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Certifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certifications
            </h3>
            
            <div className="space-y-2 mb-4">
              {formData.certifications.map((cert: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-700/30 px-3 py-2 rounded-lg"
                >
                  <span className="text-white">{cert}</span>
                  <button
                    onClick={() => removeCertification(cert)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                placeholder="Add a certification..."
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Social Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Portfolio
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.portfolio}
                  onChange={(e) => handleNestedChange('socialLinks', 'portfolio', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Preferences
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Timezone
                </label>
                <select
                  value={formData.preferences.timezone}
                  onChange={(e) => handleNestedChange('preferences', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Working Hours
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={formData.preferences.workingHours.start}
                    onChange={(e) => handleDeepNestedChange('preferences', 'workingHours', 'start', e.target.value)}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.preferences.workingHours.end}
                    onChange={(e) => handleDeepNestedChange('preferences', 'workingHours', 'end', e.target.value)}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </label>
              <div className="space-y-3">
                {Object.entries(formData.preferences.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleDeepNestedChange('preferences', 'notifications', key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-300 capitalize">{key} notifications</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor; 