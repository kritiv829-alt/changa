const STORAGE_KEY = 'everyday-tasks';

export function loadTasks() {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: [], error: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { tasks: [], error: true };
    const ids = new Set();
    const tasks = [];
    for (const task of parsed) {
      if (!task || typeof task.id !== 'string' || !task.id.trim() || ids.has(task.id) ||
          typeof task.title !== 'string' || !task.title.trim() || task.title.length > 200 ||
          typeof task.completed !== 'boolean') continue;
      ids.add(task.id);
      tasks.push({ id: task.id, title: task.title, completed: task.completed });
    }
    return { tasks, error: tasks.length !== parsed.length };
  } catch {
    return { tasks: [], error: true };
  }
}

export function saveTasks(tasks) {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
