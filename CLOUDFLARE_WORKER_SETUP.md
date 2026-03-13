# Cloudflare Worker 공용 반영 설정 가이드

이 버전은 `Supabase` 대신 아래 구조를 사용합니다.

- 공개 조회 프론트: GitHub Pages
- 관리자 로그인/업로드 API: Cloudflare Worker
- 최신 JSON 저장소: Cloudflare R2
- 로그인 방식: 단일 관리자 ID / PW

## 1. 프론트엔드 준비

현재 Codespaces 에서 `tariff-pages-app` 폴더를 이 소스 기준으로 덮어쓴 뒤 아래를 실행합니다.

```bash
cd /workspaces/prototype_tariff_mobile/tariff-pages-app
rm -rf node_modules package-lock.json
npm install
cp .env.example .env.local
```

아직 Worker URL이 없으므로 `.env.local` 은 나중에 수정합니다.

## 2. Worker 배포 준비

```bash
cd /workspaces/prototype_tariff_mobile/tariff-pages-app/worker
npm install
npx wrangler login
```

## 3. R2 bucket 생성

`wrangler` 또는 Cloudflare Dashboard 둘 중 편한 방법으로 `tariff-snapshot-live` 버킷을 생성합니다.

예시:

```bash
npx wrangler r2 bucket create tariff-snapshot-live
```

## 4. 관리자 비밀번호 SHA-256 해시 만들기

루트 아무 위치에서 아래 명령을 실행합니다.

```bash
node -e "const crypto=require('crypto'); const pw=process.argv[1]; console.log(crypto.createHash('sha256').update(pw).digest('hex'));" "여기에강한비밀번호입력"
```

출력된 64자리 hex 값을 복사합니다.

## 5. Worker secret 등록

```bash
cd /workspaces/prototype_tariff_mobile/tariff-pages-app/worker
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put TOKEN_SECRET
```

입력 예시:
- `ADMIN_USERNAME`: `admin`
- `ADMIN_PASSWORD_HASH`: 위에서 만든 sha256 해시
- `TOKEN_SECRET`: 길고 랜덤한 문자열

## 6. Worker 배포

```bash
npx wrangler deploy
```

배포 후 `https://xxxxx.workers.dev` 형태의 주소를 받습니다.

## 7. 프론트엔드와 Worker 연결

프론트 `.env.local` 에 Worker URL을 넣습니다.

```bash
VITE_PUBLISH_API_BASE_URL=https://xxxxx.workers.dev
```

그 다음 다시 실행합니다.

```bash
cd /workspaces/prototype_tariff_mobile/tariff-pages-app
npm run dev
```

## 8. GitHub Pages 반영

개발 확인 후 저장소에 push 합니다.

```bash
git add .
git commit -m "Replace Supabase with Cloudflare Worker admin upload"
git push
```

GitHub Pages 는 정적 사이트이므로 공개 조회 화면은 그대로 Pages 에서 서비스되고, 관리자 로그인/업로드만 Worker 로 처리합니다.

## 9. 운영 동작 방식

1. 관리자 로그인
2. Update 버튼 클릭
3. Excel 선택
4. 브라우저에서 JSON 정규화
5. Worker 가 최신 JSON 을 R2 에 저장
6. 다른 사용자는 페이지 재진입/포커스 또는 60초 자동 확인 시 최신 데이터 반영

## 10. 확인 포인트

- `Update` 버튼이 로그인 전 비활성화되는지
- 로그인 후 Excel 업로드 시 성공 메시지가 보이는지
- 다른 브라우저에서 1분 이내 최신 데이터가 보이는지
- 기존 static JSON 이 없어도 Worker 최신 스냅샷이 우선 표시되는지
