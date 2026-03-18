export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-lg font-bold text-indigo-600">Buildi</p>
            <p className="mt-1 text-sm text-gray-500">
              프로젝트를 빌드하고, 커리어를 빌드하다
            </p>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>고객센터</span>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; 2026 Buildi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
