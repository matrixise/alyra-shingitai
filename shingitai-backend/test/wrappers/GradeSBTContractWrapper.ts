import {getAddress, WalletClient} from "viem";
import {assert, expect} from "chai";
import {GetContractReturnType} from "@nomicfoundation/hardhat-viem/types";
import GradeSBTArtifact from '../../artifacts/contracts/GradeSBT.sol/GradeSBT.json'

type CreateGradeParams = {
    name: string;
}
type AssignGradeParams = {
    to: WalletClient;
    gradeId: bigint;
    date: number;
    tokenURI: string;
}
type HasGradeParams = {
    receiver: WalletClient;
    gradeId: bigint;
}
type GetGradeIdByNameParams = {
    name: string;
}

export class GradeSBTContractWrapper {
    private contract: GetContractReturnType<typeof GradeSBTArtifact.abi>; // Utilisez le type approprié

    constructor(contract: GetContractReturnType<typeof GradeSBTArtifact.abi>) {
        this.contract = contract;
    }

    async createGrade(params: CreateGradeParams): Promise<bigint> {
        await this.contract.write.createGrade([params.name]);

        const events = await this.contract.getEvents.GradeCreated();

        expect(events).to.have.lengthOf(1);
        const event = events[0];
        assert.equal(event.eventName, 'GradeCreated');
        assert.equal(event.args.gradeName, params.name);
        return event.args.gradeId;
    }

    async assignGrade(params: AssignGradeParams): Promise<bigint> {
        const {to, gradeId, date, tokenURI} = params;
        const timestamp = Math.floor(date / 1000)

        const toAddress = getAddress(to.account!.address);

        await this.contract.write.assignGrade([
            toAddress,
            gradeId, timestamp, tokenURI,
        ]);

        const events = await this.contract.getEvents.GradeAssigned();
        expect(events).to.have.lengthOf(1);
        const event = events[0];
        assert.equal(event.eventName, 'GradeAssigned');
        assert.equal(event.args.receiver, toAddress);
        assert.equal(event.args.gradeId, gradeId);
        assert.equal(event.args.date, timestamp);
        return event.args.tokenId;
    }

    async hasGrade(params: HasGradeParams): Promise<boolean> {
        const {receiver, gradeId} = params;
        return this.contract.read.hasGrade([getAddress(receiver.account!.address), gradeId]);
    }

    async getGradeIdByName(params: GetGradeIdByNameParams): Promise<bigint> {
        return this.contract.read.getGradeIdByName([params.name])
    }

    async getAllGradeNames(): Promise<string[]> {
        return this.contract.read.getAllGradeNames();
    }
}