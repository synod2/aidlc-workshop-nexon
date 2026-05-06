type SSEEventHandler = (data: any) => void;

export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, SSEEventHandler[]> = new Map();

  connect(token: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.eventSource = new EventSource(`/api/sse/orders?token=${token}`);

    this.eventSource.onopen = () => {
      console.log('Admin SSE: connected successfully');
    };

    this.eventSource.onerror = () => {
      console.warn('Admin SSE: connection error, will auto-reconnect...');
    };

    this.eventSource.addEventListener('connected', (event) => {
      console.log('Admin SSE: server confirmed connection', event.data);
    });

    this.eventSource.addEventListener('new_order', (event) => {
      this.emit('new_order', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('order_updated', (event) => {
      this.emit('order_updated', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('order_deleted', (event) => {
      this.emit('order_deleted', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('session_completed', (event) => {
      this.emit('session_completed', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('table_request', (event) => {
      this.emit('table_request', JSON.parse(event.data));
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  on(event: string, handler: SSEEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}

export const sseClient = new SSEClient();
