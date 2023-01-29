import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return (
    <>
      <div>
        <section>
          <Slot />
        </section>
      </div>
      {/* <footer>
        <a href="https://www.twitter.com/alexux_ui" target="_blank">
          Made with ♡ by Alex Bennett
        </a>
      </footer> */}
    </>
  );
});
