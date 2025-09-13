import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
const taskTigersLogo = `${IMAGE_BASE_URL}/logo.png`; 
import "./BookingDetails.css";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/order/order/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setBooking(data); // Store fetched data in the state
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const img = new Image();
    img.src = taskTigersLogo;
    img.onload = () => {
      const logoWidth = 50;
      const logoXPosition = (pageWidth - logoWidth) / 2;

      // Add logo
      doc.addImage(img, "PNG", logoXPosition, 10, 50, 20);

      // Invoice Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Task Tigers Invoice", 10, 40);

      // Booking Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice ID: ${booking?._id}`, 10, 50);
      doc.text(`Date: ${new Date(booking?.createdAt).toLocaleDateString()}`, 10, 60);

      // Customer Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Details", 10, 70);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${booking?.userId?.name}`, 10, 80);
      doc.text(`Email: ${booking?.userId?.email}`, 10, 90);
      doc.text(`City: ${booking?.addressId?.city}`, 10, 100);
      doc.text(`State: ${booking?.addressId?.state}`, 10, 110);
      doc.text(`Pincode: ${booking?.addressId?.pincode}`, 10, 120);

      // Job Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Job Details", 10, 130);
      booking?.items?.forEach((item, index) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${index + 1}. ${item.serviceId?.name} (${item.categoryId?.name} - ${item.subCategoryId?.name})`,
          10,
          140 + index * 10
        );
        doc.text(`    Quantity: ${item.quantity}, Price: ₹${item.serviceId?.price}`, 10, 150 + index * 10);
      });

      // Total Amount
      const totalAmount = booking?.items.reduce(
        (sum, item) => sum + (item.quantity * item.serviceId?.price || 0),
        0
      );
      doc.text(`Total Amount: ₹${totalAmount}`, 10, 170 + booking?.items.length * 10);

      // Footer
      doc.setFontSize(10);
      doc.text(
        "Thank you for using Task Tigers. For support, contact support@tasktigers.com.",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      doc.save("booking-invoice.pdf");
    };
  };

  if (!booking) {
    return <p>Loading booking details...</p>;
  }

  return (
    <div className="booking-details-main-container">
      <div className="booking-details-container">
        <h1>Invoice</h1>
        <button className="download-btn" onClick={handleDownloadPDF}>
          <FontAwesomeIcon icon={faDownload} /> Download PDF
        </button>

        <div className="invoice-section">
          <h2>Booking Details</h2>
          <p><strong>Invoice ID:</strong> {booking._id}</p>
          <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="invoice-section">
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> {booking.userId.name}</p>
          <p><strong>Email:</strong> {booking.userId.email}</p>
          <p><strong>City:</strong> {booking.addressId.city}</p>
          <p><strong>State:</strong> {booking.addressId.state}</p>
          <p><strong>Pincode:</strong> {booking.addressId.pincode}</p>
        </div>

        <div className="invoice-section">
          <h2>Job Details</h2>
          {booking.items.map((item, index) => (
            <div key={index}>
              <p>
                <strong>{index + 1}. {item.serviceId?.name}</strong> ({item.categoryId?.name} - {item.subCategoryId?.name})
              </p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.serviceId?.price}</p>
              <hr />
            </div>
          ))}
        </div>

        <div className="invoice-section">
          <h2>Total Amount</h2>
          <p>₹{booking.items.reduce((sum, item) => sum + (item.quantity * item.serviceId?.price || 0), 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
