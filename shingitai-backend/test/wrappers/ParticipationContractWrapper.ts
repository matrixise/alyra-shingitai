import {GetContractReturnType} from "@nomicfoundation/hardhat-viem/types";
import {WalletClient} from "viem";
import {assert, expect} from "chai";

type CreateEventParams = {
    name: string;
    date: number;
    validators: WalletClient[];
}
type OpenCloseEventParams = {
    eventId: bigint;
}

type ValidatePresenceParams = {
    player: WalletClient,
    eventId: bigint;
    validator: WalletClient,
}

export class ParticipationContractWrapper {
    private contract: GetContractReturnType;

    constructor(contract: GetContractReturnType) {
        this.contract = contract;
    }

    async createEvent({name, date, validators}: CreateEventParams): Promise<bigint> {
        const validatorsAddresses = validators.map((validator: WalletClient) => validator.account!.address);

        const timestamp = Math.floor(date / 1000)
        await this.contract.write.createEvent([name, timestamp, validatorsAddresses]);

        let events = await this.contract.getEvents.EventCreated();
        expect(events).to.have.lengthOf(1);
        assert.equal(events[0].args.name, name)
        assert.equal(events[0].args.date, timestamp);

        return events[0].args.eventId;
    }

    async openEvent({eventId}: OpenCloseEventParams) {
        await this.contract.write.openEvent([eventId]);
    }

    async closeEvent({eventId}: OpenCloseEventParams) {
        await this.contract.write.closeEvent([eventId]);
    }

    async validatePresence({player, eventId, validator}: ValidatePresenceParams) {
        await this.contract.write.validatePresence([player.account!.address, eventId], {account: validator.account!.address})
    }
}