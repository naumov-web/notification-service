import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AdminUser } from '@app/database/entities/admin-user.entity';

@Injectable()
export class AuthService {
  private invalidCredentialsMessage: string = 'Invalid credentials';

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(email: string, password: string) {
    const repo = this.dataSource.getRepository(AdminUser);
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(this.invalidCredentialsMessage);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException(this.invalidCredentialsMessage);
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
