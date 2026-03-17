import { formatDateTimeToKorea } from '../shared/tariffFormat.js';

function openExternalUrl(url) {
  if (!url) {
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

function GithubUpdateCard({ githubSourceContext }) {
  const hasGithubSourceContext = Boolean(githubSourceContext);

  return (
    <article className="meta-card meta-card--source">
      <div className="meta-card__top">
        <div className="meta-card__inline-file">
          <span className="meta-card__label">원본 파일</span>
          <strong className="meta-card__value meta-card__value--inline">
            {githubSourceContext?.fileName ?? 'tariff-source.xlsx'}
          </strong>
        </div>
        {hasGithubSourceContext ? (
          <div className="meta-card__actions">
            <button
              className="button button--secondary button--compact"
              type="button"
              onClick={() => openExternalUrl(githubSourceContext.sourceFolderUrl)}
            >
              GitHub에서 교체
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function MetaPanel({
  meta,
  selectedProduct,
  dataSourceLabel,
  githubSourceContext,
}) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>데이터 정보</h2>
        </div>
        <div className="graph-legend">
          <span className="pill pill--accent">{dataSourceLabel}</span>
        </div>
      </div>

      <div className="meta-grid">
        <GithubUpdateCard githubSourceContext={githubSourceContext} />

        <article className="meta-card">
          <span className="meta-card__label">업로드 일시</span>
          <strong className="meta-card__value">
            {formatDateTimeToKorea(meta?.uploadedAt ?? meta?.extractedAt)}
          </strong>
        </article>

        <article className="meta-card">
          <span className="meta-card__label">원본 파일 수정일</span>
          <strong className="meta-card__value">
            {formatDateTimeToKorea(meta?.sourceFileLastModified)}
          </strong>
        </article>

        <article className="meta-card">
          <span className="meta-card__label">현재 제품</span>
          <strong className="meta-card__value">{selectedProduct?.label ?? '선택 전'}</strong>
        </article>
      </div>
    </section>
  );
}
