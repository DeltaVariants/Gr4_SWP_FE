'use client';

interface CodeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const CodeInput = ({ value, onChange, error }: CodeInputProps) => {
  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        value={value}
        onChange={(e) => {
          
          const cleaned = e.target.value.replace(/\D+/g, '').slice(0, 6);
          
          const synthetic = { ...e, target: { ...e.target, value: cleaned } } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(synthetic);
        }}
        placeholder="Enter 6-digit code"
        maxLength={6}
        className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0062FF] focus:border-[#0062FF] ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};