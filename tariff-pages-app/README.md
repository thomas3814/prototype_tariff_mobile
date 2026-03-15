# 관세 조건 조회 시스템

고정된 관세조건표 Excel 1개를 JSON 스냅샷으로 정규화해 GitHub Pages에서 조회하는 프로젝트입니다.

## 운영 방식

1. 저장소 안의 `source-data/tariff-source.xlsx` 파일 1개를 유지합니다.
2. GitHub.com 또는 Codespaces에서 같은 경로의 Excel 파일을 새 버전으로 교체하고 Commit 합니다.
3. GitHub Actions가 Excel을 JSON으로 다시 생성한 뒤 Pages를 재배포합니다.
4. 모든 방문자는 배포된 최신 JSON 스냅샷을 조회합니다.

## v17 반영 사항

- 화면 최하단 중앙의 `모바일 모드 / PC모드` 전환은 유지됩니다.
- 모바일 모드에서 `수입국 기준 수출국 비교`와 `수출국 기준 수입국 비교` 모두 국가 10개 목록형으로 표시됩니다.
- 모바일 목록은 `국가명 / bar / %`만 먼저 보이고, 국가를 터치하면 상세 정보가 펼쳐집니다.
- 상세 정보에서만 `원산지 기준`, `HS 코드`, `협정관세 / 기본관세 / 적용관세`가 노출됩니다.
- PC 모드의 기존 그래프 구조는 유지됩니다.

## 로컬 실행

```bash
npm install
npm run sync:data -- "./source-data/tariff-source.xlsx"
npm run dev
```

## 빌드

```bash
npm run lint
npm run build
```
