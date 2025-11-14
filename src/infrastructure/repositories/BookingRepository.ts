/**
 * Booking Repository Implementation
 * Implements IBookingRepository using API calls
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking, CheckInData, SwapData, CreateBookingData } from '@/domain/entities/Booking';
import api from '@/lib/api';

export class BookingRepository implements IBookingRepository {
  private readonly basePath = '/bookings';

  async getByStation(stationId: string): Promise<Booking[]> {
    try {
      // Backend endpoint: GET /api/stations/bookings
      // Backend tự động filter theo station của staff đang login
      const response = await api.get('/stations/bookings');
      
      // API returns array directly, not wrapped in {data: [...]}
      const data = response.data;
      
      console.log('[BookingRepository] getByStation response:', {
        stationId,
        responseType: Array.isArray(data) ? 'array' : typeof data,
        count: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
      
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      // Handle network errors gracefully - return empty array instead of throwing
      if (error.message?.includes('Network Error') || error.message?.includes('No response received')) {
        console.warn('[BookingRepository] Network error in getByStation (non-critical):', error.message);
        return []; // Return empty array instead of throwing
      }
      // Re-throw other errors
      throw error;
    }
  }

  async getByCustomer(customerId: string): Promise<Booking[]> {
    const response = await api.get(`${this.basePath}/customer/${customerId}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(bookingId: string): Promise<Booking> {
    try {
      const response = await api.get(`${this.basePath}/${bookingId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      // Handle 405 (Method Not Allowed) gracefully - backend may not support GET /api/bookings/{id}
      if (error?.response?.status === 405) {
        console.warn('[BookingRepository] GET /api/bookings/{id} not supported (405), returning null');
        throw new Error('GET /api/bookings/{id} endpoint is not supported by backend');
      }
      throw error;
    }
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async checkIn(data: CheckInData): Promise<Booking> {
    const response = await api.post(`${this.basePath}/${data.bookingId}/check-in`, {
      vehicleId: data.vehicleId,
      notes: data.notes,
    });
    return response.data.data || response.data;
  }

  async completeSwap(data: SwapData): Promise<Booking> {
    const response = await api.post(`${this.basePath}/${data.bookingId}/swap`, {
      oldBatteryId: data.oldBatteryId,
      newBatteryId: data.newBatteryId,
      notes: data.notes,
    });
    return response.data.data || response.data;
  }

  async updateStatus(
    bookingId: string,
    status: Booking['bookingStatus']
  ): Promise<Booking> {
    // Backend endpoint: PATCH /api/bookings/{id}?status={status}
    // Backend expects lowercase status: "completed" or "cancelled"
    // Convert status to lowercase to match backend enum
    const statusLower = typeof status === 'string' ? status.toLowerCase() : status;
    
    console.log('[BookingRepository] Updating booking status:', { bookingId, status, statusLower });
    
    try {
      const response = await api.patch(`${this.basePath}/${bookingId}`, null, {
        params: { status: statusLower }
      });
      
      // Backend returns SwapTransactionResponseDTOs when status="completed", or null when status="cancelled"
      const responseData = response.data;
      
      console.log('[BookingRepository] ✅ Status updated successfully:', { bookingId, status, responseData });
      
      // Return updated booking (backend may not return booking, so we construct it)
      return {
        bookingID: bookingId,
        bookingStatus: status as any,
      } as Booking;
    } catch (error: any) {
      console.error('[BookingRepository] ❌ Failed to update status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update booking status';
      throw new Error(errorMessage);
    }
  }

  async confirm(bookingId: string): Promise<{ booking: Booking; swapTransactionId?: string }> {
    // Backend endpoint: PATCH /api/bookings/{id}?status=completed
    // Backend tự động tạo SwapTransaction với status="initiated" khi status="completed"
    // Backend trả về SwapTransactionResponseDTOs với SwapTransactionID
    const response = await api.patch(`${this.basePath}/${bookingId}`, null, {
      params: { status: 'completed' }
    });
    
    const responseData = response.data.data || response.data;
    
    // Extract SwapTransactionID from response
    // Backend returns SwapTransactionResponseDTOs when status="completed"
    const swapTransactionId = responseData?.swapTransactionID || 
                              responseData?.SwapTransactionID || 
                              responseData?.swapTransaction?.swapTransactionID ||
                              responseData?.swapTransaction?.SwapTransactionID;
    
    console.log('[BookingRepository] ✅ Booking confirmed:', {
      bookingId,
      swapTransactionId,
      responseData
    });
    
    return {
      booking: responseData,
      swapTransactionId
    };
  }

  async cancel(bookingId: string): Promise<void> {
    await api.delete(`${this.basePath}/${bookingId}`);
  }

  async searchBooking(searchTerm: string): Promise<Booking | null> {
    try {
      // NOTE: Backend endpoint GET /api/bookings/{id} is currently broken
      // It returns 405 (Method Not Allowed) - backend may have changed routing
      // We'll skip getById and try search endpoint only
      
      // Try searching via API endpoint (if backend supports)
      try {
        const response = await api.get(`${this.basePath}/search`, {
          params: { q: searchTerm }
        });
        const data = response.data.data || response.data;
        if (data) {
          console.log('[BookingRepository] ✅ Found booking via search endpoint');
          return data;
        }
      } catch (searchError: any) {
        // If 404 or 405 (Method Not Allowed), endpoint doesn't exist
        if (searchError?.response?.status === 404 || searchError?.response?.status === 405) {
          console.log('[BookingRepository] Search endpoint not available (404/405)');
          // Don't try getById as fallback because it also returns 405
          return null;
        } else {
          // Other errors, log but don't throw
          console.warn('[BookingRepository] Search endpoint error:', searchError?.response?.status, searchError?.message);
          return null;
        }
      }
      
      return null;
    } catch (error: any) {
      // Don't log as error - just return null silently
      console.warn('[BookingRepository] Search failed (non-critical):', error?.message || 'Unknown error');
      return null;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    console.log('[BookingRepository] Updating booking status:', { bookingId, status });
    // API expects query parameter, not body
    await api.patch(`${this.basePath}/${bookingId}`, null, {
      params: { status }
    });
    console.log('[BookingRepository] ✅ Status updated successfully');
  }
}

// Export singleton instance
export const bookingRepository = new BookingRepository();
