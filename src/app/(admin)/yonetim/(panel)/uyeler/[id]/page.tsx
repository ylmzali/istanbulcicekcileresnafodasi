import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/admin/member-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminMemberLabels } from "@/lib/admin-member-labels";
import { getMessages } from "@/lib/i18n";
import {
  getMemberById,
  listLocationOptions,
  serializeMemberForForm,
} from "@/services/members";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Üye Düzenle",
  robots: { index: false, follow: false },
};

export default async function AdminEditMemberPage({ params }: PageProps) {
  const { id } = await params;
  const [member, cities] = await Promise.all([
    getMemberById(id),
    listLocationOptions(),
  ]);
  if (!member) notFound();

  const a = getMessages().admin;
  const labels = getAdminMemberLabels();
  const values = serializeMemberForForm(member);
  const title = member.profile
    ? `${member.profile.firstName} ${member.profile.lastName}`.trim()
    : member.memberNo;

  return (
    <div>
      <AdminPageHeader title={a.edit} description={title} />
      <MemberForm
        values={values}
        cities={cities}
        labels={{
          memberNo: labels.memberNo,
          firstName: labels.firstName,
          lastName: labels.lastName,
          identityNo: labels.identityNo,
          email: labels.email,
          phone: labels.phone,
          status: labels.status,
          statusReason: labels.statusReason,
          directoryConsent: labels.directoryConsent,
          collectionRef: labels.collectionRef,
          collectionRefHint: labels.collectionRefHint,
          registrationDate: labels.registrationDate,
          terminationDate: labels.terminationDate,
          birthDate: labels.birthDate,
          preferredContact: labels.preferredContact,
          addressLine1: labels.addressLine1,
          postalCode: labels.postalCode,
          district: labels.district,
          newPassword: labels.newPassword,
          newPasswordHint: labels.newPasswordHint,
          legalName: labels.legalName,
          tradeName: labels.tradeName,
          taxOffice: labels.taxOffice,
          taxNo: labels.taxNo,
          businessPhone: labels.businessPhone,
          businessEmail: labels.businessEmail,
          website: labels.website,
          address: labels.address,
          directoryVisible: labels.directoryVisible,
          verificationStatus: labels.verificationStatus,
          directoryPublishTitle: labels.directoryPublishTitle,
          directoryPublishReady: labels.directoryPublishReady,
          directoryPublishBlocked: labels.directoryPublishBlocked,
          directoryNeedActive: labels.directoryNeedActive,
          directoryNeedConsent: labels.directoryNeedConsent,
          directoryNeedVisible: labels.directoryNeedVisible,
          directoryNeedVerified: labels.directoryNeedVerified,
          sectionMembership: labels.sectionMembership,
          sectionProfile: labels.sectionProfile,
          sectionContact: labels.sectionContact,
          sectionAddress: labels.sectionAddress,
          sectionTax: labels.sectionTax,
          sectionBusiness: labels.sectionBusiness,
          sectionHistory: labels.sectionHistory,
          preview: labels.preview,
          save: labels.save,
          delete: labels.delete,
          back: labels.back,
          memberStatuses: labels.memberStatuses,
          verificationStatuses: labels.verificationStatuses,
        }}
      />
    </div>
  );
}
