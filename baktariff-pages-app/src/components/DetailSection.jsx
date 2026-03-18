export default function DetailSection({ product, cards }) {
  if (!cards.length) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>HS별 상세 결과</h2>
          <p>
            동일 수입국에 복수 HS Code가 존재하는 경우, 요청하신 기준대로 다건을 모두 표시합니다.
          </p>
        </div>
        <span className="pill pill--accent">총 {cards.length}건</span>
      </div>

      <div className="detail-card-grid">
        {cards.map((card) => (
          <article key={card.rowKey} className="detail-card">
            <header className="detail-card__header">
              <div>
                <span className="detail-card__eyebrow">{product.label}</span>
                <h3>HS {card.hsCode}</h3>
              </div>
              <span className="pill">원본 행 #{card.sourceRowNumber}</span>
            </header>

            <dl className="detail-card__table">
              <div>
                <dt>수입국</dt>
                <dd>
                  {card.importContinent} / {card.importCountry}
                </dd>
              </div>
              <div>
                <dt>수출국</dt>
                <dd>
                  {card.exportContinent} / {card.exportCountry}
                </dd>
              </div>
              <div>
                <dt>적용 표기 관세율</dt>
                <dd>
                  {card.displayTariffDisplay} ({card.displaySource})
                </dd>
              </div>
              <div>
                <dt>기본관세</dt>
                <dd>{card.baseTariffDisplay}</dd>
              </div>
              <div>
                <dt>협정관세</dt>
                <dd>
                  {card.agreementTariffDisplay}
                </dd>
              </div>
              <div>
                <dt>원산지 결정 기준</dt>
                <dd>{card.originRule}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
