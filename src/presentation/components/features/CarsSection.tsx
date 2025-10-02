import React from "react";
import CarCard from "../ui/CarCard";

interface Car {
  id: string;
  brand: string;
  model: string;
  batteryPercentage: number;
  range: number;
}

interface CarsSectionProps {
  cars: Car[];
  onAddCar: () => void;
}

export default function CarsSection({ cars, onAddCar }: CarsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl font-bold text-white">My Cars</h2>
        <button
          onClick={onAddCar}
          className="text-xl font-bold text-white hover:text-gray-200 transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 px-4">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            brand={car.brand}
            model={car.model}
            batteryPercentage={car.batteryPercentage}
            range={car.range}
          />
        ))}
      </div>
    </div>
  );
}
