import {
  component$,
  useClientEffect$,
  $,
  useStore,
  useOnWindow,
  useTask$,
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
    screenState.width = window.innerWidth - 20;
    screenState.squareWidth = Math.floor(screenState.width / boardSize);

    if (screenState.width > maxWidth) {
      screenState.width = maxWidth;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);
    }
  });

  useOnWindow(
    "resize",
    $(() => {
      screenState.width = window.innerWidth - 20;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);

      if (screenState.width > maxWidth) {
        screenState.width = maxWidth;
        screenState.squareWidth = Math.floor(screenState.width / boardSize);
      }
    })
  );

  useTask$(({ track }) => {
    track(() => state.boardSize);
    if (typeof window !== "undefined") {
      screenState.width = window.innerWidth - 20;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);

      if (screenState.width > maxWidth) {
        screenState.width = maxWidth;
        screenState.squareWidth = Math.floor(screenState.width / boardSize);
      }
    }
  });

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

                // on touch end, remove the .stop-scrolling class from the body
                useOnWindow(
                  "touchend",
                  $(() => {
                    document.body.classList.remove("stop-scrolling");
                  })
                );

                return (
                  <td
                    class={`${bgColor} border-[1px] border-blue-800 hover:cursor-pointer m-[1px] text-[40px] flex justify-center items-center rounded-sm`}
                    onTouchMove$={(e) => {
                      // add the .stop-scrolling class to the body
                      document.body.classList.add("stop-scrolling");
                      const element = document.elementFromPoint(
                        e.targetTouches[0].clientX,
                        e.targetTouches[0].clientY
                      );
                      const childButtonElement = element?.children[0];
                      if (childButtonElement) {
                        const buttonText = childButtonElement.textContent;
                        console.log(buttonText);
                        // get the data-cell-index from the button
                        const cellIndex = Number.parseInt(
                          childButtonElement.getAttribute("data-cell-index")!
                        );
                        const cellChar =
                          childButtonElement.getAttribute("data-cell-char");
                        const cellIsInPath = childButtonElement.getAttribute(
                          "data-cell-is-in-path"
                        );

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
                        if (cellIsInPath) {
                          // deselect the node and all the nodes after it
                          const index = selectedPath.findIndex(
                            (element) => element.index === cellIndex
                          );
                          state.selectedPath = selectedPath.slice(0, index);

                          return;
                        } else if (
                          !lastNodeInPath ||
                          (lastNodeInPath && neighbors.includes(cellIndex))
                        ) {
                          state.selectedPath = [
                            ...state.selectedPath,
                            {
                              index: cellIndex,
                              char: cellChar!,
                            },
                          ];
                        }
                      }
                    }}
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
                        // deselect the node and all the nodes after it
                        const index = selectedPath.findIndex(
                          (element) => element.index === currentIndex
                        );
                        state.selectedPath = selectedPath.slice(0, index);

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
                      minHeight: `19%`,
                      minWidth: `19%`,
                    }}
                  >
                    <button
                      data-cell-index={currentIndex}
                      data-cell-char={board[i * boardSize + j]}
                      data-cell-is-in-path={isInSelectedPath}
                      class="h-[40px] leading-[40px] p-0 m-0 "
                    >
                      {state.isLoaded
                        ? board[i * boardSize + j].toLocaleUpperCase()
                        : "x"}
                    </button>
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
