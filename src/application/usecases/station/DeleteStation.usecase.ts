// Xóa trạm theo tên
// Usecase để xóa một trạm khỏi hệ thống

import { IStationRepository } from "@/domain/repositories/Hoang/StationRepository";

export async function deleteStationUseCase(
  stationRepository: IStationRepository,
  stationName: string
): Promise<void> {
  // Validation cơ bản
  if (!stationName?.trim()) {
    throw new Error("Station name is required for deletion");
  }

  // Có thể thêm logic nghiệp vụ ở đây
  // Ví dụ: kiểm tra quyền admin, log activity, gửi notification, etc.

  // Gọi phương thức delete từ repository
  await stationRepository.delete(stationName);

  // Có thể thêm logic sau khi xóa
  // Ví dụ: log activity, gửi notification, cleanup related data, etc.
}
