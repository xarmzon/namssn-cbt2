import React, { useState, useEffect, useMemo } from "react";
import { NextSeo } from "next-seo";
import LinkButton, { ETypes } from "../components/general/LinkButton";
import Footer from "../components/general/Footer";
import { APP_NAME, ROUTES } from "../utils/constants";
import Logo from "../components/general/Logo";
import Input from "../components/controls/Input";
import MessageBox from "../components/general/MessageBox";
import { connectDB } from "../utils/database";
import CourseModel from "../models/CourseModel";
import { validFullName, validJAMB, validPhoneNumber } from "../utils/auth";
import Alert from "../components/general/Alert";
import { IRegRes } from "../components/dashboard/AuthForm";
import api from "../utils/fetcher";
import { componentsErrors, errorMessage } from "../utils/errorHandler";
import Creators from "../components/general/Creators";
import Link from "next/link";

export interface DataProps {
  error: string;
  value: string;
}

export interface FormDataProps {
  jamb: DataProps;
  fullName: DataProps;
  phoneNumber: DataProps;
  department: DataProps;
  courses: {
    values: Array<string>;
    error: string;
  };
}

interface RegisterPageProps {
  courses: string;
}

const RegisterPage = ({ courses }: RegisterPageProps) => {
  const [canRegister, _] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [noCourse, setNoCourse] = useState<boolean>(true);
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });
  const [formData, setFormData] = useState<FormDataProps>({
    jamb: {
      error: "",
      value: "",
    },
    fullName: {
      error: "",
      value: "",
    },
    department: {
      error: "",
      value: "",
    },
    phoneNumber: {
      error: "",
      value: "",
    },
    courses: {
      error: "",
      values: [],
    },
  });

  const coursesData = useMemo<string[]>(() => {
    return JSON.parse(courses ?? "[]");
  }, [courses]);

  useEffect(() => {
    const data = JSON.parse(courses ?? "[]");
    if (data.length) {
      setNoCourse(false);
    } else {
      setNoCourse(true);
    }
    setLoading(false);
  }, [courses]);

  const handleChange = (type: string, value: string) => {
    setFormData((prev) => ({ ...prev, [type]: { error: "", value } }));
    if (resMsg.msg) {
      setResMsg((prev) => ({ ...prev, msg: "" }));
    }
  };

  const handleChangeCourse = (item: string) => {
    if (formData.courses.values.includes(item)) {
      setFormData((prev: FormDataProps) => ({
        ...prev,
        courses: {
          error: "",
          values: prev.courses.values.filter((d: string) => d !== item),
        },
      }));
    } else {
      setFormData((prev: FormDataProps) => ({
        ...prev,
        courses: { error: "", values: [...prev.courses.values, item] },
      }));
    }
    if (resMsg.msg) {
      setResMsg((prev) => ({ ...prev, msg: "" }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validJAMB(formData.jamb.value)) {
      setFormData((prev) => ({
        ...prev,
        jamb: { ...prev.jamb, error: "Please enter a valid JAMB number" },
      }));
      return;
    }
    if (!validFullName(formData.fullName.value)) {
      setFormData((prev) => ({
        ...prev,
        fullName: { ...prev.fullName, error: "Please enter a valid full name" },
      }));
      return;
    }
    if (!validPhoneNumber(formData.phoneNumber.value)) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          error: "Please enter a valid phone number",
        },
      }));
      return;
    }
    if (!/^[a-zA-Z]{3}[a-zA-Z\s]{2,}$/.test(formData.department.value)) {
      setFormData((prev) => ({
        ...prev,
        department: {
          ...prev.department,
          error: "Please enter a valid department",
        },
      }));
      return;
    }
    if (formData.courses.values.length === 0) {
      setFormData((prev) => ({
        ...prev,
        courses: {
          ...prev.courses,
          error: "Please pick at least one course from the list",
        },
      }));
      return;
    }
    const data = Object.keys(formData)
      .map((key) => ({
        [key]: formData[key].value || formData[key].values,
      }))
      .reduce((curr, data) => ({ ...curr, ...data }), {});
    data.courseSelections = data.courses.join(";");
    delete data.courses;
    try {
      await api.post(ROUTES.API.STUDENT, {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        department: data.department,
        jamb: data.jamb,
        courseSelections: data.courseSelections,
        type: "add",
      });
      setCompleted(true);
    } catch (e) {
      const error = e as any;
      setResMsg((prev) => ({
        ...prev,
        type: "error",
        msg: errorMessage(error),
      }));
      const componentErr = componentsErrors(error);
      if (componentErr.length > 0) {
        componentErr.map((err) =>
          setFormData((prev) => ({
            ...prev,
            [err.type]: { ...prev[err.type], error: err.msg },
          }))
        );
      }
    }
  };
  return (
    <>
      <NextSeo title="Students Registration" />
      <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-no-repeat bg-cover bg-senateBuilding bg-primary bg-blend-multiply backdrop-filter backdrop-blur-sm">
        <div className="z-20 flex justify-center w-full mt-5 -mb-8 shadow-md max-w-max">
          <Logo size="large" />
        </div>
        <div className="text-primary space-y-4 w-full max-w-lg min-h-[300px] bg-gray-50 bg-opacity-95 backdrop-filter backdrop-blur-sm p-5 rounded-md pt-8">
          <h1 className="pt-3 text-center text-ascent md:text-lg">
            STUDENTS REGISTRATION <br />
            <span className="inline-block pt-2 text-2xl font-bold text-primary md:text-4xl">
              {APP_NAME.toUpperCase()} TEST
              <br />
            </span>
          </h1>
          {/* <Creators /> */}
          {!completed && (
            <p className="!mt-8 text-sm text-center text-secondary">
              In order to have access to the questions, please provide the
              details below.
            </p>
          )}

          {loading ? (
            <h3 className="md:max-w-[90%] mx-auto !mt-5 md:!mt-14 text-xl text-gray-700 animate-pulse font-bold text-center">
              Loading...
            </h3>
          ) : completed ? (
            <h3 className="md:max-w-[90%] mx-auto !mt-5 md:!mt-14 text-xl text-green-500 font-bold text-center">
              Congratulations, your details has been captured successfully.{" "}
              <Link href="/">
                <a className="text-yellow-500 underline">Homepage</a>
              </Link>
            </h3>
          ) : noCourse ? (
            <h3 className="md:max-w-[90%] mx-auto !mt-5 md:!mt-14 text-xl text-red-600 font-bold text-center">
              No Course available to register for right now. Please check back
              later
            </h3>
          ) : canRegister ? (
            <>
              {resMsg.msg.length > 0 && (
                <div tabIndex={-1} className="my-4">
                  <Alert type={resMsg.type}>{resMsg.msg}</Alert>
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full space-y-3"
              >
                <Input
                  name="jamb"
                  value={formData.jamb.value}
                  error={formData.jamb.error}
                  showLabel
                  labelValue="Matric/JAMB Reg. No:"
                  placeholder="Eg: 71483233AD"
                  minLength={10}
                  maxLength={10}
                  onChange={(e) => {
                    handleChange(e.target.name, e.target.value);
                  }}
                  required
                />
                <Input
                  name="fullName"
                  value={formData.fullName.value}
                  error={formData.fullName.error}
                  showLabel
                  labelValue="Full Name"
                  placeholder="E.g Adelola Kayode Samson"
                  onChange={(e) => {
                    handleChange(e.target.name, e.target.value);
                  }}
                  required
                />
                <Input
                  name="department"
                  value={formData.department.value}
                  error={formData.department.error}
                  showLabel
                  labelValue="Department"
                  placeholder="E.g Mathematics"
                  onChange={(e) => {
                    handleChange(e.target.name, e.target.value);
                  }}
                  required
                />
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber.value}
                  error={formData.phoneNumber.error}
                  showLabel
                  labelValue="Phone Number"
                  placeholder="E.g 08141161177"
                  type="text"
                  inputMode="tel"
                  onChange={(e) => {
                    handleChange(e.target.name, e.target.value);
                  }}
                  required
                />
                <div className="flex flex-col gap-2">
                  <label htmlFor="" className="text-sm md:text-md">
                    Choose Your Courses
                  </label>
                  <div className="flex flex-wrap items-start gap-3">
                    {coursesData.map((course: string) => (
                      <label
                        key={course}
                        htmlFor={course}
                        className="flex items-center gap-1 text-secondary"
                      >
                        <input
                          name="courses"
                          type="checkbox"
                          id={course}
                          onChange={() => {
                            handleChangeCourse(course);
                          }}
                          className="border rounded border-primary ring-0 focus:ring-0 text-primary"
                        />
                        {course}
                      </label>
                    ))}
                  </div>
                  <MessageBox
                    msg={formData.courses.error}
                    type="error"
                    show={Boolean(formData.courses.error)}
                  />
                </div>
                <Input type="submit" name="submit" value="Register" isBtn />
              </form>
            </>
          ) : (
            <h3 className="!mt-5 md:!mt-14 text-xl text-red-600 font-bold text-center">
              Registration Closed
            </h3>
          )}
        </div>
        <div className="max-w-md mx-auto mt-6 text-center text-gray-200">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default RegisterPage;

export const getServerSideProps = async () => {
  let courses = [];
  try {
    await connectDB();
    courses = await CourseModel.find({});
    courses = courses.map((data) => data.title);
  } catch (e) {
    const err = e as any;
    console.log("StudentReg: Error Loading Courses->", err);
  }
  return {
    props: {
      courses: JSON.stringify(courses),
    },
  };
};
