export interface RoutePoint {
  id: string;
  name: string;
  shortLabel: string;
  category: "start" | "pos" | "jalur" | "finish";
  iconType: "green_flag" | "house" | "yellow_flag" | "white_flag";
  lat: number;
  lng: number;
  description: string;
  instruction: string;
  color: string;
  coordinator?: {
    name: string;
    phone: string;
  };
}

export const ROUTE_WAYPOINTS: RoutePoint[] = [
  {
    id: "start",
    name: "START / TITIK MULAI",
    shortLabel: "START",
    category: "start",
    iconType: "green_flag",
    lat: -7.218451992767477,
    lng: 107.80349998280631,
    description: "Pelepasan Jalan Santai di Halaman Gedung Bale Pangatik Cabang PGRI Kec. Pasirwangi.",
    instruction: "Mulai perjalanan ke arah timur menyusuri rute menuju POS 1.",
    color: "#16a34a",
  },
  {
    id: "pos1",
    name: "POS 1",
    shortLabel: "POS 1",
    category: "pos",
    iconType: "house",
    lat: -7.219367727890052,
    lng: 107.80734870583608,
    description: "Pos pemeriksaan pertama dan pembagian kupon/stempel rute tahap 1.",
    instruction: "Lanjutkan ke utara menyusuri jalan desa menuju POS 2.",
    color: "#2563eb",
    coordinator: {
      name: "IMRON HADIANA, S.Pd.",
      phone: "08818297901",
    },
  },
  {
    id: "pos2",
    name: "POS 2",
    shortLabel: "POS 2",
    category: "pos",
    iconType: "house",
    lat: -7.21679990849421,
    lng: 107.80729774384645,
    description: "Pos pemeriksaan kedua & pos hidrasi air minum panitia.",
    instruction: "Lurus belok ke barat laut menuju POS 3 (tidak masuk gang buntu).",
    color: "#2563eb",
    coordinator: {
      name: "AHMAD RONI SAFARI, S.Pd.",
      phone: "082116941275",
    },
  },
  {
    id: "pos3",
    name: "POS 3",
    shortLabel: "POS 3",
    category: "pos",
    iconType: "house",
    lat: -7.214637873066037,
    lng: 107.80398923904548,
    description: "Pos pemeriksaan ketiga sebelum memasuki gerbang Jalur Perkebunan Pasirwangi.",
    instruction: "Langsung masuk ke Jalur Perkebunan ke arah barat daya menuju Jalur Keluar.",
    color: "#2563eb",
    coordinator: {
      name: "ASEP SOPIAN ANSORI, S.Pd.I.",
      phone: "089632911112",
    },
  },
  {
    id: "jalur_perkebunan",
    name: "JALUR PERKEBUNAN",
    shortLabel: "PERKEBUNAN",
    category: "jalur",
    iconType: "yellow_flag",
    lat: -7.2167990265619935,
    lng: 107.80081371280018,
    description: "Jalur alam perkebunan hijau Pasirwangi yang sejuk dan asri.",
    instruction: "Ikuti jalur setapak perkebunan yang telah diberi patok biru panitia hingga tiba di Jalur Keluar.",
    color: "#eab308",
  },
  {
    id: "jalur_keluar",
    name: "JALUR KELUAR",
    shortLabel: "KELUAR KEBUN",
    category: "jalur",
    iconType: "yellow_flag",
    lat: -7.21748443998297,
    lng: 107.79934365315559,
    description: "Titik resmi keluar dari area perkebunan menuju jalan desa penghubung ke POS 4.",
    instruction: "Lanjutkan ke timur menyusuri jalan desa menuju POS 4.",
    color: "#eab308",
  },
  {
    id: "pos4",
    name: "POS 4",
    shortLabel: "POS 4",
    category: "pos",
    iconType: "house",
    lat: -7.218083534978138,
    lng: 107.80139638207889,
    description: "Pos pemeriksaan keempat dan pengumpulan/verifikasi kupon doorprize utama.",
    instruction: "Lurus menuju garis FINISH untuk selebrasi dan pengundian hadiah!",
    color: "#2563eb",
    coordinator: {
      name: "DUDI ABDULAH, S.Pd.I.",
      phone: "081220548543",
    },
  },
  {
    id: "finish",
    name: "FINISH / GARIS AKHIR",
    shortLabel: "FINISH",
    category: "finish",
    iconType: "white_flag",
    lat: -7.218691562267869,
    lng: 107.80339194548816,
    description: "Garis akhir kegiatan Jalan Santai, panggung utama hiburan dan undian doorprize PGRI ke-81.",
    instruction: "Selamat! Silakan beristirahat dan nikmati panggung hiburan HGN & HUT PGRI ke-81.",
    color: "#0f172a",
  },
];

export const ROUTE_PATH_COORDINATES: [number, number][] = [[-7.218451992767477,107.80349998280631],[-7.218811,107.80356],[-7.218863,107.803845],[-7.218923,107.804252],[-7.21902,107.804939],[-7.21941,107.807255],[-7.219433,107.807388],[-7.219367727890052,107.80734870583608],[-7.2187,107.807515],[-7.218644,107.807525],[-7.218137,107.807627],[-7.217959,107.807662],[-7.217799,107.807703],[-7.217489,107.807804],[-7.217193,107.807945],[-7.217087,107.80797],[-7.216976,107.807949],[-7.216739,107.807921],[-7.21665,107.807911],[-7.216619,107.807903],[-7.216608,107.807883],[-7.216605,107.807858],[-7.216637,107.807819],[-7.216764,107.807693],[-7.216852,107.807591],[-7.216866,107.807519],[-7.216851,107.807458],[-7.216817,107.807408],[-7.216783,107.807386],[-7.21679990849421,107.80729774384645],[-7.216691,107.807327],[-7.216611,107.807262],[-7.216575,107.807162],[-7.216544,107.80703],[-7.216514,107.806971],[-7.216488,107.806907],[-7.2164,107.806858],[-7.21635,107.80681],[-7.216313,107.806744],[-7.216218,107.806628],[-7.216135,107.806565],[-7.216024,107.806525],[-7.215694,107.806405],[-7.215611,107.806372],[-7.215579,107.806331],[-7.21554,107.806221],[-7.215516,107.80603],[-7.215529,107.805926],[-7.215538,107.805802],[-7.215506,107.805674],[-7.215434,107.805493],[-7.215341,107.805255],[-7.215246,107.80506],[-7.215185,107.804962],[-7.215149,107.804904],[-7.215011,107.804804],[-7.214911,107.804744],[-7.214874,107.80472],[-7.214772,107.804572],[-7.214751,107.804495],[-7.214716,107.804285],[-7.214705,107.804226],[-7.21469,107.804166],[-7.214637873066037,107.80398923904548],[-7.21482,107.80365],[-7.21515,107.80312],[-7.21558,107.80245],[-7.21612,107.80175],[-7.21645,107.80128],[-7.2167990265619935,107.80081371280018],[-7.21702,107.80035],[-7.21728,107.79978],[-7.21748443998297,107.79934365315559],[-7.21758,107.79932],[-7.21776,107.79996],[-7.218,107.80085],[-7.218083534978138,107.80139638207889],[-7.21832,107.80205],[-7.218468,107.802423],[-7.218741,107.803255],[-7.218691562267869,107.80339194548816]];

export const EVENT_INFO = {
  title: "JALAN SANTAI",
  subtitle: "HGN DAN HUT KE-81 PGRI TAHUN 2026",
  district: "KECAMATAN PASIRWANGI",
  fullTitle: "RUTE JALAN SANTAI HGN DAN HUT KE-81 PGRI TAHUN 2026 KECAMATAN PASIRWANGI",
  organizer: "Panitia Jalan Santai HGN dan HUT ke-81 PGRI Tahun 2026 Kecamatan Pasirwangi",
  estimatedDistanceKm: 2.5,
  estimatedTimeMin: "30 - 40 Menit",
  mapCenter: [-7.2172, 107.8035] as [number, number],
  defaultZoom: 15,
};
