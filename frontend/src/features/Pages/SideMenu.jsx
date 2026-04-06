import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu } from "antd";
import { GoHome } from "react-icons/go";
import { LuBookOpen } from "react-icons/lu";
import { FiUser, FiCheckSquare } from "react-icons/fi";
import { MdOutlineAssignment } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiBriefcase } from "react-icons/fi";
import { FiBookmark } from "react-icons/fi";
import { PiSealQuestionBold } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { storeCompanyQuestionSearchValue } from "../Redux/Slice";
import { LuUsers } from "react-icons/lu";
import { isAdmin } from "../Common/Validation";

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation("");
  const dispatch = useDispatch();

  const [selectedKey, setSelectedKey] = useState("");
  const [sideMenuOptions, setSideMenuOptions] = useState({
    1: {
      title: "Dashboard",
      icon: <GoHome size={19} />,
      path: "dashboard",
    },
    2: {
      title: "Courses",
      icon: <LuBookOpen size={19} />,
      path: "courses",
    },
    3: {
      title: "Questions",
      icon: <PiSealQuestionBold size={19} />,
      path: "questions",
    },
    4: {
      title: "Tests",
      icon: <FiCheckSquare size={19} />,
      path: "tests",
    },
    5: {
      title: "Assignments",
      icon: <MdOutlineAssignment size={19} />,
      path: "assignments",
    },
    6: {
      title: "Company Questions",
      icon: <IoMdCheckmarkCircleOutline size={19} />,
      path: "company-questions",
    },
    7: {
      title: "Jobs",
      icon: <FiBriefcase size={19} />,
      path: "jobs",
    },
    8: {
      title: "Bookmarks",
      icon: <FiBookmark size={19} />,
      path: "bookmarks",
    },
    9: {
      title: "Profile",
      icon: <FiUser size={19} />,
      path: "profile",
    },
    10: {
      title: "Users",
      icon: <LuUsers size={19} />,
      path: "students",
    },
  });

  useEffect(() => {
    const pathName = location.pathname.split("/")[1];
    setSelectedKey(pathName);
    if (pathName.includes("testresult")) {
      setSelectedKey("tests");
    }
  }, [location.pathname]);

  const renderMenuItems = (menuConfig) => {
    return Object.entries(menuConfig).map(([key, item]) => ({
      key: item.path,
      icon: item.icon,
      label: (
        <Link
          to={`/${item.path}`}
          className="side-menu-link"
          style={{ color: "inherit" }}
        >
          {item.title}
        </Link>
      ),
    }));
  };

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
    dispatch(storeCompanyQuestionSearchValue(""));
  };

  const filteredMenuOptions = React.useMemo(() => {
    return Object.entries(sideMenuOptions).reduce((acc, [key, item]) => {
      // Hide "Questions" and "Users" (Students) if not an admin
      if (
        (item.path === "questions" || item.path === "students") &&
        !isAdmin()
      ) {
        return acc;
      }
      acc[key] = item;
      return acc;
    }, {});
  }, [sideMenuOptions]);

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={renderMenuItems(filteredMenuOptions)}
      onClick={handleMenuClick}
      style={{
        marginTop: "6px",
        backgroundColor: "rgb(91 105 202 / 0%)",
        borderRight: "none",
      }} // 👈 Add this
      forceSubMenuRender={true}
    />
  );
}
