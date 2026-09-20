import {
  contactReasons,
  resumeSettings,
  competitions,
  experience,
  profile,
  skills,
  socialLinks,
  timeline,
} from "./site";

const hasContactChannel =
  Boolean(profile.email.value) ||
  socialLinks.some((link) => Boolean(link.href));
const hasExperienceContent =
  experience.length > 0 ||
  skills.length > 0 ||
  timeline.length > 0 ||
  competitions.length > 0;

/** One readiness source shared by page metadata and sitemap generation. */
export const pagePublication = {
  contact: hasContactChannel && contactReasons.length > 0,
  experience: hasExperienceContent,
  resume:
    !resumeSettings.draft &&
    Boolean(profile.biography.value) &&
    experience.length > 0 &&
    skills.length > 0,
} as const;
