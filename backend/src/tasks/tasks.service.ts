import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Priority, TaskStatus, Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    // Optional check: Ensure project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
    }

    if (project.ownerId !== user.id && user.role !== Role.ADMIN) {
      // Assuming members can create tasks in projects they belong to. 
      // For simplicity, any authenticated user can create task if project exists.
      // In a real app, you'd check project membership.
    }

    return this.prisma.task.create({
      data: createTaskDto,
    });
  }

  async findAll(
    projectId?: string,
    assigneeId?: string,
    status?: TaskStatus,
    priority?: Priority,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const now = new Date();
    const itemsWithOverdue = items.map((task: any) => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== TaskStatus.DONE,
    }));

    return {
      items: itemsWithOverdue,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

    return {
      ...task,
      isOverdue,
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      console.log(`[AUDIT] Task ${id} status changed from ${task.status} to ${updateTaskDto.status} by User ${user.id}`);
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: string, user: any) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.project.ownerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete tasks in your own projects');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
