// stores/settings.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'custom-new-tab-settings'

export const useSettingsStore = defineStore('settings', () => {
    // Основные настройки отображения
    const showSeconds = ref<boolean>(true)
    const enableParallax = ref<boolean>(true)

    // Обои (base64-строки)
    const wallpapers = ref<string[]>([])

    // Пользовательский CSS — применяется к странице новой вкладки
    const customCSS = ref<string>('')

    // ────────────────────────────────────────────────
    // Загрузка сохранённых настроек при инициализации стора
    // ────────────────────────────────────────────────
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            const data = JSON.parse(saved)

            showSeconds.value = typeof data.showSeconds === 'boolean' ? data.showSeconds : true
            enableParallax.value = typeof data.enableParallax === 'boolean' ? data.enableParallax : true
            customCSS.value = typeof data.customCSS === 'string' ? data.customCSS : ''

            wallpapers.value = Array.isArray(data.wallpapers)
                ? data.wallpapers.filter((item: unknown) => typeof item === 'string' && item.startsWith('data:image'))
                : []
        } catch (err) {
            console.warn('Failed to parse saved settings from localStorage', err)
        }
    }
    watch(
        () => ({
            showSeconds: showSeconds.value,
            enableParallax: enableParallax.value,
            customCSS: customCSS.value,
            wallpapers: wallpapers.value,
        }),
        (value) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        },
        { deep: true }
    )

    // ────────────────────────────────────────────────
    // Методы (actions)
    // ────────────────────────────────────────────────
    function setShowSeconds(value: boolean) {
        showSeconds.value = value
    }

    function setEnableParallax(value: boolean) {
        enableParallax.value = value
    }
    function setCustomCSS(value: string) {
        customCSS.value = value
    }

    function addWallpaper(base64: string) {
        if (typeof base64 !== 'string' || !base64.startsWith('data:image')) {
            console.warn('Invalid base64 image string')
            return
        }
        wallpapers.value.push(base64)
    }

    function removeWallpaper(index: number) {
        if (index >= 0 && index < wallpapers.value.length) {
            wallpapers.value.splice(index, 1)
        }
    }

    function setWallpapers(newWallpapers: string[]) {
        wallpapers.value = newWallpapers.filter(
            (item) => typeof item === 'string' && item.startsWith('data:image')
        )
    }

    function clearWallpapers() {
        wallpapers.value = []
    }

    return {
        // состояния
        showSeconds,
        enableParallax,
        customCSS,
        wallpapers,

        // методы
        setShowSeconds,
        setEnableParallax,
        setCustomCSS,
        addWallpaper,
        removeWallpaper,
        setWallpapers,
        clearWallpapers,
    }
})