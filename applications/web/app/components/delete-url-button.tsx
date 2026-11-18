import { useState } from "react";
import { Form, useNavigation } from "react-router";

interface DeleteUrlButtonProps {
  shortCode: string;
}

/**
 * Two-step delete button: the user has to confirm before the form is
 * submitted, so a single accidental click cannot remove a link.
 */
export function DeleteUrlButton({ shortCode }: DeleteUrlButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const navigation = useNavigation();

  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("code") === shortCode;

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label={`Delete short link ${shortCode}`}
        className="text-sm font-medium text-moss underline decoration-sage underline-offset-4 transition hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:text-sage dark:hover:text-cream dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
      >
        Delete
      </button>
    );
  }

  return (
    <Form
      method="post"
      aria-label={`Confirm deletion of ${shortCode}`}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="code" value={shortCode} />
      <span className="text-sm text-moss dark:text-sage">Delete?</span>
      <button
        type="submit"
        disabled={isDeleting}
        className="rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-cream transition hover:bg-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cream dark:text-forest dark:hover:bg-sage dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
      >
        {isDeleting ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setIsConfirming(false)}
        disabled={isDeleting}
        className="rounded-lg border border-sage/70 px-3 py-1.5 text-sm font-medium text-moss transition hover:bg-sage/20 hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60 dark:border-sage/30 dark:text-sage dark:hover:bg-sage/10 dark:hover:text-cream dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
      >
        Cancel
      </button>
    </Form>
  );
}
