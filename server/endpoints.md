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
      - typeDesc: string *(student, teacher)*

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

# All lectures of a user
Requires login

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

# Book a lecture
Requires login as student

- **POST** /api/users/{userId}/book
  - *request params*
    - lectureId: int
  - *response body*
    - success: bool

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

# Error
If an error occurs, the *response body* is
- success: bool
- reason: string

If the user is not authenticated and tries to use an endpoint that require authentication, the HTTP response will be 403