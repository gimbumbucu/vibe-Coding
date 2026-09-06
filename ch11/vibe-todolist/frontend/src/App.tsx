import { useState, useEffect } from 'react';
import type { Todo, TodoCreate, TodoUpdate } from './types/todo';
import { getTodos, createTodo, updateTodo, deleteTodo } from './api/todoApi';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      // Sort by created_at descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTodos(sorted);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError("Failed to load tasks. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (todo: TodoCreate) => {
    try {
      const newTodo = await createTodo(todo);
      setTodos(prev => [newTodo, ...prev]);
    } catch (err) {
      console.error("Failed to add todo:", err);
      alert("Failed to add task.");
    }
  };

  const handleUpdateTodo = async (id: string, update: TodoUpdate) => {
    try {
      // Optimistic update
      setTodos(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
      await updateTodo(id, update);
    } catch (err) {
      console.error("Failed to update todo:", err);
      // Revert on failure by refetching
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      // Optimistic update
      setTodos(prev => prev.filter(t => t.id !== id));
      await deleteTodo(id);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      // Revert on failure by refetching
      fetchTodos();
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Vibe Tasks</h1>
      
      <TodoForm onAdd={handleAddTodo} />
      
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tasks...</div>
      ) : (
        <TodoList 
          todos={todos} 
          onUpdate={handleUpdateTodo} 
          onDelete={handleDeleteTodo} 
        />
      )}
    </div>
  );
}

export default App;
