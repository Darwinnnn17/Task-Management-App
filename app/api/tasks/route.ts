import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { taskSchema } from "@/src/lib/validations";
import { getCurrentUserId } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status && status !== "ALL" ? { status: status as "TODO" | "IN_PROGRESS" | "DONE" } : {}),
        ...(priority && priority !== "ALL" ? { priority: priority as "LOW" | "MEDIUM" | "HIGH" } : {}),
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("GET_TASKS_ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("CREATE_TASK_ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}