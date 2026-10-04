import React, { useState } from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Header } from './components/Header';
import { StoryBar } from './components/StoryBar';
import { ActionRow } from './components/ActionRow';
import { PostCard } from './components/PostCard';
import { SearchTab } from './components/SearchTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ProfileView } from './components/ProfileView';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { BottomNavBar } from './components/BottomNavBar';
import { CreatePostModal } from './components/CreatePostModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { ToastContainer } from './components/Toast';
import { Sparkles, Mic2, GraduationCap, Building2, Users } from 'lucide-react';

const MainFeed: React.FC = () => {
  const { posts } = useSocial();
  const [feedCategory, setFeedCategory] = useState<string>('all');

  const filteredPosts = posts.filter((post) => {
    if (feedCategory === 'all') return true;
    if (feedCategory === 'speeches') {
      return post.author.category === 'politician' || post.speechDetails || post.video;
    }
    if (feedCategory === 'campus') {
      return post.author.category === 'education' || post.audience === 'campus';
    }
    if (feedCategory === 'business') {
      return post.author.category === 'business';
    }
    if (feedCategory === 'civic') {
      return post.author.category === 'citizen' || post.author.category === 'journalist';
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Instagram-style Horizontal Story Bar */}
      <StoryBar />

      {/* Action Row with three buttons: Create Post, Upload Video, Share News */}
      <ActionRow />

      {/* Feed Category Segmented Bar (Non-pill buttons per design guidelines) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'All Updates', icon: Sparkles },
          { id: 'speeches', label: 'Speeches & Politics', icon: Mic2 },
          { id: 'campus', label: 'Colleges & Research', icon: GraduationCap },
          { id: 'business', label: 'Enterprise & Products', icon: Building2 },
          { id: 'civic', label: 'Civic & Citizens', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = feedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFeedCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white text-[#1877F2] shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Facebook-Style Post Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-xs shadow-xs">
            No posts found in this category. Be the first to share an update!
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { activeTab } = useSocial();

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col text-slate-900">
      {/* Top Header Bar */}
      <Header />

      {/* 3-Column Facebook Desktop Layout / Responsive Mobile Center */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 flex gap-6 justify-center">
        {/* Left Desktop Navigation & Profile Shortcuts */}
        <SidebarLeft />

        {/* Center Main Stage */}
        <section className="flex-1 max-w-2xl min-w-0">
          {activeTab === 'home' && <MainFeed />}
          {activeTab === 'search' && <SearchTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'profile' && <ProfileView />}
        </section>

        {/* Right Desktop World Leaders, Campuses & Trending Debates */}
        <SidebarRight />
      </main>

      {/* Bottom Mobile Navigation Tabs (Home, Search, Create, Notifications, Profile) */}
      <BottomNavBar />

      {/* Interactive Global Modals */}
      <CreatePostModal />
      <StoryViewerModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SocialProvider>
      <AppContent />
    </SocialProvider>
  );
}
