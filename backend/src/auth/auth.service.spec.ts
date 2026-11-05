import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import argon2 from 'argon2';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUsersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock_jwt_token'),
    };
    authService = new AuthService(mockUsersService, mockJwtService);
  });

  describe('register', () => {
    it('throws ConflictException if email already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and returns user and token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on invalid password', async () => {
      const hash = await argon2.hash('real_password');
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: hash,
      });

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns user and token on valid credentials', async () => {
      const hash = await argon2.hash('correct_password');
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        displayName: 'John Doe',
        passwordHash: hash,
      });

      const result = await authService.login({
        email: 'user@example.com',
        password: 'correct_password',
      });

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.displayName).toBe('John Doe');
    });
  });
});
