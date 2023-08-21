import {
  component$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from "@builder.io/qwik";
import { cn } from "~/utils";

type TextInputProps = {
  name: string;
  type: "text" | "email" | "tel" | "password" | "url" | "date";
  label?: string;
  description?: string;
  placeholder?: string;
  value: string | undefined;
  class?: string;
  error: string;
  required?: boolean;
  ref: PropFunction<(element: Element) => void>;
  onInput$: PropFunction<(event: Event, element: HTMLInputElement) => void>;
  onChange$: PropFunction<
    (
      event: QwikChangeEvent<HTMLInputElement>,
      element: HTMLInputElement
    ) => void
  >;
  onBlur$: PropFunction<
    (event: QwikFocusEvent<HTMLInputElement>, element: HTMLInputElement) => void
  >;
};

export const TextInput = component$(
  ({
    label,
    error,
    description,
    class: className,
    ...props
  }: TextInputProps) => {
    const { name, required } = props;
    return (
      <>
        {label && (
          <label for={name}>
            {label} {required && <span>*</span>}
          </label>
        )}
        <input
          {...props}
          id={name}
          aria-invalid={!!error}
          aria-errormessage={`${name}-error`}
          class={cn("", className)}
        />
        {description && <div> {description} </div>}
        {error && <div id={`${name}-error`}>{error}</div>}
      </>
    );
  }
);
