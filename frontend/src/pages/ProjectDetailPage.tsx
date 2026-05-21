import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, ArrowLeft, MoreVertical, Calendar, GripVertical } from 'lucide-react';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { TaskStatus, Priority } from '../types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const COLUMNS = [
  { id: TaskStatus.TODO, title: 'To Do', borderTop: 'border-t-slate-300', bg: 'bg-slate-100/50' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', borderTop: 'border-t-blue-400', bg: 'bg-blue-50/50' },
  { id: TaskStatus.IN_REVIEW, title: 'In Review', borderTop: 'border-t-purple-400', bg: 'bg-purple-50/50' },
  { id: TaskStatus.DONE, title: 'Done', borderTop: 'border-t-emerald-400', bg: 'bg-emerald-50/50' },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const queryClient = useQueryClient();

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.findOne(id!),
    enabled: !!id,
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', { projectId: id }],
    queryFn: () => tasksApi.findAll({ projectId: id, limit: 100 }),
    enabled: !!id,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create({ ...data, projectId: id, status: initialStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: id }] });
      setIsTaskModalOpen(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  if (isLoadingProject || isLoadingTasks) {
    return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  const tasks = tasksData?.items || [];

  const handleOpenTaskModal = (status: TaskStatus) => {
    setInitialStatus(status);
    setIsTaskModalOpen(true);
  };

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      [Priority.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
      [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [Priority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
      [Priority.URGENT]: 'bg-red-100 text-red-700 border-red-200 animate-pulse-soft',
    };
    return (
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider border', styles[priority])}>
        {priority}
      </span>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <div className="mb-8">
        <Link to="/projects" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-4 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:border-primary-200">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Projects
        </Link>
        <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <p className="mt-2 text-slate-500 font-medium max-w-3xl leading-relaxed">{project.description}</p>
          </div>
          <Button onClick={() => handleOpenTaskModal(TaskStatus.TODO)} variant="premium">
            <Plus className="w-5 h-5 mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 px-1">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className={cn("flex-shrink-0 w-80 rounded-2xl flex flex-col border-t-4 shadow-sm border-x border-b border-slate-200/60", col.borderTop, col.bg)}>
              <div className="flex justify-between items-center p-4 border-b border-slate-200/40 bg-white/40 backdrop-blur-sm rounded-t-xl">
                <h3 className="font-bold text-slate-800 flex items-center">
                  {col.title} 
                  <span className="ml-2.5 text-xs bg-white text-slate-600 px-2.5 py-0.5 rounded-full shadow-sm font-semibold border border-slate-200">
                    {colTasks.length}
                  </span>
                </h3>
                <button onClick={() => handleOpenTaskModal(col.id)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-primary-600 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-primary-400 rounded-l-xl transition-colors" />
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary-700 transition-colors">{task.title}</h4>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-4 pl-2 font-medium">{task.description}</p>}
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 pl-2">
                      {getPriorityBadge(task.priority)}
                      {task.dueDate && (
                        <div className="flex items-center text-xs font-semibold">
                          <Calendar className={cn("w-3.5 h-3.5 mr-1.5", task.isOverdue ? 'text-red-500' : 'text-slate-400')} />
                          <span className={cn(task.isOverdue ? 'text-red-600' : 'text-slate-500')}>
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
            <input
              {...register('title')}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
              placeholder="e.g. Design homepage mockup"
            />
            {errors.title && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm resize-none"
              placeholder="Detailed requirements or notes"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
            <div className="relative">
              <select
                {...register('priority')}
                className="block w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm font-medium"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={createTaskMutation.isPending}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
