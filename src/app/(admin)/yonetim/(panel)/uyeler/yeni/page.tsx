import type { Metadata } from "next";
import { MemberCreateForm } from "@/components/admin/member-create-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminMemberLabels } from "@/lib/admin-member-labels";
import { getMessages } from "@/lib/i18n";
import { listLocationOptions } from "@/services/members";

export const metadata: Metadata = {
  title: "Yeni Üye",
  robots: { index: false, follow: false },
};

export default async function AdminNewMemberPage() {
  const a = getMessages().admin;
  const labels = getAdminMemberLabels();
  const cities = await listLocationOptions();

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.members} />
      <MemberCreateForm
        cities={cities}
        labels={{
          memberNo: labels.memberNo,
          memberNoHint: labels.memberNoHint,
          firstName: labels.firstName,
          lastName: labels.lastName,
          identityNo: labels.identityNo,
          email: labels.email,
          phone: labels.phone,
          password: labels.password,
          status: labels.status,
          directoryConsent: labels.directoryConsent,
          directoryVisible: labels.directoryVisible,
          verificationStatus: labels.verificationStatus,
          registrationDate: labels.registrationDate,
          district: labels.district,
          addressLine1: labels.addressLine1,
          postalCode: labels.postalCode,
          legalName: labels.legalName,
          tradeName: labels.tradeName,
          taxOffice: labels.taxOffice,
          taxNo: labels.taxNo,
          address: labels.address,
          businessPhone: labels.businessPhone,
          sectionMembership: labels.sectionMembership,
          sectionProfile: labels.sectionProfile,
          sectionAddress: labels.sectionAddress,
          sectionTax: labels.sectionTax,
          sectionBusiness: labels.sectionBusiness,
          save: labels.save,
          back: labels.back,
          memberStatuses: labels.memberStatuses,
          verificationStatuses: labels.verificationStatuses,
        }}
      />
    </div>
  );
}
