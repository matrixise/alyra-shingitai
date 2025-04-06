import hre from 'hardhat';
import { assert, expect } from 'chai';

import { getAddress, WalletClient } from 'viem';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { GetContractReturnType } from '@nomicfoundation/hardhat-viem/types';
import { GradeManagerABI } from './wrappers/GradeManagerWrapper';

import ParticipationSFTArtifact from '../artifacts/contracts/ParticipationSFT.sol/ParticipationSFT.json';
import { GradeSBTContractWrapper } from './wrappers/GradeSBTContractWrapper';
const ParticipationSFTABI = ParticipationSFTArtifact.abi;
import GradeSBTArtifact from '../artifacts/contracts/GradeSBT.sol/GradeSBT.json';
import { ParticipationContractWrapper } from './wrappers/ParticipationContractWrapper';
import { faker } from '@faker-js/faker';
const GradeSBTABI = GradeSBTArtifact.abi;

describe('GradeManager', () => {
  async function deploySmartContractFixture() {
    const [owner, validator1, validator2, player1, player2] =
      await hre.viem.getWalletClients();
    const gradeContract = await hre.viem.deployContract('GradeSBT');
    const presenceCounterContract =
      await hre.viem.deployContract('PresenceCounter');

    const participationContract = await hre.viem.deployContract(
      'ParticipationSFT',
      [presenceCounterContract.address, 'https://ipfs.test/{id}.json'],
    );

    const gradeManagerContract = await hre.viem.deployContract('GradeManager', [
      gradeContract.address,
      presenceCounterContract.address,
    ]);

    await presenceCounterContract.write.setParticipationSFT([
      participationContract.address,
    ]);
    await presenceCounterContract.write.setGradeManager([
      gradeManagerContract.address,
    ]);

    // FIXME: Add the address of the contract as admin
    await gradeContract.write.addAdmin([gradeManagerContract.address]);

    return {
      gradeManagerContract,
      owner,
      validator1,
      validator2,
      player1,
      player2,
      presenceCounterContract,
      gradeContract,
      participationContract,
    };
  }

  let gradeManagerContract: GetContractReturnType<typeof GradeManagerABI>,
    owner: WalletClient,
    validator1: WalletClient,
    validator2: WalletClient,
    player1: WalletClient,
    player2: WalletClient,
    presenceCounterContract: GetContractReturnType,
    gradeContract: GetContractReturnType<typeof GradeSBTABI>,
    participationContract: GetContractReturnType<typeof ParticipationSFTABI>;

  beforeEach(async function () {
    ({
      gradeManagerContract,
      owner,
      validator1,
      validator2,
      player1,
      player2,
      presenceCounterContract,
      gradeContract,
      participationContract,
    } = await loadFixture(deploySmartContractFixture));
  });

  describe('Deployment', () => {
    it('Should set the right contracts', async function () {
      const localPresenceCounter =
        await gradeManagerContract.read.presenceCounterContract();
      assert.equal(
        getAddress(localPresenceCounter),
        getAddress(presenceCounterContract.address),
      );

      const localContractContractAddress =
        await gradeManagerContract.read.gradeContract();
      assert.equal(
        getAddress(localContractContractAddress),
        getAddress(gradeContract.address),
      );
    });
  });

  describe('Member Management', () => {
    it('Should enable a member correctly', async () => {
      await expect(
        gradeManagerContract.write.enableMember([player1.account!.address], {
          account: owner.account!.address,
        }),
      ).to.not.be.rejected;
      const isMember = await gradeManagerContract.read.isMember([
        player1.account!.address,
      ]);
      assert.isTrue(isMember, 'Player1 should be enabled as a member');
    });

    it('Should disable a member correctly', async () => {
      // First, ensure the player is enabled
      await gradeManagerContract.write.enableMember(
        [player1.account!.address],
        { account: owner.account!.address },
      );
      await expect(
        gradeManagerContract.write.disableMember([player1.account!.address], {
          account: owner.account!.address,
        }),
      ).to.not.be.rejected;
      const isMember = await gradeManagerContract.read.isMember([
        player1.account!.address,
      ]);
      assert.isFalse(isMember, 'Player1 should be disabled as a member');
    });

    it('Should prevent non-owners from enabling a member', async () => {
      await expect(
        gradeManagerContract.write.enableMember([player2.account!.address], {
          account: player1.account!.address,
        }),
      ).to.be.rejectedWith('NotAuthorized');
    });

    it('Should prevent non-owners from disabling a member', async () => {
      // First, ensure the player is enabled by the owner
      await gradeManagerContract.write.enableMember(
        [player2.account!.address],
        { account: owner.account!.address },
      );
      await expect(
        gradeManagerContract.write.disableMember([player2.account!.address], {
          account: player1.account!.address,
        }),
      ).to.be.rejectedWith('NotAuthorized');
    });

    it('Should allow the owner to add a member', async () => {
      await expect(
        gradeManagerContract.write.addMember([player1.account!.address], {
          account: owner.account!.address,
        }),
      ).to.not.be.rejected;
      const isMember = await gradeManagerContract.read.isMember([
        player1.account!.address,
      ]);
      assert.isTrue(isMember, 'Player1 should be added as a member');
    });

    it('Should emit MemberAdded event when a new member is added', async () => {
      await gradeManagerContract.write.addMember([player2.account!.address], {
        account: owner.account!.address,
      });
      const events = await gradeManagerContract.getEvents.MemberAdded();
      assert.equal(events.length, 1);
      const event = events[0];
      assert.equal(event.eventName, 'MemberAdded');
      assert.equal(
        getAddress(event.args.user),
        getAddress(player2.account!.address),
      );
    });

    it('Should prevent non-owners from adding a member', async () => {
      await expect(
        gradeManagerContract.write.addMember([player2.account!.address], {
          account: player1.account!.address,
        }),
      ).to.be.rejectedWith('NotAuthorized');
    });
  });

  // Assuming GradeRule management functions exist in the contract
  describe('Grade Rules Management', () => {
    let wrapper: GradeSBTContractWrapper;
    let gradeId: bigint;

    beforeEach(async function () {
      wrapper = new GradeSBTContractWrapper(gradeContract);
      gradeId = await wrapper.createGrade({
        name: 'shodan',
      });
    });

    it('Should allow setting grade rules by the owner', async () => {
      const requiredPoints = 100; // Example required points
      const requiredPeriod = 365; // Example required period in days

      // Function to set grade rules might be named differently
      await gradeManagerContract.write.setGradeRule(
        [gradeId, requiredPoints, requiredPeriod],
        { account: owner.account!.address },
      );

      const rule = await gradeManagerContract.read.gradeRules([gradeId]);
      assert.equal(rule[0], requiredPoints, 'Required points should match');
      assert.equal(rule[1], requiredPeriod, 'Required period should match');
    });

    it('Should prevent non-owners from setting grade rules', async () => {
      const gradeId = 1;
      const requiredPoints = 100;
      const requiredPeriod = 365;

      await expect(
        gradeManagerContract.write.setGradeRule(
          [gradeId, requiredPoints, requiredPeriod],
          { account: player1.account!.address },
        ),
      ).to.be.rejectedWith('NotAuthorized');
    });
  });

  describe('Grade Awarding', () => {
    let wrapper: GradeSBTContractWrapper;
    let participationWrapper: ParticipationContractWrapper;
    let gradeId: bigint;

    beforeEach(async function () {
      wrapper = new GradeSBTContractWrapper(gradeContract);
      gradeId = await wrapper.createGrade({
        name: 'shodan',
      });

      // Add a member
      await gradeManagerContract.write.addMember([player1.account!.address], {
        account: owner.account!.address,
      });

      participationWrapper = new ParticipationContractWrapper(
        participationContract,
      );

      const eventIds = [];
      for (let i = 0; i < 20; i++) {
        const date = faker.date.past({ years: 2 });
        let eventId = await participationWrapper.createEvent({
          name: `Entrainement ${i}`,
          date,
          validators: [validator1],
        });
        await participationWrapper.openEvent({ eventId });
        eventIds.push(eventId);
      }

      const requiredPoints = 10,
        requiredPeriod = 2 * 365 * 24 * 60 * 60; // 30 days
      await gradeManagerContract.write.setGradeRule(
        [gradeId, requiredPoints, requiredPeriod],
        { account: owner.account!.address },
      ); // 10 points required within the last 30 days
      // Simulate attendance records for player1 (this part depends on how attendance is tracked)
      // For simplicity, assume there's a function to directly add attendance records for testing
      for (let i = 0; i < requiredPoints; i++) {
        await participationContract.write.validatePresence(
          [player1.account!.address, eventIds[i]],
          { account: validator1.account!.address },
        );
      }
    });

    it('Should award a grade if the member meets the criteria', async () => {
      const date = Math.floor(Date.now() / 1000); // Current timestamp
      const tokenURI = 'ipfs://exampleUriForGrade';

      await gradeManagerContract.write.awardGrade(
        [player1.account!.address, gradeId, date, tokenURI],
        { account: owner.account!.address },
      );
      let events = await gradeManagerContract.getEvents.GradeAwarded();
      assert.equal(events.length, 1);
      let event = events[0];
      assert.equal(event.eventName, 'GradeAwarded');
      assert.equal(event.args.user, getAddress(player1.account!.address));
      assert.equal(event.args.gradeId, gradeId);

      events = await gradeContract.getEvents.AssignedGrade();
      event = events.find((e) => e.eventName == 'GradeAssigned');
      assert.equal(event.eventName, 'GradeAssigned');
      assert.equal(event.args.receiver, getAddress(player1.account!.address));
      assert.equal(event.args.date, date);
      assert.equal(event.args.gradeId, gradeId);
    });

    // it.skip("Should emit GradeAwarded event when a grade is awarded", async () => {
    //     const date = Math.floor(Date.now() / 1000); // Current timestamp
    //     const tokenURI = "ipfs://exampleUriForGrade";
    //     await expect(sc.write.awardGrade([player1.account!.address, 1, date, tokenURI], {account: owner.account!.address}))
    //         .to.emit(sc.contract, "GradeAwarded")
    //         .withArgs(getAddress(player1.account!.address), 1);
    // });
    //
    // it.skip("Should not award a grade if the member does not meet the criteria", async () => {
    //     // Adjust the date to simulate that the attendance records are outside the required period
    //     const date = Math.floor(Date.now() / 1000) + 31 * 24 * 60 * 60; // 31 days later
    //     const tokenURI = "ipfs://exampleUriForGrade";
    //     await expect(sc.write.awardGrade([player1.account!.address, 1, date, tokenURI], {account: owner.account!.address}))
    //         .to.be.rejectedWith("Not enough points in period before exam");
    // });
    //
    // it.skip("Should prevent non-members from being awarded a grade", async () => {
    //     const date = Math.floor(Date.now() / 1000); // Current timestamp
    //     const tokenURI = "ipfs://exampleUriForGrade";
    //     await expect(sc.write.awardGrade([player2.account!.address, 1, date, tokenURI], {account: owner.account!.address}))
    //         .to.be.rejectedWith("Not a federation member");
    // });
  });
});
