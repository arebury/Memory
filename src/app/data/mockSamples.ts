import { Conversation, mockConversations } from "./mockData";

/**
 * Mock-data samples · prototype-only feature.
 *
 * Each sample is a curated re-shaping of `mockConversations` that demos
 * the prototype in a different end-state. The conversations page exposes
 * a small switcher next to the UX-validation easter-egg so reviewers can
 * cycle through scenarios without reloading test data manually.
 *
 * The base `Conversation[]` list is treated as immutable — each builder
 * returns a fresh array of cloned entries.
 */

export interface MockSample {
  id: string;
  label: string;
  description: string;
  build: () => Conversation[];
}

const clone = (c: Conversation): Conversation => ({ ...c, aiCategories: c.aiCategories ? [...c.aiCategories] : undefined, transcription: c.transcription ? c.transcription.map((l) => ({ ...l })) : undefined });

const cloneAll = () => mockConversations.map(clone);

export const mockSamples: MockSample[] = [
  {
    id: "default",
    label: "Estado mixto",
    description: "Mezcla realista — el conjunto base con grabación, transcripción y análisis en distintos estados.",
    build: () => cloneAll(),
  },
  {
    id: "all-pending",
    label: "Todo por procesar",
    description: "Sin transcripciones ni análisis. Útil para demostrar la transcripción masiva al máximo.",
    build: () =>
      cloneAll().map((c) => ({
        ...c,
        hasTranscription: false,
        hasAnalysis: false,
        hasDiarization: false,
        transcription: undefined,
        aiCategories: undefined,
      })),
  },
  {
    id: "all-done",
    label: "Todo procesado",
    description: "Cada conversación con grabación tiene transcripción y análisis. Demuestra el estado C1 (todo procesado).",
    build: () =>
      cloneAll().map((c) => ({
        ...c,
        hasRecording: c.channel === "llamada" ? true : c.hasRecording,
        hasTranscription: c.channel === "chat" ? false : true,
        hasAnalysis: true,
      })),
  },
  {
    id: "calls-only-untranscribed",
    label: "Solo llamadas pendientes",
    description: "Solo llamadas con grabación pero sin transcripción. Perfecto para mostrar el flujo principal de transcribir.",
    build: () =>
      cloneAll()
        .filter((c) => c.channel === "llamada")
        .map((c) => ({
          ...c,
          hasRecording: true,
          hasTranscription: false,
          hasAnalysis: false,
          transcription: undefined,
        })),
  },
  {
    id: "chats-only",
    label: "Solo chats",
    description: "Conjunto reducido a chats. Demuestra que el toggle de análisis se activa por defecto cuando no hay nada que transcribir.",
    build: () => cloneAll().filter((c) => c.channel === "chat"),
  },
  {
    id: "small",
    label: "Conjunto reducido",
    description: "Las primeras 8 conversaciones para vistas más cómodas en pantallas pequeñas.",
    build: () => cloneAll().slice(0, 8),
  },
];

export const defaultSampleId = "default";

export function getSample(id: string): MockSample {
  return mockSamples.find((s) => s.id === id) ?? mockSamples[0];
}
