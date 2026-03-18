import { useLayoutEffect, useRef } from 'react';

function hasOverflow(element) {
  if (!element) {
    return false;
  }

  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
}

export default function AdaptiveTariffValue({
  value,
  className = '',
  maxFontSizeRem = 0.76,
  minFontSizeRem = 0.56,
  stepRem = 0.02,
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

      let nextSize = maxFontSizeRem;
      target.style.fontSize = `${nextSize}rem`;

      while (hasOverflow(target) && nextSize > minFontSizeRem) {
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
  }, [maxFontSizeRem, minFontSizeRem, stepRem, value]);

  return (
    <span
      ref={ref}
      className={['adaptive-tariff-value', className].filter(Boolean).join(' ')}
      title={value}
    >
      {value}
    </span>
  );
}
