import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, FolderKanban, Calendar, ArrowRight } from 'lucide-react';
import { projectsApi } from '../api/projects';
import { ProjectStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = (data: ProjectFormValues) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  const projects = data?.items || [];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and track all your team's initiatives</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="premium" className="shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Get started by creating a new project to organize your tasks."
          action={<Button onClick={() => setIsCreateModalOpen(true)} variant="premium">Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, i) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1.5 hover:border-primary-200 transition-all duration-300 flex flex-col h-full animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                <Badge variant={project.status === ProjectStatus.ACTIVE ? 'success' : 'default'} className="shadow-sm">
                  {project.status.replace('_', ' ')}
                </Badge>
                <div className="p-2 bg-slate-50 text-slate-400 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-700 transition-colors relative z-10 leading-tight">
                {project.name}
              </h3>
              
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 relative z-10">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center text-xs font-semibold text-slate-400 mt-auto pt-4 border-t border-slate-100 relative z-10">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-300 group-hover:text-primary-400 transition-colors" />
                Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
            <input
              {...register('name')}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
              placeholder="e.g. Q3 Marketing Campaign"
            />
            {errors.name && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea
              {...register('description')}
              rows={4}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm resize-none"
              placeholder="Brief description of the goals and scope"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
