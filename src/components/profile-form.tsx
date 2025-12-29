"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/auth-actions";
import { Loader2, Save, User, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProfileForm({
  initialEmail,
  initialName,
}: {
  initialEmail: string;
  initialName: string | null;
}) {
  const t = useTranslations("Profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-ui-bg/20 border border-ui-border/10 p-8 rounded-2xl backdrop-blur-sm"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <User className="w-3 h-3" />
            {t("nameLabel") || "Name"}
          </label>
          <input
            name="name"
            type="text"
            defaultValue={initialName || ""}
            className="w-full bg-ui-bg border-2 border-ui-border/20 px-4 py-3 focus:border-ui-accent-primary outline-none transition-all font-bold"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Mail className="w-3 h-3" />
            {t("emailLabel") || "Email"}
          </label>
          <input
            name="email"
            type="email"
            defaultValue={initialEmail}
            className="w-full bg-ui-bg border-2 border-ui-border/20 px-4 py-3 focus:border-ui-accent-primary outline-none transition-all font-bold"
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            {t("passwordLabel") || "New Password (leave blank to keep current)"}
          </label>
          <input
            name="password"
            type="password"
            className="w-full bg-ui-bg border-2 border-ui-border/20 px-4 py-3 focus:border-ui-accent-primary outline-none transition-all font-bold"
            placeholder="••••••••"
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 text-sm font-bold ${message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ui-accent-primary text-black font-black uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            {t("saveChanges") || "Save Changes"}
          </>
        )}
      </button>
    </form>
  );
}
