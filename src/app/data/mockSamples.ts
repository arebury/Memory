import { Conversation, mockConversations } from "./mockData";
import { generateTranscriptionFor } from "./mockTranscriptionGenerator";

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
 *
 * Invariant — chats are always transcribed:
 *   A chat is, by definition, already textual. There is nothing to
 *   transcribe; we only re-flag and seed the `transcription[]` so the
 *   player can render it as a diarized conversation. Every builder runs
 *   its result through `normalizeChats` to enforce this invariant — even
 *   the "all pending" preset keeps chats fully transcribed.
 */

export interface MockSample {
  id: string;
  label: string;
  description: string;
  build: () => Conversation[];
}

const clone = (c: Conversation): Conversation => ({ ...c, aiCategories: c.aiCategories ? [...c.aiCategories] : undefined, transcription: c.transcription ? c.transcription.map((l) => ({ ...l })) : undefined });

const cloneAll = () => mockConversations.map(clone);

/* Two-step normaliser run by every preset:
     1. Chats always have transcription (their "audio" IS the text).
     2. There can never be analysis without transcription — the
        analysis is derived from the transcription, so a row with
        `hasAnalysis: true` but `hasTranscription: false` is
        contradictory. We drop the analysis flag in that case (a
        future update can re-enable it once a transcription lands). */
const normalizeChats = (list: Conversation[]): Conversation[] =>
  list.map((c) => {
    let next = c;
    if (next.channel === "chat") {
      const transcription =
        next.transcription && next.transcription.length > 0
          ? next.transcription
          : generateTranscriptionFor(next);
      next = { ...next, hasTranscription: true, transcription };
    }
    if (next.hasAnalysis && !next.hasTranscription) {
      next = { ...next, hasAnalysis: false, aiCategories: undefined };
    }
    return next;
  });

export const mockSamples: MockSample[] = [
  {
    id: "default",
    label: "Estado mixto",
    description: "Mezcla realista — el conjunto base con grabación, transcripción y análisis en distintos estados.",
    build: () => normalizeChats(cloneAll()),
  },
  {
    id: "all-pending",
    label: "Todo por procesar",
    description: "Llamadas sin transcripción ni análisis. Los chats mantienen transcripción (siempre la tienen por definición).",
    build: () =>
      normalizeChats(
        cloneAll().map((c) => {
          // Chats: transcription stays — only analysis/categories reset.
          if (c.channel === "chat") {
            return {
              ...c,
              hasAnalysis: false,
              aiCategories: undefined,
            };
          }
          // Calls: full reset.
          return {
            ...c,
            hasTranscription: false,
            hasAnalysis: false,
            hasDiarization: false,
            transcription: undefined,
            aiCategories: undefined,
          };
        }),
      ),
  },
  {
    id: "all-done",
    label: "Todo procesado",
    description: "Todo grabado, transcrito y analizado. Demuestra el estado C1 (todo procesado).",
    build: () =>
      normalizeChats(
        cloneAll().map((c) => ({
          ...c,
          hasRecording: c.channel === "llamada" ? true : c.hasRecording,
          hasTranscription: true,
          hasAnalysis: true,
        })),
      ),
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
    description: "Conjunto reducido a chats — todos transcritos por definición. Demuestra que el toggle de análisis arranca activado.",
    build: () => normalizeChats(cloneAll().filter((c) => c.channel === "chat")),
  },
  {
    id: "small",
    label: "Conjunto reducido",
    description: "Las primeras 8 conversaciones para vistas más cómodas en pantallas pequeñas.",
    build: () => normalizeChats(cloneAll().slice(0, 8)),
  },
];

export const defaultSampleId = "default";

export function getSample(id: string): MockSample {
  return mockSamples.find((s) => s.id === id) ?? mockSamples[0];
}
