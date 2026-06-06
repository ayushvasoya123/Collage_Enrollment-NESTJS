const http = require('http');

const API_BASE = 'http://localhost:3000';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COLLEGE ENROLLMENT BACKEND TESTS ---');

  try {
    // 1. Auth: Login
    console.log('\nTesting Auth login...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'admin@gmail.com',
      password: '123456',
    });
    console.log('Login response status:', loginRes.status);
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.access_token;
    console.log('Login successful. Access token obtained.');

    // 2. Student CRUD (Protected)
    console.log('\nTesting Student CRUD (creating a test student)...');
    const studentEmail = `student_${Date.now()}@example.com`;
    const createStudentRes = await request(
      'POST',
      '/students',
      {
        name: 'Test Student',
        email: studentEmail,
        phone: '111-222-3333',
      },
      token
    );
    console.log('Create Student status:', createStudentRes.status);
    if (createStudentRes.status !== 201) {
      throw new Error(`Create student failed: ${JSON.stringify(createStudentRes.body)}`);
    }
    const student = createStudentRes.body;
    console.log('Student created:', student);

    // 3. Course CRUD (Protected)
    console.log('\nTesting Course CRUD (creating a test course with capacity 2)...');
    const createCourseRes = await request(
      'POST',
      '/courses',
      {
        title: `Course_${Date.now()}`,
        description: 'A course for automated tests',
        maxCapacity: 2,
      },
      token
    );
    console.log('Create Course status:', createCourseRes.status);
    if (createCourseRes.status !== 201) {
      throw new Error(`Create course failed: ${JSON.stringify(createCourseRes.body)}`);
    }
    const course = createCourseRes.body;
    console.log('Course created:', course);

    // 4. Enrollments (Public)
    console.log('\nTesting Rule 1 & 2: Enrollment with non-existent student/course...');
    const invalidStudentRes = await request('POST', '/enrollments', {
      studentId: 999999,
      courseId: course.id,
    });
    console.log('Enrollment status (invalid student):', invalidStudentRes.status, invalidStudentRes.body.message);

    const invalidCourseRes = await request('POST', '/enrollments', {
      studentId: student.id,
      courseId: 999999,
    });
    console.log('Enrollment status (invalid course):', invalidCourseRes.status, invalidCourseRes.body.message);

    console.log('\nTesting successful enrollment of Student 1...');
    const enroll1Res = await request('POST', '/enrollments', {
      studentId: student.id,
      courseId: course.id,
    });
    console.log('Enrollment 1 status:', enroll1Res.status);
    if (enroll1Res.status !== 201) {
      throw new Error(`Enrollment 1 failed: ${JSON.stringify(enroll1Res.body)}`);
    }
    console.log('Enrollment 1 completed successfully.');

    // 5. Rule 3: Prevent duplicate enrollment
    console.log('\nTesting Rule 3: Prevent duplicate enrollment...');
    const duplicateRes = await request('POST', '/enrollments', {
      studentId: student.id,
      courseId: course.id,
    });
    console.log('Duplicate enrollment status:', duplicateRes.status, duplicateRes.body.message);
    if (duplicateRes.status !== 409) {
      throw new Error('Duplicate enrollment check failed (expected 409 Conflict)');
    }

    // 6. Rule 4: Prevent enrollment when capacity exceeded
    // Create Student 2
    console.log('\nCreating Student 2...');
    const studentEmail2 = `student2_${Date.now()}@example.com`;
    const createStudent2Res = await request(
      'POST',
      '/students',
      {
        name: 'Test Student 2',
        email: studentEmail2,
      },
      token
    );
    const student2 = createStudent2Res.body;
    console.log('Student 2 created ID:', student2.id);

    console.log('Enrolling Student 2 to fill capacity (capacity = 2)...');
    const enroll2Res = await request('POST', '/enrollments', {
      studentId: student2.id,
      courseId: course.id,
    });
    console.log('Enrollment 2 status:', enroll2Res.status);

    // Create Student 3
    console.log('\nCreating Student 3...');
    const studentEmail3 = `student3_${Date.now()}@example.com`;
    const createStudent3Res = await request(
      'POST',
      '/students',
      {
        name: 'Test Student 3',
        email: studentEmail3,
      },
      token
    );
    const student3 = createStudent3Res.body;
    console.log('Student 3 created ID:', student3.id);

    console.log('Attempting to enroll Student 3 (should exceed capacity)...');
    const enroll3Res = await request('POST', '/enrollments', {
      studentId: student3.id,
      courseId: course.id,
    });
    console.log('Enrollment 3 status:', enroll3Res.status, enroll3Res.body.message);
    if (enroll3Res.status !== 400) {
      throw new Error('Exceeded capacity check failed (expected 400 Bad Request)');
    }
    console.log('Capacity limit check passed.');

    // 7. GET Enrollments
    console.log('\nTesting GET /enrollments...');
    const getEnrollmentsRes = await request('GET', '/enrollments');
    console.log('GET /enrollments status:', getEnrollmentsRes.status);
    console.log('Number of total enrollments returned:', getEnrollmentsRes.body.length);
    console.log('Sample enrollment representation:', JSON.stringify(getEnrollmentsRes.body[getEnrollmentsRes.body.length - 1], null, 2));

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('\nTest runner failed:', error.message);
  }
}

runTests();
