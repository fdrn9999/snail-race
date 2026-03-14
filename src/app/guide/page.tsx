import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "활용 가이드 - Snail Race | 달팽이 레이싱 추첨 게임 완벽 가이드",
  description:
    "Snail Race 달팽이 레이싱 추첨 게임의 상세 사용법, 활용 시나리오, 팁을 안내합니다. 워크숍, 수업, 팀빌딩, 파티에서 효과적으로 활용하는 방법을 알아보세요.",
  openGraph: {
    title: "활용 가이드 - Snail Race",
    description:
      "달팽이 레이싱 추첨 게임의 상세 사용법과 활용 팁. 워크숍, 수업, 팀빌딩에서 효과적으로 활용하세요.",
    url: "https://www.snailrace.site/guide",
    siteName: "Snail Race",
    locale: "ko_KR",
    type: "article",
  },
  alternates: {
    canonical: "https://www.snailrace.site/guide",
  },
};

export default function GuidePage() {
  return (
    <main className="min-h-screen py-8 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-clay-muted
                     hover:text-clay-text transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Snail Race로 돌아가기
        </Link>

        <div className="space-y-5">
          {/* Title card */}
          <article className="bg-clay-card rounded-3xl p-6 sm:p-8 border-[3px] border-clay-border/15 clay-shadow-lg">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-clay-text mb-3">
              Snail Race 활용 가이드
            </h1>
            <p className="font-body text-sm text-clay-muted leading-relaxed">
              Snail Race를 다양한 상황에서 최대한 활용하는 방법을 상세히
              안내합니다. 단순 추첨을 넘어, 참여형 이벤트를 만들어 보세요.
            </p>
          </article>

          {/* Getting Started */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-mint/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                🚀
              </span>
              시작하기
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                Snail Race는 별도의 설치나 회원가입 없이 브라우저에서 바로 사용할
                수 있습니다. 아래 단계를 따라 첫 레이스를 시작해 보세요.
              </p>
              <ol className="space-y-3">
                {[
                  {
                    title: "참가자 이름 입력",
                    desc: "메인 화면의 입력란에 참가자 이름을 입력합니다. 쉼표(,), 줄바꿈(Enter), 탭(Tab) 중 아무 것으로나 구분할 수 있습니다. 예를 들어 \"철수, 영희, 민수\"처럼 입력하거나, 한 줄에 하나씩 입력해도 됩니다.",
                  },
                  {
                    title: "참가 인원 확인",
                    desc: "최소 2명, 최대 15명까지 참가할 수 있습니다. 이름은 8자 이내로 입력하세요. 8자를 초과하면 레이스 시작 시 자동으로 줄여집니다. 입력한 이름은 브라우저에 자동 저장되어 다음에 접속할 때도 유지됩니다.",
                  },
                  {
                    title: "레이스 시작",
                    desc: "\"레이스 시작!\" 버튼을 클릭하면 3초 카운트다운이 시작됩니다. 카운트다운 동안 참가자들의 달팽이가 출발선에 정렬됩니다.",
                  },
                  {
                    title: "레이스 관전",
                    desc: "레이스가 시작되면 각 달팽이가 고유한 주행 스타일로 트랙을 달립니다. 상단 바에서 실시간 순위를 확인할 수 있으며, 추월 시 하이라이트 효과와 효과음이 재생됩니다.",
                  },
                  {
                    title: "결과 확인",
                    desc: "모든 달팽이가 결승선에 도달하면 시상대에 1~3등이 표시됩니다. 4등 이하의 순위도 함께 확인할 수 있습니다. \"다시 레이스\" 버튼으로 같은 참가자로 재경기하거나, \"새 레이스\" 버튼으로 참가자를 다시 입력할 수 있습니다.",
                  },
                ].map(({ title, desc }, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="shrink-0 w-6 h-6 rounded-lg bg-clay-accent/15 text-clay-accent
                                       flex items-center justify-center font-heading font-bold text-xs
                                       border border-clay-accent/20 mt-0.5"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-clay-text">
                        {title}
                      </span>
                      <p className="text-clay-muted mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          {/* Snail Personality */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-peach/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                🐌
              </span>
              달팽이 주행 특성
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                각 달팽이는 참가자 이름에 기반한 시드 값으로 고유한 주행 특성을
                부여받습니다. 같은 이름이면 항상 같은 특성이 적용되지만, 레이스
                결과는 매번 달라집니다. 4가지 주행 유형이 있습니다:
              </p>
              <div className="grid gap-2">
                {[
                  {
                    type: "스프린터",
                    color: "bg-red-100 border-red-200",
                    desc: "초반에 빠르게 치고 나가는 타입입니다. 출발 직후 강한 가속력을 보이지만, 후반에 체력이 떨어질 수 있습니다.",
                  },
                  {
                    type: "뒷심형",
                    color: "bg-blue-100 border-blue-200",
                    desc: "초반에는 느리지만 후반에 갈수록 빨라지는 타입입니다. 역전 드라마의 주인공이 되는 경우가 많습니다.",
                  },
                  {
                    type: "스피드형",
                    color: "bg-yellow-100 border-yellow-200",
                    desc: "전반적으로 높은 기본 속도를 가진 타입입니다. 안정적이면서도 빠른 주행을 보여줍니다.",
                  },
                  {
                    type: "꾸준형",
                    color: "bg-green-100 border-green-200",
                    desc: "속도 변동이 적고 일정한 페이스를 유지하는 타입입니다. 극적이진 않지만 안정적인 성적을 기대할 수 있습니다.",
                  },
                ].map(({ type, color, desc }, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-xl border ${color}`}
                  >
                    <span className="font-semibold text-clay-text">{type}</span>
                    <p className="text-clay-muted mt-0.5 text-xs sm:text-sm">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <p>
                주행 특성은 레이스의 시각적 연출에 영향을 주며, 최종 결과의
                공정성에는 영향을 미치지 않습니다. 모든 참가자는 동일한 우승
                확률을 가집니다.
              </p>
            </div>
          </article>

          {/* Scenario: Workshop */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-blue/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                🏢
              </span>
              활용 시나리오: 워크숍 & 회의
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                워크숍이나 회의에서 발표 순서를 정하거나 역할을 배분할 때 Snail
                Race를 활용하면 딱딱한 분위기를 부드럽게 전환할 수 있습니다.
              </p>
              <div className="space-y-2">
                <div className="pl-3 border-l-2 border-clay-accent/30">
                  <p className="font-semibold text-clay-text">발표 순서 정하기</p>
                  <p>
                    참가자 전원의 이름을 입력하고 레이스를 진행합니다. 1등부터
                    순서대로 발표하거나, 반대로 마지막에 도착한 순서부터 발표하는
                    방식으로 활용할 수 있습니다. 순서를 정하는 과정 자체가 아이스
                    브레이킹 효과를 줍니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-accent/30">
                  <p className="font-semibold text-clay-text">역할 배분</p>
                  <p>
                    회의에서 서기, 타임키퍼, 진행자 등의 역할을 정할 때
                    사용합니다. 1등이 서기, 2등이 타임키퍼 등으로 미리 역할을
                    정해두고 레이스를 진행하면 자연스럽게 역할이 배분됩니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-accent/30">
                  <p className="font-semibold text-clay-text">아이디어 선정</p>
                  <p>
                    여러 아이디어나 안건 중 먼저 논의할 주제를 정할 때, 아이디어
                    이름을 참가자로 입력하여 레이스를 진행합니다. 사람 대신
                    아이디어나 항목 이름을 넣어도 됩니다.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Scenario: Education */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-yellow/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                📚
              </span>
              활용 시나리오: 교육 & 수업
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                수업이나 교육 현장에서 학생들의 참여를 이끌어내는 데 효과적입니다.
                단순히 이름을 호명하는 것보다 게임 형태로 선정하면 학생들의 관심과
                집중도가 높아집니다.
              </p>
              <div className="space-y-2">
                <div className="pl-3 border-l-2 border-clay-yellow/50">
                  <p className="font-semibold text-clay-text">
                    발표자 / 질문자 선정
                  </p>
                  <p>
                    수업 중 발표할 학생이나 질문에 답할 학생을 뽑을 때 사용합니다.
                    &quot;다음 문제는 1등이 풀어볼까요?&quot;와 같이 활용하면 학생들이
                    레이스에 자연스럽게 집중하게 됩니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-yellow/50">
                  <p className="font-semibold text-clay-text">조별 구성</p>
                  <p>
                    학생들의 이름을 입력하고 여러 번 레이스를 진행하여 조를 나눌 수
                    있습니다. 예를 들어 12명을 4개 조로 나눌 때, 첫 레이스의
                    1~3등이 1조, 4~6등이 2조 식으로 배분합니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-yellow/50">
                  <p className="font-semibold text-clay-text">보상 추첨</p>
                  <p>
                    과제를 제출한 학생들 중 상품 당첨자를 뽑거나, 우수 참여 학생에게
                    보너스 점수를 부여할 때 사용합니다. 추첨 과정을 모두 함께
                    지켜보며 공정성과 재미를 동시에 확보할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Scenario: Party */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-lilac/80 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                🎉
              </span>
              활용 시나리오: 파티 & 모임
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <p>
                생일 파티, 동아리 모임, 가족 행사 등에서 미니게임이나 추첨
                이벤트로 활용할 수 있습니다.
              </p>
              <div className="space-y-2">
                <div className="pl-3 border-l-2 border-clay-lilac/50">
                  <p className="font-semibold text-clay-text">경품 추첨</p>
                  <p>
                    파티 참석자들의 이름을 입력하고 레이스를 통해 경품 당첨자를
                    선정합니다. 여러 경품이 있다면 레이스 결과의 순위에 따라 1등
                    경품, 2등 경품 순으로 배분할 수 있습니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-lilac/50">
                  <p className="font-semibold text-clay-text">벌칙 게임</p>
                  <p>
                    마지막에 도착하는 달팽이의 주인이 벌칙을 수행하는 방식으로
                    사용합니다. &quot;꼴등은 노래 한 곡!&quot;과 같이 재미있는 벌칙을
                    정해두면 더욱 즐겁습니다.
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-clay-lilac/50">
                  <p className="font-semibold text-clay-text">메뉴 / 활동 정하기</p>
                  <p>
                    저녁 메뉴나 다음 활동을 정할 때 후보를 참가자로 입력합니다.
                    &quot;치킨&quot;, &quot;피자&quot;, &quot;초밥&quot; 등 메뉴 이름을 넣고 레이스를
                    돌려 1등 메뉴를 선택하면 선택 갈등 없이 결정할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Tips */}
          <article className="bg-clay-card rounded-2xl p-5 sm:p-6 border-[3px] border-clay-border/15 clay-shadow">
            <h2
              className="font-heading text-base sm:text-lg font-bold text-clay-text mb-3
                               flex items-center gap-2"
            >
              <span
                className="w-8 h-8 rounded-xl bg-clay-mint/60 flex items-center justify-center
                                   border-2 border-clay-border/10 text-base shrink-0"
              >
                💡
              </span>
              활용 팁
            </h2>
            <div className="font-body text-sm text-clay-muted leading-relaxed space-y-3">
              <ul className="space-y-2.5">
                {[
                  {
                    title: "프로젝터로 공유하세요",
                    desc: "워크숍이나 수업에서는 화면을 프로젝터나 대형 모니터로 공유하면 모든 참가자가 함께 관전하며 즐길 수 있습니다.",
                  },
                  {
                    title: "8명 이상이면 가로 모드",
                    desc: "참가자가 8명 이상이면 모바일에서 가로 모드를 권장하는 안내가 표시됩니다. 태블릿이나 PC에서는 자동으로 최적 레이아웃이 적용됩니다.",
                  },
                  {
                    title: "효과음으로 몰입감 UP",
                    desc: "상단 바의 스피커 아이콘을 눌러 효과음과 배경음악을 켜면 레이스가 더욱 생생해집니다. 발표장이라면 외부 스피커 연결을 추천합니다.",
                  },
                  {
                    title: "사람 이름 외에도 활용 가능",
                    desc: "참가자란에 사람 이름 대신 메뉴, 장소, 아이디어, 팀 이름 등 원하는 텍스트를 자유롭게 입력할 수 있습니다.",
                  },
                  {
                    title: "이름은 자동 저장됩니다",
                    desc: "한 번 입력한 참가자 이름은 브라우저에 자동 저장되므로, 다음에 같은 그룹으로 레이스할 때 다시 입력할 필요가 없습니다.",
                  },
                  {
                    title: "브라우저 뒤로가기 지원",
                    desc: "레이스 중 브라우저의 뒤로가기 버튼을 누르면 입력 화면으로 돌아갑니다. 실수로 레이스를 시작했을 때 유용합니다.",
                  },
                ].map(({ title, desc }, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clay-success shrink-0 mt-1.5" />
                    <div>
                      <span className="font-semibold text-clay-text">
                        {title}
                      </span>
                      <span className="text-clay-muted"> — {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* CTA */}
          <div className="text-center py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                         bg-clay-accent text-white font-heading font-bold text-sm
                         border-2 border-clay-accent/30 clay-shadow
                         hover:brightness-110 transition-all"
            >
              🐌 지금 바로 레이스 시작하기
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-[11px] text-clay-muted/60">
          <Link
            href="/"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            홈
          </Link>
          <Link
            href="/about"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            소개
          </Link>
          <Link
            href="/privacy"
            className="whitespace-nowrap hover:text-clay-muted transition-colors"
          >
            개인정보처리방침
          </Link>
        </footer>
      </div>
    </main>
  );
}
