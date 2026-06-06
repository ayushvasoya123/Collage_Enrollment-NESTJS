import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { studentId, courseId } = createEnrollmentDto;

    // Rule 1: Student must exist
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Rule 2: Course must exist
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Rule 3: Prevent duplicate enrollment
    const existing = await this.enrollmentRepository.findOne({
      where: { studentId, courseId },
    });
    if (existing) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    // Rule 4: Prevent enrollment when course capacity exceeded
    const currentEnrolledCount = await this.enrollmentRepository.count({
      where: { courseId },
    });
    if (currentEnrolledCount >= course.maxCapacity) {
      throw new BadRequestException('Course capacity has been reached');
    }

    const enrollment = this.enrollmentRepository.create({ studentId, courseId });
    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      relations: { student: true, course: true },
    });
  }
}
