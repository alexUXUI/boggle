import { createContext } from '@builder.io/qwik';
import type {
  BoardState,
  DictionaryState,
  GameState,
  AnswersState,
  WebWorkerState,
} from './models';

export const BoardCtx = createContext<BoardState>('board-context');
export const DictionaryCtx = createContext<DictionaryState>('dictionary');
export const GameCtx = createContext<GameState>('game-context');
export const AnswersCtx = createContext<AnswersState>('answers-context');
export const WorkerCtx = createContext<WebWorkerState>('worker-context');
