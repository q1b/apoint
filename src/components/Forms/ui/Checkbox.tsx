import {
  component$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from "@builder.io/qwik";
import { InputError } from "./Input";
import { cn } from "~/utils";
import { Label } from "./Label";

type CheckboxProps = {
  ref: PropFunction<(element: Element) => void>;
  name: string;
  value?: string;
  description?: string;
  checked?: boolean;
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
  required?: boolean;
  class?: string;
  label: string;
  error?: string;
};

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 */
export const Checkbox = component$(
  ({
    label,
    error,
    required,
    name,
    description,
    class: className,
    ...props
  }: CheckboxProps) => {
    return (
      <div class="flex">
        <input
          {...props}
          aria-describedby={`${name}-description`}
          type="checkbox"
          class={cn(
            "border-gray-400 mr-3 rounded w-[1.125rem] h-[1.125rem] mt-0.5 sm:w-5 sm:h-5",
            className
          )}
          name={name}
          id={name}
          aria-invalid={!!error}
          aria-errormessage={`${name}-error`}
        />
        <div class="">
          <Label
            required={required}
            name={name}
            class="text-gray-800"
            label={label}
            margin="none"
          />
          {description && (
            <p id={`${name}-description`} class="text-sm mt-0.5 text-gray-500">
              {description}
            </p>
          )}
          <InputError name={name} error={error} />
        </div>
      </div>
    );
  }
);
