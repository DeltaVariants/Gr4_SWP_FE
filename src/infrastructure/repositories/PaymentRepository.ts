/**
 * Payment Repository Implementation
 * Implements IPaymentRepository using API calls
 */

import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';
import { Payment, CreatePaymentData, PayOSWebhookData } from '@/domain/entities/Payment';
import api from '@/lib/api';

export class PaymentRepository implements IPaymentRepository {
  private readonly basePath = '/payment';

  async getAll(): Promise<Payment[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<Payment> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByUser(userID: string): Promise<Payment[]> {
    const response = await api.get(`${this.basePath}/user/${userID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getBySwapTransaction(swapTransactionID: string): Promise<Payment | null> {
    try {
      const response = await api.get(`${this.basePath}/swap/${swapTransactionID}`);
      return response.data.data || response.data || null;
    } catch (error) {
      console.error('[PaymentRepository] Get by swap transaction failed:', error);
      return null;
    }
  }

  async create(data: CreatePaymentData): Promise<Payment> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async updateStatus(id: string, status: Payment['paymentStatus']): Promise<Payment> {
    const response = await api.patch(`${this.basePath}/${id}`, { status });
    return response.data.data || response.data;
  }

  async createPayOSPayment(data: {
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ paymentUrl: string; orderCode: string }> {
    // API: POST /api/payment
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async handlePayOSWebhook(data: PayOSWebhookData): Promise<void> {
    // API: POST /api/payment/payos/webhook
    await api.post(`${this.basePath}/payos/webhook`, data);
  }
}

// Export singleton instance
export const paymentRepository = new PaymentRepository();
