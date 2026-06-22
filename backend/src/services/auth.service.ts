import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { INITIAL_COINS } from '../utils/constants';
import { prisma } from '../utils/prisma';
import type { RegisterDTO, LoginDTO } from '../types/index';

export class AuthService {
  /**
   * Register a new bettor account.
   * Returns JWT token and user info (without passwordHash).
   */
  async register(dto: RegisterDTO) {
    // Check for duplicate username
    const existing = await prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new AppError('用户名已存在', 400);
    }

    // Validate username length
    if (dto.username.length < 2 || dto.username.length > 20) {
      throw new AppError('用户名长度需在 2-20 个字符之间', 400);
    }

    // Validate password length
    if (dto.password.length < 6) {
      throw new AppError('密码长度不能少于 6 位', 400);
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        coins: INITIAL_COINS,
        role: 'BETTOR',
      },
    });

    // Record initial coin transaction
    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        amount: INITIAL_COINS,
        type: 'INITIAL',
        balanceAfter: INITIAL_COINS,
      },
    });

    const token = signToken(user.id, user.role);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Login with username and password.
   */
  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { username: dto.username } });
    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError('用户名或密码错误', 401);
    }

    if (user.isBanned) {
      throw new AppError('账号已被封禁', 403);
    }

    const token = signToken(user.id, user.role);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Get current user info by userId.
   */
  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        coins: true,
        isBanned: true,
        lastCheckInDate: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // Compute check-in status
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.lastCheckInDate
      ? user.lastCheckInDate.toISOString().slice(0, 10)
      : null;
    const canCheckIn = lastDate !== today;

    return this.sanitizeUser({ ...user, canCheckIn });
  }

  /**
   * Remove sensitive fields from user object.
   */
  private sanitizeUser(user: {
    id: number;
    username: string;
    role: string;
    coins: number;
    isBanned: boolean;
    lastCheckInDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    passwordHash?: string;
    canCheckIn?: boolean;
  }) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

/** Custom application error */
export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const authService = new AuthService();
