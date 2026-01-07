<!-- src/App.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getTg } from './tg'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

// Components
import PickActionModal from './components/PickActionModal.vue'
import ResultModal from './components/ResultModal.vue'

type Service = { id: string; title: string; logo: string }
type Action = 'block' | 'slow'

const tg = ref<any>(null)
const appVersion = __APP_VERSION__

const services: Service[] = [
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
]

// ======= КЛЮЧЕВОЕ ИЗМЕНЕНИЕ =======
// Делаем большой список (без loop), чтобы можно было “крутить” сколько угодно.
const repeats = 220 // 220 * 16 = 3520 слайдов
const duration = 10000 // длительность спина в мс
const bigList = computed<Service[]>(() =>
  Array.from({ length: services.length * repeats }, (_, i) => services[i % services.length]),
)

// Стартуем где-то в середине, чтобы был запас “влево/вправо”
const startIndex = services.length * Math.floor(repeats / 2) // середина

const swiper = ref<SwiperType | null>(null)
const isReady = ref(false)
const isSpinning = ref(false)

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Нормализация позиции: если мы близко к концу огромного массива — переносим в середину (без анимации)
// так, чтобы “реальный” сервис по центру остался тем же.
function normalizePosition() {
  const s = swiper.value
  if (!s) return

  const n = services.length
  const cur = s.activeIndex
  const real = cur % n

  const safeLeft = n * 20
  const safeRight = bigList.value.length - n * 20

  if (cur < safeLeft || cur > safeRight) {
    const next = startIndex + real
    s.slideTo(next, 0, false)
  }
}

// Основной спин: едем ВПЕРЕД на много шагов за 5 секунд
function spin() {
  const s = swiper.value
  if (!s || !isReady.value || isSpinning.value) return

  // если близко к краю - сразу нормализуем (не заметно)
  normalizePosition()

  isSpinning.value = true

  const n = services.length

  const loops = randInt(2, 3) // сколько кругов
  const offset = randInt(0, n - 1) // добивка
  const steps = loops * n + offset

  const from = s.activeIndex
  const to = from + steps

  s.slideTo(to, duration, true)

  window.setTimeout(() => {
    isSpinning.value = false

    const idx = s.activeIndex % n
    openPickModal(services[idx])

    // пока модалка на экране - можно спокойно нормализовать (чтобы следующий спин был всегда ок)
    setTimeout(() => normalizePosition(), 0)
  }, duration)
}

// ======= MODALS =======
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

function closePick() {
  showPickModal.value = false
}

function onPickAction(action: Action) {
  pickedAction.value = action
  showPickModal.value = false
  showResultModal.value = true
}

function closeResult() {
  showResultModal.value = false
}

// Swiper init
function onSwiperInit(inst: SwiperType) {
  swiper.value = inst
  requestAnimationFrame(() => {
    inst.update()
    inst.slideTo(startIndex, 0, false)
    isReady.value = true
  })
}

function isTelegramWebApp() {
  const w = window as any
  const wa = w.Telegram?.WebApp
  if (!wa) return false

  // главный признак: initData (в браузере обычно пусто)
  if (typeof wa.initData === 'string' && wa.initData.length > 0) return true

  // fallback: по userAgent (на некоторых сборках initData может быть пустым)
  const ua = navigator.userAgent || ''
  return ua.includes('Telegram')
}

// Telegram WebApp (optional)
const isTelegram = ref(false)

onMounted(() => {
  const devBypass = import.meta.env.DEV && import.meta.env.VITE_TG_DEV === '1'
  isTelegram.value = isTelegramWebApp() || devBypass

  if (!isTelegram.value) return

  tg.value = (window as any).Telegram?.WebApp
  tg.value?.ready?.()
  tg.value?.expand?.()
  tg.value?.setHeaderColor?.('bg_color')
})
</script>

<template>
  <div class="app">
    <template v-if="isTelegram">
      <header class="header">
        <img class="gerb" src="./assets/gerb.png" alt="">
        <h1 class="title">Выбери, какой сервис<br> заблокируют следующим</h1>
        <p class="subtitle">
          Дамы и господа, да начнется 74 пакет блокировок… выиграет сильнейший и пусть удача всегда будет на вашей
          стороне!
        </p>
      </header>

      <section class="slider">
        <div class="viewport">
          <div class="pointer" aria-hidden="true"></div>

          <Swiper class="swiper" :loop="false" :centered-slides="true" :slides-per-view="3" :space-between="12"
            :allow-touch-move="false" :speed="duration" @swiper="onSwiperInit">
            <SwiperSlide v-for="(item, i) in bigList" :key="`${item.id}-${i}`">
              <div class="card">
                <img class="logo" :src="item.logo" :alt="item.title" />
                <div class="label">{{ item.title }}</div>
              </div>
            </SwiperSlide>
          </Swiper>

          <div class="fade left" aria-hidden="true"></div>
          <div class="fade right" aria-hidden="true"></div>
        </div>
      </section>

      <section class="actions">
        <button class="spin" type="button" @click="spin" :disabled="isSpinning || !isReady">
          <span>{{ !isReady ? 'Загрузка...' : isSpinning ? 'Крутится...' : 'Крутить' }}</span>
        </button>
      </section>

      <PickActionModal :open="showPickModal" :service="picked" @close="closePick" @pick="onPickAction" />

      <ResultModal :open="showResultModal" :service="picked" :actionText="actionText" @close="closeResult" />
    </template>

    <template v-else>
      <div class="stub">
        <img class="gerb" src="./assets/gerb.png" alt="">
        <h1 class="title">Открой в Telegram</h1>
        <p class="subtitle">
          Это Telegram Mini App. Открой ссылку через бота/кнопку внутри Telegram.
        </p>
      </div>
    </template>
  </div>
  <div class="version">v{{ appVersion }}</div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 16px;
  background: #101010;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header {
  margin-bottom: 30px;
}

.gerb {
  display: block;
  width: 100%;
  max-width: 70px;
  margin: 0 auto 20px;
}

.title {
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  margin: 0 0 20px;
  text-align: center;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  opacity: .75;
  text-align: center;
  max-width: 270px;
  margin: 0 auto;
}

.slider {
  margin: 14px 0 10px;
}

.viewport {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.166);
  height: 160px;
  user-select: none;
  border-top: 3px solid red;
  border-bottom: 3px solid red;
}

.pointer {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid rgb(255, 0, 0);
  z-index: 5;
}

.swiper {
  height: 160px;
  padding: 18px 10px 14px;
}

.card {
  width: 110px;
  margin: 0 auto;
  border-radius: 14px;
  background: rgba(255, 255, 255, .7);
  padding: 10px;
  display: grid;
  gap: 8px;
  text-align: center;
  transform: scale(.92);
  transition: transform 180ms ease, background 180ms ease;
  color: #000;
}

:deep(.swiper-slide-active) .card {
  transform: scale(1);
  background: rgba(255, 255, 255, .92);
  outline: 3px solid rgba(255, 0, 0, 0.75);
}

.logo {
  width: 100%;
  height: 64px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(0, 0, 0, .04);
}

.label {
  font-size: 12px;
  font-weight: 700;
}

.fade {
  position: absolute;
  top: 0;
  width: 56px;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.fade.left {
  left: 0;
  background: linear-gradient(to right, rgb(16, 16, 16), rgba(255, 234, 0, 0));
}

.fade.right {
  right: 0;
  background: linear-gradient(to left, rgb(16, 16, 16), rgba(255, 234, 0, 0));
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.spin {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 44px;
  border: none;
  color: #ffffff;
  border-radius: 14px;
  font-weight: 800;
  overflow: hidden;
}

.spin span {
  position: relative;
  z-index: 3;
}

.spin::before {
  content: "";
  position: absolute;
  background: url('./assets/flag.jpg') no-repeat center center;
  transform: rotate(45deg);
  top: -70px;
  left: -70px;
  width: 600px;
  height: 300px;
}

.spin:disabled {
  opacity: .7;
}

.stub {
  min-height: 60vh;
  display: grid;
  align-content: center;
  gap: 14px;
  text-align: center;
}

.version{
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 15px;
  font-size: 11px;
  color: #fff;
  opacity: .45;
}
</style>