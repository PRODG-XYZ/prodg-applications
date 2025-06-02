'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IApplication } from '@/lib/models/Application';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  User,
  Mail,
  Github,
  Linkedin,
  Code,
  ExternalLink,
  Trash2
} from 'lucide-react';

export default function Dashboard() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<IApplication | null>(null);
  const [currentPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApplications();
        if (selectedApplication && selectedApplication._id === id) {
          setSelectedApplication(null);
        }
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,100,100,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Applications Dashboard
          </h1>
          <p className="text-slate-300 text-lg">
            Manage and review developer applications
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Applications</h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No applications found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application, index) => (
                    <motion.div
                      key={application._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedApplication(application)}
                      className={`bg-slate-700/30 rounded-lg p-4 cursor-pointer border transition-all duration-300 hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-400/10 ${
                        selectedApplication?._id === application._id ? 'border-gray-400 shadow-lg shadow-gray-400/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{application.name}</h3>
                            <p className="text-slate-400 text-sm">{application.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm">
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 sticky top-8"
            >
              {selectedApplication ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">{selectedApplication.name}</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${selectedApplication.email}`} className="hover:text-gray-400">
                          {selectedApplication.email}
                        </a>
                      </div>
                      {selectedApplication.phone && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{selectedApplication.phone}</span>
                        </div>
                      )}
                      {selectedApplication.country && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selectedApplication.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-gray-400" />
                        <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 flex items-center gap-1">
                          GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-gray-400" />
                        <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 flex items-center gap-1">
                          LinkedIn <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-md border border-gray-600/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Background</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedApplication.backgroundDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Experience</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedApplication.experience}
                    </p>
                  </div>

                  {selectedApplication.motivation && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Motivation</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {selectedApplication.motivation}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Availability:</span>
                      <p className="text-white">{selectedApplication.availability}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-medium text-white mb-3">Actions</h4>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteApplication(selectedApplication._id!)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Select an application to view details
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 