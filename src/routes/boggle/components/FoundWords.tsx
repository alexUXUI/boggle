import { component$ } from "@builder.io/qwik";

interface Props {
  words: string[];
  minWordLength: number;
}

export const FoundWords = component$(({ words, minWordLength }: Props) => {
  const filtered = words.filter(
    (value: string) => value.length >= minWordLength
  );

  return (
    <details
      open={Boolean(filtered.length)}
      class="p-4 bg-white w-full flex justify-center items-center flex-col rounded-md"
    >
      <summary class="text-[25px]">
        Found Words: {filtered.length > 0 ? filtered.length : 0}
      </summary>
      <ul class="pt-4 flex flex-wrap w-full">
        {filtered.map((answer) => (
          <li class="text-[20px] w-[120px]">{answer}</li>
        ))}
      </ul>
    </details>
  );
});
