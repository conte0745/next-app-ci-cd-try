"use client"

import React from "react";
import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Flex,
	Heading,
	Input,
	Spinner,
	Text
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { FiTrash2 } from "react-icons/fi";
import { Toaster, toaster } from "@/components/ui/toaster"

type Todo = {
	id: number;
	title: string;
	completed: boolean;
	createdAt: string;
};

export default function TodoApp() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [optimisticTodos, setOptimisticTodos] = useState<Todo[] | null>(null);

	// 一覧取得
	const fetchTodos = async () => {
		setLoading(true);
		const res = await fetch("/api/todos");
		const data = await res.json();
		setTodos(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchTodos();
		// eslint-disable-next-line
	}, []);

	// 追加
	const addTodo = async () => {
		if (!input.trim()) return;
		const tempId = Math.random();
		const optimistic: Todo = {
			id: tempId,
			title: input,
			completed: false,
			createdAt: new Date().toISOString(),
		};
		setOptimisticTodos([optimistic, ...(optimisticTodos ?? todos)]);
		setInput("");
		try {
			await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: optimistic.title }),
			});
			fetchTodos();
		} catch {
			setOptimisticTodos(null);
			fetchTodos();
			toaster.create({ title: "追加に失敗しました", type: "error" });
		}
	};

	// 削除
	const deleteTodo = async (id: number) => {
		const prev = optimisticTodos ?? todos;
		setOptimisticTodos(prev.filter((t) => t.id !== id));
		try {
			await fetch("/api/todos", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			fetchTodos();
		} catch {
			setOptimisticTodos(null);
			fetchTodos();
			toaster.create({ title: "削除に失敗しました", type: "error" });
		}
	};

	// 完了切替
	const toggleTodo = async (id: number, completed: boolean) => {
		const prev = optimisticTodos ?? todos;
		setOptimisticTodos(
			prev.map((t) =>
				t.id === id ? { ...t, completed: !completed } : t
			)
		);
		try {
			await fetch("/api/todos", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, completed: !completed }),
			});
			fetchTodos();
		} catch {
			setOptimisticTodos(null);
			fetchTodos();
			toaster.create({ title: "更新に失敗しました", type: "error" });
		}
	};

	const list = optimisticTodos ?? todos;

	return (
		<>
			<Toaster />
			<Box
				maxW="lg"
				mx="auto"
				p={{ base: 4, md: 8 }}
				bg={useColorModeValue('white', 'gray.900')}
				rounded="xl"
				shadow="lg"
				mt={10}
			>
				<Heading size="lg" mb={6} textAlign="center" color={useColorModeValue('gray.800', 'gray.100')}>
					TODOアプリ
				</Heading>
				<Flex gap={2} mb={4}>
					<Input
						data-testid="todo-input"
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="新しいタスクを入力"
						onKeyDown={e => {
							if (e.key === "Enter") addTodo();
						}}
						flex={1}
						bg={useColorModeValue('white', 'gray.800')}
						color={useColorModeValue('gray.900', 'gray.100')}
						_focusVisible={{ bg: useColorModeValue('white', 'gray.700'), borderColor: useColorModeValue('blue.400', 'blue.300'), color: useColorModeValue('gray.900', 'gray.100') }}
						_placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
						borderColor={useColorModeValue('gray.300', 'gray.600')}
					/>
					<Button
						onClick={addTodo}
						colorScheme="blue"
						disabled={!input.trim()}
					>
						追加
					</Button>
				</Flex>
				{loading ? (
					<Flex justify="center" align="center" py={6}>
						<Spinner size="lg" />
					</Flex>
				) : (
					<Box as="ul">
						{list.length === 0 && (
							<Box as="li" textAlign="center" color={useColorModeValue('gray.400', 'gray.500')}>
								タスクがありません
							</Box>
						)}
						{list.map(todo => (
							<Flex
								as="li"
								key={todo.id}
								alignItems="center"
								gap={2}
								bg={useColorModeValue('gray.50', 'gray.800')}
								px={{ base: 2, md: 4 }}
								py={2}
								rounded="md"
								shadow="sm"
							>
								<input
									type="checkbox"
									checked={todo.completed}
									onChange={() => toggleTodo(todo.id, todo.completed)}
									style={{ width: 22, height: 22, accentColor: useColorModeValue('#3182ce', '#90cdf4'), marginRight: 10, background: useColorModeValue('#fff', '#1a202c'), borderRadius: 4, border: '1.5px solid', borderColor: useColorModeValue('#cbd5e1', '#4a5568') }}
									aria-label="完了"
								/>
								<Text
									flex={1}
									fontSize="lg"
									textDecoration={todo.completed ? "line-through" : "none"}
									color={todo.completed ? useColorModeValue('gray.400', 'gray.500') : useColorModeValue('gray.900', 'gray.100')}
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
