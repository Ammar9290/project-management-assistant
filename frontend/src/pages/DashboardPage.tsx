import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { TaskStatus, Priority } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';

export function DashboardPage() {
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.findAll(),
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.findAll(),
  });

  if (isLoadingProjects || isLoadingTasks) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const projects = projectsData?.items || [];
  const tasks = tasksData?.items || [];

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;

  const stats = [
    { name: 'Active Projects', value: totalProjects, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-100', gradient: 'from-indigo-500/10 to-indigo-500/5' },
    { name: 'Total Tasks', value: totalTasks, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-500/10 to-blue-500/5' },
    { name: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { name: 'Needs Attention', value: overdueTasks, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100', gradient: 'from-rose-500/10 to-rose-500/5' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div 
            key={stat.name} 
            className={cn(
              "overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group animate-fade-in-up"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100", stat.gradient)} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bg} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-7 flex flex-col animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Projects</h2>
            <Link to="/projects" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={FolderKanban} title="No projects yet" />
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">{project.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.description || 'No description'}</span>
                  </div>
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'} className="ml-4 flex-shrink-0">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-7 flex flex-col animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500"/> Priority Tasks
            </h2>
          </div>
          
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={CheckCircle2} title="No tasks yet" />
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.filter(t => t.status !== TaskStatus.DONE).sort((a,b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0)).slice(0, 5).map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="group block p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">{task.title}</span>
                    {task.isOverdue ? (
                      <Badge variant="danger" className="ml-2 flex-shrink-0 text-[10px]">OVERDUE</Badge>
                    ) : (
                      <Badge variant={task.status === TaskStatus.IN_PROGRESS ? 'info' : 'warning'} className="ml-2 flex-shrink-0 text-[10px]">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center"><FolderKanban className="w-3 h-3 mr-1"/> {task.project?.name}</span>
                    {task.dueDate && (
                      <span className={cn("flex items-center font-medium", task.isOverdue ? 'text-rose-600' : 'text-slate-500')}>
                        <Clock className="w-3 h-3 mr-1" /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
