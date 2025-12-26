"use client";

import { useState } from "react";
import { generateRecommendations } from "@/lib/recommendations";
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
      className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
    >
      {isGenerating
        ? t("processing")
        : isDone
          ? t("engineUpdated")
          : t("refreshEngine")}
    </button>
  );
}
