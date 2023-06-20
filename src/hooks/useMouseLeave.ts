/* eslint-disable react-hooks/exhaustive-deps */
import { throttle } from 'lodash';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function useMouseLeave() {
  const [mouseLeft, setMouseLeft] = useState(true);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = useRef(
    throttle((e: MouseEvent) => {
      if (!elementRef || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();

      // eslint-disable-next-line max-len
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        setMouseLeft(true);
      } else {
        setMouseLeft(false);
      }
    }, 50),
  ).current;

  const handleMouseEnter = useRef(() => {
    setMouseLeft(false);
    window.addEventListener('mousemove', handleMouseMove);
  }).current;

  const setRef = useCallback((node: HTMLElement | null) => {
    if (elementRef && elementRef.current) {
      elementRef.current.removeEventListener('mouseenter', () => handleMouseEnter());
    }

    if (node !== null) {
      node.addEventListener('mouseenter', () => handleMouseEnter());

      elementRef.current = node;
    }
  }, []);

  useEffect(() => {
    if (mouseLeft) {
      window.removeEventListener('mousemove', (e) => handleMouseMove(e));
    }
  }, [mouseLeft]);

  useEffect(() => () => {
    if (elementRef && elementRef.current) {
      elementRef.current.removeEventListener('mouseenter', () => handleMouseEnter());
    }
    window.removeEventListener('mousemove', (e) => handleMouseMove(e));
  }, []);

  return [mouseLeft, setRef, elementRef] as const;
}
