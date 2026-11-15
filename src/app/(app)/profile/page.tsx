import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { saveMeasurement, saveProfile } from "@/app/actions";
import { NumericStepper, WeightControl } from "@/components/form-controls";
import { ActionForm, PendingSubmitButton } from "@/components/action-form";

const goals = [
  ["muscle_building", "Build muscle"], ["strength", "Get stronger"],
  ["fat_loss", "Lose body fat"], ["body_recomposition", "Recomposition"],
  ["athletic_performance", "Athletic performance"], ["general_fitness", "General fitness"]
];
const experienceLevels = [["beginner", "New"], ["intermediate", "Regular"], ["advanced", "Experienced"]];

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;
  const [profile, settings] = await Promise.all([
    prisma.fitnessProfile.findUnique({ where: { userId } }),
    prisma.userSettings.upsert({ where: { userId }, create: { userId }, update: {} })
  ]);
  const height = profile?.heightCm == null ? "" : settings.heightUnit === "ft" ? Number((profile.heightCm / 30.48).toFixed(1)) : profile.heightCm;

  return <>
    <h1>Fitness profile</h1>
    <p className="subtle page-intro">A few details help tailor your training. Sensitive information is optional.</p>
    <section className="panel profile-section">
      <div className="section-heading"><h2>Training preferences</h2><p className="subtle">Update your goals, schedule, and available equipment any time.</p></div>
      <ActionForm action={saveProfile} successMessage="Profile and preferences saved." className="form-stack profile-form">
        <fieldset className="choice-fieldset"><legend>Primary goal</legend><div className="choice-grid">{goals.map(([value, label]) => <label className="choice-card" key={value}><input type="radio" name="goal" value={value} defaultChecked={profile?.goal === value}/><span>{label}</span></label>)}</div></fieldset>
        <div className="form-grid-two">
          <fieldset className="choice-fieldset"><legend>Training experience</legend><div className="segmented-control choice-segments" role="radiogroup" aria-label="Training experience">{experienceLevels.map(([value, label]) => <label className="segment-label" key={value}><input type="radio" name="experience" value={value} defaultChecked={profile?.experience === value}/><span>{label}</span></label>)}</div></fieldset>
          <div className="field"><label htmlFor="activityLevel">General activity</label><select id="activityLevel" name="activityLevel" defaultValue={profile?.activityLevel || ""}><option value="">Choose if useful</option><option value="sedentary">Mostly seated</option><option value="light">Light movement</option><option value="moderate">Moderately active</option><option value="high">Very active</option></select></div>
        </div>
        <div className="form-grid-two">
          <div className="field"><label htmlFor="dateOfBirth">Date of birth <span className="subtle">(optional)</span></label><input id="dateOfBirth" name="dateOfBirth" type="date" max={new Date().toISOString().slice(0,10)} defaultValue={profile?.dateOfBirth?.toISOString().slice(0,10)}/></div>
          <div className="field"><label htmlFor="gender">Gender <span className="subtle">(optional)</span></label><select id="gender" name="gender" defaultValue={profile?.gender || ""}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Self-describe</option></select></div>
        </div>
        <div className="form-grid-two">
          <div className="field"><label htmlFor="height">Height ({settings.heightUnit}) <span className="subtle">(optional)</span></label><input id="height" name="height" type="number" step="0.1" min="1" max="280" defaultValue={height} placeholder={settings.heightUnit === "ft" ? "e.g. 5.8" : "e.g. 175"}/></div>
          <div className="field"><label>Training days per week</label><NumericStepper name="trainingDays" label="Training days per week" min={1} max={7} defaultValue={profile?.trainingDays ?? 3} suffix="days"/></div>
        </div>
        <div className="form-grid-two">
          <div className="field"><label>Typical session length</label><NumericStepper name="sessionMinutes" label="Typical session length" min={15} max={240} step={5} defaultValue={profile?.sessionMinutes ?? 60} suffix="min"/></div>
          <div className="field"><label htmlFor="timezone">Timezone</label><input id="timezone" name="timezone" defaultValue={settings.timezone} required/><span className="subtle field-help">Use an IANA timezone, such as Asia/Calcutta.</span></div>
        </div>
        <fieldset className="choice-fieldset"><legend>Available equipment <span className="subtle">(optional)</span></legend><div className="check-grid">{["Full gym", "Dumbbells", "Barbell", "Resistance bands", "Cable machine", "Bodyweight", "Other"].map(item => <label className="check-option" key={item}><input type="checkbox" name="equipment" value={item} defaultChecked={profile?.equipment.includes(item)}/><span>{item}</span></label>)}</div></fieldset>
        <div className="field"><label htmlFor="limitations">Movements to avoid or limitations <span className="subtle">(optional)</span></label><textarea id="limitations" name="limitations" maxLength={1000} rows={3} defaultValue={profile?.limitations || ""} placeholder="Only share details you are comfortable storing"/></div>
        <div className="form-grid-three">
          <div className="field"><label htmlFor="weekStarts">Week starts on</label><select id="weekStarts" name="weekStarts" defaultValue={settings.weekStarts}><option value="1">Monday</option><option value="0">Sunday</option></select></div>
          <div className="field"><label htmlFor="weightUnit">Weight units</label><select id="weightUnit" name="weightUnit" defaultValue={settings.weightUnit}><option value="kg">Kilograms</option><option value="lbs">Pounds</option></select></div>
          <div className="field"><label htmlFor="heightUnit">Height units</label><select id="heightUnit" name="heightUnit" defaultValue={settings.heightUnit}><option value="cm">Centimeters</option><option value="ft">Feet</option></select></div>
        </div>
        <PendingSubmitButton className="primary-button form-submit">Save preferences</PendingSubmitButton>
      </ActionForm>
    </section>

    <section className="panel profile-section">
      <div className="section-heading"><h2>Record a measurement</h2><p className="subtle">Weight is stored in kilograms for consistent charts and converted to your chosen unit.</p></div>
      <ActionForm action={saveMeasurement} successMessage="Measurement recorded." className="form-stack">
        <div className="field"><label>Body weight ({settings.weightUnit})</label><WeightControl name="weight" label="Body weight" unit={settings.weightUnit} min={1} max={500} step={0.1}/></div>
        <div className="field"><label htmlFor="bodyFat">Body fat <span className="subtle">(optional)</span></label><div className="unit-input"><input id="bodyFat" name="bodyFat" type="number" step="0.1" min="1" max="75" placeholder="e.g. 22.5"/><span>%</span></div></div>
        <div className="field"><label htmlFor="measurementNotes">Note <span className="subtle">(optional)</span></label><input id="measurementNotes" name="notes" maxLength={500} placeholder="Context for this measurement"/></div>
        <PendingSubmitButton className="outline-button form-submit">Save measurement</PendingSubmitButton>
      </ActionForm>
    </section>
  </>;
}
