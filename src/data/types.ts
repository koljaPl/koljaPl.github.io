export const accentNames = ["blue", "red", "yellow", "green"] as const;

export type AccentName = (typeof accentNames)[number];
export type ContentStatus = "published" | "placeholder";
export type SocialKind = "github" | "linkedin" | "youtube" | "email";

export interface EditableValue<T> {
  value: T | null;
  placeholder: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface SocialLink {
  kind: SocialKind;
  label: string;
  href: string | null;
  placeholder: string;
}

export interface Profile {
  name: string;
  siteUrl: string;
  seoDescription: string;
  tagline: EditableValue<string>;
  biography: EditableValue<string>;
  currentFocus: EditableValue<string>;
  location: EditableValue<string>;
  email: EditableValue<string>;
  resumePdfUrl: EditableValue<string>;
  portraitAlt: string;
  areas: readonly string[];
}

export interface ContactReason {
  title: string;
  description: string;
  accent: AccentName;
}

export interface ExperienceEntry {
  organization: string;
  role: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  highlights: readonly string[];
  relatedProjectSlugs: readonly string[];
}

export interface SkillGroup {
  title: string;
  skills: readonly string[];
  evidenceProjectSlugs: readonly string[];
}

export interface TimelineEntry {
  future?: boolean;
  date: string;
  title: string;
  description: string;
  accent: AccentName;
}

export interface CompetitionEntry {
  name: string;
  date: string | null;
  result: string | null;
  summary: string;
  links: readonly {
    label: string;
    href: string;
  }[];
}

export interface GitHubRepositoryMetadata {
  repositoryUrl: string;
  stars: number;
  primaryLanguage: string | null;
  updatedAt: string;
}

export interface GitHubMetadataCache {
  version: 1;
  repositories: Record<string, GitHubRepositoryMetadata>;
}
