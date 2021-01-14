class Course {
  constructor(
    ID,
    code,
    name,
    teacher_id,
    year,
    semester,
    teacherFirstName,
    teacherLastName,
    teacherEmail,
    teacherId
  ) {

    this.id = ID;
    this.code = code;
    this.name = name;
    this.teacher_id = teacher_id;
    this.year = year;
    this.semester = semester;
    this.teacherFirstName = teacherFirstName;
    this.teacherLastName = teacherLastName;
    this.teacherEmail = teacherEmail;
    this.teacherId = teacherId;
  }

  /**
   * Construct a Counter from a plain object
   * @param {{}} json
   * @return  Course} the newly created Course object
   */
  static from(json) {
    const l = Object.assign(new Course(), json);
    return l;
  }
}

export default Course;
