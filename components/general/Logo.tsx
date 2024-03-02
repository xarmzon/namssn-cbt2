import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "../../utils/constants";

export type SizeType = "small" | "large" | "text";
export interface LogoProps {
  size?: SizeType;
  children?: React.ReactNode;
}
const Logo = ({ size = "small" }: LogoProps) => {
  return (
    <Link href="/">
      <a className="relative">
        <div
          className={`relative ${
            size === "small"
              ? "h-16 w-16"
              : size === "large"
              ? "h-28 w-28 font-bold text-5xl text-white"
              : "font-bold text-2xl text-white"
          }`}
        >
          <Image
            src={"/assets/images/logo.png"}
            layout="fill"
            alt={APP_NAME}
            className="object-contain"
          />
        </div>
      </a>
    </Link>
  );
};

export default Logo;
