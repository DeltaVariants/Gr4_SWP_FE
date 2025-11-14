# Hướng dẫn Merge với nhánh Leader

## ✅ Trạng thái hiện tại

Code của bạn đã được **align với Leader format**:
- ✅ Booking entity: `userName`, `vehicleName`, `stationName`, `status` (lowercase)
- ✅ DTOs layer: Tách biệt Backend DTOs (PascalCase) và Frontend Entities (camelCase)
- ✅ Mappers: Chuyển đổi DTOs → Entities
- ✅ Repositories: Sử dụng DTOs và Mappers

## 📋 Checklist trước khi merge

### 1. Commit tất cả thay đổi hiện tại
```bash
git add .
git commit -m "feat: align entities with Leader format and add DTO layer"
```

### 2. Fetch nhánh của Leader
```bash
git fetch origin feature/admin-dashboard
# hoặc
git fetch origin main
```

### 3. Tạo backup branch (khuyến nghị)
```bash
git checkout -b backup/feature-employee-before-merge
git checkout feature/employee  # quay lại nhánh của bạn
```

## 🔀 Các bước merge

### Bước 1: Merge nhánh Leader vào nhánh của bạn
```bash
git checkout feature/employee
git merge origin/feature/admin-dashboard
# hoặc
git merge origin/main
```

### Bước 2: Xử lý conflicts

Nếu có conflicts, Git sẽ hiển thị:
```
Auto-merging src/domain/entities/Booking.ts
CONFLICT (content): Merge conflict in src/domain/entities/Booking.ts
```

## 🛠️ Các file có thể bị conflict

### 1. **Entities** (Cao nhất)
- `src/domain/entities/Booking.ts` ⚠️
- `src/domain/entities/Battery.ts`
- `src/domain/entities/Station.ts`

**Giải pháp:**
- Code của bạn đã align với Leader format
- Giữ format Leader: `userName`, `vehicleName`, `status` (lowercase)
- Nếu Leader có thêm fields, merge cả hai

### 2. **DTOs** (Mới - ít conflict)
- `src/domain/dto/BookingDTO.ts` ✅ (File mới, không conflict)
- `src/domain/dto/BatteryDTO.ts` ✅ (File mới, không conflict)
- `src/infrastructure/mappers/BookingMapper.ts` ✅ (File mới, không conflict)

### 3. **Repositories**
- `src/infrastructure/repositories/BookingRepository.ts` ⚠️
- `src/infrastructure/repositories/BatteryRepository.ts`

**Giải pháp:**
- Giữ logic mapping DTOs → Entities của bạn
- Merge các methods mới từ Leader nếu có

### 4. **Pages/Components**
- `src/app/(employee)/reservations/page.tsx` ⚠️
- `src/app/(employee)/check-in/*` ⚠️
- `src/app/(employee)/inventory/page.tsx` ⚠️

**Giải pháp:**
- Giữ logic business của bạn
- Merge UI improvements từ Leader nếu có

## 🔧 Cách tôi sẽ giúp sửa conflicts

### Khi bạn gặp conflict, hãy:

1. **Gửi cho tôi file bị conflict:**
   ```
   <<<<<<< HEAD (Your changes)
   ... code của bạn ...
   =======
   ... code của Leader ...
   >>>>>>> origin/feature/admin-dashboard
   ```

2. **Tôi sẽ:**
   - ✅ Phân tích cả hai phần code
   - ✅ Giữ logic business của bạn
   - ✅ Merge các improvements từ Leader
   - ✅ Đảm bảo format Leader được giữ nguyên
   - ✅ Kiểm tra type safety và imports

3. **Sau khi tôi sửa:**
   ```bash
   git add <file>
   git commit -m "fix: resolve merge conflict in <file>"
   ```

## 📝 Ví dụ xử lý conflict

### Conflict trong `Booking.ts`:

**Conflict:**
```typescript
<<<<<<< HEAD
export interface Booking {
  bookingID: string;
  userName: string;        // ✅ Leader format
  vehicleName: string;    // ✅ Leader format
  status: "pending" | "cancelled" | "completed";
}
=======
export interface Booking {
  bookingID: string;
  userName: string;
  vehicleName: string;
  stationName: string;    // Leader có thêm field này
  status: "pending" | "cancelled" | "completed";
}
>>>>>>> origin/feature/admin-dashboard
```

**Giải pháp (tôi sẽ sửa thành):**
```typescript
export interface Booking {
  bookingID: string;
  userName: string;        // ✅ Giữ cả hai
  vehicleName: string;     // ✅ Giữ cả hai
  stationName: string;    // ✅ Merge từ Leader
  status: "pending" | "cancelled" | "completed";  // ✅ Giữ cả hai
}
```

## ✅ Sau khi merge xong

1. **Kiểm tra lỗi:**
   ```bash
   npm run build
   # hoặc
   npm run lint
   ```

2. **Test các tính năng:**
   - ✅ Check-in flow
   - ✅ Reservations page
   - ✅ Inventory page
   - ✅ Dashboard

3. **Commit merge:**
   ```bash
   git commit -m "merge: merge feature/admin-dashboard into feature/employee"
   ```

## 🆘 Nếu gặp vấn đề

1. **Rollback merge:**
   ```bash
   git merge --abort
   ```

2. **Xem conflicts:**
   ```bash
   git status
   git diff
   ```

3. **Nhờ tôi giúp:**
   - Gửi output của `git status`
   - Gửi file bị conflict
   - Tôi sẽ giúp sửa từng file

## 🎯 Lợi ích sau khi merge

- ✅ Code align với Leader format
- ✅ Dễ maintain và merge trong tương lai
- ✅ Type-safe với TypeScript
- ✅ Tách biệt rõ ràng DTOs và Entities

