import { db } from './db';
import bcrypt from 'bcryptjs';

const prisma = db;

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Permissions
    console.log('Creating permissions...');
    const permissions = await Promise.all([
        prisma.permission.upsert({
            where: { name: 'users:view' },
            update: {},
            create: { name: 'users:view', description: 'View users' },
        }),
        prisma.permission.upsert({
            where: { name: 'users:edit' },
            update: {},
            create: { name: 'users:edit', description: 'Edit user accounts' },
        }),
    ]);

    console.log(`✓ Created ${permissions.length} permissions`);

    // Create Roles
    console.log('Creating roles...');

    // Superadmin (Admin App)
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'superadmin' },
        update: {},
        create: {
            name: 'superadmin',
            description: 'Super Administrator (Admin App)',
            permissions: {
                connect: permissions.map((p) => ({ id: p.id })),
            },
        },
    });

    // Admin (Client App)
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Administrator (Client App)',
            permissions: {
                connect: permissions.map((p) => ({ id: p.id })),
            },
        },
    });

    // Manager (Client App)
    const managerRole = await prisma.role.upsert({
        where: { name: 'manager' },
        update: {},
        create: {
            name: 'manager',
            description: 'Manager (Client App)',
            permissions: {
                connect: [{ name: 'users:view' }],
            },
        },
    });

    console.log('✓ Created roles: superadmin, admin, manager');

    // Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Superadmin User
    await prisma.user.upsert({
        where: { email: 'superadmin@gonza.com' },
        update: {
            roleId: superAdminRole.id,
            password: hashedPassword
        },
        create: {
            email: 'superadmin@gonza.com',
            password: hashedPassword,
            name: 'Super Admin',
            emailVerified: true,
            roleId: superAdminRole.id,
        },
    });

    // Client Admin User
    await prisma.user.upsert({
        where: { email: 'admin@gonza.com' },
        update: {
            roleId: adminRole.id,
            password: hashedPassword
        },
        create: {
            email: 'admin@gonza.com',
            password: hashedPassword,
            name: 'Client Admin',
            emailVerified: true,
            roleId: adminRole.id,
        },
    });

    // Client Manager User
    await prisma.user.upsert({
        where: { email: 'manager@gonza.com' },
        update: {
            roleId: managerRole.id,
            password: hashedPassword
        },
        create: {
            email: 'manager@gonza.com',
            password: hashedPassword,
            name: 'Client Manager',
            emailVerified: true,
            roleId: managerRole.id,
        },
    });

    console.log('✓ Created users:');
    console.log('  - superadmin@gonza.com (Superadmin)');
    console.log('  - admin@gonza.com (Client Admin)');
    console.log('  - manager@gonza.com (Client Manager)');

    // Create a default Branch for the admin
    console.log('Creating default branch...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@gonza.com' } });
    if (adminUser) {
        await prisma.branch.upsert({
            where: { name: 'Main Branch' },
            update: { adminId: adminUser.id },
            create: {
                name: 'Main Branch',
                location: 'Kampala',
                adminId: adminUser.id
            }
        });
        console.log('✓ Created default branch: Main Branch');
    }

    console.log('  Password for all: password123');
    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    });
