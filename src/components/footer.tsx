import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t-2 border-ui-border bg-ui-bg/80 backdrop-blur-2xl py-12 mt-24 scanlines">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm font-medium tracking-wider uppercase text-ui-text/60">
          © {new Date().getFullYear()} Movies Tracker.
        </div>
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
          <span className="text-ui-text/60">{t("createdBy")}</span>
          <a
            href="https://webcode.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ui-accent-primary hover:neon-text-cyan transition-all duration-300"
          >
            webcode.es
          </a>
        </div>
      </div>
    </footer>
  );
}
