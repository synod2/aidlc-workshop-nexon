import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import { Table, TableSession, CreateTableDTO, OrderWithItems, OrderItem } from '../models/types';
import { sseService } from './sse.service';

const SALT_ROUNDS = 10;

export class TableService {
  createTable(dto: CreateTableDTO): Omit<Table, 'passwordHash'> {
    const db = getDatabase();

    if (!dto.storeId || !dto.tableNumber || !dto.password) {
      throw new Error('storeId, tableNumber, password are required');
    }

    // Check duplicate
    const existing = db
      .prepare('SELECT id FROM tables WHERE storeId = ? AND tableNumber = ?')
      .get(dto.storeId, dto.tableNumber);
    if (existing) {
      throw new Error('Table number already exists in this store');
    }

    const passwordHash = bcrypt.hashSync(dto.password, SALT_ROUNDS);
    const result = db
      .prepare('INSERT INTO tables (storeId, tableNumber, passwordHash) VALUES (?, ?, ?)')
      .run(dto.storeId, dto.tableNumber, passwordHash);

    return {
      id: result.lastInsertRowid as number,
      storeId: dto.storeId,
      tableNumber: dto.tableNumber,
      createdAt: new Date().toISOString(),
    };
  }

  getTables(storeId: string): Omit<Table, 'passwordHash'>[] {
    const db = getDatabase();
    const tables = db
      .prepare('SELECT id, storeId, tableNumber, createdAt FROM tables WHERE storeId = ? ORDER BY tableNumber ASC')
      .all(storeId) as Omit<Table, 'passwordHash'>[];
    return tables;
  }

  getActiveSession(tableId: number): TableSession | null {
    const db = getDatabase();
    const session = db
      .prepare('SELECT * FROM table_sessions WHERE tableId = ? AND completedAt IS NULL')
      .get(tableId) as TableSession | undefined;
    return session || null;
  }

  startSession(tableId: number, storeId: string): TableSession {
    const db = getDatabase();

    // Check no active session exists
    const existing = this.getActiveSession(tableId);
    if (existing) {
      return existing;
    }

    const id = uuidv4();
    db.prepare('INSERT INTO table_sessions (id, tableId, storeId) VALUES (?, ?, ?)').run(
      id,
      tableId,
      storeId
    );

    return {
      id,
      tableId,
      storeId,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
  }

  completeSession(tableId: number, storeId: string): { sessionId: string; completedAt: string } {
    const db = getDatabase();

    const session = this.getActiveSession(tableId);
    if (!session) {
      throw new Error('No active session for this table');
    }

    const completedAt = new Date().toISOString();
    db.prepare('UPDATE table_sessions SET completedAt = ? WHERE id = ?').run(
      completedAt,
      session.id
    );

    // Broadcast session completed event
    sseService.broadcastSessionCompleted(storeId, { tableId, sessionId: session.id });

    return { sessionId: session.id, completedAt };
  }

  getOrderHistory(
    tableId: number,
    storeId: string,
    startDate?: string,
    endDate?: string
  ): { session: TableSession; orders: OrderWithItems[] }[] {
    const db = getDatabase();

    let query = 'SELECT * FROM table_sessions WHERE tableId = ? AND storeId = ? AND completedAt IS NOT NULL';
    const params: any[] = [tableId, storeId];

    if (startDate) {
      query += ' AND completedAt >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND completedAt <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY completedAt DESC';

    const sessions = db.prepare(query).all(...params) as TableSession[];

    return sessions.map((session) => {
      const orders = db
        .prepare('SELECT * FROM orders WHERE sessionId = ? ORDER BY createdAt ASC')
        .all(session.id) as any[];

      const ordersWithItems: OrderWithItems[] = orders.map((order) => {
        const items = db
          .prepare('SELECT * FROM order_items WHERE orderId = ?')
          .all(order.id) as OrderItem[];
        return { ...order, items };
      });

      return { session, orders: ordersWithItems };
    });
  }
}

export const tableService = new TableService();
