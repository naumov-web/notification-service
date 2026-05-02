import 'dotenv/config';
import { AppDataSource } from '@app/database/data-source';
import { TemplateSeeder } from '@app/templates/template.seeder';

async function bootstrap() {
    await AppDataSource.initialize();

    const seeder = new TemplateSeeder(AppDataSource);
    await seeder.run();

    await AppDataSource.destroy();
}

bootstrap();