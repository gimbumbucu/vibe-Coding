import { useState } from 'react';
import type { TodoCreate } from '../types/todo';

interface TodoFormProps {
  onAdd: (todo: TodoCreate) => Promise<void>;
}

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({ title, description: description || undefined });
      setTitle('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!title.trim() || isSubmitting}
        >
          Add Task
        </button>
      </div>
    </form>
  );
};
