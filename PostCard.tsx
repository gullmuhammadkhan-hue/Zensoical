import React, { useState, useRef, useEffect } from 'react';
import { Post, ReactionType } from '../types';
import { useSocial } from '../context/SocialContext';
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Globe,
  Users,
  Vote,
  GraduationCap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  MapPin,
  Mic2,
  Send,
  Trash2,
  Copy,
  UserPlus,
  UserCheck,
  Repeat,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const REACTIONS: { type: ReactionType; label: string; emoji: string; color: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-[#1877F2]' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-rose-500' },
  { type: 'care', label: 'Care', emoji: '🤗', color: 'text-amber-500' },
  { type: 'haha', label: 'Haha', emoji: '😂', color: 'text-amber-500' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-amber-500' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-amber-500' },
  { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-600' },
];

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    openUserProfile,
    toggleFollowUser,
    reactToPost,
    addComment,
    toggleLikeComment,
    sharePost,
    toggleSavePost,
    deletePost,
    showToast,
  } = useSocial();

  const [showReactionsBar, setShowReactionsBar] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Video playback simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Video progress timer
  useEffect(() => {
    if (isPlaying) {
      videoTimerRef.current = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    } else {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    }
    return () => {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    };
  }, [isPlaying]);

  const author = post.author;
  const isOwnPost = currentUser.id === post.authorId;
  const currentReactionObj = REACTIONS.find((r) => r.type === post.userReaction);

  const handleLikeClick = () => {
    if (post.userReaction) {
      reactToPost(post.id, null);
    } else {
      reactToPost(post.id, 'like');
    }
  };

  const handleSelectReaction = (type: ReactionType) => {
    reactToPost(post.id, type);
    setShowReactionsBar(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleReplySubmit = (parentCommentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addComment(post.id, replyText, parentCommentId);
    setReplyText('');
    setReplyingToId(null);
  };

  // Text truncation for long speeches/posts
  const isLongText = post.content.length > 280;
  const displayText = isLongText && !isExpanded ? `${post.content.slice(0, 280)}...` : post.content;

  const renderAudienceIcon = () => {
    switch (post.audience) {
      case 'voters':
        return <span title="Voters Only"><Vote className="w-3 h-3 text-slate-400" /></span>;
      case 'campus':
        return <span title="Campus & Students"><GraduationCap className="w-3 h-3 text-slate-400" /></span>;
      case 'connections':
        return <span title="Connections Only"><Users className="w-3 h-3 text-slate-400" /></span>;
      default:
        return <span title="Public"><Globe className="w-3 h-3 text-slate-400" /></span>;
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 mb-4 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Author avatar */}
          <button
            onClick={() => openUserProfile(author.id)}
            className="relative shrink-0 rounded-full focus:outline-hidden group"
            aria-label={`View ${author.name}'s profile`}
          >
            <img
              src={author.avatar}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 group-hover:opacity-90 transition-opacity"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Author info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => openUserProfile(author.id)}
                className="font-bold text-sm text-slate-900 hover:text-[#1877F2] hover:underline truncate focus:outline-hidden transition-colors"
              >
                {author.name}
              </button>
              {author.countryFlag && (
                <span className="text-xs" title={author.country}>
                  {author.countryFlag}
                </span>
              )}
              {author.verified && (
                <span title="Verified Account">
                  <CheckCircle2
                    className="w-4 h-4 text-[#1877F2] shrink-0 fill-current"
                  />
                </span>
              )}
              {!isOwnPost && (
                <button
                  onClick={() => toggleFollowUser(author.id)}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                    author.isFollowing
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      : 'text-[#1877F2] hover:bg-blue-50'
                  }`}
                >
                  {author.isFollowing ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Author role / organization */}
            <p className="text-xs text-slate-500 truncate">{author.role}</p>

            {/* Metadata (Clean unboxed text with typographic dot separators) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
              <span>{post.timestamp}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                {renderAudienceIcon()}
                <span className="capitalize">{post.audience}</span>
              </span>
              {post.categoryLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 font-medium">{post.categoryLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Options Menu */}
        <div className="relative shrink-0" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>{post.isSaved ? 'Remove from Bookmarks' : 'Save Post to Bookmarks'}</span>
              </button>
              <button
                onClick={() => {
                  sharePost(post.id, 'copy');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Link to Post</span>
              </button>
              {!isOwnPost && (
                <button
                  onClick={() => {
                    toggleFollowUser(author.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {author.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-slate-500" />
                      <span>Unfollow @{author.handle}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-slate-500" />
                      <span>Follow @{author.handle}</span>
                    </>
                  )}
                </button>
              )}
              {isOwnPost && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Speech / Event Metadata banner if present */}
      {post.speechDetails && (
        <div className="mx-4 mb-2 p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2 truncate">
            <Mic2 className="w-4 h-4 text-[#1877F2] shrink-0" />
            <div className="truncate">
              {post.speechDetails.location && (
                <span className="font-semibold">{post.speechDetails.location}</span>
              )}
              {post.speechDetails.location && post.speechDetails.event && <span> · </span>}
              {post.speechDetails.event && (
                <span className="text-slate-600">{post.speechDetails.event}</span>
              )}
            </div>
          </div>
          {post.speechDetails.transcriptUrl && (
            <a
              href={post.speechDetails.transcriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1877F2] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Transcript</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Post Text Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
          {displayText}
        </p>

        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-slate-500 hover:text-[#1877F2] hover:underline mt-1"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}

        {/* Clickable Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#1877F2] hover:underline cursor-pointer"
                onClick={() => showToast(`Filtered feed by ${tag}`, 'info')}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Section: Video / Photo / News */}
      {post.video && (
        <div className="relative bg-slate-950 aspect-video overflow-hidden">
          <img
            src={post.video.thumbnailUrl}
            alt={post.video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-90' : 'opacity-75'
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Video Title Overlay */}
          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-xs z-10">
            <span className="font-semibold truncate max-w-[80%]">{post.video.title}</span>
            <span className="bg-black/60 px-2 py-0.5 rounded-md text-[11px] font-mono">
              {post.video.duration}
            </span>
          </div>

          {/* Centered Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center group focus:outline-hidden"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <div className="w-14 h-14 rounded-full bg-black/60 group-hover:bg-[#1877F2] group-hover:scale-110 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
            </div>
          </button>

          {/* Video Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-10 space-y-1.5">
            {/* Progress Bar */}
            <div
              className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = (clickX / rect.width) * 100;
                setVideoProgress(newPct);
              }}
            >
              <div
                className="h-full bg-[#1877F2] transition-all duration-150"
                style={{ width: `${videoProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span>{isPlaying ? 'Streaming Broadcast' : 'Official Speech Recording'}</span>
                <span>·</span>
                <span className="tabular-nums">
                  {(post.video.viewsCount + (isPlaying ? 1 : 0)).toLocaleString()} views
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1 hover:text-[#1877F2] transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {!post.video && post.imageUrl && !post.news && (
        <div className="relative bg-slate-100 overflow-hidden border-y border-slate-100 max-h-[520px] flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* News Article Card */}
      {post.news && (
        <div className="border-y border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors">
          <a
            href={post.news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            {post.news.imageUrl && (
              <div className="relative aspect-video max-h-56 overflow-hidden bg-slate-200">
                <img
                  src={post.news.imageUrl}
                  alt={post.news.headline}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-3.5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>{post.news.domain}</span>
                <span>·</span>
                <span>{post.news.publisher}</span>
              </span>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1877F2] transition-colors line-clamp-2">
                {post.news.headline}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {post.news.summary}
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Engagement Counters Row */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {post.likesCount > 0 && (
            <div className="flex items-center -space-x-1">
              <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] ring-2 ring-white">
                👍
              </span>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white">
                ❤️
              </span>
            </div>
          )}
          <span className="tabular-nums font-medium">
            {post.likesCount > 0 ? post.likesCount.toLocaleString() : 'Be the first to react'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline tabular-nums"
            >
              {post.commentsCount.toLocaleString()} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
          {post.sharesCount > 0 && (
            <span className="tabular-nums">{post.sharesCount.toLocaleString()} shares</span>
          )}
        </div>
      </div>

      {/* Action Buttons Row with Reaction Picker */}
      <div className="relative px-2 py-1 flex items-center justify-between border-b border-slate-100">
        {/* Floating Facebook Reaction Bar on Hover / Long Press */}
        {showReactionsBar && (
          <div
            onMouseLeave={() => setShowReactionsBar(false)}
            className="absolute -top-12 left-2 z-30 bg-white rounded-full shadow-2xl border border-slate-200 px-2 py-1.5 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleSelectReaction(r.type)}
                className="text-2xl hover:scale-135 transition-transform p-1 active:scale-110"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <div
          className="flex-1 relative"
          onMouseEnter={() => setShowReactionsBar(true)}
        >
          <button
            onClick={handleLikeClick}
            className={`min-h-[40px] w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors hover:bg-slate-50 ${
              currentReactionObj ? currentReactionObj.color : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentReactionObj ? (
              <span className="text-base">{currentReactionObj.emoji}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span className="capitalize">{currentReactionObj ? currentReactionObj.label : 'Like'}</span>
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="min-h-[40px] flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button & Popover */}
        <div className="relative flex-1" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="min-h-[40px] w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {showShareMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  sharePost(post.id, 'feed');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Repeat className="w-4 h-4 text-[#1877F2]" />
                <span>Share to Feed Now</span>
              </button>
              <button
                onClick={() => {
                  sharePost(post.id, 'copy');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Post Link</span>
              </button>
              <button
                onClick={() => {
                  sharePost(post.id, 'external');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Share via Direct Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-slate-50/50 space-y-3">
          {/* New Comment Input Box */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-[#1877F2] focus-within:ring-2 focus-within:ring-[#1877F2]/10 transition-all">
              <input
                type="text"
                placeholder={
                  author.category === 'politician'
                    ? 'Write a public comment or question for this address...'
                    : 'Write a comment...'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden py-1"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1 rounded-full text-[#1877F2] disabled:text-slate-300 hover:bg-blue-50 transition-colors"
                aria-label="Send comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments.length > 0 ? (
            <div className="space-y-3 pt-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => openUserProfile(comment.user.id)}
                      className="shrink-0 focus:outline-hidden"
                    >
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 inline-block max-w-full">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openUserProfile(comment.user.id)}
                            className="font-bold text-xs text-slate-900 hover:text-[#1877F2] truncate"
                          >
                            {comment.user.name}
                          </button>
                          {comment.user.verified && (
                            <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-current" />
                          )}
                          {comment.user.countryFlag && (
                            <span className="text-xs">{comment.user.countryFlag}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 ml-2">
                        <button
                          onClick={() => toggleLikeComment(post.id, comment.id)}
                          className={`font-semibold hover:underline ${
                            comment.isLiked ? 'text-[#1877F2]' : 'text-slate-600'
                          }`}
                        >
                          Like {comment.likesCount > 0 && `(${comment.likesCount})`}
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                          className="font-semibold hover:underline text-slate-600"
                        >
                          Reply
                        </button>
                        <span>·</span>
                        <span>{comment.timestamp}</span>
                      </div>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-200">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <img
                                src={reply.user.avatar}
                                alt={reply.user.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <div className="bg-white p-2 rounded-xl border border-slate-200/80 inline-block max-w-full">
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-[11px] text-slate-900">
                                      {reply.user.name}
                                    </span>
                                    {reply.user.verified && (
                                      <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-current" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-700 mt-0.5">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 ml-1">
                                  <span>{reply.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline Reply Input */}
                      {replyingToId === comment.id && (
                        <form
                          onSubmit={(e) => handleReplySubmit(comment.id, e)}
                          className="mt-2 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            placeholder={`Reply to ${comment.user.name.split(' ')[0]}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:border-[#1877F2] focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="px-3 py-1 bg-[#1877F2] text-white text-xs font-semibold rounded-lg disabled:opacity-40"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-2">
              No comments yet. Start the conversation!
            </p>
          )}
        </div>
      )}
    </article>
  );
};
