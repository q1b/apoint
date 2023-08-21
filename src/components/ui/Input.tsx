import { cn } from "~/utils";
import {
  type Component,
  component$,
  type QwikIntrinsicElements,
} from "@builder.io/qwik";

export type HTMLInputProps = QwikIntrinsicElements["input"];

export type TailwindInputProps = {
  placeholder: string;
  label: string;
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: Component<{}>;
  href?: string;
};

export type InputProps = HTMLInputProps & TailwindInputProps;

export const sizes = {
  xs: "px-1 py-0.5 rounded-md",
  sm: "px-1 py-1 rounded-md",
  compact: "px-2 py-1.5 rounded-md",
  default: "px-2 py-1 rounded-lg text-base",
};

export const colors = {
  primary: `bg-slate-700 text-slate-50 shadow-inner border
    shadow-slate-300/30
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-slate-800 hover:text-slate-50 
    focus-visible:bg-slate-800/90 focus-visible:text-white 
    focus-visible:ring-offset-white focus-visible:ring-slate-400 
    active:bg-slate-900 active:text-white 
    disabled:bg-white disabled:text-slate-400 disabled:border-slate-200 
    
    dark:bg-indigo-500/90 dark:text-indigo-50 dark:border-indigo-400/50 
    dark:hover:bg-indigo-500 dark:hover:border-indigo-300/75 dark:hover:text-indigo-50 
    dark:focus-visible:bg-indigo-500/80 dark:focus-visible:border-indigo-500 dark:focus-visible:text-white 
    dark:focus-visible:ring-offset-slate-800 dark:focus-visible:ring-indigo-600 
    dark:active:bg-indigo-500/80 dark:active:border-indigo-500 dark:active:text-white 
    dark:disabled:bg-slate-700 dark:disabled:text-slate-500 
  `,
  secondary: `bg-white text-slate-600 border-slate-200/75 shadow-sm border
    focus-visible:ring-2 focus-visible:ring-offset-2
    hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 
    focus-visible:bg-slate-100 focus-visible:text-slate-700 focus-visible:border-slate-300 
    focus-visible:ring-offset-white focus-visible:ring-slate-400/60 
    active:bg-slate-200 active:text-slate-700 active:border-slate-300 
    disabled:bg-white disabled:text-slate-400 disabled:border-slate-200    
    
    dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600/75
    dark:hover:bg-slate-600 dark:hover:border-slate-500 dark:hover:text-slate-50
    dark:focus-visible:bg-slate-600/80 dark:focus-visible:border-slate-600 dark:focus-visible:text-white
    dark:focus-visible:ring-offset-slate-800 dark:focus-visible:ring-slate-600
    dark:active:bg-slate-600/80 dark:active:border-slate-600 dark:active:text-white
    dark:disabled:bg-slate-700 dark:disabled:border-slate-600 dark:disabled:text-slate-500`,
  accent: `bg-indigo-500 text-indigo-50
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-indigo-600/90 hover:text-indigo-50 
    focus-visible:bg-indigo-600/90 focus-visible:text-white 
    focus-visible:ring-offset-white focus-visible:ring-indigo-400 
    active:bg-indigo-600 active:text-white 
    disabled:bg-white disabled:text-slate-400 disabled:border-slate-200 
    
    dark:bg-indigo-500/90 dark:text-indigo-50 dark:border-indigo-400/50 
    dark:hover:bg-indigo-500 dark:hover:border-indigo-300/75 dark:hover:text-indigo-50 
    dark:focus-visible:bg-indigo-500/80 dark:focus-visible:border-indigo-500 dark:focus-visible:text-white 
    dark:focus-visible:ring-offset-slate-800 dark:focus-visible:ring-indigo-600 
    dark:active:bg-indigo-500/80 dark:active:border-indigo-500 dark:active:text-white 
    dark:disabled:bg-slate-700 dark:disabled:text-slate-500 `,
  error: `bg-rose-100 text-rose-500 
    focus-visible:ring-2 focus-visible:ring-offset-2 
    hover:bg-rose-600/90 hover:text-rose-50 
    focus-visible:bg-rose-600/90 focus-visible:text-white focus-visible:ring-offset-white focus-visible:ring-rose-400 
    active:bg-rose-600 active:text-white 
    disabled:bg-white disabled:text-slate-400 disabled:border-slate-200 

    dark:bg-rose-500/90 dark:text-rose-50 dark:border-rose-400/50 
    dark:hover:bg-rose-500 dark:hover:border-rose-300/75 dark:hover:text-rose-50 
    dark:focus-visible:bg-rose-500/80 dark:focus-visible:border-rose-500 
    dark:focus-visible:text-white dark:focus-visible:ring-offset-slate-800 dark:focus-visible:ring-rose-600 
    dark:active:bg-rose-500/80 dark:active:border-rose-500 dark:active:text-white 
    dark:disabled:bg-slate-700 dark:disabled:text-slate-500`,
};

const Input = component$((props: InputProps) => {
  const {
    size = "default",
    color = "secondary",
    class: classNames,
    disabled,
    label,
    placeholder,
    loading,
    // icon,
    ...rest
  } = props;
  // const Icon = icon;
  return (
    <div class="flex flex-col w-full items-start gap-y-0.5">
      <label class="text-sm" for={label}>
        {label}
      </label>
      <input
        id={label}
        placeholder={placeholder}
        aria-disabled={disabled}
        disabled={disabled}
        {...rest}
        class={cn(
          "relative w-max inline-flex items-center justify-center [-webkit-tap-highlight-color:transparent;] select-none outline-none transition-colors ease-in",
          colors[color],
          sizes[size],
          classNames,
          {
            "animate-pulse": loading,
          }
        )}
      />
    </div>
  );
});

export { Input };
