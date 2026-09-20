Hooks.on('createItem', async (item, options, userId) => {
  if (game.user?.id !== userId) return;

  if (item.name === 'Alternate Warlock') {
    // Prompt the player with a choice dialog
    const chosenAbility = await foundry.applications.api.DialogV2.wait({
      window: { title: 'Eldritch Spellcasting: Choose your Pact Ability' },
      content:
        '<p>Select a Spellcasting ability for your Pact Magic spells:</p>',
      buttons: [
        { action: 'int', label: 'Intelligence', callback: () => 'int' },
        { action: 'wis', label: 'Wisdom', callback: () => 'wis' },
        { action: 'cha', label: 'Charisma', callback: () => 'cha' },
      ],
      rejectClose: false,
    });

    if (chosenAbility) {
      await item.update({ 'system.spellcasting.ability': chosenAbility });
      await item.actor.update({
        'flags.alternate-classes-55e.alternate-warlock.pactAbility':
          chosenAbility,
      });
      await item.actor.update({
        'flags.alternate-classes-55e.alternate-warlock.pactModifier':
          item.actor.system.abilities[chosenAbility].mod,
      });
      ui.notifications.info(
        `Set Pact Ability to ${chosenAbility.toUpperCase()}.`,
      );
    }
  }
});

console.log(
  'Alternate Classes 5.5e | Initialized Alternate Warlock Spellcasting Ability script',
);
