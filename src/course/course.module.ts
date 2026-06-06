import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService, TypeOrmModule],
})
export class CourseModule { }

