import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// Google Icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const perks = [
  "Write and publish beautiful rich-text articles",
  "Connect with a passionate community of readers",
  "Customizable author profile and bio",
  "Built-in tags, categories & analytics",
];

const getFirebaseErrorMessage = (error) => {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-up popup was closed.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups.";
    default:
      return error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
  }
};

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
      });
      toast.success("Account created! Welcome to BlogFlow 🎉");
      navigate("/");
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Signed in with Google! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Form container */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              B
            </span>
            <span className="text-xl font-bold gradient-text">BlogFlow</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-surface-500">Sign up in seconds with Firebase Authentication</p>
          </div>

          {/* Social login: Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-medium hover:bg-surface-50 dark:hover:bg-surface-700 shadow-sm transition-all duration-200 mb-5 disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <GoogleIcon />
            )}
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-surface-200 dark:border-surface-700 w-full" />
            <span className="bg-surface-50 dark:bg-surface-900 px-3 text-xs text-surface-400 uppercase tracking-wider">
              Or register with email
            </span>
            <div className="border-t border-surface-200 dark:border-surface-700 w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={errors.name ? "input-error" : "input"}
                  {...register("name", {
                    required: "Name is required",
                    maxLength: { value: 60, message: "Max 60 chars" },
                  })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className={errors.username ? "input-error" : "input"}
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Min 3 chars" },
                    maxLength: { value: 30, message: "Max 30 chars" },
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, _ only" },
                  })}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={errors.email ? "input-error" : "input"}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className={`${errors.password ? "input-error" : "input"} pr-11`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-lg btn-gradient w-full mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-accent-600 to-primary-600 p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-6">Everything you need to write and grow</h2>
          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={13} />
                </span>
                <span className="opacity-90">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
