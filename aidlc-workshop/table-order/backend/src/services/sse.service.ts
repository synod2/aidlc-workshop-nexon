import { Response } from 'express';

interface SSEClient {
  res: Response;
  storeId: string;
  tableId?: number; // undefined = admin client
}

export class SSEService {
  private clients: SSEClient[] = [];
  private heartbeatIntervals: Map<Response, NodeJS.Timeout> = new Map();

  addClient(res: Response, storeId: string, tableId?: number): void {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ storeId, tableId: tableId || null })}\n\n`);

    this.clients.push({ res, storeId, tableId });
    console.log(`SSE client connected: storeId=${storeId}, tableId=${tableId || 'admin'}, total=${this.clients.length}`);

    // Start heartbeat
    const interval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        this.removeClient(res);
      }
    }, 30000);
    this.heartbeatIntervals.set(res, interval);

    // Handle disconnect
    res.on('close', () => {
      this.removeClient(res);
    });
  }

  removeClient(res: Response): void {
    this.clients = this.clients.filter((client) => client.res !== res);
    const interval = this.heartbeatIntervals.get(res);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(res);
    }
  }

  /** Broadcast to admin clients only */
  broadcast(storeId: string, eventType: string, data: unknown): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients
      .filter((client) => client.storeId === storeId && !client.tableId)
      .forEach((client) => {
        try {
          client.res.write(payload);
        } catch {
          this.removeClient(client.res);
        }
      });
  }

  /** Broadcast to a specific table client */
  broadcastToTable(storeId: string, tableId: number, eventType: string, data: unknown): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    const targetTableId = Number(tableId);
    this.clients
      .filter((client) => client.storeId === storeId && Number(client.tableId) === targetTableId)
      .forEach((client) => {
        try {
          client.res.write(payload);
          console.log(`SSE sent to table ${targetTableId}: ${eventType}`);
        } catch {
          this.removeClient(client.res);
        }
      });
  }

  /** Broadcast to all table clients in a store */
  broadcastToAllTables(storeId: string, eventType: string, data: unknown): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients
      .filter((client) => client.storeId === storeId && client.tableId !== undefined)
      .forEach((client) => {
        try {
          client.res.write(payload);
        } catch {
          this.removeClient(client.res);
        }
      });
  }

  broadcastNewOrder(storeId: string, order: unknown): void {
    this.broadcast(storeId, 'new_order', order);
  }

  broadcastOrderUpdate(storeId: string, order: any): void {
    this.broadcast(storeId, 'order_updated', order);
    // Also notify the table
    if (order.tableId) {
      this.broadcastToTable(storeId, order.tableId, 'order_updated', order);
    }
  }

  broadcastOrderDeleted(storeId: string, data: { orderId: number; tableId: number }): void {
    this.broadcast(storeId, 'order_deleted', data);
  }

  broadcastSessionCompleted(storeId: string, data: { tableId: number; sessionId: string }): void {
    this.broadcast(storeId, 'session_completed', data);
  }

  broadcastTableRequest(storeId: string, data: { tableId: number; tableNumber: number; requestType: string; message: string }): void {
    this.broadcast(storeId, 'table_request', data);
  }

  getClientCount(storeId?: string): number {
    if (storeId) {
      return this.clients.filter((c) => c.storeId === storeId).length;
    }
    return this.clients.length;
  }
}

export const sseService = new SSEService();
