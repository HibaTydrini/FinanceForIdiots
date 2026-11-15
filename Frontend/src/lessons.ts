// Look up a lesson from data/learningPath.json by its topic id.
import data from "./data/learningPath.json";
import type { Topic } from "./TopicSlides";

const byId = new Map<string, Topic>();
for (const chapter of data.chapters) {
  for (const topic of chapter.topics as Topic[]) byId.set(topic.id, topic);
}

export function topicById(id: string): Topic | undefined {
  return byId.get(id);
}
