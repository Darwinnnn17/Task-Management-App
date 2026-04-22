import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/auth";
import TaskBoard from "./TaskBoard";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <TaskBoard userName={user.name} initialTasks={user.tasks} />
      </div>
    </main>
  );
}