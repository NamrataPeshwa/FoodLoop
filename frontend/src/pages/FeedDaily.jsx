import React from "react";
import RecurringForm from "../components/ui/RecurringForm";
import ExistingReminders from "../components/ui/ExistingReminders";
import { FoodDistributionSidebar } from "../Components/MainPage/Sidebar";
import Header from "../components/Header";

const FeedDaily = () => {
  return (
    <>
      <div className="bg-white w-full h-screen flex  items-center">
        <FoodDistributionSidebar />
        <div className=" flex flex-col m-0 w-full h-full">
          <Header />
          <div className="flex-1 flex  items-center justify-center p-4">
            <RecurringForm />
            <ExistingReminders />
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedDaily;
