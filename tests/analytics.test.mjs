import test from "node:test";
import assert from "node:assert/strict";
import { calculateScheduledStreak, calculateTrainingVolume } from "../src/lib/analytics.ts";
import { fromKilograms, toKilograms } from "../src/lib/units.ts";

test("rest days do not break a scheduled workout streak", () => {
  const plan = [{weekday:0,isRest:false},{weekday:1,isRest:true},{weekday:2,isRest:false},{weekday:3,isRest:true},{weekday:4,isRest:false},{weekday:5,isRest:true},{weekday:6,isRest:true}];
  const result = calculateScheduledStreak(plan, new Set(["2026-11-13","2026-11-11","2026-11-09"]), "2026-11-14");
  assert.deepEqual(result, {current:3,longest:3});
});

test("a missed scheduled day ends the current streak but preserves the longest", () => {
  const plan = [{weekday:0,isRest:false},{weekday:1,isRest:false},{weekday:2,isRest:false},{weekday:3,isRest:false},{weekday:4,isRest:false},{weekday:5,isRest:true},{weekday:6,isRest:true}];
  const result = calculateScheduledStreak(plan, new Set(["2026-11-13","2026-11-11","2026-11-10","2026-11-09"]), "2026-11-14");
  assert.deepEqual(result, {current:1,longest:3});
});

test("training volume includes completed sets with actual values only", () => {
  const volume = calculateTrainingVolume([{sets:[{completed:true,actualReps:10,actualKg:40},{completed:false,actualReps:10,actualKg:60},{completed:true,actualReps:null,actualKg:80}]}]);
  assert.equal(volume, 400);
});

test("pounds are converted to canonical kilograms and back", () => {
  const kg = toKilograms(220.462, "lbs");
  assert.ok(Math.abs(kg - 100) < 0.01);
  assert.ok(Math.abs(fromKilograms(kg, "lbs") - 220.462) < 0.01);
});
