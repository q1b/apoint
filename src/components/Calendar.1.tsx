/** @jsxImportSource react */
import { qwikify$ } from "@builder.io/qwik-react";
import { useRef } from "react";
import {
  useLocale,
  useCalendarGrid,
  useCalendarCell,
  useCalendar,
  type AriaCalendarGridProps,
  type AriaCalendarCellProps,
  type AriaCalendarProps,
} from "react-aria";
import {
  type CalendarDate,
  createCalendar,
  getWeeksInMonth,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
// import {
//   Calendar as Cal,
//   CalendarGrid,
//   CalendarCell,
//   Button,
//   Heading,
//   CalendarGridBody,
//   CalendarGridHeader,
//   CalendarHeaderCell,
// } from "react-aria-components";

// // Create React component standard way
// function Component() {
//   return (
//     <Cal aria-label="Appointment date">
//       <header>
//         <Button slot="previous">◀</Button>
//         <Heading />
//         <Button slot="next">▶</Button>
//       </header>
//       <CalendarGrid>
//         <CalendarGridHeader>
//           {(day) => (
//             <CalendarHeaderCell style={{ color: "var(--blue)" }}>
//               {day}
//             </CalendarHeaderCell>
//           )}
//         </CalendarGridHeader>
//         <CalendarGridBody>
//           {(date) => <CalendarCell date={date} />}
//         </CalendarGridBody>
//       </CalendarGrid>
//     </Cal>
//   );
// }
import { Button } from "react-aria-components";
import { type CalendarState, useCalendarState } from "react-stately";
import { cn } from "~/utils";
type TCalendarGridProps = { state: CalendarState } & AriaCalendarGridProps;

function CalendarGrid({ state, ...props }: TCalendarGridProps) {
  const { locale } = useLocale();
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  return (
    <table {...gridProps}>
      <thead {...headerProps} className={cn(headerProps.className, "mb-2")}>
        <tr className="w-full">
          {weekDays.map((day, index) => (
            <th className="text-slate-400 text-xl" key={index}>
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: weeksInMonth }).map((_, weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
type TCalendarCellProps = AriaCalendarCellProps & { state: CalendarState };

function CalendarCell({ state, ...props }: TCalendarCellProps) {
  const ref = useRef(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    isUnavailable,
    formattedDate,
  } = useCalendarCell(props, state, ref);

  return (
    <td {...cellProps}>
      <div
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={`px-1 py-2 rounded-full outline-none ring-1 ring-transparent focus:ring-blue-500 flex flex-col items-center justify-start ${
          isSelected
            ? "bg-blue-500 text-white font-medium focus:ring-transparent"
            : "text-slate-500 bg-transparent focus:bg-slate-100 focus:text-slate-400"
        }`}
      >
        <span
          className={`${isDisabled ? "opacity-20" : ""} ${
            isUnavailable ? "text-red-500" : ""
          } leading-4 text-xl`}
        >
          {formattedDate}
        </span>
      </div>
    </td>
  );
}

function Cal(props: AriaCalendarProps<CalendarDate>) {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    minValue: today(getLocalTimeZone()).add({ days: 1 }),
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state);

  return (
    <div {...calendarProps} className="p-2 bg-white rounded-md shadow w-max">
      <div className="flex mb-2.5 text-slate-600 items-center place-content-between">
        <Button {...prevButtonProps} className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
        <h2 className="text-slate-700 text-xl">{title}</h2>
        <Button {...nextButtonProps} className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
      <CalendarGrid state={state} />
    </div>
  );
}

// Convert React component to Qwik component
export const Calendar = qwikify$(Cal, { eagerness: "load" });
