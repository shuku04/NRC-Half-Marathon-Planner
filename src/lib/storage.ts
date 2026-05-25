export type DistanceUnit = 'mi' | 'km'

export const MI_TO_KM = 1.60934

export const FREE_RUN_WORKOUT_ID = 'free-run'

export type PlanType = 'half' | 'marathon'

export interface UserSettings {
  raceDate: string
  startWeek: number
  paceRowIndex: number
  name?: string
  distanceUnit?: DistanceUnit
  planType?: PlanType
}

export function getDistanceUnit(settings: UserSettings): DistanceUnit {
  return settings.distanceUnit ?? 'mi'
}

export function milesToKm(miles: number): number {
  return miles * MI_TO_KM
}

export function kmToMiles(km: number): number {
  return km / MI_TO_KM
}

export function formatDistance(miles: number | undefined, unit: DistanceUnit): string {
  if (miles == null) return ''
  if (unit === 'km') return `${milesToKm(miles).toFixed(2)} km`
  return `${miles.toFixed(1)} mi`
}

/** Format decimal minutes as M:SS (e.g. 5.75 → "5:45"). */
export function formatPaceMinutes(minutesPerUnit: number): string {
  const totalSeconds = Math.round(minutesPerUnit * 60)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Pace in min/unit from duration and distance in the given unit. */
export function computePace(
  durationMinutes: number,
  distanceInUnit: number,
): string | undefined {
  if (durationMinutes <= 0 || distanceInUnit <= 0) return undefined
  return formatPaceMinutes(durationMinutes / distanceInUnit)
}

export function paceFromLog(
  log: Pick<RunLog, 'distanceMiles' | 'durationMinutes'>,
  unit: DistanceUnit,
): string | undefined {
  if (!log.durationMinutes || !log.distanceMiles) return undefined
  const distanceInUnit =
    unit === 'km' ? milesToKm(log.distanceMiles) : log.distanceMiles
  return computePace(log.durationMinutes, distanceInUnit)
}

/** Both min/mi and min/km when distance and duration are known. */
export function formatPacePair(
  log: Pick<RunLog, 'distanceMiles' | 'durationMinutes' | 'avgPace'>,
  preferredUnit: DistanceUnit,
): string | undefined {
  const perMi = paceFromLog(log, 'mi')
  const perKm = paceFromLog(log, 'km')
  if (perMi && perKm) {
    return preferredUnit === 'km'
      ? `${perKm} /km · ${perMi} /mi`
      : `${perMi} /mi · ${perKm} /km`
  }
  if (log.avgPace) {
    return `${log.avgPace} ${preferredUnit === 'km' ? '/km' : '/mi'}`
  }
  return undefined
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
