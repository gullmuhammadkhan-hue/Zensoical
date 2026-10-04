export type AccountCategory = 'politician' | 'education' | 'business' | 'citizen' | 'journalist';

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  role: string;
  organization?: string;
  country?: string;
  countryFlag?: string;
  category: AccountCategory;
  verified: boolean;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  website?: string;
  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface NewsAttachment {
  publisher: string;
  domain: string;
  headline: string;
  summary: string;
  url: string;
  imageUrl?: string;
}

export interface VideoAttachment {
  title: string;
  duration: string;
  videoUrl?: string;
  thumbnailUrl: string;
  viewsCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  timestamp: string;
  createdAt: number;
  audience: 'public' | 'voters' | 'campus' | 'connections';
  categoryLabel?: string;
  imageUrl?: string;
  video?: VideoAttachment;
  news?: NewsAttachment;
  likesCount: number;
  userReaction?: ReactionType | null;
  commentsCount: number;
  sharesCount: number;
  comments: Comment[];
  isSaved?: boolean;
  hashtags?: string[];
  pinned?: boolean;
  speechDetails?: {
    location?: string;
    event?: string;
    transcriptUrl?: string;
  };
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  timestamp: string;
  expiresAt: number;
  isViewed: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'speech' | 'news' | 'mention';
  actor: User;
  message: string;
  timestamp: string;
  postId?: string;
  isRead: boolean;
}

export type NavigationTab = 'home' | 'search' | 'create' | 'notifications' | 'profile';
