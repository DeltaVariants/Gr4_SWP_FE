/**
 * Create Swap Transaction From Booking Use Case
 * Tìm hoặc tạo SwapTransaction từ booking để có transactionID cho payment
 * Note: Backend có thể yêu cầu batteries, nhưng chúng ta sẽ thử tìm transaction đã tồn tại trước
 */

import { swapTransactionRepository } from '@/infrastructure/repositories/SwapTransactionRepository';
import { SwapTransaction } from '@/domain/entities/SwapTransaction';
import { Booking } from '@/domain/entities/Booking';
import api from '@/lib/api';

export interface CreateSwapTransactionFromBookingInput {
  booking: Booking;
  stationId: string;
  userId: string;
  vehicleId: string;
  amount?: number;
}

export class CreateSwapTransactionFromBookingUseCase {
  /**
   * Tìm hoặc tạo SwapTransaction từ booking
   * Strategy 1: Tìm SwapTransaction đã tồn tại (backend có thể đã tự động tạo khi confirm booking)
   * Strategy 2: Nếu không tìm thấy, return null - payment sẽ được tạo từ bookingID
   * 
   * Note: Không thể tạo SwapTransaction không có batteries vì oldBatteryID và newBatteryID là required
   * Backend sẽ tự động tạo SwapTransaction khi swap được completed, hoặc payment API sẽ tạo từ bookingID
   */
  async execute(input: CreateSwapTransactionFromBookingInput): Promise<SwapTransaction | null> {
    try {
      const { booking, stationId, userId, vehicleId, amount = 0 } = input;

      console.log('[CreateSwapTransactionFromBooking] Searching for swap transaction from booking:', {
        bookingId: booking.bookingID,
        stationId,
        userId,
        vehicleId,
      });

      // Strategy 1: Tìm SwapTransaction đã tồn tại từ booking
      // Backend có thể đã tự động tạo SwapTransaction khi confirm booking
      try {
        console.log('[CreateSwapTransactionFromBooking] Searching for existing swap transaction...');
        
        // Tìm SwapTransaction từ station transactions
        const swapResponse = await api.get('/stations/swapTransactions');
        const swapTransactions = Array.isArray(swapResponse.data) 
          ? swapResponse.data 
          : (swapResponse.data?.data || []);
        
        const existingTx = swapTransactions.find((tx: any) => {
          const txBookingId = tx.bookingID || tx.bookingId || (tx as any).booking_id;
          return txBookingId === booking.bookingID;
        });
        
        if (existingTx) {
          const txId = existingTx.swapTransactionID || 
                      existingTx.transactionID || 
                      existingTx.swapTransactionId || 
                      (existingTx as any).transactionId ||
                      (existingTx as any).id;
          
          if (txId) {
            console.log('[CreateSwapTransactionFromBooking] ✅ Found existing SwapTransaction:', txId);
            // Get full transaction data
            try {
              const fullTx = await swapTransactionRepository.getById(txId);
              return fullTx;
            } catch (getError) {
              // If getById fails, return the existing transaction data we found
              console.warn('[CreateSwapTransactionFromBooking] Failed to get full transaction, using existing data');
              return existingTx as SwapTransaction;
            }
          }
        }
        
        console.log('[CreateSwapTransactionFromBooking] No existing SwapTransaction found');
      } catch (searchError: any) {
        console.warn('[CreateSwapTransactionFromBooking] Search failed:', searchError?.message);
      }
      
      // Strategy 2: Return null - payment sẽ được tạo từ bookingID
      // Backend có thể không cho phép tạo SwapTransaction không có batteries
      // Vì oldBatteryID và newBatteryID là required trong domain entity
      // Backend sẽ tự động tạo SwapTransaction khi swap được completed
      // Hoặc payment API sẽ tạo từ bookingID
      console.info('[CreateSwapTransactionFromBooking] ⚠️ No SwapTransaction found. Payment will be created from bookingID.');
      return null;
    } catch (error: any) {
      console.error('[CreateSwapTransactionFromBooking] ❌ Error:', error);
      // Don't throw - return null and let payment handle it
      return null;
    }
  }
}

export const createSwapTransactionFromBookingUseCase = new CreateSwapTransactionFromBookingUseCase();
