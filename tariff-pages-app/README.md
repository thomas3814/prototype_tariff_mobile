# 관세 조건 조회 시스템 (tariff-pages-app)

이 폴더는 실제 화면이 동작하는 **React + Vite 앱**입니다.

원본 저장소 전체 안내는 상위 [`../README.md`](../README.md)를 먼저 보세요.  
GitHub를 잘 모르는 분, ZIP 다운로드 사용자, Fork 후 Pages 공개 사용자는 상위 README와 `../docs/GITHUB_처음사용자_가이드.md`를 보는 것이 가장 쉽습니다.

---

## 이 앱의 역할

- `source-data/tariff-source.xlsx` 원본을 기준으로 데이터 관리
- `scripts/`에서 Excel → JSON 스냅샷 생성
- `public/data/tariff-snapshot.json`을 앱이 읽어서 화면 표시
- GitHub Actions가 build 후 GitHub Pages로 자동 배포

---

## v26 반영 사항

- 모바일 `제품 수출국 % 기준 수입국 비교`에서
  - 국가/bar를 감싸는 카드 높이를 한 번 더 줄여 세로 스크롤 길이를 추가 압축
  - `사우디/아랍에미리트`처럼 병합된 복수 국가 라벨의 폰트 크기를 더 줄여 긴 라벨이 bar 영역과 겹쳐 보이지 않도록 보정
- 기존 v25의 복수 국가 라벨 터치 팝오버 동작은 유지

---

## 로컬 실행

```bash
npm install
npm run dev
```

---

## 원본 Excel을 다시 반영할 때

```bash
npm run sync:data -- "./source-data/tariff-source.xlsx"
```

---

## 빌드

```bash
npm run lint
npm run build
```

---

## 주요 폴더

```text
src/                화면 코드
public/data/        배포용 JSON 스냅샷
source-data/        원본 Excel 파일
scripts/            Excel → JSON 생성 스크립트
dist/               build 결과물
```
