import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  PenSquare, Search, Bell, Sun, Moon, Menu, X, LogOut,
  User, LayoutDashboard, ChevronDown, Bookmark
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import clsx from "clsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/categories", label: "Categories" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate          = useNavigate();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setDropdownOpen(false);
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-sm py-3"
          : "bg-transparent py-4"
      )}
    >
      <div className="page-container flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mr-4 flex-shrink-0">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-glow-primary">
            B
          </span>
          <span className="text-xl font-bold gradient-text hidden sm:block">BlogFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center animate-scale-in">
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts…"
                className="input !py-2 !px-3 w-48 sm:w-64 text-sm"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 btn-ghost btn-sm p-2">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="btn-ghost btn-sm p-2.5 rounded-xl" title="Search">
              <Search size={18} />
            </button>
          )}

          {/* Theme toggle */}
          <button onClick={toggle} className="btn-ghost btn-sm p-2.5 rounded-xl" title="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {/* Write */}
              <Link to="/write" className="btn-md btn-primary hidden sm:flex">
                <PenSquare size={15} />
                Write
              </Link>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.username} className="avatar w-8 h-8" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  )}
                  <ChevronDown size={14} className={clsx("transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 card shadow-card-hover py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-700 mb-1">
                      <p className="font-semibold text-sm">{user.name || user.username}</p>
                      <p className="text-xs text-surface-500">@{user.username}</p>
                    </div>
                    {[
                      { to: `/profile/${user.username}`, icon: User,          label: "Profile" },
                      { to: "/dashboard",                icon: LayoutDashboard, label: "Dashboard" },
                      { to: "/bookmarks",                icon: Bookmark,       label: "Bookmarks" },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white transition-colors"
                      >
                        <Icon size={15} /> {label}
                      </Link>
                    ))}
                    <div className="border-t border-surface-100 dark:border-surface-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-md btn-secondary hidden sm:flex">Sign in</Link>
              <Link to="/register" className="btn-md btn-gradient">Get started</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden btn-ghost btn-sm p-2.5 rounded-xl"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-surface-200 dark:border-surface-700 mt-3 animate-slide-down">
          <nav className="page-container py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "px-4 py-3 rounded-xl text-sm font-medium",
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-surface-600 dark:text-surface-400"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            {user ? (
              <Link to="/write" onClick={() => setMobileOpen(false)} className="btn-md btn-gradient mt-2">
                <PenSquare size={15} /> Write
              </Link>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-md btn-secondary flex-1">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-md btn-gradient flex-1">Get started</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
