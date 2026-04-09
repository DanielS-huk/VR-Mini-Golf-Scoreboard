"use client";

import { useFormStatus } from "react-dom";

type DeleteRoundButtonProps = {
  action: () => Promise<void>;
  className?: string;
};

function DeleteButtonInner({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={className ?? "danger-button"} type="submit" disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function DeleteRoundButton({ action, className }: DeleteRoundButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this round? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <DeleteButtonInner className={className} />
    </form>
  );
}
