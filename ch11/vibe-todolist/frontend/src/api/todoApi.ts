import axios from "axios";
import type { Todo, TodoCreate, TodoUpdate } from "../types/todo";

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:8000";
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl.replace(/\/+$/, "");
  }
  return `https://${envUrl.replace(/\/+$/, "")}`;
};

const API_URL = `${getApiBaseUrl()}/todos`;

export const getTodos = async (): Promise<Todo[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createTodo = async (todo: TodoCreate): Promise<Todo> => {
  const response = await axios.post(API_URL, todo);
  return response.data;
};

export const updateTodo = async (id: string, todo: TodoUpdate): Promise<Todo> => {
  const response = await axios.put(`${API_URL}/${id}`, todo);
  return response.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
