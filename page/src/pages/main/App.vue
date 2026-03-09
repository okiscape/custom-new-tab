<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore';

const settingsStore = useSettingsStore();
const settings = computed(() => ({
  showSeconds: settingsStore.showSeconds,
  enableParallax: settingsStore.enableParallax,
  wallpapers: settingsStore.wallpapers,
  customCSS: settingsStore.customCSS
}));

onMounted(() => {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'custom-new-tab-settings' && e.newValue) {
      try {
        const newData = JSON.parse(e.newValue)
        if (newData === settingsStore.$state) {
          return
        }
        settingsStore.$patch(newData)
      } catch (err) {
        console.error('Incorrect localStorage: ', err)
      }
    }});
  })

const mouse = ref({ x: 0, y: 0 });

watch(
  settingsStore,
  (newCSS) => {
    if (!newCSS) {
      const old = document.getElementById('custom-css');
      if (old) old.remove();
      return;
    }

    let styleEl = document.getElementById('custom-css') as HTMLStyleElement | null;

    if (styleEl) {
      if (styleEl.textContent !== newCSS.customCSS) {
        styleEl.textContent = newCSS.customCSS;
      }
    } else {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-css';
      styleEl.textContent = newCSS.customCSS;
      document.head.appendChild(styleEl);
    }
  },
  { immediate: true }  
);

const onMouseMove = (e: MouseEvent) => {
  if (!settings.value.enableParallax) {
    return
  };

  mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.value.y = (e.clientY / window.innerHeight) * 2 - 1;
};

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
});

const currentWallpaper = ref();
onMounted(() => {
  console.log(settings.value.wallpapers)
  const urls = settings.value.wallpapers.filter(Boolean);
  if (urls.length === 0) {
    console.warn("No wallpapers available in settings store.");
    currentWallpaper.value = null;
  } else {
    currentWallpaper.value = urls[Math.floor(Math.random() * urls.length)];
  }
});

const backgroundStyle = computed(() => {
  if (!settings.value.enableParallax) {
    return {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage: currentWallpaper.value ? `url(${currentWallpaper.value})` : 'none'
    };
  }
  const intensity = 25; 
  const moveX = mouse.value.x * -intensity;
  const moveY = mouse.value.y * -intensity;


  return {
    transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(1.1)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: currentWallpaper.value ? `url(${currentWallpaper.value})` : 'none'
  };
});

const currentDate = ref(new Date());
const hours = computed(() => currentDate.value.getHours().toString().padStart(2, '0'));
const minutes = computed(() => currentDate.value.getMinutes().toString().padStart(2, '0'));
const seconds = computed(() => currentDate.value.getSeconds().toString().padStart(2, '0'));

const timeDigits = computed(() => ({
  hours: hours.value.split(''),
  minutes: minutes.value.split(''),
  seconds: seconds.value.split('')
}));

type TimeBlock = 'hours' | 'minutes' | 'seconds';

const blockOrder = computed<TimeBlock[]>(
    () => {
        if (settings.value.showSeconds) {
            return ['hours', 'minutes', 'seconds'];
        } else {
            return ['hours', 'minutes'];
        }
    }
);
const digitsPerBlock = 2;

const getDigitDelay = (block: TimeBlock, idx: number) => {
  const blockIndex = blockOrder.value.indexOf(block);
  const base = (blockOrder.value.length - blockIndex - 1) * digitsPerBlock;
  const digitOffset = digitsPerBlock - idx - 1;
  return `${(base + digitOffset) * 0.03}s`;
};

const day = computed(() => currentDate.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (currentDate.value.getMonth() + 1).toString().padStart(2, '0'));
const weekday = computed(() => currentDate.value.toLocaleString('en-US', { weekday: 'long' }).toLowerCase());
const year = computed(() => currentDate.value.getFullYear());

onMounted(() => {
  setInterval(() => {
    currentDate.value = new Date();
  }, 1000);
});
</script>

<template>
  <div class="home" :style="settings.customCSS">
    <div class="bg" :style="{...backgroundStyle}"></div>

    <div class="main-container">
      <div class="time">
        <template v-for="block in blockOrder" :key="block">
          <span
            v-for="(digit, idx) in timeDigits[block]"
            :key="`${block}-${idx}`"
            class="digit-wrapper"
            :style="{ '--digit-delay': getDigitDelay(block, idx) }"
          >
            <transition-group name="digit" tag="span" class="digit-stack">
              <span class="digit-char" :key="`${block}-${idx}-${digit}`">
                {{ digit }}
              </span>
            </transition-group>
          </span>
          <span v-if="block !== blockOrder[blockOrder.length - 1]" class="time-divider">:</span>
        </template>
      </div>
      <div class="date">
        <div>{{ weekday }}, {{ day }}.{{ month }}.{{ year }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

:global(html, body) {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #000;
}

.home {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Zalando Sans Expanded', 'Azeret Mono', monospace;
  color: #ffffff;
  overflow: hidden;
}

.bg {
  position: absolute;
  top: -5%;
  left: -5%;
  width: 110%;
  height: 110%;
  background-size: cover;
  background-position: center;
  z-index: 0;
  transition: transform 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  will-change: transform;
}

.main-container {
  position: relative;
  z-index: 1;
  padding: 2rem 4rem;
  text-align: center;
}

.time {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8rem;
  font-weight: bold;
  letter-spacing: 10px;
}

.time-divider {
  color: rgb(102, 102, 102);
  margin-bottom: 15px;
}

.date {
  font-size: 1.8rem;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.digit-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 7.5rem;
  height: 8rem;
  position: relative;
}
.digit-stack {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
.digit-char {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, opacity;
}

.digit-enter-active,
.digit-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  transition-delay: var(--digit-delay, 0s);
}
.digit-enter-from { transform: translateY(-100%); opacity: 0; }
.digit-leave-to { transform: translateY(100%); opacity: 0; }

</style>
