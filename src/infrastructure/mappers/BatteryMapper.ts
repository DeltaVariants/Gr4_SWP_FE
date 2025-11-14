/**
 * BatteryMapper - Map từ Backend DTO → Frontend Entity
 * Tách biệt format backend (PascalCase) và frontend (camelCase)
 */

import { BatteryResponseDTO, BatteryViewAllDTO, BatteryViewByTypeDTO } from '@/domain/dto/BatteryDTO';
import { Battery } from '@/domain/entities/Battery';

export class BatteryMapper {
  /**
   * Map từ BatteryResponseDTO → Battery Entity
   */
  static fromResponseDTO(dto: BatteryResponseDTO): Battery {
    return {
      batteryId: dto.BatteryID,
      batteryCode: dto.BatteryID, // Use BatteryID as code if not provided
      batteryType: dto.BatteryTypeName || 'Unknown',
      status: this.mapBatteryStatus(dto.BatteryStatus),
      stationId: dto.LastStationID || '',
      
      // Backend fields (kept for reference)
      batteryID: dto.BatteryID,
      batteryTypeID: dto.BatteryTypeID,
      batteryTypeName: dto.BatteryTypeName,
      currentLocation: dto.CurrentLocation,
      batteryStatus: dto.BatteryStatus,
      soH: dto.SoH,
      currentPercentage: dto.CurrentPercentage,
      lastStationID: dto.LastStationID,
    };
  }

  /**
   * Map từ BatteryViewAllDTO → Battery Entity
   */
  static fromViewAllDTO(dto: BatteryViewAllDTO): Battery {
    return {
      batteryId: dto.BatteryID,
      batteryCode: dto.BatteryID,
      batteryType: 'Unknown', // ViewAll không có type info
      status: this.mapBatteryStatus(dto.BatteryStatus),
      stationId: '', // ViewAll không có station info
      
      // Backend fields
      batteryID: dto.BatteryID,
      currentLocation: dto.CurrentLocationStatus,
      batteryStatus: dto.BatteryStatus,
      soH: dto.SoH,
      currentPercentage: dto.CurrentPercentage,
      createdAt: dto.CreatedAt,
    };
  }

  /**
   * Map từ BatteryViewByTypeDTO → Battery Entity
   */
  static fromViewByTypeDTO(dto: BatteryViewByTypeDTO): Battery {
    return {
      batteryId: dto.BatteryID,
      batteryCode: dto.BatteryID,
      batteryType: dto.BatteryTypeName || dto.BatteryModel || 'Unknown',
      status: this.mapBatteryStatus(dto.BatteryStatus),
      stationId: '', // ViewByType không có station info
      
      // Backend fields
      batteryID: dto.BatteryID,
      batteryTypeID: dto.BatteryTypeID,
      batteryTypeName: dto.BatteryTypeName,
      currentLocation: dto.CurrentLocation,
      batteryStatus: dto.BatteryStatus,
      soH: dto.SoH,
      createdAt: dto.CreatedAt,
    };
  }

  /**
   * Map array of DTOs
   */
  static fromResponseDTOs(dtos: BatteryResponseDTO[]): Battery[] {
    return dtos.map(dto => this.fromResponseDTO(dto));
  }

  /**
   * Map battery status từ backend format → frontend format
   * Backend: "available", "faulty", null, etc. (lowercase)
   * Frontend: "Available" | "In-Use" | "Charging" | "Maintenance" | "Damaged"
   */
  private static mapBatteryStatus(status?: string | null): Battery['status'] {
    if (!status) return 'Available'; // Default
    
    const normalized = status.toLowerCase().trim();
    
    switch (normalized) {
      case 'available':
        return 'Available';
      case 'in-use':
      case 'inuse':
        return 'In-Use';
      case 'charging':
        return 'Charging';
      case 'maintenance':
        return 'Maintenance';
      case 'damaged':
      case 'faulty':
        return 'Damaged';
      default:
        return 'Available'; // Default fallback
    }
  }
}

