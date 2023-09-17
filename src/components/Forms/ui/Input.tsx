import {
  component$,
  useSignal,
  useTask$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from "@builder.io/qwik";
import { Label } from "./Label";
import { isBrowser } from "@builder.io/qwik/build";
import { Expandable } from "./Expandable";
import { cn } from "~/utils";

type InputErrorProps = {
  name: string;
  error?: string;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
export const InputError = component$(({ name, error }: InputErrorProps) => {
  // Use frozen error signal
  const frozenError = useSignal<string>();

  // Freeze error while element collapses to prevent UI from jumping
  useTask$(({ track, cleanup }) => {
    const nextError = track(() => error);
    if (isBrowser && !nextError) {
      const timeout = setTimeout(() => (frozenError.value = nextError), 200);
      cleanup(() => clearTimeout(timeout));
    } else {
      frozenError.value = nextError;
    }
  });

  return (
    <Expandable expanded={!!error}>
      <div class="pt-1 text-xs sm:text-sm text-red-500" id={`${name}-error`}>
        {frozenError.value}
      </div>
    </Expandable>
  );
});

type TextInputProps = {
  ref: PropFunction<(element: Element) => void>;
  type:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "url"
    | "number"
    | "date"
    | "time";
  name: string;
  description?: string;
  value: string | number | undefined;
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
  placeholder?: string;
  required?: boolean;
  class?: string;
  label?: string;
  error?: string;
  form?: string;
};

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export const Input = component$(
  ({ label, value, description, error, ...props }: TextInputProps) => {
    const { name, required } = props;
    const input = useSignal<string | number>();
    useTask$(({ track }) => {
      if (!Number.isNaN(track(() => value))) {
        input.value = value;
      }
    });
    return (
      <>
        <div class={cn("", props.class)}>
          <div class="flex justify-between">
            <Label name={name} label={label} required={required} />
            <InputError name={name} error={error} />
          </div>
          <input
            {...props}
            aria-describedby={`${name}-description`}
            class={cn(
              `h-8 block w-full border-0 rounded-md shadow-inner p-2 ring-1 ring-inset text-gray-800 ring-gray-300 placeholder:text-gray-400`,
              `focus:ring-2 focus:ring-inset focus:ring-indigo-600`,
              `text-base md:text-lg md:py-3 sm:text-sm sm:leading-6 bg-white outline-none`,
              error &&
                "ring-rose-400 bg-rose-100 placeholder:text-rose-600 focus:ring-rose-400"
            )}
            id={name}
            value={input.value}
            aria-invalid={!!error}
            aria-errormessage={`${name}-error`}
          />
          {description && (
            <div
              id={`${name}-description`}
              class="pt-1 text-xs sm:text-sm text-gray-500"
            >
              {description}
            </div>
          )}
        </div>
      </>
    );
  }
);
