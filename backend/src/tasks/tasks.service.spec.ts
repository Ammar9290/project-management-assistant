import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findAll filters correctly and computes isOverdue', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    (prisma.task.findMany as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Task 1', dueDate: pastDate, status: 'TODO' },
      { id: '2', title: 'Task 2', dueDate: null, status: 'DONE' }
    ]);
    (prisma.task.count as jest.Mock).mockResolvedValue(2);

    const result = await service.findAll('proj1');
    expect(result.items[0].isOverdue).toBe(true);
    expect(result.items[1].isOverdue).toBe(false);
  });

  it('update logs audit entry for status change', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: '1', status: 'TODO', project: { id: 'p1' } });
    (prisma.task.update as jest.Mock).mockResolvedValue({ id: '1', status: 'DONE' });

    await service.update('1', { status: 'DONE' }, { id: 'user1' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[AUDIT] Task 1 status changed from TODO to DONE by User user1'));
  });
});
