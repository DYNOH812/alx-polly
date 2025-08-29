"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export type CreatePollAction = (formData: FormData) => Promise<void>;

function SubmitSection() {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create"}</Button>
      {pending ? (
        <p className="mt-2 text-sm text-green-700">Poll created, redirecting…</p>
      ) : null}
    </div>
  );
}

export default function CreatePollForm({ action }: { action: CreatePollAction }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  const disableRemove = options.length <= 2;

  return (
    <form className="space-y-4" action={action}>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="question">Question</label>
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
                required={i < 2}
              />
              <Button type="button" variant="destructive" onClick={() => removeOption(i)} disabled={disableRemove}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button type="button" variant="ghost" onClick={addOption}>Add option</Button>
        </div>
      </div>
      <SubmitSection />
    </form>
  );
}
