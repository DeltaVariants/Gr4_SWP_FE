/**
 * BookingMapper - Map từ Backend DTO → Frontend Entity
 * Tách biệt format backend (PascalCase) và frontend (camelCase)
 */

import { BookingDTO } from '@/domain/dto/BookingDTO';
import { Booking } from '@/domain/entities/Booking';

export class BookingMapper {
  /**
   * Map từ Backend DTO (PascalCase) → Frontend Entity (camelCase)
   * Format Leader: userName, vehicleName, stationName, status (lowercase)
   */
  static toEntity(dto: BookingDTO): Booking {
    return {
      bookingID: dto.BookingID || '',
      userName: dto.UserName || '',
      vehicleName: dto.VehicleName || '',
      stationName: dto.StationName || '',
      batteryType: dto.BatteryType || '',
      planName: dto.PlanName || 'pay-per-swap',
      bookingTime: dto.BookingTime || '',
      createdAt: dto.CreatedAt || '',
      status: this.normalizeStatus(dto.Status),
    };
  }

  /**
   * Map array of DTOs
   */
  static toEntities(dtos: BookingDTO[]): Booking[] {
    return dtos.map(dto => this.toEntity(dto));
  }

  /**
   * Normalize status từ backend → frontend format
   * Backend có: "pending", "confirmed", "cancelled", "completed"
   * Frontend (Leader format): "pending" | "cancelled" | "completed"
   * 
   * Note: "confirmed" từ backend có thể map thành "pending" hoặc giữ nguyên tùy business logic
   */
  private static normalizeStatus(status?: string): "pending" | "cancelled" | "completed" {
    if (!status) return 'pending';
    
    const normalized = status.toLowerCase().trim();
    
    // Backend có "confirmed" nhưng frontend chỉ có 3 status
    // Map "confirmed" → "pending" (vì confirmed booking vẫn đang pending swap)
    if (normalized === 'confirmed') {
      return 'pending';
    }
    
    // Map các status khác
    if (normalized === 'pending' || normalized === 'cancelled' || normalized === 'completed') {
      return normalized;
    }
    
    // Default fallback
    return 'pending';
  }

  /**
   * Map từ Frontend Entity → Backend DTO (cho create/update requests)
   */
  static toCreateDTO(entity: Partial<Booking>): Partial<BookingDTO> {
    return {
      BookingID: entity.bookingID,
      UserName: entity.userName,
      VehicleName: entity.vehicleName,
      StationName: entity.stationName,
      BatteryType: entity.batteryType,
      PlanName: entity.planName,
      BookingTime: entity.bookingTime,
      CreatedAt: entity.createdAt,
      Status: entity.status,
    };
  }
}

