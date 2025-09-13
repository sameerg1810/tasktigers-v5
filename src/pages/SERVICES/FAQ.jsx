import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FAQ.css";

const FAQ = ({ serviceId }) => {
  const [faqs, setFaqs] = useState([]);  // Ensure it's an array by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      setError(null);  // Reset error state before fetching

      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

      try {
        const response = await axios.get(`${AZURE_BASE_URL}/v1.0/users/faq/service/${serviceId}`);

        if (Array.isArray(response.data)) {
          setFaqs(response.data); // Ensure `faqs` is always an array
        } else {
          setFaqs([]);  // If data is not an array, set an empty array
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setError("Failed to load FAQs. Please try again later.");
        setFaqs([]);  // Ensure `faqs` is always an array, even on error
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchFAQs();
    }
  }, [serviceId]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) return <p>Loading FAQs...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!faqs || faqs.length === 0) return <p>No FAQs available for this service.</p>;

  return (
    <div id="faq-container">
      <h2 id="faq-title">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div
          key={faq._id || index}  // Fallback key if _id is missing
          className={`faq-item ${openIndex === index ? "expanded" : ""}`}
        >
          <div className="faq-header" onClick={() => toggleFAQ(index)}>
            <div className="toggle-column">
              <button className="faq-toggle-button">
                {openIndex === index ? "-" : "+"}
              </button>
            </div>
            <div className="content-column">
              <h4>{faq.question || "No question available"}</h4>
              {openIndex === index && (
                <div
                  className="faq-answer"
                  dangerouslySetInnerHTML={{ __html: faq.answer || "No answer available" }}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
