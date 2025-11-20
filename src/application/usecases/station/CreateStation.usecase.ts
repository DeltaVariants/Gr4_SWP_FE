// Tạo trạm mới
// Viết một hàm async function createStationUseCase() nhận vào repository và dữ liệu station

import { Station } from "@/domain/dto/Hoang/Station";
import {
  IStationRepository,
  CreateStationRequest,
} from "@/domain/repositories/Hoang/StationRepository";

export async function createStationUseCase(
  stationRepository: IStationRepository,
  stationData: CreateStationRequest
): Promise<Station> {
  // Có thể thêm validation logic ở đây trước khi gọi repository
  // Ví dụ: kiểm tra quyền admin, validate dữ liệu, etc.

  // Validate dữ liệu cơ bản
  if (!stationData.stationName?.trim()) {
    throw new Error("Station name is required");
  }

  if (!stationData.stationLocation?.trim()) {
    throw new Error("Station location is required");
  }

  if (stationData.latitude < -90 || stationData.latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (stationData.longitude < -180 || stationData.longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  if (stationData.slotNumber < 1) {
    throw new Error("Slot number must be at least 1");
  }

  // Gọi phương thức create từ repository để tạo trạm mới
  const newStation = await stationRepository.create(stationData);

  // Có thể thêm logic nghiệp vụ sau khi tạo
  // Ví dụ: log activity, gửi notification, etc.

  return newStation;
}
