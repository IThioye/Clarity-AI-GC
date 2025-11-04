"use client";
import React, { useEffect, useRef } from "react";

type OrbState = "idle" | "listening" | "thinking" | "responding";

type Props = {
  size?: number; // px
  state?: OrbState; // controls speed/intensity
  className?: string; // extra classes (e.g., drop shadows)
};

const stateParams: Record<OrbState, { speed: number; amp: number }> = {
  idle: { speed: 0.6, amp: 0.8 },
  listening: { speed: 1.2, amp: 1.1 },
  thinking: { speed: 0.9, amp: 1.4 },
  responding: { speed: 1.6, amp: 1.6 },
};

export default function ClarityOrbFluid({ size = 220, state = "idle", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // sharp but not too heavy
    const W = size * dpr;
    const H = size * dpr;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // drawing helpers
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) * 0.48;
    let t = 0;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const base = stateParams[state];
    const speed = prefersReduced ? 0.2 : base.speed;
    let amp = prefersReduced ? base.amp * 0.6 : base.amp;

    // brand palette and helpers
    const palette = { blue: '#8FC8FF', violet: '#C58AFF', rose: '#F9A9D3' } as const;

    // simple HSL -> rgba helper for smooth hue cycling
    const hsl = (h: number, s = 0.7, l = 0.6, a = 1) => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let [r1, g1, b1] = [0, 0, 0];
      if (0 <= h && h < 60) [r1, g1, b1] = [c, x, 0];
      else if (60 <= h && h < 120) [r1, g1, b1] = [x, c, 0];
      else if (120 <= h && h < 180) [r1, g1, b1] = [0, c, x];
      else if (180 <= h && h < 240) [r1, g1, b1] = [0, x, c];
      else if (240 <= h && h < 300) [r1, g1, b1] = [x, 0, c];
      else if (300 <= h && h < 360) [r1, g1, b1] = [c, 0, x];
      const R = Math.round((r1 + m) * 255);
      const G = Math.round((g1 + m) * 255);
      const B = Math.round((b1 + m) * 255);
      return `rgba(${R},${G},${B},${a})`;
    };

    // Precompute a circular clipping path
    const clipCircle = () => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    };

    const drawRim = () => {
      // outer glass rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      // subtle refraction gradient along rim
      const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      rimGrad.addColorStop(0, "rgba(255,255,255,0.35)");
      rimGrad.addColorStop(0.6, "rgba(255,255,255,0.12)");
      rimGrad.addColorStop(1, "rgba(255,255,255,0.28)");
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = Math.max(2, r * 0.035);
      ctx.stroke();
      ctx.restore();
    };

    const drawSheen = () => {
      // top-left soft sheen
      const grd = ctx.createRadialGradient(
        cx - r * 0.45,
        cy - r * 0.55,
        r * 0.1,
        cx - r * 0.45,
        cy - r * 0.55,
        r * 1.2
      );
      grd.addColorStop(0, "rgba(255,255,255,0.60)");
      grd.addColorStop(0.25, "rgba(255,255,255,0.20)");
      grd.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // smoother S-curve with a slightly fatter belly near -0.3..0.3
    const smoothstep = (e: number) => (t: number) => t * t * (3 - 2 * t) * e + (1 - e) * t;
    const easeMid = smoothstep(1);
    const wave = (x: number, phase: number) => {
      // base sin components
      const s1 = Math.sin(x * 1.35 + phase) * 0.22;
      const s2 = Math.sin(x * 0.55 - phase * 0.85) * 0.12;
      // thicken around center
      const mid = 1 - Math.min(1, Math.abs(x) / 0.9);
      const belly = easeMid(Math.max(0, mid)) * 0.10;
      return s1 + s2 + belly * (x < 0 ? 1 : -0.6);
    };

    const drawFluid = (time: number) => {
      // "Siri-like" inner fluid with a soft S-curve divider and hue-cycling gradients
      ctx.save();
      clipCircle();

      // base depth + vignette
      const baseGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.05);
      baseGrad.addColorStop(0, "rgba(10,12,28,0.55)");
      baseGrad.addColorStop(1, "rgba(10,12,28,0.85)");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // slow breathing oscillation (6–8s loop)
      const breath = Math.sin((time / 7) * Math.PI * 2) * 0.08; // -0.08..0.08
      amp = (prefersReduced ? amp : amp + breath);

      const hueShift = (time * 10) % 360; // gentler hue drift
      // upper lobe gradient (cool-to-warm, top-right bias)
      const gradTop = ctx.createLinearGradient(cx - r * 0.8, cy - r * 0.7, cx + r * 0.9, cy + r * 0.9);
      gradTop.addColorStop(0.00, hsl((210 + hueShift) % 360, 0.75, 0.64, 0.95)); // cool blue
      gradTop.addColorStop(0.55, hsl((258 + hueShift) % 360, 0.70, 0.63, 0.92)); // violet
      gradTop.addColorStop(1.00, hsl((330 + hueShift) % 360, 0.70, 0.68, 0.88)); // warm rose

      // lower lobe gradient (cooler belly at bottom-left)
      const gradBot = ctx.createLinearGradient(cx + r * 0.9, cy + r * 0.9, cx - r * 0.9, cy - r * 0.8);
      gradBot.addColorStop(0.00, hsl((330 + hueShift) % 360, 0.70, 0.66, 0.90));
      gradBot.addColorStop(0.60, hsl((258 + hueShift) % 360, 0.70, 0.62, 0.90));
      gradBot.addColorStop(1.00, hsl((210 + hueShift) % 360, 0.72, 0.60, 0.92));

      // Draw two smooth lobes by filling above/below the S-curve
      const drawLobe = (above = true) => {
        ctx.beginPath();
        // start at left edge of circle
        ctx.moveTo(cx - r, cy);
        for (let x = -r; x <= r; x += 1.5) {
          const nx = x / r; // -1..1
          // S-curve across the orb
          const y = wave(nx, time * speed) * amp * r * 0.55;
          const yy = cy + y;
          ctx.lineTo(cx + x, yy + (above ? -r : r));
        }
        // close the shape outside circle bounds to ensure fill
        ctx.lineTo(cx + r, cy + (above ? -r : r));
        ctx.lineTo(cx - r, cy + (above ? -r : r));
        ctx.closePath();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = above ? gradTop : gradBot;
        ctx.fill();
      };

      drawLobe(true);
      drawLobe(false);

      // soft glossy inner edges (double pass to simulate bevel)
      ctx.globalCompositeOperation = "overlay";
      const drawEdge = (alpha: number, offset: number) => {
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = Math.max(1, r * 0.018);
        ctx.beginPath();
        for (let x = -r; x <= r; x += 2.2) {
          const nx = x / r;
          const y = wave(nx, time * speed) * amp * r * 0.55 + offset;
          ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
      };
      drawEdge(0.28, r * 0.006);
      drawEdge(0.12, -r * 0.006);

      // top-left glint highlight (like a light source)
      ctx.globalCompositeOperation = "screen";
      const glint = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.6, r * 0.05, cx - r * 0.45, cy - r * 0.6, r * 0.6);
      glint.addColorStop(0, "rgba(255,246,218,0.85)"); // #FFF6DA
      glint.addColorStop(0.25, "rgba(255,255,255,0.25)");
      glint.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = glint;
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.35, r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawHalo = () => {
      // outside glow halo
      const halo = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 1.55);
      halo.addColorStop(0, "rgba(197,138,255,0.40)");
      halo.addColorStop(0.65, "rgba(143,200,255,0.18)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (now: number) => {
      t = now / 1000; // seconds
      ctx.clearRect(0, 0, W, H);
      drawHalo();
      drawFluid(t * speed);
      drawSheen();
      drawRim();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, state]);

  return (
    <div
      className={`relative rounded-full bg-white/7 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(163,102,255,0.25)] ${className || ""}`}
      style={{ width: size, height: size }}
      aria-label={`Clarity orb - ${state}`}
    >
      <canvas ref={canvasRef} style={{ borderRadius: "50%" }} />
    </div>
  );
}
