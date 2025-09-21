export interface InstallSummaryItem {
  label: string;
  path: string;
  count?: number;
  details?: string;
}

export function printInstallSummary(agentLabel: string, items: InstallSummaryItem[]): void {
  if (items.length === 0) {
    return;
  }

  console.log('');
  console.log(`Summary — ${agentLabel}`);
  for (const item of items) {
    const info: string[] = [];
    if (typeof item.count === 'number') {
      info.push(`${item.count}`);
    }
    if (item.details) {
      info.push(item.details);
    }
    const suffix = info.length > 0 ? ` (${info.join(', ')})` : '';
    console.log(`  • ${item.path} — ${item.label}${suffix}`);
  }
  console.log('');
}
