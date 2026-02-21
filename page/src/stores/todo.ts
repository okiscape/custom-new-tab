import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todoList', 
  {
    state: () => {
      const saved = localStorage.getItem("todoList")
      const todoList = ref(saved ? JSON.parse(saved) : [] as string[])

      // Сохраняем при изменениях
      watch(todoList, (val) => {
        localStorage.setItem("todoList", JSON.stringify(val))
      }, { deep: true })

      function add(item: string) {
        if (item.trim() === '') return;
        todoList.value.push(item);
      }
      function remove(index: number | string) {
        todoList.value.splice(index, 1);
      }

      return { todoList, add, remove }
    }
  }
)
