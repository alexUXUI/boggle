import {
  component$,
  useClientEffect$,
  $,
  useStore,
  useOnWindow,
} from "@builder.io/qwik";
import type { State } from "../index";

interface Props {
  board: string[];
  boardSize: number;
  state: State;
}

export const BoggleGrid = component$(({ board, boardSize, state }: Props) => {
  useClientEffect$(({ cleanup }) => {
    const clickHandler = (e: MouseEvent) => {
      if (!document.getElementById("board")?.contains(e.target as Node)) {
        state.selectedPath = [];
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Escape") {
        state.selectedPath = [];
      }
    };

    document.addEventListener("click", clickHandler);
    document.addEventListener("keydown", handleKeydown);

    cleanup(() => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("keydown", handleKeydown);
    });
  });

  const isInPath = (currentIndex: number) => {
    return state.selectedPath.reduce(
      (acc: boolean, element: { index: number; char: string }) => {
        if (
          element.index === currentIndex &&
          element.char === board[currentIndex]
        ) {
          return true;
        }
        return acc;
      },
      false
    );
  };

  const screenState = useStore({
    width: 0,
    squareWidth: 0,
  });

  const maxWidth = 500;

  useClientEffect$(() => {
    screenState.width = window.innerWidth - 10;
    screenState.squareWidth = Math.floor(screenState.width / boardSize);

    if (screenState.width > maxWidth) {
      screenState.width = maxWidth;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);
    }
  });

  useOnWindow(
    "resize",
    $(() => {
      screenState.width = window.innerWidth - 10;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);

      if (screenState.width > maxWidth) {
        screenState.width = maxWidth;
        screenState.squareWidth = Math.floor(screenState.width / boardSize);
      }
    })
  );

  return (
    <div class="w-full flex flex-col justify-center items-center mt-[20px] mb-[20px]">
      <main class="">
        <table
          id="board"
          class={`m-auto border-[1px] border-blue-800 bg-blue-800`}
        >
          {Array.from({ length: boardSize }, (idx, i) => (
            <tr class={`flex w-full`}>
              {Array.from({ length: boardSize }, (jdx, j) => {
                const currentIndex = i * boardSize + j;
                const isInSelectedPath = isInPath(currentIndex);
                const bgColor =
                  isInSelectedPath && state.wordFound
                    ? "bg-green-200"
                    : isInSelectedPath
                    ? "bg-blue-200"
                    : "bg-white";

                const addToFoundList = $(() => {
                  state.selectedPath = [
                    ...state.selectedPath,
                    {
                      index: i * boardSize + j,
                      char: board[i * boardSize + j],
                    },
                  ];
                });

                return (
                  <td
                    class={`${bgColor} border-[1px] border-blue-800 hover:cursor-pointer m-[1px] text-[40px] flex justify-center items-center rounded-sm`}
                    onClick$={() => {
                      // const currently selected path
                      const selectedPath = state.selectedPath;
                      const lastNodeInPath =
                        selectedPath[selectedPath.length - 1];

                      // neighors of the last node in the path
                      const neighbors = [
                        lastNodeInPath?.index - boardSize - 1,
                        lastNodeInPath?.index - boardSize,
                        lastNodeInPath?.index - boardSize + 1,
                        lastNodeInPath?.index - 1,
                        lastNodeInPath?.index + 1,
                        lastNodeInPath?.index + boardSize - 1,
                        lastNodeInPath?.index + boardSize,
                        lastNodeInPath?.index + boardSize + 1,
                      ];

                      // if the current node is not in the path, and it is a neighbor of the last node in the path
                      // add it to the path
                      if (isInSelectedPath) {
                        return;
                      } else if (
                        !lastNodeInPath ||
                        (lastNodeInPath && neighbors.includes(currentIndex))
                      ) {
                        addToFoundList();
                      }
                    }}
                    style={{
                      width: `${screenState.squareWidth}px`,
                      height: `${screenState.squareWidth}px`,
                      minHeight: `${50}px`,
                      minWidth: `${50}px`,
                    }}
                  >
                    {state.isLoaded
                      ? board[i * boardSize + j].toLocaleUpperCase()
                      : "x"}
                  </td>
                );
              })}
            </tr>
          ))}
        </table>
      </main>
    </div>
  );
});
