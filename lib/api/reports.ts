import { apiFetch } from './client';
import { ReportSummarySchema, type ReportSummaryDTO } from '@/lib/schemas/dto';

export type { ReportSummaryDTO };

/**
 * GET /api/reports/summary?period_days=N
 * Returns combined financial KPIs for the dashboard.
 */
export async function fetchReportsSummary(
  periodDays: number = 30,
  accessToken: string
): Promise<ReportSummaryDTO | null> {
  try {
    const raw = await apiFetch<unknown>(
      `/api/reports/summary?period_days=${periodDays}`,
      {},
      accessToken
    );
    if (!raw) return null;
    return ReportSummarySchema.parse(raw);
  } catch {
    return null;
  }
}
