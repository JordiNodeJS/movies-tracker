"use client";

import { useState } from "react";
import { Info, X, Sparkles, Filter, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function RecommendationInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Algorithm");

  const steps = [
    {
      icon: <Star className="w-4 h-4 text-ui-accent-tertiary" />,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      icon: <Sparkles className="w-4 h-4 text-ui-accent-primary" />,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      icon: <Filter className="w-4 h-4 text-ui-accent-secondary" />,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
    {
      icon: <Zap className="w-4 h-4 text-ui-accent-tertiary" />,
      title: t("step4Title"),
      description: t("step4Desc"),
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-ui-border/30 bg-ui-bg/40 hover:border-ui-accent-primary hover:shadow-[0_0_10px_var(--ui-glow)] transition-all group"
        aria-label={t("howItWorks")}
      >
        <Info className="w-4 h-4 text-ui-accent-primary group-hover:skew-x-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest text-ui-accent-primary/70 group-hover:text-ui-accent-primary">
          {t("howItWorks")}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ui-bg/80 backdrop-blur-sm scanlines"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-4 w-80 z-50 bg-ui-bg border-2 border-ui-accent-primary p-8 shadow-[0_0_30px_var(--ui-glow)] animate-in fade-in slide-in-from-top-4 duration-300 scanlines">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tighter uppercase italic text-ui-accent-primary neon-text-cyan">
                {t("title")}{" "}
                <span className="text-ui-accent-secondary">{t("ia")}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-ui-accent-primary/10 text-ui-accent-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{step.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-ui-accent-primary">
                      {step.title}
                    </h4>
                    <p className="text-xs text-ui-accent-primary/80 leading-relaxed font-bold">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-ui-border/20">
              <p className="text-[9px] font-black text-ui-accent-primary/60 uppercase tracking-[0.2em] leading-relaxed">
                {t("footer")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
