import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import {
  Admin,
  Table,
  AdminTokenPayload,
  TableTokenPayload,
  CreateAdminDTO,
  LoginDTO,
  TableLoginDTO,
} from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret-key';
const JWT_EXPIRES_IN = '16h';
const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory login attempt tracking
const loginAttempts: Map<string, { count: number; lockedUntil: number | null }> = new Map();

export class AuthService {
  registerAdmin(dto: CreateAdminDTO): { admin: Omit<Admin, 'passwordHash'>; token: string } {
    const db = getDatabase();

    // Validate input
    if (!dto.storeId || !dto.username || !dto.password) {
      throw new Error('storeId, username, password are required');
    }
    if (dto.password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    // Ensure store exists
    const existingStore = db.prepare('SELECT id FROM stores WHERE id = ?').get(dto.storeId);
    if (!existingStore) {
      db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(dto.storeId, dto.storeId);
    }

    // Check duplicate
    const existingAdmin = db
      .prepare('SELECT id FROM admins WHERE storeId = ? AND username = ?')
      .get(dto.storeId, dto.username);
    if (existingAdmin) {
      throw new Error('Username already exists in this store');
    }

    // Hash password and create admin
    const passwordHash = bcrypt.hashSync(dto.password, SALT_ROUNDS);
    const result = db
      .prepare('INSERT INTO admins (storeId, username, passwordHash) VALUES (?, ?, ?)')
      .run(dto.storeId, dto.username, passwordHash);

    const admin = {
      id: result.lastInsertRowid as number,
      storeId: dto.storeId,
      username: dto.username,
      createdAt: new Date().toISOString(),
    };

    const payload: AdminTokenPayload = {
      adminId: admin.id,
      storeId: admin.storeId,
      role: 'admin',
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { admin, token };
  }

  loginAdmin(dto: LoginDTO): { admin: Omit<Admin, 'passwordHash'>; token: string } {
    const db = getDatabase();
    const identifier = `${dto.storeId}:${dto.username}`;

    // Check login attempts
    this.checkLoginAttempts(identifier);

    // Find admin
    const admin = db
      .prepare('SELECT * FROM admins WHERE storeId = ? AND username = ?')
      .get(dto.storeId, dto.username) as Admin | undefined;

    if (!admin) {
      this.incrementAttempts(identifier);
      throw new Error('Invalid credentials');
    }

    // Verify password
    const valid = bcrypt.compareSync(dto.password, admin.passwordHash);
    if (!valid) {
      this.incrementAttempts(identifier);
      throw new Error('Invalid credentials');
    }

    // Reset attempts on success
    loginAttempts.delete(identifier);

    const payload: AdminTokenPayload = {
      adminId: admin.id,
      storeId: admin.storeId,
      role: 'admin',
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      admin: {
        id: admin.id,
        storeId: admin.storeId,
        username: admin.username,
        createdAt: admin.createdAt,
      },
      token,
    };
  }

  loginTable(dto: TableLoginDTO): { table: Omit<Table, 'passwordHash'>; token: string } {
    const db = getDatabase();

    const table = db
      .prepare('SELECT * FROM tables WHERE storeId = ? AND tableNumber = ?')
      .get(dto.storeId, dto.tableNumber) as Table | undefined;

    if (!table) {
      throw new Error('Invalid credentials');
    }

    const valid = bcrypt.compareSync(dto.password, table.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const payload: TableTokenPayload = {
      tableId: table.id,
      storeId: table.storeId,
      tableNumber: table.tableNumber,
      role: 'table',
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      table: {
        id: table.id,
        storeId: table.storeId,
        tableNumber: table.tableNumber,
        createdAt: table.createdAt,
      },
      token,
    };
  }

  verifyToken(token: string): AdminTokenPayload | TableTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AdminTokenPayload | TableTokenPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  private checkLoginAttempts(identifier: string): void {
    const attempt = loginAttempts.get(identifier);
    if (!attempt) return;

    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      const remainingMs = attempt.lockedUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new Error(`Account locked. Try again in ${remainingMin} minutes`);
    }

    // Reset if lock expired
    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
      loginAttempts.delete(identifier);
    }
  }

  private incrementAttempts(identifier: string): void {
    const attempt = loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
    attempt.count += 1;

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = Date.now() + LOCK_DURATION_MS;
    }

    loginAttempts.set(identifier, attempt);
  }
}

export const authService = new AuthService();
