'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { QrCode, User, Phone, Car, Battery, CheckCircle2, AlertCircle, Loader2, ArrowRight, XCircle, BatteryCharging, Scan } from 'lucide-react';
import { useToast } from '@/presentation/components/ui/Notification';
import { useAuth } from '@/contexts/AuthContext';
import bookingService from '@/application/services/bookingService';
import swapTransactionService from '@/application/services/swapTransactionService';
import batteryService from '@/application/services/batteryService';

type CheckInStep = 'scan' | 'verify' | 'swap' | 'completed';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// SwapStep Component
function SwapStep({ 
  bookingData, 
  driverName, 
  oldBatteryId, 
  newBatteryId, 
  setOldBatteryId, 
  setNewBatteryId, 
  onComplete, 
  onBack 
}: {
  bookingData: any;
  driverName: string;
  oldBatteryId: string;
  newBatteryId: string;
  setOldBatteryId: (id: string) => void;
  setNewBatteryId: (id: string) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subStep, setSubStep] = useState<'scan-old' | 'scan-new' | 'confirm' | 'processing'>('scan-old');
  const [loading, setLoading] = useState(false);
  const [stationBatteryIds, setStationBatteryIds] = useState<string[]>([]);

  // Load station batteries
  useEffect(() => {
    let mounted = true;
    const loadBatteries = async () => {
      try {
        const u = user as Record<string, unknown> | null;
        let stationId: string | undefined;
        if (u) {
          stationId = (u['stationId'] || u['StationID'] || u['stationID']) as string | undefined;
        }
        if (stationId) {
          const ids = await batteryService.getBatteryIdsByStation(stationId);
          if (mounted) setStationBatteryIds(ids || []);
        }
      } catch (e) {
        console.error('[Swap] Failed to load batteries:', e);
      }
    };
    loadBatteries();
    return () => { mounted = false; };
  }, [user]);

  const handleConfirmSwap = async () => {
    if (!oldBatteryId || !newBatteryId) {
      showToast({ type: 'error', message: 'Vui lòng nhập đầy đủ mã pin cũ và mới' });
      return;
    }

    if (oldBatteryId === newBatteryId) {
      showToast({ type: 'error', message: 'Pin cũ và pin mới phải khác nhau!' });
      return;
    }

    try {
      setSubStep('processing');
      setLoading(true);

      console.log('[Swap] 🔄 Step 2: Starting swap transaction');

      // Get station ID
      const u = user as Record<string, unknown> | null;
      let stationId = (u?.['stationId'] || u?.['StationID'] || u?.['stationID']) as string | undefined;

      if (!stationId) {
        throw new Error('Không tìm thấy Station ID. Vui lòng đăng nhập lại.');
      }

      // Create swap transaction
      const swapTxId = generateUUID();
      const bookingId = bookingData?.bookingID || bookingData?.id;

      console.log('[Swap] Creating swap transaction:', {
        id: swapTxId,
        bookingId,
        oldBatteryId,
        newBatteryId,
        stationId,
      });

      await swapTransactionService.completeSwapTransaction(swapTxId, {
        oldBatteryID: oldBatteryId,
        newBatteryID: newBatteryId,
        stationID: stationId,
        bookingID: bookingId,
        customerID: undefined,
      });

      console.log('[Swap] ✅ Swap transaction completed');
      showToast({ type: 'success', message: 'Đổi pin thành công!' });

      // Move to completed step
      onComplete();

    } catch (error: any) {
      console.error('[Swap] ❌ Swap failed:', error);
      showToast({ type: 'error', message: error?.message || 'Không thể hoàn tất swap' });
      setSubStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 2: Swap Pin</h2>
        <p className="text-gray-600">Khách hàng: <span className="font-semibold">{driverName}</span></p>
      </div>

      {/* Sub-steps indicator */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {[
          { key: 'scan-old', label: 'Pin cũ', icon: Battery },
          { key: 'scan-new', label: 'Pin mới', icon: BatteryCharging },
          { key: 'confirm', label: 'Xác nhận', icon: CheckCircle2 },
        ].map((s, idx) => {
          const isActive = subStep === s.key;
          const isPassed = 
            (subStep === 'scan-new' || subStep === 'confirm' || subStep === 'processing') && s.key === 'scan-old' ||
            (subStep === 'confirm' || subStep === 'processing') && s.key === 'scan-new';

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1 transition-all ${isActive || isPassed ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  isPassed 
                    ? 'bg-emerald-500 text-white' 
                    : isActive 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              {idx < 2 && <ArrowRight className="w-5 h-5 text-gray-300 -mt-4" />}
            </div>
          );
        })}
      </div>

      {/* Scan Old Battery */}
      {subStep === 'scan-old' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Battery className="inline w-4 h-4 mr-1" />
              Mã pin cũ (OUT)
            </label>
            <input
              type="text"
              value={oldBatteryId}
              onChange={(e) => setOldBatteryId(e.target.value)}
              placeholder="Scan hoặc nhập mã pin cũ"
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            {stationBatteryIds.length > 0 && (
              <select
                value={oldBatteryId}
                onChange={(e) => setOldBatteryId(e.target.value)}
                className="w-full mt-2 h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">-- Hoặc chọn từ danh sách --</option>
                {stationBatteryIds.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setSubStep('scan-new')}
              disabled={!oldBatteryId}
              className="flex-1 h-11 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      )}

      {/* Scan New Battery */}
      {subStep === 'scan-new' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <BatteryCharging className="inline w-4 h-4 mr-1" />
              Mã pin mới (IN)
            </label>
            <input
              type="text"
              value={newBatteryId}
              onChange={(e) => setNewBatteryId(e.target.value)}
              placeholder="Scan hoặc nhập mã pin mới"
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              autoFocus
            />
            {stationBatteryIds.length > 0 && (
              <select
                value={newBatteryId}
                onChange={(e) => setNewBatteryId(e.target.value)}
                className="w-full mt-2 h-10 px-3 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">-- Hoặc chọn từ danh sách --</option>
                {stationBatteryIds.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSubStep('scan-old')}
              className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setSubStep('confirm')}
              disabled={!newBatteryId}
              className="flex-1 h-11 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {subStep === 'confirm' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Xác nhận thông tin swap:</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-semibold">{driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pin cũ (OUT):</span>
                <code className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono text-sm">{oldBatteryId}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pin mới (IN):</span>
                <code className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-sm">{newBatteryId}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                  {bookingData?.bookingID || bookingData?.id || 'N/A'}
                </code>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSubStep('scan-new')}
              className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Sửa lại
            </button>
            <button
              onClick={handleConfirmSwap}
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Xác nhận Swap
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {subStep === 'processing' && (
        <div className="py-12 text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Đang xử lý swap transaction...</p>
          <p className="text-sm text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      )}
    </div>
  );
}

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
  
  // Swap data
  const [oldBatteryId, setOldBatteryId] = useState('');
  const [newBatteryId, setNewBatteryId] = useState('');
  const [swapTransactionId, setSwapTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (reservationIdParam && step === 'verify') {
      loadBookingData(reservationIdParam);
    }
  }, [reservationIdParam]);

  const loadBookingData = async (searchTerm: string) => {
    try {
      setLoading(true);
      
      // Tìm booking bằng mã, tên khách, hoặc biển số
      const booking = await bookingService.searchBooking(searchTerm);
      
      if (booking) {
        setBookingData(booking);
        
        // Extract customer info
        const customerName = booking.customerName || booking.CustomerName || booking.username || booking.userName || booking.UserName || '';
        const phoneNumber = booking.phone || booking.Phone || booking.phoneNumber || booking.PhoneNumber || '';
        const vehicleInfo = booking.vehiclePlate || booking.VehiclePlate || booking.licensePlate || booking.vehicleId || booking.vehicle || '';
        const batteryTypeInfo = booking.batteryType || booking.BatteryType || booking.batteryTypeName || '';
        
        setDriverName(customerName);
        setPhone(phoneNumber);
        setVehicle(vehicleInfo);
        setBatteryType(batteryTypeInfo);
        
        showToast({ 
          type: 'success', 
          message: `✅ Tìm thấy: ${customerName || vehicleInfo || 'khách hàng'}`,
          duration: 2000 
        });
      } else {
        showToast({ 
          type: 'error', 
          message: 'Không tìm thấy booking. Thử lại với mã khác, tên hoặc biển số xe.' 
        });
        setStep('scan');
      }
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error?.message || 'Lỗi tìm kiếm. Vui lòng thử lại.' 
      });
      setStep('scan');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = () => {
    if (!reservationId.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập mã đặt chỗ' });
      return;
    }
    
    // Change to verify step and load data there
    setStep('verify');
    loadBookingData(reservationId);
  };

  const handleVerifyAndStartSwap = async () => {
    if (!driverName || !phone) {
      showToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }

    try {
      setLoading(true);
      
      console.log('[CheckIn] ✅ Step 1: Verifying customer info');
      
      // Update booking status to "Checked"
      if (bookingData?.bookingID || bookingData?.id) {
        const bookingId = bookingData.bookingID || bookingData.id;
        await bookingService.updateBookingStatus(bookingId, 'Checked');
        console.log('[CheckIn] ✅ Booking status updated: Checked');
      }
      
      showToast({ type: 'success', message: 'Check-in thành công! Bắt đầu swap pin...' });
      
      // Move to swap step (NO redirect)
      console.log('[CheckIn] 🔄 Moving to Step 2: Swap');
      setStep('swap');
      
    } catch (error: any) {
      showToast({ type: 'error', message: error?.message || 'Không thể check-in' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator - 3 Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {([
          { key: 'scan', label: 'Nhập Booking', icon: QrCode },
          { key: 'verify', label: 'Xác thực', icon: User },
          { key: 'swap', label: 'Swap Pin', icon: Battery },
          { key: 'completed', label: 'Hoàn tất', icon: CheckCircle2 },
        ] as const).map((s, idx) => {
          const isActive = step === s.key;
          const isPassed = 
            (step === 'verify' || step === 'swap' || step === 'completed') && s.key === 'scan' ||
            (step === 'swap' || step === 'completed') && s.key === 'verify' ||
            (step === 'completed') && s.key === 'swap';

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1 transition-all ${isActive || isPassed ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isPassed
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium text-center max-w-[70px] ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && <ArrowRight className={`w-5 h-5 ${isPassed ? 'text-emerald-500' : 'text-gray-300'}`} />}
            </div>
          );
        })}
      </div>

      {/* Scan Step */}
      {step === 'scan' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg">
              <QrCode className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tìm kiếm khách hàng</h2>
            <p className="text-gray-600">Nhập mã đặt chỗ, tên khách hàng hoặc biển số xe</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm booking
              </label>
              <input
                type="text"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="VD: RES123 / Nguyễn Văn A / 29A-12345"
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleScanSubmit()}
                autoFocus
              />
              
            </div>

            <button
              onClick={handleScanSubmit}
              disabled={!reservationId.trim()}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
            >
               Tìm kiếm
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
              <p className="text-gray-600">Đang tải thông tin booking...</p>
            </div>
          ) : !bookingData ? (
            <div className="py-12 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy booking</h3>
              <p className="text-gray-600 mb-6">Mã đặt chỗ &quot;{reservationId}&quot; không tồn tại trong hệ thống.</p>
              <button
                onClick={() => setStep('scan')}
                className="h-11 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
              >
                Quay lại nhập lại mã
              </button>
            </div>
          ) : (
            <>
              {/* Booking Info Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Thông tin booking đã tìm thấy</h4>
                    <p className="text-sm text-blue-700">
                      Vui lòng xác nhận thông tin khách hàng bên dưới trước khi tiếp tục.
                    </p>
                  </div>
                </div>
              </div>

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
                  onClick={handleVerifyAndStartSwap}
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
                      <ArrowRight className="w-5 h-5" />
                      Tiếp tục → Swap Pin
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Swap Step (Step 2) */}
      {step === 'swap' && (
        <SwapStep
          bookingData={bookingData}
          driverName={driverName}
          oldBatteryId={oldBatteryId}
          newBatteryId={newBatteryId}
          setOldBatteryId={setOldBatteryId}
          setNewBatteryId={setNewBatteryId}
          onComplete={() => setStep('completed')}
          onBack={() => setStep('verify')}
        />
      )}

      {/* Completed Step (Step 3) */}
      {step === 'completed' && (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-xl animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">🎉 Hoàn tất!</h2>
          <p className="text-xl text-gray-600 mb-3">
            Khách hàng <span className="font-semibold text-gray-900">{driverName}</span> đã hoàn thành swap
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Giao dịch đã được ghi nhận trong hệ thống
          </p>
          <button
            onClick={() => {
              // Reset form
              setStep('scan');
              setReservationId('');
              setBookingData(null);
              setDriverName('');
              setPhone('');
              setVehicle('');
              setBatteryType('');
              setOldBatteryId('');
              setNewBatteryId('');
              setSwapTransactionId(null);
            }}
            className="h-12 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
          >
            Check-in khách hàng tiếp theo
          </button>
        </div>
      )}
    </div>
  );
}
