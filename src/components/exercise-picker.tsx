"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import exercises from "@/data/exercises.json";

type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  image: string | null;
};
const exerciseCatalog = exercises as unknown as Exercise[];

const equipmentLabels: Record<string, string> = {
  bodyweight: "Bodyweight / no equipment", ab_crunch_machine: "Ab crunch machine", ab_wheel: "Ab wheel", air_bike: "Air bike",
  assisted_pullup_machine: "Assisted pull-up machine", back_extension_machine: "Back extension machine",
  barbell: "Barbell", battle_rope: "Battle rope", bicep_curl_machine: "Bicep curl machine", bicycle: "Bicycle",
  bosu_ball: "BOSU ball", cable: "Cable", chest_fly_machine: "Chest fly machine", chest_press_machine: "Chest press machine",
  climbing_rope: "Climbing rope", dip_machine: "Dip machine", dip_station: "Dip station", donkey_calf_raise_machine: "Donkey calf raise machine",
  dumbbell: "Dumbbell", elliptical: "Elliptical", ez_bar: "EZ bar", flat_bench: "Flat bench", glute_ham_developer: "Glute-ham developer",
  hack_squat: "Hack squat machine", hip_abduction_machine: "Hip abduction machine", hip_adduction_machine: "Hip adduction machine",
  hip_thrust_machine: "Hip thrust machine", jump_rope: "Jump rope", kettlebell: "Kettlebell", lat_pulldown_machine: "Lat pulldown machine",
  leg_curl: "Leg curl machine", leg_extension: "Leg extension machine", leg_press: "Leg press machine", loop_band: "Loop band",
  medicine_ball: "Medicine ball", pec_deck: "Pec deck", plate_loaded_dip_machine: "Plate-loaded dip machine",
  plate_loaded_lateral_raise_machine: "Plate-loaded lateral raise machine", plates: "Weight plates", plyo_box: "Plyo box",
  preacher_curl_machine: "Preacher curl machine", pull_up_bar: "Pull-up bar", resistance_band: "Resistance band", reverse_fly_machine: "Reverse fly machine",
  rings: "Gymnastic rings", rower: "Rower", sandbag: "Sandbag", seated_calf_raise_machine: "Seated calf raise machine",
  seated_row_machine: "Seated row machine", shoulder_press_machine: "Shoulder press machine", shrug_machine: "Shrug machine",
  ski_erg: "Ski erg", slam_ball: "Slam ball", sled: "Sled", smith_machine: "Smith machine", stability_ball: "Stability ball",
  stair_climber: "Stair climber", standing_calf_raise_machine: "Standing calf raise machine", stationary_bike: "Stationary bike",
  suspension_trainer: "Suspension trainer", trap_bar: "Trap bar", treadmill: "Treadmill", tricep_extension_machine: "Triceps extension machine",
  wall_ball: "Wall ball", wrist_roller: "Wrist roller"
};

const equipmentValues = [...new Set(["bodyweight", ...exerciseCatalog.map(exercise => exercise.equipment).filter((value): value is string => Boolean(value))])]
  .sort((a, b) => equipmentName(a).localeCompare(equipmentName(b)));
const muscleLabels: Record<string, string> = {
  abs: "Abs", adductors: "Adductors", biceps: "Biceps", brachialis: "Brachialis", brachioradialis: "Forearms",
  calves: "Calves", deltoids: "Shoulders", gluteus_maximus: "Glutes", gluteus_medius: "Glute medius",
  hamstrings: "Hamstrings", hip_flexors: "Hip flexors", latissimus_dorsi: "Lats", obliques: "Obliques",
  pectoralis_major: "Chest", quadriceps: "Quads", rectus_abdominis: "Abs", soleus: "Soleus",
  gastrocnemius: "Calves", triceps: "Triceps", trapezius: "Traps", erector_spinae: "Lower back",
  tibialis_anterior: "Shins", transverse_abdominis: "Deep core", serratus_anterior: "Serratus", forearms: "Forearms",
  infraspinatus: "Rotator cuff", teres_major: "Teres major", teres_minor: "Rotator cuff", rhomboids: "Rhomboids",
  biceps_brachii: "Biceps", triceps_brachii: "Triceps", forearm_flexors: "Forearms", forearm_extensors: "Forearms",
  anterior_deltoid: "Front delts", lateral_deltoid: "Side delts", posterior_deltoid: "Rear delts"
};

function titleCase(value: string) {
  return value.split("_").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function muscleName(value: string) {
  return muscleLabels[value] ?? titleCase(value);
}

function equipmentName(value: string) {
  return equipmentLabels[value] ?? titleCase(value);
}

function muscleGroupFor(exercise: Exercise) {
  return exercise.primaryMuscles.map(muscleName).join(", ").slice(0, 50);
}

export function ExercisePicker({ defaultName = "", defaultMuscleGroup = "", defaultEquipment = "" }: {
  defaultName?: string;
  defaultMuscleGroup?: string;
  defaultEquipment?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [muscleGroup, setMuscleGroup] = useState(defaultMuscleGroup);
  const [equipment, setEquipment] = useState(defaultEquipment);
  const [query, setQuery] = useState(defaultName);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const matches = normalized
      ? exerciseCatalog.filter(exercise => [exercise.name, exercise.bodyPart, ...exercise.primaryMuscles, ...exercise.secondaryMuscles, exercise.equipment ?? ""].join(" ").toLocaleLowerCase().includes(normalized))
      : exerciseCatalog;
    return matches.slice(0, 8);
  }, [query]);

  function choose(exercise: Exercise) {
    setName(exercise.name);
    setQuery(exercise.name);
    setMuscleGroup(muscleGroupFor(exercise));
    setEquipment(exercise.equipment ?? "");
    setSelected(exercise);
    setIsOpen(false);
  }

  const standardEquipment = equipmentValues.includes(equipment);
  const equipmentMode = !equipment ? "" : standardEquipment ? equipment : "other";

  return <>
    <div className="exercise-catalog-search">
      <input name="name" required maxLength={80} value={name} placeholder="Search or type an exercise" autoComplete="off" aria-autocomplete="list" aria-expanded={isOpen} onFocus={() => setIsOpen(true)} onChange={event => {
        const value = event.target.value;
        setName(value);
        setQuery(value);
        setSelected(null);
        setIsOpen(true);
      }} onBlur={() => window.setTimeout(() => setIsOpen(false), 150)} />
      {isOpen && <ul className="exercise-catalog-results" role="listbox" aria-label="Exercise suggestions">
        {results.length ? results.map(exercise => <li key={exercise.id} role="option" aria-selected={false}>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(exercise)}>
          <span className="exercise-result-image">{exercise.image && <Image src={exercise.image} alt="" width={48} height={48}/>}</span>
            <span><strong>{exercise.name}</strong><small>{exercise.primaryMuscles.slice(0, 3).map(muscleName).join(" · ") || titleCase(exercise.bodyPart)}</small></span>
          </button>
        </li>) : <li className="exercise-catalog-no-results">No matches. You can keep your custom exercise name.</li>}
      </ul>}
      {selected?.image && <div className="exercise-selection-preview"><Image src={selected.image} alt={`${selected.name} exercise illustration`} width={84} height={84}/><span><strong>{selected.primaryMuscles.map(muscleName).join(", ")}</strong><small>Primary muscles</small></span></div>}
    </div>
    <div className="form-grid-two">
      <div className="field"><label>Muscle group</label><input name="muscleGroup" maxLength={50} value={muscleGroup} onChange={event => setMuscleGroup(event.target.value)} placeholder="Filled from exercise"/></div>
      <div className="field"><label>Equipment</label>
        <select aria-label="Equipment" value={equipmentMode} onChange={event => setEquipment(event.target.value === "other" ? "" : event.target.value)}>
          <option value="">Select equipment</option>
          {equipmentValues.map(value => <option value={value} key={value}>{equipmentName(value)}</option>)}
          <option value="other">Other</option>
        </select>
        {equipmentMode === "other" && <input className="custom-equipment-input" maxLength={50} value={equipment} onChange={event => setEquipment(event.target.value)} placeholder="Enter equipment" aria-label="Custom equipment"/>}
        <input type="hidden" name="equipment" value={equipment}/>
      </div>
    </div>
    {selected && <p className="exercise-picker-credit">Exercise data by <a href="https://repdb.co" target="_blank" rel="nofollow noreferrer">RepDB</a></p>}
  </>;
}
