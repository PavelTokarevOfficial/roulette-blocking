<!-- src/components/PickActionModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'

type Service = { id: string; title: string; logo: string }
type Action = 'block' | 'slow'

const props = defineProps<{
    open: boolean
    service: Service | null
}>()

const emit = defineEmits<{
    (e: 'pick', action: Action): void
}>()

const visible = computed(() => props.open && !!props.service)
</script>

<template>
    <teleport to="body">
        <div v-if="visible" class="backdrop">
            <div class="modal" role="dialog" aria-modal="true">
                <div class="modal__top">
                    <img class="modal__logo" :src="service!.logo" :alt="service!.title" />
                    <div class="modal__title">{{ service!.title }}</div>
                </div>

                <div class="modal__buttons">
                    <button class="btn danger" type="button" @click="emit('pick', 'block')">Заблокировать</button>
                    <button class="btn warn" type="button" @click="emit('pick', 'slow')">Замедлить</button>
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
    margin-bottom: 20px;
}

.modal__logo {
    width: 100%;
}

.modal__title {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
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
}

.btn.danger {
    background: #ff3b30;
    color: #fff;
    border-color: rgba(0, 0, 0, .15);
}

.btn.warn {
    background: #ffcc00;
    color: #000;
}
</style>