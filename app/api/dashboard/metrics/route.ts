import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/actions/dashboard";

export async function GET() {
  const metrics = await getDashboardMetrics();
  return NextResponse.json(metrics);
}
