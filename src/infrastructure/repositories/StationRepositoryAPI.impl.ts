// Hàm này sẽ triển khai "Hợp đồng" IStationRepository
// Nơi mà fetch thực sự được gọi

import { Station } from "@/domain/entities/Station";
import { IStationRepository } from "@/domain/repositories/StationRepository";

// Lớp này "Triển khai" (implements) cái "Hợp đồng" IStationRepository
class StationRepositoryAPI implements IStationRepository {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    if (!this.baseURL) {
      console.error("Base URL is not defined");
    }
  }

  /**
   * Triển khai cụ thể getAll() để fetch từ API
   */
  async getAll(): Promise<Station[]> {
    const endpoint = "/Station/AllStations";
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        //Tối ưu cache của Next.js (ví dụ: cache 1 giờ)
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        // Xử lý lỗi nếu API trả về status code không phải 2xx
        console.error(`API error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch stations from:' ${url}`);
      }
      // Parse JSON
      const data: Station[] = await response.json();

      //trả về mảng stations
      //giả sử API trả về cấu trúc khác, cần xử lí thêm ở đây
      return data as Station[];
    } catch (error) {
      console.error("Error fetching stations:", error);
      //trả về mảnh rỗng hoặc ném lỗi tùy nghiệp vụ
      throw error;
    }
  }
}

//xuất ra một instance của lớp này
export const stationRepositoryAPI = new StationRepositoryAPI();
