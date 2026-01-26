import { html, state, ref, setRef, memo } from 'reona';
import './styles/index.css';

interface TodoItem {
  id: number;
  title: string;
  isFinished: boolean;
}

export default function Todo() {
  const inputRef = ref<HTMLInputElement | null>(null);

  const data = state<{ todos: TodoItem[]; nextId: number }>({
    todos: [],
    nextId: 1,
  });

  const finishedCount = memo(data, () =>
    data.todos.filter((todo) => todo.isFinished).length
  );

  const remainingCount = memo(data, () =>
    data.todos.filter((todo) => !todo.isFinished).length
  );

  const addTodo = () => {
    const input = inputRef.current;
    if (!input || !input.value.trim()) return;

    data.todos = [
      ...data.todos,
      {
        id: data.nextId,
        title: input.value.trim(),
        isFinished: false,
      },
    ];
    data.nextId += 1;
    input.value = '';
  };

  const toggleTodo = (id: number) => {
    data.todos = data.todos.map((todo) =>
      todo.id === id ? { ...todo, isFinished: !todo.isFinished } : todo
    );
  };

  const deleteTodo = (id: number) => {
    data.todos = data.todos.filter((todo) => todo.id !== id);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return html`
    <div class="container">
      <div class="todo-app">
        <header>
          <h1>Todo</h1>
          <div class="input-area">
            <input
              type="text"
              placeholder="할 일을 입력하세요"
              $$ref=${setRef(inputRef)}
              @keydown=${handleKeydown}
            />
            <button class="add-btn" type="button" @click=${addTodo}>추가</button>
          </div>
          <div class="stats">
            <span>완료: ${finishedCount}</span>
            <span>남음: ${remainingCount}</span>
          </div>
        </header>
        <ul class="todo-list">
          ${data.todos.map(
            (item) => html`
              <li key=${item.id} class="todo-item ${item.isFinished ? 'finished' : ''}">
                <input
                  type="checkbox"
                  ${item.isFinished ? 'checked' : ''}
                  @change=${() => toggleTodo(item.id)}
                />
                <span class="todo-title">${item.title}</span>
                <button class="delete-btn" type="button" @click=${() => deleteTodo(item.id)}>삭제</button>
              </li>
            `
          )}
        </ul>
      </div>
    </div>
  `;
}
