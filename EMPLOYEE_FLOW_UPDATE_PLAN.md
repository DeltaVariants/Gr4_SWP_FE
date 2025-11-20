# Kế hoạch cập nhật Employee Flow - Frontend

## Tổng quan flow mới

Flow mới của employee không còn payment và confirm booking:
1. **Booking List** → Hiển thị danh sách booking, có thể cancel
2. **Check-in (Xác nhận thông tin)** → Xác nhận thông tin khách hàng
3. **Battery Swap (Đổi pin)** → 
   - Nếu khách hàng cũ: Hiển thị thông tin pin cũ, staff có thể xem tình trạng và ghi log (móp méo, etc.)
   - Chọn pin mới phù hợp với loại xe
   - Complete swap
4. **Hoàn thành**

---

## Các bước cần thực hiện

### **BƯỚC 1: Cập nhật Reservations Page (`src/app/(employee)/reservations/page.tsx`)**

**Mục tiêu:** Xóa nút "Confirm" cho pending bookings, chỉ giữ Cancel và Check-in

**Thay đổi:**
- ❌ **XÓA:** Nút "Confirm & Check-in" cho pending bookings
- ✅ **GIỮ:** Nút "Cancel" cho pending bookings
- ✅ **THÊM:** Nút "Check-in" cho pending bookings (đi thẳng đến check-in page, không cần confirm)
- ✅ **GIỮ:** Nút "Check-in" cho waiting bookings (booked/queue)

**API endpoints sử dụng:**
- `PATCH /api/bookings/{id}?status=cancelled` - Cancel booking
- Không cần gọi confirm booking nữa

**Files cần sửa:**
- `src/app/(employee)/reservations/page.tsx`
  - Xóa function `handleConfirmBooking`
  - Xóa state `confirmingId`
  - Cập nhật action buttons: pending → Cancel + Check-in (không có Confirm)

---

### **BƯỚC 2: Cập nhật Check-in Flow (`src/app/(employee)/check-in/`)**

**Mục tiêu:** Đi thẳng từ booking list đến check-in, không cần confirm booking trước

**Thay đổi:**
- ✅ **GIỮ:** Flow Verify → Swap → Completed
- ✅ **CẬP NHẬT:** VerifyStep - Load booking data trực tiếp từ bookingId (không cần swapTransactionId)
- ✅ **CẬP NHẬT:** SwapStep - Tự động tạo SwapTransaction khi vào step Swap (nếu chưa có)

**Logic mới (ĐÃ XÁC NHẬN VỚI BACKEND):**
1. User click "Check-in" từ reservations page → Navigate to `/check-in?bookingId={id}`
2. VerifyStep: Load booking data, hiển thị thông tin khách hàng
3. Khi click "Verify" → Gọi `PATCH /api/bookings/{id}?status=completed`:
   - ✅ Backend tự động tạo SwapTransaction với status="initiated"
   - ✅ Backend tự động chọn NewBatteryID (pin available đầu tiên phù hợp với BatteryType)
   - ✅ Backend tự động lấy OldBatteryID từ vehicle (nếu có)
   - ✅ Backend trả về SwapTransactionResponseDTOs với SwapTransactionID
   - → Chuyển sang SwapStep với swapTransactionId
4. SwapStep: 
   - Load SwapTransaction (đã có NewBatteryID được backend chọn)
   - Hiển thị pin cũ (OldBatteryID) - nếu khách hàng cũ
   - Cho phép log condition pin cũ (nếu cần)
   - **KHÔNG CẦN chọn pin mới** (backend đã tự động chọn rồi)
   - Complete swap với SoH của pin cũ

**API endpoints sử dụng:**
- `GET /api/bookings/{id}` - Lấy booking details
- `PATCH /api/bookings/{id}?status=completed` - Update booking status → Backend tự động tạo SwapTransaction
- `GET /api/swap-transactions/{id}` - Lấy SwapTransaction details (đã có NewBatteryID)
- `GET /api/batteries?vehicleId={vehicleId}` - Lấy pin cũ của vehicle (để hiển thị và log condition)
- `POST /api/battery-condition-logs` - Tạo log tình trạng pin cũ
- `POST /api/swap-transactions/{id}/completed?Soh={soh}` - Complete swap với SoH

**Files cần sửa:**
- `src/app/(employee)/check-in/CheckInContainer.tsx`
  - Cập nhật logic load booking: không cần swapTransactionId từ URL
  - Tự động tạo SwapTransaction khi vào SwapStep (nếu chưa có)
- `src/app/(employee)/check-in/VerifyStep.tsx`
  - Giữ nguyên logic hiện tại (load booking, hiển thị thông tin)
  - Khi verify → Tạo SwapTransaction → Chuyển sang SwapStep

---

### **BƯỚC 3: Cập nhật SwapStep (`src/app/(employee)/check-in/SwapStep.tsx`)**

**Mục tiêu:** Hiển thị pin cũ, cho phép log condition, chọn pin mới, complete swap

**Thay đổi lớn:**

#### 3.1. Hiển thị thông tin pin cũ (nếu khách hàng cũ)
- ✅ Load pin cũ từ vehicle: `GET /api/batteries?vehicleId={vehicleId}`
- ✅ Hiển thị thông tin pin cũ:
  - Battery ID
  - Battery Type
  - SoH (State of Health)
  - Current Percentage
  - Status
  - Created Date

#### 3.2. Component log tình trạng pin cũ
- ✅ Tạo component `OldBatteryConditionLog.tsx`:
  - Hiển thị thông tin pin cũ
  - Form để staff ghi log:
    - Condition (dropdown): "Good", "Damaged", "Dented", "Corroded", "Other"
    - Description (textarea): Mô tả chi tiết (móp méo, v.v.)
  - Button "Log Condition" → Gọi API `POST /api/battery-condition-logs`
  - Sau khi log → Cập nhật battery status thành "faulty" (backend tự động)

#### 3.3. Hiển thị pin mới (đã được backend chọn)
- ✅ **KHÔNG CẦN component chọn pin mới** - Backend đã tự động chọn NewBatteryID khi tạo SwapTransaction
- ✅ Hiển thị thông tin pin mới từ SwapTransaction.NewBatteryID:
  - Load battery details: `GET /api/batteries?batteryID={newBatteryID}`
  - Hiển thị: Battery ID, Type, SoH, Percentage, Status
  - Chỉ hiển thị thông tin, không cho phép thay đổi

#### 3.4. Complete swap với SoH
- ✅ Khi complete swap → Gửi SoH của pin cũ:
  - `POST /api/swap-transactions/{id}/completed?Soh={soh}`
  - SoH lấy từ pin cũ (nếu có)

**API endpoints sử dụng:**
- `GET /api/batteries?vehicleId={vehicleId}` - Lấy pin cũ
- `GET /api/batteries?typeName={batteryType}` - Lấy pin available theo loại
- `POST /api/battery-condition-logs` - Tạo log tình trạng pin
  - Body: `{ BatteryID, Condition, Description }`
- ❌ **KHÔNG CẦN:** `PATCH /api/swap-transactions/{id}` - Backend đã tự động chọn NewBatteryID khi tạo SwapTransaction
- `POST /api/swap-transactions/{id}/completed?Soh={soh}` - Complete swap

**Files cần sửa/tạo:**
- `src/app/(employee)/check-in/SwapStep.tsx`
  - Thêm section hiển thị pin cũ
  - Thêm component `OldBatteryConditionLog`
  - Thêm component `NewBatterySelector`
  - Cập nhật logic complete swap: gửi SoH
- `src/app/(employee)/check-in/OldBatteryConditionLog.tsx` (NEW)
  - Component để hiển thị và log tình trạng pin cũ
- ❌ **KHÔNG CẦN:** `src/app/(employee)/check-in/NewBatterySelector.tsx` - Backend đã tự động chọn pin mới

---

### **BƯỚC 4: Cập nhật Repositories và Services**

**Mục tiêu:** Thêm methods để support flow mới

**Files cần sửa:**
- `src/infrastructure/repositories/Hoang/BatteryRepository.ts`
  - ✅ Đã có: `getByVehicle(vehicleId)` - Lấy pin của vehicle
  - ✅ Đã có: `getByType(typeName)` - Lấy pin theo loại
  - ✅ Đã có: `createConditionLog(data)` - Tạo log tình trạng
- `src/infrastructure/repositories/Hoang/SwapTransactionRepository.ts`
  - ✅ Đã có: `complete(id, soh?)` - Complete swap với SoH
  - ❌ **KHÔNG CẦN:** `update(id, data)` - Backend đã tự động chọn NewBatteryID
- `src/infrastructure/repositories/Hoang/BookingRepository.ts`
  - ✅ Đã có: `getById(id)` - Lấy booking details
  - ✅ Đã có: `updateStatus(id, status)` - Update booking status → Backend tự động tạo SwapTransaction khi status="completed"

**✅ ĐÃ XÁC NHẬN VỚI BACKEND:**
- ✅ Backend tự động tạo SwapTransaction khi `PATCH /api/bookings/{id}?status=completed`
- ✅ Backend tự động chọn NewBatteryID (pin available đầu tiên phù hợp với BatteryType)
- ✅ Backend tự động lấy OldBatteryID từ vehicle (nếu có)
- ✅ Backend trả về SwapTransactionResponseDTOs với SwapTransactionID

---

### **BƯỚC 5: Cập nhật Types và Interfaces**

**Files cần sửa:**
- `src/domain/dto/Hoang/Battery.ts`
  - ✅ Đã có: Battery interface với các fields cần thiết
- `src/domain/dto/Hoang/BatteryCondition.ts`
  - ✅ Đã có: CreateBatteryConditionData interface
- `src/domain/dto/Hoang/SwapTransaction.ts`
  - ✅ Cần kiểm tra: Có field `oldBatteryID`, `newBatteryID`, `soh` không?

---

### **BƯỚC 6: Testing và Validation**

**Test cases:**
1. ✅ Cancel booking từ reservations page
2. ✅ Check-in từ pending booking (không cần confirm)
3. ✅ Verify customer information
4. ✅ Hiển thị pin cũ (nếu khách hàng cũ)
5. ✅ Log tình trạng pin cũ
6. ✅ Hiển thị pin mới (đã được backend tự động chọn)
7. ✅ Complete swap với SoH
8. ✅ Hoàn thành flow

---

## Tóm tắt thay đổi

### Files cần sửa:
1. ✅ `src/app/(employee)/reservations/page.tsx` - Xóa Confirm, thêm Check-in cho pending
2. ✅ `src/app/(employee)/check-in/CheckInContainer.tsx` - Tự động tạo SwapTransaction
3. ✅ `src/app/(employee)/check-in/VerifyStep.tsx` - Giữ nguyên, chỉ cập nhật navigation
4. ✅ `src/app/(employee)/check-in/SwapStep.tsx` - Thêm pin cũ, log condition, chọn pin mới

### Files cần tạo:
1. ✅ `src/app/(employee)/check-in/OldBatteryConditionLog.tsx` - Component log tình trạng pin cũ

### Files cần kiểm tra:
1. ✅ `src/infrastructure/repositories/Hoang/BookingRepository.ts` - Method `updateStatus(id, status)` có trả về SwapTransactionID không?

---

## Lưu ý quan trọng

1. **Backend không còn payment:** Flow mới không có payment, chỉ có swap transaction
2. **Backend không còn confirm booking:** Không cần gọi confirm booking, đi thẳng đến check-in
3. **SwapTransaction tự động tạo:** Cần kiểm tra backend có tự động tạo SwapTransaction khi vào SwapStep không
4. **SoH của pin cũ:** Khi complete swap, cần gửi SoH của pin cũ (nếu có)
5. **Battery condition log:** Sau khi log condition, backend tự động set battery status thành "faulty"

---

## Thứ tự thực hiện

1. **Bước 1:** Cập nhật Reservations Page (xóa Confirm, thêm Check-in)
2. **Bước 2:** Cập nhật Check-in Flow (tự động tạo SwapTransaction)
3. **Bước 3:** Cập nhật SwapStep (pin cũ, log condition, chọn pin mới)
4. **Bước 4:** Testing và validation

---

## ✅ ĐÃ XÁC NHẬN VỚI BACKEND

1. ✅ **Backend tự động tạo SwapTransaction** khi `PATCH /api/bookings/{id}?status=completed`
   - File: `BookingRepository.cs` line 414-452
   - Backend tự động chọn NewBatteryID (pin available đầu tiên)
   - Backend tự động lấy OldBatteryID từ vehicle
   - Trả về `SwapTransactionResponseDTOs` với `SwapTransactionID`

2. ✅ **Không cần endpoint tạo SwapTransaction riêng** - Backend tự động tạo khi update booking status

3. ❌ **Không có endpoint để cập nhật NewBatteryID** - Backend đã tự động chọn khi tạo SwapTransaction

4. ✅ **Backend có validate** - Chỉ chọn pin có `BatteryTypeID` phù hợp với vehicle (line 404)

