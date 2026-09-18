export type TemperatureUnit = 'C' | 'F';

// Water temperature is stored in whole degrees Celsius. The UI can display and
// edit it in Fahrenheit, converting on our side.
export const toCelsius = (value: number, unit: TemperatureUnit) =>
  unit === 'F' ? ((value - 32) * 5) / 9 : value;

export const fromCelsius = (value: number, unit: TemperatureUnit) =>
  unit === 'F' ? (value * 9) / 5 + 32 : value;

export const roundToTenth = (value: number) => Math.round(value * 10) / 10;

export const formatTemperature = (
  value: number | undefined,
  unit: TemperatureUnit
) => {
  if (value == null) {
    return '';
  }

  return unit === 'C'
    ? `${value} °C`
    : `${roundToTenth(fromCelsius(value, unit))} °F`;
};
