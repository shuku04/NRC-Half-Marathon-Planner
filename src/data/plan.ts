export type RunType = 'recovery' | 'speed' | 'long' | 'rest'

export interface Workout {
  id: string
  type: RunType
  title: string
  nrcGuide?: string
  duration?: string
  distance?: string
  structure: string[]
  dayOrder: number
}

export interface TrainingWeek {
  weekNumber: number
  label: string
  workouts: Workout[]
}

export const PACE_CHART = [
  { mileBest: '5:00', fiveK: '17:05/5:30', tenK: '35:45/5:45', tempo: '6:05', half: '1:18:00/6:00', marathon: '2:44:00/6:15', recovery: '7:00' },
  { mileBest: '5:30', fiveK: '18:45/6:00', tenK: '39:00/6:15', tempo: '6:35', half: '1:25:00/6:30', marathon: '3:00:00/6:50', recovery: '7:35' },
  { mileBest: '6:00', fiveK: '20:15/6:30', tenK: '42:00/6:45', tempo: '7:05', half: '1:35:00/7:15', marathon: '3:15:00/7:25', recovery: '8:10' },
  { mileBest: '6:30', fiveK: '22:00/7:05', tenK: '45:45/7:20', tempo: '7:40', half: '1:40:00/7:35', marathon: '3:30:00/8:00', recovery: '8:45' },
  { mileBest: '7:00', fiveK: '23:45/7:40', tenK: '49:00/7:55', tempo: '8:15', half: '1:50:00/8:20', marathon: '3:45:00/8:35', recovery: '9:20' },
  { mileBest: '7:30', fiveK: '25:15/8:05', tenK: '52:30/8:25', tempo: '8:50', half: '1:55:00/8:45', marathon: '4:00:00/9:10', recovery: '9:55' },
  { mileBest: '8:00', fiveK: '27:00/8:40', tenK: '55:50/9:00', tempo: '9:25', half: '2:05:00/9:30', marathon: '4:15:00/9:45', recovery: '10:30' },
  { mileBest: '8:30', fiveK: '28:30/9:10', tenK: '59:00/9:30', tempo: '9:55', half: '2:10:00/9:55', marathon: '4:30:00/10:15', recovery: '11:00' },
  { mileBest: '9:00', fiveK: '30:00/9:40', tenK: '62:30/10:00', tempo: '10:30', half: '2:20:00/10:40', marathon: '4:45:00/10:50', recovery: '11:35' },
  { mileBest: '9:30', fiveK: '31:45/10:15', tenK: '66:00/10:35', tempo: '11:00', half: '2:25:00/11:05', marathon: '5:00:00/11:25', recovery: '12:10' },
  { mileBest: '10:00', fiveK: '33:00/10:40', tenK: '69:00/11:05', tempo: '11:35', half: '2:35:00/11:45', marathon: '5:15:00/12:00', recovery: '12:45' },
  { mileBest: '10:30', fiveK: '35:00/11:15', tenK: '72:00/11:35', tempo: '12:00', half: '2:40:00/12:10', marathon: '5:30:00/12:35', recovery: '13:20' },
  { mileBest: '11:00', fiveK: '36:15/11:40', tenK: '75:00/12:00', tempo: '12:35', half: '2:50:00/12:55', marathon: '5:40:00/13:00', recovery: '13:45' },
  { mileBest: '11:30', fiveK: '38:00/12:15', tenK: '78:30/12:35', tempo: '13:00', half: '2:55:00/13:15', marathon: '5:50:00/13:20', recovery: '14:05' },
  { mileBest: '12:00', fiveK: '39:30/12:40', tenK: '81:30/13:05', tempo: '13:35', half: '3:05:00/14:05', marathon: '6:00:00/13:45', recovery: '14:30' },
] as const

function w(
  week: number,
  type: RunType,
  title: string,
  nrc: string | undefined,
  structure: string[],
  extra?: { duration?: string; distance?: string; dayOrder: number }
): Workout {
  return {
    id: `w${week}-${type}-${extra?.dayOrder ?? 0}`,
    type,
    title,
    nrcGuide: nrc,
    structure,
    duration: extra?.duration,
    distance: extra?.distance,
    dayOrder: extra?.dayOrder ?? 0,
  }
}

export const TRAINING_PLAN: TrainingWeek[] = [
  {
    weekNumber: 14,
    label: '14 Weeks to Go',
    workouts: [
      w(14, 'recovery', 'Recovery Run', '14 Weeks to Go', ['15:00 easy progression run'], { duration: '15 min', dayOrder: 1 }),
      w(14, 'speed', 'First Speed Run', 'First Speed Run', ['5:00 warm up', '8 × 1:00 @ 5K pace', '1:00 recovery between intervals'], { dayOrder: 2 }),
      w(14, 'recovery', 'Easy Run', 'Easy Run', ['25:00 recovery run'], { duration: '25 min', dayOrder: 3 }),
      w(14, 'speed', 'One Hard Two Easy', 'One Hard Two Easy', ['5:00 warm up', '21:00 fartlek', 'Alternate 1:00 hard / 2:00 easy'], { dayOrder: 4 }),
      w(14, 'long', '5K Run', '5K Run', ['5K / 3.1 mile progression long run'], { distance: '5K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 13,
    label: '13 Weeks to Go',
    workouts: [
      w(13, 'recovery', 'Recovery Run', '13 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(13, 'speed', 'No Time Go Time', 'No Time Go Time', ['5:00 warm up', '1:00 mile pace', '2:00 5K', '3:00 10K', '2:00 5K', '1:00 mile', '1:00 recovery between'], { dayOrder: 2 }),
      w(13, 'recovery', 'Headspace Recovery', 'Recovery Run with Headspace', ['35:00 easy run'], { duration: '35 min', dayOrder: 3 }),
      w(13, 'speed', 'Run Strong. Repeat.', 'Run Strong. Repeat.', ['5:00 warm up', '4 × 1:30 @ 5K', '1 × 1:30 mile', '4 × 1:30 @ 5K', '1 × 1:30 mile', '45s recovery after 5K / 1:00 after mile'], { dayOrder: 4 }),
      w(13, 'long', 'Four Mile Run', 'Four Mile Run', ['6.4K / 4 mile progression'], { distance: '4 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 12,
    label: '12 Weeks to Go',
    workouts: [
      w(12, 'recovery', 'Recovery Run', '12 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(12, 'speed', 'Runner Up (Hills)', 'Runner Up', ['5:00 warm up', '5 × (45s @ 10K effort + 15s best effort)', '1:15 recovery after 10K / 45s after best'], { dayOrder: 2 }),
      w(12, 'recovery', 'Just A Run', 'Just A Run', ['30:00 recovery'], { duration: '30 min', dayOrder: 3 }),
      w(12, 'speed', "Triple 7's", "Triple 7's", ['5:00 warm up', '3 × 7:00 @ 5K pace', '2:30 recovery between'], { dayOrder: 4 }),
      w(12, 'long', 'Five Mile Run', 'Five Mile Run', ['8K / 5 mile progression'], { distance: '5 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 11,
    label: '11 Weeks to Go',
    workouts: [
      w(11, 'recovery', 'Recovery Run', '11 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(11, 'speed', 'The Rundown', 'The Rundown', ['5:00 warm up', '3×1:00 mile + 3×2:00 5K + 2×1:00 mile + 2×2:00 5K + 1×1:00 mile + 1×2:00 5K', '1:00 recovery after mile / 1:30 after 5K'], { dayOrder: 2 }),
      w(11, 'recovery', 'Running Towards Your Goal', 'Running Towards Your Goal with Headspace', ['40:00 easy'], { duration: '40 min', dayOrder: 3 }),
      w(11, 'speed', 'Tempo with Emily Infeld', 'Tempo Run with Emily Infeld', ['7:00 warm up', '25:00 tempo'], { dayOrder: 4 }),
      w(11, 'long', '10K Run', '10K Run', ['10K / 6.2 mile progression'], { distance: '10K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 10,
    label: '10 Weeks to Go',
    workouts: [
      w(10, 'recovery', 'Recovery Run', '10 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(10, 'speed', 'Sneaky Speed', 'Sneaky Speed', ['5:00 warm up', '1×1:30 5K + 3×45s mile + repeat ×3', '1:00 recovery between'], { dayOrder: 2 }),
      w(10, 'recovery', '30 Minute Head Starts', '30 Minute Head Starts', ['30:00 easy'], { duration: '30 min', dayOrder: 3 }),
      w(10, 'speed', 'Out Strong Back Fast', 'Out Strong Back Fast', ['5:00 warm up', '23:00 progression tempo'], { dayOrder: 4 }),
      w(10, 'long', 'Another 10K Run', 'Another 10K Run', ['10K / 6.2 mile progression'], { distance: '10K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 9,
    label: '9 Weeks to Go',
    workouts: [
      w(9, 'recovery', 'Recovery Run', '9 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(9, 'speed', 'Run Fast. Repeat.', 'Run Fast. Repeat.', ['5:00 warm up', '20 × 0:30 mile pace (#1 & #11 @ 5K)', '1:00 recovery between'], { dayOrder: 2 }),
      w(9, 'recovery', 'Run with Shalane', 'Run with Shalane Flanagan', ['45:00 easy'], { duration: '45 min', dayOrder: 3 }),
      w(9, 'speed', 'Hill Hillier Hilliest', 'Hill Hillier Hilliest', ['5:00 warm up', '3 × (1:00 10K + 0:45 5K + 0:30 mile)', '2:00 / 1:30 / 1:00 recovery'], { dayOrder: 4 }),
      w(9, 'long', 'Eight Mile Run', 'Eight Mile Run', ['12.5K / 8 mile progression'], { distance: '8 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 8,
    label: '8 Weeks to Go',
    workouts: [
      w(8, 'recovery', 'Recovery Run', '8 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(8, 'speed', 'The Shifter', 'The Shifter', ['5:00 warm up', '4:00 recovery → 1:00 mile', '3:00 10K → 1:00 mile', '2:00 5K → 1:00 mile', '1:00 mile → 1:00 best'], { dayOrder: 2 }),
      w(8, 'recovery', 'Breaking Through Barriers', 'Breaking Through Barriers with Headspace', ['31:00 easy'], { duration: '31 min', dayOrder: 3 }),
      w(8, 'speed', 'Power Pyramid', 'Power Pyramid', ['5:00 warm up', '1:00 mile → 5:00 5K → 10:00 10K → 5:00 5K → 1:00 mile', '30s / 2:30 / 3:00 recovery'], { dayOrder: 4 }),
      w(8, 'long', '15K Run', '15K Run', ['15K / 9.5 mile progression'], { distance: '15K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 7,
    label: '7 Weeks to Go',
    workouts: [
      w(7, 'recovery', 'Recovery Run', '7 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(7, 'speed', 'Deuces', 'Deuces', ['5:00 warm up', '10 × 2:00 @ 5K', '1:00 recovery (#4 & #8: 2:00)'], { dayOrder: 2 }),
      w(7, 'recovery', 'Just Another Run', 'Just Another Run', ['35:00 easy'], { duration: '35 min', dayOrder: 3 }),
      w(7, 'speed', 'One Hard. One Easy.', 'One Hard. One Easy.', ['5:00 warm up', '15:00 fartlek', 'Alternate 1:00 hard / 1:00 easy'], { dayOrder: 4 }),
      w(7, 'long', 'Ten Mile Run', 'Ten Mile Run', ['16K / 10 mile progression'], { distance: '10 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 6,
    label: '6 Weeks to Go',
    workouts: [
      w(6, 'recovery', 'Recovery Run', '6 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(6, 'speed', 'Rock n Roller', 'Rock n Roller', ['6:00 warm up', '5:00 10K → 2:30 5K → 1:00 mile → 2×0:30 best → reverse', '1:30 recovery after 10K/5K / 1:00 after mile/best'], { dayOrder: 2 }),
      w(6, 'recovery', 'Suckcess Run', 'Suckcess Run', ['35:00 easy'], { duration: '35 min', dayOrder: 3 }),
      w(6, 'speed', '8K Tempo Run', '8K Tempo Run', ['2K warm up', '8K tempo', '2K cool down'], { dayOrder: 4 }),
      w(6, 'long', 'Another Ten Mile Run', 'Another Ten Mile Run', ['16K / 10 mile progression'], { distance: '10 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 5,
    label: '5 Weeks to Go',
    workouts: [
      w(5, 'recovery', 'Recovery Run', '5 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(5, 'speed', "90's", "90's", ['5:00 warm up', '3 × (1:30 5K + 1:30 10K + 1:30 mile)', '1:30 recovery between'], { dayOrder: 2 }),
      w(5, 'recovery', 'Thank You Run', 'Thank You Run', ['45:00 easy'], { duration: '45 min', dayOrder: 3 }),
      w(5, 'speed', 'Speedurance', 'Speedurance', ['7:00 warm up', '3×2:00 5K + 10:00 tempo + 3×2:00 5K', '1:00 / 2:00 recovery'], { dayOrder: 4 }),
      w(5, 'long', '13.1K Dress Rehearsal', '13.1K Dress Rehearsal', ['13.1K / 8 mile dress rehearsal'], { distance: '13.1K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 4,
    label: '4 Weeks to Go',
    workouts: [
      w(4, 'recovery', 'Recovery Run', '4 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(4, 'speed', '5 x 5 x 10K Pace', '5 x 5 x 10k Pace', ['5:00 warm up', '5 × 5:00 @ 10K pace', '2:00 recovery between'], { dayOrder: 2 }),
      w(4, 'recovery', 'Whole Run with Headspace', 'Whole Run with Headspace', ['45:00 easy'], { duration: '45 min', dayOrder: 3 }),
      w(4, 'speed', 'Two Hard. One Easy.', 'Two Hard. One Easy.', ['5:00 warm up', '21:00 fartlek', 'Alternate 2:00 hard / 1:00 easy'], { dayOrder: 4 }),
      w(4, 'long', '20K Run', '20K Run', ['20K / 12.5 mile progression'], { distance: '20K', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 3,
    label: '3 Weeks to Go',
    workouts: [
      w(3, 'recovery', 'Recovery Run', '3 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(3, 'speed', 'Long and Strong and Fast', 'Long and Strong and Fast', ['5:00 warm up', '3 × (8:00 10K + 4:00 5K + 2:00 mile)', '3:00 / 2:00 recovery'], { dayOrder: 2 }),
      w(3, 'recovery', 'Run with Eliud Kipchoge', 'Run with Eliud Kipchoge', ['60:00 easy'], { duration: '60 min', dayOrder: 3 }),
      w(3, 'speed', 'Bring It Down', 'Bring It Down', ['5:00 warm up', '15:00 progression tempo', '5:00 recovery → 4:00 10K → 3:00 5K → 2:00 mile → 1:00 best'], { dayOrder: 4 }),
      w(3, 'long', 'One Hour Run', 'One Hour Run', ['60:00 progression long run'], { duration: '60 min', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 2,
    label: '2 Weeks to Go',
    workouts: [
      w(2, 'recovery', 'Recovery Run', '2 Weeks to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(2, 'speed', 'Stronger Faster', 'Stronger Faster', ['5:00 warm up', '3 × (3:00 5K + 4×0:30 mile)', '2:00 / 1:00 recovery'], { dayOrder: 2 }),
      w(2, 'recovery', '5K Head Starts', '5K Head Starts', ['5K / 3.1 mile recovery'], { distance: '5K', dayOrder: 3 }),
      w(2, 'speed', 'In Control', 'In Control', ['6:00 warm up', '1:00 mile → 3:00 5K → 5:00 10K → 7:00 recovery', '30s / 1:30 / 2:30 recovery'], { dayOrder: 4 }),
      w(2, 'long', 'Seven Mile Run', 'Seven Mile Run', ['11K / 7 mile progression'], { distance: '7 mi', dayOrder: 5 }),
    ],
  },
  {
    weekNumber: 1,
    label: 'Race Week',
    workouts: [
      w(1, 'recovery', 'Recovery Run', '1 Week to Go', ['15:00 easy'], { duration: '15 min', dayOrder: 1 }),
      w(1, 'speed', 'The Speed Run Before…', 'The Speed Run Before…', ['5:00 warm up', '1:00 5K → 2:00 10K → 5:00 HM pace → 2:00 10K → 1:00 5K', '1:00 recovery between'], { dayOrder: 2 }),
      w(1, 'recovery', 'Big Day Run', 'Big Day Run with Headspace', ['25:00 easy'], { duration: '25 min', dayOrder: 3 }),
      w(1, 'recovery', 'Two Mile Run', 'Two Mile Run', ['3.2K / 2 mile shakeout'], { distance: '2 mi', dayOrder: 4 }),
      w(1, 'long', 'Half Marathon Race', 'Half Marathon Race', ['21.1K / 13.1 miles — race day!'], { distance: '13.1 mi', dayOrder: 5 }),
    ],
  },
]

export const RUN_TYPE_LABELS: Record<RunType, string> = {
  recovery: 'Recovery',
  speed: 'Speed',
  long: 'Long',
  rest: 'Rest',
}

export const RUN_TYPE_COLORS: Record<RunType, string> = {
  recovery: '#4ade80',
  speed: '#facc15',
  long: '#60a5fa',
  rest: '#a3a3a3',
}

export type PlanType = 'half' | 'marathon'

/** Marathon plan uses the same 14-week structure with distinct workout IDs. */
export const MARATHON_PLAN: TrainingWeek[] = TRAINING_PLAN.map((week) => ({
  ...week,
  label: week.label.replace('Half', 'Marathon'),
  workouts: week.workouts.map((workout) => ({
    ...workout,
    id: `m-${workout.id}`,
    title: workout.title.replace('Half Marathon', 'Marathon'),
  })),
}))

export function getTrainingPlan(planType: PlanType): TrainingWeek[] {
  return planType === 'marathon' ? MARATHON_PLAN : TRAINING_PLAN
}
