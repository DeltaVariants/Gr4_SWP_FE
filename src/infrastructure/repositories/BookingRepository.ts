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
  }

  async getByCustomer(customerId: string): Promise<Booking[]> {
    const response = await api.get(`${this.basePath}/customer/${customerId}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(bookingId: string): Promise<Booking> {
    const response = await api.get(`${this.basePath}/${bookingId}`);
    return response.data.data || response.data;
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
    // API: PATCH /api/bookings/{id}?status={status}
    // Status is a QUERY parameter, not body
    const response = await api.patch(`${this.basePath}/${bookingId}`, null, {
      params: { status }
    });
    return response.data.data || response.data;
  }

  async confirm(bookingId: string): Promise<Booking> {
    console.log('[BookingRepository] Confirming booking:', bookingId);
    
    // API: PATCH /api/bookings/{id}?status={status}
    // Try different status values that backend might accept
    const possibleStatuses = ['Booked', 'Confirmed', 'booked', 'confirmed'];
    
    for (const statusValue of possibleStatuses) {
      try {
        console.log(`[BookingRepository] Trying status: "${statusValue}"`);
        const response = await api.patch(`${this.basePath}/${bookingId}`, null, {
          params: { status: statusValue }
        });
        console.log('[BookingRepository] ✅ Confirm SUCCESS with status:', statusValue);
        console.log('[BookingRepository] Response:', response.data);
        return response.data.data || response.data;
      } catch (error: any) {
        const errorStatus = error?.response?.status;
        console.log(`[BookingRepository] ❌ Status "${statusValue}" failed:`, errorStatus);
        
        // If it's not a 400/404/405, throw the error
        if (errorStatus && errorStatus !== 400 && errorStatus !== 404 && errorStatus !== 405) {
          throw error;
        }
        
        // Continue trying next status value
        continue;
      }
    }
    
    // If all attempts failed, throw error
    throw new Error('Không thể xác nhận booking. Đã thử tất cả các status values.');
  }

  async cancel(bookingId: string): Promise<void> {
    await api.delete(`${this.basePath}/${bookingId}`);
  }

  async searchBooking(searchTerm: string): Promise<Booking | null> {
    try {
      // Try searching via API endpoint (if backend supports)
      const response = await api.get(`${this.basePath}/search`, {
        params: { q: searchTerm }
      });
      const data = response.data.data || response.data;
      return data || null;
    } catch (error) {
      console.error('[BookingRepository] Search failed:', error);
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
