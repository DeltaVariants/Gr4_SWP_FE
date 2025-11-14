# Conflict Resolution Guide - Quick Reference

## 🎯 Nguyên tắc xử lý conflicts

### 1. **Entities** - Luôn giữ Leader format
```typescript
// ✅ ĐÚNG - Leader format
export interface Booking {
  userName: string;      // NOT customerName
  vehicleName: string;  // NOT vehicleId
  status: "pending" | "cancelled" | "completed";  // lowercase
}

// ❌ SAI - Format cũ
export interface Booking {
  customerName: string;
  vehicleId: string;
  bookingStatus: 'Pending' | 'Booked';
}
```

### 2. **DTOs** - Giữ nguyên PascalCase
```typescript
// ✅ ĐÚNG - Backend DTO format
export interface BookingDTO {
  BookingID?: string;
  UserName?: string;
  VehicleName?: string;
  Status?: string;
}
```

### 3. **Mappers** - Luôn map DTO → Entity
```typescript
// ✅ ĐÚNG
static toEntity(dto: BookingDTO): Booking {
  return {
    userName: dto.UserName || '',
    vehicleName: dto.VehicleName || '',
    status: this.normalizeStatus(dto.Status),
  };
}
```

## 📋 Template xử lý conflict

### Khi gặp conflict trong Entity:

1. **Xác định format nào đúng:**
   - Leader format: `userName`, `vehicleName`, `status` (lowercase)
   - Format cũ: `customerName`, `vehicleId`, `bookingStatus`

2. **Merge strategy:**
   ```typescript
   // Giữ Leader format + merge fields mới
   export interface Booking {
     // Core fields (Leader format)
     bookingID: string;
     userName: string;
     vehicleName: string;
     stationName: string;
     status: "pending" | "cancelled" | "completed";
     
     // Fields mới từ Leader (nếu có)
     planName?: string;
     createdAt?: string;
   }
   ```

3. **Cập nhật Mapper:**
   ```typescript
   // Đảm bảo map tất cả fields
   static toEntity(dto: BookingDTO): Booking {
     return {
       bookingID: dto.BookingID || '',
       userName: dto.UserName || '',
       vehicleName: dto.VehicleName || '',
       stationName: dto.StationName || '',
       status: this.normalizeStatus(dto.Status),
       planName: dto.PlanName || 'pay-per-swap',
       createdAt: dto.CreatedAt || '',
     };
   }
   ```

## 🔍 Checklist sau khi sửa conflict

- [ ] Entity format đúng Leader (userName, vehicleName, status lowercase)
- [ ] DTOs giữ PascalCase
- [ ] Mappers map đầy đủ fields
- [ ] Repositories sử dụng Mappers
- [ ] Components dùng Entity fields đúng
- [ ] TypeScript compile không lỗi
- [ ] Không có lỗi linter

## 🚨 Common Conflicts & Solutions

### Conflict 1: Entity field names
```typescript
// YOUR CODE
customerName: string;

// LEADER CODE  
userName: string;

// ✅ SOLUTION
userName: string;  // Giữ Leader format
```

### Conflict 2: Status values
```typescript
// YOUR CODE
bookingStatus: 'Pending' | 'Booked';

// LEADER CODE
status: "pending" | "cancelled" | "completed";

// ✅ SOLUTION
status: "pending" | "cancelled" | "completed";  // Giữ Leader format
```

### Conflict 3: Missing fields
```typescript
// YOUR CODE
export interface Booking {
  bookingID: string;
  userName: string;
}

// LEADER CODE
export interface Booking {
  bookingID: string;
  userName: string;
  stationName: string;  // Field mới
}

// ✅ SOLUTION
export interface Booking {
  bookingID: string;
  userName: string;
  stationName: string;  // Merge field mới
}
```

## 💡 Tips

1. **Luôn ưu tiên Leader format** cho entities
2. **Giữ DTOs riêng biệt** - không mix với entities
3. **Sử dụng Mappers** - không map trực tiếp trong components
4. **Test sau mỗi conflict** - đảm bảo code vẫn chạy

