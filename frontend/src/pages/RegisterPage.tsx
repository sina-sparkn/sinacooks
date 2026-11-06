import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { UserPlus } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: authRegister, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Register Membership | sinacooks Archive";
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await authRegister(data);
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setServerError(err.message || "Failed to create account");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 sm:px-6">
      <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-stone-200/80 shadow-[0_8px_32px_rgba(23,21,19,0.06)] space-y-7">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
            {t("header.archive")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900">
            {t("auth.registerTitle")}
          </h1>
          <p className="font-sans text-stone-500 text-xs sm:text-sm">
            {t("auth.registerDesc")}
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-mono text-xs rounded-xl">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {t("auth.displayName")}
            </label>
            <input
              type="text"
              autoComplete="name"
              {...register("displayName")}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="e.g. Chef Clara Miller"
            />
            {errors.displayName && (
              <span className="text-red-600 font-mono text-xs mt-1 block">
                {errors.displayName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {t("auth.email")}
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="you@domain.com"
            />
            {errors.email && (
              <span className="text-red-600 font-mono text-xs mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {t("auth.password")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-600 font-mono text-xs mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#171513] hover:bg-black disabled:opacity-50 text-white font-sans font-semibold rounded-full transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer inline-flex items-center justify-center gap-2"
            data-magnetic="true"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {isSubmitting ? t("auth.creatingAccount") : t("auth.registerBtn")}
            </span>
          </button>
        </form>

        <div className="text-center font-mono text-xs text-stone-500 pt-2 border-t border-stone-100">
          {t("auth.hasAccount")}{" "}
          <Link
            to={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="text-terracotta font-semibold hover:underline"
          >
            {t("auth.signInBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
