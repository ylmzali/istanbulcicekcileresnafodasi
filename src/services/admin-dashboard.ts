import { prisma } from "@/lib/db";

export type AdminDashboardStats = {
  pendingApplications: number;
  missingDocumentApplications: number;
  newContactSubmissions: number;
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

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    pendingApplications,
    missingDocumentApplications,
    newContactSubmissions,
    openSupportRequests,
    overdueDues,
    recentPosts,
  ] = await Promise.all([
    prisma.membershipApplication.count({
      where: {
        deletedAt: null,
        status: { in: ["submitted", "under_review"] },
      },
    }),
    prisma.membershipApplication.count({
      where: { deletedAt: null, status: "missing_documents" },
    }),
    prisma.contactSubmission.count({
      where: { status: "new" },
    }),
    prisma.supportRequest.count({
      where: {
        deletedAt: null,
        status: {
          in: ["new", "assigned", "in_progress", "waiting_for_applicant"],
        },
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
    newContactSubmissions,
    openSupportRequests,
    overdueDues,
    recentPosts,
  };
}
