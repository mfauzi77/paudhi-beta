import { ActiveAlertData, DomainFilter, KeyIndicatorData, RegionalRiskScore } from '../types';

export async function fetchIndicators(domain: DomainFilter): Promise<KeyIndicatorData[]> {
  const res = await fetch(`/api/dashboard/indicators?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error('Failed to fetch indicators');
  return await res.json();
}

export async function fetchAlerts(domain: DomainFilter): Promise<ActiveAlertData[]> {
  const res = await fetch(`/api/dashboard/alerts?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return await res.json();
}

export async function fetchRegionalRisks(domain: DomainFilter): Promise<RegionalRiskScore[]> {
  const res = await fetch(`/api/dashboard/risks?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error('Failed to fetch risks');
  return await res.json();
}

export async function fetchLastUpdated(): Promise<string | null> {
  const res = await fetch('/api/meta/last-updated');
  if (!res.ok) return null;
  const json = await res.json();
  return json.lastUpdated || null;
}


