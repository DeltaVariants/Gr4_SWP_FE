import {
  IStationRepository,
  SearchStationsRequest,
  SearchStationResponse,
} from "@/domain/repositories/StationRepository";

/**
 * Use Case: Tìm kiếm trạm gần vị trí với loại pin cụ thể
 *
 * Business Logic:
 * - Validate input (latitude, longitude, batteryType)
 * - Gọi repository để tìm kiếm trạm
 * - API đã tính sẵn distance và durationMinutes, không cần tính lại
 *
 * @param stationRepository - Repository để truy xuất dữ liệu trạm
 * @param request - Request chứa vị trí và loại pin
 * @returns Promise<SearchStationResponse[]> - Danh sách trạm phù hợp với distance và duration
 */
export async function searchStationsByLocationUseCase(
  stationRepository: IStationRepository,
  request: SearchStationsRequest
): Promise<SearchStationResponse[]> {
  // Validate input
  if (!request.latitude || !request.longitude) {
    throw new Error("Latitude and longitude are required");
  }

  if (
    !request.batteryType ||
    !["Small", "Medium", "Large"].includes(request.batteryType)
  ) {
    throw new Error("Battery type must be Small, Medium, or Large");
  }

  try {
    // Gọi repository để tìm kiếm trạm
    const stations = await stationRepository.search(request);

    return stations;
  } catch (error) {
    // Log lỗi
    console.error("[UseCase] Failed to search stations:", error);
    throw error;
  }
}
