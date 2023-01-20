/* tslint:disable */
/* eslint-disable */
/**
* @returns {Promise<Array<any>>}
*/
export function get_dictionary(): Promise<Array<any>>;
/**
* @returns {Promise<Array<any>>}
*/
export function run_the_world(): Promise<Array<any>>;
/**
*/
export function test_trie(): void;
/**
* @param {string} name
*/
export function greet(name: string): void;
/**
* @returns {string}
*/
export function gerenate_board_string(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_dictionary: () => number;
  readonly run_the_world: () => number;
  readonly test_trie: () => void;
  readonly greet: (a: number, b: number) => void;
  readonly gerenate_board_string: (a: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h240f7f49a2078b3a: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h15f356e84c8d632a: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
