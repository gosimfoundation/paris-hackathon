<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

// ============ 6. Scroll progress bar ============
const scrollProgress = ref(0)
function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  scrollProgress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
}

// ============ 7. Cursor glow ============
const cursorX = ref(-500)
const cursorY = ref(-500)
function onMouseMove(e: MouseEvent) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}

// ============ 3. Particles ============
const canvasRef = ref<HTMLCanvasElement | null>(null)
const particles: { x: number; y: number; vx: number; vy: number; char: string; life: number }[] = []
const chars = ['0', '1', '{', '}', '<', '>', '/', '*', 'λ', '∇', '→', '⚡']
let mouseX = 0, mouseY = 0, rafId = 0

function particleLoop() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Spawn particles near cursor when in hero area
  if (mouseY < window.innerHeight * 0.8 && Math.random() < 0.3 && particles.length < 40) {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.3 + Math.random() * 0.8
    particles.push({
      x: mouseX + (Math.random() - 0.5) * 40,
      y: mouseY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3,
      char: chars[Math.floor(Math.random() * chars.length)],
      life: 1,
    })
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.012
    if (p.life <= 0) { particles.splice(i, 1); continue }
    ctx.font = '12px "JetBrains Mono", monospace'
    ctx.fillStyle = `rgba(212, 160, 23, ${p.life * 0.6})`
    ctx.fillText(p.char, p.x, p.y)
  }

  rafId = requestAnimationFrame(particleLoop)
}

function onMouseMoveParticle(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

// ============ 5. Konami code ============
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const konamiProgress = ref<string[]>([])
const konamiActive = ref(false)

function onKeydown(e: KeyboardEvent) {
  const key = e.key
  konamiProgress.value = [...konamiProgress.value, key].slice(-konamiSequence.length)
  if (konamiProgress.value.join(',').toLowerCase() === konamiSequence.join(',').toLowerCase()) {
    triggerKonami()
  }
}

function triggerKonami() {
  konamiActive.value = true
  // Big confetti burst
  const end = Date.now() + 3000
  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#E94B7E', '#3B82F6', '#22C55E', '#d4a017', '#ffffff'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#E94B7E', '#3B82F6', '#22C55E', '#d4a017', '#ffffff'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  setTimeout(() => { konamiActive.value = false }, 3500)
}

// ============ 1. Confetti on CTA ============
function onCtaClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const cta = target.closest('.hero-cta, .confetti-trigger')
  if (!cta) return
  const rect = cta.getBoundingClientRect()
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    colors: ['#E94B7E', '#3B82F6', '#22C55E', '#d4a017', '#ffffff'],
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousemove', onMouseMoveParticle, { passive: true })
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onCtaClick, { capture: true })
  rafId = requestAnimationFrame(particleLoop)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousemove', onMouseMoveParticle)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onCtaClick, { capture: true } as any)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <!-- Scroll progress -->
  <div class="fx-scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

  <!-- Cursor glow -->
  <div class="fx-cursor-glow" :style="{ transform: `translate(${cursorX}px, ${cursorY}px)` }"></div>

  <!-- Particles canvas -->
  <canvas ref="canvasRef" class="fx-particles"></canvas>

  <!-- Konami flash -->
  <div v-if="konamiActive" class="fx-konami-flash">
    <div class="fx-konami-text">⚡ DEVELOPER MODE ⚡</div>
  </div>
</template>

<style>
.fx-scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #d4a017 0%, #E94B7E 50%, #3B82F6 100%);
  z-index: 9999;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 8px rgba(212, 160, 23, 0.6);
  pointer-events: none;
}

.fx-cursor-glow {
  position: fixed;
  top: -200px;
  left: -200px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 160, 23, 0.08) 0%, rgba(212, 160, 23, 0) 60%);
  pointer-events: none;
  z-index: 40;
  will-change: transform;
  mix-blend-mode: screen;
}
@media (hover: none) {
  .fx-cursor-glow { display: none; }
}

.fx-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 35;
}
@media (hover: none) {
  .fx-particles { display: none; }
}

.fx-konami-flash {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: fx-konami-pulse 3.5s ease-out;
}
.fx-konami-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 3rem;
  font-weight: 700;
  color: #d4a017;
  text-shadow: 0 0 30px rgba(212, 160, 23, 0.8), 0 0 60px rgba(212, 160, 23, 0.4);
  letter-spacing: 0.2em;
  animation: fx-konami-shake 0.15s ease-in-out infinite alternate;
}
@keyframes fx-konami-pulse {
  0%, 100% { opacity: 0; }
  10%, 85% { opacity: 1; }
}
@keyframes fx-konami-shake {
  0% { transform: translate(-2px, 0); }
  100% { transform: translate(2px, 0); }
}

/* Glitch text on hover (for .glitch-hover class) */
.glitch-hover {
  position: relative;
  display: inline-block;
  transition: color 0.15s;
}
.glitch-hover:hover {
  color: transparent;
  text-shadow:
    2px 0 0 #E94B7E,
    -2px 0 0 #3B82F6;
  animation: fx-glitch-shake 0.25s steps(4) infinite;
}
@keyframes fx-glitch-shake {
  0% { transform: translate(0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
  100% { transform: translate(0); }
}
</style>
