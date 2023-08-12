#import "tablex.typ": tablex, rowspanx, colspanx

#set align(center + horizon)
#set page(
    "a4",
    flipped: true,
    header: [
        Semester 4-1 Class Routine

        for Student with Electives.
    ],
    footer: [
        Made with utter contempt and disgust by
        Muhammad Ragib Hasin. 😬🤢😫😑
    ]
)

#tablex(
    align: center + horizon,
    columns: (auto, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
    rows: (auto, 1fr, 1fr, 1fr, 1fr, 1fr),
    gutter: 2pt,
    [], 
    [8:00 - 8:50],
    [8:50 - 9:40],
    [9:40 - 10:30],
    [10:50 - 11:40],
    [11:40 - 12:30],
    [12:30 - 1:20],
    [2:30 - 3:20],
    [3:20 - 4:10],
    [4:10 - 5:00],

    [Saturday]
)