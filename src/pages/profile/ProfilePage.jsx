import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCheck, MapPin, Calendar, FileText, Heart, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { userService, postService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "../../components/posts/PostCard";
import { PostCardSkeleton } from "../../components/ui/Skeletons";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const queryClient  = useQueryClient();
  const [tab, setTab] = useState("posts");

  const { data, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => userService.getProfile(username),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["author-posts", data?.user?._id],
    queryFn: () => postService.getByAuthor(data.user._id, { limit: 20 }),
    enabled: !!data?.user?._id,
  });

  const followMut = useMutation({
    mutationFn: () => userService.follow(data.user._id),
    onSuccess: ({ following }) => {
      queryClient.invalidateQueries(["profile", username]);
      toast.success(following ? "Followed!" : "Unfollowed");
    },
  });

  if (isLoading) {
    return (
      <div className="page-container py-10 animate-pulse">
        <div className="skeleton h-48 rounded-3xl mb-0" />
        <div className="flex gap-4 -mt-12 px-8 mb-4">
          <div className="skeleton w-24 h-24 rounded-full ring-4 ring-white dark:ring-surface-950" />
        </div>
        <div className="px-8 space-y-2">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-64 mt-2" />
        </div>
      </div>
    );
  }

  const { user, isFollowing } = data;
  const posts  = postsData?.data || [];
  const isMe   = me?._id === user._id || me?.username === username;

  const totalLikes  = posts.reduce((a, p) => a + (p.likesCount  || 0), 0);
  const totalViews  = posts.reduce((a, p) => a + (p.viewsCount  || 0), 0);

  return (
    <div>
      {/* Banner */}
      <div className="h-44 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white" style={{ width: `${Math.random()*120+40}px`, height: `${Math.random()*120+40}px`, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, opacity: Math.random()*0.6+0.2 }} />
          ))}
        </div>
      </div>

      <div className="page-container">
        {/* Profile header */}
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6 pb-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="ring-4 ring-white dark:ring-surface-950 rounded-full shadow-card">
              {user.avatar?.url ? (
                <img src={user.avatar.url} alt={user.username} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{user.name || user.username}</h1>
              <p className="text-surface-500">@{user.username}</p>
            </div>
          </div>

          <div className="flex gap-2 pb-1 w-full sm:w-auto">
            {isMe ? (
              <Link to="/settings" className="btn-md btn-secondary">Edit Profile</Link>
            ) : (
              me && (
                <button
                  onClick={() => followMut.mutate()}
                  disabled={followMut.isLoading}
                  className={clsx("btn-md", isFollowing ? "btn-secondary" : "btn-gradient")}
                >
                  {followMut.isLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : isFollowing
                      ? <><UserCheck size={15} /> Following</>
                      : <><UserPlus size={15} /> Follow</>}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="space-y-5">
            {user.bio && (
              <div className="card p-5">
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{user.bio}</p>
              </div>
            )}

            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-surface-500">
                <Calendar size={14} className="text-primary-500" />
                Joined {format(new Date(user.createdAt), "MMM yyyy")}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, value: posts.length, label: "Posts"    },
                { icon: UserPlus, value: user.followersCount || 0, label: "Followers" },
                { icon: Heart,    value: totalLikes,  label: "Likes"     },
                { icon: Eye,      value: totalViews,  label: "Views"     },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon size={16} className="text-primary-500 mx-auto mb-1" />
                  <p className="font-bold text-surface-900 dark:text-white">{value.toLocaleString()}</p>
                  <p className="text-xs text-surface-400">{label}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* Posts */}
          <div className="lg:col-span-3">
            <div className="flex gap-4 border-b border-surface-200 dark:border-surface-700 mb-6 overflow-x-auto no-scrollbar pb-0.5">
              {["posts", "liked"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    "pb-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
                    tab === t
                      ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                      : "border-transparent text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                  )}
                >
                  {t === "posts" ? `Posts (${posts.length})` : "Liked"}
                </button>
              ))}
            </div>

            {postsLoading ? (
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-surface-500">{isMe ? "You haven't written anything yet." : "No posts yet."}</p>
                {isMe && <Link to="/write" className="btn-md btn-gradient mt-4">Write your first post</Link>}
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post) => <PostCard key={post._id} post={post} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
