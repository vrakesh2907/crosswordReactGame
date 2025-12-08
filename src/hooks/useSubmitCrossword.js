import { useState } from "react";

export default function useSubmitCrossword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const submitScore = async (payload) => {
    if (!payload) {
      setError("Invalid payload");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();

      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) continue;

        
        if (key === "additionalFields") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      }

      const res = await fetch(
        "https://staging-games.extramileplay.com/crossword_new/admin/API/submit.php",
        {
          method: "POST",
          body: form,
        }
      );

      const json = await res.json();
      setResponse(json);

      return json;
    } catch (err) {
      console.error("Submit error:", err);
      setError("Submission failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitScore, loading, error, response };
}

