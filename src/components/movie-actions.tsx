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
            "flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 group",
            data.isInWatchlist
              ? "bg-indigo-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-transparent"
              : "bg-foreground/5 opacity-40 hover:opacity-100 hover:bg-foreground/10 border border-foreground/10"
          )}
        >
          <Bookmark
            className={cn(
              "w-4 h-4 transition-transform duration-500 group-hover:scale-110",
              data.isInWatchlist && "fill-current"
            )}
          />
          {data.isInWatchlist ? t("watchlistRemove") : t("watchlistAdd")}
        </button>

        <button
          onClick={() => setIsNoteOpen(true)}
          className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 group",
            data.note
              ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
              : "bg-foreground/5 opacity-40 hover:opacity-100 hover:bg-foreground/10 border border-foreground/10"
          )}
        >
          <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">
            {t("yourRating")}
          </span>
          <span className="text-2xl font-black text-indigo-500">
            {data.rating > 0 ? `${data.rating}/10` : "--"}
          </span>
        </div>
        <div className="flex justify-between gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <button
              key={val}
              onClick={() => handleSaveRating(val)}
              className={cn(
                "w-full aspect-square rounded-lg text-[10px] font-black transition-all",
                data.rating >= val
                  ? "bg-indigo-600 text-white"
                  : "bg-foreground/5 opacity-20 hover:opacity-40 hover:bg-foreground/10"
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
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={() => setIsNoteOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-background border border-foreground/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic">
                    {t("personalJournal")}
                  </h3>
                  <p className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                    {title}
                  </p>
                </div>
                <button
                  onClick={() => setIsNoteOpen(false)}
                  className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t("journalPlaceholder")}
                className="w-full h-64 bg-foreground/5 border border-foreground/10 rounded-3xl p-8 text-xl font-medium focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:opacity-5"
              />

              <div className="flex items-center justify-between gap-4">
                {(data.note && (
                  <button
                    onClick={handleDeleteNote}
                    disabled={isSaving}
                    className="h-16 px-8 rounded-full bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("deleteNote")}
                  </button>
                )) || <div />}
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="h-16 px-10 rounded-full bg-foreground text-background font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50"
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
