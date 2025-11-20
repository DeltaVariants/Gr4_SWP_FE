# Vehicle Use Cases

Use Cases cho domain Vehicle - chứa business logic và orchestration cho các operations liên quan đến xe.

## Use Cases Available

### 1. GetAllVehiclesUseCase

**Mục đích**: Lấy danh sách tất cả xe của người dùng

**Business Logic**:

- Fetch danh sách xe từ repository
- Logging activity
- Có thể thêm filtering/sorting nếu cần

**Usage**:

```typescript
import { getAllVehiclesUseCase } from "@/application/usecases/vehicle";
import { vehicleRepositoryAPI } from "@/infrastructure/repositories/VehicleRepositoryAPI.impl";

const vehicles = await getAllVehiclesUseCase(vehicleRepositoryAPI);
```

---

### 2. GetVehicleByIdUseCase

**Mục đích**: Lấy thông tin chi tiết một xe theo ID

**Business Logic**:

- Validate vehicleId (không được rỗng)
- Fetch thông tin xe từ repository
- Kiểm tra quyền sở hữu (có thể thêm)
- Logging activity

**Usage**:

```typescript
import { getVehicleByIdUseCase } from "@/application/usecases/vehicle";
import { vehicleRepositoryAPI } from "@/infrastructure/repositories/VehicleRepositoryAPI.impl";

const vehicle = await getVehicleByIdUseCase(vehicleRepositoryAPI, "vehicle-id");
```

**Error Handling**:

- Throws `Error` nếu vehicleId rỗng
- Returns `null` nếu không tìm thấy xe

---

### 3. SelectVehicleUseCase

**Mục đích**: Chọn xe hiện tại để hiển thị

**Business Logic**:

- Validate vehicle object
- Lưu lựa chọn vào localStorage để persist
- Logging activity
- Clear selection nếu pass `null`

**Usage**:

```typescript
import { selectVehicleUseCase } from "@/application/usecases/vehicle";

// Chọn xe
await selectVehicleUseCase(vehicle);

// Clear selection
await selectVehicleUseCase(null);
```

**Features**:

- ✅ Persist selection vào localStorage
- ✅ Validate vehicle object
- ✅ Support clear selection

---

### 4. GetLastSelectedVehicleIdUseCase

**Mục đích**: Lấy ID của xe đã chọn trước đó từ localStorage

**Business Logic**:

- Đọc từ localStorage
- Returns `null` nếu không có hoặc đang ở server-side

**Usage**:

```typescript
import { getLastSelectedVehicleIdUseCase } from "@/application/usecases/vehicle";

const lastSelectedId = getLastSelectedVehicleIdUseCase();
```

---

## Architecture Flow

```
Component (CarInfoCard)
    ↓
Redux Slice (vehicleSlice)
    ↓
Service (vehicleService - Redux Thunks)
    ↓
✅ USE CASE LAYER ✅ (Business Logic)
    ↓
Repository Interface (IVehicleRepository)
    ↓
Repository Implementation (VehicleRepositoryAPI)
    ↓
API (lib/api.ts)
    ↓
Backend API
```

## Benefits of Use Case Layer

1. **Separation of Concerns**: Business logic tách biệt khỏi infrastructure
2. **Testability**: Dễ dàng test business logic độc lập
3. **Reusability**: Use cases có thể được sử dụng ở nhiều nơi
4. **Maintainability**: Dễ maintain và extend
5. **Validation**: Centralized input validation
6. **Logging**: Centralized logging cho audit trail

## Example Integration

```typescript
// application/services/vehicleService.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllVehiclesUseCase } from "../usecases/vehicle";
import { vehicleRepositoryAPI } from "@/infrastructure/repositories/VehicleRepositoryAPI.impl";

export const fetchAllVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async () => {
    // Service gọi use case thay vì gọi repository trực tiếp
    return await getAllVehiclesUseCase(vehicleRepositoryAPI);
  }
);
```

## Future Enhancements

Có thể thêm các use cases khác:

- `CreateVehicleUseCase` - Tạo xe mới
- `UpdateVehicleUseCase` - Cập nhật thông tin xe
- `DeleteVehicleUseCase` - Xóa xe
- `ValidateVehicleOwnershipUseCase` - Kiểm tra quyền sở hữu xe
- `GetVehicleHistoryUseCase` - Lấy lịch sử sử dụng xe
- `AssignBatteryToVehicleUseCase` - Gán pin cho xe

## Testing

```typescript
// __tests__/GetAllVehicles.usecase.test.ts
import { getAllVehiclesUseCase } from "../GetAllVehicles.usecase";
import { MockVehicleRepository } from "@/infrastructure/repositories/__mocks__";

describe("GetAllVehiclesUseCase", () => {
  it("should return all vehicles", async () => {
    const mockRepo = new MockVehicleRepository();
    const vehicles = await getAllVehiclesUseCase(mockRepo);
    expect(vehicles).toHaveLength(2);
  });
});
```
