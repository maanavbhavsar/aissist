import { columns } from "./columns"
import type { AgentGetOne } from "../../types"
import { DataTable } from "./data-table"

async function getData(): Promise<AgentGetOne[]> {
  // This would typically fetch from your API
  return [
    {
      id: "1",
      name: "First Agent",
      instructions: "You are an Agent",
      userId: "user1",
      createdAt: "2025-01-20T23:30:04.635Z",
      updatedAt: "2025-01-20T23:30:04.635Z",
      meetingCount: 5,
    },
    // ... more agents
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}