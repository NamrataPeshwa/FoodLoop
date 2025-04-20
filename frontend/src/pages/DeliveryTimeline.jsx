import React from "react";
import { CheckCircle, Clock, Circle } from "lucide-react";

const steps = [
  { label: "Order Placed", timestamp: "Apr 18, 10:30 AM" },
  { label: "Processing", timestamp: "Apr 18, 11:00 AM" },
  { label: "Order PickedUp", timestamp: "Apr 19, 08:45 AM" },
  { label: "Out for Delivery", timestamp: "" },
  { label: "Delivered", timestamp: "" },
];

const DeliveryTimeline = ({ currentStep }) => {
  return (
    <>
      <div className="max-w-md mx-3 my-10 bg-white shadow-md rounded-lg p-10 ">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Delivery Timeline
        </h2>
        <ol className="relative border-l-[0.3rem] border-gray-300">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <>
                <li key={index} className="mb-10 ml-4">
                  <span className="absolute -left-6 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-300">
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : isCurrent ? (
                      <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-400" />
                    )}
                  </span>
                  <h3
                    className={`font-medium leading-tight ${
                      isCompleted
                        ? "text-green-600"
                        : isCurrent
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h3>
                  {step.timestamp && (
                    <p className="text-sm text-gray-400">{step.timestamp}</p>
                  )}
                </li>
              </>
            );
          })}
        </ol>
        {currentStep == 5 && <button className="px-3 py-2 hover:bg-green-700 text-white bg-gray-500 rounded-md">Confirm Delivery</button>}
      </div>
    </>
  );
};

export default DeliveryTimeline;
