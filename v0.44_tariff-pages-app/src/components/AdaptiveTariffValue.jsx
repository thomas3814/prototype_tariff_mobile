import { useLayoutEffect, useRef } from 'react';

function hasOverflow(element, reservedInlinePx = 0) {
  if (!element) {
    return false;
  }

  const availableWidth = Math.max(0, element.clientWidth - reservedInlinePx);

  return element.scrollWidth > availableWidth || element.scrollHeight > element.clientHeight;
}

export default function AdaptiveTariffValue({
  value,
  className = '',
  maxFontSizeRem = 0.76,
  minFontSizeRem = 0.56,
  stepRem = 0.02,
  reservedInlinePx = 0,
  overflowMode = 'ellipsis',
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    let rafId = 0;

    const fitText = () => {
      const target = ref.current;

      if (!target) {
        return;
      }

      const availableWidth = Math.max(1, target.clientWidth - reservedInlinePx);
      let nextSize = maxFontSizeRem;
      target.style.fontSize = `${nextSize}rem`;

      const initialWidth = target.scrollWidth;

      if (initialWidth > availableWidth) {
        const estimatedSize = Number(
          Math.max(
            minFontSizeRem,
            Math.min(
              maxFontSizeRem,
              (maxFontSizeRem * availableWidth) / initialWidth * 0.985,
            ),
          ).toFixed(3),
        );

        nextSize = estimatedSize;
        target.style.fontSize = `${nextSize}rem`;
      }

      while (hasOverflow(target, reservedInlinePx) && nextSize > minFontSizeRem) {
        nextSize = Math.max(minFontSizeRem, Number((nextSize - stepRem).toFixed(3)));
        target.style.fontSize = `${nextSize}rem`;
      }
    };

    const scheduleFitText = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(fitText);
    };

    scheduleFitText();

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
        scheduleFitText();
      });

    if (element.parentElement) {
      resizeObserver?.observe(element.parentElement);
    } else {
      resizeObserver?.observe(element);
    }

    window.addEventListener('resize', scheduleFitText);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleFitText);
    };
  }, [maxFontSizeRem, minFontSizeRem, overflowMode, reservedInlinePx, stepRem, value]);

  return (
    <span
      ref={ref}
      className={[
        'adaptive-tariff-value',
        overflowMode === 'clip' ? 'adaptive-tariff-value--clip' : '',
        className,
      ].filter(Boolean).join(' ')}
      title={value}
    >
      {value}
    </span>
  );
}
