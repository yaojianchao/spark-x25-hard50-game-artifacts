(() => {
  "use strict";

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const W = canvas.width;
  const H = canvas.height;
  const keys = new Set();
  const state = { running: true, score: 0, lives: 3, collected: 0 };
  let ship;
  let stars;
  let asteroids;
  let lastTime = performance.now();
  let touchPoint = null;
  // 可收集星尘（必须为可收集项，初始化即有效）
  let collectedStars = [];

  const random = (min, max) => min + Math.random() * (max - min);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function reset() {
    ship = { x: W / 2, y: H / 2, radius: 16, speed: 230 };
    // 可收集星尘：必须为可收集项，初始化即有效，收集后从数组移除
    collectedStars = Array.from({ length: 35 }, () => ({
      x: random(24, W - 24), y: random(80, H - 24), radius: random(3, 6), phase: random(0, 7),
    }));
    stars = collectedStars;
    asteroids = Array.from({ length: 7 }, () => ({
      x: random(30, W - 30), y: random(90, H - 30), radius: random(13, 23),
      vx: random(-50, 50), vy: random(-50, 50), hit: 0,
    }));
    state.running = true;
    state.score = 0;
    state.lives = 3;
    state.collected = 0;
    overlay.style.display = "none";
    updateHud();
  }

  function updateHud() {
    document.getElementById("score").textContent = state.score;
    document.getElementById("stars").textContent = state.collected;
    document.getElementById("lives").textContent = state.lives;
  }

  function direction() {
    let x = 0;
    let y = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) x += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) y -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) y += 1;
    if (touchPoint) { x += touchPoint.x; y += touchPoint.y; }
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length };
  }

  function endGame(message = "飞船受损，任务结束") {
    state.running = false;
    document.getElementById("overlay-title").textContent = message;
    document.getElementById("overlay-subtitle").textContent = "点击重新开始，再来一局";
    document.getElementById("stat-score").textContent = state.score;
    document.getElementById("stat-stars").textContent = state.collected;
    document.getElementById("stat-lives").textContent = state.lives;
    overlay.style.display = "flex";
  }

  function update(dt) {
    if (!state.running) return;
    const d = direction();
    ship.x = clamp(ship.x + d.x * ship.speed * dt, ship.radius, W - ship.radius);
    ship.y = clamp(ship.y + d.y * ship.speed * dt, 70 + ship.radius, H - ship.radius);
    for (const asteroid of asteroids) {
      asteroid.x += asteroid.vx * dt;
      asteroid.y += asteroid.vy * dt;
      if (asteroid.x < -asteroid.radius) asteroid.x = W + asteroid.radius;
      if (asteroid.x > W + asteroid.radius) asteroid.x = -asteroid.radius;
      if (asteroid.y < 70 - asteroid.radius) asteroid.y = H + asteroid.radius;
      if (asteroid.y > H + asteroid.radius) asteroid.y = 70 - asteroid.radius;
      asteroid.hit = Math.max(0, asteroid.hit - dt);
    }
    // 遍历可收集星尘，做碰撞并移除已收集项
    for (let i = 0; i < collectedStars.length; i += 1) {
      const star = collectedStars[i];
      if (distance(ship, star) < ship.radius + star.radius) {
        stars.splice(i, 1);
        state.collected += 1;
        state.score += 100;
      }
    }
    for (const asteroid of asteroids) {
      if (asteroid.hit === 0 && distance(ship, asteroid) < ship.radius + asteroid.radius) {
        asteroid.hit = 1;
        state.lives -= 1;
        if (state.lives <= 0) endGame();
        break;
      }
    }
    updateHud();
    if (stars.length === 0) endGame("你收集了全部星尘！");
  }

  function render(now) {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#0a1030");
    gradient.addColorStop(1, "#05060f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(127, 208, 255, .18)";
    ctx.strokeRect(1, 65, W - 2, H - 66);
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = `rgba(180,220,255,${0.15 + (i % 5) / 20})`;
      ctx.fillRect((i * 83) % W, 70 + ((i * 47) % (H - 70)), 2, 2);
    }
    for (const star of stars) {
      const glow = 0.65 + 0.35 * Math.sin(now / 300 + star.phase);
      ctx.fillStyle = `rgba(140,220,255,${glow})`;
      ctx.shadowColor = "#7fd0ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    for (const asteroid of asteroids) {
      ctx.fillStyle = asteroid.hit ? "#ff8f8f" : "#856c86";
      ctx.beginPath();
      ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d2a3c5";
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.fillStyle = "#7fd0ff";
    ctx.shadowColor = "#7fd0ff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 13);
    ctx.lineTo(0, 8);
    ctx.lineTo(-14, 13);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render(now);
    requestAnimationFrame(frame);
  }

  function setTouch(event) {
    const touch = event.touches[0];
    if (!touch) { touchPoint = null; return; }
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width * W;
    const y = (touch.clientY - rect.top) / rect.height * H;
    const dx = x - ship.x;
    const dy = y - ship.y;
    const length = Math.hypot(dx, dy) || 1;
    touchPoint = { x: dx / length, y: dy / length };
  }

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
    if (!state.running && (event.code === "Space" || event.code === "Enter")) reset();
    keys.add(event.code);
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  canvas.addEventListener("touchstart", (event) => { event.preventDefault(); setTouch(event); }, { passive: false });
  canvas.addEventListener("touchmove", (event) => { event.preventDefault(); setTouch(event); }, { passive: false });
  canvas.addEventListener("touchend", (event) => { event.preventDefault(); touchPoint = null; }, { passive: false });
  document.getElementById("restart-btn").addEventListener("click", reset);
  reset();
  requestAnimationFrame(frame);
})();
