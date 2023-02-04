export const fireworks = () => {
  setTimeout(() => {
    import('canvas-confetti').then((module) => {
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
  }, 200);
};
