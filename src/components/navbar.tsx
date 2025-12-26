import { Link } from "@/i18n/routing";
import { Film, Search, Bookmark, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function Navbar() {
  const t = useTranslations("Navbar");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Film className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Movies<span className="text-indigo-500">Tracker</span>
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
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button (Simplified for now) */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <Search className="w-6 h-6 text-white/60" />
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
      className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center gap-2 group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
