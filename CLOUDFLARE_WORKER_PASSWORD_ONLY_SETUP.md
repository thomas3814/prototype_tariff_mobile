# Cloudflare Worker + R2 설정 가이드

## 목적
- 공개 조회는 GitHub Pages에서 유지
- 업로드는 비밀번호 1개만으로 인증
- 업로드 시 최신 JSON snapshot 1개를 overwrite
- 모든 사용자는 같은 최신 snapshot 을 조회

## 1. Worker/R2 생성
```bash
cd worker
npm install
npx wrangler login
npx wrangler r2 bucket create tariff-snapshot-live
```

## 2. 업로드 비밀번호 해시 생성
```bash
node -e "const crypto=require('crypto'); const pw=process.argv[1]; console.log(crypto.createHash('sha256').update(pw).digest('hex'));" "강한비밀번호입력"
```

## 3. Worker 비밀값 등록
```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put TOKEN_SECRET
```

- `ADMIN_PASSWORD_HASH`: 2단계에서 생성한 SHA-256 hex 문자열
- `TOKEN_SECRET`: 길고 랜덤한 문자열

## 4. Worker 배포
```bash
npx wrangler deploy
```

배포 후 `https://...workers.dev` 주소를 받습니다.

## 5. 프론트 env 연결
프로젝트 루트의 `.env.local` 에 아래를 넣습니다.

```bash
VITE_PUBLISH_API_BASE_URL=https://YOUR-WORKER.workers.dev
```

## 6. 동작 방식
1. 사용자가 사이트 접속
2. 공개 최신 snapshot 조회
3. 관리자만 하단에서 비밀번호 인증
4. Excel 1개 선택
5. 브라우저에서 JSON snapshot 생성
6. Worker 가 R2의 `latest/tariff-snapshot.json` 을 overwrite
7. 다른 사용자는 새로고침 / 포커스 복귀 / 자동 확인 시 최신 snapshot 조회
