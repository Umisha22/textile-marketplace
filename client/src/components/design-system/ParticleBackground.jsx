import { useEffect, useRef } from 'react';

const THREAD_COUNT = 18;
const MOUSE_REPEL_RADIUS = 120;
const MOUSE_REPEL_FORCE = 0.08;

function createThread(w, h) {
  const isGold = Math.random() > 0.4;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.15 - 0.05,
    length: 40 + Math.random() * 80,
    angle: Math.random() * Math.PI * 2,
    angularVel: (Math.random() - 0.5) * 0.008,
    alpha: 0.08 + Math.random() * 0.12,
    color: isGold ? '212, 168, 83' : '0, 212, 170',
    width: 0.5 + Math.random() * 0.8,
  };
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const threadsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    threadsRef.current = Array.from({ length: THREAD_COUNT }, () => createThread(w, h));

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mouse = mouseRef.current;

      for (const t of threadsRef.current) {
        const dx = t.x - mouse.x;
        const dy = t.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_FORCE;
          t.vx += (dx / dist) * force;
          t.vy += (dy / dist) * force;
        }

        t.x += t.vx;
        t.y += t.vy;
        t.angle += t.angularVel;
        t.vx *= 0.998;
        t.vy *= 0.998;

        if (t.x < -t.length) t.x = w + t.length;
        if (t.x > w + t.length) t.x = -t.length;
        if (t.y < -t.length) t.y = h + t.length;
        if (t.y > h + t.length) t.y = -t.length;

        const ex = t.x + Math.cos(t.angle) * t.length;
        const ey = t.y + Math.sin(t.angle) * t.length;

        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${t.color}, ${t.alpha})`;
        ctx.lineWidth = t.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
