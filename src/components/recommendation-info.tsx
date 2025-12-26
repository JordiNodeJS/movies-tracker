"use client";

import { useState } from "react";
import { Info, X, Sparkles, Filter, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function RecommendationInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Algorithm");

  const steps = [
    {
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      icon: <Filter className="w-4 h-4 text-emerald-500" />,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
    {
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      title: t("step4Title"),
      description: t("step4Desc"),
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all group"
      >
        <Info className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">
          {t("howItWorks")}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-4 w-80 z-50 bg-background border border-foreground/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tighter uppercase">
                {t("title")} <span className="text-indigo-500">{t("ia")}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{step.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-90">
                      {step.title}
                    </h4>
                    <p className="text-xs opacity-40 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-foreground/5">
              <p className="text-[9px] font-medium opacity-20 uppercase tracking-[0.2em] leading-relaxed">
                {t("footer")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
