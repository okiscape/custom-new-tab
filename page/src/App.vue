<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTodoStore } from './stores/todo';

const store = useTodoStore();
const newTodo = ref('');
const completedLetters = computed(() => "there's no todos yet".split(''));

const wallpaperModules = import.meta.glob('@/assets/wallpapers/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
  import: 'default',
  as: 'url'
})

const wallpaperUrls = Object.values(wallpaperModules) as string[]

const randomWallpaper = wallpaperUrls[Math.floor(Math.random() * wallpaperUrls.length)]

document.documentElement.style.setProperty('--bg-url', `url(${randomWallpaper})`);

var currentDate = ref(new Date());

var hours = computed(() => currentDate.value.getHours().toString().padStart(2, '0'));
var minutes = computed(() => currentDate.value.getMinutes().toString().padStart(2, '0'));
var seconds = computed(() => currentDate.value.getSeconds().toString().padStart(2, '0'));

const timeDigits = computed(() => ({
  hours: hours.value.split(''),
  minutes: minutes.value.split(''),
  seconds: seconds.value.split(''),
}));

const blockOrder = ['hours', 'minutes', 'seconds'] as const;
type TimeBlock = (typeof blockOrder)[number];
const digitsPerBlock = 2;

const getDigitDelay = (block: TimeBlock, idx: number) => {
  const blockIndex = blockOrder.indexOf(block);
  const base = (blockOrder.length - blockIndex - 1) * digitsPerBlock;
  const digitOffset = digitsPerBlock - idx - 1;
  return `${(base + digitOffset) * 0.03}s`;
};


var day = computed(() => currentDate.value.getDate().toString().padStart(2, '0'));
var month = computed(() => (currentDate.value.getMonth() + 1).toString().padStart(2, '0'));

var weekday = computed(() => (currentDate.value.toLocaleString('default', { weekday: 'long' }).toLowerCase()));
var year = computed(() => currentDate.value.getFullYear().toString().padStart(2, '0'));

onMounted(() => {
  setInterval(() => {
    currentDate.value = new Date();
  }, 100);
});

</script>

<template>
  <div class="home">
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
          <span v-if="block !== 'seconds'" class="time-divider">:</span>
        </template>
      </div>
      <div class="date">
        <div>{{ weekday }}, {{ day }}.{{ month }}.{{ year }}</div>
      </div>

      <div class="todo-container">
        <input v-model="newTodo"  @keyup.enter="store.add(newTodo); newTodo = '';" />
        
        <v-if v-if="store.todoList.length === 0">
          <p class="completed-message">
            <span
              v-for="(char, i) in completedLetters"
              :key="i"
              class="completed-letter"
              :style="{ animationDelay: `${i * 100}ms` }"
            >
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </p>
        </v-if>
        <v-else>
          <p
            v-for="(item, index) in store.todoList"
            :key="index"
            @click="store.remove(index)"
            class="todo"
          >
            {{ item }}
          </p>
        </v-else>
      </div>
    </div>
  </div>
</template>

<style>
input {
  text-align: center;
  font-family: 'Azeret Mono', monospace;
  padding: 0.5rem; border-radius: 0.5rem;
  border: none;
  background-color: #000;
  color: #ffffff;

  margin-bottom: 1rem;
  width: 200px; font-size: 1rem;
}

.time {
  display: flex; justify-content: center; align-items: center;
  font-size: 5rem;
  font-weight: bold;
  letter-spacing: 10px;
}

.digit-wrapper {
  display: inline-flex;
  justify-content: center;
  overflow: visible;
  max-width: 5rem;
}

.digit-stack {
  position: relative;
  display: inline-flex;
  max-width: 5rem;
}

.digit-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.digit-enter-active,
.digit-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transition-delay: var(--digit-delay, 0s);
}

.digit-move {
  transition: transform 0.3s ease;
  transition-delay: var(--digit-delay, 0s);
}

.digit-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.digit-leave-to {
  transform: translateY(100%);
  opacity: 0;
  position: absolute;
  inset: 0;
}


.todo {
  cursor: pointer;
  font-size: 1.2rem; margin: 0.2rem 0;
  color: #808080;
  transition: color 0.2s ease-in-out;
}
.todo:hover {
  color: #ffffff;
}

.todo-container {
  display: flex; flex-direction: column; align-items: center;
  margin-top: 2rem;
  max-height: 42.6vh;
  font-family: 'Azeret Mono', monospace;
}

.completed-message {
  display: inline-flex;
  flex-wrap: wrap;
  font-size: 1.2rem;
  color: #ffffffaa;
  font-family: 'Zalando Sans Expanded', monospace;
}

.completed-letter {
  display: inline-block;
  animation: letter-margin-pulse 2.4s ease-in-out infinite both;
  margin: 0 1px;
}

@keyframes letter-margin-pulse {
  0% { opacity: 0.4; margin-inline: 0.1px }
  50% { opacity: 1; margin-inline: 0.4px }
  100% { opacity: 0.4; margin-inline: -0.1px }
}

html {
  background-color: #000;
  background-image: var(--bg-url); background-repeat: no-repeat;
  background-size: cover; background-position: center;
  height: 100%; width: 100%;
  max-height: 100vw;
}
.home {
  display: flex; flex-direction: column;
  justify-content: center;
  font-family: 'Zalando Sans Expanded', monospace; color: #ffffff;
  padding-top: 40vh;
  /* height: 92vh; width: 100%; */
  max-width: 100vw;
  overflow: hidden;
}
.main-container {
  padding: 2rem 4rem; border-radius: 1rem;
  height: fit-content;
  text-align: center
}
.time { font-size: 5rem; font-weight: bold; letter-spacing: 10px; }
.time-divider { color: #ffffff80; }
.date { font-size: 1.5rem; margin-top: 1rem }
</style>
