import React, { useContext } from "react";
import Calendar from "./Calendar"; // Import the Calendar component
import ScheduleFooter from "./ScheduleFooter";
import { OrdersContext } from "../../context/OrdersContext"; // Import OrdersContext
import "./Schedule.css";


const Schedule = ({ onNext }) => {
  const { updateAllItemSchedules, selectedTime } = useContext(OrdersContext); // Access function from OrdersContext

  // Update the schedule for all items with the selected date and time
  const handleDateTimeSelect = (dateTime) => {
    console.log("the handleDateTimeSelect was clicked");
    console.log("Updating all item schedules with:", dateTime); // Debugging log to verify data
    updateAllItemSchedules(dateTime); // Update all items with selected date and time
  };

  return (
    <div className="schedule-main-con">
      <div className="schedule-container">
      <p className="choose-text">Chose the date from the calender</p>
      {/* Render the Calendar component */}
      <Calendar onDateTimeSelect={handleDateTimeSelect} />
      </div>
    <div>
       <ScheduleFooter onNext={onNext} />
    </div>
    </div>
   
  );
};

export default Schedule;
