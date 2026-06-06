import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'Admin', description: 'Admin full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@gmail.com', description: 'Admin email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Admin password (min 6 characters)' })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
