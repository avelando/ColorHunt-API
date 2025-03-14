import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar usuário' })
  @ApiBody({
    description: 'Dados para registrar um novo usuário',
    type: RegisterDto,
    required: true,
    schema: {
      example: {
        name: 'John Doe',
        username: 'johnny',
        email: 'john@example.com',
        password: 'secret123',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Usuário registrado com sucesso' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Usuário registrado com sucesso', user };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Realizar login' })
  @ApiBody({
    description: 'Credenciais para login',
    type: LoginDto,
    required: true,
    schema: {
      example: {
        email: 'john@example.com',
        password: 'secret123',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return result;
  }
}
