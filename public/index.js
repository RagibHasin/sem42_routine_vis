"use strict";
/*
 * All rights reserved (C) 2023 Muhammad Ragib Hasin
 */
var Elective3;
(function (Elective3) {
    Elective3["eee4241"] = "eee4241";
    Elective3["eee4261"] = "eee4261";
})(Elective3 || (Elective3 = {}));
var Elective4;
(function (Elective4) {
    Elective4["eee4283"] = "eee4283";
})(Elective4 || (Elective4 = {}));
var Elective5;
(function (Elective5) {
    Elective5["eee4247"] = "eee4247";
    Elective5["eee4269"] = "eee4269";
})(Elective5 || (Elective5 = {}));
function isValidStudentInfo(student) {
    return (student.roll.length === 7 &&
        student.roll.slice(0, 4) === "1801" &&
        (() => {
            const roll = Number.parseInt(student.roll.slice(-3));
            return roll > 0 && roll <= 180;
        })() &&
        Object.values(Elective3).includes(student.elective3) &&
        Object.values(Elective4).includes(student.elective4));
}
function submitStudentInfo() {
    const studentInfo = {
        roll: document.getElementById("roll").value,
        elective3: document.querySelector('input[name="elective3"]:checked').value,
        elective4: document.querySelector('input[name="elective4"]:checked').value,
        elective5: document.querySelector('input[name="elective5"]:checked').value,
    };
    if (!isValidStudentInfo(studentInfo)) {
        document.getElementById("roll").focus();
        return;
    }
    const cookie = `studentInfo=${JSON.stringify(studentInfo)}; expires=1 Apr 2024 00:00:00 UTC+6`;
    console.log(cookie);
    document.cookie = cookie;
    window.location.reload();
}
const EMPTY_COOKIE = "studentInfo=;expires=1 Apr 2024 00:00:00 UTC+6";
function resetStudentInfo() {
    document.cookie = EMPTY_COOKIE;
    window.location.reload();
}
function getCookie(cname) {
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
function getStudentInfo() {
    const cookie = getCookie("studentInfo");
    const student = cookie != "" ? JSON.parse(cookie) : undefined;
    if (student === undefined || !isValidStudentInfo(student)) {
        document.cookie = EMPTY_COOKIE;
        return undefined;
    }
    const rollInSeries = Number.parseInt(student.roll.slice(-3));
    const section = rollInSeries <= 60 ? "A" : rollInSeries <= 120 ? "B" : "C";
    const thirty = (rollInSeries + 1) % 60 <= 31 ? 1 : 2;
    return { rollInSeries, section, thirty, ...student };
}
function isClassApplicable(klass, student) {
    return klass.for === undefined
        ? true
        : klass.for[0] <= student.rollInSeries &&
            klass.for[1] >= student.rollInSeries;
}
function isSessional(klass) {
    return klass.room.length !== 3;
}
function classDuration(klass) {
    return klass.duration ?? (isSessional(klass) ? 3 : 1);
}
const mandatoryClasses = {
    A: [
        [
            // Sat
            {
                course: "EEE 4209",
                instructor: "MRC",
                room: "402",
                period: 5,
            },
        ],
        [
            // Sun
            {
                course: "EEE 4217",
                instructor: "JEG",
                room: "301",
                period: 4,
            },
            {
                course: "EEE 4209",
                instructor: "MRC",
                room: "301",
                period: 6,
            },
        ],
        [
            // Mon
            {
                course: "EEE 4209",
                instructor: "MRC",
                room: "301",
                period: 5,
            },
            {
                course: "EEE 4200",
                instructor: "MSR",
                room: "301",
                period: 8,
                duration: 2,
            },
        ],
        [
            // Tue
            { course: "EEE 4217", instructor: "JEG", room: "302", period: 3 },
        ],
        [
            // Wed
            {
                course: "EEE 4217",
                instructor: "JEG",
                room: "301",
                period: 1,
            },
            {
                course: "EEE 4210",
                instructor: "MRC",
                room: "Computer Lab 2",
                period: 4,
            },
        ],
    ],
    B: [
        [
        // Sat
        ],
        [
            // Sun
            { course: "EEE 4217", instructor: "MZI", room: "302", period: 1 },
            { course: "EEE 4209", instructor: "MMI", room: "302", period: 2 },
        ],
        [
            // Mon
            { course: "EEE 4217", instructor: "MZI / JEG", room: "302", period: 4 },
            {
                course: "EEE 4209",
                instructor: "MMI",
                room: "302",
                period: 5,
                duration: 2,
            },
            {
                course: "EEE 4200",
                instructor: "AM",
                room: "302",
                period: 8,
                duration: 2,
            },
        ],
        [
        // Tue
        ],
        [
            // Wed
            {
                course: "EEE 4217",
                instructor: "JEG",
                room: "301",
                period: 3,
            },
            {
                course: "EEE 4210",
                instructor: "MMI",
                room: "Computer Lab 2",
                period: 4,
            },
        ],
    ],
    C: [
        [
        // Sat
        ],
        [
            // Sun
            { course: "EEE 4209", instructor: "MRC", room: "302", period: 4 },
        ],
        [
            // Mon
            {
                course: "EEE 4217",
                instructor: "MZI",
                room: "402",
                period: 8,
                duration: 2,
            },
        ],
        [
            // Tue
            {
                course: "EEE 4210",
                instructor: "MRC",
                room: "Computer Lab 2",
                period: 1,
            },
            { course: "EEE 4217", instructor: "MZI", room: "302", period: 4 },
            { course: "EEE 4209", instructor: "MMI", room: "302", period: 6 },
            {
                course: "EEE 4200",
                instructor: "MSR",
                room: "302",
                period: 8,
                duration: 2,
            },
        ],
        [
            // Wed
            { course: "EEE 4209", instructor: "MRC / MMI", room: "402", period: 1 },
        ],
    ],
};
const electiveClasses = {
    eee4241: [
        // Sat
        [
            { instructor: "MRI", room: "Machine Lab", period: 7, for: [1, 90] },
            { instructor: "AKP", room: "Machine Lab", period: 7, for: [91, 180] },
        ],
        // Sun
        [
            { instructor: "RAR", room: "301", period: 7, for: [1, 90] },
            { instructor: "RIS", room: "302", period: 7, for: [91, 180] },
        ],
        // Mon
        [],
        // Tue
        [
            { instructor: "RAR", room: "301", period: 7, for: [1, 90] },
            { instructor: "RIS", room: "302", period: 7, for: [91, 180] },
        ],
        // Wed
        [
            { instructor: "RAR", room: "301", period: 2, for: [1, 90] },
            { instructor: "RIS", room: "302", period: 2, for: [91, 180] },
        ],
    ],
    eee4247: [
        // Sat
        [{ instructor: "MMH", room: "302", period: 4 }],
        // Sun
        [],
        // Mon
        [{ instructor: "MMH", room: "302", period: 7 }],
        // Tue
        [],
        // Wed
        [{ instructor: "MMH", room: "302", period: 7 }],
    ],
    eee4261: [
        // Sat
        [
            { instructor: "AKS", room: "402", period: 6, for: [1, 90] },
            { instructor: "KT", room: "403", period: 6, for: [91, 180] },
            {
                instructor: "AKS",
                room: "Nanotechnology Lab",
                period: 7,
                for: [1, 42],
                cycle: "even",
            },
            {
                instructor: "AKS",
                room: "Nanotechnology Lab",
                period: 7,
                for: [43, 90],
                cycle: "odd",
            },
        ],
        // Sun
        [
            { instructor: "AKS", room: "402", period: 7, for: [1, 90] },
            { instructor: "KT", room: "403", period: 7, for: [91, 180] },
        ],
        // Mon
        [
            {
                instructor: "KT",
                room: "Nanotechnology Lab",
                period: 1,
                for: [91, 180],
            },
        ],
        // Tue
        [
            { instructor: "AKS", room: "402", period: 7, for: [1, 90] },
            { instructor: "KT", room: "403", period: 7, for: [91, 180] },
        ],
        // Wed
        [],
    ],
    eee4269: [
        // Sat
        [{ instructor: "MFH", room: "402", period: 4 }],
        // Sun
        [{ instructor: "MFH", room: "402", period: 8, duration: 2 }],
        // Mon
        [{ instructor: "MFH", room: "402", period: 7 }],
        // Tue
        [],
        // Wed
        [{ instructor: "MFH", room: "402", period: 7, duration: 2 }],
    ],
    eee4283: [
        // Sat
        [{ instructor: "MSH", room: "403", period: 5, for: [61, 120] }],
        // Sun
        [
            { instructor: "MSH", room: "302", period: 3, for: [61, 120] },
            { instructor: "MSH", room: "301", period: 5, for: [1, 60] },
            {
                instructor: "MR",
                room: "302",
                period: 5,
                duration: 2,
                for: [121, 180],
            },
        ],
        // Mon
        [{ instructor: "MSH", room: "301", period: 6, for: [1, 60] }],
        // Tue
        [
            { instructor: "MSH", room: "302", period: 2, for: [1, 60] },
            { instructor: "MR", room: "302", period: 5, for: [121, 180] },
        ],
        // Wed
        [{ instructor: "MSH", room: "302", period: 1, for: [61, 120] }],
    ],
};
const courses = {
    "EEE 4209": "Embedded System Design",
    "EEE 4217": "Mobile Cellular Communication",
    "EEE 4241": "Power System Protection",
    "EEE 4247": "Renewable Energy",
    "EEE 4261": "Biomedical Engineering",
    "EEE 4269": "Photovoltaic System",
    "EEE 4283": "Radar and Sattelite Communication",
    "EEE 4200": "Seminar",
    "EEE 4210": "Embedded System Design Sessional",
    "EEE 4242": "Power System Protection Sessional",
    "EEE 4262": "Biomedical Engineering Sessional",
};
const instructors = {
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
        TSJ: "Tasneem Sarkar Joyeeta<br>Lecturer",
        MNA: "Md. Nuhi-Alamin<br>Lecturer",
    },
};
const studentNames = [
    "Md. Wahidujjaman",
    "Sandip Kumer Sarker",
    "Fatema Alam Meem",
    "Md. Golam Saroar",
    "Tasnia Akter Tanni",
    "Md. Sharif Islam",
    "Md. Mehedi Hasan",
    "Shagor Hasan",
    "Sumaiya Parvin",
    "Anamika Sarker",
    "Imtiaz Raihan",
    "Md. Al-Sayem",
    "Md. Abdullah Al-Mamun",
    "Tufael Alam",
    "Nafis Hasan Alif",
    "Md. Rafytulla His Shafy",
    "Hasibul Hasan",
    "Md. Anik Hasan",
    "Md. Rezwan Ahmed",
    "Md Ariful Islam",
    "Md. Roquibul Islam",
    "Tanvir Ahmmed",
    "Muhammad Sudipto Siam Dip",
    "Md. Mazedul Islam",
    "Debopriya Talukder",
    "Md. Mehedi Hasan",
    "Md. Riead Hossain Mahadi",
    "Ibrahim Mohammad",
    "Md. Muntasir Wahid Asif",
    "Shah Md. Rifat Hossain",
    "Md. Sanjid Islam Pollob",
    "D. M. Shakil Ahmed",
    "Dipti Biswas",
    "Md. Sohid Jaman Sumon",
    "Fahim Faisal",
    "Md. Tarek Hasan",
    "Bazlur Rahman",
    "Rubina Akter",
    "Md. Mehedi Hasan",
    "Mohammad Galib Hossain",
    "Md. Khalid Hasan Sakib",
    "Bijon Sarkar",
    "G. Al Galib",
    "Sara Bint Shahid",
    "Musfique Abdullah",
    "Tasnim Ul Bari",
    "Sakib Sadman",
    "Md. Shadhin Islam",
    "Mehreen Tabassum",
    "Sapnil Sarker Bipro",
    "Ajharul Islam Tansan",
    "Md. Sadakatul Bari",
    "Uttam Mahapatra",
    "Arpon Bose Dibya",
    "Md. Aslam Hossain",
    "Ram Krishana Ghosh",
    "Mujib Uddin Mahedi",
    "Md. Istiak Ahammed",
    "Jyotirmoy Kundu",
    "S M Muhtashin Al Razi",
    "Md. Ragib Hasin",
    "Md. Ehsanul Haque",
    "Tamjid Mohammad Sayeed",
    "Monodip Sarkar",
    "Puja Saha",
    "Zaki Irfan Purno",
    "Rubaeat Ahammed",
    "Tanvir Ahmed",
    "A. S. M. Junayet Hossain",
    "Mehnaj Islam",
    "Farjan Ahamed Rafi",
    "Md. Sajeed-Ur-Rahman",
    "Sattik Debnath",
    "Md. Masud Alam",
    "Farzana Yesmin",
    "Khadija Akter",
    "Animesh Sarkar Tusher",
    "Md. Mah Fuzur Rahman Khondak",
    "Md. Hasibur Rahman Maki",
    "Sayed Waliullah Oli",
    "Md. Masudur Rahman Masum",
    "Thonmoy Chowdhury Suhel",
    "Sadman Sakib Prottoy",
    "Md. Bijoy Khan",
    "Md Ashiqur Rahman",
    "Mst. Taufika Islam Tania",
    "Zaheer Al Jamee",
    "Md. Sohag Alam",
    "Md Akkas Mia",
    "Momen Sahriar Shoshi",
    "Sk. Md. Shahadat Hossain",
    "Md. Sakib Salim",
    "Md. Munna Islam",
    "Shakil Ahmed",
    "Nabanita Paul",
    "Md. Hasib Raihan",
    "Shahidul Islam",
    "Najmul Alam",
    "Md. Sabbir Hossain",
    "Songram Kar",
    "Md. Mushfiqur Rahman Promel",
    "Md Khalid Hassan",
    "Omar Bin Harun",
    "Sabbir Ahmed Sumon",
    "Md Maruf Hassan",
    "Nasrin Sultana",
    "Md. Zarin Tasnim",
    "Mahbubur Rahman Tahmid",
    "Ahasanur Rahman",
    "Md Abu Huraiya",
    "Nazmul Haque",
    "Abid Hasan Tonmoy",
    "Md. Abu Zasher Al-Nasib",
    "Md. Forid Hossain",
    "Amit Das",
    "Md. Merajul Islam",
    "Anik Saha",
    "Fakhrul Haque Fahim",
    "Abu Sayem",
    "Shahriar Jehin",
    "Ali Hossain Anik",
    "Md. Khayrul Islam",
    "Fatin Anjum Nahin",
    "Md. Sabbir Hossain",
    "A. S. M. Faysal Ahmed",
    "Md. Sumsur Rahman Shanto",
    "Reshad Shahriar Shuvo",
    "Md. Zahidul Islam",
    "Md. Tarikul Islam Tuhin",
    "Mariful Islam Prenon",
    "Md. Zihadul Islam",
    "Md. Sohanur Rahman",
    "Fariatul Islam Nuha",
    "Shatabdi Paul Jhankar",
    "Md. Shadman Sakib",
    "Rakibul Hasan",
    "Md. Sakibul Haque Lipu",
    "Arijit Biswas Antu",
    "Humaira Tasnim",
    "Nafisa Anjum",
    "Saad Md. Abi Wakkas Siddique.",
    "Tanvir Ahmed Sazol",
    "Md. Noman Ali",
    "Md. Masum Reza",
    "Md Nazmul Islam",
    "Md. Humayun Kabir",
    "Mayesha Tahsin",
    "Maliha Anam",
    "Md. Rokonuzzaman Mim",
    "Fariha Tasneem Neela",
    "Mohd. Mehebub Zaman",
    "Aslam Sany",
    "Kazi Reyad Hossain",
    "Md. Arif",
    "Tawhid Al Nahian",
    "Rakibul Hasan",
    "Md. Razaul Islam Roni",
    "Iftekhar Ahmed",
    "Md. Ashraful Alam",
    "Abida Sultana Tasnim",
    "Md. Saim Aktar Himel",
    "Md. Mahmudul Hasan",
    "Atanu Baidya Arka",
    "Md. Abdul Ahad",
    "Md. Mehedi Hasan",
    "Md. Salauddin",
    "Tayeba Nusrat",
    "M Hasibul Galib",
    "Rubaiya Khanom",
    "Tanvir Hasan",
    "Ashraf Al-Khalique",
    "Md. Mushfiqur Rahman Sagor",
    "Md. Sajeeb Raihan",
    "Dibbayan Chowdhury Naba",
    "Syed Tanvir Ahasan",
    "Manwar Hossain",
    "Ibtasum Monir",
    "Ruddro Mohammad",
    "Md. Mohibbul Haque Chowdhury",
    "Modhusudan Kumar Saha",
];
const studentInfo = getStudentInfo();
if (studentInfo === undefined) {
    for (const id of ["studentInfo", "headerGeneric"])
        document.getElementById(id).classList.remove("hidden");
}
else {
    const studentName = studentNames[studentInfo.rollInSeries - 1];
    document.getElementById("studentName").innerText =
        studentName !== "" ? studentName : studentInfo.roll;
    document.getElementById("electiveNames").innerText =
        `EEE ${studentInfo.elective3.slice(-4)}, ` +
            `EEE ${studentInfo.elective4.slice(-4)} and ` +
            `EEE ${studentInfo.elective5.slice(-4)}`;
    function toMandatory(code) {
        const className = `EEE ${code.slice(-4)}`;
        const classNameSess = `EEE ${Number.parseInt(code.slice(-4)) + 1}`;
        return (elective) => ({
            course: isSessional(elective) ? classNameSess : className,
            ...elective,
        });
    }
    const routine = mandatoryClasses[studentInfo.section]
        .map((mandatoryClasses, weekday) => mandatoryClasses
        .concat(electiveClasses[studentInfo.elective3][weekday].map(toMandatory(studentInfo.elective3)))
        .concat(electiveClasses[studentInfo.elective4][weekday].map(toMandatory(studentInfo.elective4)))
        .concat(electiveClasses[studentInfo.elective5][weekday].map(toMandatory(studentInfo.elective5))))
        .map((day) => day
        .filter((klass) => isClassApplicable(klass, studentInfo))
        .sort((a, b) => a.period - b.period));
    console.log(routine);
    const routineBody = document.getElementById("routineBody");
    function insertFreePeriod(dayRow, free) {
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
            if (advance !== 1)
                insertFreePeriod(dayRow, advance - 1);
            const contactHours = classDuration(klass);
            const cell = dayRow.insertCell();
            if (contactHours !== 1)
                cell.colSpan = contactHours;
            if (cycle !== undefined)
                cell.classList.add(...["marked-cell", cycle === "odd" ? "mark-odd" : "mark-even"]);
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
        "pdfButton",
        "resetButton",
        "orientationNotice",
        "screenSizeNotice",
        "headerPersonal",
    ])
        document.getElementById(id).classList.remove("hidden");
    for (const [id, classes] of Object.entries({
        routine: ["sm:table"],
        legends: ["sm:grid"],
    }))
        document.getElementById(id).classList.add(...classes);
}
function toggleTheme() {
    localStorage.darkTheme =
        !(localStorage.darkTheme ??
            window.matchMedia("(prefers-color-scheme: dark)").matches) || localStorage.darkTheme !== "true";
    updateTheme();
}
function resetTheme() {
    localStorage.removeItem("darkTheme");
    updateTheme();
}
let printThemeBackup;
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
