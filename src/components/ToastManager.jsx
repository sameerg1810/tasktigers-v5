import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { ToastContext } from "../context/ToastContext";

const ToastManager = ({
  children,
  defaultDuration = 2000,
  nextToastDelay = 1500,
}) => {
  const [toastQueue, setToastQueue] = useState([]); // Queue to hold toasts
  const toastActive = useRef(false); // Track if a toast is currently active
  const toastTimeout = useRef(null); // Store timeout ID for clearing if needed

  // Show the next toast in the queue
  const showNextToast = useCallback(() => {
    if (toastQueue.length === 0) return;

    toastActive.current = true; // Mark toast as active
    const { message, type, options } = toastQueue[0]; // Get the first toast from the queue

    toast[type](message, {
      id: "global-toast", // Use a consistent ID for global toasts
      duration: options.duration || defaultDuration,
      ...options,
      onClose: () => {
        toastActive.current = false; // Mark toast as inactive
        setToastQueue((queue) => queue.slice(1)); // Remove the current toast from the queue

        // Delay before showing the next toast
        toastTimeout.current = setTimeout(() => {
          if (toastQueue.length > 1) {
            showNextToast();
          }
        }, nextToastDelay);
      },
    });
  }, [toastQueue, defaultDuration, nextToastDelay]);

  // Show the next toast if the queue changes and no toast is active
  useEffect(() => {
    if (toastQueue.length > 0 && !toastActive.current) {
      showNextToast();
    }
  }, [toastQueue, showNextToast]);

  // Clear timeout on component unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  // Add a toast to the queue, avoiding duplicates
  const addToast = (message, type = "success", options = {}) => {
    if (!message || typeof message !== "string") {
      console.error("Toast message must be a non-empty string");
      return;
    }
    if (!["success", "error", "loading", "custom"].includes(type)) {
      console.error("Invalid toast type:", type);
      return;
    }

    // Avoid duplicate toasts by checking the last item in the queue
    if (
      toastQueue.length === 0 ||
      toastQueue[toastQueue.length - 1].message !== message
    ) {
      setToastQueue((queue) => [...queue, { message, type, options }]);
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster position="top-center" /> {/* Global Toaster component */}
    </ToastContext.Provider>
  );
};

export default ToastManager;
