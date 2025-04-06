import hre from "hardhat";
import {gradeSbtAbi, participationSftAbi} from "./generated";
import {Address, getAddress, getContract, parseEventLogs} from "viem"
import {TZDate} from "@date-fns/tz";
import {PinataSDK} from "pinata";
import {faker} from "@faker-js/faker";

const GRADE_NFT_CONTRACT_ADDRESS: Address = getAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3");
const PARTICIPATION_NFT_CONTRACT_ADDRESS: Address = getAddress("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
const PRESENCE_COUNTER_CONTRACT_ADDRESS: Address = getAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
const GRADE_MANAGER_CONTRACT_ADDRESS: Address = getAddress("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

import BADGES_INFO from "./badges.json"
import IMAGES_INFO from "./images.json"

function tzDateToBigInt(tzDate: TZDate): bigint {
    const timestampInMilliseconds = tzDate.getTime();
    return BigInt(Math.floor(timestampInMilliseconds / 1000));
}

type AssignGradeParams = {
    to: Address;
    gradeId: bigint;
    date: TZDate;
    tokenURI: string;
}

class GradeContractWrapper {
    private contract: any;
    private publicClient: any;

    constructor(publicClient: any, contract: any) {
        this.publicClient = publicClient;
        this.contract = contract;
    }

    async createGrade({gradeName}: {gradeName: string}) : Promise<number> {
        const hash = await this.contract.write.createGrade([
            gradeName
        ])
        const receipt = await this.publicClient.getTransactionReceipt({hash});
        const parsedLogs = parseEventLogs({
            abi: this.contract.abi,
            logs: receipt.logs,
        })

        const eventLog = parsedLogs.find(log => log.eventName === 'GradeCreated')
        if (!eventLog) throw new Error('GradeCreated not found')

        return eventLog.args.gradeId;
    }

    async assignGrade({to, gradeId, date, tokenURI}: AssignGradeParams) {
        const timestampInSeconds = tzDateToBigInt(date);

        const hash = await this.contract.write.assignGrade([
            to,
            gradeId,
            timestampInSeconds,
            tokenURI,
        ]);
        const receipt = await this.publicClient.getTransactionReceipt({ hash });
        const parsedLogs = parseEventLogs({
            abi: this.contract.abi, // ABI contenant bien l'event EventCreated
            logs: receipt.logs,
        })

        const eventLog = parsedLogs.find(log => log.eventName === 'GradeAssigned')
        if (!eventLog) throw new Error('GradeAssigned not found')

        return eventLog.args.tokenId;
    }

    async getGradeIdByName({name}: {name: string}) : Promise<bigint> {
        return await this.contract.read.getGradeIdByName([name]);
    }

    async hasGrade({receiver, gradeId}: {receiver: Address, gradeId: bigint}) : Promise<boolean> {
        return await this.contract.read.hasGrade([receiver, gradeId]);
    }

    async getAllGradeNames() : Promise<string[]> {
        return await this.contract.read.getAllGradeNames();
    }
}


type CreateEventParams = {
    eventName: string;
    date: TZDate;
    validators: string[];
};

type ValidatePresenceParams = {
    eventId: bigint;
    participant: Address;
    validator: Address;
}

class ParticipationContractWrapper {
    private contract: any;
    private publicClient: any;

    constructor(publicClient: any, contract: any) {
        this.publicClient = publicClient;
        this.contract = contract;
    }

    async createEvent({ eventName, date, validators }: CreateEventParams): Promise<bigint> {
        const timestampInSeconds = tzDateToBigInt(date);
        const hash = await this.contract.write.createEvent([
            eventName,
            timestampInSeconds,
            validators,
        ]);
        const receipt = await this.publicClient.getTransactionReceipt({ hash });

        const parsedLogs = parseEventLogs({
            abi: this.contract.abi, // ABI contenant bien l'event EventCreated
            logs: receipt.logs,
        })

        // console.log(parsedLogs);

        const eventLog = parsedLogs.find(log => log.eventName === 'EventCreated')
        if (!eventLog) throw new Error('EventCreated not found')

        return eventLog!.args!.eventId;
    }

    async openEvent({eventId}: {eventId: bigint}) {
        await this.contract.write.openEvent([
            eventId,
        ]);
    }

    async closeEvent({eventId}: {eventId: bigint}) {
        await this.contract.write.closeEvent([
            eventId,
        ]);
    }

    async validatePresence({eventId, participant, validator}: ValidatePresenceParams): Promise<boolean> {
        const hash = await this.contract.write.validatePresence([
            participant,
            eventId,
        ], {account: validator});

        const receipt = await this.publicClient.getTransactionReceipt({ hash });

        const parsedLogs = parseEventLogs({
            abi: this.contract.abi,
            logs: receipt.logs,
        })

        const eventLog = parsedLogs.find(log => log.eventName === 'PresenceValidated')
        return eventLog !== undefined
    }
}

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
})

type CreateMetaDataParamsForGrade = {
    grade: string;
    date: TZDate;
    imageUrl: string;
}

function createMetaDataForGrade(params: CreateMetaDataParamsForGrade){
    const {grade, date, imageUrl} = params;
    return {
        name: grade,
        description: `Grade ${grade} attributé par la fédération`,
        image: imageUrl,
        attributes: [
            { trait_type: "grade", value: grade},
            { trait_type: "date", value: date.toISOString().split('T')[0] },
        ]
    }
}

type CreateMetaDataForEventParams = {
    name: string;
    date: TZDate;
    imageUrl: string;
};

function createMetaDataForEvent(params: CreateMetaDataForEventParams){
    const {name, date, imageUrl} = params;

    return {
        name: name,
        description: `Shin Gi Tai Training organisé par la fédération`,
        image: imageUrl,
        attributes: [
            { trait_type: "date", value: date.toISOString().split('T')[0] },
        ]
    }
}

async function main() {
    // console.log(BADGES_INFO);
    // console.log(IMAGES_INFO);
    //
    const publicClient = await hre.viem.getPublicClient();
    const [owner, validator1, player1, player2, player3] = await hre.viem.getWalletClients();

    console.log('Owner: ', getAddress(owner.account!.address));
    console.log('Validator1: ', getAddress(validator1.account!.address));
    console.log('player1: ', getAddress(player1.account!.address));
    console.log('player2: ', getAddress(player2.account!.address));
    console.log('player3: ', getAddress(player3.account!.address));

    const gradeContract = getContract({
        address: GRADE_NFT_CONTRACT_ADDRESS,
        abi: gradeSbtAbi,
        client: owner
    })

    const participationContract = getContract({
        address: PARTICIPATION_NFT_CONTRACT_ADDRESS,
        abi: participationSftAbi,
        client: owner
    })

    const gcw = new GradeContractWrapper(publicClient, gradeContract);

    const grades = await gcw.getAllGradeNames();
    const gradesAndIds = Object.fromEntries(
        grades.map((value, index) => [value, BigInt(index)])
    );

    const gradeId = gradesAndIds['shodan'];

    const hasGrade = await gcw.hasGrade({
        receiver: player1.account.address,
        gradeId,
    })

    console.log(`Has Grade: ${hasGrade}`);
    const badges_folder_cid = BADGES_INFO['cid'];
    const images_folder_cid = IMAGES_INFO['cid'];

    if (!hasGrade) {
        // FIXME: Les grades doivent être généré...
        const dateExam = new TZDate(2019, 12, 7, "Europe/Brussels");
        const gradeName = 'shodan';
        const gradeId = gradesAndIds[gradeName];
        const imageUrl = `ipfs://${badges_folder_cid}/jka-${gradeName}.png`;

        const metadata = createMetaDataForGrade({
            grade: gradeName,
            date: dateExam,
            imageUrl: imageUrl,
        })

        const jsonString = JSON.stringify(metadata, null, 2);

        const file = new File([jsonString], `${player1.account.address}-${gradeId}.json`, {type: 'application/json'})
        const uploaded = await pinata.upload.public.file(file);
        console.log(uploaded);

        const tokenURI = `ipfs://${uploaded.cid}`;
        const tokenId = await gcw.assignGrade({
            to: player1.account.address,
            gradeId,
            date: dateExam,
            tokenURI,
        })
        console.log(`MintGrade: ${player1.account.address} - ${tokenId} ${tokenURI}`);
        console.log(`TOKEN: ${GRADE_NFT_CONTRACT_ADDRESS}/${tokenId}`);
    }

    const pcw = new ParticipationContractWrapper(publicClient, participationContract);

    const eventNames = [
        "Entrainement Federal",
        "Entrainement Regional",
        "Stage International",
    ]

    for (const eventName of eventNames) {
        const date = faker.date.past({years: 2})
        const eventId: bigint = await pcw.createEvent({
            eventName: eventName,
            date,
            validators: [validator1.account.address],
        })
        const imageUrl = `ipfs://${images_folder_cid}/shingitai-training.png`;
        const metadata = createMetaDataForEvent({
            name: eventName,
            date,
            imageUrl,
        })
        const jsonString = JSON.stringify(metadata, null, 2);

        const file = new File([jsonString], `participation-${eventId}.json`, {type: 'application/json'})
        const uploaded = await pinata.upload.public.file(file);

        await pcw.openEvent({eventId})
        // console.log(`eventId: ${eventId}`)

        const isValidated: boolean = await pcw.validatePresence({
            eventId: eventId,
            participant: player1.account.address,
            validator: validator1.account.address,
        })

        console.log(`eventId: ${eventId} - isValidated: ${isValidated}`)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});