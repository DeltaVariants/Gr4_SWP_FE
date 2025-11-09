# Check-in Flow Components

Refactored từ file `spa.tsx` (1240 dòng) thành cấu trúc module hóa, tuân theo Clean Architecture của dự án.

## 📁 Cấu trúc

```
check-in/
├── page.tsx                      # Entry point với Suspense wrapper
├── components/
│   ├── types.ts                  # Type definitions cho tất cả components
│   ├── StepIndicator.tsx         # Progress indicator (5 steps)
│   ├── ScanStep.tsx              # Bước 1: Scan/nhập booking ID
│   ├── VerifyStep.tsx            # Bước 2: Verify thông tin khách hàng
│   ├── PaymentStep.tsx           # Bước 3: Xử lý thanh toán (PayOS QR)
│   ├── SwapStep.tsx              # Bước 4: Đổi pin (chọn OLD/NEW)
│   ├── CompletedStep.tsx         # Bước 5: Hoàn tất thành công
│   └── CheckInContainer.tsx      # Main container orchestrating flow
└── README.md                     # (file này)
```

## 🎯 Custom Hooks (Clean Architecture)

Hooks được đặt trong `src/presentation/hooks/` theo convention:

### **useCheckInFlow.ts**
- Quản lý state của toàn bộ flow (step, bookingData, batteryIds, etc.)
- Navigation methods (goToScan, goToVerify, goToPayment, etc.)
- Update methods (setBookingData, setOldBatteryId, etc.)
- Reset flow

### **useSwapTransaction.ts**
- Load swap transaction từ booking ID
- Gọi multiple endpoints (/swap-transactions, /stations/swapTransactions)
- Return transactionID để dùng cho payment

### **usePayment.ts**
- Quản lý payment flow (select → processing → qr)
- Gọi API tạo payment với transactionID
- Generate QR code URL
- Handle payment errors

## 🔄 Flow Logic

```
1. SCAN
   ↓
   User nhập booking ID
   ↓
2. VERIFY
   ↓
   Load booking data từ API
   Hiển thị thông tin (customer, vehicle, battery type)
   Confirm booking → PATCH /bookings/{id}?status=completed
   Backend tự động tạo SwapTransaction
   ↓
3. PAYMENT
   ↓
   Load SwapTransaction ID
   Chọn phương thức (PayOS)
   POST /payment?transactionID={id}
   Hiển thị QR code
   User xác nhận đã thanh toán
   ↓
4. SWAP
   ↓
   Chọn pin cũ (OUT) từ dropdown
   Chọn pin mới (IN) từ dropdown
   Confirm swap info
   POST /swap-transactions/{id}/completed
   Backend tự động:
     - Update battery status
     - Create battery transfers
     - Update battery slots
   ↓
5. COMPLETED
   ↓
   Hiển thị success message
   Button: Check-in khách tiếp theo → Reset flow
```

## 📊 Components Chi Tiết

### **CheckInContainer.tsx** (Main)
- Kết nối tất cả hooks và components
- Handle business logic:
  - loadBookingData()
  - handleScanSubmit()
  - handleVerifyAndProceedToPayment()
  - handleReset()
- Render component tương ứng với step hiện tại

### **StepIndicator.tsx**
- Hiển thị 5 steps với icons
- Highlight step hiện tại
- Mark steps đã hoàn thành (passed)

### **ScanStep.tsx**
- Input field cho booking ID
- Auto-focus
- Enter key submit
- Validation: không được để trống

### **VerifyStep.tsx**
- Hiển thị thông tin booking (readonly)
- Loading state khi fetch data
- Error state nếu không tìm thấy
- Buttons: Quay lại | Tiếp tục

### **PaymentStep.tsx**
- 3 sub-states: select | processing | qr
- Select: Chọn PayOS
- Processing: Loading animation
- QR: Hiển thị QR code + payment URL
- Handle load SwapTransaction nếu chưa có
- Buttons: Quay lại | Tạo thanh toán | Đã thanh toán

### **SwapStep.tsx**
- 3 sub-steps: scan-old | scan-new | confirm
- Scan-old: Dropdown chọn pin cũ từ station batteries
- Scan-new: Dropdown chọn pin mới (exclude pin cũ)
- Confirm: Hiển thị tổng quan + xác nhận
- Processing: Loading animation
- Call API: POST /swap-transactions/{id}/completed
- Buttons: Quay lại | Tiếp tục | Xác nhận

### **CompletedStep.tsx**
- Success animation (bounce)
- Hiển thị tên khách hàng
- Button: Check-in khách tiếp theo (reset flow)

## 🔧 Integration với Clean Architecture

```
Presentation Layer (UI)
├── hooks/
│   ├── useCheckInFlow.ts          # State management
│   ├── useSwapTransaction.ts      # Business logic
│   ├── usePayment.ts              # Business logic
│   ├── useBookings.ts             # (existing)
│   └── useBatteries.ts            # (existing)
│
└── components/
    └── check-in/                   # Feature components

Application Layer
├── services/
│   ├── swapTransactionService.ts  # API calls
│   └── ...
│
└── usecases/
    ├── booking/                    # Use cases
    └── battery/

Domain Layer
└── entities/
    ├── Booking.ts                  # Domain models
    ├── Battery.ts
    └── ...

Infrastructure Layer
└── repositories/                   # API implementations
```

## 🎨 UI/UX Improvements

- **Progress Indicator**: Rõ ràng, visual feedback tốt
- **Loading States**: Spinner + text mô tả
- **Error Handling**: Alert boxes với icons
- **Validation**: Inline validation trước khi submit
- **Disabled States**: Buttons disabled khi không đủ data
- **Responsive**: Grid layout responsive
- **Colors**: Gradient backgrounds, semantic colors
- **Icons**: Lucide icons cho tất cả actions

## 🐛 Debugging

Console logs có prefix để dễ filter:
- `[CheckIn]` - Main container
- `[PaymentStep]` - Payment component
- `[SwapStep]` - Swap component
- `[useSwapTransaction]` - Hook logic
- `[usePayment]` - Hook logic

## ⚡ Performance

- Lazy loading với Suspense
- useMemo cho filtered lists
- useCallback cho event handlers
- Minimal re-renders với proper state management

## 📝 Maintenance

Khi cần thêm/sửa features:

1. **Thêm step mới**: 
   - Thêm vào `CheckInStep` type trong `types.ts`
   - Tạo component mới `NewStep.tsx`
   - Update `StepIndicator` với step config
   - Add case trong `CheckInContainer`

2. **Sửa business logic**:
   - Update hook tương ứng trong `presentation/hooks/`
   - Component tự động reflect changes

3. **Thêm validation**:
   - Add trong component hoặc hook
   - Show error với `useToast`

## 🧪 Testing

Manual test checklist:
- [ ] Scan với booking ID hợp lệ
- [ ] Scan với booking ID không tồn tại
- [ ] Verify và confirm booking
- [ ] Create payment và QR code
- [ ] Select batteries và complete swap
- [ ] Reset flow và check-in khách mới
- [ ] Handle API errors gracefully
- [ ] Check console logs không có errors

## 📚 References

- Clean Architecture: `src/presentation/README.md`
- Hook conventions: `src/presentation/hooks/useBookings.ts`
- Component structure: `src/app/(employee)/components/README.md`


