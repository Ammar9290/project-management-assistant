import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should hash password and return token', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com', role: 'MEMBER' });

    const result = await service.register({ name: 'Test', email: 'test@test.com', password: 'password' });

    expect(bcrypt.hash).toHaveBeenCalledWith('password', 12);
    expect(result).toEqual({ access_token: 'mockedToken' });
  });

  it('login should return token for valid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hashedPassword', role: 'MEMBER' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ email: 'test@test.com', password: 'password' });

    expect(result).toEqual({ access_token: 'mockedToken' });
  });

  it('login should throw on wrong password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hashedPassword', role: 'MEMBER' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});
