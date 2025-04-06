// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ShinGiTaiModule = buildModule("ShinGiTaiModule", (m) => {
  const gradeSBT = m.contract("GradeSBT");
  const presenceCounter = m.contract("PresenceCounter");
  const participationSFT = m.contract("ParticipationSFT", [presenceCounter, "https://blue-decisive-scorpion-371.mypinata.cloud/ipfs/participation-{id}.json"]);
  const gradeManager = m.contract("GradeManager", [gradeSBT, presenceCounter]);

  const owner = m.getAccount(0);

  const grades = [
      "shodan", "nidan", "sandan", "yondan", "godan",
      "rokudan", "nanadan", "hachidan", "kudan", "judan",
  ]
  grades.forEach((grade: string, index: number) => {
    const uniqueId: string = `createGrade${index}`;
    m.call(gradeSBT, "createGrade", [grade], {from: owner, id: uniqueId})
  })
  m.call(presenceCounter, "setParticipationSFT", [participationSFT])
  m.call(presenceCounter, "setGradeManager", [gradeManager])
  m.call(gradeSBT, "addAdmin", [gradeManager])

  return { gradeSBT, participationSFT, gradeManager, presenceCounter };
});

export default ShinGiTaiModule;
