/**
 * Map batteryTypeModel to API format (Small, Medium, Large)
 * @param batteryTypeModel The battery type model string from vehicle
 * @returns "Small", "Medium", or "Large" (defaults to "Medium")
 */
export const getBatteryType = (batteryTypeModel: string | null): string => {
  if (!batteryTypeModel) return "Medium"; // Default to Medium

  const model = batteryTypeModel.toLowerCase();
  if (model.includes("small") || model.includes("sma")) return "Small";
  if (model.includes("medium") || model.includes("med")) return "Medium";
  if (model.includes("large") || model.includes("lar")) return "Large";

  return "Medium"; // Default fallback
};

