export function lessonTopic(lesson: { eyebrow: string }) {
  return lesson.eyebrow.split("·").slice(1).join("·").trim();
}

export function toggleTopicPin(pins: string[], topic: string, limit = 2) {
  if (pins.includes(topic)) return pins.filter(pin => pin !== topic);
  return pins.length < limit ? [...pins, topic] : pins;
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

export function firstTopicLessonIndex<T extends { eyebrow: string }>(lessons: T[], topic: string) {
  return lessons.findIndex(lesson => lessonTopic(lesson) === topic);
}

export function pinnedLessonIndex<T extends { title: string }>(lessons: T[], title: string) {
  return lessons.findIndex(lesson => lesson.title === title);
}

/** Upgrade earlier topic-only pins while keeping new pins tied to one lesson. */
export function restoreLessonPins(raw: string | null, courses: Record<string, { title: string; eyebrow: string }[]>, limit = 2) {
  const restored: Record<string, string[]> = {};
  try {
    const saved = JSON.parse(raw ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return restored;
    for (const [language, course] of Object.entries(courses)) {
      if (!Array.isArray(saved[language])) continue;
      const resolved = saved[language].flatMap((value: unknown) => {
        if (typeof value !== "string") return [];
        const lesson = course.find(item => item.title === value) ?? course.find(item => lessonTopic(item) === value);
        return lesson ? [lesson.title] : [];
      });
      restored[language] = [...new Set(resolved as string[])].slice(0, limit);
    }
  } catch { /* Ignore invalid or unavailable browser storage. */ }
  return restored;
}
