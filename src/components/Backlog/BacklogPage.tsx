import { useState, useEffect } from "react";
import BacklogColumn from "../../components/Backlog/BacklogColumn";
import type { ApiTask } from "../../types/api";
import { getProjects } from "../../api/projects";
import { getProjectTasks } from "../../api/tasks";

function BacklogPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);

        const projects = await getProjects();
        const taskArrays = await Promise.all(
          projects.map(async (project) => {
            const projectTasks = await getProjectTasks(project.id);
            return projectTasks.map((task) => ({
              ...task,
              projectId: project.id,
              projectName: project.name,
            }));
          })
        );

        setTasks(taskArrays.flat());
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Unable to load backlog tasks right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="p-10 text-slate-400">Loading Backlog...</div>;

  if (error) {
    return (
      <div className="p-10 text-slate-500">
        <p className="text-sm font-medium text-slate-700">Backlog unavailable</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 overflow-x-auto p-8 bg-[#fdfdfd]">
      <BacklogColumn 
        title="To Do" 
        status="todo" 
        tasks={tasks.filter(t => t.status === "todo")} 
      />
      <BacklogColumn 
        title="In Progress" 
        status="in_progress" 
        tasks={tasks.filter(t => t.status === "in_progress")} 
      />
      <BacklogColumn 
        title="Review" 
        status="review" 
        tasks={tasks.filter(t => t.status === "review")} 
      />
      <BacklogColumn 
        title="Done" 
        status="done" 
        tasks={tasks.filter(t => t.status === "done")} 
      />
    </div>
  );
}

export default BacklogPage;