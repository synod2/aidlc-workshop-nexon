import { Response } from 'express';

interface SSEClient {
  res: Response;
  storeId: string;
}

export class SSEService {
  private clients: SSEClient[] = [];
  private heartbeatIntervals: Map<Response, NodeJS.Timeout> = new Map();

  addClient(res: Response, storeId: string): void {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    this.clients.push({ res, storeId });

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

  broadcast(storeId: string, eventType: string, data: unknown): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients
      .filter((client) => client.storeId === storeId)
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

  broadcastOrderUpdate(storeId: string, order: unknown): void {
    this.broadcast(storeId, 'order_updated', order);
  }

  broadcastOrderDeleted(storeId: string, data: { orderId: number; tableId: number }): void {
    this.broadcast(storeId, 'order_deleted', data);
  }

  broadcastSessionCompleted(storeId: string, data: { tableId: number; sessionId: string }): void {
    this.broadcast(storeId, 'session_completed', data);
  }

  getClientCount(storeId?: string): number {
    if (storeId) {
      return this.clients.filter((c) => c.storeId === storeId).length;
    }
    return this.clients.length;
  }
}

export const sseService = new SSEService();
