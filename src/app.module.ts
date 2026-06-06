import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { Admin } from './auth/entities/admin.entity';
import { Student } from './student/entities/student.entity';
import { Course } from './course/entities/course.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'college_db',
      entities: [Admin, Student, Course, Enrollment],
      synchronize: false,
    }),
    AuthModule,
    StudentModule,
    CourseModule,
    EnrollmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
