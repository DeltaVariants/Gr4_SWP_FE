# Battery Update Use Cases

Use Cases mới cho việc cập nhật pin theo Clean Architecture.

## 📋 Use Cases Mới

### 1. UpdateBatteryPercentageUseCase

**Mục đích**: Cập nhật % pin của viên pin

**API**: `PATCH /api/batteries/{id}`  
**Body**: `{ currentPercentage: number }`

**Business Logic**:

- ✅ Validate batteryID (không được rỗng)
- ✅ Validate currentPercentage (0-100)
- ✅ Kiểm tra currentPercentage là số hợp lệ
- ✅ Logging activity
- ✅ Error handling

**Usage**:

```typescript
import { updateBatteryPercentageUseCase } from "@/application/usecases/battery";
import { batteryUpdateRepository } from "@/infrastructure/repositories/BatteryUpdateRepositoryAPI.impl";

// Cập nhật % pin
const response = await updateBatteryPercentageUseCase(
  batteryUpdateRepository,
  "MED_251105201156_6774",
  85 // 85%
);
```

**Redux Service Usage**:

```typescript
import { updateBatteryPercentage } from "@/application/services/batteryUpdateService";

// Dispatch action
dispatch(
  updateBatteryPercentage({
    batteryID: "MED_251105201156_6774",
    currentPercentage: 85,
  })
);
```

---

### 2. UpdateBatterySlotUseCase

**Mục đích**: Gán pin vào slot hoặc tháo pin khỏi slot

**API**: `PATCH /api/batteries/{id}`

**3 Use Cases**:

#### A. Gán pin vào slot

**Body**: `{ batterySlotID: string }`

```typescript
import { updateBatterySlotUseCase } from "@/application/usecases/battery";

// Gán pin vào slot
const response = await updateBatterySlotUseCase(
  batteryUpdateRepository,
  "MED_251105201156_6774",
  "Slot_1"
);
```

**Redux**:

```typescript
dispatch(
  updateBatterySlot({
    batteryID: "MED_251105201156_6774",
    slotID: "Slot_1",
  })
);
```

#### B. Gán pin vào slot + Cập nhật % đồng thời

**Body**: `{ batterySlotID: string, currentPercentage: number }`

```typescript
// Gán pin vào slot và update % luôn
const response = await updateBatterySlotUseCase(
  batteryUpdateRepository,
  "MED_251105201156_6774",
  "Slot_1",
  85 // 85%
);
```

**Redux**:

```typescript
dispatch(
  updateBatterySlot({
    batteryID: "MED_251105201156_6774",
    slotID: "Slot_1",
    currentPercentage: 85,
  })
);
```

#### C. Tháo pin khỏi slot

**Body**: `{}` (empty)

```typescript
// Tháo pin khỏi slot hiện tại
const response = await updateBatterySlotUseCase(
  batteryUpdateRepository,
  "MED_251105201156_6774",
  null // hoặc undefined
);
```

**Redux**:

```typescript
dispatch(
  updateBatterySlot({
    batteryID: "MED_251105201156_6774",
    slotID: null,
  })
);
```

---

## 🏗️ Clean Architecture Implementation

### Layer Structure

```
📱 Presentation Layer (Page/Component)
    ↓
🎯 Application Layer
    ├─ Service (batteryUpdateService.ts)
    │   ├─ updateBatteryPercentage() ← Redux Thunk
    │   └─ updateBatterySlot() ← Redux Thunk
    └─ ✅ USE CASES ⭐
         ├─ updateBatteryPercentageUseCase()
         └─ updateBatterySlotUseCase()
    ↓
📦 Domain Layer
    ├─ Entities
    │   ├─ UpdateBatteryPercentageRequest
    │   └─ AssignBatteryToSlotRequest
    └─ Repository Interface (IBatteryUpdateRepository)
         ├─ updateBatteryPercentage()
         ├─ assignBatteryToSlot()
         └─ removeBatteryFromSlot()
    ↓
🔧 Infrastructure Layer
    └─ Repository Implementation (BatteryUpdateRepositoryAPIImpl)
         ├─ updateBatteryPercentage() → PATCH /batteries/{id}
         ├─ assignBatteryToSlot() → PATCH /batteries/{id}
         └─ removeBatteryFromSlot() → PATCH /batteries/{id}
    ↓
🌐 API (lib/api.ts)
    ↓
☁️ Backend API
```

---

## 📝 Files Created/Updated

### ✅ Created

1. `usecases/battery/UpdateBatteryPercentage.usecase.ts`
2. `usecases/battery/UpdateBatterySlot.usecase.ts`
3. `usecases/battery/index.ts` (export file)

### ✅ Updated

1. `domain/entities/BatteryUpdate.ts`

   - Added `UpdateBatteryPercentageRequest`
   - Added `AssignBatteryToSlotRequest`

2. `domain/repositories/BatteryUpdateRepository.ts`

   - Added `updateBatteryPercentage()`
   - Added `assignBatteryToSlot()`
   - Added `removeBatteryFromSlot()`

3. `infrastructure/repositories/BatteryUpdateRepositoryAPI.impl.ts`

   - Implemented 3 new methods

4. `application/services/batteryUpdateService.ts`
   - Added `updateBatteryPercentage` Redux Thunk
   - Added `updateBatterySlot` Redux Thunk

---

## 🎯 Real-World Example

### Scenario 1: Admin gán pin vào slot rỗng

```typescript
// StationSlotsPage.tsx
import { useAppDispatch } from "@/application/hooks/useRedux";
import { updateBatterySlot } from "@/application/services/batteryUpdateService";

function StationSlotsPage() {
  const dispatch = useAppDispatch();

  const handleAssignBattery = async (
    batteryId: string,
    slotId: string,
    percentage: number
  ) => {
    try {
      await dispatch(
        updateBatterySlot({
          batteryID: batteryId,
          slotID: slotId,
          currentPercentage: percentage,
        })
      ).unwrap();

      console.log("Battery assigned successfully!");
      // Refresh data...
    } catch (error) {
      console.error("Failed to assign battery:", error);
    }
  };

  return (
    <button onClick={() => handleAssignBattery("MED_123", "Slot_1", 80)}>
      Assign Battery
    </button>
  );
}
```

### Scenario 2: Customer cập nhật % pin của xe

```typescript
import { updateBatteryPercentage } from "@/application/services/batteryUpdateService";

const handleUpdatePercentage = async () => {
  try {
    await dispatch(
      updateBatteryPercentage({
        batteryID: "MED_123",
        currentPercentage: 95,
      })
    ).unwrap();

    console.log("Battery percentage updated!");
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

### Scenario 3: Staff tháo pin khỏi slot

```typescript
import { updateBatterySlot } from "@/application/services/batteryUpdateService";

const handleRemoveBattery = async (batteryId: string) => {
  try {
    await dispatch(
      updateBatterySlot({
        batteryID: batteryId,
        slotID: null, // Tháo pin
      })
    ).unwrap();

    console.log("Battery removed from slot!");
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

---

## 🔒 Validation Rules

### UpdateBatteryPercentageUseCase

- ✅ `batteryID` không được rỗng
- ✅ `currentPercentage` phải từ 0-100
- ✅ `currentPercentage` phải là số hợp lệ (Number.isFinite)

### UpdateBatterySlotUseCase

- ✅ `batteryID` không được rỗng
- ✅ `currentPercentage` (nếu có) phải từ 0-100
- ✅ `slotID` null/undefined = tháo pin
- ✅ `slotID` có giá trị = gán pin vào slot

---

## 🧪 Testing

```typescript
// UpdateBatteryPercentage.usecase.test.ts
describe("UpdateBatteryPercentageUseCase", () => {
  it("should update battery percentage", async () => {
    const mockRepo = new MockBatteryUpdateRepository();
    const response = await updateBatteryPercentageUseCase(
      mockRepo,
      "BATTERY_123",
      85
    );
    expect(response.message).toBe("Success");
  });

  it("should throw error for invalid percentage", async () => {
    const mockRepo = new MockBatteryUpdateRepository();
    await expect(
      updateBatteryPercentageUseCase(mockRepo, "BATTERY_123", 150)
    ).rejects.toThrow("Current percentage must be between 0 and 100");
  });

  it("should throw error for empty batteryID", async () => {
    const mockRepo = new MockBatteryUpdateRepository();
    await expect(
      updateBatteryPercentageUseCase(mockRepo, "", 85)
    ).rejects.toThrow("Battery ID is required");
  });
});
```

---

## 🎉 Benefits

1. **Type Safety** - Full TypeScript với interfaces rõ ràng
2. **Validation** - Centralized validation logic
3. **Single Responsibility** - Mỗi use case có 1 nhiệm vụ cụ thể
4. **Testability** - Dễ dàng test business logic
5. **Reusability** - Use cases có thể dùng lại nhiều nơi
6. **Logging** - Centralized logging cho debugging
7. **Error Handling** - Consistent error messages

---

## 🚀 Migration from Old Code

### Before (Direct API call)

```typescript
await api.patch(`/batteries/${batteryID}`, {
  batterySlotID: slotID,
  vehicleID: null,
  currentPercentage: percentage,
});
```

### After (Using Use Cases)

```typescript
dispatch(
  updateBatterySlot({
    batteryID: batteryID,
    slotID: slotID,
    currentPercentage: percentage,
  })
);
```

Advantages:

- ✅ Validation built-in
- ✅ Logging included
- ✅ Redux state management
- ✅ Error handling
- ✅ Testable
