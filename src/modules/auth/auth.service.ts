import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      return user;
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Remove password from response (user is already a plain object from raw: true)
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.create(registerDto);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Convert Sequelize model to plain object and remove password
    const userPlain = user.toJSON();
    const { password, ...userWithoutPassword } = userPlain;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
