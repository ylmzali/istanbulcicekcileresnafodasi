import { prisma } from "@/lib/db";

export type AdminDashboardStats = {
  pendingApplications: number;
  missingDocumentApplications: number;
  pendingDocumentRequests: number;
  todaysAppointments: number;
  openSupportRequests: number;
  overdueDues: number;
  recentPosts: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    publishedAt: Date | null;
  }>;
};

function startOfTodayUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function endOfTodayUtc() {
  const start = startOfTodayUtc();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const dayStart = startOfTodayUtc();
  const dayEnd = endOfTodayUtc();

  const [
    pendingApplications,
    missingDocumentApplications,
    pendingDocumentRequests,
    todaysAppointments,
    openSupportRequests,
    overdueDues,
    recentPosts,
  ] = await Promise.all([
    prisma.membershipApplication.count({
      where: { status: { in: ["submitted", "under_review"] } },
    }),
    prisma.membershipApplication.count({
      where: { status: "missing_documents" },
    }),
    prisma.documentRequest.count({
      where: { status: { in: ["submitted", "under_review", "payment_pending"] } },
    }),
    prisma.appointment.count({
      where: {
        startAt: { gte: dayStart, lt: dayEnd },
        status: { in: ["pending", "confirmed"] },
      },
    }),
    prisma.supportRequest.count({
      where: {
        status: { in: ["new", "assigned", "in_progress", "waiting_for_applicant"] },
      },
    }),
    prisma.memberDue.count({
      where: { status: "overdue" },
    }),
    prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        publishedAt: true,
      },
    }),
  ]);

  return {
    pendingApplications,
    missingDocumentApplications,
    pendingDocumentRequests,
    todaysAppointments,
    openSupportRequests,
    overdueDues,
    recentPosts,
  };
}
