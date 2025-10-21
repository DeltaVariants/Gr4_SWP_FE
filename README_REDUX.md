# Hướng dẫn sử dụng Redux với Clean Architecture

## 1. Cài đặt

Đã cài đặt sẵn các package:

- `@reduxjs/toolkit`
- `react-redux`

## 2. Cấu trúc thư mục

```
src/
  application/
    store.ts                # Khởi tạo Redux store
    slices/
      authSlice.ts          # Ví dụ slice quản lý state đăng nhập
    hooks/
      useRedux.ts           # Custom hook cho Redux
    providers/
      ReduxProvider.tsx     # Provider bọc toàn bộ app
```

## 3. Sử dụng trong dự án

### a. Kết nối Redux vào app

- Đã bọc `ReduxProvider` trong `src/app/layout.tsx`.

### b. Tạo slice mới

- Tạo file mới trong `src/application/slices/`.
- Sử dụng `createSlice` từ `@reduxjs/toolkit`.

### c. Sử dụng state và dispatch trong component

```tsx
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { login, logout } from "@/application/slices/authSlice";

const dispatch = useAppDispatch();
const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

// Đăng nhập
// dispatch(login('username'));
```

### d. Thêm slice vào store

- Import reducer vào `src/application/store.ts` và thêm vào object `reducer`.

## 4. Clean Architecture

- **application/**: Chứa logic quản lý state, hooks, provider.
- **presentation/**: Chỉ sử dụng hook và selector, không chứa logic state.

## 5. Tham khảo

- [Redux Toolkit](https://redux-toolkit.js.org/tutorials/quick-start)
- [Clean Architecture](https://github.com/eduardomoroni/react-clean-architecture)

## 6. Kiến thức cơ bản về Redux

### Redux là gì?

Redux là một thư viện quản lý state phổ biến trong các ứng dụng JavaScript, đặc biệt là với React. Nó giúp lưu trữ và quản lý trạng thái ứng dụng một cách dễ dàng và có tổ chức.

### Các khái niệm chính:

- **Store**: Nơi lưu trữ toàn bộ state của ứng dụng.
- **Action**: Một đối tượng mô tả sự thay đổi cần thực hiện trên state. Action thường có hai thuộc tính chính:
  - `type`: Mô tả loại hành động.
  - `payload`: Dữ liệu cần thiết để thực hiện hành động (tuỳ chọn).
- **Reducer**: Một hàm nhận vào state hiện tại và action, sau đó trả về state mới.
- **Dispatch**: Phương thức để gửi action đến reducer.
- **Selector**: Hàm dùng để lấy dữ liệu từ state.

### Luồng hoạt động của Redux:

1. **Dispatch**: Gửi một action.
2. **Reducer**: Nhận action và cập nhật state.
3. **Store**: Lưu trữ state mới.
4. **Component**: Nhận state mới và render lại giao diện.

### Ví dụ đơn giản:

```javascript
// Action
const increment = { type: "INCREMENT" };

// Reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    default:
      return state;
  }
}

// Store
import { createStore } from "redux";
const store = createStore(counterReducer);

// Dispatch action
store.dispatch(increment);
console.log(store.getState()); // Output: 1
```

### Khi nào nên sử dụng Redux?

- Ứng dụng có nhiều state cần chia sẻ giữa các component.
- State phức tạp và cần quản lý tập trung.
- Cần kiểm soát lịch sử thay đổi state (debugging, undo/redo).

### Tham khảo thêm:

- [Redux Documentation](https://redux.js.org/introduction/getting-started)
