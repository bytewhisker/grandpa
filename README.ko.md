# Grandpa: AI 코딩 에이전트를 위한 제로-팽창 아키텍처 엔진

> *"우리 때는 숫자 두 개 더하려고 500MB짜리 node_modules를 설치하지 않았단다."*

Grandpa는 AI 코딩 에이전트(Claude Code, Cursor, Windsurf, Devin, GitHub Copilot)를 위한 검증된 제로-팽창(Zero-Bloat) 아키텍처 표준 및 코드 품질 엔진입니다.

---

## 핵심 원칙

1. **불필요한 외부 의존성 제거**: `axios`, `moment`, `lodash`, `uuid` 등을 표준 라이브러리 내장 기능으로 대체.
2. **살은 도려내되 뼈는 깎지 않는다 (Cut the fat, never cut the bone)**: 코드 길이를 줄이기 위해 예외 처리(`try/catch`), 타임아웃, 입력 검증을 임의로 삭제하지 않습니다.
3. **액티브 CLI 스캐너**: `npx grandpa scan` 명령어로 현재 프로젝트의 의존성 상태를 즉시 진단.
4. **Git Pre-commit 가드**: AI가 임의로 패키지를 추가하지 못하도록 차단.
5. **MCP 서버 지원**: Claude Desktop 및 AI 에디터와 완벽 연동.

---

## 시작하기

```bash
# 코드베이스 검사
npx @bytewhisker/grandpa scan

# 에이전트 규칙 설정 (Cursor, Windsurf, Claude 등)
npx @bytewhisker/grandpa init

# Pre-commit 가드 활성화
npx @bytewhisker/grandpa hook
```
