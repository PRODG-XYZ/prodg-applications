'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Briefcase,
  Award,
  Github,
  Linkedin,
  Globe,
  User,
  Building,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface TeamDirectoryProps {
  currentPersonnelId: string;
  teamMembers: any[];
  departments: string[];
  onContactMember?: (memberId: string) => void;
  onScheduleMeeting?: (memberId: string) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'department' | 'role' | 'available';

const TeamDirectory = ({ 
  currentPersonnelId, 
  teamMembers, 
  departments = [],
  onContactMember,
  onScheduleMeeting 
}: TeamDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(teamMembers.map(member => member.role))];
    return uniqueRoles.sort();
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => member._id !== currentPersonnelId);

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.profile?.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower)) ||
        member.department.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(member => member.status === 'active');
    }

    return filtered;
  }, [teamMembers, currentPersonnelId, searchTerm, selectedDepartment, selectedRole, showAvailableOnly]);

  const getAvailabilityStatus = (member: any) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const workStart = member.preferences?.workingHours?.start || '09:00';
    const workEnd = member.preferences?.workingHours?.end || '17:00';
    
    const isWorkingHours = currentTime >= workStart && currentTime <= workEnd;
    const isActive = member.status === 'active';
    
    if (!isActive) return { status: 'offline', text: 'Offline', color: 'bg-slate-500' };
    if (isWorkingHours) return { status: 'available', text: 'Available', color: 'bg-green-500' };
    return { status: 'away', text: 'Away', color: 'bg-yellow-500' };
  };

  const MemberCard = ({ member }: { member: any }) => {
    const availability = getAvailabilityStatus(member);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden">
                {member.profile?.avatar ? (
                  <img src={member.profile.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${availability.color} rounded-full border-2 border-slate-800`} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{member.name}</h3>
              <p className="text-slate-400 text-sm">{member.role}</p>
              <div className="flex items-center space-x-1 text-slate-500 text-xs mt-1">
                <Building className="w-3 h-3" />
                <span>{member.department}</span>
              </div>
            </div>
          </div>
          
          <button className="text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Bio */}
        {member.profile?.bio && (
          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
            {member.profile.bio}
          </p>
        )}

        {/* Skills */}
        {member.profile?.skills && member.profile.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-slate-400 text-xs font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {member.profile.skills.slice(0, 3).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {member.profile.skills.length > 3 && (
                <span className="text-slate-400 text-xs">+{member.profile.skills.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center space-x-2 mb-4">
          <div className={`w-2 h-2 ${availability.color} rounded-full`} />
          <span className="text-slate-400 text-sm">{availability.text}</span>
          {member.preferences?.timezone && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-sm">{member.preferences.timezone.split('/')[1]}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onContactMember?.(member._id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Message</span>
          </button>
          <button
            onClick={() => onScheduleMeeting?.(member._id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Meet</span>
          </button>
        </div>

        {/* Social Links */}
        {(member.profile?.socialLinks?.github || member.profile?.socialLinks?.linkedin || member.profile?.socialLinks?.portfolio) && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-700/50">
            {member.profile.socialLinks.github && (
              <a
                href={member.profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {member.profile.socialLinks.linkedin && (
              <a
                href={member.profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {member.profile.socialLinks.portfolio && (
              <a
                href={member.profile.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const MemberListItem = ({ member }: { member: any }) => {
    const availability = getAvailabilityStatus(member);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-slate-700 rounded-full overflow-hidden">
                {member.profile?.avatar ? (
                  <img src={member.profile.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${availability.color} rounded-full border-2 border-slate-800`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-white font-medium">{member.name}</h3>
                <span className="text-slate-400 text-sm">{member.role}</span>
                <span className="text-slate-500 text-sm">•</span>
                <span className="text-slate-400 text-sm">{member.department}</span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-slate-400 text-sm">
                  <div className={`w-2 h-2 ${availability.color} rounded-full`} />
                  <span>{availability.text}</span>
                </div>
                
                {member.profile?.skills && member.profile.skills.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {member.profile.skills.slice(0, 2).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.profile.skills.length > 2 && (
                      <span className="text-slate-400 text-xs">+{member.profile.skills.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {member.profile?.socialLinks?.github && (
                <a
                  href={member.profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {member.profile?.socialLinks?.linkedin && (
                <a
                  href={member.profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => onContactMember?.(member._id)}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onScheduleMeeting?.(member._id)}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Team Directory
          </h2>
          <p className="text-slate-400 mt-1">
            Connect and collaborate with your team members
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {/* Available Only Toggle */}
        <label className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
          />
          <span className="text-white text-sm">Available only</span>
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-slate-300 text-sm">Total Members</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{teamMembers.length - 1}</p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-300 text-sm">Available</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {filteredMembers.filter(m => getAvailabilityStatus(m).status === 'available').length}
          </p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-purple-400" />
            <span className="text-slate-300 text-sm">Departments</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{departments.length}</p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-orange-400" />
            <span className="text-slate-300 text-sm">Filtered</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{filteredMembers.length}</p>
        </div>
      </div>

      {/* Team Members */}
      <div>
        {filteredMembers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MemberCard member={member} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MemberListItem member={member} />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No team members found</h3>
            <p className="text-slate-400">
              {searchTerm || selectedDepartment || selectedRole || showAvailableOnly
                ? 'Try adjusting your filters to see more results.'
                : 'No team members are currently available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDirectory; 