/** Change to "2d" to use the original SVG without downloading Three.js or the atlas. */
export const brainRenderer: "3d" | "2d" = "3d";
// Anterior three-quarter view: frontal anatomy slightly left of the viewer.
export const brainInitialRotation = { x: 0.08, y: 1.05, z: 0 } as const;
export const brainSelectionColors = {
  frontal: "#9c738c",
  parietal: "#b57b81",
  temporal: "#628d88",
  occipital: "#b28c6d",
  cerebellum: "#9484af",
  brainstem: "#798f9f",
} as const;
