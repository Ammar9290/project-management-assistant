import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getTasksByStatusTool = new DynamicStructuredTool({
  name: 'getTasksByStatus',
  description: 'Returns a filtered list of tasks for a given project based on status.',
  schema: z.object({
    projectId: z.string().describe('The UUID of the project'),
    status: z.nativeEnum(TaskStatus).describe('The status to filter by (TODO, IN_PROGRESS, IN_REVIEW, DONE)'),
  }),
  func: async ({ projectId, status }) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId, status },
        select: { title: true, priority: true, dueDate: true },
      });

      if (tasks.length === 0) {
        return `No tasks found with status ${status} in project ${projectId}.`;
      }

      return JSON.stringify(tasks);
    } catch (error: any) {
      return `Error fetching tasks by status: ${error.message}`;
    }
  },
});
