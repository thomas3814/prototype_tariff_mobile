# 빠르게 시작하기

이 문서는 **처음 저장소를 받아가는 사람**을 위한 가이드입니다.  
목적에 따라 `ZIP 다운로드`, `Clone`, `Fork` 중 가장 편한 방식을 선택하세요.

## 어떤 방식이 맞나요?

| 목적 | 추천 방식 |
| --- | --- |
| 일단 받아서 열어보기 | Download ZIP |
| 로컬 개발을 바로 시작하기 | Clone |
| 내 저장소에서 관리하며 수정하기 | Fork |

---

## A. ZIP 다운로드로 바로 받아보기

### 방법

1. GitHub 저장소 메인 화면으로 이동합니다.
2. `Code` 버튼을 클릭합니다.
3. `Download ZIP`을 선택합니다.
4. 압축을 해제합니다.
5. 로컬 폴더에서 프로젝트를 확인합니다.

### 이런 경우에 추천합니다

- Git에 익숙하지 않아도 빠르게 확인하고 싶을 때
- 사내 공유용 샘플이 필요할 때
- 버전 이력보다 현재 소스가 더 중요할 때

### 주의할 점

- ZIP 다운로드는 **저장소 스냅샷**입니다.
- Git 이력과 브랜치 정보는 포함되지 않습니다.
- 이후 버전 관리를 직접 하려면 새 Git 저장소를 초기화해야 합니다.

필요하면 아래처럼 새 저장소를 시작할 수 있습니다.

```bash
cd <UNZIPPED_PROJECT_FOLDER>
git init
git add .
git commit -m "init from v15 snapshot"
```

---

## B. Clone으로 로컬 개발 시작하기

### 방법

```bash
git clone https://github.com/<OWNER>/<REPO>.git
cd <REPO>
```

### 이런 경우에 추천합니다

- 로컬에서 수정과 테스트를 바로 시작해야 할 때
- 전체 저장소 이력과 브랜치를 함께 받아야 할 때
- 나중에 최신 변경사항을 다시 받아올 계획이 있을 때

### 다음으로 확인할 것

- `README.md`의 실행 방법
- 환경 변수 파일 위치
- 샘플 데이터 또는 예제 파일 위치
- 실행 명령 (`<RUN_COMMAND>`)

---

## C. Fork 후 내 저장소에서 관리하기

### 방법

1. 원본 저장소 화면에서 `Fork`를 클릭합니다.
2. 내 GitHub 계정 또는 조직으로 포크를 생성합니다.
3. 내 포크 저장소를 clone 합니다.

```bash
git clone https://github.com/<YOUR_GITHUB_ID>/<REPO>.git
cd <REPO>
```

원본 저장소 변경사항을 추적하려면 `upstream`을 추가합니다.

```bash
git remote add upstream https://github.com/<OWNER>/<REPO>.git
git remote -v
```

작업 브랜치를 분리합니다.

```bash
git checkout -b feat/my-change
```

### 이런 경우에 추천합니다

- 내 저장소에서 독립적으로 운영하고 싶을 때
- 원본 저장소에 개선사항을 제안할 가능성이 있을 때
- 원본 버전과 내 변경 버전을 모두 관리하고 싶을 때

### upstream 동기화 예시

기본 브랜치가 `main`이라고 가정한 예시입니다.

```bash
git fetch upstream
git checkout main
git pull upstream main
```

> 기본 브랜치가 `master`라면 `main` 대신 `master`를 사용하세요.

---

## v15 기준으로 받는 방법

현재 기준 최종 디자인 보정 버전은 **`v15`** 입니다.  
가능하면 아래 두 방법 중 하나로 받아가는 것을 권장합니다.

### 방법 1. v15 태그 ZIP 다운로드

```text
https://github.com/<OWNER>/<REPO>/archive/refs/tags/v15.zip
```

### 방법 2. clone 후 v15 태그 체크아웃

```bash
git clone https://github.com/<OWNER>/<REPO>.git
cd <REPO>
git checkout tags/v15 -b review/v15
```

---

## 처음 받은 뒤 체크할 것

- `README.md` 먼저 읽기
- 실행 명령 확인
- 환경 변수 파일 위치 확인
- 샘플 엑셀 또는 템플릿 파일 위치 확인
- 업로드 흐름이 보이는 대표 화면 확인
- 커스터마이징해야 하는 문구/스타일/브랜딩 위치 확인

---

## 자주 헷갈리는 점

### Q1. ZIP 다운로드와 Clone의 차이는 무엇인가요?

- ZIP 다운로드: 현재 시점의 파일만 받는 방식
- Clone: 저장소 이력과 브랜치까지 포함해 복사하는 방식

### Q2. Fork와 Clone은 무엇이 다른가요?

- Clone: 로컬 컴퓨터에 복사
- Fork: GitHub 내 내 계정으로 저장소를 복사

### Q3. 외부 공유용으로는 어떤 방식이 가장 좋나요?

- 가장 쉬운 것은 `Code → Download ZIP`
- 가장 안정적인 버전 공유는 `v15` 태그 또는 Release

---

## 저장소 운영자에게 권장하는 추가 작업

공유 전에 아래 항목을 점검하면 사용자가 훨씬 편하게 받아갈 수 있습니다.

- 저장소 설명(Description) 정리
- 대표 스크린샷 추가
- `v15` 태그 생성
- GitHub Release 발행
- `LICENSE` 파일 추가
- 예제 실행 명령 정리
- 샘플 엑셀 파일 제공 여부 확인
