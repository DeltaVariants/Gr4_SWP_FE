// bookingService: DEPRECATED - Use BookingRepository instead
// This service uses old architecture - prefer using BookingRepository
// Keeping for backward compatibility with existing code (dashboardstaff)
// ✅ Updated to use DTOs and Mappers for consistency
import api from '@/lib/api';
import { BookingDTO, ApiResponse } from '@/domain/dto/BookingDTO';
import { BookingMapper } from '@/infrastructure/mappers/BookingMapper';
import { Booking } from '@/domain/entities/Booking';

const bookingService = {
  async getAllBookingOfStation(stationID?: string): Promise<Booking[]> {
    try {
      // Use axios instance which calls backend directly (same as BookingRepository)
      // Backend endpoint: GET /api/stations/bookings
      // Backend automatically filters by staff's station
      const response = await api.get<ApiResponse<BookingDTO[]> | BookingDTO[]>('/stations/bookings');
      
      // Handle both ApiResponse and direct array
      let dtos: BookingDTO[] = [];
      if (Array.isArray(response.data)) {
        dtos = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        dtos = (response.data as ApiResponse<BookingDTO[]>).data || [];
      }
      
      console.log('[bookingService] getAllBookingOfStation response:', {
        stationID,
        count: dtos.length,
      });
      
      // ✅ Map DTOs → Entities (Leader format)
      return BookingMapper.toEntities(dtos);
    } catch (error: any) {
      console.error('[bookingService] Failed to fetch bookings:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch bookings');
    }
  },

  // For verifying reservation: get bookings of a user (customer)
  async getAllBookingOfUser(query?: Record<string, string>) {
    try {
      const response = await api.get('/bookings/customer', { params: query });
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('[bookingService] Failed to fetch user bookings:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch user bookings');
    }
  },

  async updateBookingStatus(bookingID: string, bookingStatus: string) {
    try {
      // API expects query parameter, not body
      const response = await api.patch(`/bookings/${bookingID}`, null, {
        params: { status: bookingStatus }
      });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('[bookingService] Failed to update booking status:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to update booking status');
    }
  },
};

export default bookingService;
