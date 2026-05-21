import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findAll returns paginated results', async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Proj' }]);
    (prisma.project.count as jest.Mock).mockResolvedValue(1);

    const result = await service.findAll(undefined, 1, 10);
    expect(result.items.length).toBe(1);
    expect(result.meta.total).toBe(1);
  });

  it('findOne returns task counts', async () => {
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Proj',
      tasks: [{ status: 'TODO' }, { status: 'DONE' }, { status: 'TODO' }],
    });

    const result = await service.findOne('1');
    expect(result.taskCounts).toEqual({ TODO: 2, DONE: 1 });
  });

  it('remove throws on non-owner', async () => {
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: '1', ownerId: 'user1' });

    await expect(service.remove('1', { id: 'user2', role: 'MEMBER' })).rejects.toThrow('You can only delete your own projects');
  });
});
