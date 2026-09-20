/** Photographic wings: continuous flight, quiet resting beats, and two on activation. */
export function initButterflies(): void {
  document
    .querySelectorAll<HTMLElement>("[data-butterfly]")
    .forEach((element) => {
      const toggle = element.querySelector<HTMLButtonElement>(
        "[data-butterfly-toggle]",
      )!;
      const flutter = element.querySelector<HTMLButtonElement>(
        "[data-butterfly-flutter]",
      )!;
      const wings = element.querySelectorAll<SVGGElement>(".butterfly-wing");
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let paused = false;
      let inView = false;
      let beats: Animation[] = [];
      const stopBeats = () => {
        beats.forEach((animation) => animation.cancel());
        beats = [];
        delete element.dataset.fluttering;
      };
      const update = () => {
        const available = inView && !document.hidden && !motion.matches;
        if (!available) stopBeats();
        element.dataset.moving = String(!paused && available);
        flutter.hidden =
          element.dataset.arrival !== "settled" || motion.matches;
        toggle.hidden = motion.matches;
        toggle.setAttribute(
          "aria-label",
          paused ? "Resume butterfly animation" : "Pause butterfly animation",
        );
        toggle.querySelector("span")!.textContent = paused ? "▷" : "Ⅱ";
      };
      flutter.addEventListener("click", () => {
        if (motion.matches || !inView || document.hidden) return;
        stopBeats();
        element.dataset.fluttering = "true";
        beats = Array.from(wings, (wing, index) =>
          wing.animate(
            [
              { transform: "scaleX(1) skewY(0deg)" },
              {
                transform: `scaleX(${index ? 0.38 : 0.3}) skewY(${index ? -8 : 10}deg)`,
                offset: 0.42,
              },
              { transform: "scaleX(1) skewY(0deg)" },
            ],
            {
              duration: 420,
              iterations: 2,
              easing: "cubic-bezier(.35,0,.65,1)",
            },
          ),
        );
        const current = beats;
        void Promise.all(current.map((animation) => animation.finished))
          .then(() => {
            if (beats === current) stopBeats();
          })
          .catch(() => {
            /* Cancellation is expected on pause, scroll or reduced motion. */
          });
      });
      toggle.addEventListener("click", () => {
        paused = !paused;
        stopBeats();
        if (paused) element.dispatchEvent(new Event("photo-settle"));
        update();
      });
      element.addEventListener("photo-settled", update);
      element.addEventListener("photo-arriving", update);
      motion.addEventListener("change", update);
      document.addEventListener("visibilitychange", update);
      new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? false;
        update();
      }).observe(element);
      update();
    });
}
