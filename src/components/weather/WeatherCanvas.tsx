import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { playCalmDistantThunder } from './thunderAudio';

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  layer: 0 | 1 | 2; // 0: far fine, 1: mid, 2: foreground
  alpha: number;
}

interface WaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface CloudPuff {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
}

export const WeatherCanvas: React.FC<{ className?: string; opacity?: number }> = ({ 
  className = '', 
  opacity = 1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { rainfallMmH, theme, calmMode, audioAtmosphere } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calmMode || prefersReducedMotion) {
      const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        ctx.fillStyle = theme === 'light' ? '#E9EFF6' : '#0B111A';
        ctx.fillRect(0, 0, width, height);
      };
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    let drops: Drop[] = [];
    let ripples: WaveRipple[] = [];
    let clouds: CloudPuff[] = [];

    // Pointer tracking with lerp
    let pointerTargetX = window.innerWidth / 2;
    let pointerTargetY = window.innerHeight / 2;
    let pointerCurrentX = pointerTargetX;
    let pointerCurrentY = pointerTargetY;
    let waveTime = 0;

    // Lightning state
    let lightningGlow = 0;
    let nextLightningTime = Date.now() + (12000 + Math.random() * 10000);

    const initScene = () => {
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const area = window.innerWidth * window.innerHeight;
      const rainRatio = Math.max(0.3, Math.min(1.8, rainfallMmH / 110));
      const count = Math.min(380, Math.max(80, Math.floor((area / 6500) * rainRatio)));

      // Initialize cinematic fine rain drops
      drops = [];
      for (let i = 0; i < count; i++) {
        const layer = (Math.random() < 0.5 ? 0 : Math.random() < 0.85 ? 1 : 2) as (0 | 1 | 2);
        const speed = layer === 0 ? 11 + Math.random() * 5 : layer === 1 ? 17 + Math.random() * 6 : 24 + Math.random() * 8;
        const length = layer === 0 ? 10 + Math.random() * 8 : layer === 1 ? 18 + Math.random() * 12 : 30 + Math.random() * 16;
        const alpha = layer === 0 ? 0.16 : layer === 1 ? 0.32 : 0.52;

        drops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: length * dpr,
          speed: speed * dpr,
          layer,
          alpha,
        });
      }

      // Initialize volumetric cloud puffs in the upper sky
      clouds = [];
      const cloudCount = Math.floor(width / (160 * dpr));
      for (let i = 0; i < cloudCount + 4; i++) {
        clouds.push({
          x: (i * 180 * dpr) - 100,
          y: (Math.random() * 110 + 20) * dpr,
          radius: (110 + Math.random() * 90) * dpr,
          speed: (0.15 + Math.random() * 0.25) * dpr,
          alpha: 0.18 + Math.random() * 0.15,
        });
      }
    };

    initScene();

    const handleResize = () => initScene();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerTargetX = clientX * dpr;
      pointerTargetY = clientY * dpr;

      // Ripple in water zone
      const waterLineY = height * 0.82;
      if (pointerTargetY > waterLineY - 30 * dpr && Math.random() < 0.4) {
        ripples.push({
          x: pointerTargetX,
          y: pointerTargetY,
          radius: 3 * dpr,
          maxRadius: (24 + Math.random() * 26) * dpr,
          alpha: 0.45,
          speed: (0.7 + Math.random() * 0.5) * dpr,
        });
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      ripples.push({
        x: clientX * dpr,
        y: clientY * dpr,
        radius: 4 * dpr,
        maxRadius: 50 * dpr,
        alpha: 0.6,
        speed: 1.2 * dpr,
      });
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible) return;

      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;
      waveTime += delta * 0.002;

      // Lerp pointer
      pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.055;
      pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.055;

      const screenCenterX = width / 2;
      const pointerNormalizedX = (pointerCurrentX - screenCenterX) / screenCenterX;
      const windLeanX = pointerNormalizedX * (4.2 * dpr);

      // Safe lightning glow
      const now = Date.now();
      if (theme !== 'light' && now >= nextLightningTime) {
        lightningGlow = 0.075;
        nextLightningTime = now + (13000 + Math.random() * 11000);
        if (audioAtmosphere) {
          playCalmDistantThunder();
        }
      }
      if (lightningGlow > 0.001) {
        lightningGlow -= 0.0025 * (delta / 16);
        if (lightningGlow < 0) lightningGlow = 0;
      }

      const isDark = theme !== 'light';
      ctx.clearRect(0, 0, width, height);

      // 1. ATMOSPHERIC SKY BASE GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        skyGrad.addColorStop(0, '#090E17');
        skyGrad.addColorStop(0.35, '#0E1624');
        skyGrad.addColorStop(0.70, '#131E30');
        skyGrad.addColorStop(1, '#18253B');
      } else {
        skyGrad.addColorStop(0, '#EBF0F6');
        skyGrad.addColorStop(0.40, '#E1E9F2');
        skyGrad.addColorStop(0.75, '#D5E1ED');
        skyGrad.addColorStop(1, '#C7D6E6');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. VOLUMETRIC STORM CLOUDS
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed * (delta / 16);
        if (cloud.x - cloud.radius > width) {
          cloud.x = -cloud.radius;
        }

        const cloudGrad = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.radius
        );
        if (isDark) {
          cloudGrad.addColorStop(0, `rgba(32, 46, 70, ${cloud.alpha * 0.5})`);
          cloudGrad.addColorStop(0.65, `rgba(20, 30, 48, ${cloud.alpha * 0.25})`);
          cloudGrad.addColorStop(1, 'transparent');
        } else {
          cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${cloud.alpha * 0.65})`);
          cloudGrad.addColorStop(0.7, `rgba(220, 230, 242, ${cloud.alpha * 0.3})`);
          cloudGrad.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lightning Sky Flash
      if (lightningGlow > 0.001) {
        ctx.fillStyle = isDark 
          ? `rgba(185, 210, 240, ${lightningGlow})` 
          : `rgba(255, 255, 255, ${lightningGlow * 0.7})`;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. CURSOR AMBIENT GLOW
      const radialGlow = ctx.createRadialGradient(
        pointerCurrentX, pointerCurrentY, 0,
        pointerCurrentX, pointerCurrentY, 340 * dpr
      );
      radialGlow.addColorStop(0, isDark ? 'rgba(127, 181, 176, 0.08)' : 'rgba(63, 127, 122, 0.07)');
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 4. DYNAMIC FLOWING WATER SURFACE WAVES (BOTTOM 25%)
      const waterBaseY = height * 0.82;
      const waveAmplitude = (10 + Math.min(20, rainfallMmH * 0.08)) * dpr;

      // Layer 1: Background deep wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15 * dpr) {
        const y = waterBaseY + Math.sin(x * 0.004 + waveTime * 1.2) * (waveAmplitude * 0.65)
                            + Math.cos(x * 0.008 + waveTime * 0.7) * (waveAmplitude * 0.35);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const waveGrad1 = ctx.createLinearGradient(0, waterBaseY, 0, height);
      if (isDark) {
        waveGrad1.addColorStop(0, 'rgba(30, 48, 72, 0.45)');
        waveGrad1.addColorStop(1, 'rgba(15, 24, 38, 0.85)');
      } else {
        waveGrad1.addColorStop(0, 'rgba(150, 185, 215, 0.4)');
        waveGrad1.addColorStop(1, 'rgba(120, 155, 190, 0.7)');
      }
      ctx.fillStyle = waveGrad1;
      ctx.fill();

      // Layer 2: Foreground reflective water swell
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 12 * dpr) {
        const y = waterBaseY + 12 * dpr + Math.sin(x * 0.006 - waveTime * 1.5) * waveAmplitude
                                       + Math.sin(x * 0.012 + waveTime * 2.0) * (waveAmplitude * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const waveGrad2 = ctx.createLinearGradient(0, waterBaseY, 0, height);
      if (isDark) {
        waveGrad2.addColorStop(0, 'rgba(94, 143, 181, 0.35)');
        waveGrad2.addColorStop(0.3, 'rgba(24, 37, 56, 0.75)');
        waveGrad2.addColorStop(1, 'rgba(13, 19, 29, 0.95)');
      } else {
        waveGrad2.addColorStop(0, 'rgba(180, 210, 235, 0.5)');
        waveGrad2.addColorStop(0.4, 'rgba(160, 190, 220, 0.75)');
        waveGrad2.addColorStop(1, 'rgba(135, 165, 195, 0.9)');
      }
      ctx.fillStyle = waveGrad2;
      ctx.fill();

      // 5. CINEMATIC FINE RAIN PARTICLES
      ctx.lineCap = 'round';
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        const parallaxFactor = drop.layer === 0 ? 0.008 : drop.layer === 1 ? 0.018 : 0.03;
        const layerOffsetX = (pointerCurrentX - screenCenterX) * parallaxFactor;

        const startX = drop.x + layerOffsetX;
        const startY = drop.y;
        const endX = startX + windLeanX * (drop.speed / 14);
        const endY = startY + drop.length;

        const rainColor = isDark 
          ? `rgba(190, 215, 240, ${drop.alpha * (drop.layer === 2 ? 0.55 : 0.35)})` 
          : `rgba(75, 105, 135, ${drop.alpha * 0.4})`;

        ctx.strokeStyle = rainColor;
        ctx.lineWidth = (drop.layer === 0 ? 0.8 : drop.layer === 1 ? 1.2 : 1.7) * dpr;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        drop.y += drop.speed * (delta / 16);
        drop.x += (windLeanX * 0.18) * (delta / 16);

        // Water surface impact
        if (drop.y > waterBaseY + Math.random() * 40 * dpr) {
          if (drop.layer > 0 && Math.random() < 0.22) {
            ripples.push({
              x: startX,
              y: waterBaseY + Math.random() * 30 * dpr,
              radius: 1 * dpr,
              maxRadius: (5 + Math.random() * 12) * dpr,
              alpha: isDark ? 0.28 : 0.22,
              speed: 0.6 * dpr,
            });
          }
          drop.y = -drop.length - Math.random() * 30;
          drop.x = Math.random() * width;
        }

        if (drop.x > width + 40) drop.x = -40;
        else if (drop.x < -40) drop.x = width + 40;
      }

      // 6. RIPPLES
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed * (delta / 16);
        ripple.alpha -= 0.007 * (delta / 16);

        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = isDark 
          ? `rgba(127, 181, 176, ${ripple.alpha})` 
          : `rgba(63, 127, 122, ${ripple.alpha})`;
        ctx.lineWidth = 1 * dpr;

        ctx.beginPath();
        ctx.ellipse(ripple.x, ripple.y, ripple.radius * 2.0, ripple.radius * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [rainfallMmH, theme, calmMode, audioAtmosphere]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
