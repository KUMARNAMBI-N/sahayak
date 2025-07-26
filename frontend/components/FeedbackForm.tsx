import React, { useState } from "react";

interface FeedbackFormProps {
  userId: string;
  feature: string;
  inputPrompt: string;
  outputContent: string;
  submitted?: boolean;
  onSubmit?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  userId,
  feature,
  inputPrompt,
  outputContent,
  submitted = false,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [localSubmitted, setLocalSubmitted] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/save-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          feature,
          inputPrompt,
          outputContent,
          rating,
          comment,
        }),
      });
      setLocalSubmitted(true);
      if (onSubmit) onSubmit();
    } catch (error) {
      setLocalSubmitted(true);
      if (onSubmit) onSubmit();
    }
  };

  if (submitted || localSubmitted) {
    return (
      <div className="text-xs text-green-600 mt-2">
        Thank you for your feedback!
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        className="text-xs text-blue-600 underline mt-2"
        onClick={() => setExpanded(true)}
        type="button"
      >
        Give Feedback
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mt-2 text-xs"
    >
      <label>
        Rating:
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-1"
        >
          <option value={5}>⭐⭐⭐⭐⭐</option>
          <option value={4}>⭐⭐⭐⭐</option>
          <option value={3}>⭐⭐⭐</option>
          <option value={2}>⭐⭐</option>
          <option value={1}>⭐</option>
        </select>
      </label>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Your feedback"
        className="border rounded px-2 py-1 ml-2"
        style={{ width: "120px" }}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
      >
        Submit
      </button>
      <button
        type="button"
        className="text-gray-500 ml-2"
        onClick={() => setExpanded(false)}
      >
        Cancel
      </button>
    </form>
  );
};

export default FeedbackForm;