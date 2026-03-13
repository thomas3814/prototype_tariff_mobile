import { getNumericTariffValue } from '../shared/tariffFormat.js';

function MetricColumn({ label, rawValue, displayValue, maxNumericValue, highlighted = false }) {
  const numericValue = getNumericTariffValue(rawValue);
  const hasNumericBar = numericValue !== null && maxNumericValue > 0;
  const height = hasNumericBar
    ? `${Math.max((numericValue / maxNumericValue) * 100, numericValue > 0 ? 10 : 2)}%`
    : '0%';

  return (
    <div className={`metric-column ${highlighted ? 'metric-column--active' : 'metric-column--inactive'}`}>
      <div className="metric-column__stage">
        <span className="metric-column__value">{displayValue}</span>
        <span className="metric-column__center-label" aria-hidden="true">
          {label}
        </span>

        {hasNumericBar ? (
          <div
            className={`metric-column__bar ${numericValue === 0 ? 'metric-column__bar--zero' : ''}`}
            style={{ height }}
            aria-hidden="true"
          />
        ) : (
          <div className="metric-column__text-box" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function GraphEntry({ entry, maxNumericValue }) {
  return (
    <div className="graph-entry-block">
      <div className="graph-entry__meta">
        <div className="graph-entry__origin-inline">원산지 기준 : {entry.originRule}</div>
        <div className="graph-entry__hs">HS {entry.hsCode}</div>
      </div>

      <div className="graph-entry">
        <div className="metric-columns">
          <MetricColumn
            label="협정관세"
            rawValue={entry.agreementTariffRaw}
            displayValue={entry.agreementTariffDisplay}
            maxNumericValue={maxNumericValue}
            highlighted={!entry.xMarked}
          />
          <MetricColumn
            label="기본관세"
            rawValue={entry.baseTariffRaw}
            displayValue={entry.baseTariffDisplay}
            maxNumericValue={maxNumericValue}
            highlighted={entry.xMarked}
          />
        </div>
      </div>
    </div>
  );
}

function CountryCard({ countryItem, maxNumericValue }) {
  return (
    <article className="graph-country-card">
      <header className="graph-country-card__header">
        <div>
          <h3>{countryItem.country}</h3>
        </div>
      </header>

      <div className="graph-country-card__entries">
        {countryItem.entries.map((entry) => (
          <GraphEntry key={entry.rowKey} entry={entry} maxNumericValue={maxNumericValue} />
        ))}
      </div>
    </article>
  );
}

function ExpandedContinentSection({ group, maxNumericValue, onToggleGroup }) {
  return (
    <section className="graph-strip">
      <header className="graph-strip__header graph-strip__header--stacked">
        <div className="graph-strip__action-row">
          <button
            className="button button--ghost button--compact graph-inline-toggle"
            type="button"
            onClick={() => onToggleGroup(group.continent)}
          >
            접기
          </button>
        </div>

        <div className="graph-strip__title">
          <strong>{group.continent}</strong>
          <span className="graph-strip__count">({group.countries.length})</span>
        </div>
      </header>

      <div className="graph-strip__countries">
        {group.countries.map((countryItem) => (
          <CountryCard
            key={countryItem.country}
            countryItem={countryItem}
            maxNumericValue={maxNumericValue}
          />
        ))}
      </div>
    </section>
  );
}

function CollapsedContinentSection({ group, onToggleGroup }) {
  return (
    <section className="graph-strip graph-strip--collapsed">
      <button
        className="graph-strip__collapsed-toggle"
        type="button"
        onClick={() => onToggleGroup(group.continent)}
      >
        <strong>{group.continent}</strong>
        <span>펼치기</span>
      </button>
    </section>
  );
}

export default function GraphSection({
  graphModel,
  collapsedGroups,
  onToggleGroup,
}) {
  if (!graphModel) {
    return null;
  }

  const expandedGroupCount = graphModel.groups.filter(
    (group) => !collapsedGroups[group.continent],
  ).length;
  const collapsedGroupCount = graphModel.groups.length - expandedGroupCount;

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{graphModel.title}</h2>
        </div>
        <div className="graph-legend graph-legend--summary">
          <span className="pill">고정 기준: {graphModel.fixedCountryLabel}</span>
          <span className="pill pill--accent">축: {graphModel.axisTitle}</span>
          <span className="pill">펼침 {expandedGroupCount}개 / 접힘 {collapsedGroupCount}개</span>
        </div>
      </div>

      <div className="graph-board">
        <div className="graph-board__viewport">
          <div className="graph-board__track">
            {graphModel.groups.map((group) => {
              const isCollapsed = Boolean(collapsedGroups[group.continent]);

              return isCollapsed ? (
                <CollapsedContinentSection
                  key={group.continent}
                  group={group}
                  onToggleGroup={onToggleGroup}
                />
              ) : (
                <ExpandedContinentSection
                  key={group.continent}
                  group={group}
                  maxNumericValue={graphModel.maxNumericValue}
                  onToggleGroup={onToggleGroup}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
