import { Link } from "react-router-dom";
import { Clock, Heart, MessageCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

export default function PostCard({ post, featured = false }) {
  const { slug, title, excerpt, coverImage, author, category, tags, publishedAt, readTime, likesCount, commentsCount, viewsCount } = post;

  return (
    <article
      className={clsx(
        "card-hover group overflow-hidden flex flex-col",
        featured && "md:flex-row"
      )}
    >
      {/* Cover Image */}
      <Link
        to={`/posts/${slug}`}
        className={clsx(
          "block overflow-hidden flex-shrink-0",
          featured ? "md:w-2/5 h-56 md:h-auto" : "h-48"
        )}
      >
        {coverImage?.url ? (
          <img
            src={coverImage.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/20 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary-200 dark:text-primary-800 select-none">
              {title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {category && (
            <Link to={`/explore?category=${category._id}`}>
              <span
                className="badge-primary text-xs"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </span>
            </Link>
          )}
          {tags?.slice(0, 2).map((tag) => (
            <Link key={tag._id} to={`/explore?tag=${tag.slug}`}>
              <span className="badge-surface">#{tag.name}</span>
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/posts/${slug}`}>
          <h2
            className={clsx(
              "font-bold font-serif text-surface-900 dark:text-white line-clamp-2 mb-2",
              "group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",
              featured ? "text-2xl md:text-3xl" : "text-xl"
            )}
          >
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Author */}
          <Link to={`/profile/${author?.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            {author?.avatar?.url ? (
              <img src={author.avatar.url} alt={author.username} className="avatar w-7 h-7" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {author?.username?.[0]?.toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                {author?.name || author?.username}
              </p>
              <p className="text-xs text-surface-400">
                {publishedAt ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true }) : "Draft"}
              </p>
            </div>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-3 text-surface-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {readTime || 1}m
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {viewsCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} /> {likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
