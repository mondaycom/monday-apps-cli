export function validateStringAsSafeInt(value: string): boolean {
  if (!/^[1-9]\d*$/.test(value)) {
    return false;
  }

  const valueAsNum = Number(value);
  return Number.isSafeInteger(valueAsNum);
}
