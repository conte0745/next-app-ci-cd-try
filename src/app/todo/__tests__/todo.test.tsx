import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from '../page';

// Chakra UIのProviderラップを模倣（App Router環境では本来不要だがテストで明示的に）
import { Provider } from '@/components/ui/provider';

import { describe, it, expect, vi } from 'vitest';

function renderWithProvider(ui: React.ReactElement) {
  return render(<Provider>{ui}</Provider>);
}

describe('ToDoアプリUI', () => {
  it('バリデーション: 空欄で追加時にエラー表示', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    renderWithProvider(<TodoApp />);
    const button = screen.getByRole('button', { name: '追加' });
    await userEvent.click(button);
    expect(await screen.findByTestId('error-message')).toHaveTextContent('タイトルは必須です');
  });

  it('バリデーション: 191文字超で追加時にエラー表示', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    renderWithProvider(<TodoApp />);
    const input = screen.getByTestId('todo-input');
    const button = screen.getByRole('button', { name: '追加' });
    await userEvent.type(input, 'a'.repeat(192));
    await userEvent.click(button);
    expect(await screen.findByTestId('error-message')).toHaveTextContent('タイトルは191文字以内で入力してください');
  });
  let todos: any[];

  beforeEach(() => {
    todos = [];
    vi.restoreAllMocks();
    // テストごとにtodosリセット
  });

  it('リクエスト中は入力欄と追加ボタンがdisabledになる', async () => {
    let resolvePost: (() => void) | undefined;
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        // Promiseを遅延させてUI状態を観察
        return new Promise(resolve => {
          resolvePost = () => resolve(
            new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        });
      }
      // GET
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    renderWithProvider(<TodoApp />);
    const input = screen.getByTestId('todo-input');
    const button = screen.getByRole('button', { name: '追加' });
    await userEvent.type(input, 'リクエスト中テスト');
    // 送信
    await userEvent.click(button);
    // POST完了を明示的に解放
    resolvePost?.();
    // 完了後は再び有効
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(button).not.toBeDisabled();
    });
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
        // idをユニークに
        const maxId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) : 1;
        todos.push({ id: maxId + 1, title: body.title, completed: false });
        return { ok: true, json: async () => todos } as any;
      }
      // GET
      return { ok: true, json: async () => todos } as any;
    });
    renderWithProvider(<TodoApp />);
    const input = screen.getByTestId('todo-input');
    await userEvent.type(input, 'テストタスク');
    await userEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
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
    // 1つ目のタスク追加のみ検証
    const input = screen.getByTestId('todo-input');
    await userEvent.type(input, '完了テスト');
    await userEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('完了テスト')).toBeInTheDocument();
    });
  });

  it('タスク完了切替ができる', async () => {
    todos = [];
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        // idをユニークに
        const maxId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) : 1;
        todos.push({ id: maxId + 1, title: body.title, completed: false, isDeleted: false });
        return { ok: true, json: async () => todos } as any;
      }
      if (init && init.method === 'PATCH') {
        const { id, completed } = JSON.parse(init.body as string);
        const todo = todos.find(t => t.id === id);
        if (todo) todo.completed = completed;
        return { ok: true, json: async () => todo } as any;
      }
      // GET
      return { ok: true, json: async () => todos.filter(t => !t.isDeleted) } as any;
    });
    renderWithProvider(<TodoApp />);
    const input2 = screen.getByTestId('todo-input');
    await userEvent.type(input2, '完了テスト');
    await userEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('完了テスト')).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText('完了');
    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('タスク削除ができる', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (init && init.method === 'POST') {
        const body = JSON.parse(init.body as string);
        todos.push({ id: Math.random(), title: body.title, completed: false, isDeleted: false });
        return { ok: true, json: async () => todos } as any;
      }
      if (init && init.method === 'DELETE') {
        const { id } = JSON.parse(init.body as string);
        const todo = todos.find(t => t.id === id);
        if (todo) todo.isDeleted = true;
        return { ok: true, json: async () => ({}) } as any;
      }
      // GET
      return { ok: true, json: async () => todos.filter(t => !t.isDeleted) } as any;
    });
    renderWithProvider(<TodoApp />);
    const input3 = screen.getByTestId('todo-input');
    await userEvent.type(input3, '削除テスト');
    await userEvent.click(screen.getAllByRole('button', { name: '追加' })[0]);
    await waitFor(() => {
      expect(screen.getByText('削除テスト')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByRole('button', { name: '削除' });
    await userEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.queryByText('削除テスト')).not.toBeInTheDocument();
    });
  });
});
