"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@prisma/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  ListTodo,
  Moon,
  Search,
  Sun,
  Trash2,
  Pencil,
  CalendarDays,
  Flag,
  Filter,
  LogOut,
  Plus,
  X,
} from "lucide-react";

type TaskBoardProps = {
  userName: string;
  initialTasks: Task[];
};

type TaskFormState = {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
};

const defaultForm: TaskFormState = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
};

function getStatusClasses(status: Task["status"]) {
  if (status === "DONE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
  }

  if (status === "IN_PROGRESS") {
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
}

function getPriorityClasses(priority: Task["priority"]) {
  if (priority === "HIGH") {
    return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20";
  }

  if (priority === "MEDIUM") {
    return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
}

function formatDate(date: Date | null) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString();
}

export default function TaskBoard({ userName, initialTasks }: TaskBoardProps) {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [form, setForm] = useState<TaskFormState>(defaultForm);
  const [loading, setLoading] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("taskflow-theme");
    const shouldDark = saved === "dark";
    setDarkMode(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("taskflow-theme", next ? "dark" : "light");
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" ? true : task.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((task) => task.status === "TODO").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const done = tasks.filter((task) => task.status === "DONE").length;
    const overdue = tasks.filter((task) => isOverdue(task)).length;
    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, todo, inProgress, done, overdue, completionRate };
  }, [tasks]);

  function resetForm() {
    setForm(defaultForm);
    setEditingTask(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function reloadTasks() {
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create task");
        setLoading(false);
        return;
      }

      toast.success("Task created successfully");
      resetForm();
      await reloadTasks();
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update task");
        setLoading(false);
        return;
      }

      toast.success("Task updated successfully");
      resetForm();
      await reloadTasks();
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    const res = await fetch(`/api/tasks/${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Task deleted");
      setDeleteTarget(null);
      await reloadTasks();
    } else {
      toast.error("Failed to delete task");
    }
  }

  async function handleStatusChange(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success("Task status updated");
      await reloadTasks();
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">TaskFlow Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, {userName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Organize tasks, track progress, manage priorities, and stay on top of deadlines with a cleaner workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? "Light mode" : "Dark mode"}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</p>
            <ListTodo className="text-slate-400" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.total}</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Todo</p>
            <CircleDashed className="text-slate-400" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.todo}</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
            <Clock3 className="text-slate-400" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.inProgress}</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Done</p>
            <CheckCircle2 className="text-slate-400" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.done}</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
            <CalendarDays className="text-slate-400" size={20} />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.overdue}</h2>
        </div>
      </div>

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Completion Progress</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stats.completionRate}% of tasks completed
            </p>
          </div>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500 dark:bg-slate-200"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-100 dark:text-slate-900">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create Task</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add a task to your workspace
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>
              <input
                name="title"
                type="text"
                placeholder="Ex: Finish dashboard redesign"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Write task details..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Due date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Tasks</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Search, filter, edit, and manage your tasks
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | "TODO" | "IN_PROGRESS" | "DONE")
                }
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")
                }
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              >
                <option value="ALL">All Priority</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
              <p className="text-lg font-semibold">No tasks found</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your filters or create a new task.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClasses(task.status)}`}
                        >
                          {task.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${getPriorityClasses(task.priority)}`}
                        >
                          {task.priority}
                        </span>

                        {isOverdue(task) && (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {task.description || "No description"}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(task.dueDate)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Flag size={14} />
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        defaultValue={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>

                      <button
                        onClick={() => openEditModal(task)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteTarget(task)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Edit Task</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update task information and save changes
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-300 p-2 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>

                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-300"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-xl font-bold">Delete Task</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget.title}</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                Yes, Delete
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}