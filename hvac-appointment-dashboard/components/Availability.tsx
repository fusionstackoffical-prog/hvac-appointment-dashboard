async function saveAvailability() {
  setSaving(true);
  setMessage("");

  const rows = days.map((day) => ({
    day_of_week: day.dayOfWeek,
    start_time: day.start + ":00",
    end_time: day.end + ":00",
    enabled: day.enabled,
  }));

  const { error } = await supabase
    .from("availability")
    .upsert(rows, {
      onConflict: "day_of_week",
    });

  if (error) {
    console.error("SUPABASE SAVE ERROR:", error);
    setMessage(`Error: ${error.message}`);
  } else {
    setMessage("Saved successfully to Supabase.");
  }

  setSaving(false);
}