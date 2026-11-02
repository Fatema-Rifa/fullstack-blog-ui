import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PenSquare, FileText, Heart, Eye, Trash2, Pencil, Eye as EyeIcon } from "lucide-react";
import { postService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";

const STATUS_COLORS = {
  published: "badge-success",
  draft:     "badge-warning",
  archived:  "badge-surface",
};

export default function DashboardPage() {
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-posts", user?._id],
    queryFn: () => postService.getByAuthor(user._id, { status: "all", limit: 50 }),
    enabled: !!user?._id,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => postService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboard-posts"]);
      toast.success("Post deleted");
    },
  });

  const posts = (data?.data || []).filter((p) => {
    if (tab === "all") return true;
    return p.status === tab;
  });

  const counts = {
    all:       data?.data?.length        || 0,
    published: data?.data?.filter((p) => p.status === "published").length || 0,
    draft:     data?.data?.filter((p) => p.status === "draft").length     || 0,
    archived:  data?.data?.filter((p) => p.status === "archived").length  || 0,
  };

  const totalViews = data?.data?.reduce((a, p) => a + (p.viewsCount  || 0), 0) || 0;
  const totalLikes = data?.data?.reduce((a, p) => a + (p.likesCount  || 0), 0) || 0;
  const totalComments = data?.data?.reduce((a, p) => a + (p.commentsCount || 0), 0) || 0;

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">Manage your posts</p>
        </div>
        <Link to="/write" className="btn-md btn-gradient">
          <PenSquare size={15} /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, value: counts.all,    label: "Total Posts",    color: "from-primary-500 to-primary-600" },
          { icon: Eye,      value: totalViews,    label: "Total Views",    color: "from-accent-500  to-accent-600"  },
          { icon: Heart,    value: totalLikes,    label: "Total Likes",    color: "from-red-500     to-rose-500"    },
          { icon: FileText, value: totalComments, label: "Total Comments", color: "from-emerald-500 to-teal-500"   },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="card p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{value.toLocaleString()}</p>
              <p className="text-xs text-surface-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-surface-200 dark:border-surface-700 mb-6 overflow-x-auto no-scrollbar pb-0.5">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "pb-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-surface-400 hover:text-surface-700 dark:hover:text-surface-300"
            )}
          >
            {key} <span className="ml-1 text-xs opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-3">✍️</p>
          <p className="text-surface-500 mb-4">No posts here yet</p>
          <Link to="/write" className="btn-md btn-gradient">Write your first post</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px] sm:min-w-full">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-surface-600 dark:text-surface-400">Post</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 dark:text-surface-400 hidden md:table-cell">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600 dark:text-surface-400 hidden sm:table-cell">Views</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600 dark:text-surface-400 hidden sm:table-cell">Likes</th>
                <th className="text-right px-5 py-3 font-semibold text-surface-600 dark:text-surface-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <Link to={`/posts/${post.slug}`} className="font-semibold text-surface-800 dark:text-surface-200 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1 transition-colors">
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-surface-400">
                          {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Not published"}
                        </p>
                        <span className="md:hidden">
                          <span className={clsx(STATUS_COLORS[post.status] || "badge-surface", "text-[10px] !px-1.5 !py-0.5")}>{post.status}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={STATUS_COLORS[post.status] || "badge-surface"}>{post.status}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-surface-500 hidden sm:table-cell">
                    {post.viewsCount || 0}
                  </td>
                  <td className="px-4 py-4 text-center text-surface-500 hidden sm:table-cell">
                    {post.likesCount || 0}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/posts/${post.slug}`} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="View">
                        <EyeIcon size={15} />
                      </Link>
                      <Link to={`/write/${post.slug}`} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this post?")) deleteMut.mutate(post._id);
                        }}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
