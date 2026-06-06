import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RegisterAdminDto } from './register-admin.dto';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminDto extends PartialType(RegisterAdminDto) {
    @ApiProperty({ example: 'Admin Updated', description: 'Updated admin full name', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'admin.new@gmail.com', description: 'Updated admin email address', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiProperty({ example: 'newpassword123', description: 'Updated admin password (min 6 characters)', required: false })
    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;
}
