// Applies Firebase Realtime Database REST streaming events ("put" / "patch") to a local copy of
// the JSON tree. Updates are immutable: only the containers along the changed path are copied.
// https://firebase.google.com/docs/reference/rest/database#section-streaming

export type StreamPayload = { path: string; data: unknown };

type Container = Record<string, unknown> | unknown[];

function isContainer(value: unknown): value is Container {
  return typeof value === "object" && value !== null;
}

function setAtPath(node: unknown, keys: string[], value: unknown): unknown {
  if (!keys.length) return value;
  const [head, ...rest] = keys;
  const copy: Record<string, unknown> = Array.isArray(node) ? (node.slice() as unknown as Record<string, unknown>) : isContainer(node) ? { ...node } : {};
  const next = setAtPath(copy[head], rest, value);
  if (next === null || next === undefined) delete copy[head];
  else copy[head] = next;
  return copy;
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function applyStreamEvent(tree: unknown, type: "put" | "patch", payload: StreamPayload): unknown {
  if (type === "put") return setAtPath(tree, splitPath(payload.path), payload.data);
  if (!isContainer(payload.data)) return tree;
  let next = tree;
  for (const [key, value] of Object.entries(payload.data)) next = setAtPath(next, [...splitPath(payload.path), key], value);
  return next;
}
