import type { Todo, TodoUpdate } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, update: TodoUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TodoItem = ({ todo, onUpdate, onDelete }: TodoItemProps) => {
  const handleToggle = () => {
    onUpdate(todo.id, { is_completed: !todo.is_completed });
  };

  return (
    <li className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input 
          type="checkbox" 
          className="todo-checkbox"
          checked={todo.is_completed}
          onChange={handleToggle}
        />
        <div className="todo-text-group">
          <span className="todo-title">{todo.title}</span>
          {todo.description && (
            <span className="todo-description">{todo.description}</span>
          )}
        </div>
      </div>
      <button 
        className="btn-icon" 
        onClick={() => onDelete(todo.id)}
        aria-label="Delete Todo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </li>
  );
};
