import { NextResponse } from "next/server";
import { readDocumentFile } from "@/lib/media/document-storage";
import { getPublicResourceById } from "@/services/resources";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const resource = await getPublicResourceById(id);
  if (!resource) {
    return NextResponse.json(
      { success: false, message: "Kaynak bulunamadı." },
      { status: 404 },
    );
  }

  try {
    const buffer = await readDocumentFile(resource.fileKey);
    const filename =
      resource.fileKey.split("/").pop() || `${resource.slug}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": resource.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Dosya okunamadı." },
      { status: 500 },
    );
  }
}
