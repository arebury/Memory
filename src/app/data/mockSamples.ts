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
  {
    id: "multi-recording",
    label: "Conversaciones multi-grabación",
    description: "Llamadas que pasaron por IVR con transferencia entre grupos — cada tramo es una grabación distinta. El usuario debe escoger cuál transcribir.",
    build: () => {
      // Take the first 6 calls and pre-load 2-4 recordings each.
      const list = cloneAll();
      const calls = list.filter((c) => c.channel === "llamada");
      const seedSegments: Array<{ count: number; legs: { startTime: string; duration: string; label: string }[] }> = [
        {
          count: 4,
          legs: [
            { startTime: "12:50", duration: "00:42", label: "IVR menú principal" },
            { startTime: "12:51", duration: "02:18", label: "Soporte Taller" },
            { startTime: "12:53", duration: "00:35", label: "IVR retorno" },
            { startTime: "12:54", duration: "01:30", label: "Atención al cliente" },
          ],
        },
        {
          count: 3,
          legs: [
            { startTime: "10:14", duration: "01:05", label: "IVR menú principal" },
            { startTime: "10:15", duration: "03:22", label: "Comercial" },
            { startTime: "10:18", duration: "00:48", label: "Retención" },
          ],
        },
        {
          count: 2,
          legs: [
            { startTime: "09:32", duration: "00:18", label: "IVR menú principal" },
            { startTime: "09:33", duration: "04:12", label: "Soporte Técnico" },
          ],
        },
        {
          count: 4,
          legs: [
            { startTime: "15:01", duration: "00:55", label: "IVR menú principal" },
            { startTime: "15:02", duration: "02:48", label: "Facturación" },
            { startTime: "15:05", duration: "00:32", label: "IVR retorno" },
            { startTime: "15:06", duration: "01:11", label: "Atención al cliente" },
          ],
        },
        {
          count: 2,
          legs: [
            { startTime: "16:40", duration: "00:22", label: "IVR menú principal" },
            { startTime: "16:41", duration: "05:08", label: "Soporte Taller" },
          ],
        },
      ];
      const segmentTargets = new Set(calls.slice(0, seedSegments.length).map((c) => c.id));
      let seedIdx = 0;
      const out = list.map((c) => {
        if (!segmentTargets.has(c.id)) return c;
        const seed = seedSegments[seedIdx++];
        const recordings = seed.legs.slice(0, seed.count).map((leg, i) => ({
          id: `${c.id}-rec-${i + 1}`,
          startTime: leg.startTime,
          duration: leg.duration,
          label: leg.label,
        }));
        return {
          ...c,
          hasRecording: true,
          // Force untranscribed so the user has to pick a recording to transcribe.
          hasTranscription: false,
          hasAnalysis: false,
          transcription: undefined,
          recordings,
        };
      });
      return normalizeChats(out);
    },
  },
  {
    id: "failed-transcriptions",
    label: "Errores de transcripción",
    description: "Algunas llamadas fallaron al transcribir (audio en silencio, formato no soportado, error de servicio). El usuario ve la fila en rojo + toast con 'Ver fallidas'.",
    build: () => {
      // Reset like 'all-pending' to give the user a clean canvas, then
      // mark ~⅓ of the calls as failed.
      const list = cloneAll().map((c) => {
        if (c.channel === "chat") return { ...c, hasAnalysis: false, aiCategories: undefined };
        return {
          ...c,
          hasRecording: true,
          hasTranscription: false,
          hasAnalysis: false,
          hasDiarization: false,
          transcription: undefined,
          aiCategories: undefined,
        };
      });
      const calls = list.filter((c) => c.channel === "llamada");
      const failedSet = new Set(calls.filter((_, idx) => idx % 3 === 1).map((c) => c.id));
      const out = list.map((c) =>
        failedSet.has(c.id) ? { ...c, hasFailedTranscription: true } : c,
      );
      return normalizeChats(out);
    },
  },
];

export const defaultSampleId = "default";

export function getSample(id: string): MockSample {
  return mockSamples.find((s) => s.id === id) ?? mockSamples[0];
}
