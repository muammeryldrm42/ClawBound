const AI_KW = ["ai","agent","gpt","llm","agi","bot","neural","model","inference"];

export type Tag = "ai" | "pumpfun" | "bonkfun";

export function tagsHeuristic(name?: string, symbol?: string): Tag[] {
  const tags: Tag[] = [];
  const n = (name || "").toLowerCase();
  const s = (symbol || "").toLowerCase();

  if (AI_KW.some(k => n.includes(k) || s.includes(k))) tags.push("ai");

  // best-effort heuristic (you can override with config list)
  if (n.includes("pump") || s.includes("pump")) tags.push("pumpfun");
  if (n.includes("bonk") || s.includes("bonk")) tags.push("bonkfun");

  return Array.from(new Set(tags));
}
