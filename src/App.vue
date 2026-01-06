<!-- App.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getTg } from './tg'

type Service = { id: string; title: string; logo: string }
type Action = 'block' | 'slow'

const tg = ref<any>(null)

// Логотипы из /src/assets (оставил под твои service-logo-*.jpg)
const services = ref<Service[]>([
  { id: 'youtube', title: 'YouTube', logo: new URL('./assets/service-logo-1.jpg', import.meta.url).toString() },
  { id: 'whatsapp', title: 'WhatsApp', logo: new URL('./assets/service-logo-2.jpg', import.meta.url).toString() },
  { id: 'telegram', title: 'Telegram', logo: new URL('./assets/service-logo-3.jpg', import.meta.url).toString() },
  { id: 'tiktok', title: 'TikTok', logo: new URL('./assets/service-logo-4.jpg', import.meta.url).toString() },
  { id: 'spotify', title: 'Spotify', logo: new URL('./assets/service-logo-5.jpg', import.meta.url).toString() },
  { id: 'netflix', title: 'Netflix', logo: new URL('./assets/service-logo-6.jpg', import.meta.url).toString() },
  { id: 'reddit', title: 'Reddit', logo: new URL('./assets/service-logo-7.jpg', import.meta.url).toString() },
  { id: 'pinterest', title: 'Pinterest', logo: new URL('./assets/service-logo-8.jpg', import.meta.url).toString() },
  { id: 'linkedin', title: 'LinkedIn', logo: new URL('./assets/service-logo-9.jpg', import.meta.url).toString() },
  { id: 'x', title: 'X', logo: new URL('./assets/service-logo-10.jpg', import.meta.url).toString() },
  { id: 'dropbox', title: 'Dropbox', logo: new URL('./assets/service-logo-11.jpg', import.meta.url).toString() },
  { id: 'zoom', title: 'Zoom', logo: new URL('./assets/service-logo-12.jpg', import.meta.url).toString() },
  { id: 'twitch', title: 'Twitch', logo: new URL('./assets/service-logo-13.jpg', import.meta.url).toString() },
  { id: 'onedrive', title: 'OneDrive', logo: new URL('./assets/service-logo-14.jpg', import.meta.url).toString() },
  { id: 'googledrive', title: 'Google Drive', logo: new URL('./assets/service-logo-15.jpg', import.meta.url).toString() },
  { id: 'discord', title: 'Discord', logo: new URL('./assets/service-logo-16.jpg', import.meta.url).toString() },
])

// Слайдер (управляется только кнопкой "крутить")
const index = ref(0)
const isSpinning = ref(false)

const slideW = 96
const gap = 12

const trackX = computed(() => {
  const x = (slideW + gap) * index.value
  return `translateX(calc(50% - ${slideW / 2}px - ${x}px)) translateY(-50%)`
})

function clampIndex(i: number) {
  const n = services.value.length
  return ((i % n) + n) % n
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Модалки
const showPickModal = ref(false)
const showResultModal = ref(false)

const picked = ref<Service | null>(null)
const pickedAction = ref<Action | null>(null)

const actionText = computed(() => {
  if (!pickedAction.value) return ''
  return pickedAction.value === 'block' ? 'заблокирован' : 'замедлен'
})

function openPickModal(service: Service) {
  picked.value = service
  pickedAction.value = null
  showPickModal.value = true
}

function openResult(action: Action) {
  pickedAction.value = action
  showPickModal.value = false
  showResultModal.value = true
}

function closeAll() {
  showPickModal.value = false
  showResultModal.value = false
}

// Анимация: ~5 секунд на одну "крутилку"
function spin() {
  if (isSpinning.value) return
  const n = services.value.length
  if (!n) return

  isSpinning.value = true

  // Настройки под ~5 сек
  const totalMs = 5000
  const baseDelay = 14 // стартовая скорость
  const endDelay = 120 // финальная скорость
  const steps = randInt(n * 6, n * 8) // сколько раз щёлкнуть

  const target = clampIndex(index.value + steps)

  let step = 0
  let timer: number | null = null

  const tick = () => {
    index.value = clampIndex(index.value + 1)
    step += 1

    const t = Math.min(1, step / steps)
    const delay = Math.round(baseDelay + (endDelay - baseDelay) * t * t) // ease-out

    if (step < steps) {
      timer = window.setTimeout(tick, delay)
      return
    }

    index.value = target

    window.setTimeout(() => {
      isSpinning.value = false
      openPickModal(services.value[index.value])
    }, 220)
  }

  // Подгон длительности ближе к totalMs (простая коррекция)
  // Если steps мало/много - эта коррекция держит около 5 сек.
  const avgDelay = totalMs / steps
  const k = avgDelay / ((baseDelay + endDelay) / 2)

  const baseDelay2 = Math.max(8, Math.round(baseDelay * k))
  const endDelay2 = Math.max(baseDelay2 + 20, Math.round(endDelay * k))

  // переписываем стартовые значения (чтобы реально работало)
  // (локально, без реактивности)
  const _base = baseDelay2
  const _end = endDelay2

  step = 0
  const tick2 = () => {
    index.value = clampIndex(index.value + 1)
    step += 1

    const t = Math.min(1, step / steps)
    const delay = Math.round(_base + (_end - _base) * t * t)

    if (step < steps) {
      window.setTimeout(tick2, delay)
      return
    }

    index.value = target
    window.setTimeout(() => {
      isSpinning.value = false
      openPickModal(services.value[index.value])
    }, 220)
  }

  timer && window.clearTimeout(timer)
  window.setTimeout(tick2, _base)
}

// Telegram Mini App (опционально)
onMounted(() => {
  tg.value = getTg()
  if (!tg.value) return
  tg.value.ready?.()
  tg.value.expand?.()
  tg.value.setHeaderColor?.('bg_color')
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Выбери, какой сервис заблокируют следующим</h1>
      <p class="subtitle">Демо-игра. Ничего не сохраняется.</p>
    </header>

    <section class="slider">
      <div class="viewport" :class="{ spinning: isSpinning }">
        <div class="pointer" aria-hidden="true"></div>

        <div class="track" :style="{ transform: trackX }">
          <div
            v-for="(s, i) in services"
            :key="s.id"
            class="card"
            :class="{ active: i === index }"
          >
            <img class="logo" :src="s.logo" :alt="s.title" />
            <div class="label">{{ s.title }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="actions">
      <button class="spin" type="button" @click="spin" :disabled="isSpinning">
        {{ isSpinning ? 'Крутится...' : 'Крутить' }}
      </button>
    </section>

    <!-- Модалки -->
    <teleport to="body">
      <div v-if="showPickModal || showResultModal" class="backdrop" @click.self="closeAll">
        <!-- Модалка 1: выбор действия -->
        <div v-if="showPickModal && picked" class="modal" role="dialog" aria-modal="true">
          <div class="modal__top">
            <img class="modal__logo" :src="picked.logo" :alt="picked.title" />
            <div class="modal__title">
              Выпало: <b>{{ picked.title }}</b>
            </div>
          </div>

          <div class="modal__text">Что делаем?</div>

          <div class="modal__buttons">
            <button class="btn danger" type="button" @click="openResult('block')">Заблокировать</button>
            <button class="btn warn" type="button" @click="openResult('slow')">Замедлить</button>
          </div>

          <button class="close" type="button" @click="closeAll" aria-label="Закрыть">×</button>
        </div>

        <!-- Модалка 2: результат -->
        <div v-if="showResultModal && picked" class="modal" role="dialog" aria-modal="true">
          <div class="modal__top">
            <img class="modal__logo" :src="picked.logo" :alt="picked.title" />
            <div class="modal__title">
              <b>{{ picked.title }}</b> {{ actionText }}
            </div>
          </div>

          <div class="result">
            <div class="result__emoji">🎉🥳🎊</div>
            <div class="result__text">
              {{ picked.title }} {{ actionText }}!
            </div>
          </div>

          <div class="modal__buttons">
            <button class="btn" type="button" @click="closeAll">Ок</button>
            <button class="btn" type="button" @click="closeAll; spin()" :disabled="isSpinning">Ещё раз</button>
          </div>

          <button class="close" type="button" @click="closeAll" aria-label="Закрыть">×</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.app{
  min-height: 100vh;
  padding: 16px;
  background: #ffea00;
  color: #000;
}

.header{ margin-bottom: 14px; }
.title{
  font-size: 18px;
  line-height: 1.2;
  margin: 0 0 6px;
}
.subtitle{
  margin: 0;
  font-size: 12px;
  opacity: .75;
}

.slider{ margin: 14px 0 10px; }

.viewport{
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,.25);
  border-radius: 14px;
  background: rgba(255,255,255,.45);
  height: 140px;

  /* нельзя крутить руками */
  user-select: none;
  pointer-events: none;
}

.pointer{
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid rgba(0,0,0,.6);
  z-index: 2;
}

.track{
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  will-change: transform;
  transition: transform 140ms linear;
}

/* во время крутилки чуть быстрее визуально щёлкает */
.viewport.spinning .track{
  transition: transform 90ms linear;
}

.card{
  width: 96px;
  flex: 0 0 96px;
  border: 1px solid rgba(0,0,0,.2);
  border-radius: 14px;
  background: rgba(255,255,255,.7);
  padding: 10px;
  display: grid;
  gap: 8px;
  align-content: start;
  text-align: center;
}

.card.active{
  outline: 3px solid rgba(0,0,0,.75);
  background: rgba(255,255,255,.9);
}

.logo{
  width: 100%;
  height: 64px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(0,0,0,.04);
}

.label{
  font-size: 12px;
  font-weight: 700;
}

.actions{
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.spin{
  width: 100%;
  max-width: 360px;
  height: 44px;
  border: 1px solid rgba(0,0,0,.35);
  background: #000;
  color: #fff;
  border-radius: 14px;
  font-weight: 800;
}

.spin:disabled{ opacity: .7; }

.backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 9999;
}

.modal{
  width: min(420px, 100%);
  background: #fff;
  color: #000;
  border-radius: 18px;
  padding: 16px;
  position: relative;
  border: 1px solid rgba(0,0,0,.2);
}

.modal__top{
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.modal__logo{
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 14px;
  background: rgba(0,0,0,.04);
  border: 1px solid rgba(0,0,0,.08);
}

.modal__title{
  font-size: 14px;
  line-height: 1.2;
}

.modal__text{
  font-size: 13px;
  opacity: .85;
  margin-bottom: 12px;
}

.modal__buttons{
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.btn{
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.25);
  background: rgba(0,0,0,.06);
  font-weight: 800;
}

.btn.danger{
  background: #ff3b30;
  color: #fff;
  border-color: rgba(0,0,0,.15);
}

.btn.warn{
  background: #ffcc00;
  color: #000;
}

.close{
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,.2);
  background: rgba(0,0,0,.06);
  font-size: 20px;
  line-height: 1;
}

.result{
  margin: 10px 0 14px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(0,0,0,.06);
  text-align: center;
}

.result__emoji{
  font-size: 26px;
  margin-bottom: 6px;
}

.result__text{
  font-size: 14px;
  font-weight: 800;
}
</style>