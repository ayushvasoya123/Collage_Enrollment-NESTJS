import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerAdminDto: RegisterAdminDto): Promise<{ message: string }> {
    const { name, email, password } = registerAdminDto;

    const existingAdmin = await this.adminRepository.findOne({ where: { email } });
    if (existingAdmin) {
      throw new BadRequestException('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.adminRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.adminRepository.save(admin);

    return {
      message: 'Admin registered successfully',
    };
  }

  async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    const { name, email, password } = updateAdminDto;

    if (email) {
      const emailExists = await this.adminRepository.findOne({
        where: { email, id: Not(id) },
      });
      if (emailExists) {
        throw new BadRequestException('Email already in use by another admin');
      }
      admin.email = email;
    }

    if (name) {
      admin.name = name;
    }

    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await this.adminRepository.save(admin);

    return {
      message: 'Admin updated successfully',
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      },
    };
  }


  async login(loginDto: LoginDto): Promise<{ access_token: string; admin: { id: number; name: string; email: string } }> {

    const { email, password } = loginDto;
    const admin = await this.adminRepository.findOne({ where: { email } });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email };
   return {
  access_token:
  this.jwtService.sign(payload),

  admin: {
    id: admin.id,
    name: admin.name,
    email: admin.email
  }
};
  }
}

