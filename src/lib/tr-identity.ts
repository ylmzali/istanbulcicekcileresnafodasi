/** Client-safe Turkish identity / tax number helpers. */

export function normalizeIdentityNo(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeTaxNo(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidIdentityNo(value: string) {
  const digits = normalizeIdentityNo(value);
  if (!/^[1-9]\d{10}$/.test(digits)) return false;

  const nums = digits.split("").map(Number);
  const oddSum = nums[0] + nums[2] + nums[4] + nums[6] + nums[8];
  const evenSum = nums[1] + nums[3] + nums[5] + nums[7];
  const digit10 = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  if (digit10 !== nums[9]) return false;

  const sum10 = nums.slice(0, 10).reduce((acc, n) => acc + n, 0);
  return sum10 % 10 === nums[10];
}

export function isValidTaxNo(value: string) {
  const digits = normalizeTaxNo(value);
  return /^\d{10}$/.test(digits) || /^\d{11}$/.test(digits);
}
