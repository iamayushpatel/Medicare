import { useState } from "react";
import convertTime from "../../utils/convertTime";
import { toast } from "react-toastify";
import { BASE_URL, token } from "./../../config.js";

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const bookingHandler = async () => {
    try {
      if (!selectedTimeSlot) {
        throw new Error("Please select a time slot before booking");
      }

      const res = await fetch(
        `${BASE_URL}/bookings/checkout-session/${doctorId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ timeSlot: selectedTimeSlot }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message + " Please try again");
      }

      if (data.session.url) {
        window.location.href = data.session.url;
      }
    } catch (error) {
      toast.error(error.message);
      console.log("error", error.message);
    }
  };

  const handleTimeSlot = (slot) => {
    setSelectedTimeSlot(slot);
  };

  return (
    <div className="shadow p-3 lg:p-5 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Ticket Price</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice} &#8377;
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slots:
        </p>

        <ul className="mt-3">
          {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
            timeSlots.map((item, index) => {
              const isSelected =
                selectedTimeSlot &&
                selectedTimeSlot.day === item.day &&
                selectedTimeSlot.startingTime === item.startingTime;

              return (
                <li
                  key={index}
                  onClick={() => handleTimeSlot(item)}
                  className={`flex items-center justify-between mb-2 p-2 rounded cursor-pointer border transition ${
                    isSelected
                      ? "bg-primaryColor text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="text-[15px] font-semibold">
                    {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
                  </p>
                  <p className="text-[15px] font-semibold">
                    {convertTime(item.startingTime)} -{" "}
                    {convertTime(item.endingTime)}
                  </p>
                </li>
              );
            })
          ) : (
            <p className="text-[15px] text-textColor italic">
              No time slots available.
            </p>
          )}
        </ul>
      </div>

      <button
        onClick={bookingHandler}
        className="btn px-2 w-full rounded-md mt-4"
        disabled={!selectedTimeSlot}
      >
        Book Appointment
      </button>
    </div>
  );
};

export default SidePanel;
