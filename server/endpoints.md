# Login
Will set a cookie with a string used to authentication

- **POST** /api/login
  - *request params*
    - username: string
    - password: string
  - *response body*
    - success: bool
    - userId: int
    - type: int

# Meaning of field type
- **GET** /api/types
  - *request params*
    - empty
  - *response params*
    - success: bool
    - list: [array(object)]
      - typeId: int
      - typeDesc: string *(student, teacher, booking manager)*

# Check login
- **GET** /api/logged
  - *request params*
    - empty
  - *response body*
    - success: bool
    - loggedIn: bool
  - *if not logged the response code will be 403*

# Logout
- **POST** /api/logout
  - *request params*
    - empty
  - *response body*
    - success: bool

# Current user
Requires login

- **GET** /api/user/me
  - *request params*
    - empty
  - *response body*
    - success: bool
    - userId: int
    - type: int
    - username: string
    - email: string
    - firstname: string
    - lastname: string
    - city: string
    - birthday: ISO-8601 string "-" separated
    - SSN: string

# All lectures of a user
Requires login as student or teacher

- **GET** /api/users/{userId}/lectures?[startDate=YYYY-mm-dd][endDate=YYYY-mm-dd]
  - *request params*
    - empty
  - *response body*
    - success: bool
    - lectures: [object]
      - lectureId: int
      - courseId: int
      - courseName: string
      - startTS: int *(GMT timezone)*
      - endTS: int *(GMT timezone)*
      - online: bool
      - teacherName: string
      - roomName: string
      - bookedSeats: int
      - totalSeats: int
      - bookedSelf: bool
      - inWaitingList: bool

# Book a lecture
Requires login as student

- **POST** /api/users/{userId}/book
  - *request params*
    - lectureId: int
  - *response body*
    - success: bool
    - inWaitingList: bool
    - mailSent: bool

# Students booked to a lecture
Requires login as teacher

- **GET** /api/lectures/{lectureId}/students
  - *request params*
    - empty
  - *response body*
    - success: bool
    - students: [object]
      - studentId: int
      - studentName: string
      - email: string
      - inWaitingList : bool

# Cancel a booking
Requires login as student

- **DELETE** /api/users/{userId}/book
  - *request params*
    - lectureId: int
  - *response body*
    - success: bool

# Cancel a lecture
Requires login as teacher

- **DELETE** /api/lectures/{lectureId}
  - *request params*
    - empty
  - *response body*
    - success: bool

# Edit a lecture online status
Requires login as teacher
- **PATCH** /api/lectures/{lectureId}/online
  - *request params*
    - value: bool
  - *response body*
    - success: bool

# Booking statistics
Requires login as teacher or booking manager

- **GET** /api/stats?lecture=LL&course=XXX&period=PPPP&week=WW&month=MM&year=YYYY
  - *URL params details*
    - lecture: id of lecture
    - course: id of course | all
      - if lecture not present, defaults to all, ignored otherwise
    - period: week | month | all
      - if lecture not present, defaults to all, ignored otherwise
    - week: 0 <= id of week <= 52
      - mandatory if period = week, ignored otherwise
    - month: 0 <= id of month <= 11
      - mandatory if period = month, ignored otherwise
    - year: year > 0
      - mandatory if period = week | month, ignored otherwise
  - *response body*
    - success: bool
    - courseId: int | null
    - bookingsAvg: float
    - bookingsStdDev: float
    - totalBookings: int
    - attendanceAvg: float
    - attendanceStdDev: float
    - totalAttendance: int
    - cancellationsAvg: float
    - cancellationsStdDev: float
    - totalCancellations: int
    - nLectures: int
      - attendance statistics are not present at the moment
      - cancellation statistics are present only for a booking manager

# Upload students csv
Require login as support officer

- **POST** /api/students/upload
  - *request params*
    - student_file: file *content of the csv file correctly formatted as multipart/form-data (check out FormData object)*
  - *response body*
    - success: bool

# Upload students csv
Require login as support officer

- **POST** /api/teachers/upload
  - *request params*
    - teacher_file: file *content of the csv file correctly formatted as multipart/form-data (check out FormData object)*
  - *response body*
    - success: bool

# Upload courses csv
Require login as support officer

- **POST** /api/courses/upload
  - *request params*
    - course_file: file *content of the csv file correctly formatted as multipart/form-data (check out FormData object)*
  - *response body*
    - success: bool

# Upload enrollments csv
Require login as support officer

- **POST** /api/enrollments/upload
  - *request params*
    - enrollment_file: file *content of the csv file correctly formatted as multipart/form-data (check out FormData object)*
  - *response body*
    - success: bool

# Error
If an error occurs, the *response body* is
- success: bool
- reason: string

If the user is not authenticated and tries to use an endpoint that require authentication, the HTTP response will be 403