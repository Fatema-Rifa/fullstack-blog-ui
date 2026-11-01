import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../../services";

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });
  const categories = data?.categories || [];

  return (
    <div className="page-container py-10">
      <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-2">Categories</h1>
      <p className="text-surface-500 mb-10">Browse posts by topic</p>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/explore?category=${cat._id}`}
              className="card-hover p-6 group flex items-start gap-4 cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <span style={{ color: cat.color }}>●</span>
              </div>
              <div>
                <h3
                  className="font-bold text-lg text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-surface-500 line-clamp-2 mt-1">{cat.description}</p>
                )}
                <p className="text-xs text-surface-400 mt-2">{cat.postsCount} posts</p>
              </div>
            </Link>
          ))}
          {!categories.length && (
            <p className="text-surface-400 col-span-3 text-center py-16">No categories yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
