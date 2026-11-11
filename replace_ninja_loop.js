import fs from 'fs';

const filePath = '/app/applet/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '  useEffect(() => {\n    resetGame();\n    let animId: number;\n\n    const canvas = canvasRef.current;';
const endMarker = '/* =========================================================\n   8. MINI GAME 2: MEMORY GAME';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacement = `  // Main game animation loop
  useEffect(() => {
    resetGame();
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (time: number) => {
      const s = gameStateRef.current;
      if (!s.running) {
        animId = requestAnimationFrame(loop);
        return;
      }

      if (isPausedRef.current) {
        s.lastTime = time;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(time - s.lastTime, 60);
      s.lastTime = time;
      const width = s.width;
      const height = s.height;
      const dpr = s.dpr;

      // Spawn
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0 && s.fruits.length < 4) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const charLen = word.h.length;
        // Adjust bubble radius based on character count so 3-char words fit comfortably
        const r = charLen >= 3 ? 54 : charLen === 2 ? 48 : 44;
        const x = Math.random() * (width - r * 2.4) + r * 1.2;
        
        // Gentle upward trajectory tailored to canvas height
        const targetPeakY = height * (0.18 + Math.random() * 0.22);
        const gravity = 0.13;
        const vy = -Math.sqrt(2 * gravity * (height + r - targetPeakY));
        const vx = ((width * 0.5) - x) * (0.2 + Math.random() * 0.3) / 100;

        s.fruits.push({
          text: word.h,
          pinyin: word.p,
          meaning: word.m,
          radius: r,
          x,
          y: height + r,
          vx,
          vy,
          gravity,
          rotation: (Math.random() - 0.5) * 0.1, // Only subtle tilt, NOT upside-down
          vr: (Math.random() - 0.5) * 0.008,
          color: Math.floor(Math.random() * 360)
        });
        s.spawnTimer = 950 + Math.random() * 600;
      }

      // Update fruits
      for (let i = s.fruits.length - 1; i >= 0; i--) {
        const f = s.fruits[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.rotation += f.vr;
        // Keep subtle wobble within ±12 degrees
        if (Math.abs(f.rotation) > 0.2) f.vr *= -1;

        if (f.y > height + f.radius + 30 && f.vy > 0) {
          s.fruits.splice(i, 1);
          s.lives--;
          setLives(s.lives);
          playSfx('miss');
          if (s.lives <= 0) {
            s.running = false;
            setIsGameOver(true);
          }
        }
      }

      // Update halves
      for (let i = s.halves.length - 1; i >= 0; i--) {
        const h = s.halves[i];
        h.x += h.vx;
        h.y += h.vy;
        h.vy += h.gravity;
        h.rotation += h.vr;
        h.life -= 0.025;
        if (h.life <= 0) s.halves.splice(i, 1);
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.035;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Update floating scores
      for (let i = s.floatingScores.length - 1; i >= 0; i--) {
        const fs = s.floatingScores[i];
        fs.y -= 1.2;
        fs.life -= 0.02;
        if (fs.life <= 0) s.floatingScores.splice(i, 1);
      }

      // Update trail
      for (let i = s.trail.length - 1; i >= 0; i--) {
        s.trail[i].life -= dt * 0.005;
        if (s.trail[i].life <= 0) s.trail.splice(i, 1);
      }

      // Reset combo
      if (s.combo > 0 && performance.now() - s.lastSliceTime > 900) {
        s.combo = 0;
        setCombo(0);
      }

      // RENDER
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // Background decorative dark slate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient circular glow at bottom
      const grad = ctx.createRadialGradient(width / 2, height, 10, width / 2, height, width * 0.75);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw blade trail with glowing neon effect
      if (s.trail.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Inner sharp core
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw fruits
      s.fruits.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        // Outer vibrant glowing circle
        ctx.beginPath();
        ctx.arc(0, 0, f.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = \`hsla(\${f.color}, 95%, 68%, 0.9)\`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // High contrast dark frosted body
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(23, 30, 52, 0.94)';
        ctx.fill();

        // Bubble inner highlight
        const innerGrad = ctx.createRadialGradient(-f.radius * 0.35, -f.radius * 0.35, 2, 0, 0, f.radius);
        innerGrad.addColorStop(0, \`hsla(\${f.color}, 90%, 75%, 0.35)\`);
        innerGrad.addColorStop(1, 'rgba(10, 15, 30, 0.9)');
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // Keep Chinese text UPRIGHT and highly legible
        ctx.save();
        ctx.rotate(-f.rotation); // Counter-rotate so text NEVER goes upside-down!

        // Hanzi text with solid contrast
        const isLong = f.text.length >= 3;
        const fontSize = isLong ? 22 : f.text.length === 2 ? 26 : 30;
        ctx.font = \`900 \${fontSize}px "Noto Serif SC", "PingFang SC", "Microsoft YaHei", sans-serif\`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark text outline for clarity
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeText(f.text, 0, -6);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(f.text, 0, -6);

        // Pinyin text (bright golden yellow, clear)
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(f.pinyin, 0, 14);
        ctx.fillText(f.pinyin, 0, 14);

        // Mini Vietnamese tag indicator
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(f.meaning.length > 10 ? f.meaning.slice(0, 9) + '…' : f.meaning, 0, 26);

        ctx.restore();
        ctx.restore();
      });

      // Draw halves
      s.halves.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);
        ctx.globalAlpha = Math.max(0, h.life);
        ctx.beginPath();
        if (h.side === 1) {
          ctx.arc(0, 0, 46, Math.PI / 2, Math.PI * 1.5);
        } else {
          ctx.arc(0, 0, 46, Math.PI * 1.5, Math.PI / 2);
        }
        ctx.fillStyle = \`hsla(\${h.color}, 80%, 65%, 0.45)\`;
        ctx.fill();
        ctx.strokeStyle = \`hsla(\${h.color}, 95%, 75%, 1)\`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      });

      // Draw particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = \`hsla(\${p.color}, 95%, 70%, 1)\`;
        ctx.fill();
        ctx.restore();
      });

      // Draw floating score & meaning cards
      s.floatingScores.forEach(fs => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, fs.life);
        ctx.textAlign = 'center';
        
        // Score pill background
        const cardW = 120;
        const cardH = 34;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(fs.x - cardW / 2, fs.y - cardH / 2, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(\`+\${fs.pts} ⭐ \${fs.text}\`, fs.x, fs.y - 3);

        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(fs.meaning, fs.x, fs.y + 10);

        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [playSfx]);

  // Unified slice processor (supports both tap & swipe across screen)
  const sliceFruit = useCallback((fIdx: number, pX: number, pY: number, angle: number) => {
    const s = gameStateRef.current;
    const f = s.fruits[fIdx];
    if (!f) return;

    playSfx('slash');
    speakText(f.text);

    // Spawn halves
    s.halves.push(
      { x: f.x, y: f.y, color: f.color, text: f.text, side: 1, angle, vx: -3.5, vy: -2, gravity: 0.22, rotation: 0, vr: -0.12, life: 1.0 },
      { x: f.x, y: f.y, color: f.color, text: f.text, side: 2, angle, vx: 3.5, vy: -2, gravity: 0.22, rotation: 0, vr: 0.12, life: 1.0 }
    );

    // Spawn burst particles
    for (let k = 0; k < 14; k++) {
      s.particles.push({
        x: f.x,
        y: f.y,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        color: f.color,
        life: 1.0,
        gravity: 0.24,
        size: Math.random() * 3.5 + 2
      });
    }

    s.combo++;
    s.lastSliceTime = performance.now();
    setCombo(s.combo);

    const pts = s.combo > 1 ? 10 * s.combo : 10;
    s.score += pts;
    setScore(s.score);

    // Spawn educational floating score + meaning card
    s.floatingScores.push({
      x: f.x,
      y: f.y - 20,
      text: f.text,
      meaning: f.meaning,
      pts,
      life: 1.0
    });

    s.fruits.splice(fIdx, 1);
  }, [playSfx, speakText]);

  // Pointer slice tracking
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Convert client touch/mouse event to internal logical coordinates
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = gameStateRef.current;
    if (!s.running || isPausedRef.current) return;
    const { x, y } = getCanvasCoords(e);
    lastPointerRef.current = { x, y };
    s.trail.push({ x, y, life: 1.0 });

    // TAP HIT CHECK: Allows mobile users to simply TAP a bubble to slice it!
    for (let j = s.fruits.length - 1; j >= 0; j--) {
      const f = s.fruits[j];
      const dist = Math.hypot(x - f.x, y - f.y);
      // Generous hitbox for mobile finger taps
      if (dist <= f.radius + 24) {
        sliceFruit(j, x, y, Math.PI / 4);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = gameStateRef.current;
    if (!s.running || isPausedRef.current) return;
    const { x, y } = getCanvasCoords(e);

    if (lastPointerRef.current) {
      const p1 = lastPointerRef.current;
      const p2 = { x, y };
      s.trail.push({ x, y, life: 1.0 });
      if (s.trail.length > 20) s.trail.shift();

      // SWIPE HIT CHECK: Distance from bubble center to swipe segment
      for (let j = s.fruits.length - 1; j >= 0; j--) {
        const f = s.fruits[j];
        const dist = distToSegment(f.x, f.y, p1.x, p1.y, p2.x, p2.y);
        // Generous slice allowance for fingers on touch screens
        if (dist <= f.radius + 22) {
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          sliceFruit(j, x, y, angle);
        }
      }
    }
    lastPointerRef.current = { x, y };
  };

  const handlePointerUp = () => {
    lastPointerRef.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden bg-[#0f172a] shadow-2xl border-4 border-[#1e293b] select-none touch-none w-full"
    >
      {/* HUD - Mobile optimized with large touch targets */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex justify-between items-center z-10 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none text-white font-bold text-sm">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700/60 shadow-sm">
            <span className="text-yellow-400 text-base">⭐</span>
            <span className="text-xs text-slate-300">Điểm:</span>
            <b className="text-base text-yellow-300 font-mono">{score}</b>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700/60 shadow-sm">
            <span className="text-xs text-slate-300 mr-1">Mạng:</span>
            {[...Array(3)].map((_, i) => (
              <span key={i} className={\`text-sm transition-transform \${i < lives ? 'scale-100' : 'opacity-25 grayscale'}\`}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {combo > 1 && (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs animate-bounce shadow-lg">
              x{combo} COMBO!
            </span>
          )}
          <button
            onClick={togglePause}
            className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white flex items-center justify-center transition active:scale-95 shadow-md pointer-events-auto cursor-pointer"
            title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play className="w-5 h-5 fill-current text-green-400" /> : <Pause className="w-5 h-5 fill-current text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Responsive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block cursor-crosshair touch-none select-none w-full"
      />

      {/* Helpful hint footer on mobile */}
      <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
        <span className="inline-block px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur border border-slate-700/40 text-[11px] text-slate-400">
          ⚔️ Vuốt hoặc chạm nhanh vào từ vựng để chém
        </span>
      </div>

      {/* Paused Modal */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-20 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mb-3 border border-amber-400/40 animate-pulse">
            <Pause className="w-8 h-8 text-amber-400 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Đang tạm dừng</h3>
          <p className="text-sm text-slate-300 mb-6 max-w-xs">
            Trò chơi đang dừng. Sẵn sàng tiếp tục chém từ vựng Hán ngữ chưa?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={togglePause}
              className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Tiếp tục chơi
            </button>
            <button
              onClick={() => {
                isPausedRef.current = false;
                resetGame();
              }}
              className="w-full py-3 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm transition cursor-pointer"
            >
              Chơi lại từ đầu
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20 text-white p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3 border border-red-500/40">
            <span className="text-3xl">⚔️</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-red-400 mb-2">Trò chơi kết thúc!</h3>
          <p className="text-sm text-slate-300 mb-4">
            Tổng điểm của bạn đạt được:
          </p>
          <div className="text-4xl font-black text-yellow-300 mb-6 font-mono drop-shadow-md">
            {score} ⭐
          </div>
          <button
            onClick={resetGame}
            className="px-8 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white text-sm shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            Chơi lại ngay ⚔️
          </button>
        </div>
      )}
    </div>
  );
}

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('NinjaGame replaced successfully!');
