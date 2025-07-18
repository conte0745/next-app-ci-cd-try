import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoApp from '../page';

// Chakra UIのProviderラップを模倣（App Router環境では本来不要だがテストで明示的に）
import { Provider } from '@/components/ui/provider';

import { describe, it, expect, vi } from 'vitest';

function renderWithProvider(ui: React.ReactElement) {
  return render(<Provider>{ui}</Provider>);
}

describe('ToDoアプリUI', () => {
  let todos: any[];

  beforeEach(() => {
    todos = [];
    vi.restoreAllMocks();
  });

  it('初期描画で見出し・入力欄・追加ボタンが表示される', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any);
    renderWithProvider(<TodoApp />);
    expect(screen.getByText('TODOアプリ')).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('タスク追加→リスト表示', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        todos.push({ id: 1, title: body.title, completed: false });
        return { ok: true, json: async () => todos } as any;
      }
      // GET
      return { ok: true, json: async () => todos } as any;
    });
    renderWithProvider(<TodoApp />);
    const input = screen.getByTestId('todo-input');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
  });

  it('タスク完了切替ができる', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        todos.push({ id: 2, title: body.title, completed: false });
        return { ok: true, json: async () => todos } as any;
      }
      if (init && init.method === 'PUT') {
        // 完了切替
        const id = Number((input as string).split('/').pop());
        const todo = todos.find(t => t.id === id);
        if (todo) todo.completed = !todo.completed;
        return { ok: true, json: async () => todo } as any;
      }
      // GET
      return { ok: true, json: async () => todos } as any;
    });
    renderWithProvider(<TodoApp />);
    const input = screen.getByTestId('todo-input');
    fireEvent.change(input, { target: { value: '完了テスト' } });
    fireEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('完了テスト')).toBeInTheDocument();
    });
    renderWithProvider(<TodoApp />);
    const [input1] = [screen.getByTestId('todo-input')];
    fireEvent.change(input1, { target: { value: 'テストタスク' } });
    fireEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
  });

  it('タスク完了切替ができる', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        todos.push({ id: 2, title: body.title, completed: false });
        return { ok: true, json: async () => todos } as any;
      }
      if (init && init.method === 'PUT') {
        // 完了切替
        const id = Number((input as string).split('/').pop());
        const todo = todos.find(t => t.id === id);
        if (todo) todo.completed = !todo.completed;
        return { ok: true, json: async () => todo } as any;
      }
      // GET
      return { ok: true, json: async () => todos } as any;
    });
    renderWithProvider(<TodoApp />);
    const input2 = screen.getByTestId('todo-input');
    fireEvent.change(input2, { target: { value: '完了テスト' } });
    fireEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('完了テスト')).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText('完了');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('タスク削除ができる', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        todos.push({ id: 3, title: body.title, completed: false });
        return { ok: true, json: async () => todos } as any;
      }
      if (init && init.method === 'DELETE') {
        const id = Number((input as string).split('/').pop());
        todos = todos.filter(t => t.id !== id);
        return { ok: true, json: async () => ({}) } as any;
      }
      // GET
      return { ok: true, json: async () => todos } as any;
    });
    renderWithProvider(<TodoApp />);
    const input3 = screen.getByTestId('todo-input');
    fireEvent.change(input3, { target: { value: '削除テスト' } });
    fireEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('削除テスト')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByRole('button', { name: '削除' });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.queryByText('削除テスト')).not.toBeInTheDocument();
    });
  });
});
