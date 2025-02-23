"use client";

import React, { useEffect, useState } from "react";
import DateRangePicker from "../shared/DateRangePicker";
import { Booking, Ad } from "@/types/interface";
import { useLoader } from "../shared/LoaderComponent";
import { useToast } from "@/app/context/ToastContext";
import AddIcon from "@/icons/addIcon";

type BookInventoryModalProps = {
  onClose: () => void;
  creativeId: string;
  existingBookings?: Booking[];
  fetchCreatives: () => void;
};

const BookInventoryModal: React.FC<BookInventoryModalProps> = ({
  onClose,
  creativeId,
  existingBookings = [],
  fetchCreatives,
}) => {
  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const [ads, setAds] = useState<Ad[]>([]);
  const [inventoryOptions, setInventoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [deleteIndex, setDeleteIndex] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // If existingBookings length > 0 => we are in edit mode
  const isEditMode = existingBookings.length > 0;

  const nowIso = new Date().toISOString();

  const [bookingSets, setBookingSets] = useState<
    {
      id: string;
      adBoardId: string;
      adId: string;
      startDate: string;
      endDate: string;
    }[]
  >(
    isEditMode
      ? existingBookings.map((booking) => ({
          id: booking.id,
          adBoardId: booking.adBoardId,
          adId: booking.adId,
          startDate: booking.startDate,
          endDate: booking.endDate,
        }))
      : [
          {
            id: crypto.randomUUID(),
            adBoardId: "",
            adId: creativeId,
            startDate: nowIso,
            endDate: nowIso,
          },
        ]
  );

  useEffect(() => {
    const fetchAds = async () => {
      try {
        showLoader();
        const response = await fetch("/api/creative");
        const data = await response.json();
        setAds(data);
      } catch (error) {
        addToast("Error fetching creatives!", "error");
        console.error("Error fetching creatives:", error);
      } finally {
        hideLoader();
      }
    };

    const fetchAdBoards = async () => {
      try {
        showLoader();
        const response = await fetch("/api/adBoard");
        const data = await response.json();
        const options = data.map(
          (board: { id: string; boardName: string }) => ({
            value: board.id,
            label: board.boardName,
          })
        );
        setInventoryOptions(options);
      } catch (error) {
        addToast("Error fetching ad boards!", "error");
        console.error("Error fetching ad boards:", error);
      } finally {
        hideLoader();
      }
    };

    fetchAds();
    fetchAdBoards();
  }, []);

  // Function to add a new booking set in create mode
  const addNewSet = () => {
    setBookingSets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        adBoardId: "",
        adId: creativeId,
        startDate: nowIso,
        endDate: nowIso,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];
    let hasErrors = false;
    bookingSets.forEach((set) => {
      if (set.adBoardId === "" || set.startDate === "" || set.endDate === "") {
        newErrors.push(set.id);
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    if (hasErrors) {
      addToast("Please fill all fields", "error");
      return;
    }

    try {
      showLoader();
      // If edit mode => PUT, else => POST
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch("/api/booking", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingSets),
      });

      if (!response.ok) {
        const errorData = await response.json();
        addToast(
          isEditMode
            ? "Failed to update bookings!"
            : "Failed to create bookings!",
          "error"
        );
        console.error("Error (create/update) bookings:", errorData);
        throw new Error(
          `Failed to (create/update) bookings: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      await response.json();
      addToast(
        isEditMode
          ? "Bookings updated successfully!"
          : "Bookings created successfully!",
        "success"
      );
    } catch (error) {
      addToast(
        isEditMode ? "Error updating bookings!" : "Error creating bookings!",
        "error"
      );
      console.error("Error (create/update) bookings:", error);
    } finally {
      fetchCreatives();
      hideLoader();
      onClose();
    }
  };

  const openDeleteConfirmModal = (index: string) => {
    setDeleteIndex(index);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = async (confirmed: boolean) => {
    if (confirmed && deleteIndex !== null) {
      setBookingSets((prev) => prev.filter((set) => set.id !== deleteIndex));
    }
    setIsDeleteConfirmationOpen(false);
    setDeleteIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white dark:bg-gray-800 text-black dark:text-gray-200 rounded-lg shadow-lg flex flex-col"
        style={{
          width: "50%",
          height: "90%",
          overflow: "hidden",
        }}
      >
        <div className="px-6 py-4 bg-[#001464] dark:bg-gray-800 dark:text-gray-200 flex justify-between items-center border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Booking" : "Book Inventory"}
          </h2>
        </div>
        <div className="flex items-center justify-between mb-1 p-1 px-5">
          {(() => {
            const creative = ads.find((creative) => creative.id === creativeId);
            return (
              <h1 className="text-lg font-bold text-gray-500 dark:text-gray-300">
                {creative ? `${creative.title}` : ""}
              </h1>
            );
          })()}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={addNewSet}
              className="w-6 h-6 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition"
            >
              <AddIcon />
            </button>
            <span className="text-blue-500 text-lg font-semibold">
              Add Inventory
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 scrollable-content">
          <form onSubmit={handleSubmit} id="bookingForm">
            {/* Booking Sets */}
            <div className="space-y-4">
              {bookingSets.length === 0 ? (
                <div className="font-bold p-4 rounded-md border dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                  Add now, to start the journey!
                </div>
              ) : (
                bookingSets.map((set) => (
                  <div
                    key={set.id}
                    className={`group p-4 rounded-md border relative transition-colors bg-gray-100 dark:bg-gray-800 
                      hover:bg-gray-200 dark:hover:bg-gray-500 dark:hover:border-gray-500 
                      ${
                        errors.findIndex((e) => e === set.id) > -1
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => openDeleteConfirmModal(set.id)}
                      className="p-2 rounded-full flex items-center justify-center absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" // Hide by default, show on group hover
                      style={{
                        width: "15px",
                        height: "15px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Grey circle background with transparency
                        border: "none", // Remove the border
                        color: "white", // Faded white color for the cross
                        display: "flex", // Ensure flexbox is applied
                        alignItems: "center", // Vertically center the cross
                        justifyContent: "center", // Horizontally center the cross
                        fontSize: "15px", // Adjust font size to fit the circle
                        lineHeight: "1", // Remove extra line height
                      }}
                    >
                      ×{" "}
                      {/* Use the multiplication symbol for a better-looking cross */}
                    </button>

                    {/* Flex container for Inventory and Date Range */}
                    <div className="flex flex-row gap-4 items-center">
                      {/* Inventory Dropdown */}
                      <div className="flex-1">
                        <select
                          className="w-full p-2 px-3 border rounded dark:bg-gray-700 dark:border-gray-800 cursor-pointer text-sm font-semibold"
                          value={set.adBoardId}
                          onChange={(e) => {
                            const newAdBoardId = e.target.value;
                            setBookingSets((prev) =>
                              prev.map((s) =>
                                s.id === set.id
                                  ? { ...s, adBoardId: newAdBoardId }
                                  : s
                              )
                            );
                          }}
                        >
                          <option value="">Select Inventory</option>
                          {inventoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Range Picker */}
                      <div className="flex-1">
                        <DateRangePicker
                          startDate={
                            set.startDate ? new Date(set.startDate) : null
                          }
                          endDate={set.endDate ? new Date(set.endDate) : null}
                          setStartDate={(date) => {
                            setBookingSets((prev) =>
                              prev.map((s) =>
                                s.id === set.id
                                  ? {
                                      ...s,
                                      startDate:
                                        date?.toISOString().split("T")[0] ?? "",
                                    }
                                  : s
                              )
                            );
                          }}
                          setEndDate={(date) => {
                            setBookingSets((prev) =>
                              prev.map((s) =>
                                s.id === set.id
                                  ? {
                                      ...s,
                                      endDate:
                                        date?.toISOString().split("T")[0] ?? "",
                                    }
                                  : s
                              )
                            );
                          }}
                          onTodayClick={() => {
                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            setBookingSets((prev) =>
                              prev.map((s) =>
                                s.id === set.id
                                  ? { ...s, startDate: today, endDate: today }
                                  : s
                              )
                            );
                          }}
                          showSearchIcon={false}
                          onSearch={() => {}}
                        />
                      </div>
                    </div>

                    {/* Error messages */}
                    {errors.findIndex((e) => e === set.id) > -1 && (
                      <div className="text-red-500 text-sm">
                        All fields are required.
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 dark:bg-gray-800 flex justify-end gap-4 border-t border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bookingForm"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isEditMode ? "Update Bookings" : "Book Now"}
          </button>
        </div>
      </div>

      {isDeleteConfirmationOpen && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-1">
              Are you sure you want to remove this booking?
            </p>
            <p className="font-light italic text-sm">
              Please check if this is currently playing.
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => handleDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmation(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookInventoryModal;
