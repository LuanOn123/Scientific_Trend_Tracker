export type Role = "user" | "researcher" | "lecturer" | "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  interests: string[];
  isActive?: boolean;
}

export interface Paper {
  _id: string;
  title: string;
  abstract?: string;
  authors: { name: string; affiliation?: string }[];
  journal: string;
  publicationYear?: number;
  publicationDate?: string;
  doi?: string;
  keywords: string[];
  topics: string[];
  citationCount: number;
  sourceName: string;
  sourceUrl?: string;
}

export interface TrendPoint {
  year: number;
  month?: number;
  count: number;
  keyword?: string;
  topic?: string;
  journal?: string;
}

export interface Keyword {
  _id: string;
  name: string;
  paperCount: number;
  trendScore: number;
}

export interface Topic extends Keyword {
  description?: string;
}

export interface Journal {
  _id: string;
  name: string;
  publisher?: string;
  paperCount: number;
  topics: string[];
}

export interface Bookmark {
  _id: string;
  paperId: Paper;
  collection: string;
  note?: string;
  tags: string[];
}

export interface NotificationItem {
  _id: string;
  type: "new_paper" | "trend_update" | "system";
  title: string;
  message: string;
  isRead: boolean;
  relatedKeyword?: string;
  createdAt: string;
}

export interface Recommendation {
  _id: string;
  paperId: Paper;
  score: number;
  reasons: string[];
}

export interface DashboardData {
  totals: { totalPapers: number; totalJournals: number; totalKeywords: number; totalTopics: number };
  papersByYear: { year: number; count: number }[];
  topKeywords: Keyword[];
  topJournals: Journal[];
  emerging: { keywords: Keyword[]; topics: Topic[] };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
