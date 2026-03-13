# 엑셀 업로드 기능 설계 (v15)

> v15 기준 디자인 보정이 최종 완료된 버전입니다.  
> 이 저장소는 **엑셀 업로드 기능 설계 결과물**을 빠르게 가져가서 검토, 수정, 재사용할 수 있도록 정리한 공유용 저장소입니다.

## 먼저 이것부터 보세요

- **빠르게 파일만 받아보기**: GitHub 저장소 화면에서 `Code` → `Download ZIP`
- **로컬에서 바로 작업 시작하기**: `git clone`
- **내 저장소로 복사해서 개선/관리하기**: `Fork`
- **안정 버전으로 공유하기**: `v15` 태그 또는 Release 기준 사용 권장

> 이 문서의 `<OWNER>`, `<REPO>`, `<REPO_URL>`, `<INSTALL_COMMAND>` 같은 표시는 실제 저장소 정보로 교체해서 사용하세요.

## 빠른 링크 예시

아래 값은 **실제 저장소 정보로 바꿔서** 사용하세요.

```text
Repository URL
https://github.com/<OWNER>/<REPO>

Clone (HTTPS)
git clone https://github.com/<OWNER>/<REPO>.git

Source ZIP (main branch)
https://github.com/<OWNER>/<REPO>/archive/refs/heads/main.zip

Source ZIP (v15 tag)
https://github.com/<OWNER>/<REPO>/archive/refs/tags/v15.zip
```

> 기본 브랜치가 `master`라면 `main` 대신 `master`로 바꿔주세요.

## 프로젝트 소개

이 저장소는 **엑셀 업로드 기능 설계 및 관련 구현 결과**를 정리한 프로젝트입니다.  
특히 아래 목적을 중심으로 문서를 보강했습니다.

- 처음 보는 사람도 저장소 목적을 빠르게 이해할 수 있도록 정리
- `Fork / Clone / ZIP 다운로드` 중 어떤 방법이 맞는지 바로 판단 가능하도록 안내
- **v15가 현재 기준 최신 안정 버전**이라는 점을 명확히 표시
- 내려받은 뒤 어디부터 수정하면 되는지 체크포인트 제공

## 어떤 방식으로 가져가면 좋나요?

| 방식 | 추천 상황 | 특징 |
| --- | --- | --- |
| Download ZIP | 빠르게 검토하거나 내부 공유만 필요한 경우 | 가장 간단하지만 Git 이력은 포함되지 않음 |
| Clone | 로컬에서 바로 개발/테스트를 시작할 경우 | 전체 저장소 이력을 포함한 복사본 생성 |
| Fork | 내 GitHub 저장소에서 별도로 관리하거나 개선사항을 제안할 경우 | 원본과 관계를 유지한 채 내 저장소로 복사 |

## 가져오는 방법

### 1) Download ZIP으로 가져오기

1. GitHub 저장소 메인 화면으로 이동합니다.
2. 상단의 `Code` 버튼을 클릭합니다.
3. `Download ZIP`을 선택합니다.
4. 압축을 해제한 뒤 원하는 폴더명으로 변경합니다.
5. 바로 검토하거나 사내 참고 프로젝트로 활용합니다.

**이 방법이 잘 맞는 경우**

- 소스 구조만 빠르게 확인하고 싶을 때
- Git 사용 없이 내부 검토용으로 전달할 때
- 버전 이력까지는 필요 없을 때

### 2) Clone으로 가져오기

```bash
git clone https://github.com/<OWNER>/<REPO>.git
cd <REPO>
```

**이 방법이 잘 맞는 경우**

- 로컬에서 바로 실행/수정이 필요할 때
- Git 이력과 브랜치를 유지한 상태로 작업할 때
- 이후 다시 Pull 받아 최신 상태를 맞출 계획이 있을 때

### 3) Fork 후 내 저장소에서 작업하기

1. GitHub 저장소 우측 상단의 `Fork` 버튼을 클릭합니다.
2. 내 계정 또는 내 조직으로 포크를 생성합니다.
3. 생성된 내 포크 저장소를 clone 합니다.

```bash
git clone https://github.com/<YOUR_GITHUB_ID>/<REPO>.git
cd <REPO>
git remote add upstream https://github.com/<OWNER>/<REPO>.git
git remote -v
```

브랜치를 분리해서 작업하는 것을 권장합니다.

```bash
git checkout -b feat/my-change
```

**이 방법이 잘 맞는 경우**

- 내 저장소에서 별도로 운영하고 싶을 때
- 원본 프로젝트로 Pull Request를 보낼 가능성이 있을 때
- 원본 업데이트를 `upstream`으로 주기적으로 반영하고 싶을 때

## v15 안정 버전 사용 권장

현재 기준 디자인 보정이 최종 완료된 버전은 **`v15`** 입니다.  
외부에 공유할 때는 `main` 브랜치 링크만 전달하기보다 아래 방식 중 하나를 권장합니다.

- `v15` 태그를 만들어 고정 버전으로 안내
- `v15` Release를 발행하여 설명과 함께 배포
- `v15` 기준 ZIP 링크를 별도로 제공

예시:

```text
https://github.com/<OWNER>/<REPO>/archive/refs/tags/v15.zip
```

## 실행 방법

이 저장소를 처음 받은 사람이 가장 덜 헤매려면 아래 항목을 실제 프로젝트 기준으로 정리해두는 것이 좋습니다.

- 의존성 설치 명령
- 로컬 실행 명령
- 빌드 명령
- 환경 변수 파일 위치
- 샘플 데이터 또는 테스트 파일 위치

아래 예시는 **형식 예시**입니다. 실제 프로젝트 기준으로 바꿔주세요.

```bash
# 예시
<INSTALL_COMMAND>
<RUN_COMMAND>
<BUILD_COMMAND>
```

예를 들어:

```bash
# 예시 1
npm install
npm run dev
npm run build
```

```bash
# 예시 2
./gradlew build
./gradlew bootRun
```

> 실제 저장소에 맞는 명령만 남기고 나머지는 삭제하세요.

## 처음 받은 사람이 가장 궁금해하는 것

아래 항목을 README 또는 `docs/GETTING_STARTED.md`에 꼭 적어두는 것을 권장합니다.

- 어떤 파일부터 보면 되는가
- 샘플 엑셀 파일 또는 템플릿이 있는가
- 업로드 흐름을 어디에서 확인할 수 있는가
- 바로 수정해야 하는 환경값은 무엇인가
- 배포 또는 사내 적용 시 어떤 부분을 바꿔야 하는가

## 커스터마이징 체크리스트

- 저장소 이름과 설명 문구 정리
- 회사/조직 브랜딩 요소 반영
- 업로드 허용 확장자, 용량, 유효성 규칙 정리
- 샘플 엑셀 또는 템플릿 파일 제공 여부 확인
- 환경 변수(`.env`, 설정 파일, API 주소 등) 정리
- 스크린샷 2~3장 추가
- `v15` 태그/Release 발행
- `LICENSE` 파일 추가 여부 확인

## 화면 미리보기

> 이 섹션에 대표 화면 2~3장을 넣어두면, 방문자가 저장소를 열었을 때 이해 속도가 크게 빨라집니다.

예시:

- 업로드 시작 화면
- 업로드 전 검증/안내 화면
- 업로드 완료 또는 결과 확인 화면

## 문서 구성

- `README.md` : 저장소 첫 진입용 안내
- `docs/GETTING_STARTED.md` : fork / clone / ZIP 다운로드 상세 가이드
- `CONTRIBUTING.md` : 기여 및 브랜치/PR 작성 가이드
- `CHANGELOG.md` : 버전 변경 이력
- `docs/RELEASE_NOTE_v15.md` : GitHub Release 작성용 초안
- `docs/PUBLISH_CHECKLIST.md` : 공개 전 점검 체크리스트

## 변경 이력

- `v15` (2026-03-13): 디자인 보정 최종 완료, 공유/배포용 문서 보강

자세한 내용은 [`CHANGELOG.md`](./CHANGELOG.md)를 참고하세요.

## 기여 방법

문서 수정, 가이드 보완, 구조 정리, 기능 개선 제안은 언제든 환영합니다.  
기여 전에는 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 먼저 확인해주세요.

## 라이선스

공개 배포 전에는 반드시 `LICENSE` 파일을 확정해 주세요.  
오픈소스로 배포한다면 MIT, Apache-2.0 등 팀 정책에 맞는 라이선스를 선택하는 것을 권장합니다.
