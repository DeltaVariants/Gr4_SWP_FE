/**
 * Use case: Xóa user theo ID
 */

import { IUserRepository } from "@/domain/repositories/UserRepository";

export async function deleteUserUseCase(
  userRepository: IUserRepository,
  userID: string
): Promise<void> {
  // Có thể thêm validation hoặc business logic ở đây
  // Ví dụ: kiểm tra quyền admin, không cho phép xóa chính mình, v.v.

  await userRepository.delete(userID);
}
