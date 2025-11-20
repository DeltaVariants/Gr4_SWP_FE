import { User } from "@/domain/entities/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllUsers } from "@/application/services/userService";

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action đồng bộ
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    setSelectedUser(state, action: PayloadAction<User>) {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý action bất đồng bộ fetchAllUsers
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false;
          state.users = action.payload;
          state.lastFetched = Date.now();
        }
      )
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      });
  },
});

export const { clearSelectedUser, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
