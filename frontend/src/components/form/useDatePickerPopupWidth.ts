import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export const useDatePickerPopupWidth = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = useState<number>();

  const measure = useCallback(() => {
    const width = wrapperRef.current?.querySelector('.ant-picker')?.getBoundingClientRect().width;
    if (width) setPopupWidth((previous) => previous === width ? previous : width);
  }, []);

  useLayoutEffect(() => {
    const picker = wrapperRef.current?.querySelector('.ant-picker');
    if (!picker) return;

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(picker);
    return () => observer.disconnect();
  }, [measure]);

  return { wrapperRef, popupWidth, measure };
};
