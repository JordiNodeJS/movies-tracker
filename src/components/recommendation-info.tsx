"use client";

import { useState } from "react";
import { Info, X, Sparkles, Filter, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function RecommendationInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Home");

  const steps = [
    {
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      title: "Análisis de Preferencias",
      description:
        "Analizamos tus películas puntuadas con 8 o más para entender tus gustos.",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      title: "Identificación de Géneros",
      description:
        "Detectamos los géneros que más te apasionan basándonos en tu historial.",
    },
    {
      icon: <Filter className="w-4 h-4 text-emerald-500" />,
      title: "Filtrado Inteligente",
      description:
        "Eliminamos lo que ya has visto o tienes en tu lista para que siempre descubras algo nuevo.",
    },
    {
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      title: "Puntuación Personalizada",
      description:
        "Cruzamos tendencias globales con tus gustos para darte una selección única.",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <Info className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">
          ¿Cómo funciona?
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-4 w-80 z-50 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tighter uppercase">
                Algoritmo <span className="text-indigo-500">IA</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{step.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/90">
                      {step.title}
                    </h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                Nuestro motor de recomendación se actualiza cada vez que puntúas
                una película.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
