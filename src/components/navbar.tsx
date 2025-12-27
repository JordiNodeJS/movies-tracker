import { Link } from "@/i18n/routing";
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
    <nav className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-background/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Film className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Movies<span className="text-accent">Tracker</span>
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
                  className="text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-all flex items-center gap-2 group"
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

          <div className="flex items-center gap-2 border-l border-foreground/10 pl-6">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button (Simplified for now) */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <Search className="w-6 h-6 opacity-60" />
        </div>
      </div>
    </nav>
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
      className="text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-all flex items-center gap-2 group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
