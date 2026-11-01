import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { postService, categoryService, tagService } from "../../services";
import PostCard from "../../components/posts/PostCard";
import { PostCardSkeleton } from "../../components/ui/Skeletons";
import clsx from "clsx";

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Latest"   },
  { value: "viewsCount",  label: "Popular"  },
  { value: "likesCount",  label: "Most Liked" },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const tag      = searchParams.get("tag")      || "";
  const sortBy   = searchParams.get("sortBy")   || "publishedAt";
  const page     = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["posts", "explore", { search, category, tag, sortBy, page }],
    queryFn: () => postService.getAll({ search, category, tag, sortBy, page, limit: 9 }),
    keepPreviousData: true,
  });

  const { data: catData } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });
  const { data: tagData } = useQuery({ queryKey: ["tags", "popular"], queryFn: () => tagService.getAll({ popular: true }) });

  const posts      = data?.data       || [];
  const pagination = data?.pagination;
  const categories = catData?.categories || [];
  const tags       = tagData?.tags       || [];

  const setParam  = (key, val) => setSearchParams((prev) => { const p = new URLSearchParams(prev); val ? p.set(key, val) : p.delete(key); p.delete("page"); return p; });
  const clearAll  = () => setSearchParams({});

  const hasFilters = search || category || tag || sortBy !== "publishedAt";

  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => { setLocalSearch(search); }, [search]);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-2">Explore</h1>
        <p className="text-surface-500">Discover stories, thinking, and expertise from writers on any topic.</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); setParam("search", localSearch.trim()); }}
          className="flex items-center flex-1 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-all"
        >
          <Search size={18} className="ml-4 text-surface-400 flex-shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
          />
          {localSearch && (
            <button type="button" onClick={() => { setLocalSearch(""); setParam("search", ""); }} className="mr-2 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
              <X size={14} className="text-surface-400" />
            </button>
          )}
        </form>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setParam("sortBy", e.target.value)}
          className="input !w-auto !py-3 text-sm cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={clsx("btn-md btn-secondary gap-2", filtersOpen && "ring-2 ring-primary-500")}
        >
          <SlidersHorizontal size={15} /> Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-6 mb-6 animate-slide-down space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-800 dark:text-surface-200">Filters</h3>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear all</button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setParam("category", category === cat._id ? "" : cat._id)}
                  className={clsx(
                    "badge border transition-all",
                    category === cat._id
                      ? "ring-2 ring-offset-1 ring-primary-500"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((t) => (
                <button
                  key={t._id}
                  onClick={() => setParam("tag", tag === t.slug ? "" : t.slug)}
                  className={clsx(
                    "badge-surface border border-transparent transition-all hover:scale-105",
                    tag === t.slug && "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300"
                  )}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {search && (
            <span className="badge-primary">
              "{search}" <button onClick={() => setParam("search", "")}><X size={11} /></button>
            </span>
          )}
          {category && (
            <span className="badge-accent">
              {categories.find((c) => c._id === category)?.name || "Category"}
              <button onClick={() => setParam("category", "")}><X size={11} /></button>
            </span>
          )}
          {tag && (
            <span className="badge-surface">
              #{tag} <button onClick={() => setParam("tag", "")}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-surface-400 mb-5">
          {pagination?.total || 0} result{pagination?.total !== 1 ? "s" : ""}
          {isFetching && " · Updating…"}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No posts found</p>
          <p className="text-surface-400 mb-6">Try different keywords or filters</p>
          <button onClick={clearAll} className="btn-md btn-secondary">Clear filters</button>
        </div>
      ) : (
        <div className={clsx("grid sm:grid-cols-2 lg:grid-cols-3 gap-6", isFetching && "opacity-70 transition-opacity")}>
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setParam("page", String(page - 1))}
            className="btn-md btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setParam("page", String(i + 1))}
                className={clsx(
                  "w-9 h-9 rounded-xl text-sm font-medium transition-all",
                  page === i + 1
                    ? "bg-primary-600 text-white shadow-sm"
                    : "btn-ghost"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setParam("page", String(page + 1))}
            className="btn-md btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
