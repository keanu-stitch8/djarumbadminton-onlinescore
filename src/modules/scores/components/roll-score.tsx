"use client";

import { Fragment, useState, type CSSProperties } from "react";

// A higher score rolls up like an odometer (the new value rises from below, the old one leaves at the
// top); a lower score, such as an umpire's correction, rolls down. The move is short and fades both
// values, so a board full of changing courts stays calm to watch. The parent cell must be
// `relative overflow-hidden`. The value in flow keeps the cell's size and stays hidden until the roll
// ends. The first render shows the value without a roll, and reduced motion ends the roll at once
// (see globals.css).
export function RollScore({ value }: { value: string }) {
  const [state, setState] = useState({ value, previous: null as string | null, down: false, rolls: 0 });
  if (state.value !== value) setState({ value, previous: state.value, down: Number(value) < Number(state.value), rolls: state.rolls + 1 });

  const rolling = state.previous !== null;
  const layer = "pointer-events-none absolute inset-0 grid place-items-center";
  // "—" is NaN, so a roll from or to an empty score compares false and goes up.
  const direction = { "--roll-dir": state.down ? -1 : 1 } as CSSProperties;
  return <>
    <span className={rolling ? "invisible" : undefined}>{state.value}</span>
    {rolling && <Fragment key={state.rolls}>
      <span aria-hidden="true" className={`${layer} animate-roll-out`} style={direction}>{state.previous}</span>
      <span aria-hidden="true" className={`${layer} animate-roll-in`} style={direction} onAnimationEnd={() => setState((s) => ({ ...s, previous: null }))}>{state.value}</span>
    </Fragment>}
  </>;
}
