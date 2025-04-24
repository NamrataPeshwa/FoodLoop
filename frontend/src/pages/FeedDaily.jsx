import React from "react";
import RecurringForm from "../components/ui/RecurringForm";
import ExistingReminders from "../components/ui/ExistingReminders";

const FeedDaily = () => {
  return (
    <div className="bg-white w-full h-full flex  items-center p-5">
      <RecurringForm />
      <ExistingReminders />
    </div>
  );
};

export default FeedDaily;
