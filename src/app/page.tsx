'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EtheralShadow } from '@/components/ui/etheral-shadow';
import { applicationSchema, type ApplicationFormData } from '@/lib/validation';
import { Github, Linkedin, Mail, User, Code, Briefcase, Clock, X, FileText, Phone, Globe } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const popularSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Next.js', 'Vue.js',
  'UI/UX', 'Flutter', 'PHP', 'Figma'
];

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>('');
  const [uploadedResumeFileName, setUploadedResumeFileName] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleFileUpload = (url: string, fileName: string) => {
    setUploadedResumeUrl(url);
    setUploadedResumeFileName(fileName);
    setValue('resumeUrl', url);
  };

  const handleRemoveFile = () => {
    setUploadedResumeUrl('');
    setUploadedResumeFileName('');
    setValue('resumeUrl', '');
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...data, 
          skills: selectedSkills,
          resumeUrl: uploadedResumeUrl || data.resumeUrl 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Application submitted successfully! We\'ll be in touch soon.');
        reset();
        setSelectedSkills([]);
        setUploadedResumeUrl('');
        setUploadedResumeFileName('');
      } else {
        setSubmitMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* EtheralShadow Background */}
      <div className="absolute inset-0 z-0">
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 100, speed: 100 }}
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
          className="w-full h-full"
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10 z-1" />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700/50 p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">Welcome to PeopleOS</h2>
                <p className="text-cyan-100 leading-relaxed">
                  Collaborate on innovative projects, grow your skills, and be part of a community that&apos;s shaping tomorrow&apos;s technology.
                </p>
              </div>
              
              <Button 
                onClick={() => setShowWelcomeModal(false)}
                className="w-full"
              >
                Start Your Application
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-6"
            >
              Join PeopleOS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-cyan-200 max-w-xl mx-auto"
            >
              Code. Collaborate. Grow.
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-cyan-500/20 p-8 shadow-2xl shadow-cyan-500/10"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-cyan-200">
                    <User className="w-4 h-4 text-cyan-400" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Your full name"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.name ? 'border-red-500/50' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-cyan-200">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your.email@example.com"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.email ? 'border-red-500/50' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-cyan-200">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+254 712 345 678"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.phone ? 'border-red-500/50' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2 text-cyan-200">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Country *
                  </Label>
                  <select
                    {...register('country')}
                    className={`flex h-10 w-full rounded-md border bg-slate-800/50 px-3 py-2 text-sm text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.country ? 'border-red-500/50 focus-visible:ring-red-400/20' : 'border-cyan-500/30 focus-visible:ring-cyan-400/20 focus-visible:border-cyan-400'}`}
                  >
                    <option value="" className="bg-slate-800 text-slate-400">Select your country</option>
                    {countries.map((country) => (
                      <option key={country} value={country} className="bg-slate-800 text-slate-50">
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-400 text-sm">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2 text-cyan-200">
                    <Github className="w-4 h-4 text-cyan-400" />
                    GitHub Profile *
                  </Label>
                  <Input
                    id="github"
                    {...register('github')}
                    placeholder="https://github.com/username"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.github ? 'border-red-500/50' : ''}`}
                  />
                  {errors.github && (
                    <p className="text-red-400 text-sm">{errors.github.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2 text-cyan-200">
                    <Linkedin className="w-4 h-4 text-cyan-400" />
                    LinkedIn Profile *
                  </Label>
                  <Input
                    id="linkedin"
                    {...register('linkedin')}
                    placeholder="https://linkedin.com/in/username"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.linkedin ? 'border-red-500/50' : ''}`}
                  />
                  {errors.linkedin && (
                    <p className="text-red-400 text-sm">{errors.linkedin.message}</p>
                  )}
                </div>
              </div>

              {/* Background Description */}
              <div className="space-y-2">
                <Label htmlFor="backgroundDescription" className="flex items-center gap-2 text-cyan-200">
                  <User className="w-4 h-4 text-cyan-400" />
                  Professional Background *
                </Label>
                <Textarea
                  id="backgroundDescription"
                  {...register('backgroundDescription')}
                  placeholder="Tell us about your professional journey, education, and what drives you as a developer..."
                  className={`min-h-[120px] bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.backgroundDescription ? 'border-red-500/50' : ''}`}
                />
                {errors.backgroundDescription && (
                  <p className="text-red-400 text-sm">{errors.backgroundDescription.message}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-2 text-cyan-200">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  Development Experience *
                </Label>
                <Textarea
                  id="experience"
                  {...register('experience')}
                  placeholder="Describe your development experience, notable projects, and technical achievements..."
                  className={`min-h-[100px] bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.experience ? 'border-red-500/50' : ''}`}
                />
                {errors.experience && (
                  <p className="text-red-400 text-sm">{errors.experience.message}</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-cyan-200">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Technical Skills * (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularSkills.map((skill) => (
                    <motion.button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                        selectedSkills.includes(skill)
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-100 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700/30 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/10'
                      }`}
                    >
                      {skill}
                    </motion.button>
                  ))}
                </div>
                {errors.skills && (
                  <p className="text-red-400 text-sm">{errors.skills.message}</p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="text-cyan-200">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    {...register('portfolioUrl')}
                    placeholder="https://yourportfolio.com"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.portfolioUrl ? 'border-red-500/50' : ''}`}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-red-400 text-sm">{errors.portfolioUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-cyan-200">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Resume Upload
                  </Label>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    onRemove={handleRemoveFile}
                    currentFileName={uploadedResumeFileName}
                  />
                  {errors.resumeUrl && (
                    <p className="text-red-400 text-sm">{errors.resumeUrl.message}</p>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-cyan-200">Why do you want to join us? *</Label>
                <Textarea
                  id="motivation"
                  {...register('motivation')}
                  placeholder="What excites you about working with us? How do you see yourself contributing to our mission?"
                  className={`min-h-[100px] bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.motivation ? 'border-red-500/50' : ''}`}
                />
                {errors.motivation && (
                  <p className="text-red-400 text-sm">{errors.motivation.message}</p>
                )}
              </div>

              {/* Availability */}
              <div className="grid md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="availability" className="flex items-center gap-2 text-cyan-200">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Weekly Availability *
                  </Label>
                  <Input
                    id="availability"
                    {...register('availability')}
                    placeholder="e.g., 20 hours per week, flexible schedule"
                    className={`bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-slate-400 ${errors.availability ? 'border-red-500/50' : ''}`}
                  />
                  {errors.availability && (
                    <p className="text-red-400 text-sm">{errors.availability.message}</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="px-12"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>

              {/* Message */}
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    submitMessage.includes('successfully')
                      ? 'bg-cyan-500/10 border-cyan-400/20 text-cyan-100'
                      : 'bg-red-500/10 border-red-400/20 text-red-200'
                  }`}
                >
                  {submitMessage}
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
