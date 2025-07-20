'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { FiTrash2 } from 'react-icons/fi';
import { Toaster, toast } from '@/components/ui/toaster';
import type { Todo } from '@/types/api';

export default function TodoApp() {
  // useColorModeValue をトップレベルで変数化
  const boxBg = useColorModeValue('white', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputColor = useColorModeValue('gray.900', 'gray.1000');
  const inputFocusBg = useColorModeValue('white', 'gray.700');
  const inputFocusBorder = useColorModeValue('blue.400', 'blue.300');
  const inputPlaceholder = useColorModeValue('gray.400', 'gray.500');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const todoTextDoneColor = useColorModeValue('gray.400', 'gray.500');
  const todoTextColor = useColorModeValue('gray.900', 'gray.100');
  const spinnerBg = useColorModeValue('gray.50', 'gray.800');
  const accentColor = useColorModeValue('#3182ce', '#90cdf4');
  const checkboxBg = useColorModeValue('#fff', '#1a202c');
  const _checkboxBorderColor = useColorModeValue('#cbd5e1', '#4a5568');
  const [todos, setTodos] = useState<Todo[]>([]);
  // React Hook Form
  type FormValues = { title: string };
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    mode: 'onSubmit',
  });
  // 入力欄への参照（registerから取得）
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // 一覧取得
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error('Invalid data format received:', data);
        toast.error('データの取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();

  }, []);

  // 追加（react-hook-form対応）

  const addTodo = async (values: FormValues) => {
    const title = values.title.trim();
    if (!title) return;
    reset();
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchTodos();
    } catch {
      fetchTodos();
      toast.error('追加に失敗しました');
    }
  };

  // 削除
  const deleteTodo = async (id: number) => {
    try {
      await fetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchTodos();
    } catch {
      fetchTodos();
      toast.error('削除に失敗しました');
    }
  };

  // 完了切替
  const toggleTodo = async (id: number, completed: boolean) => {
    const _prev = todos;
    try {
      await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed }),
      });
      fetchTodos();
    } catch {
      fetchTodos();
      toast.error('更新に失敗しました');
    }
  };

  const list = todos;

  // 送信完了後に入力欄へフォーカス
  React.useEffect(() => {
    if (!isSubmitting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSubmitting]);

  return (
    <>
      <Toaster />
      <Box
        maxW="lg"
        mx="auto"
        p={{ base: 4, md: 8 }}
        bg={boxBg}
        rounded="xl"
        shadow="lg"
        mt={10}
      >
        <Heading size="lg" mb={6} textAlign="center" color={headingColor}>
          TODOアプリ
        </Heading>
        <form onSubmit={handleSubmit(addTodo)}>
          <Flex gap={2} mb={4}>
            <Input
              data-testid="todo-input"
              {...register('title', {
                required: 'タイトルは必須です',
                maxLength: { value: 191, message: 'タイトルは191文字以内で入力してください' },
              })}
              ref={e => {
                register('title').ref(e);
                inputRef.current = e;
              }}
              placeholder="新しいタスクを入力"
              type="text"
              flex={1}
              bg={inputBg}
              disabled={isSubmitting}
              _focusVisible={{ bg: inputFocusBg, borderColor: inputFocusBorder, color: inputColor }}
              _placeholder={{ color: inputPlaceholder }}
              borderColor={errors.title ? 'red.400' : borderColor}
              color={errors.title ? 'red.400' : inputColor}
            />
            <Button
              type="submit"
              colorScheme="blue"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              追加
            </Button>
          </Flex>
          {errors.title && (
            <Text color="red.400" fontSize="sm" mb={2} data-testid="error-message">
              {errors.title.message}
            </Text>
          )}
        </form>
        {loading ? (
          <Flex justify="center" align="center" py={6}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box as="ul">
            {list.length === 0 && (
              <Box as="li" textAlign="center" color={todoTextDoneColor}>
                タスクがありません
              </Box>
            )}
            {list.map(todo => (
              <Flex
                as="li"
                key={todo.id}
                alignItems="center"
                gap={2}
                bg={spinnerBg}
                px={{ base: 2, md: 4 }}
                py={2}
                rounded="md"
                shadow="sm"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  style={{ width: 22, height: 22, accentColor: accentColor, marginRight: 10, background: checkboxBg, borderRadius: 4, border: '1.5px solid', borderColor: borderColor }}
                  aria-label="完了"
                />
                <Text
                  flex={1}
                  fontSize="lg"
                  textDecoration={todo.completed ? 'line-through' : 'none'}
                  color={todo.completed ? todoTextDoneColor : todoTextColor}
                  truncate
                  maxW={{ base: '140px', sm: '240px', md: '320px', lg: '480px' }}
                  wordBreak="break-all"
                  whiteSpace="pre-line"
                  title={todo.title}
                >
                  {todo.title}
                </Text>
                <Button
                  aria-label="削除"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => deleteTodo(todo.id)}
                  p={2}
                  minW={0}
                >
                  <FiTrash2 />
                </Button>
              </Flex>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
}
