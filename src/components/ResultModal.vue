<script setup lang="ts">
import { computed } from 'vue'

type Service = { id: string; title: string; logo: string }

const props = defineProps<{
    open: boolean
    service: Service | null
    actionText: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const visible = computed(() => props.open && !!props.service)
</script>

<template>
    <teleport to="body">
        <div v-if="visible" class="backdrop" @click.self="emit('close')">
            <div class="modal" role="dialog" aria-modal="true">
                <div class="modal__top">
                    <img class="modal__logo" :src="service!.logo" :alt="service!.title" />
                </div>

                <div class="result">
                    <div class="result__top">{{ service!.title }} {{ actionText }}! 🎉🥳🎊</div>
                    <div class="result__bottom">Хорошая работа!</div>

                </div>

                <div class="modal__buttons">
                    <button class="btn" type="button" @click="emit('close')">Славненько!</button>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    display: grid;
    place-items: center;
    padding: 16px;
    z-index: 9999;
}

.modal {
    width: min(420px, 100%);
    background: #fff;
    color: #000;
    border-radius: 18px;
    padding: 16px;
    position: relative;
    border: 1px solid rgba(0, 0, 0, .2);
}

.modal__top {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin-bottom: 10px;
}

.modal__logo {
    width: 100%;
}

.result {
    margin: 10px 0 14px;
    text-align: center;
}

.result__top {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 6px;
}

.result__bottom {
    font-size: 16px;
    opacity: 0.6;
}

.modal__buttons {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
}

.btn {
    height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, .25);
    background: rgba(0, 0, 0, .06);
    font-weight: 800;
    font-size: 16px;
    color: #000;
}
</style>