/** One arrival per page load; static HTML is the fully visible fallback. */
export function initPhotoEntrances(): void {
  document
    .querySelectorAll<HTMLElement>("[data-photo-entrance]")
    .forEach((figure) => {
      if (figure.dataset.arrival) return;
      const flight = figure.querySelector<HTMLElement>(".photo-flight")!;
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let guard: ReturnType<typeof setTimeout> | undefined;
      const settle = () => {
        if (figure.dataset.arrival === "settled") return;
        clearTimeout(guard);
        figure.dataset.arrival = "settled";
        figure.dispatchEvent(new Event("photo-settled"));
      };
      const arrive = () => {
        if (motion.matches || document.hidden) return settle();
        figure.dataset.arrival = "arriving";
        figure.dispatchEvent(new Event("photo-arriving"));
        // Read the actual CSS duration so changing a path cannot cut it short.
        const duration =
          parseFloat(getComputedStyle(flight).animationDuration) * 1000;
        clearTimeout(guard);
        guard = setTimeout(
          settle,
          (Number.isFinite(duration) ? duration : 4000) + 400,
        );
      };
      figure.addEventListener("photo-settle", settle);
      figure.dataset.arrival = motion.matches ? "settled" : "waiting";
      const observer = new IntersectionObserver(([entry]) => {
        if (figure.dataset.arrival === "settled") {
          observer.disconnect();
          return;
        }
        if (entry?.isIntersecting && figure.dataset.arrival === "waiting") {
          arrive();
        } else if (
          !entry?.isIntersecting &&
          figure.dataset.arrival === "arriving"
        )
          settle();
      });
      observer.observe(figure);
      flight.addEventListener("animationend", (event) => {
        if (event.target === flight && figure.dataset.arrival === "arriving")
          settle();
      });
      flight.addEventListener("animationcancel", (event) => {
        if (event.target === flight && figure.dataset.arrival === "arriving")
          settle();
      });
      motion.addEventListener("change", () => {
        if (motion.matches) settle();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && figure.dataset.arrival === "arriving") settle();
      });
      window.addEventListener("pagehide", settle, { once: true });
    });
}
