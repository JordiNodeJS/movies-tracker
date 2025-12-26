"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const handleLocaleChange = (newLocale: string) => {
    // @ts-ignore
    router.replace({ pathname, params }, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
      <Globe className="w-4 h-4 text-white/40" />
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-1"
      >
        <option value="en" className="bg-black">
          EN
        </option>
        <option value="es" className="bg-black">
          ES
        </option>
        <option value="ca" className="bg-black">
          CA
        </option>
      </select>
    </div>
  );
}
