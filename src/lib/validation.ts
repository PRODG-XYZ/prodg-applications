import { z } from 'zod';

export const applicationSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  country: z.string().max(100, 'Country name too long').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid GitHub URL').refine(
    (url) => !url || url.includes('github.com'),
    'Must be a valid GitHub URL'
  ).optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').refine(
    (url) => !url || url.includes('linkedin.com'),
    'Must be a valid LinkedIn URL'
  ).optional().or(z.literal('')),
  backgroundDescription: z.string().max(10, 'Description must be less than 10 characters').optional().or(z.literal('')),
  experience: z.string().max(10, 'Experience must be less than 10 characters').optional().or(z.literal('')),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed'),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  resumeUrl: z.string().url('Please enter a valid resume URL').optional().or(z.literal('')),
  motivation: z.string().max(10, 'Motivation must be less than 10 characters').optional().or(z.literal('')),
  availability: z.string().optional().or(z.literal('')),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>; 