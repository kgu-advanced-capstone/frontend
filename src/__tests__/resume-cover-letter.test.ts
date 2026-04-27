import { describe, expect, it } from "vitest";
import {
  DEFAULT_COVER_LETTER_DRAFT,
  coverLetterToHtml,
  hasCoverLetterContent,
  normalizeCoverLetterDraft,
} from "@/app/resume/cover-letter";

describe("자기소개서 로컬 초안", () => {
  it("제목과 본문을 정리하고 기본 제목을 보존한다", () => {
    expect(
      normalizeCoverLetterDraft({
        title: "  ",
        content: "  첫 문단입니다.\n\n둘째 문단입니다.  ",
      })
    ).toEqual({
      title: DEFAULT_COVER_LETTER_DRAFT.title,
      content: "첫 문단입니다.\n\n둘째 문단입니다.",
    });
  });

  it("본문이 비어 있으면 자기소개서 내용이 없다고 판단한다", () => {
    expect(hasCoverLetterContent({ title: "지원동기", content: "   \n\t " })).toBe(false);
    expect(hasCoverLetterContent({ title: "지원동기", content: "프로젝트 경험을 연결했습니다." })).toBe(true);
  });

  it("PDF HTML에서 문단과 줄바꿈을 보존하고 HTML을 이스케이프한다", () => {
    const html = coverLetterToHtml({
      title: "지원동기 <script>",
      content: "React와 Spring 경험을 연결했습니다.\n사용자 문제를 <해결>했습니다.",
    });

    expect(html).toContain("지원동기 &lt;script&gt;");
    expect(html).toContain("React와 Spring 경험을 연결했습니다.<br />사용자 문제를 &lt;해결&gt;했습니다.");
    expect(html).not.toContain("<script>");
  });
});
