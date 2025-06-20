import React, { useState } from "react";
import {
  Menu,
  X,
  UserPlus,
  School,
  FileUp,
  Building2,
  LayoutDashboard,
  Users,
  IdCard,
  ChevronDown,
  ChevronUp,
  ClipboardList
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
  children,
  isDropdown = false,
  isOpen = false
}) => (
  <div className={`group ${active ? "bg-blue-900" : "hover:bg-blue-800"}`}>
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center justify-between px-6 py-3 text-sm transition-all duration-300 ${active ? "font-semibold" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <span className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <span className="text-md">{text}</span>
      </div>
      {isDropdown && (
        <span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      )}
    </Link>
    {children}
  </div>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [participationOpen, setParticipationOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => window.innerWidth < 768 && setIsOpen(false);
  const toggleParticipation = () => setParticipationOpen(!participationOpen);

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

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.4) rgba(0,0,0,0.1)'
        }}>

          <nav className="space-y-1">
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

            {/* Participation List Dropdown */}
            <MenuItem
              icon={<ClipboardList size={20} />}
              text="Participation List"
              href="#"
              active={location.pathname.startsWith("/participation")}
              onClick={(e) => {
                e.preventDefault();
                toggleParticipation();
              }}
              isDropdown={true}
              isOpen={participationOpen}
            >
              {participationOpen && (
                <div className="bg-[#003B87] pl-6"> {/* Match sidebar background color */}
                  <MenuItem
                    text="School-wise Participation"
                    href="/participation/olympiad1"
                    active={location.pathname === "/participation/olympiad1"}
                    onClick={closeSidebar}
                  />
                  <MenuItem
                    text="Section-wise Participation"
                    href="/participation/olympiad2"
                    active={location.pathname === "/participation/olympiad2"}
                    onClick={closeSidebar}
                  />
                  <MenuItem
                    text="Class-wise Participation"
                    href="/participation/olympiad3"
                    active={location.pathname === "/participation/olympiad3"}
                    onClick={closeSidebar}
                  />
                  <MenuItem
                    text="Amount-wise Participation"
                    href="/participation/olympiad4"
                    active={location.pathname === "/participation/olympiad4"}
                    onClick={closeSidebar}
                  />
                </div>
              )}
            </MenuItem>

            <MenuItem
              icon={<FileUp size={20} />}
              text="Study Material"
              href="/StudyMaterial"
              active={location.pathname === "/StudyMaterial"}
              onClick={closeSidebar}
            />

            {/* KG Students Section */}
            <MenuItem
              icon={<Users size={20} />}
              text="All KG Students"
              href="/allkindargartenStudents"
              active={location.pathname === "/allkindargartenStudents"}
              onClick={closeSidebar}
            />
            <MenuItem
              icon={<UserPlus size={20} />}
              text="Add KG Student"
              href="/kindargartenStudent"
              active={location.pathname === "/kindargartenStudent"}
              onClick={closeSidebar}
            />
            <MenuItem
              icon={<FileUp size={20} />}
              text="Upload KG Students"
              href="/uploadKindergartenStudentData"
              active={location.pathname === "/uploadKindergartenStudentData"}
              onClick={closeSidebar}
            />
          </nav>
        </div>

        {/* Optional Fixed Footer */}
        {/* <div className="border-t border-blue-800 bg-[#002d69]">
          <MenuItem
            icon={<LogOut size={20} />}
            text="Log Out"
            href="/logout"
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