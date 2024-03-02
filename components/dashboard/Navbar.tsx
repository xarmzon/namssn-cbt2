import { APP_NAME } from "../../utils/constants";

const Navbar = () => {
  return (
    <div className="text-white cursor-pointer px-2 h-10 flex items-center justify-center text-xs md:text-sm font-bold">
      {APP_NAME}
    </div>
  );
};

export default Navbar;
