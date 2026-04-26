import type {
  TallyRegistration,
  TicketTailorRegistration,
  FeedbackImport,
} from '../types/event';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() ?? '';
    });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseTallyCSV(text: string): TallyRegistration[] {
  const rows = parseCSV(text);
  return rows.map((r) => ({
    submission_id: r['submission_id'] || r['submissionid'] || '',
    respondent_id: r['respondent_id'] || r['respondentid'] || '',
    submitted_at: r['submitted_at'] || r['submittedat'] || '',
    form_id: r['form_id'] || r['formid'] || '',
    first_name: r['first_name'] || r['firstname'] || '',
    last_name: r['last_name'] || r['lastname'] || '',
    email: r['email'] || '',
    link_linkedin: r['link_linding'] || r['link_linkedin'] || '',
    gender: r['gender'] || '',
    study_program: r['study_program'] || '',
    faculty: r['faculty'] || '',
    level_of_education: r['level_of_education'] || '',
    is_in_final_year: r['is_in_final_year'] || '',
    activity_encounter: r['activity_encounter'] || '',
    gdpr_confirmed: r['gdpr_confirmed'] || '',
    studying_ghent: r['studying_ghent'] || '',
    can_send_resume: r['can_send_resume'] || '',
    is_proficient_in_dutch: r['is_proficient_in_dutch'] || '',
  }));
}

export function parseTicketTailorCSV(text: string): TicketTailorRegistration[] {
  const rows = parseCSV(text);
  return rows.map((r) => ({
    name: r['name'] || '',
    ticket_type: r['ticket_type'] || '',
    ticket_code: r['ticket_code'] || '',
    order_id: r['order_id'] || '',
    status: r['status'] || '',
    checked_in: r['checked-in'] || r['checked_in'] || 'No',
    group_ticket_code: r['group_ticket_code'] || '',
    faculteit: r['faculteit'] || '',
    hoe_gevonden: r['hoe_heb_je_deze_activiteit_gevonden_via'] || r['hoe_gevonden'] || '',
    studiejaar: r['studiejaar'] || '',
    buyer_name: r['buyer_name'] || '',
    email_address: r['email_address'] || r['email'] || '',
  }));
}

export function parseFeedbackCSV(text: string): FeedbackImport[] {
  const rows = parseCSV(text);
  return rows.map((r) => ({
    submission_id: r['submission_id'] || r['submissionid'] || '',
    respondent_id: r['respondent_id'] || r['respondentid'] || '',
    submitted_at: r['submitted_at'] || r['submittedat'] || '',
    form_id: r['form_id'] || r['formid'] || '',
    email: r['email'] || '',
    vraag_1: r['vraag_1'] ? Number(r['vraag_1']) : undefined,
    vraag_2: r['vraag_2'] ? Number(r['vraag_2']) : undefined,
    vraag_3: r['vraag_3'] ? Number(r['vraag_3']) : undefined,
    wat_kon_beter: r['wat_kon_beter'] || '',
    favo_onderdeel: r['favo_onderdeel'] || '',
    andere_opmerkingen: r['andere_opmerkingen'] || '',
  }));
}

export function parseTicketTailorHTML(html: string): Partial<TicketTailorRegistration>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table tbody tr');
  const result: Partial<TicketTailorRegistration>[] = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      const checkedInSvg = cells[5]?.querySelector('svg title')?.textContent || '';
      result.push({
        ticket_code: cells[0]?.textContent?.trim() || '',
        ticket_type: cells[1]?.textContent?.trim() || '',
        name: cells[2]?.textContent?.trim() || '',
        order_id: cells[3]?.textContent?.trim() || '',
        checked_in: checkedInSvg.includes('Checked in') ? 'Yes' : 'No',
      });
    }
  });

  return result;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}