import { PrismaClient, type Prisma } from '@prisma/client';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLES } from '@repo/shared';
import { SEED_TEMPLATES } from './seed-templates';
import { SEED_THEMES } from './seed-themes';

/**
 * Seed roles + permissions mặc định. Idempotent — chạy lại không tạo trùng.
 * Nguồn sự thật: packages/shared/src/constants/permissions.ts
 */
const prisma = new PrismaClient();

async function main() {
  for (const action of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
  }

  for (const roleName of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const actions = DEFAULT_ROLE_PERMISSIONS[roleName];
    const permissions = await prisma.permission.findMany({
      where: { action: { in: [...actions] } },
    });

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // Templates hệ thống — idempotent theo title
  for (const tpl of SEED_TEMPLATES) {
    const existing = await prisma.template.findFirst({ where: { title: tpl.title } });
    const data = {
      title: tpl.title,
      category: tpl.category,
      content: tpl.content as unknown as Prisma.InputJsonValue,
      isPublic: true,
    };
    if (existing) {
      await prisma.template.update({ where: { id: existing.id }, data });
    } else {
      await prisma.template.create({ data });
    }
  }

  // System themes — idempotent theo name
  for (const th of SEED_THEMES) {
    const existing = await prisma.theme.findFirst({
      where: { name: th.name, isSystemTheme: true },
    });
    const data = {
      name: th.name,
      config: th.config as unknown as Prisma.InputJsonValue,
      isSystemTheme: true,
    };
    if (existing) {
      await prisma.theme.update({ where: { id: existing.id }, data });
    } else {
      await prisma.theme.create({ data });
    }
  }

  console.log(
    `Seed hoàn tất: roles + permissions + ${SEED_TEMPLATES.length} templates + ${SEED_THEMES.length} themes.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
