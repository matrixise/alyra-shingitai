import hre from 'hardhat';
import { assert, expect } from 'chai';

import { Address, getAddress, WalletClient } from 'viem';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { GetContractReturnType } from '@nomicfoundation/hardhat-viem/types';
import { ParticipationContractWrapper } from './wrappers/ParticipationContractWrapper';

describe('PresenceCounter', () => {
  async function deploySmartContractFixture() {
    const [owner, validator1, player1] = await hre.viem.getWalletClients();
    const gradeContract = await hre.viem.deployContract('GradeSBT');

    const presenceCounter = await hre.viem.deployContract('PresenceCounter');

    const participation = await hre.viem.deployContract('ParticipationSFT', [
      presenceCounter.address,
      'https://ipfs.test/{id}.json',
    ]);

    const gradeManager = await hre.viem.deployContract('GradeManager', [
      gradeContract.address,
      presenceCounter.address,
    ]);

    await presenceCounter.write.setParticipationSFT([participation.address]);
    await presenceCounter.write.setGradeManager([gradeManager.address]);

    return {
      presenceCounter,
      participation,
      gradeManager,
      owner,
      validator1,
      player1,
    };
  }

  let presenceCounter: GetContractReturnType,
    participation: GetContractReturnType,
    gradeManager: GetContractReturnType,
    owner: WalletClient,
    validator1: WalletClient,
    player1: WalletClient;

  beforeEach(async function () {
    ({
      presenceCounter,
      participation,
      gradeManager,
      owner,
      validator1,
      player1,
    } = await loadFixture(deploySmartContractFixture));
  });

  describe('Deployment', () => {
    it('Should set the right contracts', async function () {
      assert.equal(
        await presenceCounter.read.owner(),
        getAddress(owner.account!.address),
      );
      assert.equal(
        await presenceCounter.read.getParticipationSFT(),
        getAddress(participation.address),
      );
      assert.equal(
        await presenceCounter.read.getGradeManager(),
        getAddress(gradeManager.address),
      );
    });
  });

  describe('Presence Recording', function () {
    let participationWrapper: ParticipationContractWrapper;
    let eventId: bigint;
    let eventDate: number;
    let playerAddress: Address;

    beforeEach(async function () {
      participationWrapper = new ParticipationContractWrapper(participation);
      eventDate = Date.now();
      playerAddress = getAddress(player1.account!.address);
      // Create the event and associate
      eventId = await participationWrapper.createEvent({
        name: 'Test',
        date: eventDate,
        validators: [validator1],
      });

      // Open it
      await participationWrapper.openEvent({ eventId });
    });

    it('Should record presence correctly', async function () {
      await participationWrapper.validatePresence({
        player: player1,
        eventId,
        validator: validator1,
      });

      let events = await participation.getEvents.PresenceValidated();
      assert.equal(events.length, 1);
      let event = events[0];

      assert.equal(event.args.participant, playerAddress);
      assert.equal(event.args.eventId, eventId);
      assert.equal(
        event.args.validator,
        getAddress(validator1.account!.address),
      );

      events = await presenceCounter.getEvents.PresenceRecorded();
      assert.equal(events.length, 1);
      event = events[0];
      assert.equal(event.eventName, 'PresenceRecorded');
      assert.equal(event.args.user, playerAddress);

      let presenceCount: bigint = await presenceCounter.read.getPresenceCount([
        playerAddress,
      ]);
      assert.equal(presenceCount, 1n);

      const dates = await presenceCounter.read.getPresenceDates([
        playerAddress,
      ]);
      assert.equal(dates.length, 1);
      assert.equal(dates[0], Math.floor(eventDate / 1000));

      // FIXME: Called from GradeManager
      // await presenceCounter.write.resetPresence([playerAddress])
      //
      // presenceCount = await presenceCounter.read.getPresenceCount([playerAddress])
      // assert.equal(presenceCount, 0n);
    });
  });
});
