import { cn } from "~/utils";
import {
  component$,
  type QwikIntrinsicElements,
  Slot,
  $,
  type PropFunction,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Spinner } from "./Spinner";

export type HTMLButtonProps = QwikIntrinsicElements["button"];

export type TailwindButtonProps = {
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
  loading?: boolean;
  href?: string;
  onClick$?: PropFunction<() => unknown>;
  form?: string;
};

export type ButtonProps = HTMLButtonProps & TailwindButtonProps;

export const sizes = {
  xs: "px-1 py-0.5 rounded-md",
  sm: "px-1 py-1 rounded-md",
  compact: "px-2 py-1.5 rounded-md",
  default: "px-2 py-1 rounded-lg text-base sm:text-sm md:px-3 md:text-base",
};

export const colors = {
  primary: `bg-gray-700 text-gray-50 shadow-inner border
    shadow-gray-300/30
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-gray-800 hover:text-gray-50 
    focus-visible:bg-gray-800/90 focus-visible:text-white 
    focus-visible:ring-offset-white focus-visible:ring-gray-400 
    active:bg-gray-900 active:text-white 
    disabled:bg-white disabled:text-gray-400 disabled:border-gray-200 
    
    dark:bg-indigo-500/90 dark:text-indigo-50 dark:border-indigo-400/50 
    dark:hover:bg-indigo-500 dark:hover:border-indigo-300/75 dark:hover:text-indigo-50 
    dark:focus-visible:bg-indigo-500/80 dark:focus-visible:border-indigo-500 dark:focus-visible:text-white 
    dark:focus-visible:ring-offset-gray-800 dark:focus-visible:ring-indigo-600 
    dark:active:bg-indigo-500/80 dark:active:border-indigo-500 dark:active:text-white 
    dark:disabled:bg-gray-700 dark:disabled:text-gray-500 
  `,
  secondary: `bg-white text-gray-600 border-gray-200/75 shadow-sm border
    focus-visible:ring-2 focus-visible:ring-offset-2
    hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 
    focus-visible:bg-gray-100 focus-visible:text-gray-700 focus-visible:border-gray-300 
    focus-visible:ring-offset-white focus-visible:ring-gray-400/60 
    active:bg-gray-200 active:text-gray-700 active:border-gray-300 
    disabled:bg-white disabled:text-gray-400 disabled:border-gray-200    
    
    dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600/75
    dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-50
    dark:focus-visible:bg-gray-600/80 dark:focus-visible:border-gray-600 dark:focus-visible:text-white
    dark:focus-visible:ring-offset-gray-800 dark:focus-visible:ring-gray-600
    dark:active:bg-gray-600/80 dark:active:border-gray-600 dark:active:text-white
    dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:text-gray-500`,
  accent: `bg-indigo-500 text-indigo-50
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-indigo-600/90 hover:text-indigo-50 
    focus-visible:bg-indigo-600/90 focus-visible:text-white 
    focus-visible:ring-offset-white focus-visible:ring-indigo-400 
    active:bg-indigo-600 active:text-white 
    disabled:bg-white disabled:text-gray-400 disabled:border-gray-200 
    
    dark:bg-indigo-500/90 dark:text-indigo-50 dark:border-indigo-400/50 
    dark:hover:bg-indigo-500 dark:hover:border-indigo-300/75 dark:hover:text-indigo-50 
    dark:focus-visible:bg-indigo-500/80 dark:focus-visible:border-indigo-500 dark:focus-visible:text-white 
    dark:focus-visible:ring-offset-gray-800 dark:focus-visible:ring-indigo-600 
    dark:active:bg-indigo-500/80 dark:active:border-indigo-500 dark:active:text-white 
    dark:disabled:bg-gray-700 dark:disabled:text-gray-500 `,
  error: `bg-rose-100 text-rose-500 
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-rose-600/90 hover:text-rose-50 
    focus-visible:bg-rose-600/90 focus-visible:text-white focus-visible:ring-offset-white focus-visible:ring-rose-400 
    active:bg-rose-600 active:text-white 
    disabled:bg-white disabled:text-gray-400 disabled:border-gray-200 

    dark:bg-rose-500/90 dark:text-rose-50 dark:border-rose-400/50 
    dark:hover:bg-rose-500 dark:hover:border-rose-300/75 dark:hover:text-rose-50 
    dark:focus-visible:bg-rose-500/80 dark:focus-visible:border-rose-500 
    dark:focus-visible:text-white dark:focus-visible:ring-offset-gray-800 dark:focus-visible:ring-rose-600 
    dark:active:bg-rose-500/80 dark:active:border-rose-500 dark:active:text-white 
    dark:disabled:bg-gray-700 dark:disabled:text-gray-500`,
};

const Button = component$((props: ButtonProps) => {
  const {
    size = "default",
    color = "primary",
    class: classNames,
    disabled,
    // icon,
    href,
    ...rest
  } = props;
  const loading = useSignal(false);
  // Expand or collapse content when expanded prop change
  useVisibleTask$(({ track }) => {
    track(() => props.loading);
    loading.value = !!props.loading;
  });
  return (
    <>
      {href !== undefined ? (
        <Link
          href={href}
          aria-disabled={disabled}
          class={cn(
            "relative w-max inline-flex items-center justify-center [-webkit-tap-highlight-color:transparent;] select-none outline-none transition-colors ease-in",
            colors[color],
            sizes[size],
            classNames
          )}
        >
          <Slot />
        </Link>
      ) : (
        <button
          aria-disabled={disabled || loading.value}
          disabled={disabled || loading.value}
          onClick$={() => {
            props.onClick$ &&
              $(async () => {
                loading.value = true;
                await props.onClick$!();
                loading.value = false;
              });
          }}
          {...rest}
          class={cn(
            "relative w-max inline-flex items-center justify-center [-webkit-tap-highlight-color:transparent;] select-none outline-none transition-colors ease-in",
            colors[color],
            sizes[size],
            classNames
          )}
        >
          <div
            class={cn(
              "transition-[opacity,transform,visibility] duration-200 flex items-center",
              loading.value
                ? "invisible translate-x-5 opacity-0"
                : "visible delay-300"
            )}
          >
            <Slot />
          </div>
          <div
            class={cn(
              "absolute duration-200",
              loading.value
                ? "visible delay-300"
                : "invisible -translate-x-5 opacity-0"
            )}
          >
            <Spinner />
          </div>
        </button>
      )}
    </>
  );
});

export { Button };
