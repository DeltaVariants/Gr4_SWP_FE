'use client';

interface NameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const NameInput = ({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: NameInputProps) => {
  return (
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Full Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Enter your full name"
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