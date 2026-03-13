import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { normalizeBasePath } from './src/shared/tariffConfig.js';

/**
 * GitHub Pages 배포 시 저장소 이름에 맞춰 base 경로를 자동 계산합니다.
 * - <owner>.github.io 저장소면 /
 * - 일반 저장소면 /repo-name/
 * - 명시적으로 VITE_BASE_PATH를 주면 그 값을 우선합니다.
 */
function resolveBasePath() {
  if (process.env.VITE_BASE_PATH) {
    return normalizeBasePath(process.env.VITE_BASE_PATH);
  }

  const repository = process.env.GITHUB_REPOSITORY;

  if (!repository) {
    return '/';
  }

  const [owner, repo] = repository.split('/');

  if (!owner || !repo) {
    return '/';
  }

  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return '/';
  }

  return `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: resolveBasePath(),
});
