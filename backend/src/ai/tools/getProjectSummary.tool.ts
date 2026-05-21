import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjectSummaryTool = new DynamicStructuredTool({
  name: 'getProjectSummary',
  description: 'Fetches project and all its tasks from the database to return a structured summary.',
  schema: z.object({
    projectId: z.string().describe('The UUID of the project'),
  }),
  func: async ({ projectId }) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
      });

      if (!project) {
        return `Project with ID ${projectId} not found.`;
      }

      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
      const todoTasks = project.tasks.filter((t) => t.status === 'TODO').length;
      const inProgressTasks = project.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const inReviewTasks = project.tasks.filter((t) => t.status === 'IN_REVIEW').length;

      return JSON.stringify({
        name: project.name,
        description: project.description,
        status: project.status,
        stats: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          inReview: inReviewTasks,
          completed: completedTasks,
        },
      });
    } catch (error: any) {
      return `Error fetching project summary: ${error.message}`;
    }
  },
});
