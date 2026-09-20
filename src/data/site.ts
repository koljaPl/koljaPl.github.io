import { primaryAccountUrls } from "./accounts";
import type {
  CompetitionEntry,
  ContactReason,
  ExperienceEntry,
  NavigationItem,
  Profile,
  SkillGroup,
  SocialLink,
  TimelineEntry,
} from "./types";

export const profile = {
  name: "Nicklas Plugin",
  siteUrl: "https://koljapl.github.io",
  seoDescription:
    "The personal website of Nicklas Plugin, featuring work across software engineering, open source, algorithms, competitive and olympiad programming, and machine learning.",
  tagline: {
    value: null,
    placeholder: "Add Nicklas's final tagline.",
  },
  biography: {
    value:
      "On a slightly more personal note, my birthday is August 25, 2010. I'm straight, and I don't have a girlfriend (and never have had one). I don't even know what to write here - my main interests are math, programming, and physics, but I love playing video games (not really often), listening to music, reading books, traveling, and talking about everything. I like everything. ",
    placeholder: "Add Nicklas’s biography.",
  },
  currentFocus: {
    value: "Algorithms and AI/ML",
    placeholder: "Algorithms and AI/ML",
  },
  location: {
    value: "Germany, near Hamburg",
    placeholder: "Germany, near Hamburg",
  },
  email: {
    value: "nikolya.plugin@gmail.com",
    placeholder: "Add Nicklas's public contact email.",
  },
  resumePdfUrl: {
    value: null,
    placeholder: "Add the public path to Nicklas's résumé PDF.",
  },
  portraitAlt:
    "Portrait of Nicklas Plugin wearing a white shirt, tie, and dark cardigan.",
  areas: [
    "Software engineering",
    "Open source",
    "Algorithms",
    "Competitive programming",
    "Olympiad programming",
    "Machine learning",
  ] as const,
} satisfies Profile;

export const navigation = [
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/about/" },
  { label: "Experience", href: "/experience/" },
  { label: "Résumé", href: "/resume/" },
  { label: "Contact", href: "/contact/" },
] satisfies readonly NavigationItem[];

export const socialLinks = [
  {
    kind: "github",
    label: "GitHub",
    href: primaryAccountUrls.github,
    placeholder: "Add Nicklas's GitHub profile URL.",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/niklas-plugin/",
    placeholder: "Add Nicklas's LinkedIn profile URL.",
  },
  {
    kind: "youtube",
    label: "YouTube",
    href: primaryAccountUrls.youtube,
    placeholder: "Add Nicklas's YouTube channel URL.",
  },
  {
    kind: "email",
    label: "Email",
    href: profile.email.value ? `mailto:${profile.email.value}` : null,
    placeholder: "Add Nicklas's public email address.",
  },
] satisfies readonly SocialLink[];

export const contactReasons: readonly ContactReason[] = [];
export const competitions: readonly CompetitionEntry[] = [];
export const experience: readonly ExperienceEntry[] = [
  {
    organization: "IT company",
    role: "Internship",
    startDate: "August 2026",
    endDate: "September 2026",
    summary: "A two-month internship at an IT company.",
    highlights: [],
    relatedProjectSlugs: [],
  },
];
export const skills: readonly SkillGroup[] = [];
export const timeline: readonly TimelineEntry[] = [
  {
    date: "Childhood–present",
    title: "Mathematics, logic, and physics",
    description:
      "Classes in mathematics, logic, and physics from childhood to the present day.",
    accent: "blue",
  },
  {
    date: "Age 7",
    title: "First programs",
    description: "Started coding using Pascal and Scratch.",
    accent: "red",
  },
  {
    date: "Age 12",
    title: "Building websites",
    description: "Began building websites using basic front-end development.",
    accent: "yellow",
  },
  {
    date: "Late age 13",
    title: "Learning Python",
    description: "Learned Python toward the end of my 13th year.",
    accent: "green",
  },
  {
    date: "Age 14",
    title: "Python and back-end development",
    description: "Advanced Python work and writing back-end code.",
    accent: "blue",
  },
  {
    date: "Age 15",
    title: "Competitive programming and Go",
    description: "Started learning competitive programming and Go.",
    accent: "red",
  },
  {
    date: "Late age 15",
    title: "Machine learning",
    description: "Began studying machine learning by the end of my 15th year.",
    accent: "yellow",
  },
  {
    date: "August–September 2026",
    title: "IT internship",
    description: "Completed a two-month internship at an IT company.",
    accent: "green",
  },
  {
    date: "Present",
    title: "Computer science and AI competitions",
    description:
      "Participating professionally in computer science and AI competitions.",
    accent: "blue",
  },
  {
    date: "Future goal",
    title: "Study Computer Science",
    description:
      "Plan to apply to the world’s top universities for a degree in Computer Science.",
    accent: "red",
    future: true,
  },
];

export const personalContext = {
  birthDate: "2010-08-25",
  codingStartedAtAge: 7,
  heroEyebrow: "Research · Engineer · Open-source builder",
  homeIntroduction:
    "Hi guys, I work in software engineering, open source, algorithms, competitive and Olympiad programming, and machine learning. And competition is my whole life",
  homeMotto: "Born to win, built to win - even if it means overcoming oneself",
} as const;
export function codingExperienceAt(now = new Date()): string {
  const birth = new Date(`${personalContext.birthDate}T00:00:00Z`);
  const birthdayPassed =
    now.getUTCMonth() > birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() &&
      now.getUTCDate() >= birth.getUTCDate());
  const age =
    now.getUTCFullYear() - birth.getUTCFullYear() - (birthdayPassed ? 0 : 1);
  return `Approximately ${Math.max(0, age - personalContext.codingStartedAtAge)} years · started at age ${personalContext.codingStartedAtAge}`;
}
export const resumeSettings = {
  draft: true,
  todo: [
    "Add the internship company, role details, and verified responsibilities.",
    "Add education and university application information.",
    "Add competition names, dates, and verified results.",
    "Review the final résumé wording and select supporting project evidence.",
    "Supply the finished résumé PDF.",
  ],
} as const;

export const knownEngineeringAreas = [
  {
    index: "01",
    title: "Software engineering",
    description: "Detailed evidence has not yet been supplied.",
    accent: "blue",
  },
  {
    index: "02",
    title: "Open source",
    description: "Detailed evidence has not yet been supplied.",
    accent: "red",
  },
  {
    index: "03",
    title: "Algorithms",
    description: "Detailed evidence has not yet been supplied.",
    accent: "yellow",
  },
  {
    index: "04",
    title: "Machine learning",
    description: "Detailed evidence has not yet been supplied.",
    accent: "green",
  },
] as const;
