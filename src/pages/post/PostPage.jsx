import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart, MessageCircle, Eye, Clock, Share2, Bookmark, ArrowLeft,
  Loader2, Send, ChevronDown, Pencil, Trash2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { postService, commentService, userService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { PostPageSkeleton, CommentSkeleton } from "../../components/ui/Skeletons";
import toast from "react-hot-toast";
import clsx from "clsx";

/* ─── Comment component ─────────────────────────────────────────────────── */
function Comment({ comment, postId }) {
  const { user }     = useAuth();
  const queryClient  = useQueryClient();
  const [reply,   setReply]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [text,    setText]    = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const { data: repliesData } = useQuery({
    queryKey: ["replies", comment._id],
    queryFn: () => commentService.getReplies(comment._id),
    enabled: showReplies,
  });

  const deleteMut = useMutation({
    mutationFn: () => commentService.delete(comment._id),
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const updateMut = useMutation({
    mutationFn: () => commentService.update(comment._id, { content: text }),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const likeMut = useMutation({
    mutationFn: () => commentService.toggleLike(comment._id),
    onSuccess: () => queryClient.invalidateQueries(["comments", postId]),
  });

  const replyMut = useMutation({
    mutationFn: (content) => commentService.create(postId, { content, parentId: comment._id }),
    onSuccess: () => {
      setReply(false);
      setShowReplies(true);
      queryClient.invalidateQueries(["replies", comment._id]);
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const isOwner = user?._id === comment.author?._id || user?._id === comment.author;

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Link to={`/profile/${comment.author?.username}`}>
        {comment.author?.avatar?.url ? (
          <img src={comment.author.avatar.url} alt="" className="avatar w-9 h-9 flex-shrink-0" />
        ) : (
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.author?.username?.[0]?.toUpperCase()}
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="bg-surface-50 dark:bg-surface-800/60 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${comment.author?.username}`} className="text-sm font-semibold hover:underline">
              {comment.author?.name || comment.author?.username}
            </Link>
            <span className="text-xs text-surface-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && <span className="text-xs text-surface-400">(edited)</span>}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input text-sm resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => updateMut.mutate()} disabled={updateMut.isLoading} className="btn-sm btn-primary text-xs">
                  {updateMut.isLoading ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="btn-sm btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1.5 px-2">
          <button onClick={() => likeMut.mutate()} className="text-xs text-surface-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <Heart size={13} /> {comment.likesCount || 0}
          </button>
          {user && (
            <button onClick={() => setReply((r) => !r)} className="text-xs text-surface-400 hover:text-primary-500 transition-colors">
              Reply
            </button>
          )}
          {comment.repliesCount > 0 && (
            <button onClick={() => setShowReplies((s) => !s)} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 transition-colors">
              <ChevronDown size={12} className={clsx("transition-transform", showReplies && "rotate-180")} />
              {comment.repliesCount} {comment.repliesCount === 1 ? "reply" : "replies"}
            </button>
          )}
          {isOwner && (
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setEditing(true)} className="text-xs text-surface-400 hover:text-primary-500 transition-colors"><Pencil size={12} /></button>
              <button onClick={() => deleteMut.mutate()} className="text-xs text-surface-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
            </div>
          )}
        </div>

        {/* Reply box */}
        {reply && <ReplyBox postId={postId} onSubmit={(c) => replyMut.mutateAsync(c)} onCancel={() => setReply(false)} />}

        {/* Replies */}
        {showReplies && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-surface-100 dark:border-surface-700">
            {repliesData?.data?.map((r) => <Comment key={r._id} comment={r} postId={postId} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyBox({ postId, onSubmit, onCancel, placeholder = "Write a reply…" }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try { await onSubmit(text.trim()); setText(""); } catch (_) {}
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="input text-sm resize-none flex-1"
        rows={2}
        autoFocus
      />
      <div className="flex flex-col gap-1">
        <button type="submit" disabled={loading || !text.trim()} className="btn-sm btn-primary p-2">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-sm btn-secondary p-2 text-xs">✕</button>}
      </div>
    </form>
  );
}

/* ─── Main PostPage ─────────────────────────────────────────────────────── */
export default function PostPage() {
  const { slug }     = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postService.getBySlug(slug),
    onSuccess: (d) => {
      setLiked(d.isLiked);
      setLikeCount(d.post.likesCount);
    },
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", data?.post?._id],
    queryFn: () => commentService.getByPost(data.post._id),
    enabled: !!data?.post?._id,
  });

  const likeMut = useMutation({
    mutationFn: () => postService.toggleLike(data.post._id),
    onMutate: () => {
      setLiked((l) => !l);
      setLikeCount((c) => liked ? c - 1 : c + 1);
    },
    onError: () => {
      setLiked((l) => !l);
      setLikeCount((c) => liked ? c + 1 : c - 1);
    },
  });

  const commentMut = useMutation({
    mutationFn: (content) => commentService.create(data.post._id, { content }),
    onSuccess: () => queryClient.invalidateQueries(["comments", data.post._id]),
  });

  const deleteMut = useMutation({
    mutationFn: () => postService.delete(data.post._id),
    onSuccess: () => { toast.success("Post deleted"); navigate("/"); },
  });

  const followMut = useMutation({
    mutationFn: () => userService.follow(data.post.author._id),
    onSuccess: () => queryClient.invalidateQueries(["post", slug]),
  });

  if (isLoading) return <div className="page-container"><PostPageSkeleton /></div>;
  if (error)     return <div className="page-container py-20 text-center"><p className="text-red-500 text-lg">Post not found.</p><Link to="/" className="btn-md btn-secondary mt-4">Go Home</Link></div>;

  const { post, isFollowing } = data;

  return (
    <div className="page-container py-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
          {post.category && (
            <Link to={`/explore?category=${post.category._id}`}>
              <span className="badge border" style={{ backgroundColor: `${post.category.color}15`, color: post.category.color, borderColor: `${post.category.color}30` }}>
                {post.category.name}
              </span>
            </Link>
          )}
          {post.tags?.map((tag) => (
            <Link key={tag._id} to={`/explore?tag=${tag.slug}`}>
              <span className="badge-surface">#{tag.name}</span>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-surface-900 dark:text-white leading-tight mb-5 animate-slide-up">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.username}`}>
              {post.author?.avatar?.url ? (
                <img src={post.author.avatar.url} alt="" className="avatar w-12 h-12" />
              ) : (
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {post.author?.username?.[0]?.toUpperCase()}
                </span>
              )}
            </Link>
            <div>
              <Link to={`/profile/${post.author?.username}`} className="font-semibold text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {post.author?.name || post.author?.username}
              </Link>
              <div className="flex items-center gap-3 text-sm text-surface-400">
                <span>{post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Draft"}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}m read</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {post.viewsCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && user._id !== post.author?._id && (
              <button
                onClick={() => followMut.mutate()}
                className={clsx("btn-sm", isFollowing ? "btn-secondary" : "btn-primary")}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            {user && (user._id === post.author?._id || user.role === "admin") && (
              <div className="flex gap-2">
                <Link to={`/write/${post._id}`} className="btn-sm btn-secondary">
                  <Pencil size={13} /> Edit
                </Link>
                <button onClick={() => deleteMut.mutate()} disabled={deleteMut.isLoading} className="btn-sm btn-danger">
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage?.url && (
          <div className="rounded-3xl overflow-hidden mb-10 shadow-card aspect-[16/7] animate-fade-in">
            <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-blog mb-10 animate-fade-in"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Reaction bar */}
        <div className="flex items-center gap-4 py-5 border-y border-surface-200 dark:border-surface-700 mb-10">
          <button
            onClick={() => user ? likeMut.mutate() : navigate("/login")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm",
              liked
                ? "bg-red-50 dark:bg-red-900/20 text-red-500 ring-1 ring-red-200 dark:ring-red-800"
                : "btn-secondary"
            )}
          >
            <Heart size={16} className={liked ? "fill-red-500" : ""} /> {likeCount} Likes
          </button>
          <button className="flex items-center gap-2 btn-sm btn-secondary">
            <MessageCircle size={16} /> {commentsData?.pagination?.total || 0} Comments
          </button>
          <div className="flex-1" />
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
            className="btn-sm btn-secondary"
          >
            <Share2 size={15} />
          </button>
          <button className="btn-sm btn-secondary"><Bookmark size={15} /></button>
        </div>

        {/* Author card */}
        <div className="card p-6 mb-10 flex items-start gap-4">
          <Link to={`/profile/${post.author?.username}`}>
            {post.author?.avatar?.url ? (
              <img src={post.author.avatar.url} alt="" className="avatar w-14 h-14" />
            ) : (
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                {post.author?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${post.author?.username}`} className="font-bold text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {post.author?.name || post.author?.username}
            </Link>
            <p className="text-sm text-surface-500 mt-1 line-clamp-2">{post.author?.bio || "No bio yet."}</p>
            <p className="text-xs text-surface-400 mt-1">{post.author?.followersCount || 0} followers</p>
          </div>
          {user && user._id !== post.author?._id && (
            <button onClick={() => followMut.mutate()} className={clsx("btn-sm flex-shrink-0", isFollowing ? "btn-secondary" : "btn-primary")}>
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle size={20} /> Comments ({commentsData?.pagination?.total || 0})
          </h2>

          {/* Add comment */}
          {user ? (
            <div className="flex gap-3 mb-8">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.username?.[0]?.toUpperCase()}
              </span>
              <ReplyBox
                postId={post._id}
                onSubmit={(c) => commentMut.mutateAsync(c)}
                placeholder="Share your thoughts…"
              />
            </div>
          ) : (
            <div className="card p-5 mb-8 text-center">
              <p className="text-surface-500 mb-3">Sign in to leave a comment</p>
              <Link to="/login" className="btn-md btn-primary">Sign in</Link>
            </div>
          )}

          {/* Comment list */}
          <div className="space-y-6">
            {commentsLoading
              ? [...Array(3)].map((_, i) => <CommentSkeleton key={i} />)
              : commentsData?.data?.map((c) => <Comment key={c._id} comment={c} postId={post._id} />)}
            {!commentsLoading && commentsData?.data?.length === 0 && (
              <p className="text-center text-surface-400 py-10">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
