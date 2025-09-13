import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHelp } from "../../context/HelpContext"; // Import the HelpContext
import { FiChevronRight } from "react-icons/fi"; // Import FiChevronRight from react-icons/fi
import "./HelpPage.css";

const predefinedQA = [
  {
    category: "Account",
    // icon: <AccountCircleIcon />,
    questions: [
      {
        question:
          "Thanks for reaching us, please let me know how can i help you with this booking?",
        answer: "Please.",
      },
      {
        question: "How do I reset my password?",
        answer: 'Click on "Forgot Password" and follow the instructions.',
      },
      {
        question: "Can I change my username?",
        answer: "No, your username is permanent once created.",
      },
      {
        question: "How do I delete my account?",
        answer:
          'Go to your account settings, scroll down, and click "Delete Account".',
      },
      {
        question: "How do I update my profile information?",
        answer:
          'Visit the profile page, click "Edit Profile," and update your details.',
      },
    ],
  },
  {
    category: "Payments Related",
    // icon: <CreditCardIcon />,
    questions: [
      {
        question: "How do I make a payment?",
        answer:
          "You can make a payment via credit card, PayPal, or bank transfer.",
      },
      {
        question: "What are credits?",
        answer:
          "Credits are a virtual currency you can use to purchase services.",
      },
      {
        question: "How do I check my credit balance?",
        answer: 'Go to your account dashboard and check the "Credits" section.',
      },
      {
        question: "What happens if my payment fails?",
        answer:
          "You will be notified, and you can try again or use a different payment method.",
      },
      {
        question: "Can I get a refund?",
        answer:
          "Refunds are available under certain conditions. Contact support for details.",
      },
    ],
  },
  {
    category: "Safety",
    questions: [
      {
        question: "How can I ensure my account is safe?",
        answer: "Use a strong password and enable two-factor authentication.",
      },
      {
        question: "What should I do if I suspect my account is hacked?",
        answer:
          "Immediately change your password and contact support for assistance.",
      },
      {
        question: "How do I enable two-factor authentication?",
        answer:
          "Go to your account settings, find security options, and enable 2FA.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard encryption to protect your payment details.",
      },
    ],
  },
];
const HelpPage = () => {
  const navigate = useNavigate();
  const { bookingData,setIsChatToggle } = useHelp(); // Get bookingData from context
  
  // useRef to retain booking data and services
  const servicesRef = useRef([]);
  const bookingDataRef = useRef(bookingData);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchServices = async () => {
      if (!bookingDataRef.current || !bookingDataRef.current.items) {
        setLoading(false);
        return;
      }

      try {
        const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
        const fetchedServices = await Promise.all(
          bookingDataRef.current.items.map(async (item) => {
            const response = await fetch(
              `${AZURE_BASE_URL}/v1.0/core/services/${item.serviceId._id}`
            );
            return response.json();
          })
        );
        servicesRef.current = fetchedServices; // Store fetched services in useRef
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Format the date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // If loading, show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If no booking data is found, show a message
  if (!bookingDataRef.current) {
    return <p>No booking data found.</p>;
  }

  const handleCategory = (topic) => {
    navigate("/faqChat", { state: { topic } });
  };

  const handleChatanable=()=>{
    setIsChatToggle(true)
    navigate("/faqChat")
  }

  return (
    <div className="help-page-container" >
      <div className="content-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          &#x2190;
        </button>
        <h1 className="help-title">How can we help you?</h1>

        {/* Recent Bookings Section */}
        <div className="recent-bookings-section">
          <h2 className="section-title">Recent bookings</h2>
          {servicesRef.current && servicesRef.current.length > 0 ? (
            servicesRef.current.map((service, index) => (
              <div key={index}>
                <div className="booking-item">
                  {/* Service Image */}
                  <img
                    src={service.image} 
                    alt={`${service.name} icon`}
                    className="service-icon"
                  />
                  <div className="booking-info">
                    <p className="booking-title">{service.name}</p>
                    <p className="booking-date">
                      {formatDate(
                        bookingDataRef.current.items[index]?.scheduledDate
                      )}
                    </p>
                  </div>
                  <FiChevronRight className="booking-arrow" />{" "}
                  {/* Updated Arrow Icon */}
                </div>
                <hr className="separator-line" />
              </div>
            ))
          ) : (
            <p>No recent bookings</p>
          )}
          <a href="/booking-history" className="booking-history-link">
            Booking History
          </a>
        </div>

        {/* Help Topics Section */}
        <div className="help-topics-section">
          <h2 className="section-title">All topics</h2>
          {predefinedQA.map((topic, index) => (
            <div key={index}>
              <div className="help-topic-item">
                <div
                  onClick={() => handleCategory(topic)}
                  className="topic-name"
                >
                  {topic.category}
                </div>
                <FiChevronRight className="topic-arrow" />{" "}
                {/* Updated Arrow Icon */}
              </div>
              <hr className="separator-line" />
            </div>
          ))}
          <div>
            <div className="help-topic-item">
              <div onClick={handleChatanable} className="topic-name">
                Chat With Agent
              </div>
              <FiChevronRight className="topic-arrow" />{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
