import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-lg font-bold text-primary">Buildi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              프로젝트를 빌드하고, 커리어를 빌드하다
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground transition-colors">이용약관</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">개인정보처리방침</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">고객센터</span>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 Buildi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
