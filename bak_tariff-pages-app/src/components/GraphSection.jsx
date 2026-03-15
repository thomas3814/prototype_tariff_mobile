import { useMemo, useState } from 'react';
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
        <span className="graph-strip__collapsed-count">({group.countries.length})</span>
        <span className="graph-strip__collapsed-action">펼치기</span>
      </button>
    </section>
  );
}

function flattenCountries(graphModel) {
  return graphModel.groups.flatMap((group) => group.countries.map((countryItem) => ({
    ...countryItem,
    continent: countryItem.continent ?? group.continent,
  })));
}

function getCountryItemLabel(countryItem) {
  return countryItem.label ?? countryItem.country;
}

function getCountryItemKey(countryItem) {
  return countryItem.key ?? countryItem.countries?.join('|') ?? countryItem.country;
}

function getSafeDomId(value) {
  return String(value)
    .trim()
    .replace(/[^0-9A-Za-z가-힣_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'row';
}

function getGroupCountryCount(group) {
  return group.countryCount ?? group.countries.length;
}

function getContinentToggleLabel(group, actionLabel) {
  const countryCount = getGroupCountryCount(group);
  return `${group.continent}(${countryCount}) ${actionLabel}`;
}

function getUniformContinentToggleWidth(groups) {
  const longestLabelLength = groups.reduce(
    (maxLength, group) => Math.max(maxLength, getContinentToggleLabel(group, '접기').length),
    0,
  );

  return `${Math.max(4.6, Math.min(6.2, longestLabelLength * 0.42 + 1.15))}rem`;
}

function getCountrySignature(countryItem) {
  return JSON.stringify(
    countryItem.entries.map((entry) => ({
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
    })),
  );
}

function mergeMatchingCountriesWithinGroup(group) {
  const mergedItems = [];
  const bucketBySignature = new Map();

  group.countries.forEach((countryItem) => {
    const signature = getCountrySignature(countryItem);
    const existing = bucketBySignature.get(signature);

    if (existing) {
      existing.countries.push(countryItem.country);
      existing.label = `${existing.label}/${countryItem.country}`;
      return;
    }

    const nextItem = {
      ...countryItem,
      key: `${group.continent}-${countryItem.country}`,
      countries: [countryItem.country],
      label: countryItem.country,
    };

    bucketBySignature.set(signature, nextItem);
    mergedItems.push(nextItem);
  });

  return {
    ...group,
    countries: mergedItems.map((countryItem) => ({
      ...countryItem,
      key: `${group.continent}-${countryItem.countries.join('|')}`,
    })),
  };
}

function buildMobileGroups(graphModel) {
  const isImportAxisGraph = graphModel.mode === 'graph-by-import';
  const visibleCountries = isImportAxisGraph
    ? flattenCountries(graphModel)
    : flattenCountries(graphModel).slice(0, 10);
  const visibleCountrySet = new Set(visibleCountries.map((countryItem) => countryItem.country));

  const baseGroups = graphModel.groups
    .map((group) => {
      const countries = group.countries.filter((countryItem) => visibleCountrySet.has(countryItem.country));

      if (countries.length === 0) {
        return null;
      }

      return {
        continent: group.continent,
        countryCount: countries.length,
        countries,
      };
    })
    .filter(Boolean);

  const groups = baseGroups.map((group) => mergeMatchingCountriesWithinGroup(group));

  return {
    groups,
    totalCountryCount: baseGroups.reduce((count, group) => count + getGroupCountryCount(group), 0),
    maxNumericValue: getCountryListMaxNumericValue(groups.flatMap((group) => group.countries)),
  };
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

function getSummaryNumericValue(countryItem) {
  const summaryEntry = getSummaryEntry(countryItem.entries);

  if (!summaryEntry) {
    return null;
  }

  return getNumericTariffValue(summaryEntry.displayTariffRaw);
}

function getCountryListMaxNumericValue(countries) {
  return Math.max(...countries.map((countryItem) => getSummaryNumericValue(countryItem) ?? 0), 0);
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

function getMobileBarTone(entry) {
  if (!entry) {
    return 'agreement';
  }

  return entry.displaySource === '기본관세' || entry.xMarked ? 'base' : 'agreement';
}

function MobileGraphSummary({ fixedCountryLabel, axisTitle, totalCountryCount }) {
  return (
    <div className="mobile-graph-summary" aria-label="모바일 그래프 요약 정보">
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
      <span className="mobile-graph-summary__legend" aria-label="막대 색상 범례">
        <span className="mobile-graph-summary__legend-item">
          <span className="mobile-graph-summary__dot mobile-graph-summary__dot--agreement" aria-hidden="true" />
          <span>협정</span>
        </span>
        <span className="mobile-graph-summary__legend-item">
          <span className="mobile-graph-summary__dot mobile-graph-summary__dot--base" aria-hidden="true" />
          <span>기본</span>
        </span>
      </span>
    </div>
  );
}

function MobileCountryDetail({ entry }) {
  return (
    <section className="mobile-country-detail">
      <header className="mobile-country-detail__header">
        <strong>HS {entry.hsCode}</strong>
        <span className="pill pill--accent mobile-country-detail__pill">
          {entry.displayTariffDisplay}
        </span>
      </header>

      <dl className="mobile-country-detail__grid">
        <div>
          <dt>원산지 기준</dt>
          <dd>{entry.originRule}</dd>
        </div>
        <div>
          <dt>적용 관세</dt>
          <dd>
            {entry.displayTariffDisplay}
            {' '}
            ({entry.displaySource})
          </dd>
        </div>
        <div>
          <dt>협정관세</dt>
          <dd>{entry.agreementTariffDisplay}</dd>
        </div>
        <div>
          <dt>기본관세</dt>
          <dd>{entry.baseTariffDisplay}</dd>
        </div>
      </dl>
    </section>
  );
}

function MobileCountryRow({
  countryItem,
  maxNumericValue,
  isExpanded,
  onToggle,
  isLabelOpen = false,
  onToggleLabel,
  compact = false,
  labelWidth,
}) {
  const summaryEntry = getSummaryEntry(countryItem.entries);
  const summaryValue = summaryEntry?.displayTariffDisplay ?? '-';
  const summaryNumericValue = getSummaryNumericValue(countryItem);
  const countryLabel = getCountryItemLabel(countryItem);
  const countryKey = getCountryItemKey(countryItem);
  const detailId = `mobile-country-detail-${getSafeDomId(countryKey)}`;
  const width = summaryNumericValue !== null && maxNumericValue > 0
    ? `${Math.max((summaryNumericValue / maxNumericValue) * 100, summaryNumericValue > 0 ? 12 : 4)}%`
    : summaryNumericValue === 0
      ? '4%'
      : '0%';
  const isMergedCountry = Array.isArray(countryItem.countries) && countryItem.countries.length > 1;
  const rowStyle = labelWidth ? { '--mobile-country-label-width': labelWidth } : undefined;
  const rowClassName = [
    'mobile-country-row',
    isExpanded ? 'mobile-country-row--expanded' : '',
    compact ? 'mobile-country-row--compact' : '',
  ].filter(Boolean).join(' ');
  const summaryClassName = [
    'mobile-country-row__summary',
    compact ? 'mobile-country-row__summary--compact' : '',
    isMergedCountry ? 'mobile-country-row__summary--merged' : '',
  ].filter(Boolean).join(' ');
  const labelClassName = [
    'mobile-country-row__label',
    isMergedCountry ? 'mobile-country-row__label--merged' : '',
  ].filter(Boolean).join(' ');
  const barToneClassName = [
    'mobile-country-row__bar',
    `mobile-country-row__bar--${getMobileBarTone(summaryEntry)}`,
    summaryNumericValue === 0 ? 'mobile-country-row__bar--zero' : '',
  ].filter(Boolean).join(' ');
  const labelPopoverId = `${detailId}-label`;

  function handleLabelTap(event) {
    if (!isMergedCountry) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onToggleLabel?.(countryKey);
  }

  return (
    <article className={rowClassName} style={rowStyle}>
      <button
        className={summaryClassName}
        type="button"
        onClick={() => onToggle(countryKey)}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        title={`${countryLabel} ${summaryValue}`.trim()}
      >
        <span className="mobile-country-row__label-wrap">
          <span
            className={[labelClassName, isMergedCountry ? 'mobile-country-row__label--touchable' : ''].filter(Boolean).join(' ')}
            title={countryLabel}
            onClick={isMergedCountry ? handleLabelTap : undefined}
          >
            {countryLabel}
          </span>
        </span>
        <span className="mobile-country-row__track" aria-hidden="true">
          <span
            className={barToneClassName}
            style={{ width }}
          />
        </span>
        <span className="mobile-country-row__value">{summaryValue}</span>
      </button>

      {isMergedCountry && isLabelOpen ? (
        <div className="mobile-country-row__label-popover" id={labelPopoverId} role="status" aria-live="polite">
          {countryLabel}
        </div>
      ) : null}

      {isExpanded ? (
        <div className="mobile-country-row__details" id={detailId}>
          {countryItem.entries.map((entry) => (
            <MobileCountryDetail key={entry.rowKey} entry={entry} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MobileCollapsedContinentChip({ group, onToggleGroup }) {
  const countryCount = getGroupCountryCount(group);

  return (
    <button
      className="mobile-continent-chip"
      type="button"
      onClick={() => onToggleGroup(group.continent)}
      aria-expanded="false"
      aria-label={`${group.continent}(${countryCount}) 펼치기`}
    >
      <span className="mobile-continent-chip__text">{`${group.continent}(${countryCount}) 펼치기`}</span>
    </button>
  );
}

function MobileContinentSection({
  group,
  maxNumericValue,
  expandedCountry,
  openLabelCountry,
  onToggleCountry,
  onToggleLabel,
  onToggleGroup,
  uniformToggleWidth,
  labelWidth,
}) {
  const sideToggleLabel = getContinentToggleLabel(group, '접기');
  const sectionStyle = uniformToggleWidth ? { '--mobile-side-toggle-width': uniformToggleWidth } : undefined;

  return (
    <section className="mobile-continent-section" style={sectionStyle}>
      <div className="mobile-continent-section__expanded-layout">
        <div className="mobile-continent-section__countries">
          {group.countries.map((countryItem) => {
            const countryKey = getCountryItemKey(countryItem);

            return (
              <MobileCountryRow
                key={countryKey}
                countryItem={countryItem}
                maxNumericValue={maxNumericValue}
                isExpanded={expandedCountry === countryKey}
                onToggle={onToggleCountry}
                isLabelOpen={openLabelCountry === countryKey}
                onToggleLabel={onToggleLabel}
                compact
                labelWidth={labelWidth}
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
          <span className="mobile-continent-section__side-inline">{sideToggleLabel}</span>
        </button>
      </div>
    </section>
  );
}

function MobileCountryGraphSection({ graphModel, collapsedGroups, onToggleGroup }) {
  const [expandedCountry, setExpandedCountry] = useState('');
  const [openLabelCountry, setOpenLabelCountry] = useState('');
  const mobileGraphData = useMemo(
    () => buildMobileGroups(graphModel),
    [graphModel],
  );
  const collapsedGroupList = useMemo(
    () => mobileGraphData.groups.filter((group) => Boolean(collapsedGroups?.[group.continent])),
    [mobileGraphData, collapsedGroups],
  );
  const expandedGroupList = useMemo(
    () => mobileGraphData.groups.filter((group) => !collapsedGroups?.[group.continent]),
    [mobileGraphData, collapsedGroups],
  );
  const uniformToggleWidth = useMemo(
    () => getUniformContinentToggleWidth(mobileGraphData.groups),
    [mobileGraphData],
  );
  const labelWidth = '4.15rem';

  function handleToggleCountry(countryKey) {
    setOpenLabelCountry('');
    setExpandedCountry((current) => (current === countryKey ? '' : countryKey));
  }

  function handleToggleLabel(countryKey) {
    setOpenLabelCountry((current) => (current === countryKey ? '' : countryKey));
  }

  return (
    <section className="panel">
      <div className="panel__header panel__header--mobile-graph">
        <div>
          <h2>{graphModel.title}</h2>
        </div>
        <MobileGraphSummary
          fixedCountryLabel={graphModel.fixedCountryLabel}
          axisTitle={graphModel.axisTitle}
          totalCountryCount={mobileGraphData.totalCountryCount}
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

      <div className="mobile-continent-list" aria-label="모바일 대륙별 국가 그래프 목록">
        {expandedGroupList.map((group) => (
          <MobileContinentSection
            key={group.continent}
            group={group}
            maxNumericValue={mobileGraphData.maxNumericValue}
            expandedCountry={expandedCountry}
            openLabelCountry={openLabelCountry}
            onToggleCountry={handleToggleCountry}
            onToggleLabel={handleToggleLabel}
            onToggleGroup={onToggleGroup}
            uniformToggleWidth={uniformToggleWidth}
            labelWidth={labelWidth}
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

  if (layoutMode === 'mobile' && ['graph-by-export', 'graph-by-import'].includes(graphModel.mode)) {
    return (
      <MobileCountryGraphSection
        key={graphModel.title}
        graphModel={graphModel}
        collapsedGroups={collapsedGroups}
        onToggleGroup={onToggleGroup}
      />
    );
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
