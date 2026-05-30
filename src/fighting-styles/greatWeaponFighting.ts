async function preGWF({
  workflow,
}) {
  if (!workflow.hitTargets.size) return false;
  return workflow.item.system.properties.has('hvy');
}

async function gwf({
  workflow,
}) {
  const updatedRolls = [...workflow.damageRolls];
  const weaponRoll = updatedRolls[0];
  if (!weaponRoll) return;

  weaponRoll.dice = weaponRoll.dice.map((die) => {
    const faces = die.faces;
    const avg = Math.floor(faces / 2);

    die.results = die.results.map((r) => {
      if (r.result < avg) {
        r.result = avg;
      }
      return r;
    });

    die._total = die.results
      .filter(r => r.active)
      .reduce((acc, r) => acc + r.result, 0);
    return die;
  });

  weaponRoll._total = weaponRoll._evaluateTotal();
  updatedRolls[0] = weaponRoll;
  await workflow.setDamageRolls(updatedRolls);
}

async function gwfWorkflow({
  workflow,
}) {
  const res1 = await preGWF({
    workflow,
  });
  if (!res1) return;
  await gwf({ workflow });
}

export const ac55eGWF = {
  name: 'Great Weapon Fighting',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postDamageRoll',
        macro: gwfWorkflow,
        priority: 100,
      },
    ],
  },
};
