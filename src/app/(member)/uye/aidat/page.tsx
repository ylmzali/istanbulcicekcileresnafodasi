import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Aidat Sorgula" };

/** Member portal dues UI comes later; public payment info lives at /aidat-sorgulama. */
export default function MemberDuesPage() {
  redirect(routes.membership.dues);
}
