// Nhận tất cả các trạm
//Viết một hàm async function getAllStationsUseCase(repo: IStationRepository) nhận vào "Hợp đồng" (Lớp 1) và gọi repo.getAll()

import { Station } from "@/domain/dto/Hoang/Station";
import { IStationRepository } from "@/domain/repositories/Hoang/StationRepository";

export async function getAllStationsUseCase(
  stationRepository: IStationRepository
): Promise<Station[]> {
  // Gọi phương thức getAll từ repository để lấy tất cả các trạm
  const stations = await stationRepository.getAll();

  //có thể thêm logic nghiệp vụ ở đây
  //ví dụ: kiểm tra quyền, lọc, chuyển đổi dữ liệu, v.v.

  return stations;
}
