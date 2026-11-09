import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LogIn } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    document.title = t("titles.login");
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo, t]);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("auth.invalidEmail")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setServerError(err.message || t("auth.invalidCredentials"));
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
            {t("auth.signInTitle")}
          </h1>
          <p className="font-sans text-stone-500 text-xs sm:text-sm">
            {t("auth.signInDesc")}
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
              autoComplete="current-password"
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
            <LogIn className="w-4 h-4" />
            <span>
              {isSubmitting ? t("auth.signingIn") : t("auth.signInBtn")}
            </span>
          </button>
        </form>

        <div className="text-center font-mono text-xs text-stone-500 pt-2 border-t border-stone-100">
          {t("auth.noAccount")}{" "}
          <Link
            to={`/register${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="text-terracotta font-semibold hover:underline"
          >
            {t("auth.createOne")}
          </Link>
        </div>
      </div>
    </div>
  );
}
