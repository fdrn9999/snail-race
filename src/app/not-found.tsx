import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="text-6xl">🐌</div>

        <article className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border/15 clay-shadow-lg">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-clay-text mb-3">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="font-body text-sm text-clay-muted leading-relaxed mb-6">
            요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
            아래 링크를 통해 Snail Race를 이용해 보세요.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-5 py-3 rounded-2xl
                         bg-clay-accent text-white font-heading font-bold text-sm
                         border-2 border-clay-accent/30 clay-shadow
                         hover:brightness-110 transition-all"
            >
              🐌 레이스 시작하기
            </Link>

            <div className="flex justify-center gap-4 font-body text-sm">
              <Link
                href="/guide"
                className="text-clay-muted hover:text-clay-text transition-colors"
              >
                활용 가이드
              </Link>
              <Link
                href="/about"
                className="text-clay-muted hover:text-clay-text transition-colors"
              >
                소개
              </Link>
            </div>
          </div>
        </article>

        <p className="font-body text-xs text-clay-muted/50">
          Snail Race는 워크숍, 수업, 파티에서 사용할 수 있는 무료 온라인 추첨
          게임입니다. 달팽이 레이싱으로 재미있게 추첨하세요!
        </p>
      </div>
    </main>
  );
}
