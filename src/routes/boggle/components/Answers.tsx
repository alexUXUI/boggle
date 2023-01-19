import { component$ } from "@builder.io/qwik";

interface Props {
  answers: string[];
  minWordLength: number;
  foundWords: string[];
}

export const Answers = component$(
  ({ answers, minWordLength, foundWords }: Props) => {
    const filtered = answers.filter(
      (value: string) => value.length >= minWordLength
    );

    return (
      <details class="p-4 bg-white w-full flex justify-center items-center flex-col rounded-md">
        <summary class="text-[25px]">
          Answers: {filtered.length > 0 ? filtered.length : null}
        </summary>
        <ul class="pt-4 flex flex-wrap w-full">
          {filtered.map((answer) => (
            <li
              class={`text-[20px] w-[32%] ${
                foundWords.includes(answer) ? "line-through" : ""
              }`}
            >
              {answer}
            </li>
          ))}
        </ul>
      </details>
    );
  }
);
