"use client";

import { useId, useState } from "react";

type NumericStepperProps = {
  name: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  label: string;
  suffix?: string;
};

export function NumericStepper({ name, min, max, step = 1, defaultValue, label, suffix }: NumericStepperProps) {
  const [value, setValue] = useState(defaultValue);
  const update = (next: number) => setValue(Math.min(max, Math.max(min, next)));

  return <div className="stepper-control" aria-label={label}>
    <button className="stepper-button" type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => update(value - step)}>−</button>
    <input name={name} type="number" min={min} max={max} step={step} value={value} onChange={event => update(Number(event.target.value))} aria-label={label} />
    {suffix && <span className="stepper-suffix" aria-hidden="true">{suffix}</span>}
    <button className="stepper-button" type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => update(value + step)}>+</button>
  </div>;
}

type WeightControlProps = {
  name: string;
  label: string;
  unit: string;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
};

export function WeightControl({ name, label, unit, defaultValue, min = 0, max = 200, step = 0.5 }: WeightControlProps) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue == null ? 20 : defaultValue);
  const [exactValue, setExactValue] = useState(defaultValue == null ? "" : String(defaultValue));

  function changeFromSlider(next: number) {
    const rounded = Number(next.toFixed(1));
    setValue(rounded);
    setExactValue(String(rounded));
  }

  function changeExact(next: string) {
    setExactValue(next);
    const parsed = Number(next);
    if (next !== "" && Number.isFinite(parsed)) setValue(Math.min(max, Math.max(min, parsed)));
  }

  return <div className="weight-control">
    <div className="weight-range-row"><input type="range" min={min} max={max} step={step} value={value} aria-label={`${label} quick adjustment`} onChange={event => changeFromSlider(Number(event.target.value))} /><span className="weight-readout">{exactValue || "—"} <span>{unit}</span></span></div>
    <div className="weight-exact"><label className="visually-hidden" htmlFor={inputId}>{label} exact value ({unit})</label><input id={inputId} name={name} type="number" min={min} max={max} step={step} value={exactValue} onChange={event => changeExact(event.target.value)} placeholder="Enter exact value" /></div>
  </div>;
}

const exerciseSuggestions = [
  "Barbell Back Squat", "Front Squat", "Leg Press", "Romanian Deadlift", "Conventional Deadlift",
  "Bench Press", "Incline Dumbbell Press", "Overhead Press", "Dumbbell Lateral Raise",
  "Pull-up", "Lat Pulldown", "Seated Cable Row", "Barbell Row", "Dumbbell Curl",
  "Triceps Pushdown", "Hip Thrust", "Bulgarian Split Squat", "Plank", "Push-up"
];

export function ExerciseNameField({ defaultValue = "", required = true }: { defaultValue?: string; required?: boolean }) {
  const listId = useId();
  return <>
    <input name="name" required={required} maxLength={80} defaultValue={defaultValue} placeholder="Search or type an exercise" list={listId} />
    <datalist id={listId}>{exerciseSuggestions.map(name => <option key={name} value={name} />)}</datalist>
  </>;
}

export function RestDurationField({ defaultValue = 90 }: { defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const options = [30, 60, 90, 120];
  return <div className="rest-duration-control">
    <div className="preset-row" role="group" aria-label="Common rest durations">
      {options.map(seconds => <button key={seconds} type="button" className={`preset-button ${value === seconds ? "selected" : ""}`} aria-pressed={value === seconds} onClick={() => setValue(seconds)}>{seconds}s</button>)}
      <button type="button" className={`preset-button ${!options.includes(value) ? "selected" : ""}`} aria-pressed={!options.includes(value)} onClick={() => setValue(defaultValue && !options.includes(defaultValue) ? defaultValue : 75)}>Custom</button>
    </div>
    <input className="rest-exact" name="restSeconds" type="number" min="0" max="600" step="5" value={value} onChange={event => setValue(Number(event.target.value))} aria-label="Rest duration in seconds" />
  </div>;
}
