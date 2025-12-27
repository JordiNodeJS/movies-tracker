"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const locales = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ca", label: "Català" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    // @ts-ignore
    router.replace({ pathname, params }, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 border border-ui-accent-primary transition-all duration-300",
          "glass glass-hover",
          isOpen &&
            "border-ui-accent-secondary shadow-[0_0_15px_var(--ui-accent-secondary)]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-ui-accent-primary" />
        <span className="text-xs font-black uppercase tracking-widest">
          {locale}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-ui-accent-primary transition-transform duration-300",
            isOpen && "rotate-180 text-ui-accent-secondary"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute right-0 mt-2 w-40 py-2 border-2 border-ui-accent-primary bg-ui-bg/95 shadow-[0_0_30px_var(--ui-glow)] z-50 transition-all duration-200 origin-top-right scanlines",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="px-3 py-1 mb-1 border-b border-ui-border/20">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-accent-primary/60">
            Select Language
          </span>
        </div>
        {locales.map((loc) => (
          <button
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-200",
              "hover:bg-ui-accent-primary/10 hover:text-ui-accent-primary",
              locale === loc.code
                ? "text-ui-accent-primary font-black neon-text-cyan"
                : "font-bold opacity-70 hover:opacity-100"
            )}
          >
            <span>{loc.label}</span>
            {locale === loc.code && (
              <div className="w-2 h-2 bg-ui-accent-primary shadow-[0_0_10px_var(--ui-accent-primary)] animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
