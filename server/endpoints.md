# Login

Will set a cookie with a string used to authentication

- **POST** /api/login
  - _request params_
    - username: string
    - password: string
  - _response body_
    - success: bool
    - userId: int
    - type: int

# Meaning of field type

- **GET** /api/types
  - _request params_
    - empty
  - _response params_
    - success: bool
    - list: [array(object)]
      - typeId: int
      - typeDesc: string _(student, teacher, booking manager)_

# Check login

- **GET** /api/logged
  - _request params_
    - empty
  - _response body_
    - success: bool
    - loggedIn: bool
  - _if not logged the response code will be 403_

# Logout

- **POST** /api/logout
  - _request params_
    - empty
  - _response body_
    - success: bool

# Current user

Requires login

- **GET** /api/user/me
  - _request params_
    - empty
  - _response body_
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

# All courses

- **GET** /api/courses
  - _request params_
    - _optional_ ofLogged: no value
  - _response body_
    - success: bool
    - courses: [object]{
      - ID: int
      - code: string
      - name: string
      - year: int _(is the academical year: for example 1 for the first year)_
      - semester: int
      - teacherId: int
      - teacherFirstName: string
      - teacherLastName: string
      - teacherEmail: string
        }

# All courses

- **GET** /api/courses
  - _request params_
    - _optional_ ofLogged: no value
  - _response body_
    - success: bool
    - courses: [object]{
      - ID: int
      - code: string
      - name: string
      - year: int _(is the academical year: for example 1 for the first year)_
      - semester: int
      - teacherId: int
      - teacherFirstName: string
      - teacherLastName: string
      - teacherEmail: string
        }

# All lectures of a user

Requires login as student or teacher

- **GET** /api/users/{userId}/lectures?[startDate=YYYY-mm-dd][enddate=yyyy-mm-dd]
  - _request params_
    - empty
  - _response body_
    - success: bool
    - lectures: [object]
      - lectureId: int
      - courseId: int
      - courseName: string
      - startTS: int _(GMT timezone)_
      - endTS: int _(GMT timezone)_
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
  - _request params_
    - lectureId: int
  - _response body_
    - success: bool
    - inWaitingList: bool
    - mailSent: bool

# Students booked to a lecture

Requires login as teacher

- **GET** /api/lectures/{lectureId}/students
  - _request params_
    - empty
  - _response body_
    - success: bool
    - students: [object]
      - studentId: int
      - studentName: string
      - email: string
      - inWaitingList : bool

# Cancel a booking

Requires login as student

- **DELETE** /api/users/{userId}/book
  - _request params_
    - lectureId: int
  - _response body_
    - success: bool

# Cancel a lecture

Requires login as teacher

- **DELETE** /api/lectures/{lectureId}
  - _request params_
    - empty
  - _response body_
    - success: bool

# Edit a lecture online status

Requires login as teacher

- **PATCH** /api/lectures/{lectureId}/online
  - _request params_
    - value: bool
  - _response body_
    - success: bool

# Booking statistics

Requires login as teacher or booking manager

- **GET** /api/stats?lecture=LL&course=XXX&period=PPPP&week=WW&month=MM&year=YYYY
  - _URL params details_
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
  - _response body_
    - success: bool
    - courseId: int | null
    - bookingsAvg: float
    - bookingsStdDev: float
    - totalBookings: int
    - attendancesAvg: float
    - attendancesStdDev: float
    - totalAttendances: int
    - cancellationsAvg: float
    - cancellationsStdDev: float
    - totalCancellations: int
    - nLectures: int
      - cancellation statistics are present only for a booking manager

# Upload students csv

Require login as support officer

- **POST** /api/students/upload
  - _request params_
    - student_file: file _content of the csv file correctly formatted as multipart/form-data (check out FormData object)_
  - _response body_
    - success: bool

# Upload teachers csv

Require login as support officer

- **POST** /api/teachers/upload
  - _request params_
    - teacher_file: file _content of the csv file correctly formatted as multipart/form-data (check out FormData object)_
  - _response body_
    - success: bool

# Upload courses csv

Require login as support officer

- **POST** /api/courses/upload
  - _request params_
    - course_file: file _content of the csv file correctly formatted as multipart/form-data (check out FormData object)_
  - _response body_
    - success: bool

# Upload enrollments csv

Require login as support officer

- **POST** /api/enrollments/upload
  - _request params_
    - enrollment_file: file _content of the csv file correctly formatted as multipart/form-data (check out FormData object)_
  - _response body_
    - success: bool

# Upload schedule csv
Requiire login as support officer

- **POST** /api/schedules/upload
  - *request params*
    - schedule_file: file *content of the csv file correctly formatted as multipart/form-data (check out FormData object)*
    - startDay: string YYYY-mm-dd
    - endDay: string YYYY-mm-dd
  - *response body*
    - success: bool

# Error

If an error occurs, the _response body_ is

- success: bool
- reason: string

If the user is not authenticated and tries to use an endpoint that require authentication, the HTTP response will be 403
