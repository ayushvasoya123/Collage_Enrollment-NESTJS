import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced Web Technology', description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn advanced backend and frontend technologies', description: 'Course description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 40, description: 'Maximum student capacity' })
  @IsInt()
  @Min(1)
  maxCapacity: number;
}
