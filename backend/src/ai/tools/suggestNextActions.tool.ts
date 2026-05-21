import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const suggestNextActionsTool = new DynamicStructuredTool({
  name: 'suggestNextActions',
  description: 'Analyzes the current task state of a project and suggests prioritized next actions.',
  schema: z.object({
    projectId: z.string().describe('The UUID of the project'),
  }),
  func: async ({ projectId }) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId, status: { not: 'DONE' } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 5, // Just analyze the top 5 most important tasks
        select: { title: true, priority: true, dueDate: true, status: true },
      });

      if (tasks.length === 0) {
        return 'No pending tasks found. The project seems complete or empty.';
      }

      const actions = tasks.map((t) => {
        let reason = `Priority is ${t.priority}`;
        if (t.dueDate && new Date(t.dueDate) < new Date()) {
          reason = 'OVERDUE!';
        } else if (t.dueDate) {
          reason += ` and due soon (${new Date(t.dueDate).toLocaleDateString()})`;
        }
        return `Focus on "${t.title}" (${t.status}) because: ${reason}.`;
      });

      return JSON.stringify(actions);
    } catch (error: any) {
      return `Error suggesting next actions: ${error.message}`;
    }
  },
});
