import { component$ } from "@builder.io/qwik";
import { cn } from "~/utils";

type InputLabelProps = {
  name: string;
  label?: string;
  required?: boolean;
  class?: string;
  margin?: "none";
};

/**
 * Input label for a form field.
 */
export const Label = component$(
  ({ name, label, class: className, required, margin }: InputLabelProps) => (
    <>
      {label && (
        <label
          class={cn(
            "inline-block text-sm md:text-base leading-6 text-gray-900 font-medium",
            !margin && "mb-1",
            className
          )}
          for={name}
        >
          {label}{" "}
          {required && (
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          )}
        </label>
      )}
    </>
  )
);
