import { createContextId } from "@builder.io/qwik";
import type {
  BoardState,
  DictionaryState,
  GameState,
  AnswersState,
  WebWorkerState,
} from "./models";

export const BoardCtx = createContextId<BoardState>("board-context");
export const DictionaryCtx = createContextId<DictionaryState>("dictionary");
export const GameCtx = createContextId<GameState>("game-context");
export const AnswersCtx = createContextId<AnswersState>("answers-context");
export const WorkerCtx = createContextId<WebWorkerState>("worker-context");
