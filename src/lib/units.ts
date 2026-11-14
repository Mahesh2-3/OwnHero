export type WeightUnit = "kg" | "lbs";

export function toKilograms(value: number, unit: WeightUnit) {
  return unit === "lbs" ? value / 2.2046226218 : value;
}

export function fromKilograms(value: number, unit: WeightUnit) {
  return unit === "lbs" ? value * 2.2046226218 : value;
}
