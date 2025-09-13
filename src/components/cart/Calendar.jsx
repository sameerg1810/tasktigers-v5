import React, { useContext, useEffect, useState } from "react";
import "./calendar.css";
import Cookies from "js-cookie";
import LZString from "lz-string";
import { CartContext } from "../../context/CartContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import Badge from "@mui/material/Badge";
import dayjs from "dayjs";

const Calendar = ({ onDateTimeSelect }) => {
  const { providerAvailability,setselectedTime ,selectedTime} = useContext(CartContext);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);


  const today = dayjs();
  const todayDate = today.format("YYYY-MM-DD");

  useEffect(() => {
    setSelectedDate(today);
  }, [todayDate]);

  useEffect(() => {
    if (providerAvailability) {
      saveAvailabilityToCookies(providerAvailability);
      processProviderAvailability(providerAvailability);
    } else {
      const storedAvailability = loadAvailabilityFromCookies();
      if (storedAvailability) {
        processProviderAvailability(storedAvailability);
      }
    }
  }, [providerAvailability]);

  const saveAvailabilityToCookies = (availability) => {
    try {
      const compressed = LZString.compressToUTF16(JSON.stringify(availability));
      Cookies.set("providerAvailability", encodeURIComponent(compressed), {
        expires: 1,
      });
    } catch (error) {
      console.error("Error compressing provider availability:", error);
    }
  };

  const loadAvailabilityFromCookies = () => {
    try {
      const stored = Cookies.get("providerAvailability");
      if (stored) {
        const decompressed = LZString.decompressFromUTF16(
          decodeURIComponent(stored),
        );
        return JSON.parse(decompressed);
      }
    } catch (error) {
      console.error("Error decompressing provider availability:", error);
    }
    return null;
  };
  const processProviderAvailability = (availabilityData) => {
    if (!availabilityData) return;

    const groupedAvailability = {};

    // Process for the next 30 days (or any desired range)
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const currentDate = dayjs().add(dayOffset, "day");
      const dayOfWeek = currentDate.day(); // Day index (0-6)
      const formattedDate = currentDate.format("YYYY-MM-DD");

      availabilityData.forEach((provider) => {
        const { workingDays, serviceTime } = provider;

        // Find if the current day of the week is a working day
        const workingDay = workingDays.find((day) => day.day === dayOfWeek);
        if (!workingDay || !workingDay.isWorking) return; // Skip non-working days

        // Initialize availability for the current date if not already set
        if (!groupedAvailability[formattedDate]) {
          groupedAvailability[formattedDate] = {
            totalAvailability: 0,
            times: {},
          };
        }

        // Add hourly slots for the working day
        const startHour = parseInt(workingDay.startTime.split(":")[0], 10);
        const endHour = parseInt(workingDay.endTime.split(":")[0], 10);

        for (let hour = startHour; hour < endHour; hour++) {
          const timeLabel = convertToAmPm(
            `${hour.toString().padStart(2, "0")}:00`,
          );

          if (!groupedAvailability[formattedDate].times[timeLabel]) {
            groupedAvailability[formattedDate].times[timeLabel] = {
              count: 0,
              providerIds: [],
              busyProviders: [],
            };
          }

          groupedAvailability[formattedDate].times[timeLabel].count++;
          groupedAvailability[formattedDate].times[timeLabel].providerIds.push(
            provider.providerId,
          );
        }

        // Process serviceTime for the current date
        serviceTime
          .filter((slot) => slot.date === formattedDate)
          .forEach((slot) => {
            const startHour = parseInt(slot.startTime.split(":")[0], 10);
            const endHour = parseInt(slot.endTime.split(":")[0], 10);

            for (let hour = startHour; hour < endHour; hour++) {
              const timeLabel = convertToAmPm(
                `${hour.toString().padStart(2, "0")}:00`,
              );

              // Mark this slot as busy for the current provider
              if (groupedAvailability[formattedDate].times[timeLabel]) {
                groupedAvailability[formattedDate].times[
                  timeLabel
                ].busyProviders.push(provider.providerId);

                // If all providers are busy, mark the slot as unavailable
                const busyCount =
                  groupedAvailability[formattedDate].times[timeLabel]
                    .busyProviders.length;
                if (
                  busyCount >=
                  groupedAvailability[formattedDate].times[timeLabel].count
                ) {
                  groupedAvailability[formattedDate].times[
                    timeLabel
                  ].isUnavailable = true;
                }
              }
            }
          });
      });
    }

    setAvailabilityByDate(groupedAvailability);
  };

  const validateExceptionForSelectedProvider = (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    // Check if any provider does not have an exception for the date
    const isDateAvailable = providerAvailability.some((provider) => {
      const formattedExceptions = provider.exceptions.map((exc) =>
        dayjs(exc).format("YYYY-MM-DD"),
      );
      return !formattedExceptions.includes(formattedDate);
    });

    return isDateAvailable; // True if at least one provider is available
  };

  const convertToAmPm = (time24) => {
    const [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const getAvailabilityClass = (date, time) => {
    const isDateAvailable = validateExceptionForSelectedProvider(date);

    if (!isDateAvailable) return "unavailable";

    const count = availabilityByDate[date]?.times[time]?.count || 0;
    if (count > 5) return "most-available";
    if (count > 2) return "good-available";
    if (count > 0) return "less-available";
    return "unavailable";
  };

  const handleDateChange = (newDate) => {
    const formattedDate = dayjs(newDate).format("YYYY-MM-DD");
    if (validateExceptionForSelectedProvider(formattedDate)) {
      setSelectedDate(dayjs(newDate));
    } else {
      console.warn("Selected date is unavailable due to exceptions.");
    }
  };

  const handleTimeSelect = (time) => {
    console.log("Setting selected time:", time); // Debugging log
    setselectedTime(time); // Ensure this is not crashing
  
    const date = selectedDate?.format("YYYY-MM-DD");
    const providerIds = availabilityByDate[date]?.times[time]?.providerIds || [];
  
    if (onDateTimeSelect) {
      onDateTimeSelect({
        selectedDate: date,
        selectedTime: time,
        providerIds,
      });
    }
  };
  

  const renderDay = (day, _value, DayComponentProps) => {
    const date = day.format("YYYY-MM-DD");
    const availability = availabilityByDate[date]?.totalAvailability || 0;

    // Check if the date is available based on the updated logic
    const isDateAvailable = validateExceptionForSelectedProvider(date);

    // Determine the label and color based on availability
    let label = "Unavailable"; // Default label
    let color = "#e0e0e0"; // Default grey for unavailable dates

    if (isDateAvailable) {
      if (availability > 5) {
        label = "Most Available";
        color = "#4caf50"; // Green
      } else if (availability > 2) {
        label = "Good Availability";
        color = "#ff9800"; // Orange
      } else if (availability > 0) {
        label = "Less Available";
        color = "#f44336"; // Red
      }
    }

    console.log(
      `Rendering Day: ${date}, Label: ${label}, Availability: ${availability}, Is Available: ${isDateAvailable}`,
    );

    // Render the day with a badge and customized styles
    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent=""
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: isDateAvailable ? color : "#e0e0e0",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
          },
        }}
      >
        <PickersDay
          {...DayComponentProps}
          sx={{
            backgroundColor: isDateAvailable ? color : "#e0e0e0",
            color: isDateAvailable && availability > 0 ? "#ffffff" : "#000000",
            "&:hover": {
              backgroundColor: isDateAvailable ? "#0288d1" : "#e0e0e0",
            },
          }}
        />
      </Badge>
    );
  };

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
  ];

  const getFilteredTimeSlots = (date) => {
    const currentTime = dayjs();

    return timeSlots
      .map((slot) => {
        const [time, period] = slot.split(" ");
        const [hour, minute] = time.split(":");
        const slotDate = dayjs(date)
          .hour(
            period === "PM" && hour !== "12"
              ? parseInt(hour, 10) + 12
              : parseInt(hour, 10),
          )
          .minute(parseInt(minute, 10));

        const isPast =
          dayjs(date).isSame(todayDate) && slotDate.isBefore(currentTime);

        return { time: slot, isPast };
      })
      .filter((slot) => !slot.isPast);
  };

  return (
    <div className="calender-container">
      <div className="calender-box">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={(date) => handleDateChange(date)}
            disablePast
            renderDay={(day, value, DayComponentProps) =>
              renderDay(day, value, DayComponentProps)
            }
          />
        </LocalizationProvider>
      </div>

      <div className="time-selector">
        {selectedDate ? (
          getFilteredTimeSlots(selectedDate?.format("YYYY-MM-DD")).length >
          0 ? (
            getFilteredTimeSlots(selectedDate?.format("YYYY-MM-DD")).map(
              ({ time }) => {
                const availabilityClass = getAvailabilityClass(
                  selectedDate?.format("YYYY-MM-DD"),
                  time,
                );
                const isUnavailable = availabilityClass === "unavailable";
                const isSelected = selectedTime === time;

                return (
                  <div
                    key={time}
                    className={`time-slot ${availabilityClass} ${
                      isSelected ? "selected" : ""
                    }`}
                    style={{
                      pointerEvents: isUnavailable ? "none" : "auto",
                    }}
                    onClick={() => !isUnavailable && handleTimeSelect(time)}
                  >
                    {time}
                    {isSelected && <span className="tick-mark">&#10003;</span>}
                  </div>
                );
              },
            )
          ) : (
            <p className="no-available-slots">
              No available time slots for the selected date.
            </p>
          )
        ) : (
          <p className="prompt-select-date">
            Please select a date to see available time slots.
          </p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
