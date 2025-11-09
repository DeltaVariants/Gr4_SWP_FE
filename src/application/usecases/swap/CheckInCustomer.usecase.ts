/**
 * Check In Customer Use Case
 * Employee checks in customer with vehicle info
 */

import { bookingRepository } from '@/infrastructure/repositories/BookingRepository';
import { vehicleRepository } from '@/infrastructure/repositories/VehicleRepository';
import { Booking } from '@/domain/entities/Booking';

export interface CheckInCustomerInput {
  bookingId: string;
  vehicleId?: string;
  licensePlate?: string;
  notes?: string;
}

export class CheckInCustomerUseCase {
  async execute(input: CheckInCustomerInput): Promise<Booking> {
    try {
      // Get booking
      const booking = await bookingRepository.getById(input.bookingId);

      if (booking.bookingStatus !== 'Booked') {
        throw new Error('Chỉ có thể check-in booking đã được xác nhận');
      }

      let vehicleId = input.vehicleId;

      // If licensePlate provided, search for vehicle
      if (input.licensePlate && !vehicleId) {
        const vehicle = await vehicleRepository.getByLicensePlate(input.licensePlate);
        if (vehicle) {
          vehicleId = vehicle.vehicleID;
        } else {
          throw new Error(`Không tìm thấy xe với biển số: ${input.licensePlate}`);
        }
      }

      if (!vehicleId) {
        throw new Error('Vui lòng cung cấp vehicleId hoặc licensePlate');
      }

      // Check in booking (Booked -> Checked)
      const checkedBooking = await bookingRepository.checkIn({
        bookingId: input.bookingId,
        vehicleId,
        notes: input.notes,
      });

      console.log('[CheckInCustomerUseCase] ✅ Customer checked in:', checkedBooking);

      return checkedBooking;
    } catch (error: any) {
      console.error('[CheckInCustomerUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể check-in khách hàng');
    }
  }
}

export const checkInCustomerUseCase = new CheckInCustomerUseCase();
