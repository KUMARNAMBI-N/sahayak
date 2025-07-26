import React, { useState } from "react";

const WorksheetOutput = ({ outputContent, inputPrompt, userId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/save-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        feature: "worksheet",
        inputPrompt,
        outputContent,
        rating,
        comment,
      }),
    });
    setSubmitted(true);
  };

  return (
    <div>
      <div>{outputContent}</div>
      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ marginTop: "1em" }}>
          <label>
            Rating:
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>
          </label>
          <br />
          <label>
            Comments:
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Your feedback"
              style={{ width: "60%" }}
            />
          </label>
          <br />
          <button type="submit">Submit Feedback</button>
        </form>
      ) : (
        <div>Thank you for your feedback!</div>
      )}
    </div>
  );
};

export default WorksheetOutput;