import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, Users } from "lucide-react";
import { postService, categoryService } from "../../services";
import PostCard from "../../components/posts/PostCard";
import { PostCardSkeleton } from "../../components/ui/Skeletons";

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      <p className="text-sm text-surface-500">{label}</p>
    </div>
  </div>
);

export default function HomePage() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: () => postService.getAll({ featured: true, limit: 1 }),
  });

  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: () => postService.getAll({ limit: 6, sortBy: "publishedAt" }),
  });

  const { data: trendingData, isLoading: loadingTrending } = useQuery({
    queryKey: ["posts", "trending"],
    queryFn: () => postService.getAll({ limit: 4, sortBy: "viewsCount" }),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const featured  = featuredData?.data?.[0];
  const latest    = latestData?.data   || [];
  const trending  = trendingData?.data || [];
  const categories = catData?.categories || [];

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 gradient-hero">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="badge-primary mb-4 inline-flex">
              <Sparkles size={12} /> The modern blogging platform
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif text-surface-900 dark:text-white leading-tight mb-6 text-balance">
              Where ideas come{" "}
              <span className="gradient-text">alive</span>
            </h1>
            <p className="text-xl text-surface-500 dark:text-surface-400 leading-relaxed mb-8 max-w-xl mx-auto">
              Discover insightful stories from writers around the world, or start sharing your own.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/explore" className="btn-lg btn-gradient">
                Start reading <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-lg btn-secondary">
                Start writing for free
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-14 max-w-2xl mx-auto text-center">
            {[
              { num: "10K+", label: "Articles published" },
              { num: "5K+",  label: "Active writers"     },
              { num: "50K+", label: "Monthly readers"    },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold gradient-text">{num}</p>
                <p className="text-sm text-surface-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container py-12 space-y-16">
        {/* ── Featured post ───────────────────────────────────────────── */}
        {(loadingFeatured || featured) && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2"><Sparkles size={20} className="text-primary-500" /> Featured</h2>
            </div>
            {loadingFeatured ? (
              <PostCardSkeleton />
            ) : (
              <PostCard post={featured} featured />
            )}
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* ── Latest posts ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Latest Posts</h2>
              <Link to="/explore" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {loadingLatest ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {latest.map((post) => <PostCard key={post._id} post={post} />)}
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="space-y-8">
            {/* Trending */}
            <div className="card p-6">
              <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-accent-500" /> Trending
              </h3>
              <div className="space-y-4">
                {loadingTrending
                  ? [...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="skeleton h-3.5 w-3/4" />
                          <div className="skeleton h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  : trending.map((post, idx) => (
                      <Link key={post._id} to={`/posts/${post.slug}`} className="flex items-start gap-3 group">
                        <span className="w-8 h-8 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-500 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 transition-colors leading-snug">
                            {post.title}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">{post.viewsCount} views</p>
                        </div>
                      </Link>
                    ))}
              </div>
            </div>

            {/* Categories */}
            <div className="card p-6">
              <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <Users size={18} className="text-primary-500" /> Browse Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/explore?category=${cat._id}`}
                    className="badge border transition-all hover:scale-105"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}
                  >
                    {cat.name}
                    {cat.postsCount > 0 && <span className="opacity-60 text-[10px]">{cat.postsCount}</span>}
                  </Link>
                ))}
                {!categories.length && <p className="text-sm text-surface-400">No categories yet.</p>}
              </div>
              <Link to="/categories" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1 mt-4">
                All categories <ArrowRight size={12} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
