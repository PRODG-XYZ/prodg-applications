import { z } from 'zod';

export const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long'),
  github: z.string().min(1, 'GitHub profile is required').url('Please enter a valid GitHub URL').refine(
    (url) => url.includes('github.com'),
    'Must be a valid GitHub URL'
  ),
  linkedin: z.string().min(1, 'LinkedIn profile is required').url('Please enter a valid LinkedIn URL').refine(
    (url) => url.includes('linkedin.com'),
    'Must be a valid LinkedIn URL'
  ),
  backgroundDescription: z.string().min(1, 'Professional background is required').min(50, 'Please provide at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  experience: z.string().min(1, 'Development experience is required').min(50, 'Please provide at least 50 characters').max(2000, 'Experience must be less than 2000 characters'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill').max(20, 'Maximum 20 skills allowed'),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  resumeUrl: z.string().url('Please enter a valid resume URL').optional().or(z.literal('')),
  motivation: z.string().min(1, 'Motivation is required').min(50, 'Please provide at least 50 characters').max(1000, 'Motivation must be less than 1000 characters'),
  availability: z.string().min(1, 'Availability is required'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>; 