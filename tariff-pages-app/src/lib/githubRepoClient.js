const DEFAULT_BRANCH = import.meta.env.VITE_GITHUB_BRANCH?.trim() || 'main';
const DEFAULT_SOURCE_FILE_PATH = import.meta.env.VITE_GITHUB_SOURCE_FILE_PATH?.trim() || 'source-data/tariff-source.xlsx';
const CONFIGURED_REPOSITORY = import.meta.env.VITE_GITHUB_REPOSITORY?.trim() || '';

function inferRepositoryFromLocation() {
  if (typeof window === 'undefined') {
    return '';
  }

  const host = window.location.hostname;
  if (!host.endsWith('.github.io')) {
    return '';
  }

  const owner = host.replace(/\.github\.io$/u, '');
  const [repoName] = window.location.pathname.split('/').filter(Boolean);

  if (!owner || !repoName) {
    return '';
  }

  return `${owner}/${repoName}`;
}

function splitRepository(repository) {
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

export function getGithubSourceContext() {
  const repository = CONFIGURED_REPOSITORY || inferRepositoryFromLocation();
  const parts = splitRepository(repository);

  if (!parts) {
    return null;
  }

  const sourceFilePath = DEFAULT_SOURCE_FILE_PATH.replace(/^\/+|\/+$/gu, '');
  const folderPath = sourceFilePath.includes('/')
    ? sourceFilePath.slice(0, sourceFilePath.lastIndexOf('/'))
    : '';
  const fileName = sourceFilePath.split('/').at(-1) ?? 'tariff-source.xlsx';
  const repositoryWebUrl = `https://github.com/${parts.owner}/${parts.repo}`;
  const sourceFolderUrl = folderPath
    ? `${repositoryWebUrl}/tree/${DEFAULT_BRANCH}/${folderPath}`
    : `${repositoryWebUrl}/tree/${DEFAULT_BRANCH}`;
  const sourceFileUrl = `${repositoryWebUrl}/blob/${DEFAULT_BRANCH}/${sourceFilePath}`;

  return {
    repository,
    branch: DEFAULT_BRANCH,
    sourceFilePath,
    folderPath,
    fileName,
    repositoryWebUrl,
    sourceFolderUrl,
    sourceFileUrl,
  };
}

export function getSnapshotSourceLabel(storageMode) {
  if (storageMode === 'github-pages-static') {
    return 'GitHub Pages 배포본';
  }

  return '배포 스냅샷';
}
