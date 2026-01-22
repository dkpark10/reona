import { html, state, ref, setRef, memo } from '../../../../packages/reona-x/src/core';

interface TodoItem {
  id: number;
  title: string;
  isFinished: boolean;
}

export default function Todo() {
  const data = state<{ todos: TodoItem[] }>({
    todos: [
      { 'id': 1, title: '1', isFinished: false, }, 
      { 'id': 2, title: '2', isFinished: false, },
      { 'id': 3, title: '3', isFinished: false, }
    ],
  });

  const deleteTodo = (id: number) => {
    data.todos = data.todos.filter((todo) => todo.id !== id);
  };

  return html`
    <div class="container">
      <div class="todo-app">
        <ul class="todo-list">
          ${data.todos.map(
            (item) => html`
              <li key=${item.id} class="todo-item">
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
