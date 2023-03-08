/**
 * All rights reserved (C) 2023 Muhammad Ragib Hasin
 */

type Elective1 = "eee4145" | "eee4165";

type Elective2 = "eee4143" | "eee4163" | "eee4183";

type StudentInfo = {
  roll: string;
  elective1: Elective1;
  elective2: Elective2;
};

type Section = "A" | "B" | "C";

type StudentInfoEx = StudentInfo & {
  rollInSeries: number;
  section: Section;
  thirty: 1 | 2;
};

type Cycle = "odd" | "even";

type ElectiveClass = {
  instructor: string;
  room: string;
  period: number;
  for?: [number, number];
  cycle?: Cycle;
};

type MandatoryClass = ElectiveClass & {
  course: string;
};

function setRoutineCookie() {
  const studentInfo = {
    roll: (document.getElementById("roll")! as HTMLInputElement).value,
    elective1: (
      document.querySelector(
        'input[name="elective1"]:checked'
      ) as HTMLInputElement
    ).value,
    elective2: (
      document.querySelector(
        'input[name="elective2"]:checked'
      ) as HTMLInputElement
    ).value,
  };

  const cookie = `studentInfo=${JSON.stringify(
    studentInfo
  )}; expires=1 Sep 2023 00:00:00 UTC+6`;

  console.log(cookie);
  document.cookie = cookie;
  window.location.reload();
}

function resetStudentInfo() {
  const cookie = "studentInfo=;expires=1 Sep 2023 00:00:00 UTC+6";
  document.cookie = cookie;
  window.location.reload();
}

function getCookie(cname: string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getStudentInfo(): StudentInfoEx | undefined {
  const _studentInfo = getCookie("studentInfo");
  const studentInfo =
    _studentInfo != "" ? (JSON.parse(_studentInfo) as StudentInfo) : undefined;

  if (studentInfo === undefined) return undefined;

  const rollInSeries = Number.parseInt(studentInfo.roll.slice(-3));
  const section = rollInSeries <= 60 ? "A" : rollInSeries <= 120 ? "B" : "C";
  const thirty = (rollInSeries + 1) % 60 <= 31 ? 1 : 2;

  return { rollInSeries, section, thirty, ...studentInfo };
}

function isClassApplicable(klass: ElectiveClass, student: StudentInfoEx) {
  return klass.for === undefined
    ? true
    : klass.for[0] <= student.rollInSeries &&
        klass.for[1] >= student.rollInSeries;
}

function isSessional(klass: ElectiveClass) {
  return klass.room.length !== 3;
}

function classSpan(klass: ElectiveClass) {
  return isSessional(klass) ? 3 : 1;
}

const mandatoryClasses: Record<Section, MandatoryClass[][]> = {
  A: [
    [
      // Sat
      {
        course: "EEE 4108",
        instructor: "SCM",
        room: "Computer Lab 1",
        period: 1,
      },
    ],
    [
      // Sun
      {
        course: "EEE 4118",
        instructor: "SHS",
        room: "Telecommunication Lab",
        period: 4,
      },
    ],
    [
      // Mon
      { course: "EEE 4117", instructor: "BH / TSJ", room: "402", period: 2 },
      { course: "EEE 4107", instructor: "SCM", room: "402", period: 3 },
    ],
    [
      // Tue
      { course: "EEE 4107", instructor: "SCM", room: "301", period: 1 },
      { course: "EEE 4117", instructor: "BH", room: "301", period: 2 },
      { course: "IPE 4111", instructor: "MRI", room: "403", period: 4 },
    ],
    [
      // Wed
      { course: "EEE 4107", instructor: "SCM", room: "101", period: 4 },
      { course: "IPE 4111", instructor: "SA", room: "101", period: 5 },
      { course: "EEE 4117", instructor: "TSJ", room: "101", period: 6 },
    ],
  ],
  B: [
    [
      // Sat
      { course: "EEE 4117", instructor: "TSJ", room: "102", period: 1 },
      { course: "IPE 4111", instructor: "MRI", room: "102", period: 2 },
      { course: "EEE 4107", instructor: "AM", room: "102", period: 3 },
    ],
    [
      // Sun
      { course: "IPE 4111", instructor: "SA", room: "101", period: 7 },
      { course: "EEE 4117", instructor: "TSJ", room: "101", period: 8 },
    ],
    [
      // Mon
      {
        course: "EEE 4108",
        instructor: "AM",
        room: "Computer Lab 1",
        period: 1,
        for: [61, 90],
        cycle: "even",
      },
      {
        course: "EEE 4108",
        instructor: "AM",
        room: "Computer Lab 1",
        period: 1,
        for: [91, 120],
        cycle: "odd",
      },
    ],
    [
      // Tue
      {
        course: "EEE 4118",
        instructor: "TSJ",
        room: "Telecommunication Lab",
        period: 4,
        for: [61, 90],
        cycle: "odd",
      },
      {
        course: "EEE 4118",
        instructor: "TSJ",
        room: "Telecommunication Lab",
        period: 4,
        for: [91, 120],
        cycle: "even",
      },
    ],
    [
      // Wed
      { course: "EEE 4117", instructor: "TSJ", room: "102", period: 1 },
      { course: "EEE 4107", instructor: "SCM", room: "102", period: 2 },
      {
        course: "EEE 4107",
        instructor: "AM / SCM",
        room: "102",
        period: 3,
      },
    ],
  ],
  C: [
    [
      // Sat
      {
        course: "EEE 4108",
        instructor: "AM",
        room: "Computer Lab 1",
        period: 4,
      },
    ],
    [
      // Sun
      { course: "EEE 4117", instructor: "BH", room: "301", period: 4 },
      { course: "IPE 4111", instructor: "MRI", room: "301", period: 5 },
      { course: "EEE 4107", instructor: "AM", room: "301", period: 6 },
    ],
    [
      // Mon
      { course: "EEE 4117", instructor: "BH", room: "301", period: 4 },
      { course: "EEE 4107", instructor: "AM", room: "301", period: 5 },
    ],
    [
      // Tue
      { course: "EEE 4107", instructor: "AM", room: "101", period: 4 },
      { course: "EEE 4117", instructor: "BH", room: "101", period: 5 },
      { course: "IPE 4111", instructor: "MRI", room: "101", period: 6 },
    ],
    [
      // Wed
      {
        course: "EEE 4118",
        instructor: "BH",
        room: "Telecommunication Lab",
        period: 4,
      },
    ],
  ],
};

const electiveClasses: Record<Elective1 | Elective2, ElectiveClass[][]> = {
  eee4143: [
    // Sat
    [{ instructor: "SMH", room: "403", period: 7, for: [61, 180] }],
    // Sun
    [{ instructor: "SMH", room: "Computer Lab 1", period: 1 }],
    // Mon
    [{ instructor: "SMH", room: "102", period: 7 }],
    // Tue
    [{ instructor: "SMH", room: "102", period: 8 }],
    // Wed
    [],
  ],
  eee4145: [
    // Sat
    [{ instructor: "MFH / SK", room: "403", period: 8 }],
    // Sun
    [],
    // Mon
    [{ instructor: "MFH", room: "402", period: 8 }],
    // Tue
    [{ instructor: "MFH", room: "301", period: 7 }],
    // Wed
    [{ instructor: "MFH", room: "Nanotechnology Lab", period: 7 }],
  ],
  eee4163: [
    // Sat
    [
      { instructor: "SHR", room: "402", period: 7, for: [1, 60] },
      { instructor: "SMH", room: "403", period: 7, for: [61, 180] },
    ],
    // Sun
    [
      {
        instructor: "SMH",
        room: "Computer Lab 1",
        period: 1,
        for: [1, 60],
        cycle: "odd",
      },
      {
        instructor: "SMH",
        room: "Computer Lab 1",
        period: 1,
        for: [61, 180],
        cycle: "even",
      },
    ],
    // Mon
    [
      { instructor: "SHR", room: "101", period: 7, for: [1, 60] },
      { instructor: "SMH", room: "102", period: 7, for: [61, 180] },
    ],
    // Tue
    [
      { instructor: "SHR", room: "101", period: 8, for: [1, 60] },
      { instructor: "SMH", room: "102", period: 8, for: [61, 180] },
    ],
    // Wed
    [],
  ],
  eee4165: [
    // Sat
    [{ instructor: "MFH / SK", room: "403", period: 8 }],
    // Sun
    [],
    // Mon
    [{ instructor: "MFH", room: "402", period: 8 }],
    // Tue
    [{ instructor: "MFH", room: "301", period: 7 }],
    // Wed
    [{ instructor: "MFH", room: "Nanotechnology Lab", period: 7 }],
  ],
  eee4183: [
    // Sat
    [{ instructor: "MFH / SK", room: "403", period: 8 }],
    // Sun
    [],
    // Mon
    [{ instructor: "MFH", room: "402", period: 8 }],
    // Tue
    [{ instructor: "MFH", room: "301", period: 7 }],
    // Wed
    [{ instructor: "MFH", room: "Nanotechnology Lab", period: 7 }],
  ],
};

const studentInfo = getStudentInfo();

if (studentInfo === undefined) {
  document.getElementById("studentInfo")!.classList.remove("hidden");
} else {
  for (const id of ["resetButton", "routine", "legends"])
    document.getElementById(id)!.classList.remove("hidden");

  function toMandatory(code: Elective1 | Elective2) {
    const className = `EEE ${code.slice(-4)}`;
    const classNameSess = `EEE ${Number.parseInt(code.slice(-4)) + 1}`;
    return (elective: ElectiveClass) =>
      ({
        course: isSessional(elective) ? classNameSess : className,
        ...elective,
      } as MandatoryClass);
  }

  const routine = mandatoryClasses[studentInfo.section]
    .map((mandatoryClasses, weekday) =>
      mandatoryClasses
        .concat(
          electiveClasses[studentInfo.elective1][weekday].map(
            toMandatory(studentInfo.elective1)
          )
        )
        .concat(
          electiveClasses[studentInfo.elective2][weekday].map(
            toMandatory(studentInfo.elective2)
          )
        )
    )
    .map((day) =>
      day
        .filter((klass) => isClassApplicable(klass, studentInfo))
        .sort((a, b) => a.period - b.period)
    );

  console.log(routine);

  const routineBody = document.getElementById(
    "routineBody"
  )! as HTMLTableSectionElement;

  function insertCell(dayRow: HTMLTableRowElement) {
    const cell = dayRow.insertCell();
    cell.className = "border border-stone-300 dark:border-stone-600 px-1";
    return cell;
  }

  function insertFreePeriod(dayRow: HTMLTableRowElement, free: number) {
    const cell = insertCell(dayRow);
    cell.colSpan = free;
  }

  let lastPeriod = 9;
  for (const [weekday, day] of routine.entries()) {
    if (lastPeriod !== 9)
      insertFreePeriod(routineBody.rows[weekday - 1], 9 - lastPeriod);
    lastPeriod = 0;
    const dayRow = routineBody.rows[weekday];

    for (const klass of day) {
      const { course, instructor, room, period, cycle } = klass;

      const advance = period - lastPeriod;
      if (advance !== 1) insertFreePeriod(dayRow, advance - 1);

      const contactHours = classSpan(klass);
      const cell = insertCell(dayRow);
      if (contactHours !== 1) cell.colSpan = contactHours;
      if (cycle !== undefined)
        cell.classList.add(
          ...["to-transparent"].concat(
            cycle === "odd"
              ? ["bg-diag-stripe-br", "from-amber-400", "dark:from-amber-700"]
              : [
                  "bg-diag-stripe-bl",
                  "from-emerald-400",
                  "dark:from-emerald-700",
                ]
          )
        );

      cell.innerHTML = `${course}<br>${instructor}<br>${room}`;

      lastPeriod = period + contactHours - 1;
    }
  }
}

declare function updateTheme(): void;

function toggleTheme() {
  localStorage.darkTheme =
    !(
      localStorage.darkTheme ??
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) || localStorage.darkTheme !== "true";
  updateTheme();
}

function resetTheme() {
  localStorage.removeItem("darkTheme");
  updateTheme();
}

let printThemeBackup: string | undefined;

window.onbeforeprint = (e) => {
  printThemeBackup = localStorage.darkTheme;
  localStorage.darkTheme = "false";
  updateTheme();
};

window.onafterprint = (e) => {
  localStorage.darkTheme = printThemeBackup;
  printThemeBackup = undefined;
  updateTheme();
};
