import React, { useState } from "react";
import {
  Menu,
  X,
  UserPlus,
  UserRoundSearch,
  School,
  FileUp,
  Building2,
  LayoutDashboard,
  Users,
  LogOut,
  IdCard
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/main_logo.png";

const MenuItem = ({
  icon,
  text,
  href = "#",
  active = false,
  delay = 0,
  onClick,
}) => (
  <Link
    to={href}
    onClick={onClick}
    className={`group flex items-center gap-3 px-6 py-3 text-sm transition-all duration-300 ${active ? "bg-blue-900 font-semibold" : "hover:bg-blue-800"
      }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="transition-transform duration-300 group-hover:scale-110">
      {icon}
    </span>
    <span className="text-md">{text}</span>
  </Link>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => window.innerWidth < 768 && setIsOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#003B87] text-white hover:bg-[#002d69] transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 bg-[#003B87] text-white flex flex-col shadow-xl h-full z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center pt-4">
          <img
            src={logo}
            alt="IQ Nexus Logo"
            className="lg:w-48 w-32 object-contain rounded-full"
          />
        </div>

        {/* Navigation */}
        <nav className="mt-2 space-y-1">
          <MenuItem
            icon={<LayoutDashboard size={20} />}
            text="Dashboard"
            href="/"
            active={location.pathname === "/"}
            onClick={closeSidebar}
          />
          <MenuItem
            icon={<Building2 size={20} />}
            text="All Schools"
            href="/allSchools"
            active={location.pathname === "/allSchools"}
            onClick={closeSidebar}
          />
          <MenuItem
            icon={<Users size={20} />}
            text="All Students"
            href="/allStudents"
            active={location.pathname === "/allStudents"}
            onClick={closeSidebar}
          />
          {/*            <MenuItem
            icon={<School size={20} />}
            text="Upload Schools"
            href="/uploadSchoolData"
            active={location.pathname === "/singleSchool"}
            onClick={closeSidebar}
          /> */}
          <MenuItem
            icon={<FileUp size={20} />}
            text="Upload Students"
            href="/uploadStudentData"
            active={location.pathname === "/uploadStudentData"}
            onClick={closeSidebar}
          />
          <MenuItem
            icon={<UserPlus size={20} />}
            text="Add Student"
            href="/singleStudent"
            active={location.pathname === "/singleStudent"}
            onClick={closeSidebar}
          />
          <MenuItem
            icon={<School size={20} />}
            text="Add School"
            href="/singleSchool"
            active={location.pathname === "/singleSchool"}
            onClick={closeSidebar}
          />
          <MenuItem
            icon={<IdCard size={20} />}
            text="Admit Card"
            href="/genrate-admit-card"
            active={location.pathname === "/genrate-admit-card"}
            onClick={closeSidebar}
          />
          {/* <MenuItem
            icon={<UserRoundSearch size={20} />}
            text="Update Student"
            href="/updateStudent"
            active={location.pathname === "/updateStudent"}
            onClick={closeSidebar}
          /> */}
        </nav>

        {/* Optional Footer */}
        {/* <div className="absolute bottom-0 left-0 w-full border-t border-blue-800 bg-[#002d69]">
          <MenuItem
            icon={<LogOut size={20} />}
            text="Log Out"
            href="/"
            active={false}
            onClick={closeSidebar}
          />
        </div> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto md:ml-0">
        <div className="md:ml-0 mt-16 md:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
