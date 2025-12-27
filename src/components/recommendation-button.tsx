"use client";

import { useState } from "react";
import { generateRecommendations } from "@/lib/recommendation-actions";
import { useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

export function RecommendationButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();
  const t = useTranslations("Profile");
  const locale = useLocale();

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await generateRecommendations(locale);
      setIsDone(true);
      router.refresh();
      setTimeout(() => setIsDone(false), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isGenerating}
      className="px-6 py-3 border-2 border-ui-accent-primary text-ui-accent-primary text-xs font-black uppercase tracking-[0.2em] hover:bg-ui-accent-primary hover:text-black hover:shadow-[0_0_20px_var(--ui-glow)] transition-all disabled:opacity-50 italic"
    >
      {isGenerating
        ? t("processing")
        : isDone
          ? t("engineUpdated")
          : t("refreshEngine")}
    </button>
  );
}
