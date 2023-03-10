/**
 * All rights reserved (C) 2023 Muhammad Ragib Hasin
 */

enum Elective1 {
  "eee4141" = "eee4141",
  "eee4165" = "eee4165",
}

enum Elective2 {
  "eee4143" = "eee4143",
  "eee4163" = "eee4163",
  "eee4183" = "eee4183",
}

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
  duration?: number;
  for?: [number, number];
  cycle?: Cycle;
};

type MandatoryClass = ElectiveClass & {
  course: string;
};

function isValidStudentInfo(student: StudentInfo): boolean {
  return (
    student.roll.length === 7 &&
    student.roll.slice(0, 4) === "1801" &&
    (() => {
      const roll = Number.parseInt(student.roll.slice(-3));
      return roll > 0 && roll <= 180;
    })() &&
    Object.values<string>(Elective1).includes(student.elective1 as string) &&
    Object.values<string>(Elective2).includes(student.elective2 as string)
  );
}

function submitStudentInfo() {
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
  } as StudentInfo;

  if (!isValidStudentInfo(studentInfo)) {
    document.getElementById("roll")!.focus();
    return;
  }

  const cookie = `studentInfo=${JSON.stringify(
    studentInfo
  )}; expires=1 Sep 2023 00:00:00 UTC+6`;

  console.log(cookie);
  document.cookie = cookie;
  window.location.reload();
}

const EMPTY_COOKIE = "studentInfo=;expires=1 Sep 2023 00:00:00 UTC+6";

function resetStudentInfo() {
  document.cookie = EMPTY_COOKIE;
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
  const cookie = getCookie("studentInfo");
  const student =
    cookie != "" ? (JSON.parse(cookie) as StudentInfo) : undefined;

  if (student === undefined || !isValidStudentInfo(student)) {
    document.cookie = EMPTY_COOKIE;
    return undefined;
  }

  const rollInSeries = Number.parseInt(student.roll.slice(-3));
  const section = rollInSeries <= 60 ? "A" : rollInSeries <= 120 ? "B" : "C";
  const thirty = (rollInSeries + 1) % 60 <= 31 ? 1 : 2;

  return { rollInSeries, section, thirty, ...student };
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

function classDuration(klass: ElectiveClass) {
  return klass.duration ?? (isSessional(klass) ? 3 : 1);
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
  eee4141: [
    // Sat
    [
      { instructor: "RAR", room: "402", period: 8, duration: 2, for: [1, 82] },
      { instructor: "ABM", room: "302", period: 8, for: [83, 180] },
    ],
    // Sun
    [],
    // Mon
    [{ instructor: "ABM", room: "102", period: 8, for: [83, 180] }],
    // Tue
    [
      { instructor: "RAR", room: "101", period: 7, for: [1, 82] },
      { instructor: "ABM", room: "102", period: 7, for: [83, 180] },
    ],
    // Wed
    [
      {
        instructor: "RAR",
        room: "IoT Lab",
        period: 7,
        for: [1, 82],
        cycle: "odd",
      },
      {
        instructor: "MMI",
        room: "Computer Lab 2",
        period: 7,
        for: [83, 180],
        cycle: "odd",
      },
    ],
  ],
  eee4143: [
    // Sat
    [{ instructor: "SMR", room: "302", period: 7 }],
    // Sun
    [{ instructor: "MMI", room: "Green Energy Lab", period: 1, cycle: "even" }],
    // Mon
    [{ instructor: "MNA", room: "402", period: 7 }],
    // Tue
    [{ instructor: "SMR / MNA", room: "301", period: 8 }],
    // Wed
    [],
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
    [
      {
        instructor: "MFH",
        room: "Nanotechnology Lab",
        period: 7,
        cycle: "even",
      },
    ],
  ],
  eee4183: [
    // Sat
    [{ instructor: "MZI", room: "301", period: 7 }],
    // Sun
    [
      {
        instructor: "MZI",
        room: "Telecommunication Lab",
        period: 1,
        cycle: "even",
      },
    ],
    // Mon
    [{ instructor: "MZI", room: "403", period: 7 }],
    // Tue
    [{ instructor: "MZI", room: "302", period: 8 }],
    // Wed
    [],
  ],
};

const courses: Record<string, string> = {
  "IPE 4111": "Project and Operations Management",
  "EEE 4107": "Digital Signal Processing",
  "EEE 4117": "Radio and TV Engineering",
  "EEE 4141": "Power System II",
  "EEE 4143": "High Voltage Engineering",
  "EEE 4163": "VLSI",
  "EEE 4165": "Processing and Fabrication",
  "EEE 4183": "Digital Communication",

  "EEE 4108": "Digital Signal Processing Sessional",
  "EEE 4118": "Radio and TV Engineering Sessional",
  "EEE 4142": "Power System II Sessional",
  "EEE 4144": "High Voltage Engineering Sessional",
  "EEE 4164": "VLSI Sessional",
  "EEE 4166": "Processing and Fabrication Sessional",
  "EEE 4184": "Digital Communication Sessional",
};

const instructors: Record<string, Record<string, string>> = {
  EEE: {
    AGK: "Prof. Dr. Muhammad Abdul Goffar Khan",
    RIS: "Prof. Dr. Md. Rafiqul Islam Sheikh",
    SMR: "Prof. Dr. S. M. Abdur Razzak",
    MZI: "Prof. Dr. Md. Zahurul Islam Sarkar",
    AKS: "Prof. Dr. Ajay Krishno Sarkar",
    MFH: "Prof. Dr. Md. Faruk Hossain",
    MSA: "Prof. Dr. Md. Shamim Anower",
    MSI: "Prof. Dr. Md. Shahidul Islam",
    MSH: "Prof. Dr. Md. Selim Hossain",
    MR: "Prof. Dr. Md. Masud Rana",
    MSR: "Prof. Dr. Md. Sohel Rana",
    AK: "Prof. Dr. Abdul Khaleque",
    SH: "Prof. Dr. Md. Samiul Habib",
    TA: "Prof. Dr. Tanvir Ahmed",

    GKM: "Dr. G.K.M. Hasanuzzaman<br>Associate Professor",

    ASMS: "Abu Sadat Md. Sayem<br>Assistant Professor",
    JEG: "Dr. Jishan-E-Giti<br>Assistant Professor",
    MMR: "Md. Mamunur Rashid<br>Assistant Professor",
    SKG: "Subrato Kumar Ghosh<br>Assistant Professor",
    SCM: "Shadhon Chandra Mohonta<br>Assistant Professor",
    MRI: "Md. Rashidul Islam<br>Assistant Professor",
    SK: "Dr. Sumaiya Kabir<br>Assistant Professor",
    KT: "Kusum Tara<br>Assistant Professor",
    AKP: "Alok Kumar Paul<br>Assistant Professor",
    MTH: "Md. Tarek Hossein<br>Assistant Professor",
    MIR: "Md. Ilias Rahman<br>Assistant Professor",
    AM: "Dr. Mohammod Abdul Motin<br>Assistant Professor",
    MRC: "Md. Razon Chowdhury<br>Assistant Professor",
    RAR: "Ruhul Amin Ratul<br>Assistant Professor",
    BH: "Belal Hossain<br>Assistant Professor",
    ABM: "Md. Abdul Malek<br>Assistant Professor",
    MFM: "Md. Firoz Mahmud<br>Assistant Professor",

    SHS: "Md. Sarwar Hosen<br>Lecturer",
    MAR: "Md. Arafat Rahman<br>Lecturer",
    SMH: "Sohani Munteha Hiam<br>Lecturer",
    SHR: "Sunjidah Hossain<br>Lecturer",
    MMH: "Md. Mahmudul Hasan<br>Lecturer",
    SS: "Sarjana Shabab<br>Lecturer",
    MMI: "Md. Mayenul Islam<br>Lecturer",
    MNA: "Md. Nuhi-Alamin<br>Lecturer",
    TSJ: "Tasneem Sarkar Joyeeta<br>Lecturer",
  },
  IPE: {
    SA: "Sonia Akhter<br>Assistant Professor",
    MRI: "Md. Rakibul Islam<br>Assistant Professor",
  },
};

const studentInfo = getStudentInfo();

if (studentInfo === undefined) {
  for (const id of ["studentInfo", "headerGeneric"])
    document.getElementById(id)!.classList.remove("hidden");
} else {
  const studentName = getCookie("studentName");
  document.getElementById("studentName")!.innerText =
    studentName !== "" ? studentName : studentInfo.roll;

  document.getElementById("electiveNames")!.innerText =
    `EEE ${studentInfo.elective1.slice(-4)} and ` +
    `EEE ${studentInfo.elective2.slice(-4)}`;

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

  function insertFreePeriod(dayRow: HTMLTableRowElement, free: number) {
    const cell = dayRow.insertCell();
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
      const courseTitle = courses[course] ?? "";

      const advance = period - lastPeriod;
      if (advance !== 1) insertFreePeriod(dayRow, advance - 1);

      const contactHours = classDuration(klass);
      const cell = dayRow.insertCell();
      if (contactHours !== 1) cell.colSpan = contactHours;
      if (cycle !== undefined)
        cell.classList.add(
          ...["marked-cell", cycle === "odd" ? "mark-odd" : "mark-even"]
        );

      const instructorHtml = instructor
        .split(" / ")
        .map((instructor) => {
          const instructorName = instructors[course.slice(0, 3)][instructor];
          return instructorName === undefined
            ? instructor
            : `
<span class="tooltip-target">${instructor}</span>
<span class="tooltip">${instructorName}</span>
`;
        })
        .join(" / ");

      cell.innerHTML = `
<span class="tooltip-parent tooltip-target">
  ${course}
  <span class="tooltip">${courseTitle}</span>
</span>
<br>
<span class="tooltip-parent">
  ${instructorHtml}
</span>
<br>
${room}`;

      lastPeriod = period + contactHours - 1;
    }
  }

  for (const id of [
    "resetButton",
    "orientationNotice",
    "screenSizeNotice",
    "headerPersonal",
  ])
    document.getElementById(id)!.classList.remove("hidden");

  for (const [id, classes] of Object.entries({
    routine: ["sm:table"],
    legends: ["sm:grid"],
  }))
    document.getElementById(id)!.classList.add(...classes);
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
