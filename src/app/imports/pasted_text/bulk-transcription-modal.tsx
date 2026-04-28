Update the BulkTranscriptionModal component with the following behavioral 
and structural changes. Do not change the visual style. Focus exclusively 
on structure, logic, and content.

---

COMPONENT: BulkTranscriptionModal
FILE: src/components/BulkTranscriptionModal.tsx

---

## REMOVE COMPLETELY

- All diarization logic: the `mode` prop, diarization-related state, 
  diarization eligibility calculations, and diarization-specific labels.
  The modal now only handles transcription and analysis.
- The "Sin audio disponible" row from the breakdown. Conversations without 
  recording simply do not appear as eligible — no residual row.
- The diarization checkbox/option.

---

## NEW PROPS INTERFACE

```ts
interface BulkTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConversations: Conversation[];
  onConfirm: (options: { includeAnalysis: boolean }, eligibleIds: string[]) => Promise<void>;
}
```

---

## DATA MODEL — compute from selectedConversations

Derive these values at the top of the component:

```ts
const callConversations = selectedConversations.filter(c => c.channel === 'llamada');
const chatConversations = selectedConversations.filter(c => c.channel === 'chat');

const readyToTranscribe = callConversations.filter(c => c.hasRecording && !c.hasTranscription);
const alreadyTranscribed = callConversations.filter(c => c.hasTranscription);
const eligibleForAnalysisCalls = alreadyTranscribed.filter(c => !c.hasAnalysis);
const alreadyAnalyzedCalls = alreadyTranscribed.filter(c => c.hasAnalysis);

const eligibleForAnalysisChats = chatConversations.filter(c => !c.hasAnalysis);
const alreadyAnalyzedChats = chatConversations.filter(c => c.hasAnalysis);

const hasAnythingToProcess = readyToTranscribe.length > 0 
  || eligibleForAnalysisCalls.length > 0 
  || eligibleForAnalysisChats.length > 0;

const analysisIsOnlyAction = readyToTranscribe.length === 0 
  && (eligibleForAnalysisCalls.length > 0 || eligibleForAnalysisChats.length > 0);
```

Note: `hasAnalysis` may not exist yet in the Conversation type — add it 
as an optional boolean field.

---

## TOGGLE — "Incluir análisis"

- Default: OFF, EXCEPT when `analysisIsOnlyAction === true` → default ON.
- When OFF: analysis rows are hidden from the breakdown.
- When ON: analysis rows appear under the relevant section.
- Analysis includes: resumen + sentimiento.

---

## BREAKDOWN STRUCTURE — conditional and sectioned

Render the breakdown with labeled sections only when both channels are 
present. If only one channel, render rows without section headers.

### When only llamadas:
DESGLOSE
✓ Listas para transcribir           [readyToTranscribe.length]
— Ya transcritas (se omitirán)      [alreadyTranscribed.length]
[visible only when toggle ON:]
✓ Elegibles para análisis           [eligibleForAnalysisCalls.length]
— Ya analizadas (se omitirán)       [alreadyAnalyzedCalls.length]

### When only chats:
DESGLOSE
✓ Listas para análisis              [eligibleForAnalysisChats.length]
— Ya analizadas (se omitirán)       [alreadyAnalyzedChats.length]
No transcription section. Toggle starts ON.

### When both llamadas and chats:
DESGLOSE
LLAMADAS
✓ Listas para transcribir           [readyToTranscribe.length]
— Ya transcritas (se omitirán)      [alreadyTranscribed.length]
[toggle ON:]
✓ Elegibles para análisis           [eligibleForAnalysisCalls.length]
— Ya analizadas (se omitirán)       [alreadyAnalyzedCalls.length]
CHAT
✓ Listas para análisis              [eligibleForAnalysisChats.length]
— Ya analizadas (se omitirán)       [alreadyAnalyzedChats.length]

---

## CASUÍSTICAS — button label and state

### C1 — Nothing to process (everything already done)
- `hasAnythingToProcess === false`
- Hide toggle
- Hide warning banner
- Show neutral message: "No hay conversaciones pendientes de procesar"
- Primary button: disabled, text "Sin acciones disponibles"

### C2 — Only analysis needed (calls already transcribed, some without analysis)
- `readyToTranscribe.length === 0`, `eligibleForAnalysisCalls.length > 0`
- Toggle starts ON
- Button OFF: disabled
- Button ON: "Analizar N conversaciones" where N = eligibleForAnalysisCalls.length

### C3 — Only transcription needed (no prior analysis exists)
- `readyToTranscribe.length > 0`, `eligibleForAnalysisCalls.length === 0`
- Toggle starts OFF
- Button OFF: "Transcribir N grabaciones"
- Button ON: "Transcribir N grabaciones" (analysis runs after transcription automatically — do not change button label, it adds noise)

### C4 — Mixed: some to transcribe, some already transcribed without analysis
- `readyToTranscribe.length > 0`, `eligibleForAnalysisCalls.length > 0`
- Toggle starts OFF
- Button OFF: "Transcribir N grabaciones"
- Button ON: "Procesar N conversaciones" 
  where N = readyToTranscribe.length + eligibleForAnalysisCalls.length + eligibleForAnalysisChats.length

### C5 — Only chats selected
- `callConversations.length === 0`
- Hide transcription section entirely
- Toggle starts ON
- Button OFF: disabled
- Button ON: "Analizar N conversaciones" where N = eligibleForAnalysisChats.length

---

## WARNING BANNER

- Visible whenever the primary button is enabled (something will be processed).
- Hidden in C1.
- Dynamic text:
  - Transcription only: "Se procesarán N grabaciones. Este proceso generará costes."
  - Analysis only: "Se analizarán N conversaciones. Este proceso generará costes."
  - Both: "Se procesarán N conversaciones. Este proceso generará costes."
    where N = total being processed (transcribed + analyzed)
- Style: amber/yellow soft banner, warning icon, small text. Non-blocking.

---

## onConfirm CALL

Pass `includeAnalysis: boolean` and the array of eligible IDs:
- If toggle OFF: only `readyToTranscribe` IDs
- If toggle ON: `readyToTranscribe` + `eligibleForAnalysisCalls` + `eligibleForAnalysisChats` IDs

---

## ALSO UPDATE: BulkActionBar.tsx

- Remove all diarization references: `canDiarize`, diarization DropdownMenuItem, 
  "Generar diarización" option.
- Remove the "Acciones" dropdown entirely if only one action remains.
  Replace with a direct button: "Transcribir selección" that opens the modal.
- Update the modal call to remove the `mode` prop (now deprecated).

---

## ALSO UPDATE: ConversationsView.tsx

- Remove `ApplyRulesButton` import and usage entirely.
- Remove `handleRequestDiarization` and `onRequestDiarization` prop chain.
- Keep `handleRequestTranscription` and `processingIds` — these remain.