import { useEffect, useMemo, useState } from 'react'
import {
  PACE_CHART,
  RUN_TYPE_COLORS,
  RUN_TYPE_LABELS,
  TRAINING_PLAN,
  type Workout,
} from './data/plan'
import {
  currentPlanWeek,
  daysUntilRace,
  formatDistance,
  FREE_RUN_WORKOUT_ID,
  getDistanceUnit,
  kmToMiles,
  loadCompletedWorkouts,
  loadLogs,
  loadSettings,
  milesToKm,
  saveCompletedWorkouts,
  saveLogs,
  saveSettings,
  type DistanceUnit,
  type RunLog,
  type UserSettings,
} from './lib/storage'

type View = 'dashboard' | 'schedule' | 'log' | 'pace'

const FEELINGS = ['😫', '😕', '😐', '🙂', '🔥'] as const

function defaultRaceDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14 * 7)
  return d.toISOString().slice(0, 10)
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings | null>(() => loadSettings())
  const [logs, setLogs] = useState<RunLog[]>(() => loadLogs())
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompletedWorkouts())
  const [view, setView] = useState<View>('dashboard')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [logModal, setLogModal] = useState<Workout | 'free' | null>(null)
  const [saveToast, setSaveToast] = useState(false)

  const planWeek = settings ? currentPlanWeek(settings) : 14
  const activeWeek = selectedWeek ?? planWeek
  const weekData = TRAINING_PLAN.find((w) => w.weekNumber === activeWeek)

  useEffect(() => {
    if (settings) saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveLogs(logs)
  }, [logs])

  useEffect(() => {
    saveCompletedWorkouts(completed)
  }, [completed])

  const paceRow = settings ? PACE_CHART[settings.paceRowIndex] : null
  const distanceUnit = settings ? getDistanceUnit(settings) : 'mi'
  const allWorkouts = useMemo(
    () => TRAINING_PLAN.flatMap((w) => w.workouts),
    [],
  )

  const stats = useMemo(() => {
    const totalMiles = logs.reduce((s, l) => s + (l.distanceMiles ?? 0), 0)
    const totalRuns = logs.length
    const totalWorkouts = TRAINING_PLAN.reduce((s, w) => s + w.workouts.length, 0)
    const doneCount = completed.size
    const totalDistance =
      distanceUnit === 'km' ? milesToKm(totalMiles) : totalMiles
    return { totalMiles, totalDistance, totalRuns, doneCount, totalWorkouts }
  }, [logs, completed, distanceUnit])

  const weekProgress = useMemo(() => {
    if (!weekData) return 0
    const ids = weekData.workouts.map((w) => w.id)
    const done = ids.filter((id) => completed.has(id)).length
    return Math.round((done / ids.length) * 100)
  }, [weekData, completed])

  function toggleComplete(workoutId: string) {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(workoutId)) next.delete(workoutId)
      else next.add(workoutId)
      return next
    })
  }

  function submitLog(data: Omit<RunLog, 'id'>) {
    const entry: RunLog = { ...data, id: crypto.randomUUID() }
    setLogs((prev) => {
      const next = [entry, ...prev]
      saveLogs(next)
      return next
    })
    if (data.completed && data.workoutId !== FREE_RUN_WORKOUT_ID) {
      setCompleted((prev) => new Set(prev).add(data.workoutId))
    }
    setLogModal(null)
    setSaveToast(true)
    window.setTimeout(() => setSaveToast(false), 2500)
  }

  if (!settings) {
    return (
      <Onboarding
        onComplete={(s) => {
          setSettings(s)
          setSelectedWeek(s.startWeek)
        }}
      />
    )
  }

  const daysLeft = daysUntilRace(settings.raceDate)

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="logo">
            NRC <span>HALF</span>
          </h1>
          <p className="subtitle">14-week audio guided training tracker</p>
        </div>
        <nav className="nav">
          {(['dashboard', 'schedule', 'log', 'pace'] as View[]).map((v) => (
            <button
              key={v}
              className={view === v ? 'active' : ''}
              onClick={() => setView(v)}
            >
              {v === 'dashboard' ? 'Home' : v === 'schedule' ? 'Plan' : v === 'log' ? 'Runs' : 'Paces'}
            </button>
          ))}
        </nav>
      </header>

      {view === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="value">{daysLeft > 0 ? daysLeft : 0}</div>
              <div className="label">Days to race</div>
            </div>
            <div className="stat-card">
              <div className="value">W{planWeek}</div>
              <div className="label">Current week</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.doneCount}</div>
              <div className="label">Workouts done</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.totalDistance.toFixed(1)}</div>
              <div className="label">
                {distanceUnit === 'km' ? 'Kilometers logged' : 'Miles logged'}
              </div>
            </div>
          </div>

          {paceRow && (
            <div className="pace-targets">
              <PaceTarget label="Recovery" value={paceRow.recovery} />
              <PaceTarget label="Tempo" value={paceRow.tempo} />
              <PaceTarget label="5K avg" value={paceRow.fiveK.split('/')[1] ?? paceRow.fiveK} />
              <PaceTarget label="10K avg" value={paceRow.tenK.split('/')[1] ?? paceRow.tenK} />
              <PaceTarget label="Mile best" value={paceRow.mileBest} />
            </div>
          )}

          <h2 className="section-title">This week — {weekData?.label}</h2>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${weekProgress}%` }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.5rem 0 1.25rem' }}>
            {weekProgress}% complete
          </p>

          <div className="workout-list">
            {weekData?.workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                done={completed.has(workout.id)}
                onToggle={() => toggleComplete(workout.id)}
                onLog={() => setLogModal(workout)}
              />
            ))}
          </div>

          <a
            className="link-pdf"
            href="/plan.pdf"
            target="_blank"
            rel="noreferrer"
          >
            View official Nike PDF plan →
          </a>
        </>
      )}

      {view === 'schedule' && (
        <>
          <h2 className="section-title">Training schedule</h2>
          <div className="week-tabs">
            {TRAINING_PLAN.map((w) => (
              <button
                key={w.weekNumber}
                className={`week-tab ${activeWeek === w.weekNumber ? 'active' : ''} ${planWeek === w.weekNumber ? 'current' : ''}`}
                onClick={() => setSelectedWeek(w.weekNumber)}
              >
                W{w.weekNumber}
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {weekData?.label} — 5 runs per week (2 recovery, 2 speed, 1 long). Rest days between hard efforts.
          </p>
          <div className="workout-list">
            {weekData?.workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                done={completed.has(workout.id)}
                onToggle={() => toggleComplete(workout.id)}
                onLog={() => setLogModal(workout)}
                expanded
              />
            ))}
          </div>
        </>
      )}

      {view === 'log' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Run log</h2>
            <button className="btn btn-primary" onClick={() => setLogModal('free')}>
              + Log run
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="empty">
              <p>No runs logged yet.</p>
              <p style={{ marginTop: '0.5rem' }}>Complete a workout or log a free run.</p>
            </div>
          ) : (
            <div className="log-list">
              {logs.map((log) => {
                const workout = allWorkouts.find((w) => w.id === log.workoutId)
                const title =
                  log.workoutId === FREE_RUN_WORKOUT_ID
                    ? 'Run'
                    : (workout?.title ?? 'Run')
                return (
                  <div key={log.id} className="log-card">
                    <div>
                      <div className="date">{formatDate(log.date)}</div>
                      <div className="title">{title}</div>
                      <div className="log-stats">
                        {log.distanceMiles != null && (
                          <span>{formatDistance(log.distanceMiles, distanceUnit)}</span>
                        )}
                        {log.durationMinutes != null && <span>{log.durationMinutes} min</span>}
                        {log.avgPace && (
                          <span>
                            {log.avgPace} {distanceUnit === 'km' ? '/km' : '/mi'}
                          </span>
                        )}
                        {log.feeling && <span>{FEELINGS[log.feeling - 1]}</span>}
                      </div>
                      {log.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      onClick={() => setLogs((prev) => prev.filter((l) => l.id !== log.id))}
                    >
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {view === 'pace' && (
        <>
          <h2 className="section-title">Your pace targets</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            From the Nike pace chart — use as a guide, not a robot. Adjust by feel, weather, and fatigue.
          </p>
          {paceRow && (
            <div className="pace-targets" style={{ marginBottom: '1.5rem' }}>
              <PaceTarget label="Mile best" value={paceRow.mileBest} />
              <PaceTarget label="5K" value={paceRow.fiveK} />
              <PaceTarget label="10K" value={paceRow.tenK} />
              <PaceTarget label="Tempo" value={paceRow.tempo} />
              <PaceTarget label="Half marathon" value={paceRow.half} />
              <PaceTarget label="Marathon" value={paceRow.marathon} />
              <PaceTarget label="Recovery day" value={paceRow.recovery} />
            </div>
          )}
          <PaceChartPicker
            selected={settings.paceRowIndex}
            onSelect={(idx) => setSettings({ ...settings, paceRowIndex: idx })}
          />
          <div style={{ marginTop: '2rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Settings</h3>
            <SettingsForm settings={settings} onChange={setSettings} />
          </div>
        </>
      )}

      {logModal && (
        <LogModal
          workout={logModal === 'free' ? undefined : logModal}
          workouts={allWorkouts}
          distanceUnit={distanceUnit}
          onClose={() => setLogModal(null)}
          onSubmit={submitLog}
        />
      )}

      {saveToast && <div className="toast">Run saved to your log</div>}
    </div>
  )
}

function PaceTarget({ label, value }: { label: string; value: string }) {
  return (
    <div className="pace-target">
      <div className="pt-label">{label}</div>
      <div className="pt-value">{value}</div>
    </div>
  )
}

function WorkoutCard({
  workout,
  done,
  onToggle,
  onLog,
  expanded = false,
}: {
  workout: Workout
  done: boolean
  onToggle: () => void
  onLog: () => void
  expanded?: boolean
}) {
  const color = RUN_TYPE_COLORS[workout.type]
  return (
    <article className={`workout-card ${done ? 'done' : ''}`}>
      <div className="workout-card-header">
        <div>
          <span
            className="workout-type"
            style={{ background: `${color}22`, color }}
          >
            {RUN_TYPE_LABELS[workout.type]}
          </span>
          <div className="workout-title">{workout.title}</div>
          <div className="workout-meta">
            {workout.nrcGuide && <>NRC: {workout.nrcGuide}</>}
            {workout.duration && <> · {workout.duration}</>}
            {workout.distance && <> · {workout.distance}</>}
          </div>
        </div>
        <button
          className={`btn-check ${done ? 'checked' : ''}`}
          onClick={onToggle}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {done ? '✓' : ''}
        </button>
      </div>
      {(expanded || workout.structure.length <= 3) && (
        <ul className="workout-structure">
          {workout.structure.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
      <div className="workout-actions">
        <button className="btn btn-primary" onClick={onLog}>
          Log run
        </button>
      </div>
    </article>
  )
}

function Onboarding({ onComplete }: { onComplete: (s: UserSettings) => void }) {
  const [raceDate, setRaceDate] = useState(defaultRaceDate())
  const [startWeek, setStartWeek] = useState(14)
  const [paceRowIndex, setPaceRowIndex] = useState(6)
  const [name, setName] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mi')

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <h1>
          NRC <span>HALF</span>
        </h1>
        <p>
          Track your Nike Run Club 14-week half marathon plan. Set your race day, pick your pace row, and start logging runs.
        </p>
        <div className="form-group">
          <label>Your name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Runner" />
        </div>
        <div className="form-group">
          <label>Race day</label>
          <input type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Starting week (if joining mid-plan)</label>
          <select value={startWeek} onChange={(e) => setStartWeek(Number(e.target.value))}>
            {TRAINING_PLAN.map((w) => (
              <option key={w.weekNumber} value={w.weekNumber}>
                Week {w.weekNumber} — {w.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Pace chart row — tap your closest 5K or mile best</label>
          <PaceChartPicker selected={paceRowIndex} onSelect={setPaceRowIndex} compact />
        </div>
        <div className="form-group">
          <label>Distance unit</label>
          <DistanceUnitToggle unit={distanceUnit} onChange={setDistanceUnit} />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          onClick={() =>
            onComplete({
              raceDate,
              startWeek,
              paceRowIndex,
              name: name || undefined,
              distanceUnit,
            })
          }
        >
          Start training
        </button>
      </div>
    </div>
  )
}

function PaceChartPicker({
  selected,
  onSelect,
  compact = false,
}: {
  selected: number
  onSelect: (i: number) => void
  compact?: boolean
}) {
  return (
    <div className="pace-table-wrap">
      <table className="pace-table">
        <thead>
          <tr>
            <th>Mile</th>
            <th>5K</th>
            {!compact && <th>10K</th>}
            {!compact && <th>Tempo</th>}
            <th>Recovery</th>
          </tr>
        </thead>
        <tbody>
          {PACE_CHART.map((row, i) => (
            <tr
              key={row.mileBest}
              className={i === selected ? 'selected' : ''}
              onClick={() => onSelect(i)}
            >
              <td>{row.mileBest}</td>
              <td>{row.fiveK}</td>
              {!compact && <td>{row.tenK}</td>}
              {!compact && <td>{row.tempo}</td>}
              <td>{row.recovery}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DistanceUnitToggle({
  unit,
  onChange,
}: {
  unit: DistanceUnit
  onChange: (unit: DistanceUnit) => void
}) {
  return (
    <div className="unit-toggle" role="group" aria-label="Distance unit">
      <button
        type="button"
        className={unit === 'mi' ? 'active' : ''}
        onClick={() => onChange('mi')}
      >
        Miles
      </button>
      <button
        type="button"
        className={unit === 'km' ? 'active' : ''}
        onClick={() => onChange('km')}
      >
        Kilometers
      </button>
    </div>
  )
}

function SettingsForm({
  settings,
  onChange,
}: {
  settings: UserSettings
  onChange: (s: UserSettings) => void
}) {
  const unit = getDistanceUnit(settings)
  return (
    <div style={{ maxWidth: 400 }}>
      <div className="form-group">
        <label>Distance unit</label>
        <DistanceUnitToggle
          unit={unit}
          onChange={(distanceUnit) => onChange({ ...settings, distanceUnit })}
        />
      </div>
      <div className="form-group">
        <label>Race day</label>
        <input
          type="date"
          value={settings.raceDate}
          onChange={(e) => onChange({ ...settings, raceDate: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Plan start week</label>
        <select
          value={settings.startWeek}
          onChange={(e) => onChange({ ...settings, startWeek: Number(e.target.value) })}
        >
          {TRAINING_PLAN.map((w) => (
            <option key={w.weekNumber} value={w.weekNumber}>
              Week {w.weekNumber}
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-ghost"
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
      >
        Reset all data
      </button>
    </div>
  )
}

function LogModal({
  workout,
  workouts,
  distanceUnit,
  onClose,
  onSubmit,
}: {
  workout?: Workout
  workouts: Workout[]
  distanceUnit: DistanceUnit
  onClose: () => void
  onSubmit: (log: Omit<RunLog, 'id'>) => void
}) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(
    workout?.id ?? FREE_RUN_WORKOUT_ID,
  )
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [pace, setPace] = useState('')
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5 | undefined>()
  const [notes, setNotes] = useState('')
  const [markComplete, setMarkComplete] = useState(Boolean(workout))
  const isPlanWorkout = selectedWorkoutId !== FREE_RUN_WORKOUT_ID
  const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId)
  const modalTitle = workout
    ? workout.title
    : selectedWorkout?.title ?? 'Run'

  function parseDistance(): number | undefined {
    if (!distance) return undefined
    const value = parseFloat(distance)
    if (Number.isNaN(value)) return undefined
    return distanceUnit === 'km' ? kmToMiles(value) : value
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Log — {modalTitle}</h2>
        {!workout && (
          <div className="form-group">
            <label>Workout (optional)</label>
            <select
              value={selectedWorkoutId}
              onChange={(e) => {
                const id = e.target.value
                setSelectedWorkoutId(id)
                setMarkComplete(id !== FREE_RUN_WORKOUT_ID)
              }}
            >
              <option value={FREE_RUN_WORKOUT_ID}>General run (not tied to plan)</option>
              {TRAINING_PLAN.map((week) => (
                <optgroup key={week.weekNumber} label={`Week ${week.weekNumber} — ${week.label}`}>
                  {week.workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Distance ({distanceUnit === 'km' ? 'km' : 'mi'})</label>
            <input
              type="number"
              step={distanceUnit === 'km' ? '0.01' : '0.1'}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder={distanceUnit === 'km' ? '5' : '3.1'}
            />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Avg pace (min/{distanceUnit === 'km' ? 'km' : 'mi'})</label>
          <input
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            placeholder={distanceUnit === 'km' ? '5:45' : '9:30'}
          />
        </div>
        <div className="form-group">
          <label>How did it feel?</label>
          <div className="feeling-row">
            {FEELINGS.map((emoji, i) => (
              <button
                key={i}
                type="button"
                className={`feeling-btn ${feeling === i + 1 ? 'selected' : ''}`}
                onClick={() => setFeeling((i + 1) as 1 | 2 | 3 | 4 | 5)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Weather, how legs felt…" />
        </div>
        {isPlanWorkout && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={markComplete}
              onChange={(e) => setMarkComplete(e.target.checked)}
            />
            Mark workout complete
          </label>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSubmit({
                workoutId: workout?.id ?? selectedWorkoutId,
                date,
                distanceMiles: parseDistance(),
                durationMinutes: duration ? parseInt(duration, 10) : undefined,
                avgPace: pace || undefined,
                feeling,
                notes: notes || undefined,
                completed: isPlanWorkout && markComplete,
              })
            }
          >
            Save run
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
