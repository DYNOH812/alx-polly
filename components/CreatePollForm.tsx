"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export type CreatePollAction = (formData: FormData) => Promise<void>;

/**
 * SubmitSection Component
 * -----------------------
 * Handles the display of the form's submit button and its loading state.
 * Uses `useFormStatus` to track submission progress.
 * 
 * Why:
 * Provides user feedback (loading message + disabled button) during poll creation,
 * which prevents duplicate submissions and improves UX.
 */
function SubmitSection() {
  const { pending } = useFormStatus(); // Tracks if the form is currently submitting
  return (
    <div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create"}
      </Button>
      {pending ? (
        <p className="mt-2 text-sm text-green-700">
          Poll created, redirecting…
        </p>
      ) : null}
    </div>
  );
}

/**
 * CreatePollForm Component
 * ------------------------
 * Form for creating a new poll with a dynamic number of options.
 * 
 * Features:
 * - Requires at least 2 options (cannot remove below 2).
 * - Allows adding/removing more options dynamically.
 * - Uses controlled inputs (`useState`) for question and options.
 * - Submits data to a server action (passed in as `action` prop).
 * 
 * Why:
 * This ensures users create valid polls while keeping the UI flexible 
 * for multiple-choice style questions.
 */
export default function CreatePollForm({ action }: { action: CreatePollAction }) {
  const [question, setQuestion] = useState("");       // Poll question text
  const [options, setOptions] = useState<string[]>(["", ""]); // At least 2 blank options by default

  /** Adds a new blank option input field */
  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  /**
   * Removes an option at a given index.
   * - Minimum of 2 options must remain.
   */
  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  /** Updates the value of an option at a given index */
  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  const disableRemove = options.length <= 2; // Prevents removing below 2 options

  return (
    <form className="space-y-4" action={action}>
      {/* Question input */}
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="question">
          Question
        </label>
        <input
          id="question"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
          placeholder="What should we ask?"
          required
        />
      </div>

      {/* Options input section */}
      <div>
        <label className="mb-1 block text-sm font-medium">Options</label>
        <div className="grid gap-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="options"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 rounded-md border border-black/10 bg-white px-3 py-2"
                placeholder={`Option ${i + 1}`}
                required={i < 2} // First 2 options are required
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeOption(i)}
                disabled={disableRemove}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Add option button */}
        <div className="mt-2">
          <Button type="button" variant="ghost" onClick={addOption}>
            Add option
          </Button>
        </div>
      </div>

      {/* Submit section (button + feedback) */}
      <SubmitSection />
    </form>
  );
}
