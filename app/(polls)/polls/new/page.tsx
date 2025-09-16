"use client";

import { useState } from "react";
import { createPoll } from "@/app/actions";

export default function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [errors, setErrors] = useState<{ question?: string; options?: string }>({});

  function validateForm() {
    let valid = true;
    const newErrors: { question?: string; options?: string } = {};

    if (question.trim().length < 10) {
      newErrors.question = "❌ Question must be at least 10 characters long";
      valid = false;
    }

    const trimmedOptions = options.map(opt => opt.trim()).filter(Boolean);
    const uniqueOptions = new Set(trimmedOptions);
    if (trimmedOptions.length < 2) {
      newErrors.options = "❌ Please provide at least 2 valid options";
      valid = false;
    } else if (uniqueOptions.size < trimmedOptions.length) {
      newErrors.options = "❌ Options must be unique and non-empty";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    await createPoll(question, options);
    setQuestion("");
    setOptions(["", ""]);
    setErrors({});
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
      <div>
        <label className="block font-semibold">Poll Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="Enter your poll question"
        />
        {errors.question && (
          <p className="text-red-600 text-sm mt-1">{errors.question}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold">Options</label>
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="mt-1 mb-2 w-full border rounded px-3 py-2"
            placeholder={`Option ${i + 1}`}
          />
        ))}
        {errors.options && (
          <p className="text-red-600 text-sm mt-1">{errors.options}</p>
        )}
        <button
          type="button"
          onClick={() => setOptions([...options, ""])}
          className="text-blue-600 text-sm mt-2"
        >
          ➕ Add Option
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Poll
      </button>
    </form>
  );
}
