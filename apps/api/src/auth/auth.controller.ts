import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@app/auth';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto, LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login as admin user' })
  @ApiResponse({
    status: 200,
    description: 'JWT token',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
