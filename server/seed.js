import { initialProfile, initialCv, initialProjects, initialArticles, initialSettings } from '../src/data/seedData.js';
export function seedDatabase() {
  const cv = {...initialCv, profileName:'IT Support', id:'cv-it-support'};
  return structuredClone({profile:initialProfile, cv, cvProfiles:[cv], activeCvProfileId:cv.id,
    projects:initialProjects, articles:initialArticles, experiences:cv.experiences, skills:cv.skills,
    messages:[], settings:initialSettings, media:[], analytics:{daily:{}}, schemaVersion:3});
}

