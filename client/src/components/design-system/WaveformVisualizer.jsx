import { useEffect, useRef, useState } from 'react';

export default function WaveformVisualizer({ active = false, className = '' }) {
  const canvasRef = useRef(null);
  const animRef = useRef();
  const [bars] = useState(() => Array.from({ length: 40 }, () => Math.random() * 0.3));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const displayW = w / 2;
    const displayH = h / 2;

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, displayW, displayH);
      const barCount = bars.length;
      const barWidth = displayW / barCount;
      const centerY = displayH / 2;

      for (let i = 0; i < barCount; i++) {
        const amplitude = active
          ? 0.3 + Math.sin(time * 3 + i * 0.3) * 0.4 + Math.sin(time * 5 + i * 0.7) * 0.2
          : 0.05 + Math.sin(time * 1.5 + i * 0.2) * 0.08;

        const barH = amplitude * displayH * 0.8;
        const x = i * barWidth;
        const isGold = i % 3 !== 2;

        const grad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
        if (isGold) {
          grad.addColorStop(0, 'rgba(212, 168, 83, 0.8)');
          grad.addColorStop(0.5, 'rgba(212, 168, 83, 1)');
          grad.addColorStop(1, 'rgba(212, 168, 83, 0.8)');
        } else {
          grad.addColorStop(0, 'rgba(0, 212, 170, 0.6)');
          grad.addColorStop(0.5, 'rgba(0, 212, 170, 0.9)');
          grad.addColorStop(1, 'rgba(0, 212, 170, 0.6)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 1, centerY - barH / 2, barWidth - 2, barH, 1);
        ctx.fill();
      }

      time += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [active, bars]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: '100%' }}
    />
  );
}
