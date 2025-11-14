/**
 * Booking Repository Implementation
 * Implements IBookingRepository using API calls
 * Sử dụng DTOs và Mappers để tách biệt format backend và frontend
 */

import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking, CheckInData, SwapData, CreateBookingData } from '@/domain/entities/Booking';
import { BookingDTO, ApiResponse } from '@/domain/dto/BookingDTO';
import { BookingMapper } from '@/infrastructure/mappers/BookingMapper';
import api from '@/lib/api';

export class BookingRepository implements IBookingRepository {
  private readonly basePath = '/bookings';

  async getByStation(stationId: string): Promise<Booking[]> {
    try {
      // Backend endpoint: GET /api/stations/bookings
      // Backend tự động filter theo station của staff đang login
      const response = await api.get<ApiResponse<BookingDTO[]> | BookingDTO[]>('/stations/bookings');
      
      // Backend có thể trả về ApiResponse<T> hoặc array trực tiếp
      let dtos: BookingDTO[] = [];
      if (Array.isArray(response.data)) {
        // Response là array trực tiếp
        dtos = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Response là ApiResponse wrapper
        dtos = (response.data as ApiResponse<BookingDTO[]>).data || [];
      }
      
      console.log('[BookingRepository] getByStation response:', {
        stationId,
        count: dtos.length,
        sample: dtos.length > 0 ? dtos[0] : null
      });
      
      // Map DTOs → Entities
      return BookingMapper.toEntities(dtos);
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
    const response = await api.get<ApiResponse<BookingDTO[]> | BookingDTO[]>(`${this.basePath}/customer/${customerId}`);
    
    // Handle both ApiResponse and direct array
    let dtos: BookingDTO[] = [];
    if (Array.isArray(response.data)) {
      dtos = response.data;
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      dtos = (response.data as ApiResponse<BookingDTO[]>).data || [];
    }
    
    return BookingMapper.toEntities(dtos);
  }

  async getById(bookingId: string): Promise<Booking> {
    try {
      const response = await api.get<ApiResponse<BookingDTO> | BookingDTO>(`${this.basePath}/${bookingId}`);
      
      // Handle both ApiResponse and direct DTO
      let dto: BookingDTO;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        dto = (response.data as ApiResponse<BookingDTO>).data;
      } else {
        dto = response.data as BookingDTO;
      }
      
      return BookingMapper.toEntity(dto);
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
    status: Booking['status']  // ✅ Updated to use new status type
  ): Promise<Booking> {
    // Backend endpoint: PATCH /api/bookings/{id}?status={status}
    // Backend expects lowercase status: "completed" or "cancelled"
    // Status is already lowercase from entity
    const statusLower = status.toLowerCase();
    
    console.log('[BookingRepository] Updating booking status:', { bookingId, status, statusLower });
    
    try {
      const response = await api.patch<ApiResponse<BookingDTO> | BookingDTO>(`${this.basePath}/${bookingId}`, null, {
        params: { status: statusLower }
      });
      
      // Backend returns SwapTransactionResponseDTOs when status="completed", or null when status="cancelled"
      // If response contains booking data, map it; otherwise construct from bookingId
      let dto: BookingDTO | null = null;
      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
          dto = (response.data as ApiResponse<BookingDTO>).data;
        } else {
          dto = response.data as BookingDTO;
        }
      }
      
      console.log('[BookingRepository] ✅ Status updated successfully:', { bookingId, status, dto });
      
      // If backend returned booking data, map it; otherwise construct minimal booking
      if (dto && dto.BookingID) {
        return BookingMapper.toEntity(dto);
      } else {
        // Fallback: construct minimal booking from bookingId
        return {
          bookingID: bookingId,
          userName: '',
          vehicleName: '',
          stationName: '',
          batteryType: '',
          planName: 'pay-per-swap',
          bookingTime: '',
          createdAt: '',
          status: status,
        };
      }
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
    
    // Backend returns SwapTransactionResponseDTOs, not BookingDTO
    // We need to extract swapTransactionId and fetch booking separately
    const responseData = response.data.data || response.data;
    
    // Extract SwapTransactionID from response
    const swapTransactionId = responseData?.swapTransactionID || 
                              responseData?.SwapTransactionID || 
                              responseData?.swapTransaction?.swapTransactionID ||
                              responseData?.swapTransaction?.SwapTransactionID;
    
    console.log('[BookingRepository] ✅ Booking confirmed:', {
      bookingId,
      swapTransactionId,
      responseData
    });
    
    // Try to get updated booking, or construct from bookingId
    let booking: Booking;
    try {
      booking = await this.getById(bookingId);
    } catch (e) {
      // If getById fails, construct minimal booking
      booking = {
        bookingID: bookingId,
        userName: '',
        vehicleName: '',
        stationName: '',
        batteryType: '',
        planName: 'pay-per-swap',
        bookingTime: '',
        createdAt: '',
        status: 'completed',
      };
    }
    
    return {
      booking,
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
