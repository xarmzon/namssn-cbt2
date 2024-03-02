import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Footer from "../components/general/Footer";
import LinkButton, { ETypes } from "../components/general/LinkButton";
import LoginForm from "../components/home/LoginForm";
import Course from "../models/CourseModel";
import { APP_NAME, ROUTES } from "../utils/constants";
import { connectDB } from "../utils/database";
import { SelectOptionProps } from "../components/controls/Select";
import { useState } from "react";
import Logo from "../components/general/Logo";
import Creators from "../components/general/Creators";

export interface ICourse extends SelectOptionProps {}

const Home = ({ courses }) => {
  const [coursesData, setCoursesData] = useState<ICourse[]>(() => {
    return JSON.parse(courses).length > 0
      ? JSON.parse(courses).map((c) => {
          return { value: c._id, text: c.title };
        })
      : [];
  });
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-no-repeat bg-cover bg-senateBuilding bg-primary bg-blend-multiply backdrop-filter backdrop-blur-sm">
      <NextSeo title="Home" />
      <div className="z-20 flex justify-center w-full mt-5 -mb-8 shadow-md max-w-max">
        <Logo size="large" />
      </div>
      <div className="text-primary space-y-4 w-full max-w-lg min-h-[300px] bg-gray-50 bg-opacity-95 backdrop-filter backdrop-blur-sm p-5 rounded-md pt-8">
        <h1 className="pt-3 text-center text-ascent md:text-lg">
          WELCOME TO <br />
          <span className="inline-block pt-2 text-2xl font-black text-primary md:text-4xl">
            {APP_NAME.toUpperCase()} TEST
            <br />
          </span>
        </h1>
        {/* <Creators /> */}
        <p className="!mt-12 text-sm text-center text-secondary">
          In order to have access to the questions, please provide the details
          below.
          <LinkButton
            href={ROUTES.RESULTS_CHECKER}
            txt=" OR check your results here"
            type={ETypes.TEXT}
          />
        </p>
        <LoginForm courses={coursesData} />
        <div className="w-full mt-4 text-center">
          <LinkButton
            href={ROUTES.REGISTRATION}
            txt="Students Registration"
            type={ETypes.TEXT}
            color=""
          />
          |
          <LinkButton
            href={ROUTES.DASHBOARD}
            txt="Administrator"
            type={ETypes.TEXT}
            color=""
          />{" "}
        </div>
      </div>
      <div className="max-w-md mx-auto mt-6 text-center text-gray-200">
        <Footer />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let courses = [];
  try {
    await connectDB();
    courses = await Course.find({});
  } catch (e) {
    console.log(e);
  }
  return {
    props: {
      courses: JSON.stringify(courses),
    },
  };
};

export default Home;
