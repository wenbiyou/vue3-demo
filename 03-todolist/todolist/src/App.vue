<script>
import "./assets/index.css";
import { ref, computed, onMounted, onUnmounted, watchEffect } from "vue";
import useLocalStorage from './utils/useLocalStorage.js'

const storage = useLocalStorage()

// 添加待办事项
const useAdd = (todos) => {
  const input = ref("");
  const addTodo = () => {
    const text = input.value && input.value.trim();
    if (text.length === 0) return;
    todos.value.unshift({
      text,
      completed: false,
    });
    input.value = "";
  };

  return {
    input,
    addTodo,
  };
};

// 删除待办事项
const useRemove = (todos) => {
  const remove = (todo) => {
    const index = todos.value.indexOf(todo);
    todos.value.splice(index, 1);
  };
  const removeCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  return {
    remove,
    removeCompleted
  };
};

// 编辑待办事项
const useEdit = (remove) => {
  let beforeEditText = "";
  const editingTodo = ref(null);
  const editTodo = (todo) => {
    beforeEditText = todo.value;
    editingTodo.value = todo;
  };
  const doneTodo = (todo) => {
    if (!editingTodo.value) return;
    todo.text = todo.text.trim();
    todo.text || remove(todo);
    editingTodo.value = null;
  };
  const cancelTodo = (todo) => {
    editingTodo.value = null;
    todo.text = beforeEditText;
  };
  return {
    editingTodo,
    editTodo,
    doneTodo,
    cancelTodo,
  };
};

// 切换待办事项完成状态
const useFilter = (todos) => {
  const allDone = computed({
    get() {
      return !todos.value.filter((todo) => !todo.completed).length;
    },
    set(value) {
      todos.value.forEach((item) => {
        item.completed = value;
      });
    },
  });

  const filter = {
    all: list => list,
    active: list => list.filter(todo => !todo.completed),
    completed: list => list.filter(todo => todo.completed)
  }
  const type = ref('all')
  const filterTodos = computed(() => filter[type.value](todos.value))
  const remainingCount = computed(() => filter.active(todos.value).length)
  const count = computed(() => todos.value.length)

  const onHashChange = () => {
    const hash = window.location.hash.replace("#/", '')
    if (filter[hash]) {
      type.value = hash
    } else {
      type.value = 'all'
    }
  }
  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
  })
  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })
  return {
    allDone,
    count,
    filterTodos,
    remainingCount
  };
};

// 待办事项数据的本地存储
const useStorage = () => {
  const KEY = 'TODOKEYS'
  const todos = ref(storage.getItem(KEY) || [])
  watchEffect(() => {
    storage.setItem(KEY, todos.value)
  })
  return todos
}


export default {
  name: "App",
  setup() {
    const todos = useStorage()
    const { remove, removeCompleted } = useRemove(todos);
    return {
      todos,
      remove,
      removeCompleted,
      ...useAdd(todos),
      ...useEdit(remove),
      ...useFilter(todos),
    };
  },
  directives: {
    editingFocus: (el, binding) => {
      binding.value && el.focus();
    },
  },
};
</script>

<template>
  <section id="app" class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autocomplete="off"
        autofocus
        v-model="input"
        @keyup.enter="addTodo"
      />
    </header>
    <section class="main" v-show="count">
      <input
        id="toggle-all"
        class="toggle-all"
        v-model="allDone"
        type="checkbox"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in filterTodos"
          :key="todo"
          :class="{ editing: todo === editingTodo, completed: todo.completed }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.text }}</label>
            <button class="destroy" @click="remove(todo)"></button>
          </div>
          <input
            class="edit"
            type="text"
            v-editing-focus="todo === editingTodo"
            v-model="todo.text"
            @keyup.enter="doneTodo(todo)"
            @blur="doneTodo(todo)"
            @key.esc="cancelTodo(todo)"
          />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="count">
      <span class="todo-count">
        <strong>{{ remainingCount }}</strong> {{ remainingCount > 1 ? 'items' : 'item' }} left
      </span>
      <ul class="filters">
        <li><a href="#/all">All</a></li>
        <li><a href="#/active">Active</a></li>
        <li><a href="#/completed">Completed</a></li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="count > remainingCount">Clear completed</button>
    </footer>
  </section>
</template>

<style scoped></style>
