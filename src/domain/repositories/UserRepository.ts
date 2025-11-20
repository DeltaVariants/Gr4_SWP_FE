import { User } from "../entities/User";

/**
 * Interface định nghĩa các phương thức để tương tác với User data
 */
export interface IUserRepository {
  /**
   * Lấy danh sách tất cả người dùng với phân trang
   * @param pageNumber - Số trang (bắt đầu từ 1)
   * @param pageSize - Số lượng items mỗi trang
   */
  getAll(pageNumber: number, pageSize: number): Promise<User[]>;

  /**
   * Lấy thông tin user theo ID
   * @param userID - ID của user
   */
  getById(userID: string): Promise<User | null>;

  /**
   * Xóa user theo ID
   * @param userID - ID của user cần xóa
   */
  delete(userID: string): Promise<void>;

  // Có thể thêm các phương thức khác:
  // create(user: Omit<User, 'userID'>): Promise<User>;
  // update(userID: string, user: Partial<User>): Promise<User>;
}
