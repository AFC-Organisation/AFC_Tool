import type { AnalyticsEvent } from '../hooks/useAnalytics';
import type { Registration } from '../types/event';

// ─── KPI Computations ─────────────────────────────────────────────────────────

export interface KPIData {
  totalRegistrations: number;
  totalEvents: number;
  totalCheckedIn: number;
  checkInRate: number;
  avgRegistrationsPerEvent: number;
  capacityUtilization: number | null; // null if no max_deelnemers set
  totalWithFaculty: number;
  uniqueFaculties: number;
}

export function computeKPIs(events: AnalyticsEvent[]): KPIData {
  const allRegs: Registration[] = events.flatMap((e) => e.registrations ?? []);
  const totalRegistrations = allRegs.length;
  const totalCheckedIn = allRegs.filter((r) => r.checked_in).length;

  const eventsWithCapacity = events.filter(
    (e) => e.max_deelnemers != null && e.max_deelnemers > 0
  );
  const totalCapacity = eventsWithCapacity.reduce(
    (sum, e) => sum + (e.max_deelnemers ?? 0),
    0
  );
  const regsForCapacityEvents = eventsWithCapacity.reduce(
    (sum, e) => sum + (e.registrations?.length ?? 0),
    0
  );

  const faculties = allRegs
    .map((r) => r.faculteit)
    .filter((f): f is string => !!f && f.trim() !== '');
  const uniqueFaculties = new Set(faculties.map((f) => f.toLowerCase().trim())).size;

  return {
    totalRegistrations,
    totalEvents: events.length,
    totalCheckedIn,
    checkInRate:
      totalRegistrations > 0
        ? Math.round((totalCheckedIn / totalRegistrations) * 100)
        : 0,
    avgRegistrationsPerEvent:
      events.length > 0 ? Math.round(totalRegistrations / events.length) : 0,
    capacityUtilization:
      eventsWithCapacity.length > 0 && totalCapacity > 0
        ? Math.round((regsForCapacityEvents / totalCapacity) * 100)
        : null,
    totalWithFaculty: faculties.length,
    uniqueFaculties,
  };
}

// ─── Faculty Distribution ─────────────────────────────────────────────────────

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export function computeFacultyDistribution(
  events: AnalyticsEvent[],
  topN = 10
): DistributionItem[] {
  const allRegs = events.flatMap((e) => e.registrations ?? []);
  const counts: Record<string, number> = {};

  for (const reg of allRegs) {
    const key =
      reg.faculteit?.trim() || 'Onbekend';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const total = allRegs.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

// ─── How Found Distribution ───────────────────────────────────────────────────

export function computeHowFoundDistribution(
  events: AnalyticsEvent[]
): DistributionItem[] {
  const allRegs = events.flatMap((e) => e.registrations ?? []);
  const counts: Record<string, number> = {};

  for (const reg of allRegs) {
    const key = reg.hoe_gevonden?.trim() || 'Onbekend';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const total = allRegs.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

// ─── Study Year Distribution ──────────────────────────────────────────────────

const STUDIEJAAR_ORDER = [
  'Bachelor 1',
  'Bachelor 2',
  'Bachelor 3',
  'Master 1',
  'Master 2',
  'Doctoraat',
  'Andere',
  'Onbekend',
];

export function computeStudyYearDistribution(
  events: AnalyticsEvent[]
): DistributionItem[] {
  const allRegs = events.flatMap((e) => e.registrations ?? []);
  const counts: Record<string, number> = {};

  for (const reg of allRegs) {
    const key = reg.studiejaar?.trim() || 'Onbekend';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const total = allRegs.length;
  const items = Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  // Sort by predefined order where possible, others alphabetically
  return items.sort((a, b) => {
    const ai = STUDIEJAAR_ORDER.indexOf(a.label);
    const bi = STUDIEJAAR_ORDER.indexOf(b.label);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// ─── Registration Source Distribution ────────────────────────────────────────

export function computeSourceDistribution(
  events: AnalyticsEvent[]
): DistributionItem[] {
  const allRegs = events.flatMap((e) => e.registrations ?? []);
  const counts: Record<string, number> = {};

  const BRON_LABELS: Record<string, string> = {
    tally: 'Tally',
    ticket_tailor: 'Ticket Tailor',
    manueel: 'Manueel',
  };

  for (const reg of allRegs) {
    const key = BRON_LABELS[reg.bron] ?? reg.bron ?? 'Onbekend';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const total = allRegs.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

// ─── Check-In Rate Per Event ──────────────────────────────────────────────────

export interface EventCheckInData {
  titel: string;
  registrations: number;
  checkedIn: number;
  checkInRate: number;
  type: string;
}

export function computeEventCheckInRates(
  events: AnalyticsEvent[]
): EventCheckInData[] {
  return events
    .map((e) => {
      const regs = e.registrations ?? [];
      const checkedIn = regs.filter((r) => r.checked_in).length;
      return {
        titel:
          e.titel.length > 30 ? e.titel.slice(0, 27) + '…' : e.titel,
        registrations: regs.length,
        checkedIn,
        checkInRate:
          regs.length > 0 ? Math.round((checkedIn / regs.length) * 100) : 0,
        type: e.type,
      };
    })
    .sort((a, b) => b.checkInRate - a.checkInRate);
}

// ─── Strategic Insights ───────────────────────────────────────────────────────

export interface StrategicInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  metric?: string;
}

export function generateInsights(
  events: AnalyticsEvent[],
  kpis: KPIData
): StrategicInsight[] {
  const insights: StrategicInsight[] = [];

  if (events.length === 0) return insights;

  const allRegs = events.flatMap((e) => e.registrations ?? []);

  // Check-in rate insight
  if (kpis.checkInRate >= 75) {
    insights.push({
      id: 'checkin-high',
      type: 'positive',
      title: 'Hoge opkomst',
      description: `${kpis.checkInRate}% van de ingeschreven deelnemers verscheen effectief. Dit wijst op sterk engagement en relevante topics.`,
      metric: `${kpis.checkInRate}% check-in`,
    });
  } else if (kpis.checkInRate < 50 && kpis.checkInRate > 0) {
    insights.push({
      id: 'checkin-low',
      type: 'warning',
      title: 'Lage opkomst vs. inschrijvingen',
      description: `Slechts ${kpis.checkInRate}% verscheen na inschrijving. Overweeg herinneringsmails of een wachtlijstsysteem om no-shows te reduceren.`,
      metric: `${kpis.checkInRate}% check-in`,
    });
  }

  // Capacity utilization
  if (kpis.capacityUtilization != null) {
    if (kpis.capacityUtilization >= 90) {
      insights.push({
        id: 'capacity-full',
        type: 'opportunity',
        title: 'Capaciteit bijna vol',
        description: `De evenementen bereiken gemiddeld ${kpis.capacityUtilization}% bezetting. Overweeg grotere locaties of extra editie's om vraag op te vangen.`,
        metric: `${kpis.capacityUtilization}% bezetting`,
      });
    } else if (kpis.capacityUtilization < 60) {
      insights.push({
        id: 'capacity-low',
        type: 'warning',
        title: 'Lage capaciteitsbenutting',
        description: `Gemiddeld wordt slechts ${kpis.capacityUtilization}% van de capaciteit benut. Investeer in betere promotie of pas de locatiegrootte aan.`,
        metric: `${kpis.capacityUtilization}% bezetting`,
      });
    }
  }

  // Top faculty
  const facultyDist = computeFacultyDistribution(events, 1);
  if (facultyDist.length > 0 && facultyDist[0].label !== 'Onbekend') {
    insights.push({
      id: 'top-faculty',
      type: 'info',
      title: `Populairste faculteit: ${facultyDist[0].label}`,
      description: `${facultyDist[0].percentage}% van de deelnemers komt uit ${facultyDist[0].label}. Versterk de band via gerichte communicatie. Analyseer ook ondervertegenwoordigde faculteiten voor groeikansen.`,
      metric: `${facultyDist[0].percentage}% van deelnemers`,
    });
  }

  // How found
  const howFoundDist = computeHowFoundDistribution(events).filter(
    (d) => d.label !== 'Onbekend'
  );
  if (howFoundDist.length > 0) {
    const top = howFoundDist[0];
    insights.push({
      id: 'top-channel',
      type: 'positive',
      title: `Sterkste kanaal: ${top.label}`,
      description: `${top.percentage}% van de deelnemers vond ons via ${top.label}. Verhoog de investeringen in dit kanaal en test nieuwe kanalen voor diversificatie.`,
      metric: `${top.percentage}% van inschrijvingen`,
    });
  }

  // Study year insight
  const studyYearDist = computeStudyYearDistribution(events).filter(
    (d) => d.label !== 'Onbekend'
  );
  if (studyYearDist.length > 0) {
    const topYear = studyYearDist[0];
    const masterCount = studyYearDist
      .filter((d) => d.label.toLowerCase().includes('master'))
      .reduce((sum, d) => sum + d.count, 0);
    const bachelorCount = studyYearDist
      .filter((d) => d.label.toLowerCase().includes('bachelor'))
      .reduce((sum, d) => sum + d.count, 0);
    const total = allRegs.length;

    if (total > 0) {
      const masterPct = Math.round((masterCount / total) * 100);
      const bachelorPct = Math.round((bachelorCount / total) * 100);

      if (masterPct > bachelorPct) {
        insights.push({
          id: 'studiejaar-masters',
          type: 'info',
          title: 'Masterstudenten domineren',
          description: `${masterPct}% van de deelnemers is masterstudent vs. ${bachelorPct}% bachelor. Inhoud en timing afstemmen op mastertraject biedt kansen.`,
          metric: `${masterPct}% masters`,
        });
      } else if (bachelorPct > masterPct) {
        insights.push({
          id: 'studiejaar-bachelors',
          type: 'info',
          title: 'Bachelorstudenten domineren',
          description: `${bachelorPct}% van de deelnemers is bachelorstudent. Introductiegerichte content en workshops sluiten goed aan op deze doelgroep.`,
          metric: `${bachelorPct}% bachelors`,
        });
      }
    }
  }

  // Events with high variance in check-in rates
  const checkInRates = computeEventCheckInRates(events).map((e) => e.checkInRate);
  if (checkInRates.length >= 3) {
    const max = Math.max(...checkInRates);
    const min = Math.min(...checkInRates);
    if (max - min > 40) {
      insights.push({
        id: 'variance-high',
        type: 'opportunity',
        title: 'Grote variatie in opkomst per evenement',
        description: `De opkomst varieert van ${min}% tot ${max}%. Analyseer welke factoren (topic, dag, locatie) de beste opkomst verklaren om succesvolle elementen te repliceren.`,
        metric: `${min}–${max}% range`,
      });
    }
  }

  return insights;
}