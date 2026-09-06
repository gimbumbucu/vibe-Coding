import type { Todo, TodoUpdate } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, update: TodoUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TodoList = ({ todos, onUpdate, onDelete }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onUpdate={onUpdate} 
          onDelete={onDelete} 
        />
      ))}
    </ul>
  );
};
