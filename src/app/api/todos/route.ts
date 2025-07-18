import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 一覧取得
export async function GET() {
  const todos = await prisma.todo.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(todos);
}

// POST: 新規追加
export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
  }
  const todo = await prisma.todo.create({ data: { title } });
  return NextResponse.json(todo);
}

// PATCH: 完了状態の更新
export async function PATCH(req: Request) {
  const { id, completed } = await req.json();
  if (typeof id !== 'number' || typeof completed !== 'boolean') {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });
  }
  const todo = await prisma.todo.update({ where: { id }, data: { completed } });
  return NextResponse.json(todo);
}

// DELETE: 論理削除
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (typeof id !== 'number') {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });
  }
  await prisma.todo.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
