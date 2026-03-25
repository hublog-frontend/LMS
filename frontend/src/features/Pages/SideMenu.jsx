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

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation("");

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
  });

  useEffect(() => {
    const pathName = location.pathname.split("/")[1];
    setSelectedKey(pathName);
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
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={renderMenuItems(sideMenuOptions)}
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
