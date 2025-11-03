'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { QrCode, User, Phone, Car, Battery, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/presentation/components/ui/Notification';
import bookingService from '@/application/services/bookingService';

type CheckInStep = 'scan' | 'verify' | 'confirmed';

export default function CheckInContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const reservationIdParam = params.get('reservationId');
  
  const [step, setStep] = useState<CheckInStep>(reservationIdParam ? 'verify' : 'scan');
  const [reservationId, setReservationId] = useState(reservationIdParam || '');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  
  // Form data
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [batteryType, setBatteryType] = useState('');

  useEffect(() => {
    if (reservationIdParam && step === 'verify') {
      loadBookingData(reservationIdParam);
    }
  }, [reservationIdParam]);

  const loadBookingData = async (bookingId: string) => {
    try {
      setLoading(true);
      // Try to get booking data from API - use getAllBookingOfStation instead
      const allBookings = await bookingService.getAllBookingOfStation();
      const booking = allBookings.find((b: any) => 
        String(b.bookingID || b.id || b.BookingID) === bookingId
      );
      
      if (booking) {
        setBookingData(booking);
        setDriverName(booking.customerName || booking.username || '');
        setPhone(booking.phone || booking.phoneNumber || '');
        setVehicle(booking.vehicleId || booking.vehicle || '');
        setBatteryType(booking.batteryType || booking.batteryTypeName || '');
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error?.message || 'Không thể tải thông tin đặt chỗ' });
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = () => {
    if (!reservationId.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập mã đặt chỗ' });
      return;
    }
    loadBookingData(reservationId);
    setStep('verify');
  };

  const handleVerifyAndStart = async () => {
    if (!driverName || !phone) {
      showToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }

    try {
      setLoading(true);
      // Update booking status to "Checked" or "In-Progress"
      if (bookingData?.bookingID) {
        await bookingService.updateBookingStatus(bookingData.bookingID, 'Checked');
      }
      
      setStep('confirmed');
      showToast({ type: 'success', message: 'Check-in thành công!' });
      
      // Redirect to swap after 1.5s
      setTimeout(() => {
        router.push(`/swap?reservationId=${reservationId}&bookingId=${bookingData?.bookingID || reservationId}`);
      }, 1500);
    } catch (error: any) {
      showToast({ type: 'error', message: error?.message || 'Không thể check-in' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {(['scan', 'verify', 'confirmed'] as const).map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-3 ${step === s ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step === s 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-gray-900' : 'text-gray-500'}`}>
                {s === 'scan' ? 'Scan QR' : s === 'verify' ? 'Xác thực' : 'Hoàn tất'}
              </span>
            </div>
            {idx < 2 && <ArrowRight className="w-5 h-5 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Scan Step */}
      {step === 'scan' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg">
              <QrCode className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Reservation Code</h2>
            <p className="text-gray-600">Quét mã QR hoặc nhập mã đặt chỗ của khách hàng</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mã đặt chỗ</label>
              <input
                type="text"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Nhập hoặc scan mã"
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleScanSubmit()}
              />
            </div>

            <button
              onClick={handleScanSubmit}
              disabled={!reservationId.trim()}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Verify Step */}
      {step === 'verify' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Reservation ID</div>
              <div className="text-xl font-bold text-gray-900">{reservationId}</div>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 ring-1 ring-orange-200">
              <AlertCircle className="w-4 h-4" />
              Chờ xác thực
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nhập tên"
                    className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập SĐT"
                    className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Phương tiện
                  </label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="Mẫu xe / Biển số"
                    className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Battery className="w-4 h-4 text-blue-500" />
                    Loại pin
                  </label>
                  <input
                    type="text"
                    value={batteryType}
                    onChange={(e) => setBatteryType(e.target.value)}
                    placeholder="e.g., 60V-26Ah"
                    className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep('scan')}
                  className="h-11 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleVerifyAndStart}
                  disabled={loading || !driverName || !phone}
                  className="h-11 px-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Xác nhận & Bắt đầu Swap
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmed Step */}
      {step === 'confirmed' && (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Check-in thành công!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Khách hàng <span className="font-semibold text-gray-900">{driverName}</span> đã được xác thực
          </p>
          <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang chuyển đến quy trình đổi pin...
          </div>
        </div>
      )}
    </div>
  );
}
