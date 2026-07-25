import { Prisma } from "@/generated/prisma/client";

/**
 * UI money display: ₺1,234.50 (comma thousands, dot decimals).
 * Independent of site locale so TR locale does not switch separators.
 *
 * DB / Prisma: DECIMAL(12,2) — plain numeric value e.g. 1234.50
 * (SQL/Decimal uses "." as decimal point; no thousand separators in storage).
 */
const moneyNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toDecimal(value: string | number | Prisma.Decimal) {
  return value instanceof Prisma.Decimal
    ? value
    : new Prisma.Decimal(value);
}

export function decimalToNumber(value: Prisma.Decimal | string | number | null | undefined) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function formatMoney(value: Prisma.Decimal | string | number | null | undefined) {
  return `₺${moneyNumberFormatter.format(decimalToNumber(value))}`;
}

export function remainingDueAmount(input: {
  assessedAmount: Prisma.Decimal | string | number;
  penaltyAmount: Prisma.Decimal | string | number;
  paidAmount: Prisma.Decimal | string | number;
  /** When waived, collectible remaining is always zero. */
  status?: string | null;
}) {
  if (input.status === "waived") {
    return new Prisma.Decimal(0);
  }

  const total = toDecimal(input.assessedAmount)
    .plus(toDecimal(input.penaltyAmount))
    .minus(toDecimal(input.paidAmount));
  return total.lessThan(0) ? new Prisma.Decimal(0) : total;
}
