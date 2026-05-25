export interface UserSettings {
  raceDate: string
  startWeek: number
  paceRowIndex: number
  name?: string
}

export interface RunLog {
  id: string
  workoutId: string
  date: string
  distanceMiles?: number
  durationMinutes?: number
  avgPace?: string
  feeling?: 1 | 2 | 3 | 4 | 5
  notes?: string
  completed: boolean
}

const SETTINGS_KEY = 'nrc-hm-settings'
const LOGS_KEY = 'nrc-hm-logs'
const COMPLETED_KEY = 'nrc-hm-completed'

export function loadSettings(): UserSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as UserSettings) : null
  } catch {
    return null
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadLogs(): RunLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? (JSON.parse(raw) as RunLog[]) : []
  } catch {
    return []
  }
}

export function saveLogs(logs: RunLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function loadCompletedWorkouts(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

export function saveCompletedWorkouts(ids: Set<string>): void {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...ids]))
}

export function daysUntilRace(raceDate: string): number {
  const race = new Date(raceDate + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function currentPlanWeek(settings: UserSettings): number {
  const days = daysUntilRace(settings.raceDate)
  const weeksOut = Math.ceil(days / 7)
  const derived = Math.min(14, Math.max(1, weeksOut))
  return Math.min(settings.startWeek, derived)
}
