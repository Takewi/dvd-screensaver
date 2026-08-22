/* ==========================================================================
   VAPORWAVE COLOR PALETTES
   ========================================================================== */
const PALETTES = [
  { name: "Neon Magenta", color: "#ff71ce", glow: "rgba(255, 113, 206, 0.75)", jp: "タケウィ ・ ＭＡＧＥＮＴＡ" },
  { name: "Electric Cyan", color: "#01cdfe", glow: "rgba(1, 205, 254, 0.75)", jp: "タケウィ ・ ＣＹＡＮ" },
  { name: "Acid Green", color: "#05ffa1", glow: "rgba(5, 255, 161, 0.75)", jp: "タケウィ ・ ＮＥＯＮ" },
  { name: "Vapor Violet", color: "#b967ff", glow: "rgba(185, 103, 255, 0.75)", jp: "タケウィ ・ ＶＩＯＬＥＴ" },
  { name: "Sunset Gold", color: "#fffb96", glow: "rgba(255, 251, 150, 0.75)", jp: "タケウィ ・ ＳＵＮＳＥＴ" },
  { name: "Hot Coral", color: "#ff5e7e", glow: "rgba(255, 94, 126, 0.75)", jp: "タケウィ ・ ＣＯＲＡＬ" },
  { name: "Cyber Blue", color: "#00f0ff", glow: "rgba(0, 240, 255, 0.75)", jp: "タケウィ ・ ＣＹＢＥＲ" },
  { name: "Dream Pink", color: "#ea80fc", glow: "rgba(234, 128, 252, 0.75)", jp: "タケウィ ・ ＤＲＥＡＭ" }
];

let currentPaletteIndex = 0;
let cornerHits = 0;
let audioEnabled = false;
let vhsEnabled = true;

const dvdContainer = document.getElementById('dvd-container');
const vaporLogo = document.getElementById('vapor-logo');
const logoJpTag = document.querySelector('.logo-jp-tag');
const cornerCountEl = document.getElementById('corner-count');
const cornerCelebrationEl = document.getElementById('corner-celebration');
const crtOverlay = document.getElementById('crt-overlay');
const speedDisplayEl = document.getElementById('speed-display');

/* ==========================================================================
   SYNTHESIZER SOUND ENGINE (Web Audio API)
   Retro 80s FM Synth Bouncing Chimes & Corner Hit Fanfare
   ========================================================================== */
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Notes for harmonic pentatonic scale in vaporwave synth style
const NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function playBounceSound(isCorner = false, speedFactor = 1.0) {
  if (!audioEnabled || !audioCtx) return;

  const now = audioCtx.currentTime;

  if (isCorner) {
    // Glorious synth chord fanfare for corner hit!
    const chordNotes = [523.25, 659.25, 783.99, 1046.50];
    chordNotes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + (i * 0.06));
      
      gain.gain.setValueAtTime(0, now + (i * 0.06));
      gain.gain.linearRampToValueAtTime(0.18, now + (i * 0.06) + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.06) + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + (i * 0.06));
      osc.stop(now + (i * 0.06) + 1.3);
    });
  } else {
    // Pitch shift higher with pinball high speed!
    const baseFreq = NOTES[Math.floor(Math.random() * NOTES.length)] * Math.min(2.2, Math.max(0.8, speedFactor));
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = speedFactor > 1.8 ? 'sawtooth' : 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.01, now); // FM shimmer

    const volume = Math.min(0.35, 0.15 + (speedFactor - 1) * 0.08);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (speedFactor > 2 ? 0.45 : 0.3));

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  }
}

/* ==========================================================================
   DVD & PINBALL PHYSICS LOGIC
   ========================================================================== */
const speedPresets = [
  { name: "Lento", mult: 0.65 },
  { name: "Normal", mult: 1.0 },
  { name: "Rápido", mult: 1.7 },
  { name: "Turbo", mult: 2.8 }
];
let currentSpeedIndex = 1;

let posX = 100;
let posY = 100;
let baseSpeed = 3.5;
let velX = baseSpeed;
let velY = baseSpeed;

let logoWidth = 220;
let logoHeight = 120;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragHistory = []; // Rolling array of {x, y, time} for calculating fling velocity
let lastMousePos = { x: 0, y: 0, time: 0 };
let lastTime = performance.now();

function updatePalette(index = null) {
  if (index === null) {
    currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
  } else {
    currentPaletteIndex = index % PALETTES.length;
  }

  const p = PALETTES[currentPaletteIndex];
  document.documentElement.style.setProperty('--active-color', p.color);
  document.documentElement.style.setProperty('--active-glow', p.glow);
  if (logoJpTag) logoJpTag.textContent = p.jp;

  // Quick squash/stretch animation
  vaporLogo.classList.remove('bounce-pulse');
  void vaporLogo.offsetWidth; // trigger reflow
  vaporLogo.classList.add('bounce-pulse');
}

function triggerCornerCelebration() {
  cornerHits++;
  if (cornerCountEl) cornerCountEl.textContent = cornerHits;
  if (cornerCelebrationEl) cornerCelebrationEl.classList.add('active');
  playBounceSound(true);

  // Particle explosion for corner hit
  createCornerParticles(posX + logoWidth / 2, posY + logoHeight / 2, 50);

  setTimeout(() => {
    if (cornerCelebrationEl) cornerCelebrationEl.classList.remove('active');
  }, 2000);
}

function measureLogo() {
  const rect = dvdContainer.getBoundingClientRect();
  logoWidth = rect.width || 220;
  logoHeight = rect.height || 120;
}

function initPosition() {
  measureLogo();
  const maxX = Math.max(10, window.innerWidth - logoWidth);
  const maxY = Math.max(10, window.innerHeight - logoHeight);
  
  posX = Math.floor(Math.random() * (maxX - 40)) + 20;
  posY = Math.floor(Math.random() * (maxY - 40)) + 20;
  
  const speedMult = speedPresets[currentSpeedIndex].mult;
  velX = (Math.random() > 0.5 ? 1 : -1) * baseSpeed * speedMult;
  velY = (Math.random() > 0.5 ? 1 : -1) * baseSpeed * speedMult;
  
  dvdContainer.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  updatePalette(0);
}

// Spawns spark particles at wall collisions
function spawnWallSparks(x, y, count = 12) {
  const currentSpeed = Math.hypot(velX, velY);
  const sparkCount = Math.min(30, Math.floor(count * (currentSpeed / 4)));
  for (let i = 0; i < sparkCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * (currentSpeed * 0.7) + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: Math.random() * 4 + 2,
      color: PALETTES[currentPaletteIndex].color,
      alpha: 1,
      life: 1
    });
  }
}

// Pinball Main Animation Loop
function animate(now) {
  const dt = Math.min((now - lastTime) / 16.666, 2.5); // normalized frame delta
  lastTime = now;

  if (!isDragging) {
    posX += velX * dt;
    posY += velY * dt;

    const maxX = window.innerWidth - logoWidth;
    const maxY = window.innerHeight - logoHeight;

    let hitX = false;
    let hitY = false;
    let impactX = posX + logoWidth / 2;
    let impactY = posY + logoHeight / 2;

    // Collision detection Left & Right
    if (posX <= 0) {
      posX = 0;
      velX = Math.abs(velX);
      hitX = true;
      impactX = 0;
    } else if (posX >= maxX) {
      posX = maxX;
      velX = -Math.abs(velX);
      hitX = true;
      impactX = maxX + logoWidth;
    }

    // Collision detection Top & Bottom
    if (posY <= 0) {
      posY = 0;
      velY = Math.abs(velY);
      hitY = true;
      impactY = 0;
    } else if (posY >= maxY) {
      posY = maxY;
      velY = -Math.abs(velY);
      hitY = true;
      impactY = maxY + logoHeight;
    }

    const currentSpeed = Math.hypot(velX, velY);
    const targetCruiseSpeed = baseSpeed * speedPresets[currentSpeedIndex].mult;

    // Gentle friction / air resistance when flying at high pinball speeds
    if (currentSpeed > targetCruiseSpeed) {
      const decayFactor = 0.995; // Keeps the high speed fun for several bounces
      velX *= Math.pow(decayFactor, dt);
      velY *= Math.pow(decayFactor, dt);

      // Create glowing speed trail particles behind the logo
      if (Math.random() < 0.6) {
        particles.push({
          x: posX + logoWidth / 2 + (Math.random() - 0.5) * 40,
          y: posY + logoHeight / 2 + (Math.random() - 0.5) * 20,
          vx: -velX * 0.15,
          vy: -velY * 0.15,
          size: Math.random() * 5 + 3,
          color: PALETTES[currentPaletteIndex].color,
          alpha: 0.8,
          life: 1
        });
      }
    } else if (currentSpeed < targetCruiseSpeed * 0.9) {
      // Ensure minimum cruising velocity
      const scale = targetCruiseSpeed / (currentSpeed || 1);
      velX *= scale;
      velY *= scale;
    }

    // Wall impact handling
    if (hitX && hitY) {
      triggerCornerCelebration();
      updatePalette();
    } else if (hitX || hitY) {
      updatePalette();
      const speedFactor = currentSpeed / baseSpeed;
      playBounceSound(false, speedFactor);
      spawnWallSparks(impactX, impactY, 15);
    }

    // Update HUD Speedometer
    if (speedDisplayEl) {
      const kmh = Math.round(currentSpeed * 28);
      speedDisplayEl.textContent = `${kmh} KM/H`;
    }

    dvdContainer.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  }

  requestAnimationFrame(animate);
}

/* ==========================================================================
   INTERACTIVE PINBALL FLING & MOUSE BUMP (REBATIDA)
   ========================================================================== */

// 1. Drag & Fling with Momentum
dvdContainer.addEventListener('pointerdown', (e) => {
  initAudio();
  isDragging = true;
  dragStartX = e.clientX - posX;
  dragStartY = e.clientY - posY;
  dragHistory = [{ x: e.clientX, y: e.clientY, time: performance.now() }];
  dvdContainer.setPointerCapture(e.pointerId);
});

window.addEventListener('pointermove', (e) => {
  const now = performance.now();

  if (isDragging) {
    posX = Math.max(0, Math.min(window.innerWidth - logoWidth, e.clientX - dragStartX));
    posY = Math.max(0, Math.min(window.innerHeight - logoHeight, e.clientY - dragStartY));
    dvdContainer.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

    // Record position history for fling calculation (keep last 120ms)
    dragHistory.push({ x: e.clientX, y: e.clientY, time: now });
    while (dragHistory.length > 0 && now - dragHistory[0].time > 120) {
      dragHistory.shift();
    }
  } else {
    // 2. Mouse Flipper / Slap Collision: If user moves mouse rapidly across logo, kick it!
    if (lastMousePos.time > 0) {
      const dt = now - lastMousePos.time;
      if (dt > 5 && dt < 80) {
        const mouseDx = e.clientX - lastMousePos.x;
        const mouseDy = e.clientY - lastMousePos.y;
        const mouseSpeed = Math.hypot(mouseDx, mouseDy) / dt; // px per ms

        // If mouse is moving fast (> 1.2 px/ms) and intersects with logo bounding box
        if (mouseSpeed > 1.2) {
          if (
            e.clientX >= posX - 20 && e.clientX <= posX + logoWidth + 20 &&
            e.clientY >= posY - 20 && e.clientY <= posY + logoHeight + 20
          ) {
            // Apply pinball kick in mouse swipe direction!
            const impulse = Math.min(32, mouseSpeed * 18);
            const angle = Math.atan2(mouseDy, mouseDx);
            velX = Math.cos(angle) * impulse;
            velY = Math.sin(angle) * impulse;
            
            updatePalette();
            playBounceSound(false, 2.2);
            spawnWallSparks(e.clientX, e.clientY, 25);
          }
        }
      }
    }
    lastMousePos = { x: e.clientX, y: e.clientY, time: now };
  }
});

window.addEventListener('pointerup', (e) => {
  if (isDragging) {
    isDragging = false;
    const now = performance.now();

    // Calculate throw velocity from drag history
    if (dragHistory.length >= 2) {
      const oldest = dragHistory[0];
      const timeDelta = Math.max(16, now - oldest.time);
      const moveX = e.clientX - oldest.x;
      const moveY = e.clientY - oldest.y;

      // High-energy pinball throw velocity multiplier
      let throwVx = (moveX / timeDelta) * 22;
      let throwVy = (moveY / timeDelta) * 22;
      const throwSpeed = Math.hypot(throwVx, throwVy);

      if (throwSpeed > 4) {
        // Cap max throw speed to a thrilling 38px/frame
        const maxSpeed = 38;
        if (throwSpeed > maxSpeed) {
          throwVx = (throwVx / throwSpeed) * maxSpeed;
          throwVy = (throwVy / throwSpeed) * maxSpeed;
        }
        velX = throwVx;
        velY = throwVy;
      } else {
        const speedMult = speedPresets[currentSpeedIndex].mult;
        velX = (Math.random() > 0.5 ? 1 : -1) * baseSpeed * speedMult;
        velY = (Math.random() > 0.5 ? 1 : -1) * baseSpeed * speedMult;
      }
    }

    updatePalette();
    const currentSpeed = Math.hypot(velX, velY);
    playBounceSound(false, currentSpeed / baseSpeed);
    spawnWallSparks(posX + logoWidth / 2, posY + logoHeight / 2, 20);
  }
});

// 3. Screen Click Pinball Pulse (Clique em qualquer lugar para rebater/lançar!)
window.addEventListener('pointerdown', (e) => {
  // If clicked on controls, ignore
  if (e.target.closest('.floating-hud-controls') || e.target.closest('#dvd-container')) return;

  initAudio();

  const clickX = e.clientX;
  const clickY = e.clientY;
  const logoCenterX = posX + logoWidth / 2;
  const logoCenterY = posY + logoHeight / 2;

  const dx = logoCenterX - clickX;
  const dy = logoCenterY - clickY;
  const dist = Math.hypot(dx, dy);

  // Pinball shockwave impulse away from click point
  const angle = Math.atan2(dy, dx);
  const power = Math.max(18, Math.min(35, (window.innerWidth / (dist + 80)) * 25));

  velX = Math.cos(angle) * power;
  velY = Math.sin(angle) * power;

  // Create shockwave effect on click location
  spawnWallSparks(clickX, clickY, 20);
  updatePalette();
  playBounceSound(false, power / 12);
});

window.addEventListener('resize', () => {
  measureLogo();
  posX = Math.min(posX, Math.max(0, window.innerWidth - logoWidth));
  posY = Math.min(posY, Math.max(0, window.innerHeight - logoHeight));
  resizeCanvas();
});

/* ==========================================================================
   BACKGROUND VAPORWAVE RETRO SUN & PERSPECTIVE GRID CANVAS
   ========================================================================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let gridOffset = 0;
let stars = [];
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  stars = [];
  const numStars = Math.floor((canvas.width * canvas.height) / 12000);
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.65),
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005
    });
  }
}

function createCornerParticles(x, y, count = 40) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 6 + 2,
      color: PALETTES[Math.floor(Math.random() * PALETTES.length)].color,
      alpha: 1,
      life: 1
    });
  }
}

function drawBackground(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const horizonY = canvas.height * 0.62;

  // 1. Draw Starfield
  for (let star of stars) {
    star.alpha += Math.sin(time * 0.003 + star.x) * 0.01;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Draw Retro Vaporwave Sun
  const sunRadius = Math.min(canvas.width, canvas.height) * 0.22;
  const sunCenterX = canvas.width / 2;
  const sunCenterY = horizonY;

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunCenterX, sunCenterY, sunRadius, Math.PI, 0, false);
  ctx.closePath();

  const sunGrad = ctx.createLinearGradient(sunCenterX, sunCenterY - sunRadius, sunCenterX, sunCenterY);
  sunGrad.addColorStop(0, '#fffb96');
  sunGrad.addColorStop(0.4, '#ff71ce');
  sunGrad.addColorStop(1, '#b967ff');
  ctx.fillStyle = sunGrad;
  ctx.shadowColor = '#ff71ce';
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.restore();

  // Sun horizontal blinds/stripes
  const numStripes = 7;
  ctx.fillStyle = '#090314';
  for (let i = 0; i < numStripes; i++) {
    const stripeY = sunCenterY - (i * (sunRadius / (numStripes + 2))) - 6;
    const stripeHeight = 2 + (numStripes - i) * 1.5;
    if (stripeY > sunCenterY - sunRadius) {
      ctx.fillRect(sunCenterX - sunRadius - 10, stripeY, (sunRadius + 10) * 2, stripeHeight);
    }
  }

  // 3. Draw Perspective 3D Synthwave Grid on the ground
  ctx.save();
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
  floorGrad.addColorStop(0, '#120422');
  floorGrad.addColorStop(1, '#05010a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

  // Horizon glowing line
  ctx.strokeStyle = '#01cdfe';
  ctx.shadowColor = '#01cdfe';
  ctx.shadowBlur = 15;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(canvas.width, horizonY);
  ctx.stroke();

  // Perspective vertical lines converging to center horizon
  const numLines = 26;
  ctx.strokeStyle = 'rgba(255, 113, 206, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#ff71ce';

  for (let i = -numLines; i <= numLines; i++) {
    const xBottom = (canvas.width / 2) + i * (canvas.width / 16);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, horizonY);
    ctx.lineTo(xBottom, canvas.height);
    ctx.stroke();
  }

  // Moving horizontal lines on the grid
  gridOffset = (gridOffset + 0.8) % 30;
  const numHoriz = 14;
  for (let i = 0; i < numHoriz; i++) {
    const progress = (i + (gridOffset / 30)) / numHoriz;
    const lineY = horizonY + Math.pow(progress, 2.5) * (canvas.height - horizonY);
    const lineAlpha = Math.pow(progress, 1.5);
    ctx.strokeStyle = `rgba(1, 205, 254, ${lineAlpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvas.width, lineY);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Update and Draw Particles / Sparks / Trails
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    p.size *= 0.97;

    if (p.alpha <= 0 || p.size <= 0.4) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(drawBackground);
}

/* ==========================================================================
   VHS TIMECODE & HUD CONTROLS
   ========================================================================== */
const timecodeEl = document.getElementById('timecode');
const startTime = Date.now();

function updateTimecode() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  if (timecodeEl) timecodeEl.textContent = `${hrs}:${mins}:${secs}`;
}
setInterval(updateTimecode, 1000);

// Audio Button
const btnAudio = document.getElementById('btn-audio');
if (btnAudio) {
  btnAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    audioEnabled = !audioEnabled;
    btnAudio.textContent = audioEnabled ? "🔊 Áudio: ON" : "🔇 Áudio: OFF";
    btnAudio.classList.toggle('active', audioEnabled);
    if (audioEnabled) {
      playBounceSound(false);
    }
  });
}

// Speed Button
const btnSpeed = document.getElementById('btn-speed');
if (btnSpeed) {
  btnSpeed.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSpeedIndex = (currentSpeedIndex + 1) % speedPresets.length;
    const sp = speedPresets[currentSpeedIndex];
    btnSpeed.textContent = `⚡ Velocidade: ${sp.name}`;
    
    const dirX = Math.sign(velX) || 1;
    const dirY = Math.sign(velY) || 1;
    velX = dirX * baseSpeed * sp.mult;
    velY = dirY * baseSpeed * sp.mult;
  });
}

// Palette / Color Button
const btnPalette = document.getElementById('btn-palette');
if (btnPalette) {
  btnPalette.addEventListener('click', (e) => {
    e.stopPropagation();
    updatePalette();
    playBounceSound(false);
  });
}

// VHS Filter Button
const btnVhs = document.getElementById('btn-vhs');
if (btnVhs) {
  btnVhs.addEventListener('click', (e) => {
    e.stopPropagation();
    vhsEnabled = !vhsEnabled;
    if (crtOverlay) crtOverlay.style.opacity = vhsEnabled ? "0.85" : "0";
    btnVhs.classList.toggle('active', vhsEnabled);
  });
}

// Fullscreen Button
const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  initPosition();
  requestAnimationFrame(animate);
  requestAnimationFrame(drawBackground);
});
