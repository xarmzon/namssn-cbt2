import { validFullName, validPhoneNumber } from "./../../../utils/auth";
import { FETCH_LIMIT } from "./../../../utils/constants";
import { getPaginatedData } from "./../course/index";
import { MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import Result from "../../../models/ResultModel";
import Student from "../../../models/StudentModel";
import Cookie from "js-cookie";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        const { type } = req.body;
        if (!type) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        switch (type) {
          case "upload":
            await uploadStudents(req, res);
            break;
          case "add":
            await addStudent(req, res);
            break;
          case "exam":
            await addStudentExam(req, res);
            break;
          default:
            return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        }
        break;
      case "GET":
        await getStudents(req, res);
        break;
      case "PATCH":
        await updateStudent(req, res);
        break;
      case "DELETE":
        const { delete_ } = req.query;
        if (!delete_)
          return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        switch (delete_) {
          case "many":
            await deleteStudents(req, res);
            break;
          case "one":
            await deleteStudent(req, res);
            break;
          default:
            return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        }
        break;
      default:
        return res.status(400).json({ msg: MESSAGES.METHOD_NOT_ALLOWED });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: MESSAGES.UNKNOWN_ERROR });
  }
};

const uploadStudents = async (req: NextApiRequest, res: NextApiResponse) => {
  const { students } = req.body;
  if (!students) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  //console.log(students[0]);
  const studentsToInsert = students.map((d) => {
    const surname = d["Surname"] ? toTitleCase(d["Surname"].trim()) : "---";
    const firstName = d["First name"]
      ? toTitleCase(d["First name"].trim())
      : "---";
    const otherNames = d["Other names"]
      ? toTitleCase(d["Other names"].trim())
      : "";

    let fullName = surname + " " + firstName;
    if (otherNames) fullName = fullName + " " + otherNames;

    const jamb = d["JAMB Registration Number"]
      ? d["JAMB Registration Number"].toUpperCase()
      : "---------";
    const department = d["Department"]
      ? toTitleCase(d["Department"].trim())
      : "--------";

    const courseSelections = d["Course Selections"]
      ? d["Course Selections"]
      : d["Course Applied for"]
      ? d["Course Applied for"]
      : "-------";

    const phoneNumber = d["Phone Number"]
      ? d["Phone Number"].length < 11
        ? "0" + d["Phone Number"]
        : d["Phone Number"]
      : "00000000000";
    return {
      fullName,
      jamb,
      department,
      courseSelections,
      phoneNumber,
    };
  });

  await Student.insertMany(studentsToInsert);

  return res.status(201).json({ msg: MESSAGES.NEW_ACCOUNT_STUDENT_SUCCESSFUL });
};

const addStudentExam = async (req: NextApiRequest, res: NextApiResponse) => {
  const { jamb, phoneNumber, course } = req.body;
  if (!jamb || !phoneNumber || !course)
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  const studentData = await Student.findOne({
    jamb: jamb.toUpperCase(),
    phoneNumber,
  });
  if (!studentData) {
    return res.status(400).json({ msg: MESSAGES.NO_STUDENT });
  }

  const courseData = await Course.findOne({ _id: course });
  if (!courseData)
    return res.status(404).json({ msg: MESSAGES.NO_COURSE_DATA });

  const isStudentCourse = studentData.courseSelections
    .split(";")
    .map((d, i) => d.split(" ").join("").toLowerCase())
    .includes(courseData.title.split(" ").join("").toLowerCase());

  const isMockExam = courseData.title.includes("PUTME");

  if (!isStudentCourse && !isMockExam)
    return res.status(400).json({ msg: MESSAGES.CANT_REGISTER_EXAM });

  const startDiff: number = +new Date(courseData.startDate) - +new Date();

  if (startDiff > 0)
    return res.status(400).json({ msg: MESSAGES.CANT_START_EXAM });

  const dueDateDiff = +new Date(courseData.dueDate) - +new Date();
  if (dueDateDiff < 0)
    return res.status(400).json({ msg: MESSAGES.EXPIRED_EXAM });

  let result = await Result.findOne({
    student: studentData._id,
    course: courseData._id,
  });
  if (result && result.score > -1) {
    return res.status(400).json({ msg: MESSAGES.CANT_RESIT });
  } else if (result && result.score === -1) {
    return res
      .status(200)
      .json({ id: result._id, msg: MESSAGES.OLD_STUDENT_SUCCEFUL });
  } else {
    result = await Result.create({
      course: courseData._id,
      student: studentData._id,
    });
    return res
      .status(201)
      .json({ id: result._id, msg: MESSAGES.NEW_STUDENT_SUCCEFUL });
  }
};

const addStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fullName, phoneNumber, department, jamb, courseSelections } =
    req.body;
  if (!fullName || !phoneNumber || !department || !jamb || !courseSelections)
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  if (!validFullName(fullName) || !validPhoneNumber(phoneNumber))
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  let studentData = await Student.findOne({
    $or: [{ fullName: formatFullName(fullName) }, { phoneNumber }, { jamb }],
  });
  if (!studentData) {
    studentData = await Student.create({
      fullName: formatFullName(fullName),
      phoneNumber,
      department: toTitleCase(department),
      jamb: jamb.toUpperCase(),
      courseSelections: courseSelections
        .split(";")
        .map((d, i) => d.toUpperCase())
        .join(";"),
    });
  } else {
    return res.status(400).json({ msg: MESSAGES.ACCOUNT_EXIST });
  }

  return res.status(201).json({ msg: MESSAGES.NEW_ACCOUNT_STUDENT_SUCCESSFUL });
};

export const getStudents = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  let limit: number = req.query.limit
    ? parseInt(req.query.limit as string)
    : FETCH_LIMIT;
  let page: number = req.query.page
    ? parseInt(req.query.page as string) - 1
    : 0;
  const searchTerm: string = req.query.search
    ? (req.query.search as string)
    : "";

  let options = {};
  if (searchTerm) {
    options = {
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { phoneNumber: { $regex: searchTerm, $options: "i" } },
      ],
    };
    //page = 0;
  }
  const pg = await getPaginatedData(page, limit, Student, options);

  return res.status(200).json(pg);
};

const deleteStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  //console.log(id);
  const deleted = await Student.deleteOne({ _id: id });
  //console.log(deleted);
  if (deleted.deletedCount && deleted.deletedCount > 0)
    return res.status(200).json({ msg: MESSAGES.STUDENT_DELETED });
  else return res.status(404).json({ msg: MESSAGES.NO_STUDENT });
};

const deleteStudents = async (req: NextApiRequest, res: NextApiResponse) => {
  const deleted = await Student.deleteMany({});
  //console.log(deleted);
  if (deleted.deletedCount && deleted.deletedCount > 0) {
    const deletedR = await Result.deleteMany({});
    return res.status(200).json({ msg: MESSAGES.STUDENT_DELETED });
  } else return res.status(404).json({ msg: MESSAGES.NO_STUDENT });
};

const updateStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fullName, phoneNumber, id, department, jamb, courseSelections } =
    req.body;
  if (
    !fullName ||
    !phoneNumber ||
    !department ||
    !jamb ||
    !courseSelections ||
    !id
  )
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  if (!validFullName(fullName) || !validPhoneNumber(phoneNumber))
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  const studentData = await Student.findById(id);
  if (!studentData) return res.status(400).json({ msg: MESSAGES.NO_STUDENT });

  studentData.fullName = formatFullName(fullName);
  studentData.phoneNumber = phoneNumber;
  studentData.jamb = jamb;
  studentData.department = department;
  studentData.courseSelections = courseSelections;

  await studentData.save();
  return res.status(200).json({ msg: MESSAGES.STUDENT_UPDATED });
};

export const formatFullName = (fullName: string) => {
  const words: string[] = fullName.toLowerCase().split(" ");
  const fullName_ = words
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return fullName_;
};
export const toTitleCase = (text: string) => {
  const words: string[] = text.toLowerCase().split(" ");
  const fullName_ = words
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return fullName_;
};
