export interface CoverLetterDraft {
  title: string;
  content: string;
}

export const DEFAULT_COVER_LETTER_DRAFT: CoverLetterDraft = {
  title: "자기소개서",
  content: "",
};

export function normalizeCoverLetterDraft(draft?: Partial<CoverLetterDraft> | null): CoverLetterDraft {
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  const content = typeof draft?.content === "string" ? draft.content.trim() : "";

  return {
    title: title || DEFAULT_COVER_LETTER_DRAFT.title,
    content,
  };
}

export function hasCoverLetterContent(draft: Partial<CoverLetterDraft>): boolean {
  return typeof draft.content === "string" && draft.content.trim().length > 0;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function coverLetterToHtml(draft: Partial<CoverLetterDraft>): string {
  const normalizedDraft = normalizeCoverLetterDraft(draft);

  if (!hasCoverLetterContent(normalizedDraft)) {
    return "";
  }

  const paragraphs = normalizedDraft.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => paragraph.split(/\n/).map(escapeHtml).join("<br />"))
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  return `
  <p class="section-title">${escapeHtml(normalizedDraft.title)}</p>
  <div class="cover-letter">${paragraphs}</div>`;
}
