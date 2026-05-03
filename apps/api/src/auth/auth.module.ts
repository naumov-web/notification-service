import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule as CoreAuthModule } from '@app/auth';

import { AuthController } from './auth.controller';
import { AdminUser } from '@app/database/entities/admin-user.entity';

@Module({
  imports: [CoreAuthModule, TypeOrmModule.forFeature([AdminUser])],
  controllers: [AuthController],
})
export class AuthModule {}
