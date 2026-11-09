import { z } from 'zod';
const text = z.string().trim().max(500);
const long = z.string().max(50000);
const optional = text.default('');
const list = z.array(text).max(100).default([]);
export const url = z.string().max(2048).refine(v => !v || /^\/uploads\/[a-z]+\/[a-zA-Z0-9._-]+$/.test(v) || (() => {
  try { return ['https:', 'http:'].includes(new URL(v).protocol); } catch { return false; }
})(), 'URL harus HTTP(S) atau /uploads/...').default('');
const identifier = z.string().min(1).max(150).regex(/^[a-zA-Z0-9_-]+$/);
const analyticsCount = z.number().int().min(0).max(1000000000);
const analyticsMap = z.record(z.string().max(200), analyticsCount).default({});
const analyticsDay = z.object({
  views: analyticsCount.default(0),
  pageViews: analyticsMap,
  cvDownloads: analyticsCount.default(0),
  cvProfiles: z.record(identifier, analyticsCount).default({}),
  contacts: analyticsCount.default(0),
});
export const analyticsEventSchema = z.object({
  type: z.enum(['page_view', 'cv_download']),
  page: z.string().trim().max(200).optional(),
  profileId: identifier.optional(),
});
const experience = z.object({ role: text.min(1), company: text.min(1), location: optional, period: optional,
  roleEn: optional, periodEn: optional, description: long.default(''), descriptionEn: long.default(''),
  skills: list, isActive: z.boolean().default(true) });
const skill = z.object({ name: text.min(1), nameEn: optional, category: text.min(1), categoryEn: optional,
  description: long.default(''), descriptionEn: long.default(''), level: z.number().min(0).max(100).default(85) });
const education = z.object({ institution: text.min(1), institutionEn: optional, degree: text.min(1), degreeEn: optional });
export const schemas = {
  projects: z.object({ title: text.min(1), titleEn: optional, category: text.min(1), categoryEn: optional,
    summary: long.default(''), summaryEn: long.default(''), description: long.default(''), descriptionEn: long.default(''),
    image: url, liveUrl: url, githubUrl: url, tags: list, features: list, featuresEn: list,
    client: optional, year: optional, featured: z.boolean().default(false) }),
  articles: z.object({ title: text.min(1), titleEn: optional, category: text.min(1), categoryEn: optional,
    excerpt: long.default(''), excerptEn: long.default(''), content: long.default(''), contentEn: long.default(''),
    tags: list, readTime: optional, date: optional, hidden: z.boolean().default(false) }),
  experiences: experience, skills: skill,
  messages: z.object({ name: text.min(1), email: z.string().trim().max(254).email(), subject: optional,
    service: optional, message: z.string().trim().min(1).max(10000), website: z.string().max(0).optional() }),
  profile: z.object({ name: text.min(1), role: optional, roleEn: optional, bio: long.default(''), bioEn: long.default(''),
    location: optional, mapEnabled: z.boolean().default(true), mapLocation: optional,
    mapZoom: z.number().int().min(1).max(20).default(13),
    email: z.union([z.literal(''), z.string().email().max(254)]).default(''), phone: optional,
    avatar: url, resumeUrl: url, availableForHire: z.boolean().default(true),
    socials: z.object({ github: url, linkedin: url, twitter: url, instagram: url, whatsapp: url }).default({}),
    education: z.array(education).max(30).default([]),
    stats: z.object({ yearsExperience: z.number().min(0), completedProjects: z.number().min(0),
      satisfiedClients: z.number().min(0), codeCommits: z.number().min(0) }).optional() }),
  settings: z.object({ siteTitle: text.min(1), footerText: optional }),
  cv: z.object({ profileName: text.min(1).max(120).default(''), name: text.min(1), roleId: optional, roleEn: optional, locationId: optional, locationEn: optional,
    phone: optional, email: z.string().email().max(254), summaryId: long.default(''), summaryEn: long.default(''),
    education: z.array(education).max(30), experiences: z.array(experience.extend({ id: identifier })).max(100),
    skills: z.array(skill.extend({ id: identifier })).max(200) }),
};
export const passwordSchema = z.object({ currentPassword: z.string().max(256), newPassword: z.string().min(12).max(256) });
export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw Object.assign(new Error(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).slice(0, 4).join('; ')), { status: 400 });
  return result.data;
}
export function validateRecord(kind, value) { return parse(schemas[kind], value); }
export function validateAnalyticsEvent(value) { return parse(analyticsEventSchema, value); }
export function validateBackup(value) {
  const data = parse(z.object({ version: z.literal(1), data: z.object({
    profile: schemas.profile, settings: schemas.settings, cv: schemas.cv,
    cvProfiles: z.array(schemas.cv.extend({ id: identifier })).min(1).max(50), activeCvProfileId: identifier,
    analytics: z.object({ daily: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), analyticsDay).default({}) }).default({ daily: {} }),
    projects: z.array(schemas.projects.extend({ id: identifier, slug: identifier.optional(), createdAt: optional })).max(1000),
    articles: z.array(schemas.articles.extend({ id: identifier, slug: identifier.optional(), createdAt: optional })).max(1000),
    messages: z.array(schemas.messages.extend({ id: identifier, date: optional, read: z.boolean() })).max(10000),
  }) }), value).data;
  for (const items of [data.projects, data.articles, data.messages, data.cv.experiences, data.cv.skills]) {
    if (new Set(items.map(i => i.id)).size !== items.length || new Set(items.map(i => i.slug || i.id)).size !== items.length)
      throw Object.assign(new Error('ID/slug duplikat dalam cadangan'), { status: 400 });
  }
  return data;
}
