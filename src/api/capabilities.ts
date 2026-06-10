import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type {
  Capability,
  Feature,
  Story,
} from "../components/Projects/Capabilities/types";

// ─── Capabilities ─────────────────────────────────────────────────────────────

export const getCapabilities = (
  projectId: number,
  signal?: AbortSignal,
): Promise<Capability[]> => {
  const KEY = `capabilities:${projectId}`;
  const hit = cache.get<Capability[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Capability[]>(`/api/projects/${projectId}/capabilities`, {
    signal,
  }).then((data) => {
    cache.set(KEY, data, TTL.PROJECTS);
    return data;
  });
};

export const getCapability = (
  projectId: number,
  capabilityId: string,
): Promise<Capability> => {
  const KEY = `capability:${projectId}:${capabilityId}`;
  const hit = cache.get<Capability>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Capability>(
    `/api/projects/${projectId}/capabilities/${capabilityId}`,
  ).then((data) => {
    cache.set(KEY, data, TTL.PROJECTS);
    return data;
  });
};

export const createCapability = (
  projectId: number,
  body: Partial<Omit<Capability, "id" | "features">>,
): Promise<Capability> =>
  apiFetch<Capability>(`/api/projects/${projectId}/capabilities`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidate(`capabilities:${projectId}`);
    return data;
  });

export const updateCapability = (
  projectId: number,
  capabilityId: string,
  body: Partial<Omit<Capability, "id" | "features">>,
): Promise<Capability> =>
  apiFetch<Capability>(
    `/api/projects/${projectId}/capabilities/${capabilityId}`,
    { method: "PATCH", body: JSON.stringify(body) },
  ).then((data) => {
    cache.invalidate(`capability:${projectId}:${capabilityId}`);
    cache.invalidate(`capabilities:${projectId}`);
    return data;
  });

export const deleteCapability = (
  projectId: number,
  capabilityId: string,
): Promise<void> =>
  apiFetch<void>(`/api/projects/${projectId}/capabilities/${capabilityId}`, {
    method: "DELETE",
  }).then(() => {
    cache.invalidate(`capability:${projectId}:${capabilityId}`);
    cache.invalidate(`capabilities:${projectId}`);
    // CASCADE: features, stories bajo esta capability
    cache.invalidatePrefix(`features:${projectId}:${capabilityId}`);
    cache.invalidatePrefix(`stories:${projectId}:${capabilityId}:`);
  });

// ─── Features ─────────────────────────────────────────────────────────────────

export const getFeatures = (
  projectId: number,
  capabilityId: string,
): Promise<Feature[]> => {
  const KEY = `features:${projectId}:${capabilityId}`;
  const hit = cache.get<Feature[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Feature[]>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getFeature = (
  projectId: number,
  capabilityId: string,
  featureId: string,
): Promise<Feature> => {
  const KEY = `feature:${projectId}:${capabilityId}:${featureId}`;
  const hit = cache.get<Feature>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Feature>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const createFeature = (
  projectId: number,
  capabilityId: string,
  body: Partial<Omit<Feature, "id" | "stories">>,
): Promise<Feature> =>
  apiFetch<Feature>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features`,
    { method: "POST", body: JSON.stringify(body) },
  ).then((data) => {
    cache.invalidate(`features:${projectId}:${capabilityId}`);
    cache.invalidate(`capabilities:${projectId}`);
    return data;
  });

export const updateFeature = (
  projectId: number,
  capabilityId: string,
  featureId: string,
  body: Partial<Omit<Feature, "id" | "stories">>,
): Promise<Feature> =>
  apiFetch<Feature>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}`,
    { method: "PATCH", body: JSON.stringify(body) },
  ).then((data) => {
    cache.invalidate(`feature:${projectId}:${capabilityId}:${featureId}`);
    cache.invalidate(`features:${projectId}:${capabilityId}`);
    return data;
  });

export const deleteFeature = (
  projectId: number,
  capabilityId: string,
  featureId: string,
): Promise<void> =>
  apiFetch<void>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}`,
    { method: "DELETE" },
  ).then(() => {
    cache.invalidate(`feature:${projectId}:${capabilityId}:${featureId}`);
    cache.invalidate(`features:${projectId}:${capabilityId}`);
    // CASCADE: stories bajo esta feature
    cache.invalidatePrefix(`stories:${projectId}:${capabilityId}:${featureId}`);
  });

// ─── Stories ──────────────────────────────────────────────────────────────────

export const getStories = (
  projectId: number,
  capabilityId: string,
  featureId: string,
): Promise<Story[]> => {
  const KEY = `stories:${projectId}:${capabilityId}:${featureId}`;
  const hit = cache.get<Story[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Story[]>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}/stories`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getStory = (
  projectId: number,
  capabilityId: string,
  featureId: string,
  storyId: string,
): Promise<Story> => {
  const KEY = `story:${projectId}:${capabilityId}:${featureId}:${storyId}`;
  const hit = cache.get<Story>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<Story>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}/stories/${storyId}`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const createStory = (
  projectId: number,
  capabilityId: string,
  featureId: string,
  body: Partial<Omit<Story, "id">>,
): Promise<Story> =>
  apiFetch<Story>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}/stories`,
    { method: "POST", body: JSON.stringify(body) },
  ).then((data) => {
    cache.invalidate(`stories:${projectId}:${capabilityId}:${featureId}`);
    return data;
  });

export const updateStory = (
  projectId: number,
  capabilityId: string,
  featureId: string,
  storyId: string,
  body: Partial<Omit<Story, "id">>,
): Promise<Story> =>
  apiFetch<Story>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}/stories/${storyId}`,
    { method: "PATCH", body: JSON.stringify(body) },
  ).then((data) => {
    cache.invalidate(
      `story:${projectId}:${capabilityId}:${featureId}:${storyId}`,
    );
    cache.invalidate(`stories:${projectId}:${capabilityId}:${featureId}`);
    return data;
  });

export const deleteStory = (
  projectId: number,
  capabilityId: string,
  featureId: string,
  storyId: string,
): Promise<void> =>
  apiFetch<void>(
    `/api/projects/${projectId}/capabilities/${capabilityId}/features/${featureId}/stories/${storyId}`,
    { method: "DELETE" },
  ).then(() => {
    cache.invalidate(
      `story:${projectId}:${capabilityId}:${featureId}:${storyId}`,
    );
    cache.invalidate(`stories:${projectId}:${capabilityId}:${featureId}`);
  });
