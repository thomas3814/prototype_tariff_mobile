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

### 2) 내 GitHub로 복사해서 계속 쓰기
GitHub 저장소 우측 상단의 **Fork**를 누르면 내 계정으로 복사할 수 있습니다.

추천 상황
- 내 프로젝트로 계속 운영하고 싶을 때
- 내 GitHub Pages 주소로 공개하고 싶을 때
- 원본 코드를 바탕으로 커스터마이징하고 싶을 때

### 3) 바로 사이트만 사용하기
아래 주소로 접속하면 배포된 화면을 바로 볼 수 있습니다.

`https://thomas3814.github.io/prototype_tariff_mobile/`

---

## GitHub를 잘 모르는 분께 추천하는 가장 쉬운 방법

### 방법 A. 내 GitHub에서 바로 공개까지 하고 싶다면 → **Fork 추천**

1. GitHub에 로그인합니다.
2. 원본 저장소로 이동합니다.
   - `https://github.com/thomas3814/prototype_tariff_mobile`
3. 우측 상단의 **Fork** 버튼을 누릅니다.
4. **Create fork**를 누릅니다.
5. 내 계정에 복사된 저장소에서 **Settings → Pages**로 이동합니다.
6. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
7. 필요하면 **Actions** 탭에서 워크플로 실행을 허용합니다.
8. 내 저장소에서 `tariff-pages-app/source-data/tariff-source.xlsx` 파일을 교체하거나, 필요한 문구/코드를 수정합니다.
9. main 브랜치에 커밋하면 자동으로 빌드/배포됩니다.
10. 배포가 끝나면 아래 형식 주소로 접속합니다.

```text
https://내GitHub아이디.github.io/저장소이름/
```

예시

```text
https://thomas3814.github.io/prototype_tariff_mobile/
```

### 방법 B. ZIP으로 받은 뒤 내 새 저장소에 올리고 싶다면

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

## 이런 분께 특히 잘 맞습니다

- GitHub를 깊게 몰라도 공개 링크 하나를 만들고 싶은 분
- 엑셀 원본 1개만 관리하면서 웹 조회 화면을 운영하고 싶은 분
- 내 저장소로 fork해서 빠르게 사내용/대외용 페이지를 만들고 싶은 분

---

## 자주 묻는 질문

### Q1. Pages를 켰는데 README만 보입니다.
이 프로젝트는 앱 소스를 직접 보여주는 방식이 아니라 **GitHub Actions가 `tariff-pages-app/dist`를 배포**하는 구조입니다.  
따라서 **Settings → Pages → Source**를 **GitHub Actions**로 맞추는 것을 권장합니다.

### Q2. 내 저장소 이름을 바꿔도 되나요?
네. 가능합니다.  
배포 주소는 `https://내아이디.github.io/저장소이름/` 형식으로 바뀝니다.

### Q3. 공개 사이트를 다시 끄고 싶습니다.
**Settings → Pages**에서 사이트 게시를 중지하면 됩니다.

### Q4. Git을 잘 모르는데도 수정 가능한가요?
가능합니다. GitHub 웹 화면에서 파일 업로드 / 수정 / 커밋만으로도 운영할 수 있습니다.
