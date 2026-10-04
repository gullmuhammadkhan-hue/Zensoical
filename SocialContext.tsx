import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Post, Story, NotificationItem, ReactionType, NavigationTab, Comment } from '../types';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_STORIES, INITIAL_NOTIFICATIONS } from '../data/initialData';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface SocialContextType {
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  stories: Story[];
  notifications: NotificationItem[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedUserId: string | null;
  openUserProfile: (userId: string) => void;
  switchCurrentUser: (userId: string) => void;
  toggleFollowUser: (userId: string) => void;
  
  // Post Actions
  addPost: (postData: {
    content: string;
    audience: 'public' | 'voters' | 'campus' | 'connections';
    categoryLabel?: string;
    imageUrl?: string;
    video?: {
      title: string;
      duration: string;
      thumbnailUrl: string;
      viewsCount: number;
    };
    news?: {
      publisher: string;
      domain: string;
      headline: string;
      summary: string;
      url: string;
      imageUrl?: string;
    };
    hashtags?: string[];
    speechDetails?: {
      location?: string;
      event?: string;
      transcriptUrl?: string;
    };
  }) => void;
  reactToPost: (postId: string, reaction: ReactionType | null) => void;
  addComment: (postId: string, content: string, parentCommentId?: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  sharePost: (postId: string, target?: 'feed' | 'copy' | 'external') => void;
  toggleSavePost: (postId: string) => void;
  deletePost: (postId: string) => void;

  // Story Actions
  activeStoryIndex: number | null;
  openStoryViewer: (storyIndex: number) => void;
  closeStoryViewer: () => void;
  addStory: (mediaUrl: string, caption?: string) => void;

  // Notification Actions
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Modal Composer State
  isCreateModalOpen: boolean;
  createModalInitialType: 'post' | 'video' | 'news';
  openCreateModal: (type?: 'post' | 'video' | 'news') => void;
  closeCreateModal: () => void;

  // Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (category: string) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'zensocial_current_user_id',
  USERS: 'zensocial_users_v1',
  POSTS: 'zensocial_posts_v1',
  STORIES: 'zensocial_stories_v1',
  NOTIFICATIONS: 'zensocial_notifications_v1',
};

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-me';
  });

  const [users, setUsers] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed['user-me']) {
          parsed['user-me'].avatar = '/zensocial_logo.png';
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STORIES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialType, setCreateModalInitialType] = useState<'post' | 'video' | 'news'>('post');
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const currentUser = users[currentUserId] || INITIAL_USERS['user-me'];

  const openUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchCurrentUser = (userId: string) => {
    if (users[userId]) {
      setCurrentUserId(userId);
      showToast(`Switched active profile to ${users[userId].name}`, 'info');
    }
  };

  const toggleFollowUser = (userId: string) => {
    setUsers(prev => {
      const targetUser = prev[userId];
      if (!targetUser) return prev;
      const isCurrentlyFollowing = !!targetUser.isFollowing;
      const updatedUser = {
        ...targetUser,
        isFollowing: !isCurrentlyFollowing,
        followersCount: isCurrentlyFollowing ? targetUser.followersCount - 1 : targetUser.followersCount + 1,
      };

      const updatedMe = {
        ...prev[currentUserId],
        followingCount: isCurrentlyFollowing
          ? Math.max(0, prev[currentUserId].followingCount - 1)
          : prev[currentUserId].followingCount + 1,
      };

      return {
        ...prev,
        [userId]: updatedUser,
        [currentUserId]: updatedMe,
      };
    });

    const targetUser = users[userId];
    if (targetUser) {
      const willFollow = !targetUser.isFollowing;
      showToast(
        willFollow ? `Now following ${targetUser.name}` : `Unfollowed ${targetUser.name}`,
        'success'
      );
    }
  };

  const addPost = (postData: {
    content: string;
    audience: 'public' | 'voters' | 'campus' | 'connections';
    categoryLabel?: string;
    imageUrl?: string;
    video?: {
      title: string;
      duration: string;
      thumbnailUrl: string;
      viewsCount: number;
    };
    news?: {
      publisher: string;
      domain: string;
      headline: string;
      summary: string;
      url: string;
      imageUrl?: string;
    };
    hashtags?: string[];
    speechDetails?: {
      location?: string;
      event?: string;
      transcriptUrl?: string;
    };
  }) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      content: postData.content,
      timestamp: 'Just now',
      createdAt: Date.now(),
      audience: postData.audience,
      categoryLabel: postData.categoryLabel || (currentUser.category === 'politician' ? 'Policy & Public Address' : 'Update'),
      imageUrl: postData.imageUrl,
      video: postData.video,
      news: postData.news,
      likesCount: 0,
      userReaction: null,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
      hashtags: postData.hashtags || [],
      speechDetails: postData.speechDetails,
    };

    setPosts(prev => [newPost, ...prev]);

    // Update user post count
    setUsers(prev => {
      const me = prev[currentUser.id];
      if (!me) return prev;
      return {
        ...prev,
        [currentUser.id]: {
          ...me,
          postsCount: me.postsCount + 1,
        }
      };
    });

    showToast('Your post has been published to ZenSocial feed!', 'success');
  };

  const reactToPost = (postId: string, reaction: ReactionType | null) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const previousReaction = post.userReaction;
        let newLikesCount = post.likesCount;

        if (!previousReaction && reaction) {
          newLikesCount += 1;
        } else if (previousReaction && !reaction) {
          newLikesCount = Math.max(0, newLikesCount - 1);
        }

        return {
          ...post,
          userReaction: reaction,
          likesCount: newLikesCount,
        };
      })
    );
  };

  const addComment = (postId: string, content: string, parentCommentId?: string) => {
    if (!content.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: content.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        let updatedComments = [...post.comments];
        if (parentCommentId) {
          updatedComments = updatedComments.map(c => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          });
        } else {
          updatedComments.push(newComment);
        }

        return {
          ...post,
          comments: updatedComments,
          commentsCount: post.commentsCount + 1,
        };
      })
    );

    showToast('Comment posted', 'success');
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const updateList = (list: Comment[]): Comment[] => {
          return list.map(c => {
            if (c.id === commentId) {
              const liked = !c.isLiked;
              return {
                ...c,
                isLiked: liked,
                likesCount: liked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: updateList(c.replies),
              };
            }
            return c;
          });
        };

        return {
          ...post,
          comments: updateList(post.comments),
        };
      })
    );
  };

  const sharePost = (postId: string, target: 'feed' | 'copy' | 'external' = 'feed') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (target === 'copy') {
      navigator.clipboard?.writeText(window.location.origin + `#post-${postId}`);
      showToast('Link to post copied to clipboard!', 'info');
      return;
    }

    if (target === 'feed') {
      const repost: Post = {
        id: `post-repost-${Date.now()}`,
        authorId: currentUser.id,
        author: currentUser,
        content: `Shared from ${post.author.name}:\n\n${post.content.slice(0, 200)}...`,
        timestamp: 'Just now',
        createdAt: Date.now(),
        audience: 'public',
        categoryLabel: 'Repost',
        imageUrl: post.imageUrl,
        video: post.video,
        news: post.news,
        likesCount: 0,
        userReaction: null,
        commentsCount: 0,
        sharesCount: 0,
        comments: [],
      };

      setPosts(prev => [
        repost,
        ...prev.map(p => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p)),
      ]);

      showToast(`Shared ${post.author.name}'s post to your feed!`, 'success');
    } else {
      showToast('Opening external share sheet...', 'info');
    }
  };

  const toggleSavePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const saved = !post.isSaved;
        showToast(saved ? 'Post saved to your bookmarks' : 'Post removed from saved bookmarks', 'info');
        return {
          ...post,
          isSaved: saved,
        };
      })
    );
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('Post removed', 'info');
  };

  const openStoryViewer = (index: number) => {
    setActiveStoryIndex(index);
    // Mark viewed
    if (stories[index]) {
      setStories(prev =>
        prev.map((s, idx) => (idx === index ? { ...s, isViewed: true } : s))
      );
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
  };

  const addStory = (mediaUrl: string, caption?: string) => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      mediaUrl,
      mediaType: 'image',
      caption,
      timestamp: 'Just now',
      expiresAt: Date.now() + 24 * 3600000,
      isViewed: true,
    };
    setStories(prev => [newStory, ...prev]);
    showToast('Your story has been added!', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const openCreateModal = (type: 'post' | 'video' | 'news' = 'post') => {
    setCreateModalInitialType(type);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        posts,
        stories,
        notifications,
        activeTab,
        setActiveTab,
        selectedUserId,
        openUserProfile,
        switchCurrentUser,
        toggleFollowUser,
        addPost,
        reactToPost,
        addComment,
        toggleLikeComment,
        sharePost,
        toggleSavePost,
        deletePost,
        activeStoryIndex,
        openStoryViewer,
        closeStoryViewer,
        addStory,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isCreateModalOpen,
        createModalInitialType,
        openCreateModal,
        closeCreateModal,
        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
