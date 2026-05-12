import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import ProjectsPage from "@/app/projects/page";
import { renderWithClient } from "./utils";

describe("프로젝트 목록 페이지", () => {
  it("목록을 불러오는 동안 카드 스켈레톤을 먼저 렌더링한다", () => {
    renderWithClient(<ProjectsPage />);

    expect(
      screen.getByLabelText("프로젝트 목록 불러오는 중")
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("project-card-skeleton")).toHaveLength(6);
  });
});
