export type LessonId = "lesson1" | "lesson2" | "lesson3" | "lesson4" | "quiz";

export interface SubSection {
  id: string;
  title: string;
  content: string[];
  keyTakeaways?: string[];
  tips?: string;
}

export interface LessonContent {
  id: LessonId;
  title: string;
  subtitle: string;
  description: string;
  sections: SubSection[];
}

export interface SourceDocument {
  id: string;
  title: string;
  year: number;
  country: "KOR" | "JPN";
  type: "document" | "map";
  description: string;
  significance: string;
  highlightQuote: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ReviewResponse {
  sufficientSources: boolean;
  detectedSources: string[];
  missingSourcesCount: number;
  factScore: number;
  peaceScore: number;
  lineLimitPassed: boolean;
  feedbackKorean: string;
  revisionKorean: string;
  coAuthorJapaneseViewpoint: string;
}

export interface ReflectionResponse {
  title: string;
  content: string;
  keyMessage: string;
  tags: string[];
}

