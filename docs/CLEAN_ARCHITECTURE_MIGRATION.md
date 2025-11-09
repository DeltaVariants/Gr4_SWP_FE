# Clean Architecture Migration - Auth & Employee

## 📋 Tổng quan

Dự án đã được tổ chức lại theo **Clean Architecture** cho phần **Auth** và **Employee**, phù hợp với cấu trúc mà leader đã thiết lập cho Admin và Customer.

## 🏗️ Cấu trúc thư mục

```
src/
├── domain/                                    # Domain Layer
│   ├── entities/
│   │   ├── Auth.ts                           # ✅ Auth entities
│   │   ├── Booking.ts                        # ✅ Booking entities  
│   │   └── Battery.ts                        # ✅ Battery entities
│   └── repositories/
│       ├── IAuthRepository.ts                # ✅ Auth repository interface
│       ├── IBookingRepository.ts             # ✅ Booking repository interface
│       └── IBatteryRepository.ts             # ✅ Battery repository interface
│
├── infrastructure/                            # Infrastructure Layer
│   └── repositories/
│       ├── AuthRepository.ts                 # ✅ Auth repository implementation
│       ├── BookingRepository.ts              # ✅ Booking repository implementation
│       └── BatteryRepository.ts              # ✅ Battery repository implementation
│
├── application/                               # Application Layer
│   └── use-cases/
│       ├── auth/
│       │   ├── LoginUseCase.ts              # ✅ Login business logic
│       │   ├── RegisterUseCase.ts           # ✅ Register business logic
│       │   ├── LogoutUseCase.ts             # ✅ Logout business logic
│       │   ├── GetCurrentUserUseCase.ts     # ✅ Get current user logic
│       │   └── index.ts                     # ✅ Export configured instances
│       ├── booking/
│       │   ├── GetBookingsByStationUseCase.ts   # ✅
│       │   ├── CheckInBookingUseCase.ts         # ✅
│       │   ├── CompleteSwapUseCase.ts           # ✅
│       │   └── index.ts                         # ✅
│       └── battery/
│           ├── GetBatteriesByStationUseCase.ts  # ✅
│           ├── GetBatteryInventoryUseCase.ts    # ✅
│           └── index.ts                         # ✅
│
├── presentation/                              # Presentation Layer
│   └── hooks/
│       ├── useAuth.ts                        # ✅ Custom auth hook
│       ├── useBookings.ts                    # ✅ Custom bookings hook
│       └── useBatteries.ts                   # ✅ Custom batteries hook
│
├── contexts/
│   ├── AuthContext.tsx                       # ✅ Updated to use new hooks
│   └── AuthContext.tsx.backup                # Backup của file cũ
│
└── lib/
    └── api.ts                                # Axios instance (giữ nguyên)
```

## 🎯 Các file đã tạo

### Domain Layer (8 files)
1. ✅ `src/domain/entities/Auth.ts`
2. ✅ `src/domain/entities/Booking.ts`
3. ✅ `src/domain/entities/Battery.ts`
4. ✅ `src/domain/repositories/IAuthRepository.ts`
5. ✅ `src/domain/repositories/IBookingRepository.ts`
6. ✅ `src/domain/repositories/IBatteryRepository.ts`

### Infrastructure Layer (3 files)
7. ✅ `src/infrastructure/repositories/AuthRepository.ts`
8. ✅ `src/infrastructure/repositories/BookingRepository.ts`
9. ✅ `src/infrastructure/repositories/BatteryRepository.ts`

### Application Layer (10 files)
10. ✅ `src/application/use-cases/auth/LoginUseCase.ts`
11. ✅ `src/application/use-cases/auth/RegisterUseCase.ts`
12. ✅ `src/application/use-cases/auth/LogoutUseCase.ts`
13. ✅ `src/application/use-cases/auth/GetCurrentUserUseCase.ts`
14. ✅ `src/application/use-cases/auth/index.ts`
15. ✅ `src/application/use-cases/booking/GetBookingsByStationUseCase.ts`
16. ✅ `src/application/use-cases/booking/CheckInBookingUseCase.ts`
17. ✅ `src/application/use-cases/booking/CompleteSwapUseCase.ts`
18. ✅ `src/application/use-cases/booking/index.ts`
19. ✅ `src/application/use-cases/battery/GetBatteriesByStationUseCase.ts`
20. ✅ `src/application/use-cases/battery/GetBatteryInventoryUseCase.ts`
21. ✅ `src/application/use-cases/battery/index.ts`

### Presentation Layer (3 files)
22. ✅ `src/presentation/hooks/useAuth.ts`
23. ✅ `src/presentation/hooks/useBookings.ts`
24. ✅ `src/presentation/hooks/useBatteries.ts`

### Contexts (1 file updated)
25. ✅ `src/contexts/AuthContext.tsx` (Updated)

## 🔄 Cách sử dụng

### 1. Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: '123456' });
      // Auto redirect to dashboard based on role
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### 2. Bookings (Employee)

```tsx
import { useBookings } from '@/presentation/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';

function ReservationsPage() {
  const { user } = useAuth();
  const { bookings, loading, error, refetch, checkIn } = useBookings(user?.stationId);

  const handleCheckIn = async (bookingId: string, vehicleId: string) => {
    try {
      await checkIn({ bookingId, vehicleId });
      // Booking state will be automatically updated
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.bookingID}>
          {booking.customerName} - {booking.bookingStatus}
          <button onClick={() => handleCheckIn(booking.bookingID, booking.vehicleId)}>
            Check In
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Battery Inventory

```tsx
import { useBatteries } from '@/presentation/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

function InventoryPage() {
  const { user } = useAuth();
  const { batteries, inventory, loading, refetch } = useBatteries(user?.stationId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Inventory Summary</h2>
      <p>Total: {inventory?.total}</p>
      <p>Available: {inventory?.available}</p>
      <p>In Use: {inventory?.inUse}</p>

      <h2>Batteries</h2>
      {batteries.map(battery => (
        <div key={battery.batteryId}>
          {battery.batteryCode} - {battery.status}
        </div>
      ))}
    </div>
  );
}
```

## 📊 Flow Diagram

```
User Action (Click Login)
        ↓
Component sử dụng useAuth hook
        ↓
Hook gọi loginUseCase.execute()
        ↓
Use Case validate & gọi authRepository.login()
        ↓
Repository gọi API qua lib/api.ts
        ↓
API response
        ↓
Repository lưu tokens vào localStorage
        ↓
Use Case trả về AuthResponse
        ↓
Hook update state
        ↓
Context redirect dựa vào role
        ↓
Component re-render với user data
```

## ✅ Benefits

1. **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
2. **Testability**: Dễ dàng mock repositories và test use cases
3. **Maintainability**: Thay đổi API không ảnh hưởng business logic
4. **Reusability**: Use cases và hooks có thể tái sử dụng
5. **Type Safety**: TypeScript interfaces đảm bảo type safety
6. **Consistency**: Cấu trúc giống với Admin/Customer của leader

## 📝 Next Steps

### Cần làm tiếp:
- [ ] Update trang `/app/(employee)/reservations/page.tsx` để sử dụng `useBookings`
- [ ] Update trang `/app/(employee)/inventory/page.tsx` để sử dụng `useBatteries`
- [ ] Update trang `/app/(employee)/swap/page.tsx` để sử dụng `useBookings` và `useBatteries`
- [ ] Update trang `/app/(auth)/login/page.tsx` để sử dụng `useAuth` mới
- [ ] Update trang `/app/(auth)/register/page.tsx` để sử dụng `useAuth` mới
- [ ] Thêm unit tests cho use cases
- [ ] Xóa code cũ không dùng nữa (authService, bookingService cũ)

## 🚀 Testing

```bash
# Chạy dev server
npm run dev

# Test login
# Truy cập: http://localhost:3000/login

# Test employee features (sau khi login với role STAFF)
# Truy cập: http://localhost:3000/dashboardstaff
# Truy cập: http://localhost:3000/reservations
# Truy cập: http://localhost:3000/inventory
```

## 📚 References

- Clean Architecture by Robert C. Martin
- Domain-Driven Design (DDD)
- SOLID Principles
- Next.js Documentation
