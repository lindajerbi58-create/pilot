export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export function calculateProjectRisk(data: any) {
  let score = 0;
  const reasons: string[] = [];

  if (data.overdueTasks > 0) {
    score += data.overdueTasks * 10;
    reasons.push("Overdue tasks");
  }

  if (data.openIssues > 0) {
    score += data.openIssues * 8;
    reasons.push("Open issues");
  }

  if (data.overloadedUsers > 0) {
    score += data.overloadedUsers * 7;
    reasons.push("Team overloaded");
  }

  if (data.progress < 40) {
    score += 10;
    reasons.push("Low progress");
  }

  if (score > 100) score = 100;

  let level: RiskLevel = "Low";
  if (score > 75) level = "Critical";
  else if (score > 50) level = "High";
  else if (score > 25) level = "Medium";

  return { score, level, reasons };
}