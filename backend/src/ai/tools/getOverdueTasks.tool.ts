import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOverdueTasksTool = new DynamicStructuredTool({
  name: 'getOverdueTasks',
  description: 'Returns all tasks where dueDate is strictly before now and status is not DONE.',
  schema: z.object({
    projectId: z.string().optional().describe('Optional project UUID to filter by'),
  }),
  func: async ({ projectId }) => {
    try {
      const where: any = {
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      };

      if (projectId) {
        where.projectId = projectId;
      }

      const overdueTasks = await prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          projectId: true,
        },
      });

      if (overdueTasks.length === 0) {
        return 'No overdue tasks found.';
      }

      return JSON.stringify(
        overdueTasks.map((t) => {
          const daysOverdue = Math.floor((new Date().getTime() - new Date(t.dueDate!).getTime()) / (1000 * 3600 * 24));
          return {
            title: t.title,
            daysOverdue,
            status: t.status,
            dueDate: t.dueDate,
          };
        }),
      );
    } catch (error: any) {
      return `Error fetching overdue tasks: ${error.message}`;
    }
  },
});
