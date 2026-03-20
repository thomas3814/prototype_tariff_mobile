import { useMemo, useState } from 'react';
import AdaptiveTariffValue from './AdaptiveTariffValue.jsx';
import { getNumericTariffValue } from '../shared/tariffFormat.js';

function getSelectedTariffKey(entry) {
  if (!entry) {
    return 'agreement';
  }

  return entry.displaySource === '기본관세' || entry.xMarked ? 'base' : 'agreement';
}

function getSelectedTariffLabel(entry) {
  return getSelectedTariffKey(entry) === 'base' ? '기본' : '협정';
}

function getSummaryEntry(entries) {
  if (!entries?.length) {
    return null;
  }

  return [...entries].sort((left, right) => {
    const leftNumeric = getNumericTariffValue(left.displayTariffRaw);
    const rightNumeric = getNumericTariffValue(right.displayTariffRaw);

    if (rightNumeric !== null && leftNumeric === null) {
      return 1;
    }

    if (rightNumeric === null && leftNumeric !== null) {
      return -1;
    }

    if (rightNumeric !== null && leftNumeric !== null && rightNumeric !== leftNumeric) {
      return rightNumeric - leftNumeric;
    }

    return left.sourceRowNumber - right.sourceRowNumber;
  })[0];
}

function getCompactAxisLabel(axisTitle) {
  if (axisTitle === '수출국') {
    return '수출';
  }

  if (axisTitle === '수입국') {
    return '수입';
  }

  return axisTitle;
}

function shouldShowSelectedLegend(mode) {
  return mode === 'graph-by-export' || mode === 'graph-by-import';
}

function shouldShowSelectedLegendInMobile(mode) {
  return mode === 'graph-by-export' || mode === 'graph-by-import';
}

function getSafeDomId(value) {
  return String(value)
    .trim()
    .replace(/[^0-9A-Za-z가-힣_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'row';
}

function getCountryItemKey(countryItem, group) {
  return `${group.continent}-${countryItem.country}`;
}

function getTotalCountryCount(groups) {
  return groups.reduce((count, group) => count + group.countries.length, 0);
}

function getContinentToggleLabel(group, actionLabel) {
  return `${group.continent}(${group.countries.length}) ${actionLabel}`;
}

function getUniformContinentToggleWidth(groups) {
  const longestContinentLength = groups.reduce(
    (maxLength, group) => Math.max(maxLength, group.continent.length),
    0,
  );

  return `${Math.max(3.05, Math.min(3.75, longestContinentLength * 0.34 + 2.0))}rem`;
}

function createDesktopGroupRows(groups, targetCountryCount = 11) {
  const rows = [];
  let currentRow = [];
  let currentCountryCount = 0;

  groups.forEach((group) => {
    const groupCountryCount = group.countries.length;
    const shouldMoveToNextRow = currentRow.length > 0
      && currentCountryCount + groupCountryCount > targetCountryCount;

    if (shouldMoveToNextRow) {
      rows.push(currentRow);
      currentRow = [group];
      currentCountryCount = groupCountryCount;
      return;
    }

    currentRow.push(group);
    currentCountryCount += groupCountryCount;
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

function getEntrySignature(entry) {
  return {
    hsCode: entry.hsCode,
    baseTariffRaw: entry.baseTariffRaw,
    baseTariffDisplay: entry.baseTariffDisplay,
    agreementTariffRaw: entry.agreementTariffRaw,
    agreementTariffDisplay: entry.agreementTariffDisplay,
    displayTariffRaw: entry.displayTariffRaw,
    displayTariffDisplay: entry.displayTariffDisplay,
    displaySource: entry.displaySource,
    xMarked: Boolean(entry.xMarked),
    originRule: entry.originRule,
  };
}

function getCountryEntriesSignature(countryItem) {
  return JSON.stringify(countryItem.entries.map((entry) => getEntrySignature(entry)));
}

function mergeEquivalentCountryItems(countryItems) {
  const mergedItems = new Map();

  countryItems.forEach((countryItem) => {
    const signature = getCountryEntriesSignature(countryItem);

    if (!mergedItems.has(signature)) {
      mergedItems.set(signature, {
        ...countryItem,
        countryNames: [countryItem.country],
      });
      return;
    }

    const currentItem = mergedItems.get(signature);
    currentItem.countryNames.push(countryItem.country);
  });

  return Array.from(mergedItems.values()).map((countryItem) => ({
    ...countryItem,
    country: countryItem.countryNames.join('/'),
    mergedCountryLabel: countryItem.countryNames.length > 1,
  }));
}

function applySingleCountryPairSlots(groups) {
  const result = [];
  let pendingSingleGroups = [];

  function flushPendingSingles() {
    if (pendingSingleGroups.length === 1) {
      result.push({
        ...pendingSingleGroups[0],
        singleCountryPairSlot: 'left',
      });
    } else if (pendingSingleGroups.length === 2) {
      result.push(
        {
          ...pendingSingleGroups[0],
          singleCountryPairSlot: 'left',
        },
        {
          ...pendingSingleGroups[1],
          singleCountryPairSlot: 'right',
        },
      );
    }

    pendingSingleGroups = [];
  }

  groups.forEach((group) => {
    if (group.countries.length === 1) {
      pendingSingleGroups.push(group);

      if (pendingSingleGroups.length === 2) {
        flushPendingSingles();
      }

      return;
    }

    flushPendingSingles();
    result.push(group);
  });

  flushPendingSingles();

  return result;
}

function MobileGraphSummary({
  fixedCountryLabel,
  axisTitle,
  totalCountryCount,
  showSelectedLegend = false,
  graphMode = '',
}) {
  return (
    <div
      className={[
        'mobile-graph-summary',
        graphMode ? `mobile-graph-summary--${graphMode}` : '',
      ].filter(Boolean).join(' ')}
      aria-label="모바일 그래프 요약 정보"
    >
      <span className="mobile-graph-summary__item">
        <span className="mobile-graph-summary__label">고정:</span>
        <strong>{fixedCountryLabel}</strong>
      </span>
      <span className="mobile-graph-summary__item">
        <span className="mobile-graph-summary__label">축 :</span>
        <strong>{getCompactAxisLabel(axisTitle)}</strong>
      </span>
      <span className="mobile-graph-summary__item">
        <strong>{totalCountryCount}개국</strong>
      </span>
      <span className="mobile-graph-summary__legend" aria-label="값 색상 범례">
        <span className="mobile-graph-summary__legend-item">
          <span className="mobile-graph-summary__dot mobile-graph-summary__dot--agreement" aria-hidden="true" />
          <span>협정</span>
        </span>
        <span className="mobile-graph-summary__legend-item">
          <span className="mobile-graph-summary__dot mobile-graph-summary__dot--base" aria-hidden="true" />
          <span>기본</span>
        </span>
        {showSelectedLegend ? (
          <span className="mobile-graph-summary__legend-item">
            <span className="mobile-graph-summary__dot mobile-graph-summary__dot--selected" aria-hidden="true" />
            <span>채택</span>
          </span>
        ) : null}
      </span>
    </div>
  );
}

function DesktopLegend({ showSelectedLegend = false }) {
  return (
    <span className="comparison-legend" aria-label="관세 범례">
      <span className="comparison-legend__item">
        <span className="comparison-legend__dot comparison-legend__dot--agreement" aria-hidden="true" />
        <span>협정</span>
      </span>
      <span className="comparison-legend__item">
        <span className="comparison-legend__dot comparison-legend__dot--base" aria-hidden="true" />
        <span>기본</span>
      </span>
      {showSelectedLegend ? (
        <span className="comparison-legend__item">
          <span className="comparison-legend__dot comparison-legend__dot--selected" aria-hidden="true" />
          <span>채택</span>
        </span>
      ) : (
        <span className="comparison-legend__hint">채택 관세 강조 표기</span>
      )}
    </span>
  );
}

function ComparisonMiniTable({
  entry,
  compact = false,
  selectedMarkerStyle = 'badge',
}) {
  const selectedKey = getSelectedTariffKey(entry);
  const className = [
    'comparison-mini-table',
    compact ? 'comparison-mini-table--compact' : '',
    compact ? 'comparison-mini-table--multiline' : '',
    compact && selectedMarkerStyle === 'dot' ? 'comparison-mini-table--dot-selected' : '',
  ].filter(Boolean).join(' ');

  function renderSelectedMarker() {
    if (selectedMarkerStyle === 'dot') {
      return <span className="comparison-mini-table__selected-dot" role="img" aria-label="채택" />;
    }

    return <span className="comparison-mini-table__badge">채택</span>;
  }

  function renderTariffValue(value) {
    const displayValue = value ?? '-';

    if (compact) {
      return (
        <span className="comparison-mini-table__value comparison-mini-table__value--wrapped" title={displayValue}>
          {displayValue}
        </span>
      );
    }

    return (
      <AdaptiveTariffValue
        className="comparison-mini-table__value"
        value={displayValue}
        maxFontSizeRem={0.76}
        minFontSizeRem={0.56}
        stepRem={0.02}
        overflowMode="ellipsis"
      />
    );
  }

  return (
    <div className={className} aria-label="협정 및 기본 관세 비교 표">
      <span className="comparison-mini-table__head">협정</span>
      <span className="comparison-mini-table__head">기본</span>

      <span
        className={[
          'comparison-mini-table__cell',
          'comparison-mini-table__cell--agreement',
          selectedKey === 'agreement' ? 'comparison-mini-table__cell--selected' : '',
        ].filter(Boolean).join(' ')}
      >
        {renderTariffValue(entry?.agreementTariffDisplay)}
        {selectedKey === 'agreement' ? renderSelectedMarker() : null}
      </span>

      <span
        className={[
          'comparison-mini-table__cell',
          'comparison-mini-table__cell--base',
          selectedKey === 'base' ? 'comparison-mini-table__cell--selected' : '',
        ].filter(Boolean).join(' ')}
      >
        {renderTariffValue(entry?.baseTariffDisplay)}
        {selectedKey === 'base' ? renderSelectedMarker() : null}
      </span>
    </div>
  );
}

function ComparisonEntryMeta({
  entry,
  compact = false,
  showOriginRule = true,
  showHsCode = true,
  showSelectedTariff = true,
  className = '',
}) {
  const selectedLabel = getSelectedTariffLabel(entry);
  const metaClassName = [
    'comparison-entry-meta',
    compact ? 'comparison-entry-meta--compact' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <dl className={metaClassName}>
      {showOriginRule ? (
        <div>
          <dt>원산지 기준</dt>
          <dd>{entry.originRule}</dd>
        </div>
      ) : null}
      {showHsCode ? (
        <div>
          <dt>HS</dt>
          <dd>{entry.hsCode}</dd>
        </div>
      ) : null}
      {showSelectedTariff ? (
        <div>
          <dt>채택 관세</dt>
          <dd>
            {entry.displayTariffDisplay}
            {' '}
            ({selectedLabel})
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function DesktopCountryCard({ countryItem, graphMode = '' }) {
  const useDotSelectedMarker = graphMode === 'graph-by-export' || graphMode === 'graph-by-import';

  return (
    <article className="comparison-country-card">
      <header className="comparison-country-card__header">
        <h3>{countryItem.country}</h3>
      </header>

      <div className="comparison-country-card__entries">
        {countryItem.entries.map((entry) => (
          <section key={entry.rowKey} className="comparison-country-card__entry">
            <ComparisonMiniTable
              entry={entry}
              compact
              selectedMarkerStyle={useDotSelectedMarker ? 'dot' : 'badge'}
            />
            <details className="comparison-country-card__details">
              <summary>세부 정보</summary>
              <ComparisonEntryMeta entry={entry} compact />
            </details>
          </section>
        ))}
      </div>
    </article>
  );
}

function DesktopExpandedContinentSection({
  group,
  onToggleGroup,
  compactHeader = false,
  narrowHeader = false,
  exportMode = false,
  importMode = false,
}) {
  const sectionClassName = [
    'comparison-strip',
    exportMode ? 'comparison-strip--export-mode' : '',
    importMode ? 'comparison-strip--import-mode' : '',
    group.countries.length === 1 ? 'comparison-strip--single-country' : '',
  ].filter(Boolean).join(' ');
  const titleClassName = [
    'comparison-strip__title',
    compactHeader ? 'comparison-strip__title--compact' : '',
    narrowHeader ? 'comparison-strip__title--narrow' : '',
    importMode ? 'comparison-strip__title--smaller' : '',
  ].filter(Boolean).join(' ');
  const toggleClassName = [
    'button',
    'button--ghost',
    'button--compact',
    'comparison-inline-toggle',
    narrowHeader ? 'comparison-inline-toggle--narrow' : '',
  ].filter(Boolean).join(' ');

  if (compactHeader) {
    return (
      <section className={sectionClassName}>
        <header className="comparison-strip__header comparison-strip__header--inline">
          <div className={titleClassName}>
            <strong>{`${group.continent}(${group.countries.length})`}</strong>
          </div>

          <button
            className={toggleClassName}
            type="button"
            onClick={() => onToggleGroup(group.continent)}
          >
            접기
          </button>
        </header>

        <div className="comparison-strip__countries">
          {group.countries.map((countryItem) => (
            <DesktopCountryCard
              key={countryItem.country}
              countryItem={countryItem}
              graphMode={exportMode ? 'graph-by-export' : importMode ? 'graph-by-import' : ''}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      <header className="comparison-strip__header comparison-strip__header--stacked">
        <div className="comparison-strip__action-row">
          <button
            className={toggleClassName}
            type="button"
            onClick={() => onToggleGroup(group.continent)}
          >
            접기
          </button>
        </div>

        <div className={titleClassName}>
          <strong>{group.continent}</strong>
          <span className="comparison-strip__count">({group.countries.length})</span>
        </div>
      </header>

      <div className="comparison-strip__countries">
        {group.countries.map((countryItem) => (
          <DesktopCountryCard
            key={countryItem.country}
            countryItem={countryItem}
            graphMode={exportMode ? 'graph-by-export' : importMode ? 'graph-by-import' : ''}
          />
        ))}
      </div>
    </section>
  );
}

function DesktopCollapsedContinentSection({
  group,
  onToggleGroup,
  compactTitle = false,
  narrowHeader = false,
  exportMode = false,
  importMode = false,
}) {
  return (
    <section
      className={[
        'comparison-strip',
        'comparison-strip--collapsed',
        exportMode ? 'comparison-strip--export-mode' : '',
        importMode ? 'comparison-strip--import-mode' : '',
        group.countries.length === 1 ? 'comparison-strip--single-country' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        className={[
          'graph-strip__collapsed-toggle',
          compactTitle ? 'graph-strip__collapsed-toggle--compact-title' : '',
          narrowHeader ? 'graph-strip__collapsed-toggle--narrow' : '',
          importMode ? 'graph-strip__collapsed-toggle--smaller' : '',
        ].filter(Boolean).join(' ')}
        type="button"
        onClick={() => onToggleGroup(group.continent)}
      >
        <strong>{compactTitle ? `${group.continent}(${group.countries.length})` : group.continent}</strong>
        {!compactTitle ? (
          <span className="graph-strip__collapsed-count">({group.countries.length})</span>
        ) : null}
        <span className="graph-strip__collapsed-action">펼치기</span>
      </button>
    </section>
  );
}

function DesktopGroupedComparisonSection({ graphModel, collapsedGroups, onToggleGroup }) {
  const expandedGroupCount = graphModel.groups.filter(
    (group) => !collapsedGroups[group.continent],
  ).length;
  const collapsedGroupCount = graphModel.groups.length - expandedGroupCount;
  const totalCountryCount = getTotalCountryCount(graphModel.groups);
  const groupRows = useMemo(
    () => createDesktopGroupRows(graphModel.groups, 11),
    [graphModel.groups],
  );
  const useCompactGroupHeader = true;
  const showSelectedLegend = shouldShowSelectedLegend(graphModel.mode);
  const isImportMode = graphModel.mode === 'graph-by-import';

  return (
    <section className="panel">
      <div className="panel__header panel__header--comparison">
        <div>
          <h2>{graphModel.title}</h2>
        </div>
        <div className="graph-legend graph-legend--summary comparison-header-summary">
          <span className="pill">고정 기준: {graphModel.fixedCountryLabel}</span>
          <span className="pill pill--accent">축: {graphModel.axisTitle}</span>
          <span className="pill">총 {totalCountryCount}개국</span>
          <span className="pill">펼침 {expandedGroupCount}개 / 접힘 {collapsedGroupCount}개</span>
          <DesktopLegend showSelectedLegend={showSelectedLegend} />
        </div>
      </div>

      <div
        className={[
          'comparison-board',
          graphModel.mode === 'graph-by-export' ? 'comparison-board--export-mode' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="comparison-board__viewport">
          <div className="comparison-board__rows">
            {groupRows.map((groupRow, rowIndex) => (
              <div className="comparison-board__track comparison-board__track--row" key={`comparison-row-${rowIndex + 1}`}>
                {groupRow.map((group) => {
                  const isCollapsed = Boolean(collapsedGroups[group.continent]);

                  return isCollapsed ? (
                    <DesktopCollapsedContinentSection
                      key={group.continent}
                      group={group}
                      onToggleGroup={onToggleGroup}
                      compactTitle={useCompactGroupHeader}
                      narrowHeader={graphModel.mode === 'graph-by-export'}
                      exportMode={graphModel.mode === 'graph-by-export'}
                      importMode={isImportMode}
                    />
                  ) : (
                    <DesktopExpandedContinentSection
                      key={group.continent}
                      group={group}
                      onToggleGroup={onToggleGroup}
                      compactHeader={useCompactGroupHeader}
                      narrowHeader={graphModel.mode === 'graph-by-export'}
                      exportMode={graphModel.mode === 'graph-by-export'}
                      importMode={isImportMode}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileCountryDetailEntry({ entry }) {
  return (
    <section className="comparison-mobile-detail-item">
      <header className="comparison-mobile-detail-item__header comparison-mobile-detail-item__header--compact">
        <strong>HS {entry.hsCode}</strong>
      </header>
      <ComparisonEntryMeta
        entry={entry}
        compact
        showHsCode={false}
        showSelectedTariff={false}
        className="comparison-entry-meta--mobile-compact"
      />
    </section>
  );
}

function MobileRatePill({ label, value, variant, selected }) {
  return (
    <span
      className={[
        'comparison-mobile-overlap__pill',
        `comparison-mobile-overlap__pill--${variant}`,
        selected ? 'comparison-mobile-overlap__pill--selected' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="comparison-mobile-overlap__pill-label">{label}</span>
      <span className="comparison-mobile-overlap__pill-value">{value ?? '-'}</span>
      {selected ? <span className="comparison-mobile-overlap__pill-badge">채택</span> : null}
    </span>
  );
}

function MobilePcStyleValueBox({
  value,
  variant,
  selected,
  showSelectedMarker = false,
}) {
  const displayValue = value ?? '-';

  return (
    <span
      className={[
        'comparison-mobile-frame__box',
        `comparison-mobile-frame__box--${variant}`,
        selected ? 'comparison-mobile-frame__box--selected' : 'comparison-mobile-frame__box--muted',
      ].filter(Boolean).join(' ')}
    >
      {selected && showSelectedMarker ? (
        <span className="comparison-mobile-frame__selected-dot" aria-hidden="true" />
      ) : null}
      <span className="comparison-mobile-frame__box-value" title={displayValue}>
        {displayValue}
      </span>
    </span>
  );
}

function MobileOverlapSummary({ entry, country, graphMode, compactCountryLabel = false }) {
  const selectedKey = getSelectedTariffKey(entry);
  const showSelectedMarker = shouldShowSelectedLegendInMobile(graphMode);

  return (
    <div
      className={[
        'comparison-mobile-frame',
        graphMode === 'graph-by-import' ? 'comparison-mobile-frame--import' : 'comparison-mobile-frame--export',
      ].filter(Boolean).join(' ')}
      aria-label={`${country} 협정 및 기본 관세 요약`}
    >
      <div className="comparison-mobile-frame__shell">
        <div className="comparison-mobile-frame__boxes">
          <MobilePcStyleValueBox
            value={entry?.agreementTariffDisplay ?? '-'}
            variant="agreement"
            selected={selectedKey === 'agreement'}
            showSelectedMarker={showSelectedMarker}
          />
          <MobilePcStyleValueBox
            value={entry?.baseTariffDisplay ?? '-'}
            variant="base"
            selected={selectedKey === 'base'}
            showSelectedMarker={showSelectedMarker}
          />
        </div>
        <span
          className={[
            'comparison-mobile-frame__country',
            compactCountryLabel ? 'comparison-mobile-frame__country--compact' : '',
          ].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {country}
        </span>
      </div>
    </div>
  );
}

function MobileCountryCard({ group, countryItem, isExpanded, onToggle, graphMode }) {
  const countryKey = getCountryItemKey(countryItem, group);
  const summaryEntry = getSummaryEntry(countryItem.entries);
  const detailId = `mobile-country-detail-${getSafeDomId(countryKey)}`;
  const isMergedCountryLabel = Boolean(countryItem.mergedCountryLabel);
  const hideToggleIcon = true;
  const articleClassName = [
    'comparison-mobile-card',
    isExpanded ? 'comparison-mobile-card--expanded' : '',
    graphMode === 'graph-by-export' ? 'comparison-mobile-card--export-mode' : '',
    graphMode === 'graph-by-import' ? 'comparison-mobile-card--import-mode' : '',
    isMergedCountryLabel ? 'comparison-mobile-card--merged-country' : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={articleClassName}>
      <button
        className="comparison-mobile-card__summary"
        type="button"
        onClick={() => onToggle(countryKey)}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        aria-label={`${countryItem.country} ${isExpanded ? '접기' : '펼치기'}`}
        title={countryItem.country}
      >
        <span
          className={[
            'comparison-mobile-card__toggle-icon',
            hideToggleIcon ? 'comparison-mobile-card__toggle-icon--hidden' : '',
          ].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          {isExpanded ? '−' : '+'}
        </span>
        <MobileOverlapSummary
          entry={summaryEntry}
          country={countryItem.country}
          graphMode={graphMode}
          compactCountryLabel={isMergedCountryLabel}
        />
      </button>

      {isExpanded ? (
        <div className="comparison-mobile-card__details" id={detailId}>
          {countryItem.entries.map((entry) => (
            <MobileCountryDetailEntry key={entry.rowKey} entry={entry} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MobileCollapsedContinentChip({ group, onToggleGroup }) {
  return (
    <button
      className="mobile-continent-chip"
      type="button"
      onClick={() => onToggleGroup(group.continent)}
      aria-expanded="false"
      aria-label={`${group.continent}(${group.countries.length}) 펼치기`}
    >
      <span className="mobile-continent-chip__text">{`${group.continent}(${group.countries.length}) 펼치기`}</span>
    </button>
  );
}

function MobileContinentSection({
  group,
  expandedCountryKey,
  onToggleCountry,
  onToggleGroup,
  uniformToggleWidth,
  graphMode,
}) {
  const sideToggleLabel = getContinentToggleLabel(group, '접기');
  const sectionStyle = uniformToggleWidth ? { '--mobile-side-toggle-width': uniformToggleWidth } : undefined;
  const displayCountries = group.displayCountries ?? group.countries;
  const isSectionExpanded = displayCountries.some(
    (countryItem) => getCountryItemKey(countryItem, group) === expandedCountryKey,
  );
  const countriesClassName = [
    'mobile-continent-section__countries',
    'comparison-mobile-grid',
    graphMode === 'graph-by-export' && displayCountries.length === 1
      ? 'mobile-continent-section__countries--single'
      : '',
  ].filter(Boolean).join(' ');
  const sectionClassName = [
    'mobile-continent-section',
    graphMode === 'graph-by-export' ? 'mobile-continent-section--export' : '',
    graphMode === 'graph-by-import' ? 'mobile-continent-section--import' : '',
    group.countries.length === 1 ? 'mobile-continent-section--single-country' : '',
    group.singleCountryPairSlot ? `mobile-continent-section--slot-${group.singleCountryPairSlot}` : '',
    isSectionExpanded ? 'mobile-continent-section--expanded' : '',
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClassName} style={sectionStyle}>
      <div className="mobile-continent-section__expanded-layout">
        <div className={countriesClassName}>
          {displayCountries.map((countryItem) => {
            const countryKey = getCountryItemKey(countryItem, group);

            return (
              <MobileCountryCard
                key={countryKey}
                group={group}
                countryItem={countryItem}
                isExpanded={expandedCountryKey === countryKey}
                onToggle={onToggleCountry}
                graphMode={graphMode}
              />
            );
          })}
        </div>

        <button
          className="button button--ghost button--compact mobile-continent-section__side-toggle"
          type="button"
          onClick={() => onToggleGroup(group.continent)}
          aria-expanded="true"
          aria-label={sideToggleLabel}
          title={sideToggleLabel}
        >
          <span className="mobile-continent-section__side-stack">
            <span className="mobile-continent-section__side-label">{group.continent}</span>
            <span className="mobile-continent-section__side-count">({group.countries.length})</span>
            <span className="mobile-continent-section__side-action">접기</span>
          </span>
        </button>
      </div>
    </section>
  );
}

function MobileGroupedComparisonSection({ graphModel, collapsedGroups, onToggleGroup }) {
  const [expandedCountryKey, setExpandedCountryKey] = useState('');
  const totalCountryCount = useMemo(
    () => getTotalCountryCount(graphModel.groups),
    [graphModel],
  );
  const collapsedGroupList = useMemo(
    () => graphModel.groups.filter((group) => Boolean(collapsedGroups?.[group.continent])),
    [graphModel, collapsedGroups],
  );
  const expandedGroupList = useMemo(() => {
    const visibleGroups = graphModel.groups
      .filter((group) => !collapsedGroups?.[group.continent])
      .map((group) => {
        if (graphModel.mode !== 'graph-by-import') {
          return group;
        }

        return {
          ...group,
          displayCountries: mergeEquivalentCountryItems(group.countries),
        };
      });

    if (graphModel.mode !== 'graph-by-export') {
      return visibleGroups;
    }

    return applySingleCountryPairSlots(visibleGroups);
  }, [graphModel, collapsedGroups]);
  const uniformToggleWidth = useMemo(
    () => getUniformContinentToggleWidth(graphModel.groups),
    [graphModel],
  );
  const usePairSingleLayout = graphModel.mode === 'graph-by-export';

  function handleToggleCountry(countryKey) {
    setExpandedCountryKey((current) => (current === countryKey ? '' : countryKey));
  }

  return (
    <section className="panel">
      <div
        className={[
          'panel__header',
          'panel__header--mobile-graph',
          'panel__header--comparison-mobile',
          graphModel.mode === 'graph-by-export' ? 'panel__header--comparison-mobile-export' : '',
        ].filter(Boolean).join(' ')}
      >
        <div>
          <h2>{graphModel.title}</h2>
        </div>
        <MobileGraphSummary
          fixedCountryLabel={graphModel.fixedCountryLabel}
          axisTitle={graphModel.axisTitle}
          totalCountryCount={totalCountryCount}
          showSelectedLegend={shouldShowSelectedLegendInMobile(graphModel.mode)}
          graphMode={graphModel.mode}
        />
      </div>

      {collapsedGroupList.length ? (
        <div className="mobile-continent-chip-list" aria-label="접힌 대륙 펼치기 버튼 목록">
          {collapsedGroupList.map((group) => (
            <MobileCollapsedContinentChip
              key={group.continent}
              group={group}
              onToggleGroup={onToggleGroup}
            />
          ))}
        </div>
      ) : null}

      <div
        className={[
          'mobile-continent-list',
          usePairSingleLayout ? 'mobile-continent-list--pair-single' : '',
        ].filter(Boolean).join(' ')}
        aria-label="모바일 대륙별 국가 비교 목록"
      >
        {expandedGroupList.map((group) => (
          <MobileContinentSection
            key={group.continent}
            group={group}
            expandedCountryKey={expandedCountryKey}
            onToggleCountry={handleToggleCountry}
            onToggleGroup={onToggleGroup}
            uniformToggleWidth={uniformToggleWidth}
            graphMode={graphModel.mode}
          />
        ))}
      </div>
    </section>
  );
}

export default function GraphSection({
  graphModel,
  collapsedGroups,
  layoutMode = 'desktop',
  onToggleGroup,
}) {
  if (!graphModel) {
    return null;
  }

  if (layoutMode === 'mobile') {
    return (
      <MobileGroupedComparisonSection
        key={`${graphModel.title}-${graphModel.mode}-mobile`}
        graphModel={graphModel}
        collapsedGroups={collapsedGroups}
        onToggleGroup={onToggleGroup}
      />
    );
  }

  return (
    <DesktopGroupedComparisonSection
      key={`${graphModel.title}-${graphModel.mode}-desktop`}
      graphModel={graphModel}
      collapsedGroups={collapsedGroups}
      onToggleGroup={onToggleGroup}
    />
  );
}
