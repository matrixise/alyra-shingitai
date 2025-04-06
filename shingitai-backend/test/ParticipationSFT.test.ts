import hre from 'hardhat';
import { assert, expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { getAddress, WalletClient } from 'viem';
import { GetContractReturnType } from '@nomicfoundation/hardhat-viem/types';

import { ParticipationContractWrapper } from './wrappers/ParticipationContractWrapper';
import ParticipationSFTArtifact from '../artifacts/contracts/ParticipationSFT.sol/ParticipationSFT.json';
const ParticipationSFTABI = ParticipationSFTArtifact.abi;

describe('Participation SFT', () => {
  async function deploySmartContractFixture() {
    const [owner, validator1, validator2, player1, player2] =
      await hre.viem.getWalletClients();
    const initialURI: string = 'ipfs://demo/{id}.json';

    const presenceCounter = await hre.viem.deployContract(
      'PresenceCounterMock',
    );

    const sc = await hre.viem.deployContract('ParticipationSFT', [
      presenceCounter.address,
      initialURI,
    ]);
    return { sc, owner, validator1, validator2, player1, player2 };
  }

  let sc: GetContractReturnType<typeof ParticipationSFTABI>,
    owner: WalletClient,
    validator1: WalletClient,
    validator2: WalletClient,
    player1: WalletClient,
    player2: WalletClient;

  beforeEach(async function () {
    ({ sc, owner, validator1, validator2, player1, player2 } =
      await loadFixture(deploySmartContractFixture));
  });

  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      assert.equal(await sc.read.owner(), getAddress(owner.account!.address));
    });
  });

  describe('Event Creation', function () {
    it('Should allow the owner to create an event', async function () {
      const eventName = 'Test Event';
      const eventDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      await sc.write.createEvent([
        eventName,
        eventDate,
        [validator1.account!.address],
      ]);
      const events = await sc.getEvents.EventCreated();
      expect(events).to.have.lengthOf(1);
      assert.equal(events[0].args.name, 'Test Event');
      assert.equal(events[0].args.date, eventDate);
    });

    it('Is there an URI for the new event', async function () {
      const eventName = 'Test Event';
      const eventDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      await sc.write.createEvent([
        eventName,
        eventDate,
        [validator1.account!.address],
      ]);
      const events = await sc.getEvents.EventCreated();
      expect(events).to.have.lengthOf(1);
      assert.equal(events[0].args.name, 'Test Event');
      assert.equal(events[0].args.date, eventDate);
      const eventId: bigint = events[0].args.eventId;
      const tokenUri: string = await sc.read.uri([eventId]);
      assert.equal(tokenUri, 'ipfs://demo/{id}.json');
    });
  });

  describe('Unauthorized Event Creation', function () {
    it('Should not allow validator1 to create an event', async function () {
      const eventName = 'Unauthorized Event';
      const eventDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds

      // Attempt to create an event with validator1 as the caller
      const attemptCreateEvent = sc.write.createEvent(
        [eventName, eventDate, [validator1.account!.address]],
        { account: validator1.account!.address }, // Specify the caller
      );

      // Expect the transaction to be reverted due to the onlyOwner modifier
      await expect(attemptCreateEvent).to.be.rejectedWith(
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Event State Management', function () {
    let wrapper: ParticipationContractWrapper;
    let eventId: bigint;

    beforeEach(async function () {
      wrapper = new ParticipationContractWrapper(sc);
      eventId = await wrapper.createEvent({
        name: 'State Test Event',
        date: Date.now(),
        validators: [validator1],
      });
    });

    it('Should allow opening an event by the owner', async function () {
      await expect(
        sc.write.openEvent([eventId], { account: owner.account!.address }),
      ).to.not.be.rejected;

      // Optionally, verify the event state has changed to Opened if such a read function exists
    });

    it('Should allow closing an event by the owner', async function () {
      // First, open the event
      await sc.write.openEvent([eventId], { account: owner.account!.address });
      let events = await sc.getEvents.EventOpened();
      expect(events).to.have.lengthOf(1);

      let event = events[0];
      assert.equal(event.eventName, 'EventOpened');
      assert.equal(event.args.eventId, eventId);

      // Then, close the event
      await expect(
        sc.write.closeEvent([eventId], { account: owner.account!.address }),
      ).to.not.be.rejected;

      events = await sc.getEvents.EventClosed();
      expect(events).to.have.lengthOf(1);
      event = events[0];
      assert.equal(event.eventName, 'EventClosed');
      assert.equal(event.args.eventId, eventId);
    });

    it('Should not allow validating presence for a closed event', async function () {
      // Ensure the event is closed
      await expect(
        sc.write.validatePresence([player1.account!.address, eventId], {
          account: validator1.account!.address,
        }),
      ).to.be.rejectedWith('Event is not open');
    });

    it('Should allow validating presence for an opened event', async function () {
      // Open the event first
      await sc.write.openEvent([eventId], { account: owner.account!.address });

      // Validate presence
      await expect(
        sc.write.validatePresence([player1.account!.address, eventId], {
          account: validator1.account!.address,
        }),
      ).to.not.be.rejected;
    });
  });

  describe('Validate Presence', function () {
    let wrapper: ParticipationContractWrapper;
    before(async function () {
      wrapper = new ParticipationContractWrapper(sc);
    });
    it('Should allow a validator to validate presence', async function () {
      const eventId: bigint = await wrapper.createEvent({
        name: 'Test Event',
        date: Date.now(),
        validators: [validator1],
      });

      await wrapper.openEvent({ eventId });

      await sc.write.validatePresence([player1.account!.address, eventId], {
        account: validator1.account!.address,
      });
      const events = await sc.getEvents.PresenceValidated();

      expect(events).to.have.lengthOf(1);
      assert.equal(
        events[0].args.participant,
        getAddress(player1.account!.address),
      );
      assert.equal(events[0].args.eventId, eventId);
    });

    it('Should fail if a non-validator tries to validate presence', async function () {
      const eventId = await wrapper.createEvent({
        name: 'Test Event',
        date: Date.now(),
        validators: [validator1],
      });

      await wrapper.openEvent({ eventId });

      await expect(
        sc.write.validatePresence([player1.account!.address, eventId], {
          account: validator2.account!.address,
        }),
      ).to.be.rejectedWith('Not a validator for this event');
    });

    it('Should prevent duplicate validation for the same event', async function () {
      // const wrapper = new ParticipationContractWrapper(sc);
      const eventId = await wrapper.createEvent({
        name: 'Test Event',
        date: Date.now(),
        validators: [validator1],
      });

      await wrapper.openEvent({ eventId });
      //
      // 1st pass -> validation is okay
      await sc.write.validatePresence([player1.account!.address, eventId], {
        account: validator1.account!.address,
      });

      // 2nd pass -> blocked
      await expect(
        sc.write.validatePresence([player1.account!.address, eventId], {
          account: validator1.account!.address,
        }),
      ).to.be.rejectedWith('Already validated');
    });
  });

  describe('Token Transfer Restrictions', function () {
    let wrapper: ParticipationContractWrapper;
    let eventId: bigint;

    beforeEach(async function () {
      wrapper = new ParticipationContractWrapper(sc);
      eventId = await wrapper.createEvent({
        name: 'Non-Transferable Event',
        date: Date.now(),
        validators: [validator1],
      });
      await wrapper.openEvent({ eventId });
      await sc.write.validatePresence([player1.account!.address, eventId], {
        account: validator1.account!.address,
      });
    });

    it('Should not allow transferring the SFT', async function () {
      // Tente de transférer le SFT de player1 à player2
      await expect(
        sc.write.safeTransferFrom(
          [
            getAddress(player1.account!.address),
            getAddress(player2.account!.address),
            eventId,
            1,
            '0x',
          ],
          {
            account: player1.account!.address,
          },
        ),
      ).to.be.rejectedWith('ERC1155: Transfers are disabled');
    });
  });
});
