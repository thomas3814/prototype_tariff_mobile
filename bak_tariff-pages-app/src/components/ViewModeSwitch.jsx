import { APP_VERSION_LABEL } from '../shared/appVersion.js';

export default function ViewModeSwitch({ layoutMode, onChange }) {
  return (
    <div className="view-mode-switch-wrap">
      <nav className="view-mode-switch" aria-label="화면 모드 전환">
        <button
          className={`view-mode-switch__button ${layoutMode === 'mobile' ? 'view-mode-switch__button--active' : ''}`}
          type="button"
          aria-pressed={layoutMode === 'mobile'}
          onClick={() => onChange('mobile')}
        >
          모바일 모드
        </button>
        <span className="view-mode-switch__divider" aria-hidden="true">/</span>
        <button
          className={`view-mode-switch__button ${layoutMode === 'desktop' ? 'view-mode-switch__button--active' : ''}`}
          type="button"
          aria-pressed={layoutMode === 'desktop'}
          onClick={() => onChange('desktop')}
        >
          PC모드
        </button>
      </nav>
      <div className="view-mode-switch__version" aria-label={`현재 버전 ${APP_VERSION_LABEL}`}>
        {APP_VERSION_LABEL}
      </div>
    </div>
  );
}
