import { calculateProjectRisk } from "@/src/lib/riskEngine";

export default function AIInsightsPage() {
  const projectData = {
    overdueTasks: 2,
    openIssues: 1,
    overloadedUsers: 1,
    progress: 30,
  };

  const risk = calculateProjectRisk(projectData);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Insights</h1>

      <div className="border rounded-xl p-4 shadow-sm">
        <p className="mb-2">
          <strong>Risk Score:</strong> {risk.score}
        </p>
        <p className="mb-2">
          <strong>Risk Level:</strong> {risk.level}
        </p>

        <div>
          <strong>Reasons:</strong>
          <ul className="list-disc ml-6 mt-2">
            {risk.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}