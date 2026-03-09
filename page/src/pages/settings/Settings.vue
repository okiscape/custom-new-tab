<template>
  <div class="page-wrapper">
    <div class="settings-container">
      <h1>Settings</h1>
      <p class="description">
        Customize your new tab page
      </p>

      <div class="row">
        <!-- Левая колонка -->
        <div class="settings-pad">
          <div class="settings-item toggles">
            <h2 class="section-title">General</h2>

            <label class="toggle-row">
              <span>Show seconds in clock</span>
              <div class="toggle-wrapper">
                <input
                  type="checkbox"
                  :checked="store.showSeconds"
                  @change="store.setShowSeconds($event.target.checked)"
                  id="show-seconds"
                />
                <label for="show-seconds" class="toggle-switch" />
              </div>
            </label>

            <label class="toggle-row">
              <span>Enable parallax effect</span>
              <div class="toggle-wrapper">
                <input
                  type="checkbox"
                  :checked="store.enableParallax"
                  @change="store.setEnableParallax($event.target.checked)"
                  id="parallax"
                />
                <label for="parallax" class="toggle-switch" />
              </div>
            </label>
          </div>
        </div>

        <div class="settings-pad">
          <div class="settings-item wallpapers-section">
            <h2 class="section-title">Wallpapers </h2>
            <div class="wallpapers-grid">
              <label class="wallpaper-add" title="Add wallpaper">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  hidden
                  @change="handleFileSelect"
                />
                <span>+</span>
              </label>

              <div
                v-for="(base64, i) in store.wallpapers"
                :key="i"
                class="wallpaper-item"
                :style="{ backgroundImage: `url(${base64})` }"
                @click="removeWallpaper(i)"
                title="Click to remove"
              />
            </div>
          </div>

          <div class="settings-item custom-css-section">
            <h2 class="section-title">Custom CSS</h2>
            <textarea
              v-model="store.customCSS"
              placeholder="Example:&#10;.bg {filter: blur(5px); opacity: 0.3}"
              class="custom-css-textarea"
              @input="autoResizeTextarea"
              ref="cssTextarea"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const store = useSettingsStore()
const cssTextarea = ref(null)

onMounted(() => {
    const timeout = setTimeout(() => {
        store.setCustomCSS(store.customCSS)
    }, 1000)
    onUnmounted(() => {
        clearTimeout(timeout)
    })
})

const handleFileSelect = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);

  for (const file of fileArray) {
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      store.addWallpaper(base64);
    } catch (err) {
      console.error("Failed to process the file: ", file.name, err);
      alert(`Failed to process the file: ${file.name}`);
    }
  }

  e.target.value = '';
};

const removeWallpaper = (index) => {
  if (!confirm('Remove this wallpaper?')) return
  store.removeWallpaper(index)
}

const autoResizeTextarea = () => {
  const el = cssTextarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

onMounted(() => {
  nextTick(() => {
    autoResizeTextarea()
  })
})
</script>

<style scoped>
.page-wrapper {
  position: fixed;
  inset: 0;
  background: #000;
  color: #e5e5e7;
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  padding: 20px;
  overflow: auto;
}

.settings-container {
  background: rgba(14, 14, 14, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px 40px;
  width: 100%;
  max-width: 860px;
  border: 1px solid rgba(60, 60, 70, 0.4);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

h1 {
  font-size: 2.1rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 8px;
}

.description {
  color: #aaa;
  text-align: center;
  margin: 0 0 36px;
  font-size: 1rem;
}

.row {
  display: flex;
  gap: 48px;
  width: 100%;
}

.settings-pad {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-title {
  font-size: 1.28rem;
  font-weight: 500;
  margin: 0 0 16px;
  color: #d0d0da;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 1.05rem;
}

.toggle-row + .toggle-row {
  border-top: 1px solid #333;
}

.toggle-wrapper {
  position: relative;
}

input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  display: block;
  width: 42px;
  height: 22px;
  background: #444;
  border-radius: 22px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}

input:checked + .toggle-switch {
  background: #fff;
}

input:checked + .toggle-switch::after {
  transform: translateX(20px);
  background: #000;
}

/* Wallpapers */
.wallpapers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.wallpaper-add {
  aspect-ratio: 16 / 9;
  border: 2px dashed #555;
  border-radius: 12px;
  background: #111;
  color: #777;
  font-size: 2.6rem;
  cursor: pointer;
  transition: all 0.18s;
  display: grid;
  place-items: center;
}

.wallpaper-add:hover {
  border-color: #999;
  color: #ccc;
  transform: scale(1.04);
}

.wallpaper-item {
  aspect-ratio: 16 / 9;
  background-size: cover;
  background-size: calc(100% + 10px);
  background-position: center;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.18s;
}

.wallpaper-item:hover {
  border-color: #ff5555;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.no-wallpapers-hint {
  color: #888;
  font-size: 0.92rem;
}

/* Custom CSS */
.custom-css-textarea {
  width: 100%;
  min-height: 140px;
  max-height: 420px;
  padding: 12px 14px;
  background: #0f0f11;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.96rem;
  resize: none;
  overflow: hidden;
  line-height: 1.45;
}

.custom-css-textarea:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(100,100,100,0.3);
}
</style>
