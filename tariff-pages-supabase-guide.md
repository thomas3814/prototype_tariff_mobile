# Supabase 연동 적용 가이드

## 1. Supabase 프로젝트 생성

- Authentication 사용 가능 상태 확인
- Storage 사용 가능 상태 확인

## 2. SQL Editor 실행

아래 파일 전체를 SQL Editor 에 붙여넣고 실행합니다.

```text
supabase/setup.sql
```

생성 항목:

- `public.admin_users`
- `public.tariff_publish_state`
- `public.is_tariff_admin()`
- `storage bucket: tariff-snapshots`
- `tariff_publish_state` Realtime publication 등록

## 3. 관리자 계정 등록

```sql
insert into public.admin_users (email)
values ('your-admin@example.com')
on conflict (email) do nothing;
```

## 4. Authentication 에 관리자 사용자 생성

- Email: `your-admin@example.com`
- Password: 원하는 비밀번호

## 5. 로컬 개발용 .env.local 작성

```bash
cp .env.example .env.local
```

예시:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SNAPSHOT_BUCKET=tariff-snapshots
VITE_SUPABASE_PUBLISH_TABLE=tariff_publish_state
VITE_SUPABASE_ADMIN_TABLE=admin_users
VITE_SUPABASE_PUBLISH_ROW_ID=default
```

## 6. 실행

```bash
npm install
npm run dev
```

## 7. 관리자 반영 절차

1. 화면 최하단 `데이터 정보`
2. 관리자 로그인
3. `원본 파일` 카드의 `Update`
4. 최신 Excel 선택
5. 게시 완료 후 모든 사용자 화면 자동 갱신

## 8. GitHub Pages 배포 시 Secrets

Repository → Settings → Secrets and variables → Actions

등록 권장값:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SNAPSHOT_BUCKET`
- `VITE_SUPABASE_PUBLISH_TABLE`
- `VITE_SUPABASE_ADMIN_TABLE`
- `VITE_SUPABASE_PUBLISH_ROW_ID`

## 9. 동작 방식 요약

- 관리자가 Excel 선택
- 브라우저에서 Excel → JSON 정규화
- Supabase Storage 에 새 버전 JSON 업로드
- `tariff_publish_state` 단일 행 upsert
- 다른 사용자 브라우저는 Realtime 으로 변경 감지 후 자동 새로고침 없이 최신 스냅샷 반영
