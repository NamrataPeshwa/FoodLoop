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
} from "@tabler/icons-react";
import {Link} from "react-router-dom";
import { motion } from "motion/react";
import {Img} from "react-image";
import { cn } from "../../lib/utils";
export function FoodDistributionSidebar() {
  const links = [
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
  
  const [open, setOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/api/placeholder/50/50");
  const [userName, setUserName] = useState("Guest User");
  
  // Fetch user data from localStorage on component mount
  useEffect(() => {
    // Get user data from localStorage if available
    try {
      const user = localStorage.getItem('user');
      
      if (user) {
        const userData = JSON.parse(user);
        if (userData.avatar) {
          setUserAvatar(userData.avatar);
        }
        if (userData.name) {
          setUserName(userData.name);
        }
      }
    } catch (error) {
      console.error("Error getting user data from localStorage:", error);
    }
  }, []);

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
              label: userName,
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