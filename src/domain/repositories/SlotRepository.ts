import { SlotListResponse } from "../entities/Slot";

export interface GetSlotsParams {
  stationID: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ISlotRepository {
  /**
   * Lấy danh sách slots của một station với phân trang
   */
  getSlotsByStation(params: GetSlotsParams): Promise<SlotListResponse>;
}
