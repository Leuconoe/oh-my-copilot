# oh-my-copilot

[![Verify](https://img.shields.io/github/actions/workflow/status/Leuconoe/oh-my-copilot/verify.yml?branch=main&label=verify)](https://github.com/Leuconoe/oh-my-copilot/actions/workflows/verify.yml)
[![License](https://img.shields.io/github/license/Leuconoe/oh-my-copilot)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Leuconoe/oh-my-copilot)](https://github.com/Leuconoe/oh-my-copilot/commits/main)

- English: [README.md](README.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

- 빠른 링크: [빠른 시작](#빠른-시작), [비교](#레퍼런스-저장소와의-비교), [간단한 Copilot 테스트 사이클](#간단한-copilot-테스트-사이클), [검증](#검증)

- 문서: [Agents](docs/README.agents.md), [Skills](docs/README.skills.md), [Hooks](docs/README.hooks.md), [Plugins](docs/README.plugins.md)

`oh-my-copilot`은 세션 Highlights를 수집하고, 목적이 분명한 커스텀 에이전트와 스킬을 제공하며, 구조화된 훅 아티팩트를 `.copilot-highlights/` 아래에 기록하는 GitHub Copilot CLI 플러그인입니다.

이 플러그인의 커스텀 에이전트는 특정 모델에 고정되지 않고, 사용자가 선택한 Copilot 모델을 상속합니다. 이 저장소에서 `gpt-4.1`과 `gpt-5-mini`는 스모크 테스트 용도로만 사용합니다.

## 빠른 시작

```bash
copilot plugin install Leuconoe/oh-my-copilot
copilot plugin list
copilot -p "/skills list" --allow-all-tools
node tests/verify-hook-fixtures.cjs
node tests/verify-resource-metadata.cjs
node tests/verify-smoke-test-models-script.cjs
```

## 하는 일

- 실제 Copilot CLI 플러그인으로 설치됩니다.
- 계획, 탐색, 조사, 리뷰, 구현에 초점을 맞춘 에이전트를 추가합니다.
- 요약, 초기화, 구현 계획, 검증을 위한 스킬을 추가합니다.
- 문서화된 Copilot CLI 훅을 사용해 프롬프트, 도구, 오류, 세션 요약 아티팩트를 기록합니다.
- 세션별 요약을 `.copilot-highlights/sessions/<session-id>/highlights.md`에 생성합니다.

## 플러그인 구조

```text
.
|- plugin.json
|- hooks.json
|- agents/
|- skills/
|- scripts/
|- tests/
|- .agents/
`- .reference/
```

## 런타임 아티팩트

현재 작업 디렉터리가 Git 저장소 안에 있으면, 훅 파이프라인은 로컬 런타임 데이터를 git 루트의 `.copilot-highlights/`에 기록합니다.

각 세션 디렉터리에는 다음 파일이 포함됩니다.

- `session.json`
- `prompts.jsonl`
- `tools.jsonl`
- `errors.jsonl`
- `highlights.md`

이 파일들은 소스 제어에 커밋하기 위한 것이 아니라, 요약과 검증 워크플로를 위한 것입니다.

## 설치

저장소 URL에서 직접 설치하려면 다음 명령을 사용하세요.

```bash
copilot plugin install Leuconoe/oh-my-copilot
```

그다음 다음 명령으로 확인하세요.

```bash
copilot plugin list
copilot -p "/skills list" --allow-all-tools
```

Copilot CLI `1.0.x` 환경에서 로컬 개발 중이라면 재설치 없이 다음처럼 플러그인을 직접 로드할 수도 있습니다.

```bash
copilot --plugin-dir . -p "/skills list" --allow-all-tools
```

## 검증

로컬 변경 사항은 다음 명령으로 검증할 수 있습니다.

```bash
node tests/verify-hook-fixtures.cjs
node tests/verify-flush-highlights.cjs
node tests/verify-resource-metadata.cjs
node tests/verify-smoke-test-models-script.cjs
```

추가로 유용한 점검 명령:

```bash
node --check "scripts/lib/highlights-runtime.cjs"
node --check "scripts/flush-highlights.cjs"
node --check "scripts/smoke-test-models.cjs"
node --check "tests/verify-hook-fixtures.cjs"
node --check "tests/verify-flush-highlights.cjs"
node --check "tests/verify-resource-metadata.cjs"
node --check "tests/verify-smoke-test-models-script.cjs"
```

실제 스모크 테스트를 하려면 비대화형 Copilot 프롬프트를 실행한 뒤, 가장 최근의 `.copilot-highlights/sessions/` 디렉터리를 확인하세요.

## 레퍼런스 저장소와의 비교

이 프로젝트는 `oh-my-opencode`와 `oh-my-codex`의 아이디어를 참고했지만, GitHub Copilot CLI의 문서화된 플러그인 모델 안에서 동작해야 하므로 의도적으로 더 좁은 범위에 집중합니다.

### 공통점

- 계획, 탐색, 조사, 리뷰, 구현에 나뉜 에이전트 역할 구성.
- 계획, 초기화, 요약, 검증 중심의 워크플로우형 스킬 구성.
- 작업이 끝난 뒤 읽기 쉬운 Highlights를 만들기 위한 세션 아티팩트 수집.
- 문서 설명만이 아니라 설치와 실제 실행 증거를 중시하는 검증 중심 접근.

### oh-my-copilot에 없는 기능

- `ultrawork`, Ralph 계열 지속 실행, Codex team mode 같은 전체 오케스트레이션 런타임은 없습니다. Copilot CLI 플러그인은 그런 외부 제어 평면을 제공하지 않기 때문입니다.
- tmux 기반 워커 오케스트레이션과 인터랙티브 pane 관리는 없습니다. Copilot CLI 플러그인은 터미널 멀티플렉서 세션을 관리할 수 없기 때문입니다.
- 해시 기반 커스텀 edit primitive는 없습니다. Copilot CLI 플러그인은 내장 edit 도구를 교체할 수 없기 때문입니다.
- 네이티브 todo 강제나 백그라운드 워커 매니저는 없습니다. Copilot CLI 플러그인 확장 지점이 해당 런타임 제어를 노출하지 않기 때문입니다.
- `oh-my-opencode`의 내장 MCP 번들이나 `oh-my-codex`의 `.omx/` 상태 시스템 같은 큰 MCP/런타임 스택은 아직 포함하지 않았습니다. 현재 프로젝트는 검증된 Highlights 핵심 범위에 집중합니다.

### 현재 oh-my-copilot에만 있는 기능

- `plugin.json`, `hooks.json`, 플러그인 에이전트, 플러그인 스킬로 구성된 Copilot 네이티브 플러그인 패키지.
- `session.json`, JSONL 이벤트 파일, `highlights.md` 요약을 포함하는 `.copilot-highlights/` 기반 Highlights 아티팩트 계약.
- Copilot CLI `preToolUse`를 통한 실제 차단 이벤트 검증과 그 결과의 세션 아티팩트 기록.
- 프로젝트/사용자 커스터마이징과의 충돌을 줄이기 위한 `copilot-highlights-*` 접두사 에이전트/스킬.
- `node scripts/flush-highlights.cjs --dry-run` 및 `node scripts/flush-highlights.cjs --yes`로 로컬 Highlights 아티팩트를 정리하는 전용 flush 워크플로우.
- `node scripts/smoke-test-models.cjs`로 현재 무료 모델을 순차적으로 검증하는 스모크 테스트 유틸리티.

## 간단한 Copilot 테스트 사이클

Copilot CLI에서 테스트할 때는 아래 짧은 루프를 따르면 됩니다.

1. 파일을 수정할 때마다 플러그인을 다시 설치합니다.
2. 플러그인과 스킬이 보이는지 확인합니다.
3. 성공 흐름을 한 번 실행합니다.
4. 차단되어야 하는 명령 흐름을 한 번 실행합니다.
5. 가장 최근의 `.copilot-highlights/sessions/` 디렉터리를 확인합니다.

권장 명령:

```bash
copilot plugin install Leuconoe/oh-my-copilot
copilot plugin list
node scripts/smoke-test-models.cjs --mode plugin-dir --model gpt-4.1 --model gpt-5-mini
```

기대 결과:

- `copilot plugin list`에 `oh-my-copilot`이 표시됩니다.
- `/skills list`에 `copilot-highlights-*` 스킬이 표시됩니다.
- 스모크 테스트 스크립트는 선택한 각 모델에 대해 성공한 `node --version` 흐름과 차단된 `sudo echo hi` 흐름을 모두 검증합니다.
- 실행이 끝나면 `.copilot-highlights/active-sessions.json`은 `{}`로 돌아옵니다.

로컬 개발 중 아직 푸시되지 않은 변경 사항을 테스트하려면 빠른 확인에는 `copilot --plugin-dir .`를 우선 사용하고, 설치형 동작까지 확인해야 할 때는 저장소 루트에서 `copilot plugin install ./`로 다시 설치하세요.

중요한 제한 사항:

- 같은 `cwd`에서 여러 비대화형 Copilot 스모크 테스트를 병렬로 실행하지 마세요. 현재 문서화된 훅 페이로드에는 안정적인 세션 ID가 없어 같은 디렉터리의 병렬 실행 시 Highlights 아티팩트가 섞일 수 있습니다.

선택적 정리:

```bash
node scripts/flush-highlights.cjs --dry-run
node scripts/flush-highlights.cjs --yes
```

## 참고

- 이 프로젝트는 문서화된 GitHub Copilot CLI 확장 지점을 기준으로 작성되었습니다.
- `.reference/` 디렉터리는 내부 비교와 구현 조사 용도입니다.
- 외부 공개 문서는 이 플러그인을 다른 제품의 확장이나 대체물처럼 소개하지 말고, 자체적인 프로젝트로 설명해야 합니다.
