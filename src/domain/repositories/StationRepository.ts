import { Station } from "../entities/Station";

// Định nghĩa interface IStationRepository { getAll(): Promise<Station[]> }
export interface IStationRepository {
  /**
   * Lấy danh sách tất cả các trạm
   */
  getAll(): Promise<Station[]>;

  //Sau này có thể thêm các phương thức khác như:
  // getById(stationID: string): Promise<Station | null>;
  // create(station: Station): Promise<Station>;
  // update(station: Station): Promise<Station>;
  // delete(stationID: string): Promise<void>;
}
