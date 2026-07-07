import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLES } from '@repo/shared';

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

  console.log('Seed hoàn tất: roles + permissions.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
