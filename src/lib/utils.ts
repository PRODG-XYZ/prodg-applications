import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'reviewing':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'approved':
      return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/20'
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}
