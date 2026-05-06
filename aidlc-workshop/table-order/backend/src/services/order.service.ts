import { getDatabase } from '../database/connection';
import {
  Order,
  OrderItem,
  OrderWithItems,
  CreateOrderDTO,
  OrderStatus,
  MenuItem,
} from '../models/types';
import { tableService } from './table.service';
import { sseService } from './sse.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'completed'],
  preparing: ['completed'],
  completed: [],
};

export class OrderService {
  createOrder(dto: CreateOrderDTO): OrderWithItems {
    const db = getDatabase();

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new Error('At least one item is required');
    }
    for (const item of dto.items) {
      if (!item.menuItemId || item.quantity < 1) {
        throw new Error('Each item must have menuItemId and quantity >= 1');
      }
    }

    // Get or create active session
    let session = tableService.getActiveSession(dto.tableId);
    if (!session) {
      session = tableService.startSession(dto.tableId, dto.storeId);
    }

    // Validate menu items and create snapshots
    const orderItems: { menuItemId: number; menuName: string; unitPrice: number; quantity: number }[] = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const menuItem = db
        .prepare('SELECT * FROM menu_items WHERE id = ? AND storeId = ? AND isAvailable = 1')
        .get(item.menuItemId, dto.storeId) as MenuItem | undefined;

      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found or unavailable`);
      }

      orderItems.push({
        menuItemId: menuItem.id,
        menuName: menuItem.name,
        unitPrice: menuItem.price,
        quantity: item.quantity,
      });
      totalAmount += menuItem.price * item.quantity;
    }

    // Create order
    const orderResult = db
      .prepare(
        'INSERT INTO orders (sessionId, tableId, storeId, totalAmount, status) VALUES (?, ?, ?, ?, ?)'
      )
      .run(session.id, dto.tableId, dto.storeId, totalAmount, 'pending');

    const orderId = orderResult.lastInsertRowid as number;

    // Create order items
    const insertItem = db.prepare(
      'INSERT INTO order_items (orderId, menuItemId, menuName, quantity, unitPrice) VALUES (?, ?, ?, ?, ?)'
    );

    const items: OrderItem[] = [];
    for (const item of orderItems) {
      const itemResult = insertItem.run(
        orderId,
        item.menuItemId,
        item.menuName,
        item.quantity,
        item.unitPrice
      );
      items.push({
        id: itemResult.lastInsertRowid as number,
        orderId,
        menuItemId: item.menuItemId,
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    const order: OrderWithItems = {
      id: orderId,
      sessionId: session.id,
      tableId: dto.tableId,
      storeId: dto.storeId,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items,
    };

    // Broadcast SSE event
    sseService.broadcastNewOrder(dto.storeId, order);

    return order;
  }

  getOrders(storeId: string, sessionId?: string, tableId?: number): OrderWithItems[] {
    const db = getDatabase();

    let query = 'SELECT * FROM orders WHERE storeId = ?';
    const params: any[] = [storeId];

    if (sessionId) {
      query += ' AND sessionId = ?';
      params.push(sessionId);
    }
    if (tableId) {
      query += ' AND tableId = ?';
      params.push(tableId);
    }

    // Only show orders from active sessions (not completed)
    query += ' AND sessionId IN (SELECT id FROM table_sessions WHERE completedAt IS NULL)';
    query += ' ORDER BY createdAt DESC';

    const orders = db.prepare(query).all(...params) as Order[];

    return orders.map((order) => {
      const items = db
        .prepare('SELECT * FROM order_items WHERE orderId = ?')
        .all(order.id) as OrderItem[];
      return { ...order, items };
    });
  }

  getOrderById(orderId: number): OrderWithItems | undefined {
    const db = getDatabase();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order | undefined;
    if (!order) return undefined;

    const items = db
      .prepare('SELECT * FROM order_items WHERE orderId = ?')
      .all(orderId) as OrderItem[];
    return { ...order, items };
  }

  updateOrderStatus(orderId: number, status: OrderStatus, storeId: string): OrderWithItems {
    const db = getDatabase();

    const order = db
      .prepare('SELECT * FROM orders WHERE id = ? AND storeId = ?')
      .get(orderId, storeId) as Order | undefined;
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate state transition
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

    const updated = this.getOrderById(orderId)!;

    // Broadcast SSE event
    sseService.broadcastOrderUpdate(storeId, updated);

    return updated;
  }

  deleteOrder(orderId: number, storeId: string): void {
    const db = getDatabase();

    const order = db
      .prepare('SELECT * FROM orders WHERE id = ? AND storeId = ?')
      .get(orderId, storeId) as Order | undefined;
    if (!order) {
      throw new Error('Order not found');
    }

    db.prepare('DELETE FROM order_items WHERE orderId = ?').run(orderId);
    db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);

    // Broadcast SSE event
    sseService.broadcastOrderDeleted(storeId, { orderId, tableId: order.tableId });
  }
}

export const orderService = new OrderService();
