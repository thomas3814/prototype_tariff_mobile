function SelectField({
  id,
  label,
  value,
  onChange,
  disabled,
  children,
}) {
  return (
    <label className="field">
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      <select
        className="field__control"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
      >
        {children}
      </select>
    </label>
  );
}

function renderGroupedCountryOptions(groups, excludedCountry) {
  return groups
    .map((group) => {
      const countries = group.countries.filter((country) => country !== excludedCountry);

      if (countries.length === 0) {
        return null;
      }

      return (
        <optgroup key={group.continent} label={group.continent}>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </optgroup>
      );
    })
    .filter(Boolean);
}

function filterCountryGroupsByContinent(groups, selectedContinent) {
  if (!selectedContinent) {
    return groups;
  }

  return groups.filter((group) => group.continent === selectedContinent);
}

export default function FilterPanel({
  productOptions,
  importGroups,
  exportGroups,
  filters,
  theme,
  onProductChange,
  onImportContinentChange,
  onImportCountryChange,
  onExportContinentChange,
  onExportCountryChange,
  onReset,
  onToggleTheme,
}) {
  const isProductSelected = Boolean(filters.productId);
  const filteredImportGroups = filterCountryGroupsByContinent(importGroups, filters.importContinent);
  const filteredExportGroups = filterCountryGroupsByContinent(exportGroups, filters.exportContinent);
  const importCountryOptions = renderGroupedCountryOptions(filteredImportGroups, filters.exportCountry);
  const exportCountryOptions = renderGroupedCountryOptions(filteredExportGroups, filters.importCountry);

  return (
    <section className="panel">
      <div className="panel__header">
        <div className="panel__heading-inline">
          <h2>관세 조회 조건</h2>
          <button
            className="button button--ghost button--compact theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Light 모드로 전환' : 'Dark 모드로 전환'}
            title={theme === 'dark' ? '현재 Dark 모드 · 클릭 시 Light 모드로 전환' : '현재 Light 모드 · 클릭 시 Dark 모드로 전환'}
          >
            Dark 모드 / Light 모드
          </button>
        </div>
        <button className="button button--secondary" type="button" onClick={onReset}>
          초기화
        </button>
      </div>

      <div className="filter-grid">
        <SelectField
          id="product"
          label="제품"
          value={filters.productId}
          onChange={(event) => onProductChange(event.target.value)}
          disabled={false}
        >
          <option value="">제품 선택</option>
          {productOptions.map((product) => (
            <option key={product.id} value={product.id}>
              {product.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="import-continent"
          label="수입국 대륙"
          value={filters.importContinent}
          onChange={(event) => onImportContinentChange(event.target.value)}
          disabled={!isProductSelected}
        >
          <option value="">전체</option>
          {importGroups.map((group) => (
            <option key={group.continent} value={group.continent}>
              {group.continent}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="import-country"
          label="수입국 국가"
          value={filters.importCountry}
          onChange={(event) => onImportCountryChange(event.target.value)}
          disabled={!isProductSelected}
        >
          <option value="">전체</option>
          {importCountryOptions}
        </SelectField>

        <SelectField
          id="export-continent"
          label="수출국 대륙"
          value={filters.exportContinent}
          onChange={(event) => onExportContinentChange(event.target.value)}
          disabled={!isProductSelected}
        >
          <option value="">전체</option>
          {exportGroups.map((group) => (
            <option key={group.continent} value={group.continent}>
              {group.continent}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="export-country"
          label="수출국 국가"
          value={filters.exportCountry}
          onChange={(event) => onExportCountryChange(event.target.value)}
          disabled={!isProductSelected}
        >
          <option value="">전체</option>
          {exportCountryOptions}
        </SelectField>
      </div>
    </section>
  );
}
