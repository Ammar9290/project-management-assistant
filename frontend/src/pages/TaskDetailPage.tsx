import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Calendar, User, AlignLeft, Flag, CheckCircle2 } from 'lucide-react';
import { tasksApi } from '../api/tasks';
import { TaskStatus, Priority } from '../types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.findOne(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => tasksApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(`/projects/${task?.projectId}`);
    },
  });

  if (isLoading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  if (!task) return <div>Task not found</div>;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ status: e.target.value as TaskStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ priority: e.target.value as Priority });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <Link to={`/projects/${task.projectId}`} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:border-primary-200">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Kanban Board
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col md:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-200/60">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-slate-100 text-slate-600 shadow-sm border-slate-200 font-bold">{task.project?.name}</Badge>
            {task.isOverdue && <Badge variant="danger" className="animate-pulse-soft">OVERDUE</Badge>}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
            {task.title}
          </h1>

          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center mb-4">
              <AlignLeft className="w-4 h-4 mr-2" /> Description
            </h3>
            <div className="text-slate-700 whitespace-pre-wrap bg-slate-50/80 p-6 rounded-2xl min-h-[200px] font-medium leading-relaxed border border-slate-100">
              {task.description || <span className="text-slate-400 italic">No description provided for this task.</span>}
            </div>
          </div>
        </div>

        {/* Sidebar Properties */}
        <div className="w-full md:w-80 bg-slate-50/50 p-8 flex flex-col space-y-8">
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2 text-primary-500" /> Status
            </label>
            <div className="relative">
              <select
                value={task.status}
                onChange={handleStatusChange}
                disabled={updateMutation.isPending}
                className={cn(
                  "block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 font-bold focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm cursor-pointer",
                  task.status === TaskStatus.DONE && "text-emerald-700 bg-emerald-50 border-emerald-200"
                )}
              >
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mb-3">
              <Flag className="w-4 h-4 mr-2 text-orange-500" /> Priority
            </label>
            <div className="relative">
              <select
                value={task.priority}
                onChange={handlePriorityChange}
                disabled={updateMutation.isPending}
                className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 font-bold focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm cursor-pointer"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mb-3">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Due Date
            </label>
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm font-semibold text-slate-700">
              {task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-400 italic font-normal">Not set</span>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mb-3">
              <User className="w-4 h-4 mr-2 text-emerald-500" /> Assignee
            </label>
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center">
              {task.assignee ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-xs mr-3 border border-emerald-200 shadow-sm">
                    {task.assignee.name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800">{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-slate-400 italic font-medium">Unassigned</span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button variant="danger" className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200" onClick={() => { if(window.confirm('Are you absolutely sure you want to delete this task?')) deleteMutation.mutate(); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Task
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
