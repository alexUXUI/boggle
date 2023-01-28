import { $ } from '@builder.io/qwik';
export const confetti = import('canvas-confetti');

export const fireWorks = $(() => {
  confetti.then((module) => {
    const count = 200;
    const defaults = {};

    function fire(particleRatio: number, opts: any) {
      module.default(
        Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio) * 2,
          colors: ['#0000af', '#05b5eb', '#0051ba', '#230ee2', '#1f3bc6'],
        })
      );
    }

    fire(0.25, {
      spread: 46,
      startVelocity: 55,
      origin: { x: 0.5, y: 1 },
      decay: 0.87,
      scalar: 1.2,
    });
  });
});

export const confettiCelebration = $(() => {
  setTimeout(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    confetti.then((module) => {
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: ReturnType<typeof setTimeout> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        module.default(
          Object.assign({}, defaults, {
            particleCount,
            origin: {
              x: randomInRange(0.1, 0.3),
              y: Math.random() - 0.2,
            },
          })
        );
        module.default(
          Object.assign({}, defaults, {
            particleCount,
            origin: {
              x: randomInRange(0.7, 0.9),
              y: Math.random() - 0.2,
            },
          })
        );
      }, 250);
    });
  }, 100);
});
