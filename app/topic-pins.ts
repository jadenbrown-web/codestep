export function lessonTopic(lesson: { eyebrow: string }) {
  return lesson.eyebrow.split("·").slice(1).join("·").trim();
}

export function toggleTopicPin(pins: string[], topic: string) {
  if (pins.includes(topic)) return pins.filter(pin => pin !== topic);
  return pins.length < 2 ? [...pins, topic] : pins;
}

export function restoreTopicPins(raw: string | null, available: Record<string, string[]>) {
  const restored: Record<string, string[]> = {};
  try {
    const saved = JSON.parse(raw ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return restored;
    for (const [language, topics] of Object.entries(available)) {
      const pins = saved[language];
      if (Array.isArray(pins)) restored[language] = [...new Set(pins.filter((topic): topic is string => typeof topic === "string" && topics.includes(topic)))].slice(0, 2);
    }
  } catch { /* Ignore invalid or unavailable browser storage. */ }
  return restored;
}

export function filterTopicLessons<T extends { eyebrow: string }>(lessons: T[], topic: string | null) {
  return lessons.flatMap((lesson, index) => !topic || lessonTopic(lesson) === topic ? [{ lesson, index }] : []);
}
