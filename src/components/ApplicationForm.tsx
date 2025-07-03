'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { applicationSchema, type ApplicationFormData } from '@/lib/validation';
import { Github, Linkedin, Mail, User, Code, Briefcase, Clock, FileText, CheckCircle, Phone, Globe } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const popularSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Next.js', 'Vue.js'
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

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleResumeUpload = (url: string, fileName: string) => {
    setValue('resumeUrl', url);
    setResumeFileName(fileName);
  };

  const handleResumeRemove = () => {
    setValue('resumeUrl', '');
    setResumeFileName('');
  };

  const handleVisitProdg = () => {
    window.location.href = 'https://prodg.studio';
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
        body: JSON.stringify({ ...data, skills: selectedSkills }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        reset();
        setSelectedSkills([]);
        setResumeFileName('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Application Successful!</h2>
            <p className="text-slate-300 mb-8">
              Thank you for your application. We&apos;ll be in touch soon!
            </p>
            
            <Button
              onClick={handleVisitProdg}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              size="lg"
            >
              Visit PRODG
            </Button>
          </motion.div>
        </div>
      )}
      
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
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Join Our Dev Team
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              We&apos;re a cutting-edge development company pushing the boundaries of technology. 
              We build the future, one line of code at a time. Are you ready to shape tomorrow with us?
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Your full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your.email@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+254 712 345 678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Country *
                  </Label>
                  <select
                    {...register('country')}
                    className={`flex h-10 w-full rounded-md border ${errors.country ? 'border-red-500' : 'border-slate-700'} bg-slate-800/50 px-3 py-2 text-sm text-slate-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="" className="bg-slate-800 text-slate-400">Select your country</option>
                    {countries.map((country) => (
                      <option key={country} value={country} className="bg-slate-800 text-slate-50">
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-cyan-400" />
                    GitHub Profile *
                  </Label>
                  <Input
                    id="github"
                    {...register('github')}
                    placeholder="https://github.com/username"
                    className={errors.github ? 'border-red-500' : ''}
                  />
                  {errors.github && (
                    <p className="text-red-500 text-sm">{errors.github.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-cyan-400" />
                    LinkedIn Profile *
                  </Label>
                  <Input
                    id="linkedin"
                    {...register('linkedin')}
                    placeholder="https://linkedin.com/in/username"
                    className={errors.linkedin ? 'border-red-500' : ''}
                  />
                  {errors.linkedin && (
                    <p className="text-red-500 text-sm">{errors.linkedin.message}</p>
                  )}
                </div>
              </div>

              {/* Background Description */}
              <div className="space-y-2">
                <Label htmlFor="backgroundDescription" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  Professional Background * (min 50, max 2000 characters)
                </Label>
                <Textarea
                  id="backgroundDescription"
                  {...register('backgroundDescription')}
                  placeholder="Tell us about your professional journey..."
                  className={`min-h-[120px] ${errors.backgroundDescription ? 'border-red-500' : ''}`}
                />
                {errors.backgroundDescription && (
                  <p className="text-red-500 text-sm">{errors.backgroundDescription.message}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  Development Experience * (min 50, max 2000 characters)
                </Label>
                <Textarea
                  id="experience"
                  {...register('experience')}
                  placeholder="Describe your development experience..."
                  className={`min-h-[100px] ${errors.experience ? 'border-red-500' : ''}`}
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm">{errors.experience.message}</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
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
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {skill}
                    </motion.button>
                  ))}
                </div>
                {errors.skills && (
                  <p className="text-red-500 text-sm">{errors.skills.message}</p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    {...register('portfolioUrl')}
                    placeholder="https://yourportfolio.com"
                    className={errors.portfolioUrl ? 'border-red-500' : ''}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-red-500 text-sm">{errors.portfolioUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Upload Resume
                  </Label>
                  <FileUpload
                    onFileUpload={handleResumeUpload}
                    onRemove={handleResumeRemove}
                    currentFileName={resumeFileName}
                    disabled={isSubmitting}
                  />
                  {errors.resumeUrl && (
                    <p className="text-red-500 text-sm">{errors.resumeUrl.message}</p>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to join us? * (min 50, max 1000 characters)</Label>
                <Textarea
                  id="motivation"
                  {...register('motivation')}
                  placeholder="What excites you about working with us?"
                  className={`min-h-[100px] ${errors.motivation ? 'border-red-500' : ''}`}
                />
                {errors.motivation && (
                  <p className="text-red-500 text-sm">{errors.motivation.message}</p>
                )}
              </div>

              {/* Availability & Salary */}
              <div className="space-y-2">
                <Label htmlFor="availability" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Availability *
                </Label>
                <Input
                  id="availability"
                  {...register('availability')}
                  placeholder="e.g., Immediately, 2 weeks notice, etc."
                  className={errors.availability ? 'border-red-500' : ''}
                />
                {errors.availability && (
                  <p className="text-red-500 text-sm">{errors.availability.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full md:w-auto px-12"
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
                      ? 'bg-green-500/10 border-green-400/20 text-green-400'
                      : 'bg-red-500/10 border-red-400/20 text-red-400'
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