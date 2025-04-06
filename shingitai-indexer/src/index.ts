import {ponder} from "ponder:registry";
import {grade, gradeAssignation, event as event_table, participation as participation_table} from "ponder:schema";

ponder.on("GradeSBT:GradeCreated", async ({event, context}) => {
    await context.db.insert(grade).values({
        gradeId: event.args.gradeId,
        name: event.args.gradeName,
    })
})

ponder.on("GradeSBT:GradeAssigned", async ({event, context}) => {
    console.log("Grade Assigned to: ", event.args.gradeId, event.args.tokenId);
    const tokenURI = await context.client.readContract({
        abi: context.contracts.GradeSBT.abi,
        address: context.contracts.GradeSBT.address,
        functionName: "tokenURI",
        args: [event.args.tokenId],
    });

    console.log("tokenURI: ", tokenURI);

    await context.db.insert(gradeAssignation).values({
        emitter: event.transaction.from,
        receiver: event.args.receiver,
        tokenId: event.args.tokenId,
        gradeId: event.args.gradeId,
        date: event.args.date,
        tokenURI: tokenURI,
        transaction: event.transaction.hash,
        timestamp: event.block.timestamp,
    })
})

ponder.on("ParticipationSFT:EventCreated", async ({event, context}) => {
    await context.db.insert(event_table).values({
        eventId: event.args.eventId,
        emitter: event.transaction.from,
        name: event.args.name,
        date: event.args.date,
        transaction: event.transaction.hash,
        timestamp: event.block.timestamp,
    })
})

ponder.on("ParticipationSFT:PresenceValidated", async ({event, context}) => {
    // console.log("ParticipationSFT:PresenceValidated", event)
    await context.db.insert(participation_table).values({
        receiver: event.args.participant,
        eventId: event.args.eventId,
        emitter: event.args.validator,
        points: 1,
        transaction: event.transaction.hash,
        timestamp: event.block.timestamp,
    })
})