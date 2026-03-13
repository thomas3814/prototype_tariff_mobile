# Contributing Guide

문서 보완, 가이드 개선, 코드 정리, 화면/디자인 수정 제안 모두 환영합니다.  
이 문서는 협업 시 최소한의 기준을 맞추기 위한 안내입니다.

## 기본 원칙

- 변경 내용은 가능한 한 **작은 단위**로 나눠서 작업합니다.
- 사용자에게 보이는 변경(UI/문구/동선)은 설명을 함께 남깁니다.
- 문서와 실제 동작이 달라지지 않도록 README/가이드도 함께 수정합니다.
- 비밀값, 토큰, 내부 주소 등 민감 정보는 절대 커밋하지 않습니다.

## 브랜치 이름 권장 규칙

아래 형식 중 하나를 권장합니다.

```text
feat/<short-topic>
fix/<short-topic>
docs/<short-topic>
chore/<short-topic>
refactor/<short-topic>
```

예시:

```text
feat/upload-step-layout-fix
fix/button-spacing
docs/fork-and-zip-guide
```

## 커밋 메시지 예시

```text
feat: improve upload entry layout
fix: correct spacing in v15 upload card
docs: add fork and download guide
chore: organize project docs
```

## Pull Request 작성 전 체크리스트

- [ ] 변경 목적이 제목과 본문에 명확히 적혀 있는가
- [ ] UI 변경이면 스크린샷 또는 전/후 비교가 포함되어 있는가
- [ ] README 또는 관련 문서가 함께 업데이트되었는가
- [ ] 실행 방법이 바뀌었다면 가이드도 수정했는가
- [ ] 민감 정보가 포함되지 않았는가
- [ ] 버전 노출이 필요한 변경이면 `CHANGELOG.md` 반영이 되었는가

## 디자인/화면 수정 시 권장 사항

사용자에게 보이는 변경이 있다면 아래 내용을 함께 정리해 주세요.

- 무엇이 달라졌는가
- 왜 바꿨는가
- 어떤 화면에서 확인 가능한가
- 기존 사용자 영향은 무엇인가

예시:

```text
- 업로드 카드 간격 조정
- 버튼 정렬 기준 통일
- 경고 문구 가독성 개선
```

## 문서 수정 기준

아래 경우에는 문서도 같이 수정하는 것을 권장합니다.

- 저장소 진입 흐름이 바뀐 경우
- 실행 방법이 바뀐 경우
- 버전 안내 방식이 바뀐 경우
- 외부 사용자가 헷갈릴 수 있는 UI가 바뀐 경우

## 이슈 작성 팁

이슈를 남길 때는 아래 형식을 권장합니다.

```text
[배경]
왜 이 변경이 필요한가

[문제]
현재 어떤 점이 불편한가

[제안]
어떻게 바꾸고 싶은가

[참고]
스크린샷, 링크, 재현 방법
```

## 버전 안내

외부에 공유되는 수준의 변경이라면 `CHANGELOG.md`에 기록해 주세요.  
현재 기준 안정 버전은 `v15`입니다.
