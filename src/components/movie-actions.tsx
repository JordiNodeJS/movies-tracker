"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Star,
  MessageSquare,
  X,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  toggleWatchlist,
  saveNote,
  saveRating,
  deleteNote,
} from "@/lib/actions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MovieActions({
  movieId,
  title,
  posterPath,
  initialData,
}: {
  movieId: number;
  title: string;
  posterPath: string;
  initialData: {
    isInWatchlist: boolean;
    note: string;
    rating: number;
  };
}) {
  const [data, setData] = useState(initialData);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState(initialData.note);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("Movie");

  useEffect(() => {
    setData(initialData);
    setNoteContent(initialData.note);
  }, [initialData]);

  const handleToggleWatchlist = async () => {
    await toggleWatchlist(movieId, title, posterPath);
    setData((prev) => ({ ...prev, isInWatchlist: !prev.isInWatchlist }));
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    await saveNote(movieId, noteContent, title, posterPath);
    setIsSaving(false);
    setData((prev) => ({ ...prev, note: noteContent }));
    setIsNoteOpen(false);
  };

  const handleDeleteNote = async () => {
    if (!confirm("Are you sure you want to delete your note?")) return;
    setIsSaving(true);
    await deleteNote(movieId);
    setNoteContent("");
    setData((prev) => ({ ...prev, note: "" }));
    setIsSaving(false);
    setIsNoteOpen(false);
  };

  const handleSaveRating = async (val: number) => {
    await saveRating(movieId, val, title, posterPath);
    setData((prev) => ({ ...prev, rating: val }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <button
          onClick={handleToggleWatchlist}
          className={cn(
            "flex items-center justify-center gap-4 py-6 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 group border-2",
            data.isInWatchlist
              ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.5)]"
              : "bg-background/40 text-neon-cyan border-neon-cyan/30 opacity-70 hover:opacity-100 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
          )}
        >
          <Bookmark
            className={cn(
              "w-4 h-4 transition-transform duration-500 group-hover:skew-x-12",
              data.isInWatchlist && "fill-current"
            )}
          />
          {data.isInWatchlist ? t("watchlistRemove") : t("watchlistAdd")}
        </button>

        <button
          onClick={() => setIsNoteOpen(true)}
          className={cn(
            "w-20 h-20 flex items-center justify-center border-2 transition-all duration-500 group",
            data.note
              ? "bg-neon-magenta text-black border-neon-magenta shadow-[0_0_20px_rgba(255,0,255,0.5)]"
              : "bg-background/40 text-neon-magenta border-neon-magenta/30 opacity-70 hover:opacity-100 hover:border-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]"
          )}
        >
          <MessageSquare className="w-5 h-5 group-hover:skew-y-12 transition-transform" />
        </button>
      </div>

      <div className="p-8 border-2 border-neon-yellow/30 bg-background/40 space-y-6 scanlines">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-neon-yellow uppercase tracking-[0.3em]">
            {t("yourRating")}
          </span>
          <span className="text-2xl font-black text-neon-yellow neon-text-yellow italic">
            {data.rating > 0 ? `${data.rating}/10` : "--"}
          </span>
        </div>
        <div className="flex justify-between gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <button
              key={val}
              onClick={() => handleSaveRating(val)}
              className={cn(
                "w-full aspect-square text-[10px] font-black transition-all border",
                data.rating >= val
                  ? "bg-neon-yellow text-black border-neon-yellow shadow-[0_0_10px_rgba(253,238,0,0.5)]"
                  : "bg-background/20 text-neon-yellow/40 border-neon-yellow/20 hover:opacity-100 hover:border-neon-yellow/50"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {isNoteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl scanlines"
            onClick={() => setIsNoteOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-background border-2 border-neon-magenta shadow-[0_0_50px_rgba(255,0,255,0.3)] overflow-hidden">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic text-neon-magenta neon-text-magenta">
                    {t("personalJournal")}
                  </h3>
                  <p className="text-[10px] font-black text-neon-magenta/40 uppercase tracking-widest">
                    {title}
                  </p>
                </div>
                <button
                  onClick={() => setIsNoteOpen(false)}
                  className="w-12 h-12 bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta flex items-center justify-center hover:bg-neon-magenta hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t("journalPlaceholder")}
                className="w-full h-64 bg-background/50 border-2 border-neon-magenta/20 p-8 text-xl font-black text-neon-magenta focus:outline-none focus:border-neon-magenta transition-all resize-none placeholder:text-neon-magenta/10 font-mono"
              />

              <div className="flex items-center justify-between gap-4">
                {(data.note && (
                  <button
                    onClick={handleDeleteNote}
                    disabled={isSaving}
                    className="h-16 px-8 border-2 border-red-500 text-red-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-red-500 hover:text-black transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("deleteNote")}
                  </button>
                )) || <div />}
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="h-16 px-10 bg-neon-magenta text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:shadow-[0_0_20px_rgba(255,0,255,0.5)] transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t("saveJournal")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
