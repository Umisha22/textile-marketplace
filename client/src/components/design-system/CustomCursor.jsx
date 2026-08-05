import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const raf = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      el.style.left = `${pos.current.x}px`;
      el.style.top = `${pos.current.y}px`;
      raf.current = requestAnimationFrame(tick);
    };

    const onOver = (e) => {
      const target = e.target;
      const isInteractive = target.closest('a, button, input, select, textarea, label, [role="button"]');
      const isFabric = target.closest('[data-fabric-image]');
      if (isFabric) {
        el.classList.add('fabric-hover');
        el.classList.remove('hovering');
      } else if (isInteractive) {
        el.classList.add('hovering');
        el.classList.remove('fabric-hover');
      } else {
        el.classList.remove('hovering', 'fabric-hover');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" />;
}
