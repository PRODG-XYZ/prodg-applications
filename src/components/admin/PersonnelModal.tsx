import React, { useState, useEffect } from 'react';
import { IPersonnel } from '@/lib/admin/personnel';
import { IDepartment } from '@/lib/models/Department';
import { 
  X, 
  User, 
  Mail, 
  Building, 
  UserCheck, 
  Calendar,
  Save,
  AlertCircle,
  Upload,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<IPersonnel>) => Promise<void>;
  personnel?: IPersonnel | null;
  departments: IDepartment[];
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  email: string;
  employeeId: string;
  role: 'employee' | 'senior' | 'lead' | 'manager' | 'director';
  department: string;
  status: 'onboarding' | 'active' | 'on_leave' | 'terminated';
  startDate: string;
  manager?: string;
  profile: {
    bio: string;
    skills: string[];
    certifications: string[];
    socialLinks: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
  };
  preferences: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
}

const PersonnelModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  personnel, 
  departments, 
  mode 
}: PersonnelModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    employeeId: '',
    role: 'employee',
    department: '',
    status: 'onboarding',
    startDate: new Date().toISOString().split('T')[0],
    profile: {
      bio: '',
      skills: [],
      certifications: [],
      socialLinks: {}
    },
    preferences: {
      timezone: 'America/New_York',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      notifications: {
        email: true,
        push: false,
        slack: false
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  useEffect(() => {
    if (personnel && mode === 'edit') {
      setFormData({
        name: personnel.name || '',
        email: personnel.email || '',
        employeeId: personnel.employeeId || '',
        role: personnel.role || 'employee',
        department: personnel.department || '',
        status: personnel.status || 'onboarding',
        startDate: personnel.startDate ? new Date(personnel.startDate).toISOString().split('T')[0] : '',
        profile: {
          bio: personnel.profile?.bio || '',
          skills: personnel.profile?.skills || [],
          certifications: personnel.profile?.certifications || [],
          socialLinks: personnel.profile?.socialLinks || {}
        },
        preferences: {
          timezone: personnel.preferences?.timezone || 'America/New_York',
          workingHours: {
            start: personnel.preferences?.workingHours?.start || '09:00',
            end: personnel.preferences?.workingHours?.end || '17:00'
          },
          notifications: {
            email: personnel.preferences?.notifications?.email ?? true,
            push: personnel.preferences?.notifications?.push ?? false,
            slack: personnel.preferences?.notifications?.slack ?? false
          }
        }
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        role: 'employee',
        department: departments[0]?.name || '',
        status: 'onboarding',
        startDate: new Date().toISOString().split('T')[0],
        profile: {
          bio: '',
          skills: [],
          certifications: [],
          socialLinks: {}
        },
        preferences: {
          timezone: 'America/New_York',
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          notifications: {
            email: true,
            push: false,
            slack: false
          }
        }
      });
    }
    setErrors({});
  }, [personnel, mode, departments, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: Partial<IPersonnel> = {
        ...formData,
        startDate: new Date(formData.startDate),
        directReports: personnel?.directReports || [],
        onboarding: personnel?.onboarding || {
          tasksCompleted: [],
          documentsUploaded: [],
          meetingsScheduled: [],
          completionPercentage: 0
        }
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving personnel:', error);
      setErrors({ submit: 'Failed to save personnel. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.profile.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(s => s !== skill)
      }
    }));
  };

  const addCertification = () => {
    if (certInput.trim() && !formData.profile.certifications.includes(certInput.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          certifications: [...prev.profile.certifications, certInput.trim()]
        }
      }));
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        certifications: prev.profile.certifications.filter(c => c !== cert)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-6 h-6" />
            {mode === 'create' ? 'Add New Personnel' : `Edit ${personnel?.name}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter employee ID"
                  />
                  {errors.employeeId && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.employeeId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.startDate && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.preferences.timezone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: e.target.value }
                    }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Profile Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.profile.bio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, bio: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Brief bio or description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Certifications
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Add a certification"
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.profile.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Social Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.profile.socialLinks.github || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, github: e.target.value }
                        }
                      }))}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.profile.socialLinks.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, linkedin: e.target.value }
                        }
                      }))}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.profile.socialLinks.portfolio || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          socialLinks: { ...prev.profile.socialLinks, portfolio: e.target.value }
                        }
                      }))}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Portfolio URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours & Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Working Hours & Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.preferences.workingHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        workingHours: { ...prev.preferences.workingHours, start: e.target.value }
                      }
                    }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.preferences.workingHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        workingHours: { ...prev.preferences.workingHours, end: e.target.value }
                      }
                    }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Notification Preferences
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, email: e.target.checked }
                        }
                      }))}
                      className="rounded"
                    />
                    <span className="text-slate-300">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.push}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, push: e.target.checked }
                        }
                      }))}
                      className="rounded"
                    />
                    <span className="text-slate-300">Push notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.slack}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, slack: e.target.checked }
                        }
                      }))}
                      className="rounded"
                    />
                    <span className="text-slate-300">Slack notifications</span>
                  </label>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Create Personnel' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelModal; 