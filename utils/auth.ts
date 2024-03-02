import Cookies from "cookie";
import { MESSAGES, ENTITY_NUMBERS } from "./constants";
import validator from "validator";
import { IRegUser } from "../components/dashboard/AuthForm";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";

const key =
  process.env.JWT_SECRET_KEY ||
  "The!________$&*()_$#@#@#@#!@#%$%$^%^%^sdfasdfadfadfas_____";
export interface IDataError {
  type: string;
  msg: string;
}
export interface IStudentData {
  jamb: string;
  phoneNumber: string;
  course: string;
}

export const validateStudentData = (data: IStudentData): IDataError[] => {
  let errors: IDataError[] = [];
  if (!validJAMB(data.jamb))
    errors.push({ type: "jamb", msg: MESSAGES.FORM.JAMB_NUM });

  if (!validPhoneNumber(data.phoneNumber))
    errors.push({ type: "phoneNumber", msg: MESSAGES.FORM.PHONE_NUMBER });

  if (data.course.length <= 0)
    errors.push({ type: "course", msg: MESSAGES.FORM.COURSE });

  return errors;
};

export const validateRegForm = (formData: IRegUser): IDataError[] => {
  const errors: IDataError[] = [];
  if (!validUsername(formData.username))
    errors.push({ type: "username", msg: MESSAGES.FORM.USERNAME });
  if (!validEmail(formData.email))
    errors.push({ type: "email", msg: MESSAGES.FORM.EMAIL });
  if (!validPassword(formData.password))
    errors.push({ type: "password", msg: MESSAGES.FORM.PASSWORD });
  return errors;
};

export const validJAMB = (jambN: string): boolean => {
  return /^\d{8}[a-zA-Z]{2}$/.test(jambN);
};

export const validPhoneNumber = (phone: string): boolean => {
  return /^\d{11}$/.test(phone);
  //return /^(080|070|081|031|090|091|071)\d{8}$/.test(phone);
};
export const validFullName = (fullname: string): boolean => {
  return /^[a-zA-Z][a-zA-Z\s]{6,50}$/.test(fullname);
};

export const validUsername = (username: string): boolean => {
  const maxLen = ENTITY_NUMBERS.USERNAME_MAX;
  const minLen = ENTITY_NUMBERS.USERNAME_MIN;
  const reg = new RegExp(`^\\w{${minLen},${maxLen}}$`);
  return reg.test(username);
};

export const validPassword = (password: string): boolean => {
  const minLength = ENTITY_NUMBERS.PASSWORD_MIN;
  return validator.isStrongPassword(password, { minLength, minSymbols: 1 });
};

export const validEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const isValidUser = (cookie: any) => {
  const token = Cookies.parse(cookie || "");
  return !!token;
};

export const generateToken = (data: any) => {
  return jwt.sign(data, key, { expiresIn: "7d", subject: "User Access Token" });
};

export const verifyToken = (token: any) => {
  return jwt.verify(token, key);
};

export const validateUserPassword = async (
  password: string,
  hashPassword: string
) => await compare(password, hashPassword);

export const hashPassword = async (password: string) =>
  await hash(password, 12);

export const prepareUser = (user: any) => {
  return {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    userType: user.userType,
    dpUrl: user.dp_url,
  };
};

export const prepareAdmin = (admin: any) => ({
  username: admin.username,
  email: admin.email,
  userType: admin.userType,
});
