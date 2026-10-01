export interface QueuedItem {
  id: string;
  type: 'checkin' | 'report' | 'sos';
  payload: any;
  queuedAt: string;
}

const STORAGE_KEY = 'rakshak_offline_queue';

class OfflineQueueManager {
  private queue: QueuedItem[] = [];
  private isProcessing = false;
  private listeners: Array<(count: number) => void> = [];

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    this.notify();
  }

  public enqueue(type: 'checkin' | 'report' | 'sos', payload: any) {
    const item: QueuedItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      queuedAt: new Date().toISOString(),
    };
    this.queue.push(item);
    this.saveToStorage();
    return item;
  }

  public getQueueCount(): number {
    return this.queue.length;
  }

  public subscribe(listener: (count: number) => void) {
    this.listeners.push(listener);
    listener(this.queue.length);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.queue.length));
  }

  public async processQueue(handler?: (item: QueuedItem) => Promise<boolean>) {
    if (this.isProcessing || this.queue.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;
    const itemsToProcess = [...this.queue];
    const remaining: QueuedItem[] = [];

    for (const item of itemsToProcess) {
      try {
        if (handler) {
          const success = await handler(item);
          if (!success) remaining.push(item);
        } else {
          // If no custom handler, items are dequeued
        }
      } catch {
        remaining.push(item);
      }
    }

    this.queue = remaining;
    this.saveToStorage();
    this.isProcessing = false;
  }

  public clearQueue() {
    this.queue = [];
    this.saveToStorage();
  }
}

export const offlineQueue = new OfflineQueueManager();
