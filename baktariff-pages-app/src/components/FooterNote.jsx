const DEFAULT_SOURCE_FILE_PATH = 'source-data/tariff-source.xlsx';

export default function FooterNote({ githubSourceContext }) {
  const sourceFilePath = githubSourceContext?.sourceFilePath ?? DEFAULT_SOURCE_FILE_PATH;

  return (
    <section className="panel footer-note" aria-label="GitHub 원본 엑셀 교체 가이드">
      <div className="footer-note__title">주석</div>
      <div className="footer-note__content">
        <p>
          GitHub 저장소에서 원본 엑셀 1개를 같은 이름으로 교체 후 Commit 하는 방법입니다.
        </p>
        <ol className="footer-note__list">
          <li>
            GitHub 저장소에서 <code className="footer-note__path">{sourceFilePath}</code> 경로를 엽니다.
          </li>
          <li>기존 파일을 같은 이름의 최신 엑셀 파일로 교체합니다.</li>
          <li>Commit changes를 실행합니다.</li>
          <li>GitHub Actions 배포가 완료되면 최신 엑셀 기준 JSON 스냅샷이 사이트에 반영됩니다.</li>
        </ol>
      </div>
    </section>
  );
}
