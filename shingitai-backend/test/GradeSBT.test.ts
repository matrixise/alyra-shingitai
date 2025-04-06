import hre from 'hardhat';
import { assert, expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { getAddress, WalletClient } from 'viem';

import GradeSBTArtifact from '../artifacts/contracts/GradeSBT.sol/GradeSBT.json';
import { GetContractReturnType } from '@nomicfoundation/hardhat-viem/types';
import { GradeSBTContractWrapper } from './wrappers/GradeSBTContractWrapper';

const GradeSBTABI = GradeSBTArtifact.abi;

describe('Grade SBT', function () {
  async function deployGradeSBTFixture() {
    const [owner, examiner, player1, player2] =
      await hre.viem.getWalletClients();
    const sc = await hre.viem.deployContract('GradeSBT');
    return { sc, owner, examiner, player1, player2 };
  }

  let sc: GetContractReturnType<typeof GradeSBTABI>, // Utilisez le type approprié
    owner: WalletClient,
    examiner: WalletClient,
    player1: WalletClient,
    player2: WalletClient;

  beforeEach(async function () {
    ({ sc, owner, examiner, player1, player2 } = await loadFixture(
      deployGradeSBTFixture,
    ));
  });

  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      const DEFAULT_ADMIN_ROLE = await sc.read.DEFAULT_ADMIN_ROLE();
      const GRADE_MANAGER_ROLE = await sc.read.GRADE_MANAGER_ROLE();

      expect(
        await sc.read.hasRole([DEFAULT_ADMIN_ROLE, owner.account!.address]),
      );
      expect(
        await sc.read.hasRole([GRADE_MANAGER_ROLE, owner.account!.address]),
      );
    });
  });

  describe('Grade Creation', function () {
    it('Should allow creating a new grade', async function () {
      const wrapper = new GradeSBTContractWrapper(sc);
      const gradeName = 'Shodan';
      await wrapper.createGrade({ name: gradeName });
      const gradeId = await wrapper.getGradeIdByName({ name: gradeName });
      expect(gradeId).to.be.a('bigint');

      // Retrieve all grade names
      const gradeNames = await wrapper.getAllGradeNames();

      // Check if the newly created grade's name is included in the list of all grade names
      expect(gradeNames).to.include(gradeName);
    });
  });

  describe('Grade Assignment', function () {
    it('Should allow assigning a grade to an address', async function () {
      const wrapper = new GradeSBTContractWrapper(sc);
      const gradeName = 'Shodan';
      const gradeId = await wrapper.createGrade({ name: gradeName });
      const date = Date.now();
      const tokenURI = 'ipfs://example';
      await wrapper.assignGrade({
        to: player1,
        gradeId,
        date,
        tokenURI,
      });
      const hasGrade = await wrapper.hasGrade({
        receiver: player1,
        gradeId,
      });
      assert.isTrue(hasGrade);
    });
  });

  describe('Token Transfer Restrictions', function () {
    it('Should not allow transferring the SBT', async function () {
      const wrapper = new GradeSBTContractWrapper(sc);
      const gradeId = (await wrapper.createGrade({ name: 'shodan' })) as bigint;
      const tokenId = (await wrapper.assignGrade({
        to: player1,
        gradeId: gradeId,
        date: Date.now(),
        tokenURI: 'ipfs://example',
      })) as bigint;
      await expect(
        sc.write.transferFrom([
          getAddress(player1.account!.address),
          getAddress(player2.account!.address),
          tokenId,
        ]),
      ).to.be.rejectedWith('Soulbound: non-transferable');
    });
  });

  describe('Admin Management', function () {
    it('Should allow the owner to add an admin', async function () {
      const newAdminAddress = examiner.account!.address;
      const DEFAULT_ADMIN_ROLE = await sc.read.DEFAULT_ADMIN_ROLE();
      const GRADE_MANAGER_ROLE = await sc.read.GRADE_MANAGER_ROLE();
      await expect(
        sc.write.addAdmin([newAdminAddress], {
          account: owner.account!.address,
        }),
      ).to.not.be.rejected;
      const isAdmin = await sc.read.hasRole([
        GRADE_MANAGER_ROLE,
        newAdminAddress,
      ]);
      assert.isTrue(isAdmin);
    });

    it('Should prevent non-owners from adding admins', async function () {
      const newAdminAddress = examiner.account!.address;
      await expect(
        sc.write.addAdmin([newAdminAddress], {
          account: player1.account!.address,
        }),
      ).to.be.rejectedWith('NotAuthorized');
    });

    it('Should allow the owner to remove an admin', async function () {
      const adminAddress = examiner.account!.address;
      const DEFAULT_ADMIN_ROLE = await sc.read.DEFAULT_ADMIN_ROLE();
      const GRADE_MANAGER_ROLE = await sc.read.GRADE_MANAGER_ROLE();
      // First, add an admin
      await sc.write.addAdmin([adminAddress], {
        account: owner.account!.address,
      });
      // Then, remove the admin
      await expect(
        sc.write.removeAdmin([adminAddress], {
          account: owner.account!.address,
        }),
      ).to.not.be.rejected;
      const isAdmin = await sc.read.hasRole([GRADE_MANAGER_ROLE, adminAddress]);
      assert.isFalse(isAdmin);
    });
  });

  describe('Grade Assignment Restrictions', function () {
    it('Should not allow assigning a grade without the previous grade being assigned', async function () {
      const wrapper = new GradeSBTContractWrapper(sc);
      const gradeName1 = 'Shodan';
      const gradeName2 = 'Nidan';
      // Create two grades
      await wrapper.createGrade({ name: gradeName1 });
      const gradeId2 = await wrapper.createGrade({ name: gradeName2 });
      // Attempt to assign the second grade without having the first
      await expect(
        wrapper.assignGrade({
          to: player1,
          gradeId: gradeId2,
          date: Date.now(),
          tokenURI: 'ipfs://example',
        }),
      ).to.be.rejectedWith('Previous grade not assigned');
    });
  });
});
