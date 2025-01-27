import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('인증')
@Controller('auth/signin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: '로그인' }) 
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('잘못된 사용자 이름 또는 비밀번호입니다.');
    }

    return { 
      message: '로그인을 성공하였습니다.', 
      role: user.role, 
      year: user.year,
      class: user.class,
      leader: user.leader,
      sleader: user.sleader
    };
  }
}
