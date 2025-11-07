/**
 * Use case: Lấy tất cả users với phân trang
 */

import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/UserRepository";

export async function getAllUsersUseCase(
  userRepository: IUserRepository,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<User[]> {
  // Gọi phương thức getAll từ repository
  const users = await userRepository.getAll(pageNumber, pageSize);

  // Có thể thêm logic nghiệp vụ ở đây nếu cần
  // Ví dụ: kiểm tra quyền, lọc, sắp xếp, v.v.

  return users;
}
