"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconHome,
  IconHeartHandshake,
  IconTruckDelivery,
  IconMapPin,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconShieldCheck,
} from "@tabler/icons-react";
import {Link} from "react-router-dom";
import { motion } from "motion/react";
import {Img} from "react-image";
import { cn } from "../../lib/utils";
import DonationForm from "./NewDonation";
export function FoodDistributionSidebar() {
  const [open, setOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/api/placeholder/50/50");
  const [userRole, setUserRole] = useState("guest");
  
  // Common links for all users
  const commonLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Donate Food",
      href: "/donate",
      icon: (
        <IconHeartHandshake className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Distribution Routes",
      href: "/routes",
      icon: (
        <IconTruckDelivery className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Food Map",
      href: "/map",
      icon: (
        <IconMapPin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Impact Reports",
      href: "/impact",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/logout",
      icon: (
        <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200 group-hover:text-red-500" />
      ),
      className: "group",
      labelClassName: "group-hover:text-red-500"
    }
  ];
  
  // Admin link
  const adminLink = {
    label: "Admin Dashboard",
    href: "/admin",
    icon: (
      <IconShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
    ),
    className: "bg-emerald-50 dark:bg-emerald-900/20",
    labelClassName: "font-medium text-emerald-600 dark:text-emerald-400"
  };
  
  // Fetch user data from sessionStorage on component mount
  useEffect(() => {
    try {
      const userRoleFromStorage = sessionStorage.getItem('userRole');
      
      if (userRoleFromStorage) {
        setUserRole(userRoleFromStorage);
      }

      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.avatar) {
          setUserAvatar(userData.avatar);
        }
      }
    } catch (error) {
      console.error("Error getting user data from storage:", error);
    }
  }, []);

  // Construct links array based on user role
  const links = [...commonLinks];
  
  // Insert admin link before settings if user is admin
  if (userRole === 'admin') {
    const settingsIndex = links.findIndex(link => link.label === "Settings");
    if (settingsIndex !== -1) {
      links.splice(settingsIndex, 0, adminLink);
    } else {
      links.push(adminLink);
    }
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <FoodShareLogo /> : <FoodShareIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                className={link.className || ""}
                labelClassName={link.labelClassName || ""} 
              />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: userRole.charAt(0).toUpperCase() + userRole.slice(1),
              href: "/profile",
              icon: (
                <Img
                  src={userAvatar}
                  className="h-7 w-7 shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Profile Avatar" />
              ),
            }} />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const FoodShareLogo = () => {
  return (
    <Link
      to="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600">
        <Img src= "/logo.png" className="h-5 w-5 text-white" width={50} height={50} alt="Logo" />     
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white">
        FoodLoop
      </motion.span>
    </Link>
  );
};

export const FoodShareIcon = () => {
  return (
    <Link
      to="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600">
        <Img src="/logo.png" className="h-5 w-5 text-white" width={100} height={100} alt="Logo" />
      </div>
    </Link>
  );
};