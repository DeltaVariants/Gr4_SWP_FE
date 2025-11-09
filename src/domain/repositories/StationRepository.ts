import { Station } from "../entities/Station";

export interface CreateStationRequest {
  stationName: string;
  stationLocation: string;
  latitude: number;
  longitude: number;
  slotNumber: number;
}

// Định nghĩa interface IStationRepository { getAll(): Promise<Station[]> }
export interface IStationRepository {
  /**
   * Lấy danh sách tất cả các trạm
   */
  getAll(): Promise<Station[]>;

  /**
   * Tạo trạm mới
   */
  create(station: CreateStationRequest): Promise<Station>;

  /**
   * Xóa trạm theo tên
   */
  delete(stationName: string): Promise<void>;

  //Sau này có thể thêm các phương thức khác như:
  // getById(stationID: string): Promise<Station | null>;
  // update(station: Station): Promise<Station>;
}
