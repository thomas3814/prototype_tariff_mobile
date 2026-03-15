# prototype_tariff_mobile

관세 조건 조회용 GitHub Pages 프로젝트입니다.  
엑셀 원본 1개를 JSON 스냅샷으로 변환해 웹에서 바로 조회할 수 있도록 구성되어 있습니다.

## 바로가기

- 원본 저장소: `https://github.com/thomas3814/prototype_tariff_mobile`
- 실행 사이트: `https://thomas3814.github.io/prototype_tariff_mobile/`
- 앱 소스 폴더: `tariff-pages-app/`
- 엑셀 원본 파일: `tariff-pages-app/source-data/tariff-source.xlsx`

---

## 이 저장소에서 할 수 있는 일

### 1) 바로 코드만 받아보기
GitHub 저장소 상단의 **Code → Download ZIP**을 누르면 압축 파일로 받을 수 있습니다.

추천 상황
- 소스 구조만 빠르게 보고 싶을 때
- Git을 잘 모를 때
- 내부 검토용으로만 잠깐 써볼 때


## GitHub를 잘 모르는 분께 추천하는 가장 쉬운 방법

### ZIP으로 받은 뒤 내 새 저장소에 올리기

1. 원본 저장소에서 **Code → Download ZIP**을 누릅니다.
2. 압축을 풉니다.
3. GitHub에서 **New repository**를 만듭니다.
4. 새 저장소에 들어가 **Add file → Upload files**를 누릅니다.
5. 압축을 푼 파일을 전부 업로드합니다.
6. 업로드가 끝나면 **Commit changes**를 누릅니다.
7. **Settings → Pages**에서 **Source = GitHub Actions**로 선택합니다.
8. 배포가 끝나면 아래 형식 주소로 접속합니다.

```text
https://내GitHub아이디.github.io/새저장소이름/
```

> 이 프로젝트는 Vite base 경로를 저장소 이름에 맞춰 자동 계산하도록 구성되어 있어, 일반적인 fork/복사 배포에서는 별도 base 수정 없이 그대로 사용할 수 있습니다.

---

## 처음 수정할 때 가장 중요한 파일 3개

### 1. 데이터 원본
```text
tariff-pages-app/source-data/tariff-source.xlsx
```

이 파일을 바꾸면 GitHub Actions가 JSON을 다시 생성하고 Pages를 다시 배포합니다.

### 2. 화면 코드
```text
tariff-pages-app/src/
```

화면 구성, 모바일/PC 레이아웃, bar 그래프, 접기/펼치기 UI를 수정하는 위치입니다.

### 3. Pages 배포 설정
```text
.github/workflows/prototype_tariff_mobile-root-github-upload-deploy.yml
```

GitHub Actions에서 빌드 후 GitHub Pages로 배포하는 워크플로입니다.

---

* 엑셀 교체만 하는 운영방식이므로 Fork 방식은 오히려 운영이 복잡해집니다.

## 저장소 구조

```text
prototype_tariff_mobile/
├─ .github/
│  └─ workflows/
│     └─ prototype_tariff_mobile-root-github-upload-deploy.yml
├─ tariff-pages-app/
│  ├─ src/                # React / Vite 화면 코드
│  ├─ public/data/        # 빌드 시 사용되는 JSON 데이터
│  ├─ source-data/        # 원본 Excel 보관 위치
│  ├─ scripts/            # Excel → JSON 생성 스크립트
│  ├─ dist/               # 빌드 결과물
│  └─ README.md           # 앱 개발용 설명
├─ docs/
│  └─ GITHUB_처음사용자_가이드.md
├─ CHANGELOG.md
└─ CONTRIBUTING.md
```

---

## 로컬 실행 방법

```bash
cd tariff-pages-app
npm install
npm run dev
```

원본 Excel을 기준으로 JSON을 다시 만들고 싶으면:

```bash
npm run sync:data -- "./source-data/tariff-source.xlsx"
```

배포용 빌드:

```bash
npm run lint
npm run build
```

---


