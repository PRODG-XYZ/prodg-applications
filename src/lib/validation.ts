import { z } from 'zod';

export const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select a country').max(100, 'Country name too long'),
  github: z.string().url('Please enter a valid GitHub URL').refine(
    (url) => url.includes('github.com'),
    'Must be a valid GitHub URL'
  ),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').refine(
    (url) => url.includes('linkedin.com'),
    'Must be a valid LinkedIn URL'
  ),
  backgroundDescription: z.string().min(1, 'Please provide your background description').max(10, 'Description must be less than 10 characters'),
  experience: z.string().min(1, 'Please provide your experience').max(10, 'Experience must be less than 10 characters'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill').max(20, 'Maximum 20 skills allowed'),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  resumeUrl: z.string().url('Please enter a valid resume URL').optional().or(z.literal('')),
  motivation: z.string().min(1, 'Please provide your motivation').max(10, 'Motivation must be less than 10 characters'),
  availability: z.string().min(1, 'Please specify your availability'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>; 