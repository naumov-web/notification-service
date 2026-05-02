import 'reflect-metadata';
import * as bcrypt from 'bcrypt';

import { AppDataSource } from '@app/database/data-source';
import { AdminUser } from '@app/database/entities/admin-user.entity';

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('Usage: npm run create-admin <email> <password>');
        process.exit(1);
    }

    await AppDataSource.initialize();

    const repo = AppDataSource.getRepository(AdminUser);

    const existing = await repo.findOne({ where: { email } });

    if (existing) {
        console.error('Admin already exists');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);

    const admin = repo.create({
        email,
        password: hash,
    });

    await repo.save(admin);

    console.log('Admin created:', email);

    process.exit(0);
}

main();