// apps/api/prisma/seed.ts
// Local development seed.
// Run via: pnpm --filter @huggi/api exec prisma db seed
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_CLINIC_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_ADMIN_USER_ID = '00000000-0000-0000-0000-000000000010';
const DEMO_ADMIN_EMAIL = 'admin@huggi-demo.test';
const DEMO_ADMIN_PASSWORD = 'huggi_dev_password';

const ROLES = [
  { name: 'SUPER_ADMIN', description: 'Huggi platform admin — system-wide access' },
  { name: 'CLINIC_ADMIN', description: 'Clinic owner/manager — full clinic access' },
  { name: 'RECEPTIONIST', description: 'Manage patients, appointments, queue' },
  { name: 'NURSE', description: 'Update queue status, view patients, manage consultations' },
  { name: 'DOCTOR', description: 'View own appointments, update consultation status' },
  { name: 'CARE_TAKER', description: 'View assigned patients only' },
  { name: 'SECURITY', description: 'View queue screen only' },
  { name: 'BILLING_STAFF', description: 'View patients, manage invoices' },
];

async function seedClinic(): Promise<void> {
  const clinic = await prisma.clinic.upsert({
    where: { id: DEMO_CLINIC_ID },
    update: {},
    create: {
      id: DEMO_CLINIC_ID,
      name: 'Huggi Demo Clinic',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      phone: '+919876543210',
      isActive: true,
    },
  });
  console.log(`✅ Seeded clinic: ${clinic.id} — ${clinic.name}`);
}

async function seedRoles(): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  const count = await prisma.role.count();
  console.log(`✅ Seeded roles: ${count} total (${ROLES.map((r) => r.name).join(', ')})`);
}

async function seedDemoAdmin(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'CLINIC_ADMIN' } });

  const user = await prisma.user.upsert({
    where: { id: DEMO_ADMIN_USER_ID },
    update: { passwordHash, isActive: true },
    create: {
      id: DEMO_ADMIN_USER_ID,
      email: DEMO_ADMIN_EMAIL,
      name: 'Demo Clinic Admin',
      passwordHash,
      isActive: true,
    },
  });

  await prisma.clinicUser.upsert({
    where: {
      userId_clinicId_roleId: {
        userId: user.id,
        clinicId: DEMO_CLINIC_ID,
        roleId: adminRole.id,
      },
    },
    update: { isActive: true },
    create: {
      userId: user.id,
      clinicId: DEMO_CLINIC_ID,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(`✅ Seeded demo admin: ${user.email} (password: ${DEMO_ADMIN_PASSWORD})`);
}

async function main(): Promise<void> {
  await seedClinic();
  await seedRoles();
  await seedDemoAdmin();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
