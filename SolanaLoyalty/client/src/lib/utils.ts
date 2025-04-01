import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, start = 4, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatDateRelative(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) return 'just now';
  if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return past.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const mockTransactions = [
  {
    id: 1,
    type: 'earn',
    amount: 50,
    description: 'Coffee purchase at Java Beans',
    timeAgo: '2h ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'redeem',
    amount: 200,
    description: '$10 discount at TechStore',
    timeAgo: 'Yesterday',
    status: 'completed'
  },
  {
    id: 3,
    type: 'earn',
    amount: 100,
    description: 'Dinner at Gourmet Place',
    timeAgo: '2 days ago',
    status: 'completed'
  }
];

export const mockRewards = [
  {
    id: 1,
    name: '$10 Discount',
    description: 'Use your tokens for a discount on your next purchase.',
    tokenCost: 200
  },
  {
    id: 2,
    name: 'Free Coffee',
    description: 'Redeem for a free coffee at any participating location.',
    tokenCost: 150
  },
  {
    id: 3,
    name: 'Priority Service',
    description: 'Skip the line with priority service at partner locations.',
    tokenCost: 100
  }
];
