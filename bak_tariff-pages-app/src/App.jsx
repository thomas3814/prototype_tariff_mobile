import { useEffect, useMemo, useState } from 'react';
import DetailSection from './components/DetailSection.jsx';
import EmptyState from './components/EmptyState.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import FooterNote from './components/FooterNote.jsx';
import GraphSection from './components/GraphSection.jsx';
import MetaPanel from './components/MetaPanel.jsx';
import ViewModeSwitch from './components/ViewModeSwitch.jsx';
import { getGithubSourceContext, getSnapshotSourceLabel } from './lib/githubRepoClient.js';
import {
  buildDetailCards,
  buildExportCountryGroups,
  buildGraphModel,
  buildImportCountryGroups,
  getProduct,
  getProductOptions,
  getViewMode,
} from './lib/tariffViewModel.js';

const DEFAULT_PRODUCT_ID = 'lcd-tv-set-852872';
const THEME_STORAGE_KEY = 'tariff-viewer-theme';
const LAYOUT_MODE_STORAGE_KEY = 'tariff-viewer-layout-mode';

const EMPTY_FILTERS = {
  productId: '',
  importContinent: '',
  importCountry: '',
  exportContinent: '',
  exportCountry: '',
};

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function detectViewportLayoutMode() {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  return window.matchMedia?.('(max-width: 720px)').matches ? 'mobile' : 'desktop';
}

function getInitialLayoutMode() {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const savedLayoutMode = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);

  if (savedLayoutMode === 'mobile' || savedLayoutMode === 'desktop') {
    return savedLayoutMode;
  }

  return detectViewportLayoutMode();
}

function getDefaultProductId(snapshot) {
  const products = snapshot?.uiConfig?.products ?? [];

  return products.find((product) => product.id === DEFAULT_PRODUCT_ID)?.id
    ?? products[0]?.id
    ?? '';
}

function createDefaultFilters(snapshot) {
  return {
    ...EMPTY_FILTERS,
    productId: getDefaultProductId(snapshot),
  };
}

async function loadBundledSnapshot() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/tariff-snapshot.json`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`데이터 파일을 불러오지 못했습니다. HTTP ${response.status}`);
  }

  return response.json();
}

function decorateSnapshot(snapshot) {
  return {
    ...snapshot,
    meta: {
      ...snapshot?.meta,
      storageMode: 'github-pages-static',
    },
  };
}

function normalizeFiltersForSnapshot(snapshot, currentFilters) {
  if (!snapshot) {
    return EMPTY_FILTERS;
  }

  const defaultFilters = createDefaultFilters(snapshot);

  const nextFilters = {
    ...defaultFilters,
    ...currentFilters,
    productId: currentFilters?.productId || defaultFilters.productId,
  };
  const product = getProduct(snapshot, nextFilters.productId);

  if (!product) {
    return defaultFilters;
  }

  const validImportContinents = new Set(
    (product.availableImportCountries ?? []).map((item) => item.continent),
  );
  if (!validImportContinents.has(nextFilters.importContinent)) {
    nextFilters.importContinent = '';
    nextFilters.importCountry = '';
  }

  const validImportCountries = new Set(
    (product.availableImportCountries ?? [])
      .filter((item) => !nextFilters.importContinent || item.continent === nextFilters.importContinent)
      .map((item) => item.country),
  );
  if (nextFilters.importCountry && !validImportCountries.has(nextFilters.importCountry)) {
    nextFilters.importCountry = '';
  }

  const validExportContinents = new Set(
    (product.availableExportCountries ?? []).map((item) => item.continent),
  );
  if (!validExportContinents.has(nextFilters.exportContinent)) {
    nextFilters.exportContinent = '';
    nextFilters.exportCountry = '';
  }

  const validExportCountries = new Set(
    (product.availableExportCountries ?? [])
      .filter((item) => !nextFilters.exportContinent || item.continent === nextFilters.exportContinent)
      .map((item) => item.country),
  );
  if (nextFilters.exportCountry && !validExportCountries.has(nextFilters.exportCountry)) {
    nextFilters.exportCountry = '';
  }

  return nextFilters;
}

export default function App() {
  const [snapshot, setSnapshot] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [layoutMode, setLayoutMode] = useState(() => getInitialLayoutMode());
  const [status, setStatus] = useState({
    loading: true,
    error: '',
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.layoutMode = layoutMode;
    window.localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    let active = true;

    async function bootstrapSnapshot() {
      try {
        const bundledSnapshot = decorateSnapshot(await loadBundledSnapshot());

        if (!active) {
          return;
        }

        setSnapshot(bundledSnapshot);
        setFilters((current) => normalizeFiltersForSnapshot(bundledSnapshot, current));
        setStatus({ loading: false, error: '' });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus({
          loading: false,
          error: error instanceof Error ? error.message : '조회 가능한 관세 데이터가 없습니다.',
        });
      }
    }

    void bootstrapSnapshot();

    return () => {
      active = false;
    };
  }, []);

  const githubSourceContext = useMemo(() => getGithubSourceContext(), []);
  const productOptions = useMemo(() => getProductOptions(snapshot), [snapshot]);
  const selectedProduct = useMemo(
    () => getProduct(snapshot, filters.productId),
    [snapshot, filters.productId],
  );
  const importGroups = useMemo(() => buildImportCountryGroups(selectedProduct), [selectedProduct]);
  const exportGroups = useMemo(() => buildExportCountryGroups(selectedProduct), [selectedProduct]);
  const viewMode = useMemo(() => getViewMode(filters), [filters]);
  const detailCards = useMemo(
    () => buildDetailCards(selectedProduct, filters.importCountry, filters.exportCountry),
    [selectedProduct, filters.importCountry, filters.exportCountry],
  );
  const graphModel = useMemo(
    () => buildGraphModel(selectedProduct, filters),
    [selectedProduct, filters],
  );
  const shellClassName = `app-shell app-shell--${layoutMode}`;

  function resetAllFilters() {
    setFilters(createDefaultFilters(snapshot));
    setCollapsedGroups({});
  }

  function handleProductChange(productId) {
    setFilters({
      ...EMPTY_FILTERS,
      productId,
    });
    setCollapsedGroups({});
  }

  function handleImportContinentChange(importContinent) {
    setFilters((current) => ({
      ...current,
      importContinent,
      importCountry: '',
    }));
  }

  function handleImportCountryChange(importCountry) {
    setFilters((current) => ({
      ...current,
      importCountry,
    }));
  }

  function handleExportContinentChange(exportContinent) {
    setFilters((current) => ({
      ...current,
      exportContinent,
      exportCountry: '',
    }));
  }

  function handleExportCountryChange(exportCountry) {
    setFilters((current) => ({
      ...current,
      exportCountry,
    }));
  }

  function toggleGraphGroup(continent) {
    setCollapsedGroups((current) => ({
      ...current,
      [continent]: !current[continent],
    }));
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  function handleLayoutModeChange(nextMode) {
    if (nextMode !== 'mobile' && nextMode !== 'desktop') {
      return;
    }

    setLayoutMode(nextMode);
  }

  if (status.loading) {
    return (
      <div className={shellClassName}>
        <main className="app">
          <section className="panel loading-state">
            <p>데이터를 불러오는 중입니다.</p>
          </section>
        </main>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className={shellClassName}>
        <main className="app">
          <section className="panel error-state">
            <h1>데이터를 불러오지 못했습니다.</h1>
            <p>{status.error}</p>
            <button className="button button--primary" type="button" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <main className="app">
        <FilterPanel
          productOptions={productOptions}
          importGroups={importGroups}
          exportGroups={exportGroups}
          filters={filters}
          theme={theme}
          onProductChange={handleProductChange}
          onImportContinentChange={handleImportContinentChange}
          onImportCountryChange={handleImportCountryChange}
          onExportContinentChange={handleExportContinentChange}
          onExportCountryChange={handleExportCountryChange}
          onReset={resetAllFilters}
          onToggleTheme={toggleTheme}
        />

        {viewMode === 'idle' ? <EmptyState type="idle" /> : null}
        {viewMode === 'waiting' ? <EmptyState type="waiting" /> : null}

        {viewMode === 'detail' && detailCards.length === 0 ? <EmptyState type="detail-empty" /> : null}
        {viewMode === 'detail' && detailCards.length > 0 ? (
          <DetailSection product={selectedProduct} cards={detailCards} />
        ) : null}

        {(viewMode === 'graph-by-export' || viewMode === 'graph-by-import') && graphModel ? (
          <GraphSection
            graphModel={graphModel}
            collapsedGroups={collapsedGroups}
            layoutMode={layoutMode}
            onToggleGroup={toggleGraphGroup}
          />
        ) : null}

        <MetaPanel
          meta={snapshot?.meta}
          selectedProduct={selectedProduct}
          dataSourceLabel={getSnapshotSourceLabel(snapshot?.meta?.storageMode)}
          githubSourceContext={githubSourceContext}
        />

        <FooterNote githubSourceContext={githubSourceContext} />
        <ViewModeSwitch layoutMode={layoutMode} onChange={handleLayoutModeChange} />
      </main>
    </div>
  );
}
