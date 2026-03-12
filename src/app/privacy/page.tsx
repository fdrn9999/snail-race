import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 - Snail Race",
  description: "Snail Race 개인정보처리방침. 수집하는 정보, 쿠키 사용, 광고 서비스에 대해 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-8 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-clay-muted
                     hover:text-clay-text transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Snail Race로 돌아가기
        </Link>

        <article className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border/15 clay-shadow-lg">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-clay-text mb-6">
            개인정보처리방침
          </h1>

          <div className="font-body text-sm text-clay-muted leading-relaxed space-y-6">

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">1. 수집하는 정보</h2>
              <p>
                Snail Race(이하 &ldquo;서비스&rdquo;)는 별도의 회원가입 절차가 없으며,
                사용자의 개인정보를 서버에 수집하거나 저장하지 않습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-clay-muted/80">
                <li>
                  <strong className="text-clay-text">참가자 이름:</strong> 사용자가 입력한 참가자 이름은
                  사용자의 브라우저(localStorage)에만 저장되며, 외부 서버로 전송되지 않습니다.
                </li>
                <li>
                  <strong className="text-clay-text">사용자 설정:</strong> 배경음악 음소거 여부 등
                  사용자 환경 설정이 브라우저 localStorage에 저장됩니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">2. 쿠키 및 광고</h2>
              <p>
                본 서비스는 Google AdSense를 통해 광고를 제공합니다.
                Google AdSense는 사용자의 관심사에 기반한 광고를 표시하기 위해 쿠키를 사용할 수 있습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-clay-muted/80">
                <li>
                  Google의 광고 쿠키 사용에 대한 자세한 내용은{" "}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay-accent underline underline-offset-2 hover:text-clay-accent/80"
                  >
                    Google 광고 정책
                  </a>
                  에서 확인할 수 있습니다.
                </li>
                <li>
                  사용자는{" "}
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay-accent underline underline-offset-2 hover:text-clay-accent/80"
                  >
                    Google 광고 설정
                  </a>
                  에서 맞춤 광고를 비활성화할 수 있습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">3. 제3자 서비스</h2>
              <p>본 서비스는 다음 제3자 서비스를 사용합니다:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-clay-muted/80">
                <li>
                  <strong className="text-clay-text">Google AdSense:</strong> 광고 제공 및 수익화
                </li>
                <li>
                  <strong className="text-clay-text">Google Fonts:</strong> 웹 폰트 제공 (Fredoka, Nunito)
                </li>
              </ul>
              <p className="mt-2">
                이러한 서비스는 각각의 개인정보처리방침에 따라 데이터를 처리합니다.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">4. 데이터 보관 및 삭제</h2>
              <p>
                모든 데이터는 사용자의 브라우저에만 저장됩니다.
                브라우저의 사이트 데이터를 삭제하면 저장된 참가자 이름 및 설정이 모두 제거됩니다.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">5. 아동 개인정보 보호</h2>
              <p>
                본 서비스는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.
                서비스 자체가 개인정보를 수집하지 않으므로 별도의 아동 보호 절차는 필요하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">6. 변경 사항</h2>
              <p>
                본 개인정보처리방침은 필요에 따라 변경될 수 있습니다.
                변경 사항은 이 페이지에 게시됩니다.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-base font-bold text-clay-text mb-2">7. 문의</h2>
              <p>
                개인정보 관련 문의는 아래 이메일로 연락해 주세요.
              </p>
              <p className="mt-1">
                <a
                  href="mailto:ckato9173@gmail.com"
                  className="text-clay-accent underline underline-offset-2 hover:text-clay-accent/80"
                >
                  ckato9173@gmail.com
                </a>
              </p>
            </section>

            <p className="text-clay-muted/50 text-xs pt-2 border-t border-clay-border/10">
              최종 수정일: 2025년 3월 12일
            </p>

          </div>
        </article>
      </div>
    </main>
  );
}
