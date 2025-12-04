import { useState } from "react";

export default function useSubmitCrossword() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [response, setResponse] = useState(null);


  const submitScore = async (payload) => {
  setLoading(true);
  setError(null);

  try {
    const form = new FormData();
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === "object") {
        form.append(key, JSON.stringify(payload[key]));
      } else {
        form.append(key, payload[key]);
      }
    });

    const res = await fetch(
      "https://staging-games.extramileplay.com/crossword_new/admin/API/submit.php",
      {
        method: "POST",
        body: form,   // ❗ NO HEADERS
      }
    );

    const json = await res.json();
    setResponse(json);
    return json;

  } catch (err) {
    console.error("Submit Error:", err);
    setError("Submission failed");
  } finally {
    setLoading(false);
  }
};

  return { submitScore, loading, error, response };
}
