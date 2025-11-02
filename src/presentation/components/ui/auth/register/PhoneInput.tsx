'use client';

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: PhoneInputProps) => {
  return (
    <div>
      <label
        htmlFor="phoneNumber"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Số điện thoại
      </label>
      <input
        type="tel"
        id="phoneNumber"
        name="phoneNumber"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Nhập số điện thoại (10-11 số)"
        className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};