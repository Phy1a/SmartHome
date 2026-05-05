import type { Level } from '../types';

export function getDeviceIcon(type?: string): string {
  const icons: Record<string, string> = {
    thermostat: '🌡️',
    'lumière': '💡',
    'caméra': '📷',
    'électroménager': '🫧',
    robot: '🤖',
    'sécurité': '🔒',
    capteur: '📡',
    prise: '🔌',
    autre: '📦',
  };
  return icons[type?.toLowerCase() ?? ''] ?? '📦';
}

export function getLevelBadgeClass(level: string): string {
  const classes: Record<string, string> = {
    'débutant': 'level-debutant',
    'intermédiaire': 'level-intermediaire',
    'avancé': 'level-avance',
    expert: 'level-expert',
  };
  return classes[level] ?? 'level-debutant';
}

export function getLevelPoints(level: Level): number {
  const points: Record<Level, number> = {
    'débutant': 1,
    'intermédiaire': 3,
    'avancé': 5,
    expert: 7,
  };
  return points[level] ?? 1;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
