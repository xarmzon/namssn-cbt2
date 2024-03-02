import { useState, useEffect, useRef } from "react";
import { validateStudentData } from "../../utils/auth";
import Input from "../controls/Input";
import Select from "../controls/Select";
import api from "../../utils/fetcher";
import { ROUTES } from "../../utils/constants";
import { errorMessage, componentsErrors } from "../../utils/errorHandler";
import Alert from "../general/Alert";
import { IRegRes } from "../dashboard/AuthForm";
import { useRouter } from "next/router";

export interface DataProps {
  error: string;
  value: string;
}

export interface FormDataProps {
  jamb: DataProps;
  phoneNumber: DataProps;
  course: DataProps;
}

export interface IStudentData {
  id: string;
}

const LoginForm = ({ courses }) => {
  const router = useRouter();
  const [coursesData, setCoursesData] = useState(courses);
  const msgRef = useRef();
  const [submitText, setSubmitText] = useState<string>("Submit");
  const [formData, setFormData] = useState<FormDataProps>({
    jamb: {
      error: "",
      value: "",
    },
    phoneNumber: {
      error: "",
      value: "",
    },
    course: {
      error: "",
      value: "",
    },
  });
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });
  const [studentData, setStudentData] = useState<IStudentData>({
    id: "",
  });

  useEffect(() => {
    // console.log(coursesData);
  }, []);

  const resetErrors = () => {
    setFormData((prev) => ({
      ...prev,
      jamb: { ...prev.jamb, error: "" },
      phoneNumber: { ...prev.phoneNumber, error: "" },
      course: { ...prev.course, error: "" },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    switch (submitText) {
      case "Submit":
        handleResMsg();
        resetErrors();
        const errors = validateStudentData({
          jamb: formData.jamb.value,
          phoneNumber: formData.phoneNumber.value,
          course: formData.course.value,
        });
        if (errors.length > 0) {
          errors.map((e) =>
            setFormData((prev) => ({
              ...prev,
              [e.type]: { ...prev[e.type], error: e.msg },
            }))
          );
          setSubmitText("Submit");
        } else {
          setSubmitText("Loading...");
          try {
            const { data } = await api.post(ROUTES.API.STUDENT, {
              jamb: formData.jamb.value,
              phoneNumber: formData.phoneNumber.value,
              course: formData.course.value,
              type: "exam",
            });
            setResMsg((prev) => ({
              ...prev,
              type: "success",
              msg: data.msg,
            }));
            setStudentData({ id: data.id });
            setSubmitText("Start");
          } catch (e) {
            setSubmitText("Submit");
            //console.log(e);
            setResMsg((prev) => ({
              ...prev,
              type: "error",
              msg: errorMessage(e),
            }));
            const componentErr = componentsErrors(e);
            if (componentErr.length > 0) {
              componentErr.map((err) =>
                setFormData((prev) => ({
                  ...prev,
                  [err.type]: { ...prev[err.type], error: err.msg },
                }))
              );
            }
          }
        }
        break;

      case "Start":
        setSubmitText("Loading...");
        router.push({ pathname: ROUTES.EXAM, query: { id: studentData.id } });
        break;
      default:
        return;
    }
  };
  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };
  const handleChange = (type: string, value: string) => {
    setFormData((prev) => ({ ...prev, [type]: { error: "", value } }));
  };
  return (
    <div>
      {resMsg.msg.length > 0 && (
        <div ref={msgRef} tabIndex={-1} className="my-4">
          <Alert type={resMsg.type}>{resMsg.msg}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <Input
          name="jamb"
          value={formData.jamb.value}
          error={formData.jamb.error}
          showLabel
          labelValue="Matric/JAMB Reg. No:"
          placeholder="Enter Your Registration Number"
          minLength={10}
          maxLength={10}
          onChange={(e) => {
            handleChange(e.target.name, e.target.value);
          }}
          required
        />
        <Input
          name="phoneNumber"
          value={formData.phoneNumber.value}
          type="tel"
          showLabel
          labelValue="Phone Number"
          placeholder="Enter Your Phone Number"
          error={formData.phoneNumber.error}
          minLength={11}
          maxLength={11}
          onChange={(e) => {
            handleChange(e.target.name, e.target.value);
          }}
          required
        />
        <Select
          required
          name="course"
          options={coursesData}
          showLabel
          labelValue="Course"
          onChange={(val) => handleChange("course", val)}
          default={{ text: "Select a Course", value: "" }}
        />
        <Input type="submit" name="submit" value={submitText} isBtn />
      </form>
    </div>
  );
};

export default LoginForm;
