import { Station } from "../entities/Station";

export interface CreateStationRequest {
  stationName: string;
  stationLocation: string;
  latitude: number;
  longitude: number;
  slotNumber: number;
}

export interface SearchStationsRequest {
  latitude: number;
  longitude: number;
  batteryType: "Small" | "Medium" | "Large";
}

// Response type from search API
export interface SearchStationResponse {
  stationName: string;
  stationLocation: string;
  stationCapacity: number;
  distance: number; // in kilometers (from API)
  durationMinutes: number; // travel time in minutes (from API)
  availableSlots: number;
  batteryTypeID: string;
  latitude?: number; // coordinates for map navigation
  longitude?: number; // coordinates for map navigation
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

  /**
   * Tìm kiếm trạm gần vị trí với loại pin cụ thể
   * API trả về stations với distance và durationMinutes đã tính sẵn
   */
  search(request: SearchStationsRequest): Promise<SearchStationResponse[]>;

  //Sau này có thể thêm các phương thức khác như:
  // getById(stationID: string): Promise<Station | null>;
  // update(station: Station): Promise<Station>;
}
