import React from "react";
import { useNavigate } from "react-router-dom";
import { arrayUnion, doc, setDoc } from "@firebase/firestore";
import { db } from "../services/firebase";
import parseUserAgent from "../services/deviceInfo";

interface LoginProps {
  handleLogin?: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ handleLogin }) => {
  const navigate = useNavigate();

  const validateUserId = (userId: string): string | null => {
    if (userId.length !== 4) return "User ID must be exactly 4 characters long.";

    const letters = userId.slice(0, 2);
    const numbers = userId.slice(2);

    if (!/^[A-Za-z]{2}$/.test(letters))
      return "The first two characters must be letters.";
    if (!/^\d{2}$/.test(numbers))
      return "The last two characters must be numbers.";

    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const rawId = (formData.get("title") as string | null) ?? "";
    const userId = rawId.trim();

    const validationError = validateUserId(userId);
    if (validationError) {
      alert(validationError);
      return;
    }

    sessionStorage.clear();
    sessionStorage.setItem(
      "productdetailsVersion",
      JSON.stringify([null, null, null, null, null]),
    );

    const modeParam = new URLSearchParams(window.location.search).get("mode");
    handleLogin?.(userId);
    navigate(`/home?mode=${modeParam}&userId=${userId}`);

    // Keep the existing user record and append this login as a separate entry.
    // Merge prevents new submissions from replacing existing analytics fields.
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          userId,
          sessions: arrayUnion({
            sessionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            mode: modeParam,
            userAgent: parseUserAgent(),
            startedAt: new Date().toISOString(),
          }),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Error accessing Firestore:", err);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto my-20 flex flex-col items-center text-center gap-6"
      >
        <label className="text-3xl font-bold">
          Please enter your response ID&nbsp;
          <small className="text-3xl font-bold">
            (initials + day of birth, e.g., LD03)
          </small>
        </label>

        <input
          required
          maxLength={4}
          name="title"
          type="text"
          className="border h-8 text-center"
        />

        <input
          type="submit"
          value="SUBMIT"
          className="mt-4 px-[2rem] py-[1rem] bg-[#6254F3] text-white rounded border border-transparent cursor-pointer hover:bg-[#0b5ed7] hover:border-[#0a58ca] hover:text-[#fff] transition-colors"
        />
      </form>
    </div>
  );
};

export default Login;
