import "server-only";

import { z } from "zod";
import type { DueStatus, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { Prisma as PrismaNS } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  applyInputFormat,
  moneyToStorage,
  parseMoneyNumber,
} from "@/lib/input-formats";
import {
  decimalToNumber,
  formatMoney,
  remainingDueAmount,
  toDecimal,
} from "@/lib/money";

export const ANNUAL_PERIOD_KEY = "yillik";

export const dueStatusSchema = z.enum([
  "unpaid",
  "partially_paid",
  "paid",
  "waived",
  "overdue",
]);

export const paymentMethodSchema = z.enum([
  "cash",
  "bank_transfer",
  "pos",
  "other",
]);

export const duesPeriodCreateSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  period: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Dönem anahtarı yalnızca küçük harf, rakam ve tire olabilir.")
    .default(ANNUAL_PERIOD_KEY),
  title: z.string().trim().min(1).max(160),
  dueDate: z.string().trim().min(1),
  amount: z
    .union([z.string(), z.number()])
    .refine(
      (value) => {
        if (typeof value === "number") return value > 0;
        const parsed = parseMoneyNumber(value);
        return parsed != null && parsed > 0;
      },
      "Geçerli bir tutar girin.",
    ),
  active: z.boolean().default(true),
});

export const duesPeriodUpdateSchema = duesPeriodCreateSchema;

export const collectPaymentSchema = z.object({
  amount: z.string().trim().refine((value) => {
    const parsed = parseMoneyNumber(value);
    return parsed != null && parsed > 0;
  }, "Geçerli bir tutar girin."),
  method: paymentMethodSchema.default("bank_transfer"),
  providerReference: z.string().trim().max(190).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  paidAt: z.string().optional().nullable(),
});

export type DuesPeriodCreateInput = z.infer<typeof duesPeriodCreateSchema>;
export type DuesPeriodUpdateInput = z.infer<typeof duesPeriodUpdateSchema>;
export type CollectPaymentInput = z.infer<typeof collectPaymentSchema>;

function parseMoneyInput(value: string | number) {
  if (typeof value === "number") return toDecimal(value);
  const storage = moneyToStorage(value);
  if (!storage) throw new Error("INVALID_AMOUNT");
  return toDecimal(storage);
}

function parseDateOnly(value: string) {
  const date = new Date(`${value.trim()}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return date;
}

function startOfTodayUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function computeDueStatus(input: {
  assessedAmount: PrismaNS.Decimal;
  penaltyAmount: PrismaNS.Decimal;
  paidAmount: PrismaNS.Decimal;
  dueDate: Date;
  waived?: boolean;
}): DueStatus {
  if (input.waived) return "waived";
  const remaining = remainingDueAmount(input);
  if (remaining.lessThanOrEqualTo(0)) return "paid";
  const pastDue = input.dueDate.getTime() < startOfTodayUtc().getTime();
  if (input.paidAmount.greaterThan(0)) {
    return pastDue ? "overdue" : "partially_paid";
  }
  return pastDue ? "overdue" : "unpaid";
}

async function nextReceiptNo(tx: Prisma.TransactionClient) {
  const stamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const receiptNo = `AID-${stamp}-${suffix}`;
    const existing = await tx.receipt.findUnique({
      where: { receiptNo },
      select: { id: true },
    });
    if (!existing) return receiptNo;
  }
  return `AID-${stamp}-${Date.now().toString().slice(-6)}`;
}

export async function refreshOverdueStatuses() {
  const today = startOfTodayUtc();
  await prisma.memberDue.updateMany({
    where: {
      status: { in: ["unpaid", "partially_paid"] },
      period: { dueDate: { lt: today } },
    },
    data: { status: "overdue" },
  });
}

export async function listDuesPeriods() {
  return prisma.duesPeriod.findMany({
    orderBy: [{ year: "desc" }, { period: "asc" }],
    include: {
      _count: { select: { memberDues: true } },
    },
  });
}

export async function getDuesPeriodById(id: string) {
  return prisma.duesPeriod.findUnique({
    where: { id },
    include: {
      _count: { select: { memberDues: true } },
    },
  });
}

export async function createDuesPeriod(raw: DuesPeriodCreateInput) {
  const input = duesPeriodCreateSchema.parse(raw);
  const period = input.period || ANNUAL_PERIOD_KEY;

  try {
    return await prisma.duesPeriod.create({
      data: {
        year: input.year,
        period,
        title: input.title,
        dueDate: parseDateOnly(input.dueDate),
        amount: parseMoneyInput(input.amount),
        active: input.active,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaNS.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("PERIOD_EXISTS");
    }
    throw error;
  }
}

export async function updateDuesPeriod(id: string, raw: DuesPeriodUpdateInput) {
  const existing = await getDuesPeriodById(id);
  if (!existing) throw new Error("NOT_FOUND");

  const input = duesPeriodUpdateSchema.parse(raw);
  const period = input.period || ANNUAL_PERIOD_KEY;

  try {
    return await prisma.duesPeriod.update({
      where: { id },
      data: {
        year: input.year,
        period,
        title: input.title,
        dueDate: parseDateOnly(input.dueDate),
        amount: parseMoneyInput(input.amount),
        active: input.active,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaNS.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("PERIOD_EXISTS");
    }
    throw error;
  }
}

export async function assessDuesPeriod(periodId: string) {
  const period = await getDuesPeriodById(periodId);
  if (!period) throw new Error("NOT_FOUND");
  if (!period.active) throw new Error("PERIOD_INACTIVE");

  const members = await prisma.member.findMany({
    where: { status: "active", deletedAt: null },
    select: { id: true },
  });

  const status = computeDueStatus({
    assessedAmount: toDecimal(period.amount),
    penaltyAmount: toDecimal(0),
    paidAmount: toDecimal(0),
    dueDate: period.dueDate,
  });

  const result = await prisma.memberDue.createMany({
    data: members.map((member) => ({
      memberId: member.id,
      periodId: period.id,
      assessedAmount: period.amount,
      paidAmount: 0,
      penaltyAmount: 0,
      status,
    })),
    skipDuplicates: true,
  });

  const created = result.count;
  const skipped = Math.max(0, members.length - created);
  return { created, skipped, totalMembers: members.length };
}

/**
 * Sync open assessments to the period's current amount / due date.
 *
 * Safe rules (never silent overwrite of settled history):
 * - Updates only unpaid / overdue / partially_paid
 * - Skips paid and waived
 * - Skips rows where paidAmount > new period amount
 * - Recalculates status from period.dueDate
 */
export async function syncOpenMemberDuesForPeriod(periodId: string) {
  const period = await getDuesPeriodById(periodId);
  if (!period) throw new Error("NOT_FOUND");

  const rows = await prisma.memberDue.findMany({
    where: {
      periodId,
      status: { in: ["unpaid", "overdue", "partially_paid"] },
    },
  });

  const newAmount = toDecimal(period.amount);
  let updated = 0;
  let skippedPaidExceeds = 0;

  for (const row of rows) {
    const paid = toDecimal(row.paidAmount);
    if (paid.greaterThan(newAmount)) {
      skippedPaidExceeds += 1;
      continue;
    }

    const nextStatus = computeDueStatus({
      assessedAmount: newAmount,
      penaltyAmount: toDecimal(row.penaltyAmount),
      paidAmount: paid,
      dueDate: period.dueDate,
    });

    await prisma.memberDue.update({
      where: { id: row.id },
      data: {
        assessedAmount: newAmount,
        status: nextStatus,
      },
    });
    updated += 1;
  }

  return {
    updated,
    skippedPaidExceeds,
    openTotal: rows.length,
  };
}

export async function listMemberDues(filters?: {
  q?: string;
  periodId?: string;
  status?: DueStatus;
  page?: number;
  pageSize?: number;
}) {
  await refreshOverdueStatuses();

  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
  const q = filters?.q?.trim();

  const where: Prisma.MemberDueWhereInput = {
    ...(filters?.periodId ? { periodId: filters.periodId } : {}),
    ...(filters?.status ? { status: filters.status } : {}),
    ...(q
      ? {
          OR: [
            { member: { memberNo: { contains: q } } },
            {
              member: {
                profile: {
                  OR: [
                    { firstName: { contains: q } },
                    { lastName: { contains: q } },
                  ],
                },
              },
            },
            { member: { collectionRef: { contains: q } } },
            { period: { title: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.memberDue.count({ where }),
    prisma.memberDue.findMany({
      where,
      orderBy: [{ period: { year: "desc" } }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        period: true,
        member: {
          select: {
            id: true,
            memberNo: true,
            collectionRef: true,
            status: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((row) => {
      const remaining = remainingDueAmount(row);
      return {
        ...row,
        remainingAmount: remaining,
        assessedAmountLabel: formatMoney(row.assessedAmount),
        paidAmountLabel: formatMoney(row.paidAmount),
        remainingAmountLabel: formatMoney(remaining),
        memberName: row.member.profile
          ? `${row.member.profile.firstName} ${row.member.profile.lastName}`.trim()
          : row.member.memberNo,
      };
    }),
  };
}

export async function getMemberDueById(id: string) {
  await refreshOverdueStatuses();

  return prisma.memberDue.findUnique({
    where: { id },
    include: {
      period: true,
      member: {
        select: {
          id: true,
          memberNo: true,
          collectionRef: true,
          status: true,
          profile: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      allocations: {
        include: {
          payment: {
            include: { receipt: true },
          },
        },
        orderBy: { payment: { paidAt: "desc" } },
      },
    },
  });
}

/** Member portal ledger: periods, open balance, and paid payment history. */
export async function getMemberDuesLedger(memberId: string) {
  await refreshOverdueStatuses();

  const [member, dues, payments] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        memberNo: true,
        collectionRef: true,
      },
    }),
    prisma.memberDue.findMany({
      where: { memberId },
      orderBy: [{ period: { year: "desc" } }, { period: { period: "asc" } }],
      include: { period: true },
    }),
    prisma.payment.findMany({
      where: { memberId, status: "paid" },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      include: {
        receipt: true,
        allocations: {
          include: {
            memberDue: {
              include: { period: { select: { title: true, year: true } } },
            },
          },
        },
      },
    }),
  ]);

  if (!member) return null;

  const openAmount = dues.reduce(
    (sum, row) => sum.plus(remainingDueAmount(row)),
    new PrismaNS.Decimal(0),
  );

  const overdueCount = dues.filter((row) => row.status === "overdue").length;
  const unpaidCount = dues.filter((row) =>
    row.status === "unpaid" ||
    row.status === "partially_paid" ||
    row.status === "overdue",
  ).length;
  const paidCount = dues.filter((row) => row.status === "paid").length;

  return {
    member,
    summary: {
      openAmount,
      openAmountLabel: formatMoney(openAmount),
      overdueCount,
      unpaidCount,
      paidCount,
      periodCount: dues.length,
    },
    dues: dues.map((row) => {
      const remaining = remainingDueAmount(row);
      return {
        id: row.id,
        status: row.status,
        periodTitle: row.period.title,
        periodYear: row.period.year,
        dueDate: row.period.dueDate,
        assessedAmountLabel: formatMoney(row.assessedAmount),
        paidAmountLabel: formatMoney(row.paidAmount),
        penaltyAmountLabel: formatMoney(row.penaltyAmount),
        remainingAmountLabel: formatMoney(remaining),
        hasPenalty: decimalToNumber(row.penaltyAmount) > 0,
      };
    }),
    payments: payments.map((payment) => ({
      id: payment.id,
      amountLabel: formatMoney(payment.amount),
      method: payment.method,
      paidAt: payment.paidAt,
      receiptNo: payment.receipt?.receiptNo ?? null,
      note: payment.note,
      periodTitles: payment.allocations.map(
        (item) => item.memberDue.period.title,
      ),
    })),
  };
}

export async function getDuesSummary() {
  await refreshOverdueStatuses();

  const [periodCount, unpaid, overdue, paid, openAmountRows] = await Promise.all([
    prisma.duesPeriod.count({ where: { active: true } }),
    prisma.memberDue.count({ where: { status: "unpaid" } }),
    prisma.memberDue.count({ where: { status: "overdue" } }),
    prisma.memberDue.count({ where: { status: "paid" } }),
    prisma.memberDue.findMany({
      where: { status: { in: ["unpaid", "partially_paid", "overdue"] } },
      select: {
        assessedAmount: true,
        penaltyAmount: true,
        paidAmount: true,
      },
    }),
  ]);

  const openAmount = openAmountRows.reduce(
    (sum, row) => sum.plus(remainingDueAmount(row)),
    new PrismaNS.Decimal(0),
  );

  return {
    periodCount,
    unpaid,
    overdue,
    paid,
    openAmount,
    openAmountLabel: formatMoney(openAmount),
  };
}

export async function collectMemberDuePayment(
  memberDueId: string,
  raw: CollectPaymentInput,
  createdById: string,
) {
  const input = collectPaymentSchema.parse(raw);
  const amount = parseMoneyInput(input.amount);
  if (amount.lessThanOrEqualTo(0)) {
    throw new Error("INVALID_AMOUNT");
  }

  return prisma.$transaction(async (tx) => {
    const due = await tx.memberDue.findUnique({
      where: { id: memberDueId },
      include: { period: true },
    });
    if (!due) throw new Error("NOT_FOUND");
    if (due.status === "waived") throw new Error("DUE_WAIVED");

    const remaining = remainingDueAmount(due);
    if (remaining.lessThanOrEqualTo(0)) throw new Error("ALREADY_PAID");
    if (amount.greaterThan(remaining)) throw new Error("AMOUNT_EXCEEDS");

    const paidAt = input.paidAt?.trim()
      ? new Date(input.paidAt)
      : new Date();
    if (Number.isNaN(paidAt.getTime())) throw new Error("INVALID_DATE");

    const payment = await tx.payment.create({
      data: {
        memberId: due.memberId,
        amount,
        method: input.method as PaymentMethod,
        providerReference: input.providerReference?.trim() || null,
        note: input.note?.trim() || null,
        status: "paid",
        paidAt,
        createdById,
        allocations: {
          create: {
            memberDueId: due.id,
            amount,
          },
        },
        receipt: {
          create: {
            receiptNo: await nextReceiptNo(tx),
            issuedAt: paidAt,
          },
        },
      },
      include: { receipt: true },
    });

    const nextPaid = toDecimal(due.paidAmount).plus(amount);
    const nextStatus = computeDueStatus({
      assessedAmount: toDecimal(due.assessedAmount),
      penaltyAmount: toDecimal(due.penaltyAmount),
      paidAmount: nextPaid,
      dueDate: due.period.dueDate,
    });

    const updated = await tx.memberDue.update({
      where: { id: due.id },
      data: {
        paidAmount: nextPaid,
        status: nextStatus,
      },
    });

    return { payment, due: updated };
  });
}

export async function waiveMemberDue(memberDueId: string) {
  const due = await prisma.memberDue.findUnique({
    where: { id: memberDueId },
    include: { period: true },
  });
  if (!due) throw new Error("NOT_FOUND");
  if (due.status === "waived") throw new Error("ALREADY_WAIVED");
  if (due.status === "paid") throw new Error("ALREADY_PAID");
  if (decimalToNumber(due.paidAmount) > 0) {
    throw new Error("HAS_PAYMENTS");
  }

  return prisma.memberDue.update({
    where: { id: memberDueId },
    data: { status: "waived" },
  });
}

/** Restore a waived due to unpaid/overdue based on period due date. */
export async function unwaiveMemberDue(memberDueId: string) {
  const due = await prisma.memberDue.findUnique({
    where: { id: memberDueId },
    include: { period: true },
  });
  if (!due) throw new Error("NOT_FOUND");
  if (due.status !== "waived") throw new Error("NOT_WAIVED");

  const nextStatus = computeDueStatus({
    assessedAmount: toDecimal(due.assessedAmount),
    penaltyAmount: toDecimal(due.penaltyAmount),
    paidAmount: toDecimal(due.paidAmount),
    dueDate: due.period.dueDate,
  });

  return prisma.memberDue.update({
    where: { id: memberDueId },
    data: { status: nextStatus },
  });
}

export function serializePeriodForForm(
  period: NonNullable<Awaited<ReturnType<typeof getDuesPeriodById>>>,
) {
  return {
    id: period.id,
    year: String(period.year),
    period: period.period,
    title: period.title,
    dueDate: period.dueDate.toISOString().slice(0, 10),
    amount: applyInputFormat(
      "money",
      toDecimal(period.amount).toFixed(2),
    ),
    active: period.active,
  };
}
