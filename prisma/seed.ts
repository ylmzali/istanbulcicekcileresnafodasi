import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../src/lib/auth/permission-catalog";
import { hashPassword } from "../src/lib/auth/password";
import { APPLICATION_DOCUMENT_TYPE_DEFS } from "../src/lib/application-labels";
import { ISTANBUL_DISTRICTS } from "../src/lib/istanbul-districts";
import { slugify } from "../src/lib/slug";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Süper Yönetici",
  content_manager: "İçerik Yöneticisi",
  member_services: "Üye Hizmetleri",
  accounting: "Muhasebe",
  appointment_officer: "Randevu Görevlisi",
  support_officer: "Destek Görevlisi",
  auditor: "Denetçi",
  member: "Üye",
};

function getMysqlConfig() {
  if (
    process.env.MYSQL_HOST &&
    process.env.MYSQL_USER &&
    process.env.MYSQL_DATABASE
  ) {
    return {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 5,
    };
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or MYSQL_* required for seed");
  }

  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 5,
  };
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(getMysqlConfig()),
});

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const email = process.env.ADMIN_EMAIL ?? "admin@localhost";

  const rolesByName = new Map<string, { id: string }>();

  for (const [name, displayName] of Object.entries(ROLE_LABELS)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { displayName },
      create: { name, displayName },
    });
    rolesByName.set(name, role);
  }

  const permissionsByName = new Map<string, { id: string }>();
  for (const name of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: { displayName: PERMISSION_LABELS[name] },
      create: { name, displayName: PERMISSION_LABELS[name] },
    });
    permissionsByName.set(name, permission);
  }

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = rolesByName.get(roleName);
    if (!role) continue;
    for (const permissionName of permissionNames) {
      const permission = permissionsByName.get(permissionName);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const superAdminRole = rolesByName.get("super_admin");
  if (!superAdminRole) {
    throw new Error("super_admin role missing after seed");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      passwordHash,
      status: "active",
      deletedAt: null,
    },
    create: {
      username,
      email,
      passwordHash,
      status: "active",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`Seeded admin user "${username}" with role super_admin`);
  console.log(
    `Seeded ${rolesByName.size} roles and ${permissionsByName.size} permissions`,
  );

  const istanbul = await prisma.city.upsert({
    where: { slug: "istanbul" },
    update: { name: "İstanbul" },
    create: {
      name: "İstanbul",
      slug: "istanbul",
    },
  });

  for (const name of ISTANBUL_DISTRICTS) {
    const slug = slugify(name);
    await prisma.district.upsert({
      where: { slug },
      update: {
        name,
        cityId: istanbul.id,
      },
      create: {
        name,
        slug,
        cityId: istanbul.id,
      },
    });
  }

  console.log(
    `Seeded city İstanbul with ${ISTANBUL_DISTRICTS.length} districts`,
  );

  for (const def of APPLICATION_DOCUMENT_TYPE_DEFS) {
    await prisma.documentType.upsert({
      where: { slug: def.slug },
      update: { name: def.name, active: true },
      create: {
        slug: def.slug,
        name: def.name,
        requirements: def.required
          ? "Üyelik başvurusu için zorunlu belgedir."
          : "Üyelik başvurusu için önerilir.",
        fee: 0,
        active: true,
      },
    });
  }
  console.log(
    `Seeded ${APPLICATION_DOCUMENT_TYPE_DEFS.length} application document types`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
