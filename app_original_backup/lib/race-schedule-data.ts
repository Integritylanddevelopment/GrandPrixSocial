export interface F1Race {
  id: string
  round: number
  name: string
  circuit: string
  location: string
  country: string
  date: string
  time: string
  timezone: string
  isSprint: boolean
  liveStreamOptions: {
    f1tv: string
    espn?: string
    skyf1?: string
    free?: string[]
  }
}

export const f1Schedule2025: F1Race[] = [
  {
    id: "bahrain-gp",
    round: 1,
    name: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    location: "Sakhir",
    country: "Bahrain",
    date: "2025-03-16",
    time: "15:00",
    timezone: "AST",
    isSprint: false,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
      free: ["RTBF (Belgium)"],
    },
  },
  {
    id: "saudi-arabia-gp",
    round: 2,
    name: "Saudi Arabian Grand Prix",
    circuit: "Jeddah Corniche Circuit",
    location: "Jeddah",
    country: "Saudi Arabia",
    date: "2025-03-23",
    time: "18:00",
    timezone: "AST",
    isSprint: false,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
    },
  },
  {
    id: "australia-gp",
    round: 3,
    name: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    location: "Melbourne",
    country: "Australia",
    date: "2025-04-06",
    time: "15:00",
    timezone: "AEDT",
    isSprint: false,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
    },
  },
  {
    id: "china-gp",
    round: 4,
    name: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit",
    location: "Shanghai",
    country: "China",
    date: "2025-04-20",
    time: "15:00",
    timezone: "CST",
    isSprint: true,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
    },
  },
  {
    id: "miami-gp",
    round: 5,
    name: "Miami Grand Prix",
    circuit: "Miami International Autodrome",
    location: "Miami",
    country: "United States",
    date: "2025-05-04",
    time: "15:30",
    timezone: "EDT",
    isSprint: true,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
    },
  },
  {
    id: "emilia-romagna-gp",
    round: 6,
    name: "Emilia Romagna Grand Prix",
    circuit: "Autodromo Enzo e Dino Ferrari",
    location: "Imola",
    country: "Italy",
    date: "2025-05-18",
    time: "15:00",
    timezone: "CEST",
    isSprint: false,
    liveStreamOptions: {
      f1tv: "https://f1tv.formula1.com",
      espn: "https://espn.com/f1",
    },
  },
]
