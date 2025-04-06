import GradeManagerArtifact from "../../artifacts/contracts/GradeManager.sol/GradeManager.json";
import {GetContractReturnType} from "@nomicfoundation/hardhat-viem/types";

export const GradeManagerABI = GradeManagerArtifact.abi

class GradeManagerWrapper {
    private contract: GetContractReturnType<typeof GradeManagerABI>

    constructor(contract: GetContractReturnType<typeof GradeManagerABI>) {
        this.contract = contract;
    }

    async disableMember(user: string) {
        await this.contract.write.disableMember([user]);
    }

    async enableMember(user: string) {
        await this.contract.write.enableMember([user]);
    }

    async isMember(user: string) {
        return await this.contract.read.isMember([user]);
    }

    async gradeRules(grade: number) {
        return await this.contract.read.gradeRules([grade]);
    }

    async participationContract() {
        return await this.contract.read.participationContract();
    }

    // async setParticipationContract() {
    //     return await this.contract.participationContract([])
    // }
    //
    async gradeContract() {
        return await this.contract.read.gradeContract();
    }

    // async setGradeContract(grade: string) {
    //     await this.contract.setGradeContract(grade);
    // }
}

export const GradeManagerWrapper;