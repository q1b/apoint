import {
  component$,
  useSignal,
  useTask$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from "@builder.io/qwik";
import { InputError } from "./Input";
import { Label } from "./Label";
import { cn } from "~/utils";

type SelectProps = {
  ref: PropFunction<(element: Element) => void>;
  name: string;
  value: string | string[] | null | undefined;
  onInput$: PropFunction<(event: Event, element: HTMLSelectElement) => void>;
  onChange$: PropFunction<
    (
      event: QwikChangeEvent<HTMLSelectElement>,
      element: HTMLSelectElement
    ) => void
  >;
  onBlur$: PropFunction<
    (
      event: QwikFocusEvent<HTMLSelectElement>,
      element: HTMLSelectElement
    ) => void
  >;
  options: { label: string; value: string }[];
  multiple?: boolean;
  size?: number;
  placeholder?: string;
  required?: boolean;
  class?: string;
  label?: string;
  error?: string;
};

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export const Select = component$(
  ({ value, options, label, error, ...props }: SelectProps) => {
    const { name, required, multiple, placeholder } = props;

    // Create computed value of selected values
    const values = useSignal<string[]>();
    useTask$(({ track }) => {
      track(() => value);
      values.value = Array.isArray(value)
        ? value
        : value && typeof value === "string"
        ? [value]
        : [];
    });

    return (
      <div class={cn("", props.class)}>
        <div class="flex justify-between">
          <Label name={name} label={label} required={required} />
          <InputError name={name} error={error} />
        </div>
        <select
          {...props}
          class={cn(
            `block w-full rounded-md border-0 shadow-inner py-1 px-2 ring-1 ring-inset text-gray-800 ring-gray-300 placeholder:text-gray-600`,
            `focus:ring-2 focus:ring-inset focus:ring-indigo-600`,
            `text-base md:text-lg md:py-1 sm:text-sm sm:leading-6 bg-white outline-none`,
            multiple && "form-multiselect",
            error &&
              "ring-rose-400 bg-rose-100 placeholder:text-rose-600 focus:ring-rose-400",
            placeholder && !values.value?.length && "text-slate-500"
          )}
          id={name}
          aria-invalid={!!error}
          aria-errormessage={`${name}-error`}
        >
          <option value="" disabled hidden selected={!value}>
            {placeholder}
          </option>
          {options.map(({ label, value }) => (
            <option
              key={value}
              value={value}
              selected={values.value?.includes(value)}
            >
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
