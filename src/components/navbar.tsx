import { Link } from "@/i18n/navigation";
import { Film, Search, Bookmark, User, LogOut, LogIn } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { cookies } from "next/headers";
import { logout } from "@/lib/auth-actions";

export async function Navbar() {
  const t = await getTranslations("Navbar");
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_token");

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-2 border-ui-border bg-ui-bg/80 backdrop-blur-2xl scanlines">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="MoviesTracker Home"
          >
            <div className="w-10 h-10 bg-ui-accent-primary flex items-center justify-center group-hover:skew-x-12 transition-transform duration-500 shadow-[0_0_15px_var(--ui-accent-primary)]">
              <Film className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              Movies
              <span className="text-ui-accent-primary neon-text-cyan">
                Tracker
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink
              href="/"
              icon={<Film className="w-4 h-4" />}
              label={t("home")}
            />
            <NavLink
              href="/search"
              icon={<Search className="w-4 h-4" />}
              label={t("search")}
            />

            {isLoggedIn ? (
              <>
                <NavLink
                  href="/watchlist"
                  icon={<Bookmark className="w-4 h-4" />}
                  label={t("watchlist")}
                />
                <NavLink
                  href="/profile"
                  icon={<User className="w-4 h-4" />}
                  label={t("profile")}
                />
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm font-black uppercase tracking-[0.2em] text-ui-accent-secondary opacity-70 hover:opacity-100 transition-all flex items-center gap-2 group hover:neon-text-magenta"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      <LogOut className="w-4 h-4" />
                    </span>
                    <span>Logout</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <NavLink
                  href="/login"
                  icon={<LogIn className="w-4 h-4" />}
                  label="Login"
                />
                <NavLink
                  href="/register"
                  icon={<User className="w-4 h-4" />}
                  label="Register"
                />
              </>
            )}

            <div className="flex items-center gap-2 border-l-2 border-ui-border/30 pl-6">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button (Simplified for now) */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ui-bg/90 backdrop-blur-2xl border-t-2 border-ui-border scanlines">
        <div className="flex items-center justify-around h-20 px-4">
          <MobileNavLink
            href="/"
            icon={<Film className="w-6 h-6" />}
            label={t("home")}
          />
          <MobileNavLink
            href="/search"
            icon={<Search className="w-6 h-6" />}
            label={t("search")}
          />
          <MobileNavLink
            href="/watchlist"
            icon={<Bookmark className="w-6 h-6" />}
            label={t("watchlist")}
          />
          <MobileNavLink
            href="/profile"
            icon={<User className="w-6 h-6" />}
            label={t("profile")}
          />
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-black uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-all flex items-center gap-2 group hover:text-ui-accent-primary hover:neon-text-cyan"
    >
      <span className="group-hover:skew-x-12 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-ui-accent-primary/80 hover:text-ui-accent-primary transition-all"
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">
        {label}
      </span>
    </Link>
  );
}
