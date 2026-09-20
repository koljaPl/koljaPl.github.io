import { profile } from "./site";

export type BrainRegionId =
  | "frontal"
  | "parietal"
  | "temporal"
  | "occipital"
  | "cerebellum"
  | "brainstem";

type EngineeringArea = (typeof profile.areas)[number];
interface BrainRegion {
  id: BrainRegionId;
  label: string;
  function: string;
  association: string;
  areas: readonly EngineeringArea[];
  sources: readonly (keyof typeof brainSources)[];
}

export const brainSources = {
  hopkins: {
    label: "Johns Hopkins Medicine",
    href: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/anatomy-of-the-brain",
  },
  nimh: {
    label: "NIMH",
    href: "https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain",
  },
} as const;

export const brainIntro = {
  title: "A map of interests",
  instruction: "Select a region to explore the connection.",
  note: "A map of interests, not a depiction of my individual brain or a scientific assessment of my abilities. These analogies do not identify dedicated programming or mathematics centers.",
  diagramDescription:
    "Simplified left lateral view, with the front on the left. Four cerebral lobes sit above the cerebellum and brainstem. Boundaries are schematic. Use the named controls or read all regions below.",
};

export const brainRegions = [
  {
    id: "frontal",
    label: "Frontal lobe",
    function:
      "Contributes to decision-making and the control of voluntary movement.",
    association:
      "A metaphor for choosing approaches in algorithms: considering alternatives and deciding what to try.",
    areas: ["Algorithms"],
    sources: ["hopkins", "nimh"],
  },
  {
    id: "parietal",
    label: "Parietal lobe",
    function:
      "Processes bodily sensations, including touch, and helps us understand spatial relationships.",
    association:
      "A metaphor for relationships and constraints in competitive and olympiad programming.",
    areas: ["Competitive programming", "Olympiad programming"],
    sources: ["hopkins"],
  },
  {
    id: "temporal",
    label: "Temporal lobe",
    function:
      "Processes sounds and contributes to memory. Its different regions participate in several functions.",
    association:
      "A metaphor for exchanging and retaining knowledge through open source.",
    areas: ["Open source"],
    sources: ["nimh", "hopkins"],
  },
  {
    id: "occipital",
    label: "Occipital lobe",
    function: "Processes visual information arriving from the eyes.",
    association: "A metaphor for representing information in machine learning.",
    areas: ["Machine learning"],
    sources: ["hopkins", "nimh"],
  },
  {
    id: "cerebellum",
    label: "Cerebellum",
    function:
      "Helps coordinate voluntary movements and maintain posture and balance.",
    association:
      "A metaphor for coordinating interacting parts in software engineering.",
    areas: ["Software engineering"],
    sources: ["hopkins", "nimh"],
  },
  {
    id: "brainstem",
    label: "Brainstem",
    function:
      "Connects the brain with the spinal cord. Its structures help regulate essential functions, including breathing and heart rate.",
    association:
      "A metaphor for the foundational systems that support other software.",
    areas: ["Software engineering"],
    sources: ["hopkins", "nimh"],
  },
] as const satisfies readonly BrainRegion[];
