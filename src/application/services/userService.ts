import { userRepositoryAPI } from "@/infrastructure/repositories/UserRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Async thunk để fetch tất cả users
 */
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async ({
    pageNumber = 1,
    pageSize = 20,
  }: {
    pageNumber?: number;
    pageSize?: number;
  } = {}) => {
    try {
      const users = await userRepositoryAPI.getAll(pageNumber, pageSize);
      return users;
    } catch (error) {
      throw error;
    }
  }
);
