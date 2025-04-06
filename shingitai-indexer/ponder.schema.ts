import {onchainTable, primaryKey, relations} from "ponder";

export const grade = onchainTable(
    "grade",
    (t) => ({
        gradeId: t.integer().primaryKey(),
        name: t.text().notNull(),
    }),
);

export const gradeRelations = relations(grade, ({many}) => ({
    assignations: many(gradeAssignation)
}));

export const gradeAssignation = onchainTable(
    "grade_assignation",
    (t) => ({
    tokenId: t.bigint().primaryKey(),
    gradeId: t.integer(),
    emitter: t.hex().notNull(),
    receiver: t.hex().notNull(),
    date: t.bigint().notNull(),
    tokenURI: t.text().notNull(),
    transaction: t.hex().notNull(),
    timestamp: t.bigint().notNull(),
    }),
);

export const gradeAssignationRelations = relations(gradeAssignation, ({one}) => ({
    grade: one(grade, {fields: [gradeAssignation.gradeId], references: [grade.gradeId]})
}));


export const event = onchainTable(
    "event",
    (t) => ({
        eventId: t.bigint().primaryKey(),
        emitter: t.hex().notNull(),
        name: t.text().notNull(),
        date: t.bigint().notNull(),
        transaction: t.hex().notNull(),
        timestamp: t.bigint().notNull(),
    }),
);

export const eventRelations = relations(event, ({many}) => ({
    participations: many(participation),
}));

export const participation = onchainTable(
    "participation",
    (t) => ({
        receiver: t.hex().notNull(),
        eventId: t.bigint().notNull(),
        emitter: t.hex().notNull(),
        points: t.integer().notNull().default(1),
        transaction: t.hex().notNull(),
        timestamp: t.bigint().notNull(),
    }),
    (table) => ({
        pk: primaryKey({columns: [table.receiver, table.eventId]})
    })
);

export const participationRelations = relations(participation, ({one}) => ({
    event: one(event, {fields: [participation.eventId], references: [event.eventId]})
}))