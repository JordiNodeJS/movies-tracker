"use client";

import { useState } from "react";
import { Info, X, Sparkles, Filter, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function RecommendationInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Algorithm");

  const steps = [
    {
      icon: <Star className="w-4 h-4 text-neon-yellow" />,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      icon: <Sparkles className="w-4 h-4 text-neon-cyan" />,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      icon: <Filter className="w-4 h-4 text-neon-magenta" />,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
    {
      icon: <Zap className="w-4 h-4 text-neon-yellow" />,
      title: t("step4Title"),
      description: t("step4Desc"),
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-neon-cyan/30 bg-background/40 hover:border-neon-cyan hover:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all group"
      >
        <Info className="w-4 h-4 text-neon-cyan group-hover:skew-x-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/50 group-hover:text-neon-cyan">
          {t("howItWorks")}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm scanlines"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-4 w-80 z-50 bg-background border-2 border-neon-cyan p-8 shadow-[0_0_30px_rgba(0,243,255,0.2)] animate-in fade-in slide-in-from-top-4 duration-300 scanlines">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tighter uppercase italic text-neon-cyan neon-text-cyan">
                {t("title")}{" "}
                <span className="text-neon-magenta">{t("ia")}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neon-cyan/10 text-neon-cyan transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{step.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-neon-cyan">
                      {step.title}
                    </h4>
                    <p className="text-xs text-neon-cyan/40 leading-relaxed font-bold">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-neon-cyan/20">
              <p className="text-[9px] font-black text-neon-cyan/20 uppercase tracking-[0.2em] leading-relaxed">
                {t("footer")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
