
export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  EMERGENCY = 'Emergency'
}

export enum Status {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  VERIFIED = 'Verified',
  EMERGENCY = 'Emergency'
}

export type Role = 'Admin' | 'Official' | 'Citizen';

export type Category = 'Road' | 'Water' | 'Crime' | 'Pollution' | 'Public Safety' | 'Sanitation' | 'Infrastructure' | 'Electricity' | 'Fire' | 'Accident' | 'Other';

export interface Location {
  lat: number;
  lng: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface UserMetrics {
  reportedCount: number;
  confirmedCount: number;
  resolvedCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Category;
  impactScore: number;
  avatar: string;
  metrics?: UserMetrics;
}

export interface StatusUpdate {
  status: Status;
  timestamp: string;
  note?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  area: string;
  ward: string;
  priority: Priority;
  status: Status;
  category: Category;
  location: Location;
  createdAt: string;
  userId: string;
  comments: Comment[];
  verifications: string[]; // Citizen confirmation IDs
  officialVerification?: string; // Official's User ID
  imageUrl?: string;
  aiAnalysis?: AIAnalysis;
  statusHistory?: StatusUpdate[];
}

export interface AIAnalysis {
  suggestedTitle: string;
  suggestedPriority: Priority;
  category: Category;
  severityScore: number;
  reasoning: string;
  actionItems: string[];
}
