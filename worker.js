const GITHUB_EXPLORE_BASE =
  "https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data/explore";
const GITHUB_DATA_BASE =
  "https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data";
const DUPLICATE_NOTE_CANDY_BONUS = 40;
const COMBAT_STATE_TTL_SECONDS = 24 * 60 * 60;
const PENDING_COMBAT_TTL_MS = 5 * 60 * 1000;
const DUPLICATE_DIRECTION_WINDOW_MS = 2 * 1000;
const PLAYER_COMBAT_MAX_HP = 100;
const PLAYER_MAX_MANA = 100;
const BATTLE_UNCOMMON_CHANCE = 0.50;
const BATTLE_WISHPOCKET_CHANCE = 0.05;
const WISHPOCKET_ESCAPE_ACTIONS = 4;
const WISHPOCKET_JACKPOT_CHANCE = 0.50;
const WISHPOCKET_BY_REGION = Object.freeze({
  "moonlit-reef": { hp: 30, xp: [40, 70], candies: [300, 500] },
  "starfall-trench": { hp: 50, xp: [300, 450], candies: [850, 1300] },
  "whispering-kelp-forest": { hp: 70, xp: [420, 600], candies: [1200, 1800] },
  "leviathans-wake": { hp: 90, xp: [560, 800], candies: [1650, 2400] },
  "sunken-kings-throne": { hp: 110, xp: [730, 1000], candies: [2200, 3200] },
  "astral-nexus": { hp: 130, xp: [950, 1300], candies: [3000, 4400] },
});
const BATTLE_BERRY_LIMIT = 2;
const TIP_JAR_STATE_KEY = "tip-jar:state";
const TIP_JAR_COOLDOWN_MS = 5000;
const TIP_JAR_FLAVOR = Object.freeze([
  "A completely reasonable contribution to a completely legitimate business.",
  "Shizuki? Never heard of her.",
  "Please stop staring at my mustache.",
  "No refunds. The jar has already accepted your offering.",
  "Your contribution will be used for important things. Do not ask what those things are.",
  "This money absolutely does not fund an elf's irresponsible spending habits.",
  "I have been informed that Shizuki is much prettier than me.",
  "The mustache is natural.",
  "For legal reasons, this jar belongs to nobody.",
  "Another successful transaction. Capitalism is incredible.",
  "I assure you, removing my mustache would prove nothing.",
  "The jar appreciates your generosity. I am merely its accountant.",
  "These Star Candies are going somewhere extremely responsible.",
  "Do not worry. I have a system. The system is the jar.",
  "The jar and I have an understanding. I put money in it and ask no questions.",
  "I am a licensed shopkeeper. Please do not ask to see the license.",
  "That sounded expensive. Do it again.",
  "Your financial judgment is between you and the Astral Sea.",
  "I would never waste these Star Candies on something unnecessary. Define unnecessary.",
  "I see you have chosen the ancient financial strategy of putting money in a jar.",
  "The mustache stays on during business hours.",
  "Thank you for supporting small mysterious businesses.",
  "Every Star Candy helps. Helps what? Next question.",
  "The jar grows stronger.",
  "Please ignore the sound of me counting.",
  "I can stop accepting Star Candies whenever I want.",
  "Excellent. The completely unspecified project is almost funded.",
  "Your receipt is the knowledge that the number became bigger.",
  "The jar has reviewed your contribution and found it delicious.",
  "I do not make the rules. Actually, I might.",
  "There are no hidden fees. The entire payment is the fee.",
  "You have made a sound financial decision according to me.",
  "The Star Candies will be kept somewhere safe. Probably.",
  "I was told people like watching numbers go up. You people are very easy to entertain.",
  "The number went up. Incredible work.",
  "Please do not shake the jar. It gets nervous.",
  "Please do not ask why the jar is heavier on the inside.",
  "This is not a scam. Scams have paperwork.",
  "The mustache indicates financial expertise.",
  "I studied economics for several minutes.",
  "Your contribution has been professionally jarred.",
  "The jar accepts your tribute. I mean tip.",
  "I have absolutely no plans to run away with this. Why would you even think that?",
  "The Astral Sea has many mysteries. My accounting is unfortunately one of them.",
  "Your Star Candies are being used responsibly by remaining exactly where I put them.",
  "Look at that number. Beautiful.",
  "If anyone asks, you donated voluntarily. Very voluntarily.",
  "If Shizuki were here, she would probably approve. Hypothetically.",
  "I have never met Shizuki in my life. We merely have identical taste.",
  "Lots of elves have hair like this. Stop making this weird.",
  "Lots of elves have this exact voice. Probably.",
  "Any resemblance to a certain elf is purely financially convenient.",
  "The mustache makes us completely different people.",
  "This is not a disguise. This is professional shopkeeper attire.",
  "I wore this mustache before mustaches were fashionable.",
  "You are asking an uncomfortable number of questions for someone standing near my Tip Jar.",
  "The less you investigate me, the better your shopping experience becomes.",
  "The jar is now slightly more powerful than before.",
  "One day this number will become unreasonable. I believe in you.",
  "I have seen your contribution and decided greed is actually quite beautiful.",
  "I could explain where the Star Candies go, but that would require me to know.",
  "The Star Candies go into the jar. Anything beyond that is outside my jurisdiction.",
  "The jar has expenses. You would not understand.",
  "You would be shocked how expensive it is to maintain an unemployed glass jar.",
  "Accounting becomes difficult when everyone keeps accusing the accountant of being Shizuki.",
  "There is no suspicious elf here. There is only a completely ordinary woman with an excellent mustache.",
  "I don't know why everyone keeps mentioning Shizuki. Does she also run a highly successful jar?",
  "This transaction has been witnessed and approved by the mustache.",
  "The mustache approves of your financial decisions. I remain undecided.",
  "The mustache has reviewed your contribution and requests more.",
  "I am beginning to think you enjoy giving these away.",
  "You know weapons cost Star Candies too, right? Actually, forget I mentioned that.",
  "I would remind you to save your Star Candies, but that seems bad for business.",
  "Excellent contribution. Terrible budgeting. I respect it.",
  "Your wallet is lighter. The jar is happier. Balance has been restored.",
  "I see no downside to this arrangement. Please do not provide me with one.",
  "The shop's financial department consists of me, this jar, and absolutely no oversight.",
  "The jar handles most of our difficult financial decisions. It has never complained.",
  "Our quarterly financial report contains one word: more.",
  "Our annual financial forecast predicts that I will continue asking you for Star Candies.",
  "Growth. Beautiful, unnecessary growth.",
  "This is what economists call sustainable growth. I think.",
  "The jar's business model is remarkably simple: you lose money and it gains money.",
  "Please continue donating until someone qualified tells me to stop.",
  "Several reliable sources confirm that the number has increased. I am all of the sources.",
  "I personally verified this transaction, which is convenient because I also approve the transactions.",
  "I counted your Star Candies twice. Both times I liked the amount.",
  "I would never manipulate the accounting. The jar knows where I sleep.",
  "The accounting is completely legitimate. Please ignore how defensive that sounded.",
  "The mustache demands accurate bookkeeping and occasional snacks.",
  "Somewhere, an accountant just felt a disturbance and does not know why.",
  "You have contributed to history. Very specific, completely useless history.",
  "Future generations may ask why this jar contains so many Star Candies. I recommend lying to them.",
  "If anyone asks why the jar has this much money, I was never here.",
  "At this point, stopping would make the number lonely. You wouldn't do that, would you?",
  "Imagine how impressive one more digit would look. This is not financial advice.",
  "I am not encouraging irresponsible spending. I am simply standing beside a jar with expectations.",
  "Another tip safely deposited into the world's most suspicious savings account.",
  "Thank you. Shizuki would probably say the same thing. Whoever that is.",
  "The jar thanks you. The mustache thanks you. I remain completely uninvolved.",
]);
const BATTLE_VARIANTS = ["Armored", "Frenzied", "Fae Touched"];
const FAE_TOUCHED_BLESSINGS = ["Damage", "Protection", "Health"];
const REST_BONUS_AMOUNT = 25;
const LONG_REST_BONUS_AMOUNT = 50;
const MAX_PLAYER_RESOURCE_CAP = 250;
const SHORT_REST_COOLDOWN_MS = 20 * 60 * 1000;
const LONG_REST_COOLDOWN_MS = 60 * 60 * 1000;
const LONG_REST_ENCOUNTER_CHANCE = 0.5;
const OFFENSIVE_ROLL_TRIGGER = "next_offensive_d20";
// Used only when migrating the original charge-based saved effect.
const LEGACY_ELF_BLESSING_DURATION_MS = 30 * 60 * 1000;
const STIM_USES_PER_BATTLE = 1;
const STIM_SUCCESS_MESSAGES = [
  "You administer the Stim and loudly declare that you are NOT dying here. Somewhere in the Astral Sea, you get the distinct feeling Shizuki would approve.",
  "You administer the Stim and immediately decide that dying would be extremely inconvenient right now.",
  "The Stim takes effect. Whatever was hurting five seconds ago has apparently become a problem for later.",
  "You administer the Stim. Your body remembers that it has places to be.",
  "You were having a terrible time a moment ago. The Stim has filed a formal disagreement.",
  "You administer the Stim and loudly announce that you're still alive. The enemy was already aware of this.",
  "The Stim surges through you. You suddenly feel significantly more qualified to make another bad decision.",
  "You administer the Stim and stubbornly return to your feet. Somewhere, Shizuki would probably call this character development.",
  "You administer the Stim. Your injuries receive the unfortunate news that you're busy.",
  "The Stim takes effect almost immediately. You have survived. Your decision making remains untreated.",
  "You administer the Stim and feel completely refreshed. This seems medically suspicious, but now is not the time for questions.",
  "You administer the Stim. Every part of your body collectively agrees to keep going.",
  "The Stim takes effect. You briefly feel capable of fighting the entire Astral Sea. Please do not test this.",
  "You administer the Stim and make an unnecessarily dramatic declaration about surviving. If Shizuki were here, she'd approve.",
  "You administer the Stim. Somewhere in the distance, you could swear you hear an approving giggle.",
  "The Stim takes effect. Against several reasonable expectations, you're completely fine.",
  "You administer the Stim and immediately regain the confidence of someone who has learned absolutely nothing from nearly dying.",
  "You administer the Stim. The supervising leaf looks up from its clipboard, pauses, and slowly writes something down.",
  "The Stim works instantly. The Fae medical team appears deeply concerned about how quickly that worked.",
  "You administer the Stim. Several nearby Fae stare at you in complete silence. Apparently this is not approved medical procedure.",
  "The Stim takes effect. Somewhere, a tiny Fae medic just felt a disturbance in the Astral Sea.",
];
const BERRY_HEAL_AMOUNT = 25;
const BERRY_MANA_AMOUNT = 25;
const BERRY_OUTSIDE_COMBAT_MESSAGES = [
  "You enjoy a delicious Berry, restoring +25 HP and +25 Mana. Somehow it tastes even better than you remembered.",
  "You snack on a juicy Berry. +25 HP and +25 Mana. Tiny sparkles dance around you before fading away.",
  "You munch on a Berry and feel wonderfully refreshed. +25 HP and +25 Mana. That definitely hit the spot.",
  "You eat a Berry while taking a short break. +25 HP and +25 Mana. Your stomach approves.",
  "You happily devour a Berry. +25 HP and +25 Mana. You feel fuller and ready for whatever lies ahead.",
];
const SHOP_ITEMS = {
  berry: {
    id: "berry",
    displayName: "Berry",
    description: "Restores 25 HP and 25 Mana.",
    price: 200,
    currency: "Star Candies",
    inventoryField: "berries",
    inventoryLabel: "Berries",
    purchaseQuantity: 1,
  },
  "sword-and-shield": { id: "sword-and-shield", displayName: "Sword and Shield", description: "Balanced attacks that also grant Protection.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"Excellent choice. Very responsible. Disturbingly responsible, actually."', equipFlavor: "A little safer. Probably." },
  daggers: { id: "daggers", displayName: "Daggers", description: "Two quick strikes with every attack.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"Two blades! Twice the pointy. That\'s how it works."', equipFlavor: "Two blades means twice as many chances to make a bad decision." },
  axe: { id: "axe", displayName: "Axe", description: "Wildly inaccurate. Wildly painful when it connects.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"I\'m legally required to tell you not to swing this near the shop."', equipFlavor: "Subtlety has officially left the adventure." },
  spear: { id: "spear", displayName: "Spear", description: "Precise attacks that pierce enemy Protection.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"Long, pointy, and conveniently keeps problems far away."', equipFlavor: "Problems are much nicer when they stay at spear length." },
  hammer: { id: "hammer", displayName: "Hammer", description: "Heavy blows that stagger the enemy's next attack.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"If something survives the first hit, hit it again. My advice."', equipFlavor: "Some problems require careful thinking. This is not one of those problems." },
  bow: { id: "bow", displayName: "Bow", description: "Roll twice and keep the better attack roll.", price: 20000, currency: "Star Candies", permanent: true, reaction: '"Excellent! Now you can miss things from farther away."', equipFlavor: "Distance has been added to your list of excuses." },
};
const WEAPON_IDS = Object.keys(SHOP_ITEMS).filter(id => SHOP_ITEMS[id].permanent);
const CLASS_CHANGE_PRICE = 50000;
const CLASS_DATA = {
  "sword-and-shield": { name: "Knight", titles: ["Wayward Knight", "Shieldbearer", "Warden", "Bulwark", "Crown Guardian", "Nexus Paladin"], damage: [2,3,4,4,5,5], protection: [2,3,3,4,4,5] },
  daggers: { name: "Rogue", titles: ["Cutpurse", "Twinblade", "Shadowblade", "Nightstalker", "Kingsbane", "Nexus Phantom"], damage: [2,3,3,4,4,4] },
  axe: { name: "Berserker", titles: ["Raider", "Marauder", "Reaver", "Ravager", "Warbringer", "Worldbreaker"], damage: [3,4,5,5,5,5] },
  spear: { name: "Lancer", titles: ["Spearhand", "Lancer", "Dragoon", "Wavepiercer", "Crownlance", "Horizon Dragoon"], damage: [2,3,3,4,4,4], pierce: [10,10,12,12,15,15] },
  hammer: { name: "Vanguard", titles: ["Bruiser", "Breaker", "Mauler", "Juggernaut", "Siegebreaker", "Titan Vanguard"], damage: [2,3,3,4,4,4], stagger: [[5,10],[5,10],[6,11],[6,11],[7,12],[7,12]] },
  bow: { name: "Ranger", titles: ["Scout", "Marksman", "Sharpshooter", "Deadeye", "Royal Huntsman", "Horizon Hunter"], damage: [2,3,4,4,5,5] },
};
function classTier(progress) {
  return Math.max(0, REGIONS.findIndex(region => region.id === getRegionForLevel(levelFromXp(progress.xp)).id));
}
function classTitle(progress) {
  return CLASS_DATA[progress.activeClass]?.titles[classTier(progress)] || null;
}
function classBonusDescription(weaponId, tier) {
  const data = CLASS_DATA[weaponId];
  if (!data) return "";
  let description = `${SHOP_ITEMS[weaponId].displayName} attacks gain +${data.damage[tier]} damage`;
  if (data.protection) description += ` and +${data.protection[tier]} Protection`;
  if (data.pierce) description += `; Piercing ignores up to ${data.pierce[tier]} Protection`;
  if (data.stagger) description += `; Stagger reduces damage by ${data.stagger[tier].join(" / ")}`;
  if (weaponId === "sword-and-shield" && tier === 5) description += "; successful attacks restore up to 3 HP";
  if (weaponId === "daggers" && tier >= 2) description += `; both blades add +${tier >= 4 ? 4 : 2} damage`;
  if (weaponId === "daggers" && tier === 5) description += "; both natural rolls 15+ add another +6 damage";
  if (weaponId === "axe" && tier >= 3) description += `; natural 20 adds +${tier === 5 ? 15 : 8} damage`;
  if (weaponId === "axe" && tier >= 4) description += "; a miss arms +5 damage on the next successful Axe attack";
  if (weaponId === "spear" && tier === 5) description += "; enemy Protection at attack start adds +5 damage";
  if (weaponId === "hammer" && tier === 5) description += "; consumed Stagger grants 5 Protection after the enemy attack";
  if (weaponId === "bow" && tier >= 3) description += `; both natural rolls 15+ add +${tier === 5 ? 8 : 4} damage`;
  if (weaponId === "bow" && tier === 5) description += "; double natural 20 adds +15 instead";
  return description + ".";
}
function classAdvancement(progress) {
  if (!progress.activeClass) return null;
  const data = CLASS_DATA[progress.activeClass];
  return `Class Advancement — ${classTitle(progress)}\nYour ${data.name} specialization has grown stronger.\n${classBonusDescription(progress.activeClass, classTier(progress))}`;
}
function normalizeOwnedWeapons(value) {
  return Array.isArray(value) ? WEAPON_IDS.filter(id => value.includes(id)) : [];
}
const SHOP_INTRODUCTIONS = [
  {
    scene:
      "A hooded merchant crouches behind several rocks arranged vaguely like a shop counter. She looks suspiciously like Shizuki, but the poorly attached fake mustache makes identification impossible.",
    quote:
      "\"Choices, choices! What'll it be? And no, I will not explain where any of this came from.\"",
  },
  {
    scene:
      "You find a hooded merchant beside a rock pretending to be a counter. When you mention that she resembles Shizuki, she gently bonks you with a price list.",
    quote:
      "\"Wrong elf. Now... choices, choices! What'll it be?\"",
  },
  {
    scene:
      "You approach a highly legitimate shop made from stacked rocks and one crooked plank. The hooded merchant looks exactly like Shizuki, though she insists this is merely a coincidence.",
    quote:
      "\"Welcome, valued customer! Everything is legally acquired... until proven otherwise.\"",
  },
];
const SHOP_PURCHASE_MESSAGES = [
  "\"Excellent choice! I definitely picked that Berry myself... please ignore the bite marks.\"",
  "\"A fine investment! If anyone asks, you absolutely didn't buy this from me.\"",
  "\"One Berry, coming right up! Fresh enough that it only rolled away twice.\"",
  "\"Pleasure doing business! Come back before I spend all these Star Candies.\"",
  "\"Wonderful choice! My accountant is going to be very confused.\"",
  "\"Enjoy! And remember... if it starts glowing, that's probably normal.\"",
  "\"Perfect! I was getting attached to that Berry anyway.\"",
  "\"Another satisfied customer! See? This is a completely legitimate business.\"",
];
const SHOP_INSUFFICIENT_MESSAGES = [
  (shortfall) =>
    `"You're short by ${shortfall} Star Candies. Tragic. Financially devastating, even."`,
  (shortfall) =>
    `"I admire your confidence, but confidence is not accepted as currency. You still need ${shortfall} Star Candies."`,
  (shortfall) =>
    `"So close! Except for the missing ${shortfall} Star Candies. Those are somewhat important."`,
  (shortfall) =>
    `"The Berry says no. It has very strict financial standards. You need ${shortfall} more Star Candies."`,
  (shortfall) =>
    `"I could lower the price, but then this suspicious rock based business would collapse. You need ${shortfall} more."`,
];
const SHOP_SESSION_TTL_MS = 10 * 60 * 1000;
const SHOP_OUTSIDE_MESSAGES = [
  (shopCommand) =>
    "You look around, but the hooded merchant and her suspicious pile of " +
    `rocks are nowhere to be found. "Try visiting ${shopCommand} before ` +
    "attempting to throw money at strangers.\"",
  (shopCommand) =>
    "There is no merchant here. There isn't even a convincing " +
    `merchant shaped rock. Use ${shopCommand} to find the Shop again.`,
  (shopCommand) =>
    "You hold out your Star Candies expectantly. Nothing happens. Somewhere " +
    "in the distance, a familiar elf shouts, \"You have to come to the Shop first!\" " +
    `Use ${shopCommand} to find her.`,
  (shopCommand) =>
    "The Berry purchasing ritual fails due to a severe lack of merchant. " +
    `Visit ${shopCommand} before using Buy.`,
];
const SHOP_QUANTITY_MESSAGES = [
  "\"Planning ahead? Suspiciously responsible of you.\"",
  "\"One Berry is a snack. This many Berries is a lifestyle.\"",
  "The merchant counts the Berries twice, loses count, and decides the pile looks correct.",
  "\"Buying in bulk! My extremely legitimate business is thriving.\"",
  "The hooded merchant pushes over a small Berry pile. \"Please take these before I become emotionally attached.\"",
];
const SHOP_LARGE_PURCHASE_REACTIONS = [
  {
    minimumQuantity: 99,
    message:
      "The hooded merchant stares silently at the enormous mountain of " +
      "Berries now covering nearly every rock around the shop.\n\n" +
      "Her fake mustache slowly peels away from her face and drifts to the " +
      "ground.\n\nShe quickly snatches it up, presses it back onto her face, " +
      "clears her throat, and points firmly at you.\n\n" +
      "\"...I'm not asking questions anymore.\"",
  },
  {
    minimumQuantity: 50,
    message:
      "The hooded merchant slowly looks from the mountain of Berries to you " +
      "and back again.\n\n\"I'm beginning to suspect you're opening a fruit " +
      "stand.\"",
  },
  {
    minimumQuantity: 20,
    message:
      "The hooded merchant raises an eyebrow as she finishes counting the " +
      "pile.\n\n\"...Planning to survive the apocalypse?\"",
  },
];
const LONG_REST_SCENES = [
  "You find a sheltered hollow beneath the silver branches of an ancient moonlit tree. The distant Astral Sea hums softly as you settle beneath its leaves.\n\nFor once, there are no monsters, mysterious ruins, suspicious merchants, or urgent decisions waiting for you.\n\nYou sleep deeply, and by the time pale starlight filters through the branches, your strength and magic have returned with more energy than either of them reasonably needed.",
  "A quiet Fae sanctuary reveals itself between two weathered stone arches. Moonveil flowers fold around the entrance as though agreeing not to tell anyone where you went.\n\nYou curl up beside a warm lantern and sleep through an entire turning of the Astral tides.\n\nWhen you finally wake, someone has tucked a blanket around you and left a note nearby:\n\n\"Try not to nearly die again immediately. —Definitely Not Shizuki\"",
  "You make camp beside a still lagoon where silver fish drift beneath the surface like tiny wandering stars.\n\nThe night passes without ambushes, cursed artifacts, or anything attempting to steal your Backpack. This is suspicious, but you decide not to question it.\n\nBy morning, both body and magic feel completely restored—and perhaps a little overprepared.",
];
const LONG_REST_COOLDOWN_SCENES = [
  (remaining) =>
    "You arrange your bedding, close your eyes, and attempt to begin another full night's sleep.\n\nUnfortunately, your body has determined that you have rested quite enough for one day.\n\n" +
    `**Long Rest Available In:** ${remaining}`,
  (remaining) =>
    "The Fae sanctuary refuses to reveal itself again. A tiny glowing sign appears between the trees:\n\n\"ONE MIRACULOUSLY RESTFUL NIGHT PER CUSTOMER.\"\n\n" +
    `**Long Rest Available In:** ${remaining}`,
  (remaining) =>
    "You lie down and attempt to sleep, but you are far too rested. After several uncomfortable minutes, you admit defeat.\n\nSomewhere nearby, someone quietly says, \"That's what the cooldown is for.\"\n\n" +
    `**Long Rest Available In:** ${remaining}`,
];
const LONG_REST_ENCOUNTER_TRANSITIONS = [
  (enemyName) =>
    `A branch snaps beyond the edge of your resting place.\n\nYou open your eyes to find a **${enemyName}** watching you from the shadows. It appears your camp was less hidden than you thought.`,
  (enemyName) =>
    `The peaceful morning ends with a sound that definitely does not belong to the wind.\n\nA **${enemyName}** emerges nearby, apparently offended that you slept through its arrival.`,
  (enemyName) =>
    `You awaken feeling completely restored—and immediately realize you are not alone.\n\nA **${enemyName}** circles the campsite, waiting for you to notice it.`,
  (enemyName) =>
    `The sanctuary grows strangely quiet. Even the distant Astral Sea seems to hold its breath.\n\nThen a **${enemyName}** steps into view.\n\nSo much for a peaceful morning.`,
  (enemyName) =>
    `You finish gathering your belongings when something lunges from behind a nearby ruin.\n\nA **${enemyName}** has discovered your resting place and seems unwilling to discuss boundaries.`,
];
const BERRY_DROP_CHANCE_BY_REGION = {
  "moonlit-reef": 0.77,
  "starfall-trench": 0.60,
  "whispering-kelp-forest": 0.80,
  "leviathans-wake": 0.45,
  "sunken-kings-throne": 0.35,
  "astral-nexus": 0.25,
};
const COMBAT_DAMAGE = {
  criticalMiss: 0,
  weak: 5,
  normal: 10,
  strong: 15,
  heavy: 20,
  critical: 30,
};
const ADVENTURE_CHOICE_XP_BY_LEVEL = {
  1: { min: 15, max: 25 },
  2: { min: 18, max: 28 },
  3: { min: 22, max: 32 },
  4: { min: 27, max: 37 },
  5: { min: 33, max: 43 },
  6: { min: 36, max: 46 },
  7: { min: 39, max: 49 },
  8: { min: 42, max: 52 },
  9: { min: 45, max: 55 },
  10: { min: 48, max: 58 },
  11: { min: 51, max: 61 },
  12: { min: 54, max: 64 },
  13: { min: 57, max: 67 },
  14: { min: 60, max: 70 },
  15: { min: 63, max: 73 },
  16: { min: 66, max: 76 },
  17: { min: 69, max: 79 },
  18: { min: 72, max: 82 },
  19: { min: 75, max: 85 },
  20: { min: 78, max: 88 },
  21: { min: 81, max: 91 },
  22: { min: 84, max: 94 },
  23: { min: 87, max: 97 },
  24: { min: 90, max: 100 },
  25: { min: 93, max: 103 },
  26: { min: 96, max: 106 },
  27: { min: 99, max: 109 },
  28: { min: 102, max: 112 },
  29: { min: 105, max: 115 },
  30: { min: 108, max: 118 },
  31: { min: 111, max: 121 },
  32: { min: 114, max: 124 },
  33: { min: 117, max: 127 },
  34: { min: 120, max: 130 },
  35: { min: 123, max: 133 },
  36: { min: 126, max: 136 },
  37: { min: 129, max: 139 },
  38: { min: 132, max: 142 },
  39: { min: 135, max: 145 },
  40: { min: 138, max: 148 },
  41: { min: 141, max: 151 },
  42: { min: 144, max: 154 },
  43: { min: 147, max: 157 },
  44: { min: 150, max: 160 },
  45: { min: 153, max: 163 },
  46: { min: 156, max: 166 },
  47: { min: 159, max: 169 },
  48: { min: 162, max: 172 },
  49: { min: 165, max: 175 },
  50: { min: 168, max: 178 },
};
const PLAYER_STATS = {
  vitality: { id: "vitality", displayName: "Vitality", maximumRank: 10, description: "+10 permanent maximum HP per rank" },
  focus: { id: "focus", displayName: "Focus", maximumRank: 10, description: "+10 permanent maximum Mana per rank" },
  strength: { id: "strength", displayName: "Strength", maximumRank: 10, description: "+1 player damage per rank" },
  luck: { id: "luck", displayName: "Luck", maximumRank: 10, description: "+2% Star Candies and +1 percentage point combat Berry chance per rank" },
  armor: { id: "armor", displayName: "Armor", maximumRank: 10, description: "-1 incoming enemy damage per rank" },
  fae: { id: "fae", displayName: "Fae Affinity", maximumRank: 5, description: "+1 offensive spell roll per rank" },
};
const STAT_SHIZUKI_RESPONSES = Object.fromEntries(
  Object.keys(PLAYER_STATS).map((statId) => [
    statId,
    Array.from({ length: 20 }, (_, index) => {
      const signs = [
        "A folded note drifts into view.",
        "A suspicious bush rustles nearby.",
        "A tiny magical chime rings out.",
        "A doodle appears on a loose scrap of paper.",
        "A fake mustache peeks around the nearest corner.",
      ];
      const remarks = {
        vitality: "Shizuki's handwriting reads: “Ten points less squishy. Good choice.”",
        focus: "Shizuki calls from afar: “More Mana. More Jellyfish. This will end well.”",
        strength: "A distant voice advises: “Hit it harder. That's the entire lesson.”",
        luck: "Shizuki whispers: “You are now statistically shinier.”",
        armor: "A note reads: “Less ouch. Very technical.”",
        fae: "Shizuki whispers: “The Astral Sea is listening now.”",
      };
      return `${signs[index % signs.length]} ${remarks[statId]}`;
    }),
  ]),
);
const SPELL_FILES = {
  elf_blessing: "elf-blessing.json",
  "star-spark": "starspark.json",
  jelly: "jellyfish.json",
  mend: "mend.json",
  moonbeam: "moonbeam.json",
  evocation: "evocation.json",
  bubble: "bubble.json",
  "astral-echo": "astral-echo.json",
  "falling-star": "falling-star.json",
  "leviathans-wake": "leviathans-wake.json",
  berries: "berries.json",
  familiar: "familiar.json",
  "all-or-nothing": "all-or-nothing.json",
  "tidal-wave": "tidal-wave.json",
  "conjure-gun": "conjure-gun.json",
  help: "help.json",
};
const MASTERY_FILES = {
  "starspark-mastery-1": "starspark-mastery-1.json",
  "starspark-mastery-2": "starspark-mastery-2.json",
  "moonbeam-mastery-1": "moonbeam-mastery-1.json",
  "jellyfish-mastery-1": "jellyfish-mastery-1.json",
  "jellyfish-mastery-2": "jellyfish-mastery-2.json",
  "elf-blessing-mastery-1": "elf-blessing-mastery-1.json",
  "bubble-mastery-1": "bubble-mastery-1.json",
  "bubble-mastery-2": "bubble-mastery-2.json",
  "mend-mastery-1": "mend-mastery-1.json",
  "astral-echo-mastery-1": "astral-echo-mastery-1.json",
  "leviathans-wake-mastery-1": "leviathans-wake-mastery-1.json",
  "falling-star-mastery-1": "falling-star-mastery-1.json",
  "familiar-mastery-1": "familiar-mastery-1.json",
  "shizukis-presence": "shizukis-presence.json",
};
const PERK_FILES = {
  "astral-resilience": "astral-resilience.json",
  "astral-momentum": "astral-momentum.json",
  "astral-harvest": "astral-harvest.json",
  "astral-defiance": "astral-defiance.json",
  "astral-reprieve": "astral-reprieve.json",
  "lunar-patience": "lunar-patience.json",
  "astral-aftershock": "astral-aftershock.json",
  "fae-intervention": "fae-intervention.json",
  "fae-aid": "fae-aid.json",
  "astral-curiosity": "astral-curiosity.json",
  "astral-patience": "astral-patience.json",
  "astral-awakening": "astral-awakening.json",
  "astral-harmony": "astral-harmony.json",
  "fae-second-opinion": "fae-second-opinion.json",
  kinship: "kinship.json",
  "astral-rhythm": "astral-rhythm.json",
  "rising-power": "rising-power.json",
  "astral-expedition": "astral-expedition.json",
  legacy: "legacy.json",
  "fae-mischief": "fae-mischief.json",
  storyteller: "storyteller.json",
};
const DATA_CACHE = new Map();
const PLAYER_MUTATION_CHAINS = new Map();

const REGIONS = [
  {
    id: "moonlit-reef",
    level: 1,
    name: "Moonlit Reef",
    file: "moonlit-reef.json",
  },
  {
    id: "starfall-trench",
    level: 5,
    name: "Starfall Trench",
    file: "starfall-trench.json",
  },
  {
    id: "whispering-kelp-forest",
    level: 10,
    name: "Whispering Kelp Forest",
    file: "whispering-kelp-forest.json",
  },
  {
    id: "leviathans-wake",
    level: 20,
    name: "Leviathan's Wake",
    file: "leviathans-wake.json",
  },
  {
    id: "sunken-kings-throne",
    level: 30,
    name: "Sunken King's Throne",
    file: "sunken-kings-throne.json",
  },
  {
    id: "astral-nexus",
    level: 40,
    name: "Astral Nexus",
    file: "astral-nexus.json",
  },
];

const REGION_COMPLETION_COMMANDS = {
  moonlit: "moonlit-reef",
  starfall: "starfall-trench",
  whispering: "whispering-kelp-forest",
  leviathan: "leviathans-wake",
  sunken: "sunken-kings-throne",
  astral: "astral-nexus",
};

const TITLES = [
  {
    level: 1,
    name: "Reef Drifter",
  },
  {
    level: 5,
    name: "Tidewalker",
  },
  {
    level: 10,
    name: "Moon Diver",
  },
  {
    level: 20,
    name: "Astral Explorer",
  },
  {
    level: 35,
    name: "Fae Wayfinder",
  },
  {
    level: 50,
    name: "Keeper of the Astral Sea",
  },
];

const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_SAFE_CONTENT_LENGTH = 1900;
const DISCORD_DAILY_COOLDOWN_SECONDS = 23 * 60 * 60;
const DAILY_REWARD = 250;

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=UTF-8",
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
};

const DAILY_BLESSINGS = [
  "Shizuki smiled upon your adventure, and the Astral Sea answered with a blessing.",

  "Tiny moon creatures danced around Shizuki before scattering Star Candies at your feet.",

  "A Fae rune awakened and granted you an ancient blessing.",

  "Shizuki clumsily nudged you and dropped treasure at your feet.",

  "A Whispering Fae Tidepool revealed hidden riches.",

  "Moonlight gathered inside your Backpack and crystallized into Star Candies.",

  "A Silverfin school circled you before revealing a hidden Fae offering.",

  "Shizuki returned from the Moonlit Reef carrying a suspiciously full treasure pouch.",

  "An Elder Moon Turtle blessed your journey with ancient starlight.",

  "A tiny Fae slipped Star Candies into your Backpack while you were not looking.",

  "The Lunar Current carried a forgotten blessing directly into your hands.",

  "Shizuki attempted a graceful blessing and accidentally showered you in treasure.",

  "A Starshell Hermit emerged from the sand carrying a gift from the Astral Sea.",

  "The Moonkeeper marked your path with silver light and quiet fortune.",

  "A Star Pearl Oyster opened and revealed a small celestial treasure.",

  "Moonveil Anemones swayed around you as a Fae blessing took shape.",

  "A sleepy sea spirit mistook you for royalty and offered tribute.",

  "Shizuki bonked a treasure chest until it opened and declared the reward yours.",

  "The Moonstone Arch shimmered as ancient magic filled your Backpack.",

  "A trail of tiny glowing footprints led you to a hidden cache.",

  "The Astral Tide whispered your name and left behind a blessing.",

  "A mischievous Fae borrowed your Backpack and returned it noticeably heavier.",

  "Shizuki found treasure tangled in her cloak and decided you should have it.",

  "The Echoing Star Reef sang softly before releasing a celestial reward.",

  "A Navigator's Star Compass spun wildly and pointed toward buried treasure.",

  "Dreaming Sea Lilies opened beneath the moon and revealed a hidden gift.",

  "A moonlit manta ray carried an offering from the deepest currents.",

  "The Fae of Starlight Lagoon welcomed you with a sparkling tribute.",

  "Shizuki whispered something to the sea, and treasure immediately washed ashore.",

  "A forgotten coral shrine recognized your spirit and granted you its blessing.",

  "Shizuki proudly handed you a treasure chest... then realized it was upside down.",

  "Shizuki tried to look mysterious but immediately tripped over a seashell. You found treasure instead.",

  "A tiny Moon Sprite declared you today's favorite visitor and rewarded you generously.",

  "Shizuki accidentally summoned an entire school of glowing fish that showered you with Star Candies.",

  "A sleepy Moon Puff curled up in your Backpack before leaving behind a gift.",

  "Shizuki insisted she wasn't hoarding treasure. The overflowing Backpack suggested otherwise.",

  "A curious baby sea dragon sniffed your Backpack and tucked a shiny gift inside.",

  "You caught Shizuki trying to hide Star Candies behind her back. She sighed and handed them over.",

  "A tiny Fae floated onto your shoulder and insisted you deserved today's blessing.",

  "Shizuki attempted to teach a crab magic. Somehow you became richer.",

  "An overly friendly jellyfish hugged you before floating away with a happy wiggle.",

  "A Moon Bunny bounced across the reef leaving glowing treasures in its footprints.",

  "Shizuki confidently opened a treasure chest. It exploded into confetti... and Star Candies.",

  "The Astral Sea applauded your dedication with a shower of tiny shimmering stars.",

  "A tiny octopus proudly presented a shell it thought was priceless. It was actually full of Star Candies.",

  "Shizuki accidentally bonked a coral pillar, revealing a hidden treasure cache.",

  "A curious seal balanced a glowing pearl on its nose before gifting it to you.",

  "The Moonkeeper looked disappointed in Shizuki's clumsiness but rewarded you anyway.",

  "A flock of glowing seabirds flew overhead, dropping tiny celestial treasures.",

  "Shizuki challenged a crab to a staring contest. While distracted, you found treasure.",

  "A tiny Fae crowned you the Honorary Collector of Sparkly Things.",

  "The Astral Tide decided today felt especially lucky for you.",

  "A playful spirit tied a ribbon around your Backpack before filling it with gifts.",

  "Shizuki found an ancient treasure, admired it for five seconds, then gave it to you.",

  "A tiny sea slug proudly delivered today's blessing at maximum slug speed.",

  "The Moonkeeper recognized your growing legend within the Astral Sea.",

  "Ancient Fae magic shimmered beneath the waves, revealing forgotten treasure.",

  "The Echoing Star Reef answered your presence with a celestial blessing.",

  "An Elder Moon Turtle entrusted you with a fragment of ancient fortune.",

  "The Lunar Current carried whispers of forgotten explorers and their hidden riches.",

  "A forgotten shrine awakened as moonlight washed across its ancient stones.",

  "The stars reflected across the sea, revealing a path only you could follow.",

  "The Fae of the Moonlit Reef quietly acknowledged your continued adventures.",

  "A celestial manta glided silently overhead before leaving behind a shimmering reward.",

  "The waters of Starlight Lagoon glowed brighter as you accepted today's blessing.",

  "An ancient coral guardian deemed your spirit worthy of its hidden treasure.",

  "Moonveil Anemones bloomed beneath your feet as the sea offered its gratitude.",

  "A forgotten constellation aligned with the Astral Sea, bringing rare fortune.",

  "Silverfin guardians escorted you safely through hidden currents rich with treasure.",

  "The tides carried echoes of old Fae songs that blessed your journey.",

  "An enchanted pearl drifted ashore bearing an ancient gift.",

  "The Moonstone Arch radiated quiet magic as your Backpack grew heavier.",

  "The Astral Sea rewarded your loyalty with another gentle blessing.",

  "Ancient runes beneath the reef pulsed softly as they recognized your return.",

  "A starlit current revealed treasures untouched for countless ages.",

  "The spirits of forgotten navigators guided you toward hidden fortune.",

  "A celestial bloom unfolded beneath the waves, revealing long-lost riches.",

  "The Astral Tide carried an ancient blessing across the sea just for you.",

  "Moonlight pooled across the ocean like silver glass before forming a hidden treasure.",

  "The stars above mirrored those below as another blessing found its way to your Backpack.",
];

const DISCORD_COMMANDS = [
  { name: "help", description: "View the complete Astral Sea command reference.", type: 1 },
  {
    name: "adventure",
    description: "View, begin, or resume an Astral Sea Adventure",
    type: 1,
    options: [
      {
        type: 4,
        name: "number",
        description: "The unlocked Adventure number to begin",
        required: false,
        min_value: 1,
        max_value: 30,
      },
      {
        type: 4,
        name: "page",
        description: "Adventure list page to view",
        required: false,
        min_value: 1,
        max_value: 5,
      },
    ],
  },
  {
    name: "left",
    description: "Take the left path in your current Adventure",
    type: 1,
  },
  {
    name: "right",
    description: "Take the right path in your current Adventure",
    type: 1,
  },
  {
    name: "forward",
    description: "Move forward in your current Adventure",
    type: 1,
  },
  {
    name: "yes",
    description: "Confirm a pending challenge or Adventure boss",
    type: 1,
  },
  {
    name: "no",
    description: "Cancel a pending challenge or step away",
    type: 1,
  },
  {
    name: "attack",
    description: "Attack the enemy in your current fight.",
    type: 1,
  },
  {
    name: "battle",
    description: "Encounter a random enemy from your current region.",
    type: 1,
  },
  {
    name: "stim",
    description: "Fully restore HP at the cost of your turn. Once per battle; available from Level 1.",
    type: 1,
  },
  {
    name: "cast",
    description: "Cast a learned spell during combat.",
    type: 1,
    options: [
      {
        type: 3,
        name: "spell",
        description: "The spell to cast.",
        required: true,
        choices: [
          { name: "Elf Blessing", value: "elf_blessing" },
          { name: "Star Spark", value: "star" },
          { name: "Jelly", value: "jelly" },
          { name: "Mend", value: "mend" },
          { name: "Moonbeam", value: "moonbeam" },
          { name: "Evocation", value: "evocation" },
          { name: "Bubble", value: "bubble" },
          { name: "Echo", value: "astral-echo" },
          { name: "Falling Star", value: "falling-star" },
          { name: "Leviathan's Wake", value: "leviathans-wake" },
          { name: "Berry", value: "berry" },
          { name: "Familiar", value: "familiar" },
          { name: "All or Nothing", value: "all-or-nothing" },
          { name: "Tidal Wave", value: "tidal-wave" },
          { name: "Conjure Gun", value: "conjure-gun" },
          { name: "Help!", value: "help" },
        ],
      },
    ],
  },
  {
    name: "eat",
    description: "Eat an item to restore Health and Mana.",
    type: 1,
    options: [
      {
        type: 1,
        name: "berry",
        description: "Eat a Berry to restore 25 HP and 25 Mana.",
      },
    ],
  },
  {
    name: "rest",
    description: "Take a Short Rest or Long Rest.",
    type: 1,
    options: [
      {
        type: 1,
        name: "short",
        description: "Take a brief rest and add a temporary +25 HP and Mana buffer.",
      },
      {
        type: 1,
        name: "long",
        description: "Take a full day's rest and add a temporary +50 HP and Mana buffer.",
      },
    ],
  },
  {
    name: "explore",
    description: "Venture into the Astral Sea and find Star Candies.",
    type: 1,
  },
  {
    name: "read",
    description: "Read the Travel Notes in your current region.",
    type: 1,
  },
  {
    name: "daily",
    description: "Receive your daily Astral Sea blessing.",
    type: 1,
  },
  {
    name: "gamble",
    description: "Gamble some of your Star Candies in roulette.",
    type: 1,
    options: [
      {
        type: 4,
        name: "amount",
        description: "The whole number of Star Candies you want to gamble.",
        required: true,
        min_value: 1,
      },
    ],
  },
  {
    name: "backpack",
    description: "Check how many Star Candies are in your Backpack.",
    type: 1,
  },
  {
    name: "stats",
    description: "View your permanent stats, resources, available points, and active effects.",
    type: 1,
  },
  {
    name: "vitality",
    description: "Spend one Stat Point to gain +10 permanent Maximum HP.",
    type: 1,
  },
  {
    name: "focus",
    description: "Spend one Stat Point to gain +10 permanent Maximum Mana.",
    type: 1,
  },
  {
    name: "strength",
    description: "Spend one Stat Point to gain +1 player damage.",
    type: 1,
  },
  {
    name: "luck",
    description: "Spend one Stat Point to improve Star Candy rewards and Berry drops.",
    type: 1,
  },
  {
    name: "armor",
    description: "Spend one Stat Point to reduce incoming enemy damage.",
    type: 1,
  },
  {
    name: "fae",
    description: "Spend one Stat Point to gain +1 on offensive spell rolls.",
    type: 1,
  },
  {
    name: "shop",
    description: "Visit a highly legitimate merchant and view items for sale.",
    type: 1,
  },
  {
    name: "buy",
    description: "Purchase an item using Star Candies.",
    type: 1,
    options: [
      {
        type: 3,
        name: "item",
        description: "The item to purchase.",
        required: true,
        choices: [...Object.values(SHOP_ITEMS).map(item => ({ name: item.displayName, value: item.id })),
          { name: "Class Change", value: "class-change" },
          { name: "Tip Jar", value: "tip-jar" }],
      },
      {
        type: 4,
        name: "quantity",
        description: "Number of items to purchase",
        required: false,
        min_value: 1,
        max_value: 99,
      },
      { type: 4, name: "amount", description: "Star Candies to tip (Tip Jar only).", required: false, min_value: 1 },
      { type: 3, name: "class", description: "Class to change to (Class Change only).", required: false,
        choices: WEAPON_IDS.map(id => ({ name: CLASS_DATA[id].name, value: id })) },
    ],
  },
  {
    name: "equip", description: "Equip a permanent weapon you own.", type: 1,
    options: [{ type: 3, name: "weapon", description: "Weapon to equip.", required: true,
      choices: WEAPON_IDS.map(id => ({ name: SHOP_ITEMS[id].displayName, value: id })) }],
  },
  {
    name: "travel",
    description: "Travel to an unlocked Astral Sea region.",
    type: 1,
    options: [
      {
        type: 3,
        name: "region",
        description: "The region to travel to.",
        required: true,
        choices: [
          { name: "Moonlit", value: "moonlit" },
          { name: "Starfall", value: "starfall" },
          { name: "Whispering", value: "whispering" },
          { name: "Leviathans", value: "leviathans" },
          { name: "Sunken", value: "sunken" },
          { name: "Astral", value: "astral" },
        ],
      },
    ],
  },
  ...Object.entries(REGION_COMPLETION_COMMANDS).map(([name, regionId]) => ({
    name,
    description:
      `View your ${getRegionById(regionId).name} Adventure and Travel Note completion.`,
    type: 1,
  })),
  {
    name: "journal",
    description: "View your Travel Journal progress.",
    type: 1,
  },
  {
    name: "notes",
    description: "View collected and missing notes for a region.",
    type: 1,
    options: [
      {
        type: 3,
        name: "region",
        description: "The region chapter to view.",
        required: true,
        choices: REGIONS.map((region) => ({
          name: region.name,
          value: region.id,
        })),
      },
    ],
  },
  {
    name: "note",
    description: "Read a discovered Travel Note.",
    type: 1,
    options: [
      {
        type: 3,
        name: "region",
        description: "The note's region.",
        required: true,
        choices: REGIONS.map((region) => ({
          name: region.name,
          value: region.id,
        })),
      },
      {
        type: 4,
        name: "number",
        description: "The Travel Note number.",
        required: true,
        min_value: 1,
      },
    ],
  },
];

const DISCORD_HELP_TEXT = `Astral Sea Adventure: Help

Every command currently available to you is listed below.

Adventure

/adventure: List, start, or resume an Adventure in your current travel region.

/left: Choose the left path.

/right: Choose the right path.

/forward: Continue forward.

/yes: Accept a pending challenge.

/no: Decline a pending challenge.

Combat & Spells

/attack: Attack the current enemy. Uses your equipped weapon or your basic attack if no weapon is equipped.

/battle: Battle a random enemy from your current region. That enemy may come with modifiers. You might even encounter something special

/stim: Fully restore your HP once per battle. Using Stim consumes your combat turn.

/cast: Cast one of your unlocked spells. Mana cost and turn behavior depend on the spell.

Items & Recovery

/eat: Eat one Berry to restore up to 25 HP and 25 Mana. Berries do not consume your combat turn. You can eat up to 4 during one Adventure or 2 during one standalone battle.

/rest: Take a Short or Long Rest outside combat to recover resources. Short Rest has a 20 minute cooldown. Long Rest has a 60 minute cooldown and requires no active Adventure.

Exploration & Travel

/explore: Explore your current saved region for XP, Star Candies, Berries, Travel Notes, and other discoveries.

/travel: Travel to a new region used for future exploration and Adventure selection. The destination must already be unlocked.

Region unlocks:
Moonlit Reef: Starting region
Starfall Trench: Level 5
Whispering Kelp Forest: Level 10
Leviathan's Wake: Level 20
Sunken King's Throne: Level 30
Astral Nexus: Level 40

Rewards

/daily: Claim your daily Star Candy reward.

/gamble: Gamble Star Candies in a 50/50 roulette.

Player Info

/backpack: View your Star Candies and backpack resources.

/stats: View your stats, resources, available Stat Points, and active effects.

Stat Progression

/vitality: Spend 1 Stat Point to gain +10 permanent maximum HP.

/focus: Spend 1 Stat Point to gain +10 permanent maximum Mana.

/strength: Spend 1 Stat Point to gain +1 player damage.

/luck: Spend 1 Stat Point to improve reward and Berry drop bonuses.

/armor: Spend 1 Stat Point to reduce incoming damage.

/fae: Spend 1 Stat Point to improve offensive spell rolls.

Shop & Weapons

/shop: Visit the merchant, view items and weapons, see ownership and equipment status, and access unlocked shop services. Opening the shop starts a 10 minute shop session.

/buy: Buy Berries, weapons, and secrets.

/equip: Equip a permanent weapon you own. Equipping is free and cannot be done during combat.

Some shop services are unlocked as you progress. Simultaneous tips may not count correctly.

Region Completion

/moonlit: View your Moonlit Reef Adventure and Travel Note completion.

/starfall: View your Starfall Trench completion.

/whispering: View your Whispering Kelp Forest completion.

/leviathan: View your Leviathan's Wake completion.

/sunken: View your Sunken King's Throne completion.

/astral: View your Astral Nexus completion.

Journal & Travel Notes

/journal: View your collected Travel Note totals across all regions.

/notes: View collected and missing Travel Note numbers for a selected unlocked region.

/note: Read one specific Travel Note you have already discovered.

/read: Read all Travel Notes in your current region at once. Undiscovered pages tell you to keep exploring.

New here? Start with /explore.`;

/* ============================================================
   WORKER ENTRY POINT
   ============================================================ */

// Request-local diagnostics. Never include request bodies, arguments, KV keys/values,
// Discord identities, or webhook URLs in a diagnostic record.
const RUNTIME_DIAGNOSTICS = Symbol("runtimeDiagnostics");
const RUNTIME_ERROR_STAGES = new WeakMap();

function createRuntimeDiagnostics(env = {}) {
  return {
    command: "unknown", stage: "worker.dispatch", responseState: "not-prepared",
    startedAt: Date.now(),
    secrets: [env.DISCORD_BOT_TOKEN, env.SETUP_SECRET].filter(Boolean),
  };
}

function tagRuntimeError(error, stage) {
  if (error && typeof error === "object" && !RUNTIME_ERROR_STAGES.has(error)) {
    RUNTIME_ERROR_STAGES.set(error, stage);
  }
  return error;
}

function logRuntimeError(error, diagnostic, fallbackStage) {
  const context = diagnostic || createRuntimeDiagnostics();
  const redact = (value) => {
    let text = String(value || "");
    for (const secret of context.secrets || []) {
      if (typeof secret === "string" && secret) text = text.split(secret).join("[redacted]");
    }
    return text
      .replace(/https?:\/\/[^\s()]+/gi, "[redacted-url]")
      .replace(/(?:Bearer|Bot)\s+[^\s]+/gi, "[redacted-authorization]")
      .replace(/(?:progress:|combat:|pending-combat:|adventure:)?backpack:[^\s,()]+/gi, "[redacted-key]")
      .replace(/"[^"\r\n]*"/g, "[redacted-quoted-text]")
      .replace(/\b\d{15,30}\b/g, "[redacted-id]");
  };
  const message = redact(error?.message || error);
  const stack = redact(error?.stack || "");
  console.error("Astral Sea runtime failure", {
    command: context.command,
    stage: RUNTIME_ERROR_STAGES.get(error) || fallbackStage || context.stage,
    responseState: context.responseState,
    elapsedMs: Date.now() - context.startedAt,
    ...(context.committedKeyCount === undefined ? {} : { committedKeyCount: context.committedKeyCount }),
    errorName: redact(error?.name || "Error"),
    errorMessage: message,
    stack,
    ...(error?.cause ? { cause: {
      name: redact(error.cause.name || "Error"),
      message: redact(error.cause.message || error.cause),
      stack: redact(error.cause.stack || ""),
    } } : {}),
  });
}

function withRuntimeDiagnostics(env, diagnostic) {
  const backpack = env.Backpack;
  const wrapped = new Proxy(backpack || {}, {
    get(target, property) {
      if (!["get", "put", "delete"].includes(property)) return target[property];
      return async (key, ...args) => {
        // Only the fixed namespace category is retained; never retain the key.
        const prefix = String(key).split(":")[0];
        const category = ["progress", "combat", "pending-combat", "adventure",
          "backpack", "shop-session", "rest"].includes(prefix) ? prefix : "other";
        try {
          return await target[property](key, ...args);
        } catch (error) {
          throw tagRuntimeError(error, `kv.${category}.${property}`);
        }
      };
    },
  });
  return new Proxy(env, {
    get(target, property) {
      if (property === RUNTIME_DIAGNOSTICS) return diagnostic;
      if (property === "Backpack") return wrapped;
      return target[property];
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const diagnostic = createRuntimeDiagnostics(env);
    try {
      const url = new URL(request.url);

      if (url.pathname === "/discord/interactions") {
        return await handleDiscordInteraction(request, env, ctx, diagnostic);
      }

      if (url.pathname === "/discord/register") {
        return await handleDiscordRegistration(request, env);
      }

      if (url.pathname === "/discord/clear-guild-commands") {
        return await handleDiscordGuildCleanup(request, env);
      }

      if (url.pathname === "/discord/schema") {
        if (request.method !== "GET") {
          return textResponse("Method not allowed.", 405);
        }

        return jsonResponse(DISCORD_COMMANDS);
      }

      if (
        url.pathname === "/health" ||
        (url.pathname === "/" && !url.searchParams.has("user"))
      ) {
        return jsonResponse({
          ok: true,
          service: "Astral Sea Engine",
          discordEndpoint: `${url.origin}/discord/interactions`,
        });
      }

      return await handleTwitchRequest(url, withRuntimeDiagnostics(env, diagnostic));
    } catch (error) {
      logRuntimeError(error, diagnostic, diagnostic.stage);

      return textResponse(
        "The Astral Sea is unusually turbulent. Please try again shortly.",
        500,
      );
    }
  },
};

/* ============================================================
   TWITCH / STREAMELEMENTS ROUTER
   ============================================================ */

async function handleTwitchRequest(url, env) {
  const suppliedUsername = url.searchParams.get("user");
  const username = normalizeUsername(suppliedUsername);
  const displayName = getTwitchDisplayName(suppliedUsername);
  const action = (url.searchParams.get("action") || "explore")
    .trim()
    .toLowerCase();
  const diagnostic = env[RUNTIME_DIAGNOSTICS];
  if (diagnostic) {
    diagnostic.command = DISCORD_COMMANDS.some(command => command.name === action) ? action : "unknown";
    diagnostic.stage = "twitch.command.execute";
    diagnostic.secrets.push(suppliedUsername);
  }

  if (!username) {
    return textResponse("Could not identify the explorer.", 400);
  }

  // This key format preserves all existing Twitch Backpack totals.
  const backpackKey = `backpack:${username}`;
  const rawArgs = (url.searchParams.get("args") || "").trim();
  const argumentParts = rawArgs.split(/\s+/).filter(Boolean);
  const regionArgument =
    url.searchParams.get("region") ||
    (argumentParts.length > 1
      ? argumentParts.slice(0, -1).join(" ")
      : argumentParts[0]) ||
    "";
  const numberArgument =
    url.searchParams.get("number") ||
    (argumentParts.length > 1
      ? argumentParts.at(-1)
      : "");

  return withCommandPersistence(env, backpackKey, async (env) => {
  if (action !== "shop" && action !== "buy") {
    await closeShopSession(env, username);
  }

  switch (action) {
    case "adventure":
      return textResponse(
        (
          await performAdventure(
            env,
            backpackKey,
            url.searchParams.get("adventure") ||
              rawArgs ||
              "",
            "twitch",
          )
        ).message,
      );

    case "left":
    case "right":
    case "forward":
      return textResponse(
        (
          await performAdventureDirection(
            env,
            backpackKey,
            action,
            "twitch",
          )
        ).message,
      );

    case "yes":
      return textResponse(
        (await confirmPendingCombat(env, backpackKey, "twitch")).message,
      );

    case "no":
      return textResponse(
        (await cancelPendingCombat(env, backpackKey, "twitch")).message,
      );

    case "attack":
      return textResponse(
        (await performAttack(env, backpackKey, "twitch")).message,
      );

    case "stim":
      return textResponse(
        (await performStim(env, backpackKey, "twitch", rawArgs)).message,
      );

    case "cast":
      return textResponse(
        (
          await performCast(
            env,
            backpackKey,
            rawArgs,
            "twitch",
          )
        ).message,
      );

    case "eat":
      return textResponse(
        (
          await performEat(
            env,
            backpackKey,
            displayName,
            rawArgs,
            "twitch",
          )
        ).message,
      );

    case "rest":
      return textResponse(
        (
          await performRest(
            env,
            backpackKey,
            username,
            rawArgs,
            "twitch",
          )
        ).message,
      );

    case "explore":
      return textResponse(
        (await performExplore(env, backpackKey, "twitch")).message,
      );

    case "daily":
      // StreamElements continues to enforce Twitch's 23-hour cooldown.
      return textResponse(
        (await performDaily(env, backpackKey)).message,
      );

    case "gamble":
      return textResponse(
        (
          await performGamble(
            env,
            backpackKey,
            url.searchParams.get("amount") ||
              argumentParts[0],
            displayName,
          )
        ).message,
      );

    case "backpack":
      return textResponse(
        (
          await performBackpack(
            env,
            backpackKey,
            username,
            "twitch",
          )
        ).message,
      );

    case "stats":
      return textResponse(
        (await performStats(env, backpackKey, username, "twitch")).message,
      );


    case "vitality":
    case "focus":
    case "strength":
    case "luck":
    case "armor":
    case "fae":
      return textResponse(
        (await performStatAllocation(env, backpackKey, action, "twitch")).message,
      );

    case "shop":
      return textResponse(
        (
          await performShop(
            env,
            backpackKey,
            username,
            "twitch",
          )
        ).message,
      );

    case "buy":
      return textResponse(
        (
          await performBuy(
            env,
            backpackKey,
            argumentParts[0] || "",
            argumentParts.length <= 1
              ? null
              : argumentParts.length === 2
                ? argumentParts[1]
                : "invalid",
            username,
            "twitch",
          )
        ).message,
      );

    case "travel":
      return textResponse(
        (
          await performTravel(
            env,
            backpackKey,
            url.searchParams.get("region") ||
              rawArgs ||
              regionArgument,
          )
        ).message,
      );

    case "moonlit":
    case "starfall":
    case "whispering":
    case "leviathan":
    case "sunken":
    case "astral":
      return textResponse(
        (
          await performRegionCompletion(
            env,
            backpackKey,
            getRegionById(REGION_COMPLETION_COMMANDS[action]),
          )
        ).message,
      );

    case "journal":
      return textResponse(
        (await performJournal(env, backpackKey, "twitch")).message,
      );

    case "notes":
      return textResponse(
        (
          await performNotesList(
            env,
            backpackKey,
            regionArgument,
          )
        ).message,
      );

    case "note": {
      let region = regionArgument;
      let number = numberArgument;

      if (argumentParts.length === 1 && /^\d+$/.test(argumentParts[0])) {
        region = "";
        number = argumentParts[0];
      }

      return textResponse(
        (
          await performReadNote(
            env,
            backpackKey,
            region,
            number,
            "twitch",
          )
        ).message,
      );
    }

    default:
      return textResponse("Unknown command.", 400);
  }
  });
}

/* ============================================================
      DISCORD INTERACTIONS ROUTER
   ============================================================ */

async function handleDiscordInteraction(request, env, ctx, diagnostic = createRuntimeDiagnostics(env)) {
  diagnostic.stage = "discord.core";
  env = withRuntimeDiagnostics(env, diagnostic);
  const interactionRequest = request.clone();
  const response = await handleDiscordInteractionCore(request, env);
  diagnostic.stage = "discord.response.parse";
  diagnostic.responseState = "initial-prepared";
  let payload;
  try {
    payload = await response.clone().json();
  } catch {
    return response;
  }
  if (payload?.type !== 4 ||
      typeof payload.data?.content !== "string" ||
      payload.data.content.length <= DISCORD_SAFE_CONTENT_LENGTH) {
    return response;
  }

  diagnostic.stage = "discord.response.split";
  const chunks = splitDiscordContent(payload.data.content);
  let interaction;
  try {
    interaction = await interactionRequest.json();
  } catch {
    // The command has already resolved, so report delivery failure without retrying it.
  }
  if (!/^\d+$/.test(interaction?.application_id || "") ||
      typeof interaction?.token !== "string" || !interaction.token) {
    logRuntimeError(new Error("Missing follow-up credentials."), diagnostic, "discord.followup.credentials");
    return discordMessage(
      "Your action completed, but its full result could not be delivered. Please contact the game maintainer.",
      Boolean(payload.data.flags & 64),
    );
  }

  diagnostic.responseState = "initial-prepared-followups-scheduled";
  const followups = sendDiscordFollowups(
    interaction.application_id, interaction.token, chunks.slice(1),
    payload.data.flags,
  ).catch((error) => {
    logRuntimeError(error, diagnostic, "discord.followup.delivery");
  });
  if (ctx?.waitUntil) ctx.waitUntil(followups);
  else await followups;

  return jsonResponse({
    ...payload,
    data: { ...payload.data, content: chunks[0] },
  });
}

async function handleDiscordInteractionCore(request, env) {
  const diagnostic = env[RUNTIME_DIAGNOSTICS] || createRuntimeDiagnostics(env);
  diagnostic.stage = "discord.verify";
  if (request.method !== "POST") {
    return textResponse("Method not allowed.", 405);
  }

  if (!env.DISCORD_PUBLIC_KEY) {
    console.error("Missing DISCORD_PUBLIC_KEY secret.");
    return textResponse("Discord is not configured.", 500);
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");
  const rawBody = await request.text();

  const validRequest =
    signature &&
    timestamp &&
    (await verifyDiscordRequest(
      rawBody,
      signature,
      timestamp,
      env.DISCORD_PUBLIC_KEY,
    ));

  if (!validRequest) {
    return textResponse("Invalid request signature.", 401);
  }

  let interaction;

  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return textResponse("Invalid JSON.", 400);
  }

  // Discord uses interaction type 1 to validate the endpoint.
  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }

  // Interaction type 2 is an application slash command.
  if (interaction.type !== 2) {
    return discordMessage(
      "The Astral Sea does not recognize that kind of interaction.",
      true,
    );
  }

  const commandName = String(interaction.data?.name || "").toLowerCase();
  diagnostic.command = DISCORD_COMMANDS.some(command => command.name === commandName)
    ? commandName : "unknown";
  diagnostic.secrets.push(interaction.token, interaction.user?.id,
    interaction.member?.user?.id, interaction.user?.username,
    interaction.member?.user?.username, interaction.user?.global_name,
    interaction.member?.user?.global_name, interaction.member?.nick);
  diagnostic.stage = "discord.command.prepare";

  if (commandName === "adventure") {
    const adventureOptions = Array.isArray(interaction.data?.options)
      ? interaction.data.options
      : [];

    console.log(
      "Discord /adventure interaction.data:",
      JSON.stringify(interaction.data, null, 2),
    );
    console.log(
      "Discord /adventure interaction.data.options:",
      JSON.stringify(adventureOptions, null, 2),
    );

    for (const option of adventureOptions) {
      console.log(
        "Discord /adventure option:",
        JSON.stringify({
          name: option?.name,
          type: option?.type,
          value: option?.value,
        }),
      );
    }
  }

  const userId =
    interaction.member?.user?.id ||
    interaction.user?.id;

  if (!userId || !/^\d{5,30}$/.test(userId)) {
    return discordMessage(
      "I could not identify your Discord account.",
      true,
    );
  }

  if (commandName === "help") {
    return discordMessage(DISCORD_HELP_TEXT, true);
  }

  const backpackKey = `backpack:discord:${userId}`;
  const displayName = getDiscordDisplayName(interaction);
  const sharedIdentity = getDiscordRestIdentity(interaction);

  diagnostic.stage = "discord.command.execute";
  try {
    return await withCommandPersistence(env, backpackKey, async (env) => {
      if (commandName !== "shop" && commandName !== "buy") {
        await closeShopSession(env, sharedIdentity);
      }
    switch (commandName) {
      case "adventure": {
        const adventureNumber = getDiscordIntegerOption(
          interaction,
          "number",
        );
        const pageNumber = getDiscordIntegerOption(
          interaction,
          "page",
        );

        return discordMessage(
          (
            await performAdventure(
              env,
              backpackKey,
              adventureNumber ??
                (pageNumber ? `list ${pageNumber}` : ""),
              "discord",
            )
          ).message,
        );
      }

      case "left":
      case "right":
      case "forward":
        return discordMessage(
          (
            await performAdventureDirection(
              env,
              backpackKey,
              commandName,
              "discord",
            )
          ).message,
        );

      case "yes":
        return discordMessage(
          (await confirmPendingCombat(env, backpackKey, "discord")).message,
        );

      case "no":
        return discordMessage(
          (await cancelPendingCombat(env, backpackKey, "discord")).message,
        );

      case "attack":
        return discordMessage(
          (await performAttack(env, backpackKey, "discord")).message,
        );

      case "battle":
        return discordMessage(
          (await performBattle(env, backpackKey)).message,
        );

      case "stim":
        return discordMessage(
          (await performStim(
            env, backpackKey, "discord",
            interaction.data?.options !== undefined &&
              (!Array.isArray(interaction.data.options) || interaction.data.options.length > 0)
              ? "invalid options" : "",
          )).message,
        );

      case "cast":
        return discordMessage(
          (
            await performCast(
              env,
              backpackKey,
              getDiscordOption(interaction, "spell"),
              "discord",
            )
          ).message,
        );

      case "eat":
        return discordMessage(
          (
            await performEat(
              env,
              backpackKey,
              displayName,
              getDiscordSubcommand(interaction),
              "discord",
            )
          ).message,
        );

      case "rest":
        return discordMessage(
          (
            await performRest(
              env,
              backpackKey,
              sharedIdentity,
              getDiscordSubcommand(interaction),
              "discord",
            )
          ).message,
        );

      case "explore":
        return discordMessage(
          (await performExplore(env, backpackKey, "discord")).message,
        );

      case "read":
        return discordMessage((await performReadJournal(env, backpackKey)).message, true);

      case "daily": {
        const result = await performDiscordDaily(
          env,
          backpackKey,
          userId,
        );

        return discordMessage(
          result.message,
          result.ephemeral,
        );
      }

      case "gamble": {
        const amount = getDiscordOption(interaction, "amount");

        return discordMessage(
          (
            await performGamble(
              env,
              backpackKey,
              amount,
              displayName,
            )
          ).message,
        );
      }

      case "backpack":
        return discordMessage(
          (
            await performBackpack(
              env,
              backpackKey,
              getDiscordRestIdentity(interaction),
              "discord",
            )
          ).message,
          true,
        );

      case "stats":
        return discordMessage(
          (await performStats(env, backpackKey, sharedIdentity, "discord")).message,
          true,
        );


      case "vitality":
      case "focus":
      case "strength":
      case "luck":
      case "armor":
      case "fae":
        return discordMessage(
          (await performStatAllocation(env, backpackKey, commandName, "discord")).message,
        );

      case "shop":
        return discordMessage(
          (
            await performShop(
              env,
              backpackKey,
              sharedIdentity,
              "discord",
            )
          ).message,
        );

      case "buy":
        return discordMessage(
          (
            await performBuy(
              env,
              backpackKey,
              getDiscordOption(interaction, "item"),
              getDiscordIntegerOption(interaction, "quantity"),
              sharedIdentity,
              "discord",
              getDiscordOption(interaction, "class"),
              getDiscordOption(interaction, "amount"),
            )
          ).message,
        );

      case "equip":
        return discordMessage((await performEquip(env, backpackKey,
          getDiscordOption(interaction, "weapon"))).message);

      case "travel":
        return discordMessage(
          (
            await performTravel(
              env,
              backpackKey,
              getDiscordOption(interaction, "region"),
            )
          ).message,
          true,
        );

      case "moonlit":
      case "starfall":
      case "whispering":
      case "leviathan":
      case "sunken":
      case "astral":
        return discordMessage(
          (
            await performRegionCompletion(
              env,
              backpackKey,
              getRegionById(REGION_COMPLETION_COMMANDS[commandName]),
            )
          ).message,
          true,
        );

      case "journal":
        return discordMessage(
          (await performJournal(env, backpackKey, "discord")).message,
          true,
        );

      case "notes":
        return discordMessage(
          (
            await performNotesList(
              env,
              backpackKey,
              getDiscordOption(interaction, "region"),
            )
          ).message,
          true,
        );

      case "note":
        return discordMessage(
          (
            await performReadNote(
              env,
              backpackKey,
              getDiscordOption(interaction, "region"),
              getDiscordOption(interaction, "number"),
              "discord",
            )
          ).message,
          true,
        );

      default:
        return discordMessage("Unknown command.", true);
    }
    });
  } catch (error) {
    logRuntimeError(error, diagnostic, diagnostic.stage);

    return discordMessage(
      "The Astral Sea is unusually turbulent. Please try again shortly.",
      true,
    );
  }
}

/* ============================================================
   DISCORD COMMAND REGISTRATION
   ============================================================ */

async function handleDiscordRegistration(request, env) {
  return handleDiscordCommandSetup(request, env, false);
}

async function handleDiscordGuildCleanup(request, env) {
  return handleDiscordCommandSetup(request, env, true);
}

async function handleDiscordCommandSetup(request, env, guildCleanup) {
  if (request.method !== "POST") {
    return textResponse(
      "Send a POST request to this setup route.",
      405,
    );
  }

  const suppliedSecret = request.headers.get("X-Setup-Secret");

  if (
    !env.SETUP_SECRET ||
    !suppliedSecret ||
    !timingSafeEqual(suppliedSecret, env.SETUP_SECRET)
  ) {
    return textResponse("Unauthorized.", 401);
  }

  const requiredVariables = [
    "DISCORD_APPLICATION_ID",
    "DISCORD_BOT_TOKEN",
    ...(guildCleanup ? ["DISCORD_GUILD_ID"] : []),
  ];

  const missing = requiredVariables.filter((name) => !env[name]);

  if (missing.length > 0) {
    return jsonResponse(
      {
        ok: false,
        error: `Missing Worker secrets: ${missing.join(", ")}`,
      },
      500,
    );
  }

  const endpoint =
    `${DISCORD_API_BASE}/applications/` +
    `${env.DISCORD_APPLICATION_ID}` +
    (guildCleanup ? `/guilds/${env.DISCORD_GUILD_ID}` : "") +
    "/commands";

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(guildCleanup ? [] : DISCORD_COMMANDS),
  });

  if (!response.ok) {
    return jsonResponse(
      {
        ok: false,
        status: response.status,
        error: "Discord command setup failed.",
      },
      response.status,
    );
  }

  return jsonResponse({
    ok: true,
    message: guildCleanup
      ? "Guild commands cleared successfully."
      : "Global Discord commands registered successfully.",
  });
}

/* ============================================================
   SHARED GAME ACTIONS
   ============================================================ */

async function performAdventure(
  env,
  backpackKey,
  adventureInput,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performAdventureUnlocked(
      env,
      backpackKey,
      adventureInput,
      platform,
    ),
  );
}

async function performAdventureUnlocked(
  env,
  backpackKey,
  adventureInput,
  platform,
) {
  let progress = await getPlayerProgress(env, backpackKey);
  const region = getRegionById(progress.currentRegion) || REGIONS[0];
  let entries;

  try {
    entries = await getRegionCombatEntries(region.id);
  } catch {
    return {
      message: `Adventures are not available in ${region.name} right now.`,
    };
  }

  const playerLevel = levelFromXp(progress.xp);
  const highestUnlocked = getRegionCombatProgress(
    progress,
    region.id,
    entries.length,
  );
  const activeAdventure = await getActiveAdventure(env, backpackKey);
  const normalizedInput = String(adventureInput ?? "").trim().toLowerCase();

  if (!normalizedInput || normalizedInput.startsWith("list")) {
    const requestedPage = normalizedInput
      ? Number(normalizedInput.split(/\s+/)[1] || 1)
      : 1;

    return await formatAdventureProgress(
      region,
      entries,
      highestUnlocked,
      playerLevel,
      activeAdventure,
      platform,
      requestedPage,
    );
  }

  if (!/^\d+$/.test(normalizedInput)) {
    return {
      message: platform === "discord"
        ? "Use /adventure to view Adventures, or choose the number option to begin an unlocked Adventure."
        : "Use !adventure to view Adventures, or add an unlocked Adventure number.",
    };
  }

  const adventureNumber = Number(normalizedInput);

  if (
    !Number.isSafeInteger(adventureNumber) ||
    adventureNumber < 1 ||
    adventureNumber > entries.length
  ) {
    return {
      message:
        `That Adventure does not exist. Choose 1 through ${entries.length}.`,
    };
  }

  if (adventureNumber > highestUnlocked) {
    return {
      message:
        `Adventure ${adventureNumber} is locked. ` +
        `Complete Adventure ${adventureNumber - 1} first.`,
    };
  }

  if (activeAdventure) {
    if (activeAdventure.adventureNumber === adventureNumber) {
      const definition = await getAdventureDefinition(
        activeAdventure.regionId,
        activeAdventure.adventureNumber,
      );

      return {
        message: formatAdventureObjective(
          definition,
          activeAdventure,
          platform,
        ),
      };
    }

    return {
      message:
        `You already have an Adventure in progress: ` +
        `${activeAdventure.name}. Use ` +
        `${platform === "discord" ? "/adventure" : "!adventure"} ` +
        "to view your current objective.",
    };
  }

  const definition = await getAdventureDefinition(
    region.id,
    adventureNumber,
  );

  if (!definition) {
    return {
      message: "That Adventure is not ready to explore yet.",
    };
  }
  const now = Date.now();
  const state = {
    version: 1,
    regionId: region.id,
    adventureNumber,
    adventureId: definition.id,
    name: definition.name,
    currentRoomId: definition.startRoomId,
    status: "awaiting-direction",
    visitedRooms: [definition.startRoomId],
    completedRooms: [],
    collectedRewards: [],
    berriesEaten: 0,
    playerHp: progress.hp,
    playerMaxHp: getPlayerResourceCaps(progress).hp,
    startedAt: now,
    updatedAt: now,
  };

  await saveActiveAdventure(env, backpackKey, state);

  return {
    message:
      platform === "discord"
        ? `Adventure ${adventureNumber} — ${definition.name}\n\n` +
          `${definition.introDiscord || definition.intro}\n\n` +
          `${formatAdventureRoomPrompt(definition, state, platform)}`
        : `Adventure ${adventureNumber} — ${definition.name} | ` +
          `${definition.introTwitch || definition.intro} | ` +
          `${formatAdventureRoomPrompt(definition, state, platform)}`,
  };
}

async function performAdventureDirection(
  env,
  backpackKey,
  direction,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performAdventureDirectionUnlocked(
      env,
      backpackKey,
      direction,
      platform,
    ),
  );
}

async function performAdventureDirectionUnlocked(
  env,
  backpackKey,
  direction,
  platform,
) {
  const state = await getActiveAdventure(env, backpackKey);

  if (!state) {
    return {
      message:
        `You do not have an active Adventure. Use ` +
        `${platform === "discord" ? "/adventure" : "!adventure"} to choose one.`,
    };
  }

  if (
    state.status === "in-combat" ||
    state.status === "boss-combat" ||
    await getCombatState(env, backpackKey)
  ) {
    return {
      message:
        `You cannot choose a path while fighting. Use ` +
        `${platform === "discord" ? "/attack" : "!attack"}.`,
    };
  }

  if (state.status === "awaiting-boss-confirmation") {
    return {
      message:
        `The boss waits ahead. Use ` +
        `${platform === "discord" ? "/yes or /no" : "!yes or !no"}.`,
    };
  }

  const definition = await getAdventureDefinition(
    state.regionId,
    state.adventureNumber,
  );
  const room = definition.rooms[state.currentRoomId];
  const choice = room?.choices?.[direction];

  if (!choice) {
    return {
      message:
        "That path is unavailable here. Choose " +
        Object.keys(room?.choices || {}).join(", ") + ".",
    };
  }

  const now = Date.now();

  if (
    state.lastDirection === direction &&
    now - Number(state.lastDirectionAt || 0) <
      DUPLICATE_DIRECTION_WINDOW_MS
  ) {
    return {
      message: "That path is already being resolved.",
    };
  }

  state.lastDirection = direction;
  state.lastDirectionAt = now;
  state.updatedAt = now;
  await saveActiveAdventure(env, backpackKey, state);

  if (choice.type === "combat") {
    const enemy = await getEnemyDefinition(choice.enemyId);
    state.status = "in-combat";
    await saveActiveAdventure(env, backpackKey, state);

    return startAdventureBattle(
      env,
      backpackKey,
      state,
      enemy,
      {
        roomId: state.currentRoomId,
        nextRoomId: choice.nextRoomId,
        isBoss: false,
      },
      platform,
    );
  }

  const messageParts = [];
  const rewardToken = `${state.currentRoomId}:${direction}`;
  const isTreasure = choice.type === "treasure";
  const discoveryBerries =
    choice.type === "empty" &&
      Number.isSafeInteger(choice.berries) &&
      choice.berries > 0
      ? choice.berries
      : 0;

  if (state.collectedRewards.includes(rewardToken)) {
    return {
      message: isTreasure
        ? "That treasure has already been collected."
        : "That Shizuki discovery has already been explored.",
    };
  }

  const normalEnemy = await getEnemyDefinition(definition.enemyId);
  const choiceXpRange = getAdventureChoiceXpRange(normalEnemy.level);
  const choiceXp = randomInteger(choiceXpRange.min, choiceXpRange.max);
  const [progress, currentTotal] = await Promise.all([
    getPlayerProgress(env, backpackKey),
    getBackpackTotal(env, backpackKey),
  ]);
  const originalState = structuredClone(state);
  const startingLevel = levelFromXp(progress.xp);
  const startingTitle = getTitleForLevel(startingLevel);
  const startingRegion = getRegionForLevel(startingLevel);
  const xpProgression = applyXpAndStatPointProgression(progress, choiceXp);
  const endingLevel = xpProgression.endingLevel;
  const endingTitle = getTitleForLevel(endingLevel);
  const endingRegion = getRegionForLevel(endingLevel);
  let updatedTotal = currentTotal;

  if (isTreasure) {
    const baseReward = randomInteger(choice.reward.min, choice.reward.max);
    const luckReward = applyLuckToCandyReward(baseReward, progress);
    const reward = luckReward.total;
    updatedTotal += reward;
    messageParts.push(
      `${choice.message} You gain ${choiceXp} XP and recover ${reward} Star Candies.` +
        (luckReward.bonus > 0 ? ` Luck added ${luckReward.bonus}.` : ""),
    );
  } else if (choice.type === "healing") {
    const healed = Math.max(
      0,
      Math.min(
        choice.healAmount,
        state.playerMaxHp - state.playerHp,
      ),
    );
    state.playerHp += healed;
    messageParts.push(
      healed > 0
        ? `${choice.message} You recover ${healed} HP and gain ` +
          `${choiceXp} XP.`
        : `${choice.fullHpMessage} You recover 0 HP and gain ` +
          `${choiceXp} XP.`,
    );
  } else if (choice.type === "empty") {
    messageParts.push(
      `${choice.message} You gain ${choiceXp} XP` +
      (discoveryBerries > 0
        ? ` and find ${discoveryBerries} ` +
          `${discoveryBerries === 1 ? "Berry" : "Berries"}.`
        : "."),
    );
  } else {
    return { message: "That Adventure outcome is not supported." };
  }

  const updatedProgress = {
    ...xpProgression.progress,
    hp: state.playerHp,
    berries: progress.berries + discoveryBerries,
  };
  state.collectedRewards.push(rewardToken);
  advanceAdventureState(
    definition,
    state,
    choice.nextRoomId,
  );

  try {
    await savePlayerProgress(env, backpackKey, {
      ...updatedProgress,
    });
    if (isTreasure) {
      await saveBackpackTotal(env, backpackKey, updatedTotal);
    }
    await saveActiveAdventure(env, backpackKey, state);
  } catch (error) {
    try {
      await Promise.all([
        savePlayerProgress(env, backpackKey, progress),
        isTreasure
          ? saveBackpackTotal(env, backpackKey, currentTotal)
          : Promise.resolve(),
        saveActiveAdventure(env, backpackKey, originalState),
      ]);
    } catch (rollbackError) {
      console.error("Adventure choice reward rollback failed:", rollbackError);
    }
    throw error;
  }

  if (endingLevel > startingLevel) {
    messageParts.push(`LEVEL UP! You reached Level ${endingLevel}!`);
    messageParts.push(formatStatPointAward(
      xpProgression.pointsEarned,
      xpProgression.progress.unspentStatPoints,
      platform,
    ));
    messageParts.push(...await formatLevelUpUnlocks(startingLevel, endingLevel));
  }
  if (endingTitle !== startingTitle) {
    messageParts.push(`Title Earned: ${endingTitle}`);
  }
  if (endingRegion.id !== startingRegion.id) {
    messageParts.push(`Region Unlocked: ${endingRegion.name}`);
    const advancement = classAdvancement(xpProgression.progress);
    if (advancement) messageParts.push(advancement);
  }

  messageParts.push(
    formatAdventureObjective(definition, state, platform),
  );

  return { message: messageParts.join(" | ") };
}

function advanceAdventureState(definition, state, nextRoomId) {
  if (!state.completedRooms.includes(state.currentRoomId)) {
    state.completedRooms.push(state.currentRoomId);
  }

  state.currentRoomId = nextRoomId;

  if (!state.visitedRooms.includes(nextRoomId)) {
    state.visitedRooms.push(nextRoomId);
  }

  state.status = definition.rooms[nextRoomId]?.type === "boss-prompt"
    ? "awaiting-boss-confirmation"
    : "awaiting-direction";
  state.updatedAt = Date.now();
}

async function startAdventureBattle(
  env,
  backpackKey,
  state,
  enemy,
  context,
  platform,
) {
  const now = Math.floor(Date.now() / 1000);
  const progress = await getPlayerProgress(env, backpackKey);
  const resourceCaps = getPlayerResourceCaps(progress);
  const combatState = {
    version: 1,
    regionId: state.regionId,
    encounterNumber: state.adventureNumber,
    playerHp: Math.min(state.playerHp, resourceCaps.hp),
    playerMaxHp: resourceCaps.hp,
    enemy: {
      ...enemy,
      hp: enemy.hp,
      maxHp: enemy.hp,
    },
    adventureContext: {
      adventureId: state.adventureId,
      adventureNumber: state.adventureNumber,
      roomId: context.roomId,
      nextRoomId: context.nextRoomId || null,
      isBoss: context.isBoss === true,
    },
    round: 1,
    stimUses: 0,
    startedAt: now,
    updatedAt: now,
  };

  await saveCombatState(env, backpackKey, combatState);

  return {
    message: platform === "discord"
      ? appendDiscordCombatHud(
          `${context.isBoss ? "Boss fight" : "Enemy fight"} begins! ` +
          `${enemy.name} appears. Use /attack or /cast to strike.`,
          combatState,
          progress,
        )
      : `${context.isBoss ? "Boss fight" : "Enemy fight"} begins! ` +
        `${enemy.name} appears. Enemy HP: ${enemy.hp} | ` +
        `HP: ${state.playerHp}/${state.playerMaxHp} | ` +
        `Mana: ${progress.mana}/${resourceCaps.mana} | Use ` +
        "!attack or !cast to strike.",
  };
}

async function performCombat(
  env,
  backpackKey,
  encounterInput,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => requestCombatConfirmation(
      env,
      backpackKey,
      encounterInput,
      platform,
    ),
  );
}

async function requestCombatConfirmation(
  env,
  backpackKey,
  encounterInput,
  platform,
) {
  const existingCombat = await getCombatState(env, backpackKey);

  if (existingCombat) {
    const progress = await getPlayerProgress(env, backpackKey);
    return {
      message: platform === "discord"
        ? appendDiscordCombatHud(
            `You are already fighting ${existingCombat.enemy.name}. ` +
            "Use /attack to continue.",
            existingCombat,
            progress,
          )
        : `You are already fighting ${existingCombat.enemy.name}. ` +
          `HP: ${existingCombat.playerHp}/${existingCombat.playerMaxHp} | ` +
          `Enemy HP: ${existingCombat.enemy.hp}/${existingCombat.enemy.maxHp} | ` +
          "Use !attack to continue.",
    };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const region =
    getRegionById(progress.currentRegion) ||
    REGIONS[0];

  let combatEntries;

  try {
    combatEntries = await getRegionCombatEntries(region.id);
  } catch (error) {
    console.error(`Combat list unavailable for ${region.id}:`, error);

    return {
      message:
        `Adventures are not available in ${region.name} right now.`,
    };
  }

  if (combatEntries.length === 0) {
    return {
      message:
        `${region.name} does not have any Adventures yet.`,
    };
  }

  const normalizedInput = String(encounterInput ?? "").trim().toLowerCase();
  const playerLevel = levelFromXp(progress.xp);
  const highestUnlocked = getRegionCombatProgress(
    progress,
    region.id,
    combatEntries.length,
  );
  const savedHighestUnlocked =
    progress.combatProgress?.[region.id]?.highestUnlocked;

  if (
    Number.isSafeInteger(savedHighestUnlocked) &&
    savedHighestUnlocked !== highestUnlocked
  ) {
    progress.combatProgress = {
      ...(progress.combatProgress || {}),
      [region.id]: {
        highestUnlocked,
      },
    };
    await savePlayerProgress(env, backpackKey, progress);
  }

  if (!normalizedInput || normalizedInput === "list") {
    return await formatCombatProgress(
      region,
      combatEntries,
      highestUnlocked,
      playerLevel,
      platform,
    );
  }

  if (!/^\d+$/.test(normalizedInput)) {
    return {
      message:
        platform === "discord"
          ? "Use /adventure and choose an Adventure number to begin or resume.\n" +
            "Use /adventure without the number option to view your unlocked Adventures."
          : "Usage: !adventure <Adventure number> | " +
            "Use !adventure to view your unlocked Adventures.",
    };
  }

  const encounterNumber = Number(normalizedInput);

  if (
    !Number.isSafeInteger(encounterNumber) ||
    encounterNumber < 1 ||
    encounterNumber > combatEntries.length
  ) {
    return {
      message:
        `That Adventure does not exist. Choose a number from ` +
        `1 to ${combatEntries.length}.`,
    };
  }

  if (encounterNumber > highestUnlocked) {
    return {
      message:
        `Adventure ${encounterNumber} is locked. ` +
        `Complete Adventure ${encounterNumber - 1} first.`,
    };
  }

  const encounter = getEncounterByNumber(
    combatEntries,
    encounterNumber,
  );
  const enemy = await getEnemyDefinition(encounter.enemy);
  const recommendedLevel = getRecommendedEnemyLevel(
    encounter,
    enemy,
  );
  const isChallenging =
    recommendedLevel > playerLevel;
  await setPendingCombat(env, backpackKey, {
    regionId: region.id,
    encounterNumber,
    enemyId: enemy.id,
    createdAt: Date.now(),
  });

  return {
    pending: true,
    encounterNumber,
    message:
      platform === "discord"
        ? `Adventure ${encounterNumber}: Are you sure you want to fight ` +
          `${enemy.name}?!\n` +
          (isChallenging
            ? `Your Level: ${playerLevel} | Recommended Level: ` +
              `${recommendedLevel} — Challenging\n`
            : `Recommended Level: ${recommendedLevel}\n`) +
          "Use /yes to begin or /no to cancel."
        : `Adventure ${encounterNumber}: Fight ${enemy.name}? ` +
          (isChallenging
            ? `Your Level: ${playerLevel} | Recommended: ` +
              `${recommendedLevel} [Challenging]. `
            : `Recommended Level: ${recommendedLevel}. `) +
          "Use !yes or !no.",
  };
}

async function confirmPendingCombat(
  env,
  backpackKey,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => confirmPendingCombatUnlocked(env, backpackKey, platform),
  );
}

async function confirmPendingCombatUnlocked(
  env,
  backpackKey,
  platform,
) {
  const existingCombat = await getCombatState(env, backpackKey);

  if (existingCombat) {
    return {
      message:
        `You are already fighting ${existingCombat.enemy.name}. ` +
        `Use ${platform === "discord" ? "/attack" : "!attack"} to continue.`,
    };
  }

  const activeAdventure = await getActiveAdventure(env, backpackKey);

  if (activeAdventure?.status === "awaiting-boss-confirmation") {
    const definition = await getAdventureDefinition(
      activeAdventure.regionId,
      activeAdventure.adventureNumber,
    );
    const enemy = await getEnemyDefinition(definition.boss.enemyId);
    activeAdventure.status = "boss-combat";
    activeAdventure.updatedAt = Date.now();
    await saveActiveAdventure(env, backpackKey, activeAdventure);

    const battle = await startAdventureBattle(
      env,
      backpackKey,
      activeAdventure,
      enemy,
      {
        roomId: definition.boss.roomId,
        nextRoomId: null,
        isBoss: true,
      },
      platform,
    );

    return {
      ...battle,
      message:
        `${definition.boss.revealText
          ? `${definition.boss.revealText} | `
          : ""}${battle.message}`,
    };
  }

  const pendingResult = await getPendingCombat(env, backpackKey);

  if (pendingResult.expired) {
    await clearPendingCombat(env, backpackKey);

    return {
      message:
        `That Adventure selection expired. Use ` +
        `${platform === "discord" ? "/adventure and choose the number option" : "!adventure <number>"} again.`,
    };
  }

  const pending = pendingResult.pending;

  if (!pending) {
    return {
      message:
        "You do not have an Adventure waiting for confirmation.",
    };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const region =
    getRegionById(progress.currentRegion) ||
    REGIONS[0];

  if (region.id !== pending.regionId) {
    await clearPendingCombat(env, backpackKey);

    return {
      message:
        `Your region changed. Use ` +
        `${platform === "discord" ? "/adventure and choose the number option" : "!adventure <number>"} again.`,
    };
  }

  let combatEntries;

  try {
    combatEntries = await getRegionCombatEntries(region.id);
  } catch (error) {
    console.error(`Combat confirmation failed for ${region.id}:`, error);

    return {
      message:
        `Adventures are not available in ${region.name} right now.`,
    };
  }

  const encounter = getEncounterByNumber(
    combatEntries,
    pending.encounterNumber,
  );
  const highestUnlocked = getRegionCombatProgress(
    progress,
    region.id,
    combatEntries.length,
  );

  if (
    !encounter ||
    encounter.enemy !== pending.enemyId ||
    pending.encounterNumber > highestUnlocked
  ) {
    await clearPendingCombat(env, backpackKey);

    return {
      message:
        `That Adventure is no longer available. Use ` +
        `${platform === "discord" ? "/adventure" : "!adventure"} again.`,
    };
  }

  const enemy = await getEnemyDefinition(encounter.enemy);
  const result = await startCombatEncounter(
    env,
    backpackKey,
    region,
    pending.encounterNumber,
    enemy,
    platform,
  );

  await clearPendingCombat(env, backpackKey);
  return result;
}

async function cancelPendingCombat(
  env,
  backpackKey,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    async () => {
      const activeAdventure = await getActiveAdventure(env, backpackKey);

      if (activeAdventure?.status === "awaiting-boss-confirmation") {
        const definition = await getAdventureDefinition(
          activeAdventure.regionId,
          activeAdventure.adventureNumber,
        );

        return {
          message:
            `${definition.bossRetreatText ||
              "You step back. The guardian remains ahead."} Use ` +
            `${platform === "discord"
              ? `/adventure number:${activeAdventure.adventureNumber}`
              : `!adventure ${activeAdventure.adventureNumber}`} ` +
            "when you are ready to return.",
        };
      }

      const pendingResult = await getPendingCombat(env, backpackKey);

      if (!pendingResult.pending) {
        if (pendingResult.expired) {
          await clearPendingCombat(env, backpackKey);
        }

        return {
          message:
            "You do not have an Adventure waiting for confirmation.",
        };
      }

      let enemyName = "enemy";

      try {
        enemyName = (
          await getEnemyDefinition(pendingResult.pending.enemyId)
        ).name;
      } catch (error) {
        console.error("Pending combat enemy lookup failed:", error);
      }

      await clearPendingCombat(env, backpackKey);

      return {
        message:
          `Adventure challenge cancelled. The ${enemyName} has been left alone... for now.`,
      };
    },
  );
}

async function startCombatEncounter(
  env,
  backpackKey,
  region,
  encounterNumber,
  enemy,
  platform,
  source = "adventure",
  wanderingBattle = null,
) {
  const now = Math.floor(Date.now() / 1000);
  const progress = await getPlayerProgress(env, backpackKey);
  const resourceCaps = getPlayerResourceCaps(progress);
  const combatState = {
    version: 1,
    regionId: region.id,
    encounterNumber,
    playerHp: progress.hp,
    playerMaxHp: resourceCaps.hp,
    enemy: {
      ...enemy,
      hp: enemy.hp,
      maxHp: enemy.hp,
    },
    round: 1,
    stimUses: 0,
    ...(wanderingBattle ? { wanderingBattle } : {}),
    startedAt: now,
    updatedAt: now,
  };

  await saveCombatState(env, backpackKey, combatState);

  const message = source === "long-rest"
    ? `${enemy.name} appears! Enemy HP: ${enemy.hp} | ` +
      `HP: ${progress.hp}/${resourceCaps.hp} | ` +
      `Mana: ${progress.mana}/${resourceCaps.mana} | ` +
      "Use !attack or !cast to strike."
    : `Adventure ${encounterNumber} begins! ${enemy.name} appears. ` +
      `Enemy HP: ${enemy.hp} | ` +
      `HP: ${progress.hp}/${resourceCaps.hp} | ` +
      `Mana: ${progress.mana}/${resourceCaps.mana} | ` +
      "Use !attack or !cast to strike.";

  return {
    message: platform === "discord"
      ? appendDiscordCombatHud(
          source === "battle"
            ? formatWanderingBattleIntroduction(enemy, region, wanderingBattle)
            : source === "long-rest"
            ? `**An enemy has appeared!**\n\n${enemy.name}\n\n` +
              "Use /attack or /cast spell to strike."
            : `Adventure ${encounterNumber} begins!\n\n` +
              `${enemy.name} appears in ${region.name}.\n\n` +
              "Use /attack or /cast spell to strike.",
          combatState,
          progress,
        )
      : source === "battle"
        ? formatWanderingBattleIntroduction(enemy, region, wanderingBattle)
        : message,
  };
}

function formatWanderingBattleIntroduction(enemy, region, battle) {
  if (battle.variant === "Wishpocket") {
    return "Rare Encounter!\n\n" +
      "Something jingles along the path ahead. A Wishpocket scurries into view, dragging an overstuffed sack of Star Candies behind it.\n\n" +
      "It spots you and immediately starts looking for an escape.\n\n" +
      "Wishpocket appeared! Defeat it before it gets away! Use /attack or /cast to strike.";
  }
  const location = `${enemy.name} drifts into your path as you travel through ${region.name}.`;
  if (battle.variant === "Common") {
    return `Enemy fight begins! A ${location} Use /attack or /cast to strike.`;
  }
  const detail = battle.variant === "Armored"
    ? "It begins with 20 Protection."
    : battle.variant === "Frenzied"
      ? "Its attacks strike harder."
      : battle.blessing === "Damage"
        ? "Fae magic strengthens its attacks."
        : battle.blessing === "Protection"
          ? "Fae magic shields it with 10 Protection."
          : "Fae magic swells its vitality.";
  const article = battle.variant === "Armored" ? "An" : "A";
  return `Uncommon Encounter! ${article} ${battle.variant} ${location} ${detail} ` +
    "Use /attack or /cast to strike.";
}

async function performBattle(env, backpackKey) {
  return withPlayerMutationLock(backpackKey, async () => {
    if (await getCombatState(env, backpackKey)) {
      return { message: "Finish the current fight before seeking another battle." };
    }
    if (await getActiveAdventure(env, backpackKey)) {
      return { message: "Finish your current Adventure before seeking another battle." };
    }
    if ((await getPendingCombat(env, backpackKey)).pending) {
      return { message: "Resolve your pending challenge before seeking another battle." };
    }
    const savedProgress = await env.Backpack.get(getProgressKey(backpackKey));
    if (savedProgress !== null) {
      let parsed;
      try { parsed = JSON.parse(savedProgress); } catch { parsed = null; }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { message: "Your player state is unavailable for battle right now." };
      }
      if (Object.hasOwn(parsed, "currentRegion") &&
          !getRegionById(parsed.currentRegion)) {
        return { message: "Your current region is unavailable for battle." };
      }
    }
    const progress = await getPlayerProgress(env, backpackKey);
    const region = getRegionById(progress.currentRegion);
    if (!region) return { message: "Your current region is unavailable for battle." };
    if (progress.hp <= 0) return { message: "Rest before seeking another battle." };
    const rarityRoll = Math.random();
    if (rarityRoll < BATTLE_WISHPOCKET_CHANCE) {
      const design = WISHPOCKET_BY_REGION[region.id];
      if (!design) return { message: "Your current region is unavailable for battle." };
      const enemy = {
        id: "wishpocket", name: "Wishpocket", level: region.level,
        hp: design.hp, damageBonus: 0, isBoss: false,
        reward: {
          xp: { min: design.xp[0], max: design.xp[1] },
          candies: { min: design.candies[0], max: design.candies[1] },
        },
        defeatCandyLoss: 0,
      };
      return startCombatEncounter(env, backpackKey, region, undefined,
        enemy, "discord", "battle",
        { variant: "Wishpocket", blessing: null, berryUses: 0, actions: 0 });
    }
    let entries;
    try {
      entries = await getRegionCombatEntries(region.id);
    } catch {
      return { message: `Battles are unavailable in ${region.name} right now.` };
    }
    const manifest = await getAdventureManifest(region.id);
    const regionalEnemyIds = new Set(manifest.map(entry => entry.enemyId));
    const candidates = (await Promise.all(entries.map(async (entry) => {
      try {
        if (!regionalEnemyIds.has(entry.enemy)) return null;
        const enemy = await getEnemyDefinition(entry.enemy);
        return enemy.isBoss === true
          ? null : { enemy, encounterNumber: entry.encounter };
      } catch { return null; }
    }))).filter(Boolean);
    if (!candidates.length) {
      return { message: `No wandering enemies are available in ${region.name} right now.` };
    }
    const chosen = randomChoice(candidates);
    const enemy = { ...chosen.enemy };
    const variant = rarityRoll < BATTLE_WISHPOCKET_CHANCE +
      (1 - BATTLE_WISHPOCKET_CHANCE - BATTLE_UNCOMMON_CHANCE)
      ? "Common" : randomChoice(BATTLE_VARIANTS);
    const blessing = variant === "Fae Touched"
      ? randomChoice(FAE_TOUCHED_BLESSINGS) : null;
    if (variant === "Armored") enemy.protection = 20;
    if (variant === "Frenzied") enemy.damageBonus = (enemy.damageBonus || 0) + 3;
    if (variant === "Fae Touched") {
      enemy.hp += Math.floor(chosen.enemy.hp * 0.10) *
        (blessing === "Health" ? 2 : 1);
      if (blessing === "Damage") enemy.damageBonus = (enemy.damageBonus || 0) + 2;
      if (blessing === "Protection") enemy.protection = 10;
    }
    return startCombatEncounter(env, backpackKey, region,
      chosen.encounterNumber, enemy, "discord", "battle",
      { variant, blessing, berryUses: 0 });
  });
}

async function startLongRestEncounter(
  env,
  backpackKey,
  progress,
  platform,
) {
  const region = getRegionById(progress.currentRegion);

  if (!region) {
    console.warn("Long Rest encounter skipped: invalid current region.");
    return null;
  }

  let entries;

  try {
    entries = await getRegionCombatEntries(region.id);
  } catch (error) {
    console.warn(
      `Long Rest encounter skipped: could not load ${region.id}.`,
      error,
    );
    return null;
  }

  const candidates = (
    await Promise.all(
      entries.map(async (entry) => {
        try {
          const enemy = await getEnemyDefinition(entry.enemy);

          return enemy.isBoss === true
            ? null
            : {
                encounterNumber: entry.encounter,
                enemy,
              };
        } catch (error) {
          console.warn(
            `Long Rest enemy skipped: ${entry.enemy}.`,
            error,
          );
          return null;
        }
      }),
    )
  ).filter(Boolean);

  if (candidates.length === 0) {
    console.warn(
      `Long Rest encounter skipped: no eligible enemies in ${region.id}.`,
    );
    return null;
  }

  const selected = randomChoice(candidates);
  const battle = await startCombatEncounter(
    env,
    backpackKey,
    region,
    selected.encounterNumber,
    selected.enemy,
    platform,
    "long-rest",
  );

  return {
    enemy: selected.enemy,
    message: battle.message,
  };
}

async function performStim(env, backpackKey, platform = "twitch", input = "") {
  return withPlayerMutationLock(
    backpackKey,
    () => performStimUnlocked(env, backpackKey, platform, input),
  );
}

async function performStimUnlocked(env, backpackKey, platform, input) {
  if (String(input || "").trim()) {
    return { message: `Use ${platform === "discord" ? "/stim" : "!stim"} without any arguments.` };
  }
  const combatState = await getCombatState(env, backpackKey);
  if (!combatState) {
    return { message: "Stim can only be used during a battle." };
  }
  if ((combatState.stimUses || 0) >= STIM_USES_PER_BATTLE) {
    return { message: "You have already used your Stim for this battle." };
  }
  const progress = await getPlayerProgress(env, backpackKey);
  const maximumHp = getPlayerResourceCaps(progress).hp;
  if (combatState.playerHp === maximumHp) {
    return { message: "You're already at full HP. Save your Stim for this battle." };
  }

  const originalCombatState = structuredClone(combatState);
  const updatedProgress = { ...progress, hp: maximumHp };
  combatState.playerHp = maximumHp;
  combatState.playerMaxHp = maximumHp;
  combatState.stimUses = (combatState.stimUses || 0) + 1;
  const separator = platform === "discord" ? "\n\n" : " | ";
  const stimMessage = randomChoice(STIM_SUCCESS_MESSAGES) + separator +
    `HP fully restored: ${maximumHp}/${maximumHp}. Stim used for this battle.`;

  try {
    await savePlayerProgress(env, backpackKey, updatedProgress);
    const turnStart = await advanceLeviathansWake(
      env, backpackKey, combatState, updatedProgress, platform,
    );
    if (turnStart.victory) return {
      ...turnStart.victory,
      message: [stimMessage, turnStart.victory.message].join(separator),
    };
    return await resolvePlayerCombatAction(env, backpackKey, combatState, {
      damage: 0,
      message: [turnStart.message, stimMessage].filter(Boolean).join(separator),
    }, platform);
  } catch (error) {
    try {
      await Promise.all([
        savePlayerProgress(env, backpackKey, progress),
        saveCombatState(env, backpackKey, originalCombatState),
      ]);
    } catch (rollbackError) {
      console.error("Stim rollback failed:", rollbackError);
    }
    throw error;
  }
}

function resolveWeaponAttack(id, rolls, strength, enemyProtection, platform, classTierIndex = null, fury = false) {
  const natural = Math.max(...rolls);
  let hits = [];
  let protection = 0;
  let stagger = 0;
  if (id === "daggers") {
    hits = rolls.map(roll => roll === 1 ? 0 : roll <= 9 ? 10 : roll <= 15 ? 14 : roll <= 19 ? 18 : 25);
  } else {
    let base = 0;
    if (id === "sword-and-shield") {
      base = natural === 1 ? 0 : natural <= 5 ? 15 : natural <= 10 ? 20 : natural <= 15 ? 25 : natural <= 19 ? 30 : 40;
      protection = natural === 1 ? 0 : natural <= 10 ? 5 : natural <= 19 ? 10 : 15;
    } else if (id === "axe") {
      base = natural <= 5 ? 0 : natural <= 10 ? 30 : natural <= 15 ? 40 : natural <= 19 ? 50 : 70;
    } else if (id === "spear") {
      base = natural === 1 ? 0 : natural <= 6 ? 20 : natural <= 12 ? 25 : natural <= 17 ? 30 : natural <= 19 ? 35 : 45;
    } else if (id === "hammer") {
      base = natural <= 3 ? 0 : natural <= 8 ? 25 : natural <= 14 ? 35 : natural <= 19 ? 45 : 60;
      stagger = natural >= 15 ? natural === 20 ? 10 : 5 : 0;
    } else if (id === "bow") {
      base = natural === 1 ? 0 : natural <= 9 ? 20 : natural <= 14 ? 25 : natural <= 19 ? 30 : 40;
    }
    hits = [base];
  }
  const baseTotal = hits.reduce((sum, hit) => sum + hit, 0);
  let classDamage = 0;
  const classParts = [];
  const specialization = classTierIndex === null ? null : CLASS_DATA[id];
  if (baseTotal > 0 && specialization) {
    classDamage = specialization.damage[classTierIndex];
    classParts.push(`+${classDamage} ${specialization.titles[classTierIndex]}`);
    if (id === "daggers" && hits.every(hit => hit > 0) && classTierIndex >= 2) {
      const bonus = classTierIndex >= 4 ? 4 : 2;
      classDamage += bonus; classParts.push(`+${bonus} Both Blades`);
      if (classTierIndex === 5 && rolls.every(roll => roll >= 15)) {
        classDamage += 6; classParts.push("+6 High Pair");
      }
    }
    if (id === "axe") {
      const bonus = natural === 20 && classTierIndex >= 3 ? classTierIndex === 5 ? 15 : 8 : 0;
      if (bonus) { classDamage += bonus; classParts.push(`+${bonus} Natural 20`); }
      if (fury && classTierIndex >= 4) { classDamage += 5; classParts.push("+5 Fury"); }
    }
    if (id === "spear" && classTierIndex === 5 && enemyProtection > 0) {
      classDamage += 5; classParts.push("+5 Protection Bonus");
    }
    if (id === "bow" && classTierIndex >= 3 && rolls.every(roll => roll >= 15)) {
      const bonus = classTierIndex === 5 ? rolls.every(roll => roll === 20) ? 15 : 8 : 4;
      classDamage += bonus; classParts.push(`+${bonus} ${rolls.every(roll => roll === 20) && classTierIndex === 5 ? "Double 20" : "High Pair"}`);
    }
    if (id === "sword-and-shield") protection += specialization.protection[classTierIndex];
    if (id === "hammer") stagger = natural === 20 ? specialization.stagger[classTierIndex][1]
      : natural >= 15 ? specialization.stagger[classTierIndex][0] : 0;
  }
  const damage = baseTotal > 0 ? baseTotal + strength + classDamage : 0;
  const pierceProtection = id === "spear" && damage > 0
    ? Math.min(specialization ? specialization.pierce[classTierIndex] : 10, enemyProtection) : 0;
  const details = [SHOP_ITEMS[id].displayName,
    rolls.length === 2 ? `Rolls: ${rolls.join(" / ")}` : `Roll: ${natural}`];
  if (id === "bow") details.push(`Kept: ${natural}`);
  details.push(damage ? `${hits.join(" + ")} +${strength} Strength${classParts.length ? " " + classParts.join(" ") : ""} → ${damage} dmg` : "Miss!");
  if (protection) details.push(`Protection +${protection}`);
  if (pierceProtection) details.push(`Pierced ${pierceProtection} Protection`);
  if (stagger) details.push(`Stagger: next successful enemy attack -${stagger} damage`);
  return { damage, protection, pierceProtection, stagger,
    message: details.join(platform === "discord" ? "\n" : " | ") };
}

async function performAttack(
  env,
  backpackKey,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performAttackUnlocked(env, backpackKey, platform),
  );
}

async function performAttackUnlocked(
  env,
  backpackKey,
  platform = "twitch",
) {
  const combatState = await getCombatState(env, backpackKey);

  if (!combatState) {
    const activeAdventure = await getActiveAdventure(env, backpackKey);

    if (activeAdventure) {
      if (activeAdventure.status === "awaiting-boss-confirmation") {
        return {
          message:
            "There isn't an enemy to attack right now. " +
            `Use ${platform === "discord" ? "/yes or /no" : "!yes or !no"} ` +
            "to answer the Adventure challenge.",
        };
      }

      return {
        message:
          "There isn't an enemy to attack right now. " +
          "Continue your Adventure by choosing " +
          `${platform === "discord"
            ? "/left, /right, or /forward"
            : "!left, !right, or !forward"}.`,
      };
    }

    return {
      message:
        "You are not currently in an Adventure. " +
        `Start one with ${platform === "discord" ? "/adventure" : "!adventure"}.`,
    };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const weaponId = WEAPON_IDS.includes(progress.equippedWeapon) &&
    progress.ownedWeapons.includes(progress.equippedWeapon)
    ? progress.equippedWeapon : null;
  const turnStart = await advanceLeviathansWake(
    env, backpackKey, combatState, progress, platform,
  );
  if (turnStart.victory) return turnStart.victory;
  const rolls = weaponId === "daggers" || weaponId === "bow"
    ? [randomInteger(1, 20), randomInteger(1, 20)]
    : [randomInteger(1, 20)];
  const playerRoll = Math.max(...rolls);
  const triggeredRoll = consumeTriggeredStatusEffects(
    progress,
    OFFENSIVE_ROLL_TRIGGER,
    playerRoll,
    combatState,
  );
  const basePlayerAttack = playerRoll === 1
    ? getCombatRollResult(playerRoll)
    : getCombatRollResult(triggeredRoll.finalTotal);
  const strengthBonus = basePlayerAttack.damage > 0
    ? getStrengthDamageBonus(progress)
    : 0;
  const playerAttack = {
    ...basePlayerAttack,
    baseDamage: basePlayerAttack.damage,
    strengthBonus,
    damage: basePlayerAttack.damage + strengthBonus,
  };
  const weaponAttack = weaponId
    ? resolveWeaponAttack(weaponId, rolls, getStrengthDamageBonus(progress), combatState.enemy.protection || 0,
      platform, progress.activeClass === weaponId ? classTier(progress) : null, combatState.warbringerFury === true)
    : null;
  if (weaponId === "axe" && progress.activeClass === "axe" && classTier(progress) >= 4) {
    if (weaponAttack.damage === 0) combatState.warbringerFury = true;
    else delete combatState.warbringerFury;
  }
  let paladinHeal = 0;
  if (weaponId === "sword-and-shield" && progress.activeClass === weaponId &&
      classTier(progress) === 5 && weaponAttack.damage > 0) {
    paladinHeal = Math.min(3, Math.max(0, getPlayerResourceCaps(progress).hp - combatState.playerHp));
    combatState.playerHp += paladinHeal;
  }
  const actionMessage = weaponAttack
    ? weaponAttack.message + (paladinHeal ? `\nRestored ${paladinHeal} HP` : "")
    : formatPlayerAttackResolution(playerRoll, playerAttack, triggeredRoll, platform);
  let updatedProgress = {
    ...progress,
    statusEffects: triggeredRoll.statusEffects,
  };
  const statusEffectsChanged =
    JSON.stringify(progress.statusEffects) !==
    JSON.stringify(triggeredRoll.statusEffects);

  if (statusEffectsChanged) {
    await savePlayerProgress(env, backpackKey, updatedProgress);
  }

  try {
    if (weaponAttack?.protection) {
      const effects = combatState.berryEffects ||= {};
      effects.protection = (effects.protection || 0) + weaponAttack.protection;
    }
    if (weaponAttack?.stagger) {
      combatState.stagger = Math.max(combatState.stagger || 0, weaponAttack.stagger);
      combatState.titanStagger = weaponId === "hammer" && progress.activeClass === "hammer" && classTier(progress) === 5;
    }
    const attackDamage = weaponAttack ? weaponAttack.damage : playerAttack.damage;
    return await resolvePlayerCombatAction(
      env,
      backpackKey,
      combatState,
      {
        roll: triggeredRoll.finalTotal,
        damage: attackDamage,
        pierceProtection: weaponAttack?.pierceProtection || 0,
        message: turnStart.message ? `${turnStart.message}\n\n${actionMessage}` : actionMessage,
        victoryMessage: actionMessage,
        momentumAction: "attack",
        regionalAction: "attack",
        momentumNaturalRoll: playerRoll,
        expeditionQualifies: attackDamage > 0,
        familiarQualifies: true,
        harmonySources: countOffensiveRollBonusSources(triggeredRoll),
        harmonySuccess: attackDamage > 0,
        faeSecondOpinionFailure: attackDamage === 0,
      },
      platform,
    );
  } catch (error) {
    if (statusEffectsChanged) {
      try {
        await savePlayerProgress(env, backpackKey, progress);
      } catch (rollbackError) {
        console.error(
          "Attack status-effect rollback failed:",
          rollbackError,
        );
      }
    }

    throw error;
  }
}

async function applyFamiliarAction(env, backpackKey, combatState, progress) {
  const spell = await getSpellDefinition("familiar");
  const active = combatState.familiar;
  const creature = spell.familiars.find((entry) => entry.id === active.id);
  const effect = creature.effect;
  const astralBond = active.astralBond === "armed";
  const multiplier = astralBond ? 2 : 1;
  if (astralBond) active.astralBond = "spent";
  const caps = getPlayerResourceCaps(progress);
  combatState.playerMaxHp = caps.hp;
  combatState.playerHp = Math.min(combatState.playerHp, caps.hp);
  const hpBefore = combatState.playerHp;
  const manaBefore = progress.mana;
  combatState.playerHp = Math.min(caps.hp, combatState.playerHp + (effect.hp || 0) * multiplier);
  const restoredMana = restoreManaToNormalCap(
    progress.mana, (effect.mana || 0) * multiplier, caps.mana, combatState,
  );
  const clauses = [];
  if (effect.damage) {
    const damage = effect.damage * multiplier;
    damageCombatEnemy(combatState, damage);
    clauses.push(`deals ${damage} damage`);
  }
  if (effect.hp) clauses.push(`restores ${combatState.playerHp - hpBefore} HP`);
  if (effect.mana) clauses.push(`restores ${restoredMana - manaBefore} Mana`);
  if (effect.protection) {
    const pools = combatState.familiarProtection ||= [];
    let pool = pools.find((entry) => entry.serial === active.serial);
    if (!pool) {
      pool = { serial: active.serial, amount: 0, max: effect.protection * 5 };
      pools.push(pool);
    }
    if (astralBond) pool.max += effect.protection;
    const granted = Math.min(effect.protection * multiplier, pool.max - pool.amount);
    pool.amount += granted;
    clauses.push(`grants ${granted} protection`);
  }
  active.actions += 1;
  const milestone = active.actions === 2 ? creature.action2
    : active.actions === 3 ? creature.action3
      : active.actions === 4 ? creature.action4
        : active.actions === 5 ? creature.outro : "";
  const kinship = active.actions === 5
    ? (await getActivePerks(levelFromXp(progress.xp))).find(
        (perk) => perk.effect.trigger === "familiar-fifth-action-completed",
      )
    : null;
  const updatedProgress = {
    ...progress,
    hp: combatState.playerHp,
    mana: kinship
      ? Math.min(caps.mana, restoredMana + kinship.effect.manaRestore)
      : restoredMana,
  };
  recordRegionalManaRecovery(combatState, updatedProgress.mana - restoredMana);
  await savePlayerProgress(env, backpackKey, updatedProgress);
  if (active.actions === 5) delete combatState.familiar;
  return {
    progress: updatedProgress,
    faeSource: creature.id === "fae-snail" ? "fae-snail" : null,
    message: (astralBond ? "Bond empowers your Familiar!\n\n" : "") +
      `${creature.name} ${clauses.join(" + ")}.` +
      (milestone ? `\n\n${milestone}` : "") +
      (kinship ? `\n\n${kinship.activationLine}` : ""),
  };
}

function applyAstralRhythm(combatState, activePerks, spellId) {
  const rhythm = activePerks.find(
    (perk) => perk.effect.trigger === "different-successful-damaging-spells",
  );
  if (!rhythm || combatState.perkUses?.[rhythm.id]) return null;
  const previousSpell = combatState.astralRhythmPreviousSpell;
  combatState.astralRhythmPreviousSpell = spellId;
  if (!previousSpell || previousSpell === spellId) return null;
  combatState.perkUses = {
    ...(combatState.perkUses || {}),
    [rhythm.id]: 1,
  };
  return rhythm;
}

function activateShizukisPresence(combatState, progress, mastery, sourceId,
  platform = "discord") {
  if (!mastery) return { progress, message: "", activated: false };
  const source = mastery.effect.qualifyingSources.find(
    (entry) => entry.id === sourceId,
  );
  if (!source) return { progress, message: "", activated: false };
  const sources = combatState.shizukiFaeSources ||= [];
  if (!sources.includes(sourceId)) sources.push(sourceId);
  if (combatState.shizukisPresenceUsed || sources.length < 2) {
    return { progress, message: "", activated: false };
  }

  combatState.shizukisPresenceUsed = true;
  combatState.shizukisPresence = {
    offensiveRollModifier: mastery.effect.empowerment.offensiveRollModifier,
    bonusDamage: mastery.effect.empowerment.bonusDamage,
  };
  const caps = getPlayerResourceCaps(progress);
  combatState.playerMaxHp = caps.hp;
  combatState.playerHp = Math.min(
    caps.hp, combatState.playerHp + mastery.effect.recovery.hp,
  );
  const manaBefore = progress.mana;
  const manaAfter = manaBefore >= caps.mana
    ? manaBefore
    : Math.min(caps.mana, manaBefore + mastery.effect.recovery.mana);
  recordRegionalManaRecovery(combatState, manaAfter - manaBefore);
  const updatedProgress = {
    ...progress,
    hp: combatState.playerHp,
    mana: manaAfter,
  };
  const names = sources.slice(0, 2).map((id) =>
    mastery.effect.qualifyingSources.find((entry) => entry.id === id).name);
  const separator = platform === "discord" ? "\n\n" : " | ";
  return {
    progress: updatedProgress,
    activated: true,
    message: [
      randomChoice(mastery.convergenceFlavor),
      `${names[0]} and ${names[1]} have activated Shizuki's Presence!`,
      "Restoring 30 HP and 40 Mana and empowering your next damaging spell.",
    ].join(separator),
  };
}

function applyRisingPower(combatState, activePerks, spellId) {
  const perk = activePerks.find(
    (entry) => entry.effect.trigger === "different-successful-damaging-offensive-spells",
  );
  if (!perk) return null;
  const previous = combatState.risingPower;
  if (previous?.spellId === spellId) {
    combatState.risingPower = { spellId, steps: 0 };
    return previous.steps > 0
      ? { bonusDamage: 0, message: "Rising Power resets." }
      : null;
  }
  const steps = previous ? Math.min(previous.steps + 1, perk.effect.maximumSteps) : 0;
  combatState.risingPower = { spellId, steps };
  const bonusDamage = steps * perk.effect.damagePerStep;
  return bonusDamage
    ? { bonusDamage, message: `Rising Power: +${bonusDamage} damage`,
      reachedMaximum: previous?.steps === perk.effect.maximumSteps - 1 &&
        steps === perk.effect.maximumSteps }
    : null;
}

async function applyAstralExpedition(env, backpackKey, progress, perk) {
  const count = Math.min(
    Number.MAX_SAFE_INTEGER,
    progress.astralExpeditionRolls + 1,
  );
  const reachedMilestone = count % perk.effect.rollsPerMilestone === 0;
  const updatedProgress = {
    ...progress,
    astralExpeditionRolls: count,
    ...(reachedMilestone ? {
      statusEffects: addStatusEffect(progress, {
        id: "astral_expedition",
        displayName: "Astral Expedition",
        description: "+3 to the next offensive roll",
        category: "buff",
        source: "perk",
        visibility: "public",
        durationType: "charges",
        remainingCharges: 1,
        trigger: OFFENSIVE_ROLL_TRIGGER,
        modifiers: { attackRoll: perk.effect.offensiveRollModifier },
        createdAt: Date.now(),
      }),
    } : {}),
  };
  await savePlayerProgress(env, backpackKey, updatedProgress);
  if (reachedMilestone) {
    const total = await getBackpackTotal(env, backpackKey);
    await saveBackpackTotal(
      env, backpackKey, total + perk.effect.candies,
    );
  }
  return {
    progress: updatedProgress,
    message: reachedMilestone ? perk.activationLine : "",
  };
}

async function applyAstralEchoMastery(
  env, backpackKey, combatState, progress, naturalRoll, activeMasteries,
) {
  const mastery = activeMasteries.find(
    (entry) => entry.spellId === "astral-echo" &&
      entry.effect.id === "echo-afterglow",
  );
  const outcome = mastery?.effect.outcomes.find(
    (entry) => entry.naturalRoll === naturalRoll,
  );
  if (!outcome) return { progress, message: "" };
  if (outcome.manaRestore) {
    const maximumMana = getPlayerResourceCaps(progress).mana;
    const mana = restoreManaToNormalCap(
      progress.mana, outcome.manaRestore, maximumMana, combatState,
    );
    if (mana !== progress.mana) {
      progress.mana = mana;
      await savePlayerProgress(env, backpackKey, progress);
    }
  } else {
    combatState.astralEchoMastery = {
      offensiveRollModifier: outcome.offensiveRollModifier,
    };
  }
  return { progress, message: outcome.activationLine };
}

// Shared by normal enemies and bosses. No per-enemy content or player progression.
const REGIONAL_ENEMY_PERKS = Object.freeze({
  "moonlit-reef": { gentleCurrent: true },
  "starfall-trench": { starfallPressure: true },
  "whispering-kelp-forest": { tanglingKelp: true, kelpRecovery: true },
  "leviathans-wake": { crushingWake: true, deepwaterHunger: true },
  "sunken-kings-throne": { royalGuard: true, kingsTax: true, throneResolve: true },
  "astral-nexus": { realityEcho: true, manaFracture: true, nexusAdaptation: true },
});
const REGIONAL_BOSS_PHASES = Object.freeze({
  "moonlit-reef": [
    { name: "First Ripple", notice: "Gentle Current: +7 damage", gentle: 7 },
    { name: "Rising Current", notice: "Gentle Current: +9 damage", gentle: 9 },
    { name: "Moonlit Surge", notice: "Gentle Current: +12 damage", gentle: 12 },
  ],
  "starfall-trench": [
    { name: "Sinking Pressure", notice: "Starfall Pressure: 15 Mana every 3 successful damaging spells", cadence: 3, drain: 15 },
    { name: "Crushing Depths", notice: "Starfall Pressure: 20 Mana every 2 successful damaging spells", cadence: 2, drain: 20 },
    { name: "Blackwater Pressure", notice: "Starfall Pressure: 30 Mana every 2 successful damaging spells", cadence: 2, drain: 30 },
  ],
  "whispering-kelp-forest": [
    { name: "Creeping Vines", notice: "Kelp Recovery: 12 HP every 4 enemy responses", recovery: 12, cadence: 4 },
    { name: "Thickened Growth", notice: "Kelp Recovery: 15 HP every 4 enemy responses", recovery: 15, cadence: 4 },
    { name: "Strangling Bloom", notice: "Kelp Recovery: 15 HP every 3 enemy responses", recovery: 15, cadence: 3 },
  ],
  "leviathans-wake": [
    { name: "Distant Tremor", notice: "Crushing Wake: +18 damage every 3 enemy responses", crushing: 18 },
    { name: "Rising Wake", notice: "Crushing Wake: +20 damage every 3 enemy responses", crushing: 20 },
    { name: "Abyssal Breaker", notice: "Crushing Wake: +25 damage every 3 enemy responses", crushing: 25 },
  ],
  "sunken-kings-throne": [
    { name: "Royal Vigil", notice: "Royal Guard: 18 damage reduction\nKing's Tax: +5 Mana\nThrone's Resolve: 20 Protection", guard: 18, tax: 5, resolve: 20 },
    { name: "King's Decree", notice: "Royal Guard: 20 damage reduction\nKing's Tax: +7 Mana\nThrone's Resolve: 20 Protection", guard: 20, tax: 7, resolve: 20 },
    { name: "Last Decree", notice: "Royal Guard: 20 damage reduction\nKing's Tax: +8 Mana\nThrone's Resolve: 30 Protection", guard: 20, tax: 8, resolve: 30 },
  ],
  "astral-nexus": [
    { name: "Fractured Shell", notice: "Reality Shell: 10 Protection every 4 successful damaging actions", shell: 10, cadence: 4 },
    { name: "Unstable Shell", notice: "Reality Shell: 12 Protection every 3 successful damaging actions", shell: 12, cadence: 3 },
    { name: "Collapsing Shell", notice: "Reality Shell: 15 Protection every 2 successful damaging actions", shell: 15, cadence: 2 },
  ],
});
function bossPhase(combatState) {
  return combatState.enemy.isBoss === true && combatState.regionalEnemy?.phase > 0
    ? REGIONAL_BOSS_PHASES[combatState.regionId]?.[combatState.regionalEnemy.phase - 1] : null;
}
function advanceBossPhase(combatState) {
  if (combatState.enemy.isBoss !== true || combatState.enemy.hp <= 0) return;
  const enemy = combatState.enemy;
  const phase = enemy.hp * 4 < enemy.maxHp ? 3
    : enemy.hp * 2 < enemy.maxHp ? 2
      : enemy.hp * 4 < enemy.maxHp * 3 ? 1 : 0;
  const state = getRegionalEnemyState(combatState);
  if (phase <= state.phase) return;
  state.phase = phase;
  const next = REGIONAL_BOSS_PHASES[combatState.regionId][phase - 1];
  if (next.recovery) state.responses = Math.min(state.responses, next.cadence - 1);
  if (next.shell) state.shellActions = Math.min(state.shellActions, next.cadence - 1);
  // Completed cycles stay consumed; partial progress is retained across cadences.
  regionalEnemyReceipt(combatState,
    `Boss Phase Activated: ${next.name}\n${next.notice}`);
}
const regionalEnemyReceipts = new WeakMap();

function regionalEnemyReceipt(combatState, message) {
  const messages = regionalEnemyReceipts.get(combatState) || [];
  messages.push(message);
  regionalEnemyReceipts.set(combatState, messages);
}

function takeRegionalEnemyReceipts(combatState) {
  const messages = regionalEnemyReceipts.get(combatState) || [];
  regionalEnemyReceipts.delete(combatState);
  return messages;
}

function getRegionalEnemyState(combatState) {
  let state = combatState.regionalEnemy;
  if (!state || state.enemyId !== combatState.enemy.id ||
      state.regionId !== combatState.regionId) {
    state = combatState.regionalEnemy = {
      enemyId: combatState.enemy.id, regionId: combatState.regionId,
      actions: 0, spells: 0, streak: 0, responses: 0,
      gentle: false, pressure: false, hunger: false, guard: false,
      resolveUsed: false, fracture: 0, adaptation: 0, lastSpell: null,
      repetition: false,
      phase: 0, shellActions: 0,
      pressureAmount: 0,
    };
  }
  // Older in-progress battles may have been saved before boss phases existed.
  if (state.phase === undefined) state.phase = 0;
  if (state.shellActions === undefined) state.shellActions = 0;
  if (state.pressureAmount === undefined) state.pressureAmount = state.pressure ? 10 : 0;
  return state;
}

function isValidRegionalEnemyState(state) {
  if (state === undefined) return true; // Existing active battles migrate lazily.
  return Boolean(state && typeof state.enemyId === "string" &&
    REGIONAL_ENEMY_PERKS[state.regionId] &&
    ["actions", "spells", "streak", "responses", "fracture", "adaptation"]
      .every(key => Number.isSafeInteger(state[key]) && state[key] >= 0) &&
    state.actions <= 6 && state.spells <= 4 && state.streak <= 1 &&
    state.responses <= 3 && [0, 5, 10].includes(state.adaptation) &&
    (state.phase === undefined || (Number.isSafeInteger(state.phase) && state.phase >= 0 && state.phase <= 3)) &&
    (state.shellActions === undefined || (Number.isSafeInteger(state.shellActions) && state.shellActions >= 0 && state.shellActions <= 3)) &&
    (state.pressureAmount === undefined || [0, 10, 15, 20, 30].includes(state.pressureAmount)) &&
    ["gentle", "pressure", "hunger", "guard", "resolveUsed", "repetition"]
      .every(key => typeof state[key] === "boolean") &&
    (state.lastSpell === null || (typeof state.lastSpell === "string" &&
      /^[a-z-]+$/.test(state.lastSpell))));
}

// All incoming enemy damage (including independent follow-ups) shares this shield.
// Returns actual HP damage; shield absorption is reported separately.
function damageCombatEnemy(combatState, damage, pierceProtection = 0) {
  const enemy = combatState.enemy;
  const amount = Math.max(0, damage || 0);
  const pierced = Math.min(enemy.protection || 0, pierceProtection, amount);
  if (pierced > 0) enemy.protection -= pierced;
  const absorbed = Math.min(enemy.protection || 0, amount);
  if (absorbed > 0) {
    enemy.protection -= absorbed;
    regionalEnemyReceipt(combatState,
      `${combatState.wanderingBattle ? "Protection" : "Throne's Resolve — Protection"} absorbed ${absorbed}; ${enemy.protection} remains.`);
  }
  const dealt = Math.min(enemy.hp, amount - absorbed);
  enemy.hp -= dealt;
  return dealt;
}

function finishRegionalEnemyDamage(combatState, hpBefore, deferPhase = false) {
  if (isWishpocketCombat(combatState)) return;
  const enemy = combatState.enemy;
  if (REGIONAL_ENEMY_PERKS[combatState.regionId]?.throneResolve) {
    const state = getRegionalEnemyState(combatState);
    if (!state.resolveUsed && enemy.hp > 0 &&
      hpBefore * 4 >= enemy.maxHp && enemy.hp * 4 < enemy.maxHp) {
      state.resolveUsed = true;
      const protection = enemy.isBoss === true
        ? REGIONAL_BOSS_PHASES[combatState.regionId][2].resolve : 20;
      enemy.protection = (enemy.protection || 0) + protection;
      regionalEnemyReceipt(combatState, `Throne's Resolve — Gained ${protection} Protection.`);
    }
  }
  if (!deferPhase) advanceBossPhase(combatState);
}

function getRegionalSpellTax(combatState) {
  if (isWishpocketCombat(combatState)) return 0;
  return REGIONAL_ENEMY_PERKS[combatState.regionId]?.kingsTax &&
    getRegionalEnemyState(combatState).spells === 2 ? bossPhase(combatState)?.tax || 5 : 0;
}

function getRegionalTaxPayment(combatState, damage, tax) {
  if (isWishpocketCombat(combatState)) return 0;
  // Reserve affordability before rolling, then charge only a successful primary
  // hit. This preview does not consume Guard or Protection and needs no refund.
  const guard = REGIONAL_ENEMY_PERKS[combatState.regionId]?.royalGuard &&
    getRegionalEnemyState(combatState).guard ? bossPhase(combatState)?.guard || 15 : 0;
  return damage > guard + (combatState.enemy.protection || 0) ? tax : 0;
}

function applyRegionalRoyalGuard(combatState, damage, deferred = false) {
  if (isWishpocketCombat(combatState)) return damage;
  if (damage <= 0 || !REGIONAL_ENEMY_PERKS[combatState.regionId]?.royalGuard) {
    return damage;
  }
  const state = getRegionalEnemyState(combatState);
  if (!state.guard) return damage;
  state.guard = false;
  const guard = bossPhase(combatState)?.guard || 15;
  const reduction = Math.min(guard, damage);
  regionalEnemyReceipt(combatState, deferred
    ? `Royal Guard — Reserved up to ${guard} damage reduction for Wake arrival.`
    : `Royal Guard — Spell damage reduced by ${reduction}.`);
  return damage - reduction;
}

function recordRegionalPlayerAction(combatState, kind, spellId, successful) {
  if (isWishpocketCombat(combatState)) return;
  if (!successful || combatState.enemy.hp <= 0) return;
  const perks = REGIONAL_ENEMY_PERKS[combatState.regionId] || {};
  const state = getRegionalEnemyState(combatState);
  if (kind !== "attack" && kind !== "spell") return;
  if (perks.gentleCurrent) {
    state.actions = (state.actions + 1) % 3;
    if (state.actions === 0 && !state.gentle) {
      state.gentle = true;
      regionalEnemyReceipt(combatState, `Gentle Current — Next damaging attack +${bossPhase(combatState)?.gentle || 5}.`);
    }
  }
  if (perks.nexusAdaptation) {
    state.actions = Math.min(6, state.actions + 1);
    const adaptation = state.actions >= 6 ? 10 : state.actions >= 3 ? 5 : 0;
    if (adaptation > state.adaptation) {
      state.adaptation = adaptation;
      regionalEnemyReceipt(combatState, `Nexus Adaptation — Increased to +${adaptation} damage.`);
    }
  }
  const shell = bossPhase(combatState)?.shell;
  if (shell) {
    state.shellActions = (state.shellActions + 1) % bossPhase(combatState).cadence;
    if (state.shellActions === 0 && (combatState.enemy.protection || 0) === 0) {
      combatState.enemy.protection = shell;
      regionalEnemyReceipt(combatState, `Reality Shell: +${shell} Protection`);
    }
  }
  if (kind === "attack") {
    state.streak = 0;
    state.lastSpell = null;
    return;
  }
  if (perks.starfallPressure && !state.pressure) {
    state.spells += 1;
    if (state.spells >= (bossPhase(combatState)?.cadence || 4)) {
      state.pressure = true;
      state.pressureAmount = bossPhase(combatState)?.drain || 10;
      regionalEnemyReceipt(combatState, `Starfall Pressure — Next damaging attack drains ${state.pressureAmount} Mana.`);
    }
  }
  if (perks.kingsTax) state.spells = (state.spells + 1) % 3;
  if (perks.royalGuard) {
    state.streak += 1;
    if (state.streak === 2) {
      state.guard = true;
      state.streak = 0;
      regionalEnemyReceipt(combatState, "Royal Guard — Activated for the next damaging spell.");
    }
  }
  if (perks.realityEcho) {
    if (state.lastSpell === spellId) state.repetition = true;
    state.lastSpell = spellId;
  }
}

// Called at each individual recovery source, never on a net command-wide delta.
function recordRegionalManaRecovery(combatState, actualAmount) {
  if (isWishpocketCombat(combatState)) return;
  if (!combatState || combatState.enemy.hp <= 0 || actualAmount <= 0) return;
  const perks = REGIONAL_ENEMY_PERKS[combatState.regionId] || {};
  if (!perks.deepwaterHunger && !perks.manaFracture) return;
  const state = getRegionalEnemyState(combatState);
  if (perks.deepwaterHunger && actualAmount >= 20 && !state.hunger) {
    state.hunger = true;
    regionalEnemyReceipt(combatState, "Deepwater Hunger — Next damaging attack drains 10 Mana.");
  }
  if (perks.manaFracture && actualAmount >= 25) {
    const amount = Math.round(actualAmount * 0.25);
    if (amount > state.fracture) {
      state.fracture = amount;
    }
  }
}

function getCombatProtection(combatState) {
  return (combatState.bubble?.protection || 0) +
    (combatState.berryEffects?.protection || 0) +
    (combatState.wakeMantaProtection || 0) +
    (combatState.familiarProtection || []).reduce((sum, pool) => sum + pool.amount, 0);
}

function isWishpocketCombat(combatState) {
  return combatState?.wanderingBattle?.variant === "Wishpocket";
}

async function advanceWishpocketEscape(env, backpackKey, combatState,
  progress, platform, messageParts) {
  const actions = ++combatState.wanderingBattle.actions;
  await savePlayerProgress(env, backpackKey, { ...progress, hp: combatState.playerHp });
  if (actions >= WISHPOCKET_ESCAPE_ACTIONS) {
    await deleteCombatState(env, backpackKey);
    return {
      escaped: true,
      message: formatCombatMessageParts([
        ...messageParts,
        "Wishpocket escaped!",
        "The little creature slips out of reach, its overstuffed sack jingling as it disappears into the Astral Sea.",
      ], platform),
    };
  }
  const scenes = [
    "Wishpocket scrambles away, clutching its sack tightly.",
    "Wishpocket is getting away!",
    "Wishpocket is almost out of reach!",
  ];
  combatState.round += 1;
  combatState.updatedAt = Math.floor(Date.now() / 1000);
  await saveCombatState(env, backpackKey, combatState);
  return {
    message: formatCombatMessageParts([
      ...messageParts, scenes[actions - 1],
      `Escape: ${WISHPOCKET_ESCAPE_ACTIONS - actions} actions remaining`,
      ...formatCombatStatus(combatState, progress, platform),
    ], platform),
  };
}

async function finishWishpocketSupportAction(env, backpackKey, combatState,
  progress, platform, parts) {
  return advanceWishpocketEscape(env, backpackKey, combatState,
    progress, platform, parts);
}

function beginRegionalEnemyResponse(combatState, naturalRoll) {
  if (isWishpocketCombat(combatState)) {
    return { bonus: 0, repetitionDamage: 0, gentle: false,
      pressure: false, hunger: false, fracture: 0 };
  }
  const perks = REGIONAL_ENEMY_PERKS[combatState.regionId] || {};
  const state = getRegionalEnemyState(combatState);
  const response = { bonus: 0, repetitionDamage: 0, gentle: state.gentle,
    pressure: state.pressure, hunger: state.hunger, fracture: state.fracture };
  if (perks.crushingWake || perks.kelpRecovery) {
    const period = perks.crushingWake ? 3 : bossPhase(combatState)?.cadence || 4;
    state.responses = (state.responses + 1) % period;
  }
  if (perks.crushingWake && state.responses === 0) {
    const crushing = bossPhase(combatState)?.crushing || 15;
    regionalEnemyReceipt(combatState, `Crushing Wake — Incoming (+${crushing} on hit).`);
    if (naturalRoll !== 1) response.bonus += crushing;
  }
  // Repetition belongs only to this response, including a miss or full block.
  const repetition = state.repetition;
  state.repetition = false;
  if (naturalRoll === 1) return response;
  if (perks.gentleCurrent && state.gentle) {
    const gentle = bossPhase(combatState)?.gentle || 5;
    response.bonus += gentle;
    regionalEnemyReceipt(combatState, `Gentle Current — +${gentle} attack damage.`);
  }
  if (perks.tanglingKelp && getCombatProtection(combatState) === 0) {
    response.bonus += 5;
    regionalEnemyReceipt(combatState, "Tangling Kelp — No Protection; +5 attack damage.");
  }
  if (perks.nexusAdaptation && state.adaptation > 0) {
    response.bonus += state.adaptation;
  }
  if (perks.realityEcho && repetition) {
    response.repetitionDamage = 50;
    regionalEnemyReceipt(combatState, "Reality Echo — Repeated spell! +50 damage before defenses.");
  }
  return response;
}

function resolveRegionalEnemyHit(combatState, response, damage, progress) {
  if (isWishpocketCombat(combatState)) return;
  if (damage <= 0) return;
  const state = getRegionalEnemyState(combatState);
  if (response.gentle) state.gentle = false;
  for (const [key, label, amount] of [
    ["pressure", "Starfall Pressure", response.pressure ? state.pressureAmount || 10 : 0],
    ["hunger", "Deepwater Hunger", response.hunger ? 10 : 0],
    ["fracture", "Mana Fracture", response.fracture],
  ]) {
    if (!amount) continue;
    const drained = Math.min(progress.mana, amount);
    progress.mana -= drained;
    state[key] = key === "fracture" ? 0 : false;
    if (key === "pressure") { state.spells = 0; state.pressureAmount = 0; }
    regionalEnemyReceipt(combatState, `${label} — Drained ${drained} Mana.`);
  }
}

function finishRegionalEnemyResponse(combatState) {
  if (isWishpocketCombat(combatState)) return;
  if (!REGIONAL_ENEMY_PERKS[combatState.regionId]?.kelpRecovery ||
      combatState.enemy.hp <= 0 || combatState.playerHp <= 0) return;
  if (getRegionalEnemyState(combatState).responses !== 0) return;
  const restored = Math.min(bossPhase(combatState)?.recovery || 10,
    combatState.enemy.maxHp - combatState.enemy.hp);
  combatState.enemy.hp += restored;
  if (restored > 0) regionalEnemyReceipt(combatState, `Kelp Recovery — Restored ${restored} enemy HP.`);
}

async function resolvePlayerCombatAction(
  env,
  backpackKey,
  combatState,
  action,
  platform,
) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.player-action";
  const regionalHpBefore = combatState.enemy.hp;
  const primaryDamage = action.regionalSpell
    ? applyRegionalRoyalGuard(combatState, action.damage) : action.damage;
  const regionalDamage = damageCombatEnemy(combatState, primaryDamage, action.pierceProtection || 0);
  if (action.consumeAstralEcho) {
    damageCombatEnemy(combatState, action.echoDamage);
    delete combatState.astralEcho;
  }
  if (action.aftershockDamage > 0) {
    damageCombatEnemy(combatState, action.aftershockDamage);
  }

  let progress = await getPlayerProgress(env, backpackKey);
  const activeMasteries = await getActiveMasteries(levelFromXp(progress.xp));
  const shizukisPresenceMastery = activeMasteries.find(
    (mastery) => mastery.effect.id === "shizukis-presence",
  );
  let legacyMessage = "";
  if (action.legacyEffect && action.legacyEffect.type !== "charge") {
    const legacySeparator = platform === "discord" ? "\n\n" : " | ";
    const caps = getPlayerResourceCaps(progress);
    const hpRestore = action.legacyEffect.hpRestore || 0;
    const manaRestore = action.legacyEffect.manaRestore || 0;
    const restoredHp = Math.min(
      hpRestore, Math.max(0, caps.hp - combatState.playerHp),
    );
    const restoredMana = Math.min(
      manaRestore, Math.max(0, caps.mana - progress.mana),
    );
    combatState.playerHp += restoredHp;
    recordRegionalManaRecovery(combatState, restoredMana);
    if (restoredMana > 0) {
      progress = { ...progress, mana: progress.mana + restoredMana };
      await savePlayerProgress(env, backpackKey, progress);
    }
    if (action.legacyEffect.type === "perfect-jellyfish") {
      legacyMessage = `Perfect Jellyfish!${legacySeparator}` +
        `${action.legacyEffect.scene}${legacySeparator}` +
        `+${action.legacyEffect.damage} damage | ` +
        `Restored ${restoredHp} HP + ${restoredMana} Mana`;
    } else if (action.legacyEffect.type === "full-moon") {
      legacyMessage = `FULL MOON${legacySeparator}` +
        `${action.legacyEffect.scene}${legacySeparator}` +
        `+${action.legacyEffect.damage} Full Moon Damage`;
    }
  }
  let echoMasteryMessage = "";
  if (action.consumeAstralEcho && action.echoMasteryQualifies &&
      action.echoMasteryNaturalRoll) {
    const result = await applyAstralEchoMastery(
      env, backpackKey, combatState, progress,
      action.echoMasteryNaturalRoll, activeMasteries,
    );
    progress = result.progress;
    echoMasteryMessage = result.message;
  }
  let chargeDetonationMessage = "";

  if (action.consumeAstralCharge) {
    const currentCharge = getAstralCharge(combatState.enemy);
    if (currentCharge && currentCharge.remainingDamageUses > 1) {
      combatState.enemy.astralCharge = {
        ...currentCharge,
        remainingDamageUses: currentCharge.remainingDamageUses - 1,
        manaDiscountAvailable: false,
      };
    } else {
      delete combatState.enemy.astralCharge;
      const detonation = activeMasteries.find(
        (mastery) => mastery.effect.id === "astral-charge-detonation",
      );
      if (currentCharge && detonation && combatState.enemy.hp > 0) {
        damageCombatEnemy(combatState, detonation.effect.damage);
        chargeDetonationMessage = randomChoice(detonation.flavor) + "\n\n" +
          `Charge detonates → ${detonation.effect.damage} dmg`;
      }
    }
  }
  if (action.applyAstralCharge && combatState.enemy.hp > 0) {
    combatState.enemy.astralCharge = {
      manaReduction: action.astralCharge.manaReduction,
      damageIncrease: action.astralCharge.damageIncrease,
      remainingDamageUses: action.astralCharge.damageUses,
      manaDiscountAvailable: action.astralCharge.manaDiscountUses > 0,
    };
    if (action.legacyEffect?.type === "charge") {
      const maximumMana = getPlayerResourceCaps(progress).mana;
      const restoredMana = Math.min(
        action.legacyEffect.manaRestore,
        Math.max(0, maximumMana - progress.mana),
      );
      progress = { ...progress, mana: progress.mana + restoredMana };
      await savePlayerProgress(env, backpackKey, progress);
      legacyMessage = `Legacy: Charge restored ${restoredMana} Mana.`;
      recordRegionalManaRecovery(combatState, restoredMana);
    }
  }

  let familiarMessage = "";
  let shizukiMessage = "";
  if (action.familiarQualifies && combatState.familiar &&
      combatState.enemy.hp > 0) {
    const familiarResult = await applyFamiliarAction(
      env, backpackKey, combatState, progress,
    );
    progress = familiarResult.progress;
    familiarMessage = familiarResult.message;
    if (familiarResult.faeSource) {
      const shizuki = activateShizukisPresence(
        combatState, progress, shizukisPresenceMastery,
        familiarResult.faeSource, platform,
      );
      progress = shizuki.progress;
      shizukiMessage = shizuki.message;
      if (shizuki.activated) await savePlayerProgress(env, backpackKey, progress);
    }
  }
  let astralBondArmedMessage = "";
  if (action.armAstralBond && combatState.enemy.hp > 0 && combatState.familiar &&
      combatState.familiar.astralBond === undefined &&
      activeMasteries.some((mastery) => mastery.effect.id === "astral-bond")) {
    combatState.familiar.astralBond = "armed";
    astralBondArmedMessage =
      "Bond: Your Familiar's next assistance is empowered!";
  }

  let momentumMessage = "";
  const activePerks = await getActivePerks(levelFromXp(progress.xp));
  let expeditionMessage = "";
  const expedition = activePerks.find(
    (perk) => perk.effect.trigger === "successful-offensive-roll-milestone",
  );
  if (expedition && action.expeditionQualifies) {
    const result = await applyAstralExpedition(
      env, backpackKey, progress, expedition,
    );
    progress = result.progress;
    expeditionMessage = result.message;
  }
  let faeSecondOpinionMessage = "";
  const faeSecondOpinion = activePerks.find(
    (perk) => perk.effect.trigger === "qualifying-offensive-miss",
  );
  if (faeSecondOpinion && action.faeSecondOpinionFailure &&
      !combatState.perkUses?.[faeSecondOpinion.id]) {
    combatState.faeSecondOpinion = {
      offensiveRollModifier: faeSecondOpinion.effect.offensiveRollModifier,
    };
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [faeSecondOpinion.id]: 1,
    };
    faeSecondOpinionMessage = faeSecondOpinion.activationLine + "\n\n" +
      randomChoice(faeSecondOpinion.flavor) + "\n\n" +
      faeSecondOpinion.endingLine;
    const shizuki = activateShizukisPresence(
      combatState, progress, shizukisPresenceMastery,
      "fae-second-opinion", platform,
    );
    progress = shizuki.progress;
    if (shizuki.message) shizukiMessage = shizuki.message;
  }
  let harmonyMessage = "";
  const harmony = activePerks.find(
    (perk) => perk.effect.trigger === "successful-offensive-roll-with-distinct-bonuses",
  );
  if (harmony && action.harmonySuccess &&
      action.harmonySources >= harmony.effect.minimumSources &&
      !combatState.perkUses?.[harmony.id]) {
    const maximumMana = getPlayerResourceCaps(progress).mana;
    progress = {
      ...progress,
      mana: restoreManaToNormalCap(
        progress.mana, harmony.effect.manaRestore, maximumMana, combatState,
      ),
    };
    await savePlayerProgress(env, backpackKey, progress);
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [harmony.id]: 1,
    };
    harmonyMessage = harmony.activationLine;
  }
  const astralMomentum = activePerks.find(
    (perk) => perk.effect.trigger === "natural-perfect-hit",
  );
  if (
    astralMomentum &&
    !combatState.perkUses?.[astralMomentum.id] &&
    astralMomentum.effect.eligibleActions.includes(action.momentumAction) &&
    action.momentumNaturalRoll === astralMomentum.effect.naturalRoll
  ) {
    const maximumMana = getPlayerResourceCaps(progress).mana;
    const restoredMana = Math.min(
      astralMomentum.effect.manaRestore,
      Math.max(0, maximumMana - progress.mana),
    );
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [astralMomentum.id]: 1,
    };
    if (restoredMana > 0) {
      progress = {
        ...progress,
        mana: progress.mana + restoredMana,
      };
      await savePlayerProgress(env, backpackKey, progress);
      momentumMessage = randomChoice(astralMomentum.activationLines).replace(
        "10 Mana",
        `${restoredMana} Mana`,
      );
      recordRegionalManaRecovery(combatState, restoredMana);
    } else {
      momentumMessage = astralMomentum.fullManaLine;
    }
  }

  let jellyfishMasteryMessage = "";
  const jellyfishEffect = action.jellyfishMasteryEffect;
  if (jellyfishEffect) {
    const manaRestore = jellyfishEffect.effectType === "restore-mana"
      ? jellyfishEffect.amount : (jellyfishEffect.manaRestore || 0);
    if (manaRestore > 0) {
      const maximumMana = getPlayerResourceCaps(progress).mana;
      const restoredMana = Math.min(
        manaRestore,
        Math.max(0, maximumMana - progress.mana),
      );
      if (restoredMana > 0) {
        progress = { ...progress, mana: progress.mana + restoredMana };
        recordRegionalManaRecovery(combatState, restoredMana);
        await savePlayerProgress(env, backpackKey, progress);
        jellyfishMasteryMessage = jellyfishEffect.activationLine.replace(
          `${manaRestore} Mana`,
          `${restoredMana} Mana`,
        );
      } else {
        jellyfishMasteryMessage = jellyfishEffect.fullManaLine ||
          "Jellyfish Mastery activates! The Jellyfish looks devastated by its performance. You tell it that it did a wonderful job. It perks up immediately, but your Mana is already full. Apparently encouragement is a renewable resource.";
      }
    } else if (jellyfishEffect.effectType === "restore-hp") {
      const restoredHp = Math.min(
        jellyfishEffect.amount,
        Math.max(0, combatState.playerMaxHp - combatState.playerHp),
      );
      combatState.playerHp += restoredHp;
      jellyfishMasteryMessage = restoredHp > 0
        ? jellyfishEffect.activationLine.replace("20 HP", `${restoredHp} HP`)
        : jellyfishEffect.fullHpLine || "Jellyfish Mastery activates! The Jellyfish yawns, floats over, and falls asleep directly on your head. Your HP is already full. You're not entirely sure this is medicine.";
    } else if (jellyfishEffect.effectType === "award-candies") {
      const currentTotal = await getBackpackTotal(env, backpackKey);
      await saveBackpackTotal(
        env,
        backpackKey,
        currentTotal + jellyfishEffect.amount,
      );
      jellyfishMasteryMessage = jellyfishEffect.activationLine;
    } else if (jellyfishEffect.effectType === "bonus-damage") {
      jellyfishMasteryMessage = jellyfishEffect.activationLine;
    }
    // The current roll has already resolved; these bonuses belong to later rolls/hits.
    if (jellyfishEffect.offensiveRollModifier) {
      combatState.jellyfishResolve = {
        offensiveRollModifier: jellyfishEffect.offensiveRollModifier,
      };
    }
    if (jellyfishEffect.damageReduction) {
      combatState.jellyfishSleepyGuard = {
        damageReduction: jellyfishEffect.damageReduction,
      };
    }
    if (jellyfishEffect.berries) {
      progress = { ...progress, berries: progress.berries + jellyfishEffect.berries };
      await savePlayerProgress(env, backpackKey, progress);
    }
  }

  const curiosityResult = await resolveAstralCuriosity(
    env,
    backpackKey,
    combatState,
    progress,
    action.curiosityDice,
  );
  progress = curiosityResult.progress;
  const storytellerMessage = advanceStoryteller(
    combatState, activePerks, platform,
  );

  finishRegionalEnemyDamage(combatState, regionalHpBefore, true);
  recordRegionalPlayerAction(combatState,
    action.regionalSpell ? "spell" : action.regionalAction,
    action.regionalSpell, regionalDamage > 0 || action.regionalCommittedWake === true);
  advanceBossPhase(combatState);
  const messageParts = [action.message, ...takeRegionalEnemyReceipts(combatState)];
  if (legacyMessage) messageParts.push(legacyMessage);
  if (echoMasteryMessage) messageParts.push(echoMasteryMessage);
  if (expeditionMessage) messageParts.push(expeditionMessage);
  if (familiarMessage) messageParts.push(familiarMessage);
  if (astralBondArmedMessage) messageParts.push(astralBondArmedMessage);
  if (faeSecondOpinionMessage) messageParts.push(faeSecondOpinionMessage);
  if (shizukiMessage) messageParts.push(shizukiMessage);
  if (harmonyMessage) messageParts.push(harmonyMessage);
  if (chargeDetonationMessage) messageParts.push(chargeDetonationMessage);
  if (curiosityResult.message) {
    messageParts.push(curiosityResult.message);
  }
  if (jellyfishMasteryMessage) {
    messageParts.push(jellyfishMasteryMessage);
  }
  if (momentumMessage) {
    messageParts.push(momentumMessage);
  }
  if (storytellerMessage) messageParts.push(storytellerMessage);

  if (combatState.enemy.hp === 0) {
    const victory = await resolveCombatVictory(
      env,
      backpackKey,
      combatState,
      action.roll,
      action.damage,
      platform,
      formatCombatMessageParts(messageParts, platform),
    );

    return {
      ...victory,
      message: victory.message,
    };
  }

  return resolveEnemyCombatResponse(
    env, backpackKey, combatState, action, platform, progress,
    activeMasteries, activePerks, shizukisPresenceMastery, messageParts,
  );
}

// Shared enemy response; isolated Ultimates enter here after their own resolution.
async function resolveEnemyCombatResponse(
  env, backpackKey, combatState, action, platform, progress,
  activeMasteries, activePerks, shizukisPresenceMastery, messageParts,
) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.enemy-turn";
  if (isWishpocketCombat(combatState)) {
    return advanceWishpocketEscape(env, backpackKey, combatState,
      progress, platform, messageParts);
  }
  if (platform === "discord") messageParts.push("Enemy Turn");
  const regionalHpBefore = combatState.enemy.hp;
  const enemyRoll = randomInteger(1, 20);
  const regionalResponse = beginRegionalEnemyResponse(combatState, enemyRoll);
  messageParts.push(...takeRegionalEnemyReceipts(combatState));
  const enemyAttack = getCombatRollResult(enemyRoll);
  let rawEnemyDamage = enemyAttack.damage === 0
    ? 0
    : enemyAttack.damage + (combatState.enemy.damageBonus || 0) +
      regionalResponse.bonus + regionalResponse.repetitionDamage;
  let titanProtectionAfterAttack = false;
  if (rawEnemyDamage > 0 && combatState.stagger > 0) {
    const reduction = Math.min(rawEnemyDamage, combatState.stagger);
    rawEnemyDamage -= reduction;
    messageParts.push(`Stagger reduces enemy damage by ${reduction}.`);
    delete combatState.stagger;
    titanProtectionAfterAttack = combatState.titanStagger === true;
    delete combatState.titanStagger;
  }
  const armorReduction = rawEnemyDamage > 0
    ? Math.min(getArmorReduction(progress), Math.max(0, rawEnemyDamage - 1))
    : 0;
  let enemyDamage = rawEnemyDamage === 0
    ? 0
    : Math.max(1, rawEnemyDamage - armorReduction);
  let bubbleMessage = "";
  let bubbleMasteryMessage = "";
  let bubbleMasteryIIMessage = "";
  if (combatState.bubble && enemyDamage > 0) {
    const bubbleSpell = await getSpellDefinition("bubble");
    const bubbleTier = bubbleSpell.protectionTiers.find(
      (tier) => combatState.bubble.naturalRoll <= tier.naturalMaximum,
    );
    const maxProtection = combatState.bubble.maxProtection ?? Math.max(
      combatState.bubble.protection,
      bubbleTier.protection,
    );
    const absorbedDamage = Math.min(
      combatState.bubble.protection,
      enemyDamage,
    );
    enemyDamage -= absorbedDamage;
    combatState.bubble.protection -= absorbedDamage;
    if (combatState.bubble.protection > 0) {
      combatState.bubble.maxProtection = maxProtection;
      bubbleMessage = randomChoice(bubbleSpell.survivalLines) +
        `\n\nBubble absorbs ${absorbedDamage} damage | ` +
        `Protection ${combatState.bubble.protection}/${maxProtection}`;
    } else {
      delete combatState.bubble;
      const bubbleMasteryII = activeMasteries.find(
        (mastery) => mastery.spellId === "bubble" &&
          mastery.effect.id === "bubble-retaliation",
      );
      const bubbleMastery = activeMasteries.find(
        (mastery) => mastery.spellId === "bubble" &&
          mastery.effect.id === "bubble-rebound",
      );
      if (bubbleMastery && absorbedDamage > 0) {
        const maximumMana = getPlayerResourceCaps(progress).mana;
        const restoredMana = Math.min(
          bubbleMastery.effect.manaRestore,
          Math.max(0, maximumMana - progress.mana),
        );
        progress = {
          ...progress,
          mana: progress.mana + restoredMana,
        };
        recordRegionalManaRecovery(combatState, restoredMana);
        combatState.astralRebound = {
          offensiveRollModifier:
            bubbleMastery.effect.offensiveRollModifier,
        };
        bubbleMasteryMessage = bubbleMasteryII
          ? `Bubble Mastery I: ${restoredMana > 0 ? `+${restoredMana} Mana` : "Mana full"} | Astral Rebound +2`
          : restoredMana > 0
            ? "Bubble Mastery activates! The Bubble pops with an extremely offended *boing*. " +
              `You recover ${restoredMana} Mana and gain +2 to your next offensive roll.`
            : "Bubble Mastery activates! Your Mana is already full, but the extremely offended Bubble still grants +2 to your next offensive roll.";
        await savePlayerProgress(env, backpackKey, progress);
      }
      if (bubbleMasteryII && absorbedDamage > 0) {
        damageCombatEnemy(combatState, bubbleMasteryII.effect.damage);
        bubbleMasteryIIMessage = randomChoice(bubbleMasteryII.flavor) +
          `\n\nBubble retaliates → ${bubbleMasteryII.effect.damage} dmg`;
      } else {
        bubbleMessage = randomChoice(bubbleSpell.activationLines).replace(
          "{absorbedDamage}",
          String(absorbedDamage),
        );
      }
    }
  }
  let sleepyGuardMessage = "";
  if (combatState.jellyfishSleepyGuard && enemyDamage > 0) {
    const reduction = Math.min(
      combatState.jellyfishSleepyGuard.damageReduction,
      Math.max(0, enemyDamage - 1),
    );
    enemyDamage -= reduction;
    delete combatState.jellyfishSleepyGuard;
    sleepyGuardMessage =
      `Jellyfish Sleepy Guard reduces the hit by ${reduction}. You take ${enemyDamage} dmg.`;
  }
  let berryProtectionMessage = "";
  const berryEffects = combatState.berryEffects;
  if (berryEffects?.protection > 0 && enemyDamage > 0) {
    const absorbed = Math.min(berryEffects.protection, enemyDamage);
    enemyDamage -= absorbed;
    berryEffects.protection -= absorbed;
    if (berryEffects.protection === 0) delete berryEffects.protection;
    berryProtectionMessage = `${progress.equippedWeapon === "sword-and-shield" ? "Protection" : "Berry protection"} absorbs ${absorbed} damage` +
      (berryEffects.protection ? ` | ${berryEffects.protection} remains` : " | depleted");
  }
  let wakeMantaProtectionMessage = "";
  if (combatState.wakeMantaProtection > 0 && enemyDamage > 0) {
    const absorbed = Math.min(combatState.wakeMantaProtection, enemyDamage);
    enemyDamage -= absorbed;
    combatState.wakeMantaProtection -= absorbed;
    if (combatState.wakeMantaProtection === 0) {
      delete combatState.wakeMantaProtection;
    }
    wakeMantaProtectionMessage = `Manta protection absorbs ${absorbed} damage` +
      (combatState.wakeMantaProtection
        ? ` | ${combatState.wakeMantaProtection} remains` : " | depleted");
  }
  let berrySleepyMessage = "";
  if (berryEffects?.sleepyGuard && enemyDamage > 0) {
    const reduction = Math.min(5, enemyDamage);
    enemyDamage -= reduction;
    delete berryEffects.sleepyGuard;
    berrySleepyMessage = `Sleepy Berry reduces the hit by ${reduction} damage.`;
  }
  let familiarProtectionMessage = "";
  if (combatState.familiarProtection?.length && enemyDamage > 0) {
    let absorbed = 0;
    for (const pool of combatState.familiarProtection) {
      if (enemyDamage === 0) break;
      const amount = Math.min(pool.amount, enemyDamage);
      pool.amount -= amount;
      enemyDamage -= amount;
      absorbed += amount;
    }
    combatState.familiarProtection = combatState.familiarProtection.filter(
      (pool) => pool.amount > 0,
    );
    if (combatState.familiarProtection.length === 0) {
      delete combatState.familiarProtection;
    }
    if (absorbed > 0) {
      familiarProtectionMessage = `Familiar protection absorbs ${absorbed} damage.`;
    }
  }
  const manaBeforeRegionalHit = progress.mana;
  resolveRegionalEnemyHit(combatState, regionalResponse, enemyDamage, progress);
  if (progress.mana !== manaBeforeRegionalHit) {
    await savePlayerProgress(env, backpackKey, progress);
  }
  messageParts.push(...takeRegionalEnemyReceipts(combatState));
  combatState.playerHp = Math.max(
    0,
    combatState.playerHp - enemyDamage,
  );
  if (titanProtectionAfterAttack) {
    const effects = combatState.berryEffects ||= {};
    effects.protection = (effects.protection || 0) + 5;
    messageParts.push("Titan Vanguard gains 5 Protection.");
  }

  messageParts.push(
    formatCombatRollMessage(
      "Enemy",
      enemyRoll,
      {
        ...enemyAttack,
        damage: bubbleMessage || sleepyGuardMessage || berryProtectionMessage ||
        wakeMantaProtectionMessage || berrySleepyMessage || familiarProtectionMessage
          ? enemyDamage : rawEnemyDamage,
      },
    ),
  );
  if (armorReduction > 0) {
    messageParts.push(`Armor -${armorReduction}`);
  }
  if (bubbleMessage) {
    messageParts.push(bubbleMessage);
  }
  if (bubbleMasteryMessage) {
    messageParts.push(bubbleMasteryMessage);
  }
  if (bubbleMasteryIIMessage) {
    messageParts.push(bubbleMasteryIIMessage);
  }
  if (sleepyGuardMessage) {
    messageParts.push(sleepyGuardMessage);
  }
  if (berryProtectionMessage) messageParts.push(berryProtectionMessage);
  if (wakeMantaProtectionMessage) messageParts.push(wakeMantaProtectionMessage);
  if (berrySleepyMessage) messageParts.push(berrySleepyMessage);
  if (familiarProtectionMessage) messageParts.push(familiarProtectionMessage);
  if (platform === "discord" || armorReduction > 0) {
    messageParts.push(`You take ${enemyDamage} dmg`);
  }

  let updatedProgress = progress;
  const faeIntervention = activePerks.find(
    (perk) => perk.effect.trigger === "lethal-enemy-damage",
  );
  if (
    combatState.playerHp === 0 &&
    faeIntervention &&
    !combatState.perkUses?.[faeIntervention.id]
  ) {
    combatState.playerHp = faeIntervention.effect.survivalHp;
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [faeIntervention.id]: 1,
    };
    messageParts.push(randomChoice(faeIntervention.activationLines));
    const shizuki = activateShizukisPresence(
      combatState, updatedProgress, shizukisPresenceMastery,
      "fae-intervention", platform,
    );
    updatedProgress = shizuki.progress;
    if (shizuki.message) messageParts.push(shizuki.message);
  }

  if (combatState.playerHp === 0) {
    const defeat = await resolveCombatDefeat(
      env,
      backpackKey,
      combatState,
      platform,
    );

    messageParts.push(defeat.message);
    messageParts.push(
      ...formatCombatStatus(combatState, progress, platform),
    );

    return {
      ...defeat,
      message: formatCombatMessageParts(messageParts, platform),
    };
  }

  const faeAid = activePerks.find(
    (perk) => perk.effect.trigger === "survived-enemy-attack-below-hp-threshold",
  );
  if (faeAid && !combatState.perkUses?.[faeAid.id]) {
    const currentMaxHp = getPlayerResourceCaps(progress).hp;
    if (combatState.playerHp <
      currentMaxHp * (faeAid.effect.hpThresholdPercent / 100)) {
      combatState.playerMaxHp = currentMaxHp;
      combatState.playerHp = Math.min(
        currentMaxHp, combatState.playerHp + faeAid.effect.hpRestore,
      );
      combatState.perkUses = {
        ...(combatState.perkUses || {}),
        [faeAid.id]: 1,
      };
      messageParts.push(faeAid.activationLine);
      const shizuki = activateShizukisPresence(
        combatState, updatedProgress, shizukisPresenceMastery,
        "fae-aid", platform,
      );
      updatedProgress = shizuki.progress;
      if (shizuki.message) messageParts.push(shizuki.message);
    }
  }

  const astralResilience = activePerks.find(
    (perk) => perk.effect.trigger === "post-enemy-damage",
  );
  if (
    astralResilience &&
    !combatState.perkUses?.[astralResilience.id] &&
    combatState.playerHp <
      combatState.playerMaxHp *
        (astralResilience.effect.hpThresholdPercent / 100)
  ) {
    const maximumMana = getPlayerResourceCaps(updatedProgress).mana;
    updatedProgress = {
      ...updatedProgress,
      mana: restoreManaToNormalCap(
        updatedProgress.mana, astralResilience.effect.manaRestore, maximumMana, combatState,
      ),
    };
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [astralResilience.id]: 1,
    };
    messageParts.push(randomChoice(astralResilience.activationLines));
  }

  const mendMessage = triggerMendHealing(combatState);
  if (mendMessage) {
    messageParts.push(mendMessage);
  }

  const astralAwakening = activePerks.find(
    (perk) => perk.effect.trigger === "survived-enemy-attack",
  );
  if (astralAwakening && !combatState.perkUses?.[astralAwakening.id]) {
    combatState.astralAwakeningSurvived =
      (combatState.astralAwakeningSurvived || 0) + 1;
    if (combatState.astralAwakeningSurvived ===
      astralAwakening.effect.survivingAttacks) {
      const caps = getPlayerResourceCaps(updatedProgress);
      combatState.playerMaxHp = caps.hp;
      combatState.playerHp = Math.min(
        caps.hp, combatState.playerHp + astralAwakening.effect.hpRestore,
      );
      updatedProgress = {
        ...updatedProgress,
        mana: restoreManaToNormalCap(
          updatedProgress.mana, astralAwakening.effect.manaRestore, caps.mana, combatState,
        ),
      };
      combatState.astralAwakening = {
        offensiveRollModifier: astralAwakening.effect.offensiveRollModifier,
      };
      combatState.perkUses = {
        ...(combatState.perkUses || {}),
        [astralAwakening.id]: 1,
      };
      messageParts.push(astralAwakening.activationLine);
    }
  }

  const retaliationStorytellerMessage = advanceStoryteller(
    combatState, activePerks, platform,
  );
  if (retaliationStorytellerMessage) {
    messageParts.push(retaliationStorytellerMessage);
  }

  if (combatState.enemy.hp === 0) {
    await savePlayerProgress(env, backpackKey, {
      ...updatedProgress,
      hp: combatState.playerHp,
    });
    return resolveCombatVictory(
      env, backpackKey, combatState, null, 15, platform,
      formatCombatMessageParts(messageParts, platform),
    );
  }

  const astralPatience = activePerks.find(
    (perk) => perk.effect.trigger === "non-offensive-combat-turn",
  );
  if (
    !action.isolatedUltimate && astralPatience && !combatState.astralPatience &&
    action.roll === undefined && action.damage === 0 &&
    !action.echoDamage && !action.aftershockDamage
  ) {
    combatState.astralPatience = { offensiveRollModifier: astralPatience.effect.offensiveRollModifier };
    messageParts.push(astralPatience.activationLine);
  }

  finishRegionalEnemyDamage(combatState, regionalHpBefore);
  finishRegionalEnemyResponse(combatState);
  messageParts.push(...takeRegionalEnemyReceipts(combatState));
  combatState.round += 1;
  combatState.updatedAt = Math.floor(Date.now() / 1000);
  await savePlayerProgress(env, backpackKey, {
    ...updatedProgress,
    hp: combatState.playerHp,
  });
  await saveCombatState(env, backpackKey, combatState);

  messageParts.push(
    ...formatCombatStatus(combatState, updatedProgress, platform),
  );

  return {
    message: formatCombatMessageParts(messageParts, platform),
  };
}

function triggerMendHealing(combatState) {
  const mend = combatState.mend;
  if (!mend) return "";

  const healedAmount = Math.max(
    0,
    Math.min(
      mend.healingPerTrigger,
      combatState.playerMaxHp - combatState.playerHp,
    ),
  );
  combatState.playerHp += healedAmount;
  mend.remainingTriggers -= 1;
  const isFinalTrigger = mend.remainingTriggers === 0;

  if (isFinalTrigger) {
    delete combatState.mend;
  }

  if (healedAmount === 0) {
    return "Mend finds nothing to heal.";
  }

  return `Mend restores ${healedAmount} HP.` +
    (isFinalTrigger ? " The last Fae light fades away." : "");
}

function formatCombatStatus(
  combatState,
  progress,
  platform = "twitch",
) {
  const resourceCaps = getPlayerResourceCaps(progress);

  if (platform === "discord") {
    return [formatDiscordCombatHud(combatState, progress)];
  }

  return [
    `HP ${combatState.playerHp}/${combatState.playerMaxHp} | ` +
      `MP ${progress.mana}/${resourceCaps.mana} | ` +
      `Enemy ${combatState.enemy.hp}/${combatState.enemy.maxHp}`,
  ];
}

function formatDiscordCombatHud(combatState, progress) {
  const resourceCaps = getPlayerResourceCaps(progress);

  return `HP ${combatState.playerHp}/${combatState.playerMaxHp} · ` +
    `MP ${progress.mana}/${resourceCaps.mana} · ` +
    `Enemy ${combatState.enemy.hp}/${combatState.enemy.maxHp}`;
}

function appendDiscordCombatHud(message, combatState, progress) {
  return [message, ...takeRegionalEnemyReceipts(combatState),
    formatDiscordCombatHud(combatState, progress)].join("\n\n");
}

function formatCombatMessageParts(parts, platform) {
  if (platform !== "discord") return parts.join(" | ");

  const hasHud = /^HP \d+\//.test(parts.at(-1) || "");
  const hud = hasHud ? parts.at(-1) : "";
  const events = (hasHud ? parts.slice(0, -1) : parts)
    .map(part => part.replaceAll(" | ", "\n"));
  const enemyIndex = events.indexOf("Enemy Turn");
  const body = enemyIndex < 0
    ? events.join("\n\n")
    : `${events.slice(0, enemyIndex).join("\n\n")}\n\n` +
      `Enemy Turn\n${events.slice(enemyIndex + 1).join("\n")}`;
  return hud ? `${body}\n\n${hud}` : body;
}

async function performCast(
  env,
  backpackKey,
  spellInput,
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performCastUnlocked(
      env,
      backpackKey,
      spellInput,
      platform,
    ),
  );
}

async function performCastUnlocked(
  env,
  backpackKey,
  spellInput,
  platform,
) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.cast";
  const spellInputValue = String(spellInput || "").trim().toLowerCase();
  const jellyCommand =
    platform === "discord" ? "/cast spell:Jelly" : "!cast jelly";
  const starSparkCommand = platform === "discord"
    ? "/cast star"
    : "!cast star";
  const mendCommand = platform === "discord" ? "/cast mend" : "!cast mend";
  const blessingCommand = platform === "discord"
    ? "/cast spell:Elf Blessing"
    : "!cast elf blessing";
  const moonbeamCommand = platform === "discord"
    ? "/cast spell:Moonbeam"
    : "!cast moonbeam";
  const evocationCommand = platform === "discord" ? "/cast evocation" : "!cast evocation";
  const bubbleCommand = platform === "discord"
    ? "/cast spell:Bubble"
    : "!cast bubble";
  const astralEchoCommand = platform === "discord"
    ? "/cast spell:Echo"
    : "!cast echo";
  const fallingStarCommand = platform === "discord"
    ? "/cast spell:Falling Star"
    : "!cast falling star";
  const wakeCommand = platform === "discord"
    ? "/cast spell:Leviathan's Wake"
    : "!cast wake";
  const berryCommand = platform === "discord" ? "/cast Berry" : "!cast berry";
  const familiarCommand = platform === "discord" ? "/cast Familiar" : "!cast familiar";
  const allOrNothingCommand = platform === "discord"
    ? "/cast spell:All or Nothing" : "!cast all or nothing";
  const tidalWaveCommand = platform === "discord"
    ? "/cast spell:Tidal Wave" : "!cast tidal";
  const conjureGunCommand = platform === "discord"
    ? "/cast spell:Conjure Gun" : "!cast conjure gun";

  const helpCommand = platform === "discord" ? "/cast spell:Help!" : "!cast help";

  if (!spellInputValue) {
    return {
      message:
        `Use ${blessingCommand} for Elf Blessing, ${jellyCommand} ` +
        `for Jellyfish, ${starSparkCommand} for Star Spark, or ` +
        `${mendCommand} for Mend, ${moonbeamCommand} for Moonbeam, ${evocationCommand} for Evocation, or ` +
        `${bubbleCommand} for Bubble, ${astralEchoCommand} for Echo, or ` +
        `${fallingStarCommand} for Falling Star, ${wakeCommand} for Leviathan's Wake, ` +
        `${berryCommand} for Berries, ${familiarCommand} for Familiar, or ` +
        `${allOrNothingCommand} for All or Nothing, ${tidalWaveCommand} for Tidal Wave, or ` +
        `${conjureGunCommand} for Conjure Gun, or ${helpCommand} for Help!.`,
    };
  }

  const spellDefinitions = await getSpellDefinitions();
  const spell = spellDefinitions.find(
    (candidate) =>
      candidate.id === spellInputValue ||
      candidate.aliases.includes(spellInputValue),
  );

  if (!spell) {
    return {
      message:
        `You haven't learned that spell. Use ${blessingCommand}, ` +
        `${starSparkCommand}, ${jellyCommand}, ${mendCommand}, or ` +
        `${moonbeamCommand}, ${evocationCommand}, ${bubbleCommand}, ${astralEchoCommand}, or ` +
        `${fallingStarCommand}, ${wakeCommand}, ${berryCommand}, ` +
        `${familiarCommand}, ${allOrNothingCommand}, ${tidalWaveCommand}, or ` +
        `${conjureGunCommand}, or ${helpCommand}.`,
    };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const playerLevel = levelFromXp(progress.xp);
  const activeMasteries = await getActiveMasteries(playerLevel);
  const activePerks = await getActivePerks(playerLevel);
  const starSparkMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "star-spark" &&
      mastery.effect.id === "astral-charge",
  );
  const moonbeamMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "moonbeam" &&
      mastery.effect.id === "lunar-alignment",
  );
  const meteorAlignmentMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "falling-star" &&
      mastery.effect.id === "meteor-alignment",
  );
  const jellyfishMastery = activeMasteries.filter(
    (mastery) => mastery.spellId === "jelly" &&
      mastery.effect.id === "jellyfish-moods",
  ).sort((left, right) => right.tier - left.tier)[0];
  const elfBlessingMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "elf_blessing" &&
      mastery.effect.id === "elf-blessing-upgrade",
  );
  const mendMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "mend" &&
      mastery.effect.id === "mend-upgrade",
  );
  const echoMastery = activeMasteries.find(
    (mastery) => mastery.spellId === "astral-echo" &&
      mastery.effect.id === "echo-afterglow",
  );
  const shizukisPresenceMastery = activeMasteries.find(
    (mastery) => mastery.effect.id === "shizukis-presence",
  );
  const currentCombatState = await getCombatState(env, backpackKey);
  const storytellerManaCost = getStorytellerManaCost(
    spell.manaCost, currentCombatState,
  );

  if (playerLevel < spell.requiredLevel) {
    const message =
      `You haven't learned ${spell.name} yet. Reach Level ` +
      `${spell.requiredLevel} to unlock it.`;
    return {
      message: currentCombatState && platform === "discord"
        ? appendDiscordCombatHud(message, currentCombatState, progress)
        : message,
    };
  }

  if (spell.id === "help") {
    return castHelp(env, backpackKey, currentCombatState, progress, spell, platform);
  }

  if (spell.id === "familiar") {
    if (!currentCombatState) {
      return { message: "Familiar can only be cast during a fight." };
    }
    if (currentCombatState.familiar) {
      return { message: "You already have an active Familiar." };
    }
    if (progress.mana < storytellerManaCost) {
      return { message: `You don't have enough Mana to cast ${spell.name}.` };
    }

    await savePlayerProgress(env, backpackKey, {
      ...progress, mana: progress.mana - storytellerManaCost,
    });
    const paidProgress = await getPlayerProgress(env, backpackKey);
    const caps = getPlayerResourceCaps(paidProgress);
    currentCombatState.playerMaxHp = caps.hp;
    currentCombatState.playerHp = Math.min(currentCombatState.playerHp, caps.hp);
    const firstDie = randomInteger(1, 6);
    const secondDie = randomInteger(1, 6);
    const total = firstDie + secondDie;
    const creature = spell.familiars.find((entry) => entry.total === total);
    const serial = (currentCombatState.familiarSerial || 0) + 1;
    currentCombatState.familiarSerial = serial;
    currentCombatState.familiar = {
      id: creature.id, total, actions: 0, serial,
    };
    await savePlayerProgress(env, backpackKey, {
      ...paidProgress, hp: currentCombatState.playerHp,
    });
    await saveCombatState(env, backpackKey, currentCombatState);
    const separator = platform === "discord" ? "\n\n" : " | ";
    if (isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        paidProgress, platform, [
          `Familiar Roll: ${firstDie} + ${secondDie} = ${total}`,
          randomChoice(creature.intros),
        ]);
    }
    return {
      message: `Familiar Roll: ${firstDie} + ${secondDie} = ${total}` + separator +
        randomChoice(creature.intros) + separator +
        formatDiscordCombatHud(currentCombatState, paidProgress),
    };
  }

  if (spell.id === "berries") {
    if (!currentCombatState) {
      return { message: "Berries can only be cast during a fight." };
    }
    if (currentCombatState.berriesCastRound === currentCombatState.round) {
      return { message: "You have already conjured a Berry this turn." };
    }
    if (progress.mana < storytellerManaCost) {
      return { message: `You don't have enough Mana to cast ${spell.name}.` };
    }

    const originalCombatState = structuredClone(currentCombatState);
    await savePlayerProgress(env, backpackKey, {
      ...progress,
      mana: progress.mana - storytellerManaCost,
    });
    const paidProgress = await getPlayerProgress(env, backpackKey);
    const resourceCaps = getPlayerResourceCaps(paidProgress);
    currentCombatState.playerMaxHp = resourceCaps.hp;
    currentCombatState.playerHp = Math.min(currentCombatState.playerHp, resourceCaps.hp);
    const naturalRoll = randomInteger(1, 20);
    const outcome = spell.outcomes[naturalRoll - 1];
    const effects = currentCombatState.berryEffects ||= {};
    const updatedProgress = { ...paidProgress };
    const restoreHp = amount => {
      currentCombatState.playerHp = Math.min(
        resourceCaps.hp, currentCombatState.playerHp + amount,
      );
    };
    const restoreMana = amount => {
      updatedProgress.mana = restoreManaToNormalCap(
        updatedProgress.mana, amount, resourceCaps.mana, currentCombatState,
      );
    };
    const grantRollBonus = (name, value) => {
      effects.rollBonuses ||= {};
      effects.rollBonuses[name] = value;
    };
    let fixedDamage = 0;
    switch (naturalRoll) {
      case 1: fixedDamage = 10; break;
      case 2: effects.sleepyGuard = true; break;
      case 3: restoreMana(30); break;
      case 4: restoreHp(15); break;
      case 5: grantRollBonus("Bouncy Berry", 2); break;
      case 6: restoreMana(20); grantRollBonus("Fae Berry", 1); break;
      case 7: effects.protection = (effects.protection || 0) + 10; break;
      case 8: effects.sparkDamage = true; break;
      case 9: restoreHp(25); break;
      case 10: restoreMana(50); break;
      case 11: restoreHp(15); restoreMana(20); break;
      case 12: grantRollBonus("Giggling Berry", 3); break;
      case 13: break;
      case 14: restoreHp(15); restoreMana(30); break;
      case 15: restoreMana(20); effects.shimmerDiscount = true; break;
      case 16: effects.protection = (effects.protection || 0) + 20; break;
      case 17: fixedDamage = 25; break;
      case 18: restoreMana(60); grantRollBonus("Astral Berry", 2); break;
      case 19: restoreHp(30); restoreMana(60); break;
      case 20: restoreHp(40); restoreMana(80); grantRollBonus("Shizuki's Favorite", 4); break;
    }
    let shizukiMessage = "";
    if (naturalRoll === 6) {
      const shizuki = activateShizukisPresence(
        currentCombatState, updatedProgress, shizukisPresenceMastery,
        "fae-berry", platform,
      );
      Object.assign(updatedProgress, shizuki.progress);
      shizukiMessage = shizuki.message;
    }
    currentCombatState.berriesCastRound = currentCombatState.round;
    const regionalHpBefore = currentCombatState.enemy.hp;
    damageCombatEnemy(currentCombatState, fixedDamage);
    finishRegionalEnemyDamage(currentCombatState, regionalHpBefore);
    const storytellerMessage = advanceStoryteller(
      currentCombatState, activePerks, platform,
    );
    updatedProgress.hp = currentCombatState.playerHp;
    const originalCandies = naturalRoll === 13
      ? await getBackpackTotal(env, backpackKey) : null;
    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      if (naturalRoll === 13) {
        await saveBackpackTotal(env, backpackKey, originalCandies + 75);
      }
      if (currentCombatState.enemy.hp === 0) {
        return await resolveCombatVictory(
          env, backpackKey, currentCombatState, null, fixedDamage,
          platform, outcome.text,
        );
      }
      await saveCombatState(env, backpackKey, currentCombatState);
    } catch (error) {
      await savePlayerProgress(env, backpackKey, progress);
      await saveCombatState(env, backpackKey, originalCombatState);
      if (originalCandies !== null) {
        await saveBackpackTotal(env, backpackKey, originalCandies);
      }
      throw error;
    }
    const separator = platform === "discord" ? "\n\n" : " | ";
    if (isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        updatedProgress, platform, [outcome.text, shizukiMessage,
          storytellerMessage, ...takeRegionalEnemyReceipts(currentCombatState)]
          .filter(Boolean));
    }
    return {
      message: [outcome.text, shizukiMessage, storytellerMessage,
        ...takeRegionalEnemyReceipts(currentCombatState),
        formatDiscordCombatHud(currentCombatState, updatedProgress)]
        .filter(Boolean).join(separator),
    };
  }

  if (spell.type === "pre-action-support" && spell.id === "astral-echo") {
    const echoManaCost = getStorytellerManaCost(
      echoMastery?.effect.manaCost ?? spell.manaCost, currentCombatState,
    );
    if (!currentCombatState) {
      return {
        message:
          "Echo can only be cast during a fight. Start or continue an " +
          "Adventure battle first.",
      };
    }

    if (currentCombatState.astralEcho) {
      const message =
        "Your Echo is already storing power. Cast an offensive spell to release it first.";
      return {
        message: platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    if (progress.mana < echoManaCost) {
      const message = `You don't have enough Mana to cast ${spell.name}.`;
      return {
        message: platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    const naturalRoll = randomInteger(1, spell.damage.sides);
    const tier = spell.echoTiers.find(
      (entry) => naturalRoll === entry.naturalRoll,
    );
    const originalCombatState = structuredClone(currentCombatState);
    const updatedProgress = {
      ...progress,
      mana: progress.mana - echoManaCost,
    };
    currentCombatState.astralEcho = {
      naturalRoll,
      tierId: tier.id,
      displayName: tier.displayName,
      damagePercent: tier.damagePercent,
    };

    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      await saveCombatState(env, backpackKey, currentCombatState);
    } catch (error) {
      try {
        await Promise.all([
          savePlayerProgress(env, backpackKey, progress),
          saveCombatState(env, backpackKey, originalCombatState),
        ]);
      } catch (rollbackError) {
        console.error("Echo cast rollback failed:", rollbackError);
      }
      throw error;
    }

    const castParts = [
      tier.narration,
      `Echo Roll: ${naturalRoll} → ${tier.displayName}`,
      `Echo Power: ${Math.round(tier.damagePercent * 100)}%`,
      "Your Echo is stored. Your turn continues.",
    ];
    const hud = formatDiscordCombatHud(currentCombatState, updatedProgress);
    if (isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        updatedProgress, platform, castParts);
    }
    return {
      message: platform === "discord"
        ? `${castParts.join("\n\n")}\n\n${hud}`
        : `${castParts.join(" | ")} | ${hud}`,
    };
  }

  if (spell.type === "defensive" && spell.id === "bubble") {
    if (!currentCombatState) {
      return {
        message:
          "Bubble can only be cast during a fight. Start or continue an " +
          "Adventure battle first.",
      };
    }

    if (currentCombatState.bubble) {
      const message =
        "Your Bubble is already active. It gives an impatient little *boing*. Apparently one Bubble is enough.";
      return {
        message: platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    if (progress.mana < storytellerManaCost) {
      const message = `You don't have enough Mana to cast ${spell.name}.`;
      return {
        message: platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    const naturalRoll = randomInteger(1, spell.damage.sides);
    const tier = spell.protectionTiers.find(
      (entry) => naturalRoll <= entry.naturalMaximum,
    );
    const rareFlavor =
      naturalRoll === spell.damage.sides &&
      Math.random() < spell.criticalFlavorChance
        ? randomChoice(spell.criticalFlavor)
        : null;
    const originalCombatState = structuredClone(currentCombatState);
    const updatedProgress = {
      ...progress,
      mana: progress.mana - storytellerManaCost,
    };
    currentCombatState.bubble = {
      naturalRoll,
      tierId: tier.id,
      displayName: tier.displayName,
      protection: tier.protection,
      maxProtection: tier.protection,
    };

    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      await saveCombatState(env, backpackKey, currentCombatState);
    } catch (error) {
      try {
        await Promise.all([
          savePlayerProgress(env, backpackKey, progress),
          saveCombatState(env, backpackKey, originalCombatState),
        ]);
      } catch (rollbackError) {
        console.error("Bubble cast rollback failed:", rollbackError);
      }
      throw error;
    }

    const castParts = [
      tier.narration,
      ...(rareFlavor ? [rareFlavor] : []),
      `Bubble Roll: ${naturalRoll} → ${tier.displayName}`,
      `Protection: ${tier.protection} damage`,
      "Your Bubble is ready. Your turn continues.",
    ];
    const hud = formatDiscordCombatHud(currentCombatState, updatedProgress);
    if (isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        updatedProgress, platform, castParts);
    }
    return {
      message: platform === "discord"
        ? `${castParts.join("\n\n")}\n\n${hud}`
        : `${castParts.join(" | ")} | ${hud}`,
    };
  }

  if (spell.type === "healing-support" && spell.id === "mend") {
    if (!currentCombatState) {
      return {
        message:
          "Mend can only be woven during a fight. Start or continue an " +
          "Adventure battle first.",
      };
    }

    if (currentCombatState.mend) {
      return {
        message:
          "The Fae magic is already mending your wounds. Give it a moment—it's working on it.",
      };
    }

    if (progress.mana < storytellerManaCost) {
      const message = `You don't have enough Mana to cast ${spell.name}.`;
      return {
        message: platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    const naturalRolls = mendMastery
      ? Array.from(
          { length: mendMastery.effect.roll.dice },
          () => randomInteger(1, mendMastery.effect.roll.sides),
        )
      : [randomInteger(1, spell.damage.sides)];
    const naturalRoll = mendMastery
      ? Math.max(...naturalRolls)
      : naturalRolls[0];
    const originalCombatState = structuredClone(currentCombatState);
    const paidProgress = {
      ...progress,
      mana: progress.mana - storytellerManaCost,
    };
    const curiosityResult = mendMastery
      ? await resolveAstralCuriosity(
          env,
          backpackKey,
          currentCombatState,
          paidProgress,
          naturalRolls,
        )
      : { progress: paidProgress, message: "" };
    const tier = spell.healingTiers.find(
      (entry) => naturalRoll <= entry.naturalMaximum,
    );
    const healingPerTrigger = mendMastery
      ? mendMastery.effect.healingPerTrigger[tier.id]
      : tier.healingPerTrigger;
    const criticalFlavor =
      naturalRoll === spell.damage.sides &&
      Math.random() < spell.criticalFlavorChance
        ? randomChoice(spell.criticalFlavor)
        : null;
    const updatedProgress = curiosityResult.progress;
    currentCombatState.mend = {
      naturalRoll,
      tierId: tier.id,
      displayName: tier.displayName,
      healingPerTrigger,
      remainingTriggers: spell.triggerCount,
    };

    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      await saveCombatState(env, backpackKey, currentCombatState);
    } catch (error) {
      try {
        await Promise.all([
          savePlayerProgress(env, backpackKey, progress),
          saveCombatState(env, backpackKey, originalCombatState),
        ]);
      } catch (rollbackError) {
        console.error("Mend cast rollback failed:", rollbackError);
      }
      throw error;
    }

    const castParts = [
      ...(curiosityResult.message ? [curiosityResult.message] : []),
      ...(mendMastery ? [randomChoice(mendMastery.flavor)] : []),
      tier.narration,
      ...(criticalFlavor ? [criticalFlavor] : []),
      mendMastery
        ? `Mend Rolls: ${naturalRolls.join(", ")} → Keep ${naturalRoll} → ${tier.displayName}`
        : `Mend Roll: ${naturalRoll} → ${tier.displayName}`,
      `${healingPerTrigger} HP × ${spell.triggerCount} triggers`,
    ];
    const hud = formatDiscordCombatHud(currentCombatState, updatedProgress);
    if (isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        updatedProgress, platform, castParts);
    }

    return {
      message: platform === "discord"
        ? `${castParts.join("\n\n")}\n\n${hud}`
        : `${castParts.join(" | ")} | ${hud}`,
    };
  }

  if (spell.type === "timed-support" && spell.effectId === "elf_blessing") {
    const activeEffect = getStatusEffect(progress, spell.effectId);

    if (activeEffect) {
      const recastScene = randomChoice(spell.recastScenes);
      const message = currentCombatState
        ? recastScene
        : `${recastScene}\n\n` +
          `Elf Blessing Remaining: ${formatEffectRemaining(activeEffect)}`;
      return {
        message: currentCombatState && platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    if (progress.mana < storytellerManaCost) {
      const message = `You don't have enough Mana to cast ${spell.name}.`;
      return {
        message: currentCombatState && platform === "discord"
          ? appendDiscordCombatHud(message, currentCombatState, progress)
          : message,
      };
    }

    let updatedProgress = {
      ...progress,
      mana: progress.mana - storytellerManaCost,
      statusEffects: addStatusEffect(
        progress,
        createElfBlessingEffect(spell, elfBlessingMastery),
      ),
    };

    let shizukiMessage = "";
    if (currentCombatState) {
      const shizuki = activateShizukisPresence(
        currentCombatState, updatedProgress, shizukisPresenceMastery,
        "elf-blessing", platform,
      );
      updatedProgress = shizuki.progress;
      shizukiMessage = shizuki.message;
    }
    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      if (currentCombatState) {
        await saveCombatState(env, backpackKey, currentCombatState);
      }
    } catch (error) {
      try {
        await savePlayerProgress(env, backpackKey, progress);
      } catch (rollbackError) {
        console.error("Elf Blessing rollback failed:", rollbackError);
      }

      throw error;
    }
    const scene = randomChoice(spell.successScenes);
    const activeEffects = formatActiveEffects(
      updatedProgress,
      platform,
    );
    const effectDetails = currentCombatState ? "" : activeEffects;

    let message = platform === "discord"
        ? effectDetails
          ? `${scene}\n\n${effectDetails}`
          : scene
        : effectDetails
          ? `${scene.split("\n")[0]} ${effectDetails}`
          : scene.split("\n")[0];
    if (shizukiMessage) {
      message = platform === "discord"
        ? `${message}\n\n${shizukiMessage}`
        : `${message} | ${shizukiMessage}`;
    }
    if (currentCombatState) {
      const regionalMessages = takeRegionalEnemyReceipts(currentCombatState);
      if (regionalMessages.length) message +=
        (platform === "discord" ? "\n\n" : " | ") + regionalMessages.join(" | ");
    }
    if (currentCombatState && isWishpocketCombat(currentCombatState)) {
      return finishWishpocketSupportAction(env, backpackKey, currentCombatState,
        updatedProgress, platform, [message]);
    }
    return {
      message: currentCombatState && platform === "discord"
        ? appendDiscordCombatHud(message, currentCombatState, updatedProgress)
        : message,
    };
  }

  const combatState = currentCombatState;

  if (!combatState) {
    const activeAdventure = await getActiveAdventure(env, backpackKey);

    if (activeAdventure) {
      return {
        message:
          `There isn't an enemy to cast ${spell.name} at yet.`,
      };
    }

    return {
      message:
        "You are not currently in an Adventure. " +
        `Start one with ${platform === "discord" ? "/adventure" : "!adventure"}.`,
    };
  }

  if (spell.id === "evocation") {
    const maximumMana = getPlayerResourceCaps(progress).mana;
    if (progress.mana >= maximumMana) return { message: spell.fullManaLine };
    if (progress.evocationCooldownTurns > 0) {
      return { message: `Evocation is unavailable: ${progress.evocationCooldownTurns} combat turns remaining.` };
    }
    const overflow = Boolean(shizukisPresenceMastery &&
      progress.mana < maximumMana * shizukisPresenceMastery.effect.evocation.threshold);
    const targetMana = overflow
      ? Math.floor(maximumMana *
          shizukisPresenceMastery.effect.evocation.overflowMultiplier)
      : maximumMana;
    const updatedProgress = {
      ...progress, mana: targetMana, evocationCooldownTurns: spell.cooldownTurns,
    };
    recordRegionalManaRecovery(combatState, targetMana - progress.mana);
    const separator = platform === "discord" ? "\n\n" : " | ";
    const castMessage = overflow
      ? [
          "Evocation cast below 25% Mana!",
          randomChoice(shizukisPresenceMastery.evocationFlavor),
          "Shizuki's Presence activated - Overflowing you with Mana!",
          `Mana: ${progress.mana} → ${targetMana}`,
          "Turn consumed. Evocation cooldown: 7 combat turns.",
        ].join(separator)
      : `${randomChoice(spell.successLines)}${separator}` +
        `Mana fully restored: ${maximumMana}/${maximumMana}. Turn consumed. Evocation cooldown: 7 combat turns.`;
    await savePlayerProgress(env, backpackKey, updatedProgress);
    try {
      const turnStart = await advanceLeviathansWake(
        env, backpackKey, combatState, updatedProgress, platform, false,
      );
      if (turnStart.victory) return {
        ...turnStart.victory,
        message: [castMessage, turnStart.victory.message].join(platform === "discord" ? "\n\n" : " | "),
      };
      return await resolvePlayerCombatAction(env, backpackKey, combatState, {
        damage: 0,
        message: [turnStart.message, castMessage].filter(Boolean).join(platform === "discord" ? "\n\n" : " | "),
      }, platform);
    } catch (error) {
      await savePlayerProgress(env, backpackKey, progress);
      throw error;
    }
  }

  if (spell.id === "leviathans-wake" && combatState.leviathansWake) {
    return {
      message: platform === "discord"
        ? appendDiscordCombatHud(spell.duplicateCastLine, combatState, progress)
        : spell.duplicateCastLine,
    };
  }

  const astralCharge = getAstralCharge(combatState.enemy);
  const shimmerDiscount = combatState.berryEffects?.shimmerDiscount === true;
  // Both 50% discounts apply to the same next offensive spell; the larger
  // discount wins rather than compounding into an unintended 75% reduction.
  const manaReduction = Math.max(
    astralCharge?.manaDiscountAvailable ? astralCharge.manaReduction : 0,
    shimmerDiscount ? 0.5 : 0,
  );
  const regionalTax = getRegionalSpellTax(combatState);
  const normalManaCost = Math.round(storytellerManaCost * (1 - manaReduction));
  const manaCost = normalManaCost + regionalTax;
  const isAllOrNothing = spell.id === "all-or-nothing";

  if (progress.mana < (isAllOrNothing ? storytellerManaCost + regionalTax : manaCost)) {
    const message = `You don't have enough Mana to cast ${spell.name}.` +
      (regionalTax ? ` King's Tax requires an additional ${regionalTax} Mana.` : "");
    return {
      message: platform === "discord"
        ? appendDiscordCombatHud(message, combatState, progress)
        : message,
    };
  }

  // Only a validated, turn-consuming action advances a pending Wake.
  // Resolve before rolling, consuming modifiers, or paying for this action.
  const turnStart = await advanceLeviathansWake(
    env, backpackKey, combatState, progress, platform,
  );
  if (turnStart.victory) return turnStart.victory;

  if (shimmerDiscount && !isAllOrNothing) delete combatState.berryEffects.shimmerDiscount;

  if (spell.id === "leviathans-wake") {
    if (regionalTax) regionalEnemyReceipt(combatState, `King's Tax — Additional ${regionalTax} Mana paid.`);
    return castLeviathansWake(
      env, backpackKey, combatState, progress, spell, activePerks,
      astralCharge, manaCost, platform,
    );
  }

  const spellRoll = rollSpellDamage(spell);
  const faeMischiefPerk = activePerks.find(
    (perk) => perk.effect.trigger === "one-die-pattern-completion",
  );
  let faeMischief = applyFaeMischiefToPrimaryDice(
    spell, spellRoll, faeMischiefPerk, combatState,
  );
  const triggeredRoll = isAllOrNothing ? {
    naturalRoll: spellRoll.total,
    modifier: 0,
    finalTotal: spellRoll.total,
    applied: [],
    modifierDetails: [],
    consumed: [],
    statusEffects: progress.statusEffects,
  } : consumeTriggeredStatusEffects(
    progress,
    OFFENSIVE_ROLL_TRIGGER,
    spellRoll.total,
    combatState,
    true,
  );
  const faeBonus = isAllOrNothing ? 0 : getFaeSpellRollBonus(progress);
  if (faeBonus > 0) {
    triggeredRoll.modifier += faeBonus;
    triggeredRoll.finalTotal += faeBonus;
    triggeredRoll.applied.unshift("Fae Affinity");
    triggeredRoll.modifierDetails.unshift({ name: "Fae Affinity", value: faeBonus });
  }
  const lunarPatience = spell.id === "moonbeam" && activePerks.find(
    (perk) => perk.effect.trigger === "moonbeam-noncritical-main-roll",
  );
  if (lunarPatience && combatState.lunarPatience) {
    const bonus = lunarPatience.effect.offensiveRollModifier;
    triggeredRoll.modifier += bonus;
    triggeredRoll.finalTotal += bonus;
    triggeredRoll.applied.push("Lunar Patience");
    triggeredRoll.modifierDetails.push({ name: "Lunar Patience", value: bonus });
  }
  const resolvedSpellRoll = resolveSpellRoll(
    spell,
    spellRoll,
    triggeredRoll.finalTotal,
    moonbeamMastery,
    isAllOrNothing ? (combatState.allOrNothingStreak || 0) : 0,
    meteorAlignmentMastery,
  );
  if (!faeMischief) {
    faeMischief = applyFaeMischiefToMoonlight(
      resolvedSpellRoll, moonbeamMastery, faeMischiefPerk, combatState,
    );
  }
  if (lunarPatience) {
    if (resolvedSpellRoll.isCritical) delete combatState.lunarPatience;
    else combatState.lunarPatience = { offensiveRollModifier: 1 };
  }
  const strengthBonus = (spell.id === "falling-star" || isAllOrNothing) &&
      resolvedSpellRoll.damage === 0
    ? 0
    : getStrengthDamageBonus(progress);
  resolvedSpellRoll.baseDamage ??= resolvedSpellRoll.damage;
  resolvedSpellRoll.strengthBonus = strengthBonus;
  resolvedSpellRoll.damage += strengthBonus;
  const storytellerFinalChapter = combatState.storytellerChapter === 3;
  const storytellerCriticalBonus = storytellerFinalChapter &&
      resolvedSpellRoll.isCritical && resolvedSpellRoll.damage > 0
    ? Math.round(resolvedSpellRoll.damage * 1.12) - resolvedSpellRoll.damage
    : 0;
  resolvedSpellRoll.damage += storytellerCriticalBonus;
  const jellyfishMasteryEffect = spell.id === "jelly" && jellyfishMastery
    ? jellyfishMastery.effect.moods.find(
        (mood) => spellRoll.total <= mood.naturalMaximum,
      )
    : null;
  if (jellyfishMasteryEffect?.effectType === "bonus-damage") {
    resolvedSpellRoll.damage += jellyfishMasteryEffect.amount;
  }
  const legacy = activePerks.find(
    (perk) => perk.effect.trigger === "early-spell-legacy",
  );
  const perfectJellyfish = Boolean(legacy && spell.id === "jelly" &&
    spellRoll.rolls.length === 3 &&
    spellRoll.rolls.every((roll) => roll === spellRoll.rolls[0]));
  const fullMoon = Boolean(legacy && spell.id === "moonbeam" &&
    spellRoll.rolls.length === 2 &&
    spellRoll.rolls.every((roll) => roll === 20));
  const legacyBonusDamage = perfectJellyfish
    ? legacy.effect.perfectJellyfish.damage
    : fullMoon ? legacy.effect.fullMoon.damage : 0;
  resolvedSpellRoll.damage += legacyBonusDamage;
  if (astralCharge && (!isAllOrNothing || resolvedSpellRoll.damage > 0)) {
    resolvedSpellRoll.damage = applyPercentageDamageIncrease(
      resolvedSpellRoll.damage,
      astralCharge.damageIncrease,
    );
  }
  const rhythm = spell.type === "offensive" && resolvedSpellRoll.damage > 0
    ? applyAstralRhythm(combatState, activePerks, spell.id)
    : null;
  if (rhythm) resolvedSpellRoll.damage += rhythm.effect.bonusDamage;
  const risingPower = spell.type === "offensive" && resolvedSpellRoll.damage > 0
    ? applyRisingPower(combatState, activePerks, spell.id)
    : null;
  if (risingPower) resolvedSpellRoll.damage += risingPower.bonusDamage;
  const shizukiEmpowered = triggeredRoll.modifierDetails.some(
    (detail) => detail.name === "Shizuki's Presence",
  );
  if (shizukiEmpowered && resolvedSpellRoll.damage > 0) {
    resolvedSpellRoll.damage += shizukisPresenceMastery.effect.empowerment.bonusDamage;
  }
  const storytellerFinalDamage = storytellerFinalChapter &&
      resolvedSpellRoll.damage > 0 ? 10 : 0;
  resolvedSpellRoll.damage += storytellerFinalDamage;
  const astralEcho = isAllOrNothing && resolvedSpellRoll.damage === 0
    ? null : getAstralEcho(combatState);
  const echoDamage = astralEcho
    ? applyPercentageOfDamage(
        resolvedSpellRoll.damage,
        astralEcho.damagePercent,
      )
    : 0;
  if (resolvedSpellRoll.damage > 0 && combatState.berryEffects?.sparkDamage) {
    resolvedSpellRoll.damage += 8;
    delete combatState.berryEffects.sparkDamage;
  }
  const astralAftershock = activePerks.find(
    (perk) => perk.effect.trigger === "critical-offensive-spell",
  );
  const aftershockDamage =
    spell.type === "offensive" &&
    resolvedSpellRoll.isCritical &&
    astralAftershock
      ? astralAftershock.effect.bonusDamage
      : 0;
  resolvedSpellRoll.appliesAstralCharge =
    spell.id === "star-spark" &&
    resolvedSpellRoll.isCritical &&
    combatState.enemy.hp > resolvedSpellRoll.damage;
  const legacyCharge = Boolean(legacy && resolvedSpellRoll.appliesAstralCharge);
  const legacyScene = perfectJellyfish
    ? randomChoice(spell.legacy.perfectJellyfishScenes)
    : fullMoon ? randomChoice(spell.legacy.fullMoonScenes) : "";
  resolvedSpellRoll.astralChargeDamageUses = starSparkMastery?.effect.damageUses || 1;
  let castMessage = formatSpellCastMessage(
    spell,
    resolvedSpellRoll,
    triggeredRoll,
    platform,
  );
  if (faeMischief) {
    const mischiefMessage = formatFaeMischiefMessage(faeMischief, platform);
    castMessage = platform === "discord"
      ? `${mischiefMessage}\n\n${castMessage}`
      : `${mischiefMessage} | ${castMessage}`;
  }
  if (astralCharge && (!isAllOrNothing || resolvedSpellRoll.damage > 0)) {
    const chargeMessage =
      "Charge bursts! Your spell surges with borrowed starlight!";
    castMessage = platform === "discord"
      ? `${chargeMessage}\n\n${castMessage}`
      : `${chargeMessage} | ${castMessage}`;
  }
  if (astralEcho) {
    const astralEchoSpell = spellDefinitions.find(
      (definition) => definition.id === "astral-echo",
    );
    const echoMessage = astralEchoSpell.activationLine.replace(
      "{echoDamage}",
      String(echoDamage),
    );
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${echoMessage}`
      : `${castMessage} | ${echoMessage}`;
  }
  if (aftershockDamage > 0) {
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${astralAftershock.activationLine}`
      : `${castMessage} | ${astralAftershock.activationLine}`;
  }
  if (rhythm) {
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${rhythm.activationLine}`
      : `${castMessage} | ${rhythm.activationLine}`;
  }
  if (risingPower) {
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${risingPower.message}`
      : `${castMessage} | ${risingPower.message}`;
  }
  if (shizukiEmpowered) {
    const empowermentMessage = resolvedSpellRoll.damage > 0
      ? "Shizuki's Presence empowers the spell! +3 offensive roll | +15 damage"
      : "Shizuki's Presence empowers the spell! +3 offensive roll | No damage dealt";
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${empowermentMessage}`
      : `${castMessage} | ${empowermentMessage}`;
  }
  if (storytellerFinalDamage) {
    const storytellerMessage = storytellerCriticalBonus
      ? `The Final Chapter: +10 Final Damage | +12% Critical Damage (+${storytellerCriticalBonus})`
      : "The Final Chapter: +10 Final Damage";
    castMessage = platform === "discord"
      ? `${castMessage}\n\n${storytellerMessage}`
      : `${castMessage} | ${storytellerMessage}`;
  }
  if (isAllOrNothing) {
    combatState.allOrNothingStreak = spellRoll.total === 2
      ? (combatState.allOrNothingStreak || 0) + 1 : 0;
    if (shimmerDiscount && spellRoll.total === 2) {
      delete combatState.berryEffects.shimmerDiscount;
    }
  }
  const regionalTaxPaid = getRegionalTaxPayment(combatState, resolvedSpellRoll.damage, regionalTax);
  if (regionalTaxPaid) regionalEnemyReceipt(combatState, `King's Tax — Additional ${regionalTaxPaid} Mana paid.`);
  let updatedProgress = {
    ...progress,
    mana: progress.mana - (isAllOrNothing && spellRoll.total === 1
      ? storytellerManaCost : normalManaCost) - regionalTaxPaid,
    statusEffects: triggeredRoll.statusEffects,
  };
  if (faeMischief) {
    const shizuki = activateShizukisPresence(
      combatState, updatedProgress, shizukisPresenceMastery,
      "fae-mischief", platform,
    );
    updatedProgress = shizuki.progress;
    if (shizuki.message) {
      castMessage = platform === "discord"
        ? `${castMessage}\n\n${shizuki.message}`
        : `${castMessage} | ${shizuki.message}`;
    }
  }

  await savePlayerProgress(env, backpackKey, updatedProgress);

  try {
    return await resolvePlayerCombatAction(
      env,
      backpackKey,
      combatState,
      {
        roll: triggeredRoll.finalTotal,
        damage: resolvedSpellRoll.damage,
        regionalSpell: spell.id,
        echoDamage,
        aftershockDamage,
        message: turnStart.message ? `${turnStart.message}\n\n${castMessage}` : castMessage,
        victoryMessage: castMessage,
        consumeAstralCharge: Boolean(astralCharge) &&
          (!isAllOrNothing || spellRoll.total === 2),
        applyAstralCharge: resolvedSpellRoll.appliesAstralCharge,
        astralCharge: {
          ...spell.astralCharge,
          damageUses: starSparkMastery?.effect.damageUses || 1,
          manaDiscountUses: starSparkMastery?.effect.manaDiscountUses || 1,
        },
        momentumAction: spell.id === "moonbeam" ? "moonbeam" : null,
        momentumNaturalRoll: spell.id === "moonbeam"
          ? spellRoll.keptRoll
          : null,
        jellyfishMasteryEffect,
        legacyEffect: legacyCharge ? {
          type: "charge", manaRestore: legacy.effect.charge.manaRestore,
        } : perfectJellyfish ? {
          type: "perfect-jellyfish", scene: legacyScene,
          damage: legacyBonusDamage,
          hpRestore: legacy.effect.perfectJellyfish.hpRestore,
          manaRestore: legacy.effect.perfectJellyfish.manaRestore,
        } : fullMoon ? {
          type: "full-moon", scene: legacyScene, damage: legacyBonusDamage,
        } : null,
        consumeAstralEcho: Boolean(astralEcho),
        echoMasteryNaturalRoll: astralEcho?.naturalRoll,
        echoMasteryQualifies: Boolean(astralEcho) && resolvedSpellRoll.damage > 0,
        curiosityDice: spellRoll.naturalPatternDice,
        harmonySources: countOffensiveRollBonusSources(triggeredRoll),
        harmonySuccess: resolvedSpellRoll.damage > 0,
        expeditionQualifies: spell.type === "offensive" && resolvedSpellRoll.damage > 0,
        familiarQualifies: true,
        armAstralBond: Boolean(risingPower?.reachedMaximum),
        faeSecondOpinionFailure: (spell.id === "falling-star" &&
          resolvedSpellRoll.outcome === "miss") || (isAllOrNothing && spellRoll.total === 1),
      },
      platform,
    );
  } catch (error) {
    try {
      await savePlayerProgress(env, backpackKey, progress);
    } catch (rollbackError) {
      console.error("Spell Mana rollback failed:", rollbackError);
    }

    throw error;
  }
}

// Help! never enters the offensive action/modifier pipeline.
async function castHelp(env, backpackKey, combatState, progress, spell, platform) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.help";
  if (!combatState) return { message: "Help! can only be cast during a fight." };
  if (combatState.helpUsed) {
    return { message: "You have already cast Help! this battle." };
  }
  if (progress.mana < 150) {
    return { message: "Help! requires at least 150 current Mana." };
  }

  // Preserve the existing delayed-arrival timing for valid combat actions.
  const turnStart = await advanceLeviathansWake(
    env, backpackKey, combatState, progress, platform,
  );
  if (turnStart.victory) return turnStart.victory;
  progress = await getPlayerProgress(env, backpackKey);
  const manaTaken = Math.round(progress.mana * 0.5);
  const naturalRoll = randomInteger(1, 20);
  const success = naturalRoll >= 11;
  // Floor removal deliberately leaves ceil(current HP / 2), including at 1 HP.
  const regionalHpBefore = combatState.enemy.hp;
  const hpRemoved = damageCombatEnemy(combatState,
    success ? Math.floor(combatState.enemy.hp / 2) : 0);
  finishRegionalEnemyDamage(combatState, regionalHpBefore);
  combatState.helpUsed = true;
  const paidProgress = { ...progress, mana: progress.mana - manaTaken };
  await savePlayerProgress(env, backpackKey, paidProgress);
  const separator = platform === "discord" ? "\n\n" : " | ";
  const receipt = `Help! | Natural d20: ${naturalRoll} | ${success ? "SUCCESS" : "FAILURE"} | ` +
    `Enemy HP removed: ${hpRemoved} | Enemy HP remaining: ${combatState.enemy.hp} | ` +
    `Mana taken: ${manaTaken} | Mana remaining: ${paidProgress.mana}`;
  const messageParts = [
    turnStart.message,
    [...spell.opening, success ? "WIN 50/50" : "LOST 50/50",
      ...(success ? spell.successLines : spell.failureLines), receipt].join(separator),
  ].filter(Boolean);
  const level = levelFromXp(paidProgress.xp);
  const activeMasteries = await getActiveMasteries(level);
  const activePerks = await getActivePerks(level);
  // Chapters still track actual enemy HP, but never modify this Ultimate.
  const chapterMessage = advanceStoryteller(combatState, activePerks, platform);
  if (chapterMessage) messageParts.push(chapterMessage);
  return resolveEnemyCombatResponse(
    env, backpackKey, combatState, { isolatedUltimate: true }, platform,
    paidProgress, activeMasteries, activePerks,
    activeMasteries.find(mastery => mastery.effect.id === "shizukis-presence"),
    messageParts,
  );
}

async function castLeviathansWake(
  env, backpackKey, combatState, progress, spell, activePerks,
  astralCharge, manaCost, platform,
) {
  const naturalRoll = randomInteger(1, spell.damage.sides);
  const triggeredRoll = consumeTriggeredStatusEffects(
    progress, OFFENSIVE_ROLL_TRIGGER, naturalRoll, combatState, true,
  );
  const faeBonus = getFaeSpellRollBonus(progress);
  if (faeBonus > 0) {
    triggeredRoll.modifier += faeBonus;
    triggeredRoll.finalTotal += faeBonus;
    triggeredRoll.modifierDetails.unshift({ name: "Fae", value: faeBonus });
  }
  // Modifiers are consumed normally, but never change the natural creature tier.
  const creature = spell.creatureTiers.find(
    (tier) => naturalRoll <= tier.naturalMaximum,
  );
  const critical = naturalRoll === 20;
  const rhythm = applyAstralRhythm(combatState, activePerks, spell.id);
  const astralEcho = getAstralEcho(combatState);
  const aftershock = activePerks.find(
    (perk) => perk.effect.trigger === "critical-offensive-spell",
  );
  // Wake is already a committed successful offensive action in the shared
  // pipeline (it cannot miss). Count the summon once, never its delayed payload.
  const guardValue = bossPhase(combatState)?.guard || 15;
  const regionalGuardReduction = guardValue - applyRegionalRoyalGuard(combatState, guardValue, true);
  combatState.leviathansWake = {
    regionalGuardReduction,
    naturalRoll,
    finalRoll: triggeredRoll.finalTotal,
    creatureId: creature.id,
    stage: 1,
    baseDamage: creature.baseDamage,
    rhythmBonus: rhythm?.effect.bonusDamage || 0,
    shizukisPresenceBonus: triggeredRoll.modifierDetails.some(
      (detail) => detail.name === "Shizuki's Presence",
    ) ? 15 : 0,
    storytellerFinalChapter: combatState.storytellerChapter === 3,
    critical,
    astralChargeSnapshot: astralCharge
      ? { damageIncrease: astralCharge.damageIncrease }
      : null,
    astralEchoSnapshot: astralEcho
      ? {
          damagePercent: astralEcho.damagePercent,
          naturalRoll: astralEcho.naturalRoll,
        }
      : null,
    aftershockDamage: critical && aftershock ? aftershock.effect.bonusDamage : 0,
  };
  const modifiers = triggeredRoll.modifierDetails.map(
    ({ name, value }) => ` ${value >= 0 ? "+" : ""}${value} ${name}`,
  ).join("");
  const message = `${creature.cast}\n\n` +
    `${spell.name} Roll: ${naturalRoll}${modifiers} → ${triggeredRoll.finalTotal}` +
    (rhythm ? `\n\n${rhythm.activationLine}` : "");
  const updatedProgress = {
    ...progress,
    mana: progress.mana - manaCost,
    statusEffects: triggeredRoll.statusEffects,
  };
  await savePlayerProgress(env, backpackKey, updatedProgress);
  try {
    // Commit Charge/Echo now through the shared consumption rules. Damage waits.
    return await resolvePlayerCombatAction(env, backpackKey, combatState, {
      roll: triggeredRoll.finalTotal,
      damage: 0,
      echoDamage: 0,
      regionalSpell: spell.id,
      regionalCommittedWake: true,
      message,
      consumeAstralCharge: Boolean(astralCharge),
      consumeAstralEcho: Boolean(astralEcho),
      harmonySources: countOffensiveRollBonusSources(triggeredRoll),
      harmonySuccess: true,
      expeditionQualifies: true,
      familiarQualifies: true,
    }, platform);
  } catch (error) {
    try {
      await savePlayerProgress(env, backpackKey, progress);
    } catch (rollbackError) {
      console.error("Leviathan's Wake Mana rollback failed:", rollbackError);
    }
    throw error;
  }
}

async function advanceLeviathansWake(
  env, backpackKey, combatState, progress, platform, advanceCooldown = true,
) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.wake";
  // Only validated Attack, Stim, and turn-consuming casts reach this hook. Persist
  // before Wake can end the encounter. Evocation skips its own casting turn.
  if (advanceCooldown && progress.evocationCooldownTurns > 0) {
    progress.evocationCooldownTurns -= 1;
    await savePlayerProgress(env, backpackKey, progress);
  }
  const wake = combatState.leviathansWake;
  if (!wake) return { message: "" };
  const spell = await getSpellDefinition("leviathans-wake");
  const creature = spell.creatureTiers.find((tier) => tier.id === wake.creatureId);
  if (wake.stage === 1) {
    wake.stage = 2;
    return { message: creature.warning };
  }

  const strength = getStrengthDamageBonus(progress);
  let primaryDamage = wake.baseDamage + strength;
  const storytellerCriticalBonus = wake.storytellerFinalChapter && wake.critical
    ? Math.round(primaryDamage * 1.12) - primaryDamage
    : 0;
  primaryDamage += storytellerCriticalBonus;
  if (wake.astralChargeSnapshot) {
    primaryDamage = applyPercentageDamageIncrease(
      primaryDamage, wake.astralChargeSnapshot.damageIncrease,
    );
  }
  primaryDamage += wake.rhythmBonus || 0;
  primaryDamage += wake.shizukisPresenceBonus || 0;
  primaryDamage += wake.storytellerFinalChapter ? 10 : 0;
  const echoDamage = wake.astralEchoSnapshot
    ? applyPercentageOfDamage(primaryDamage, wake.astralEchoSnapshot.damagePercent)
    : 0;
  const sparkBerry = combatState.berryEffects?.sparkDamage === true;
  if (sparkBerry) {
    primaryDamage += 8;
    delete combatState.berryEffects.sparkDamage;
  }
  const aftershock = wake.aftershockDamage > 0
    ? await getPerkDefinition("astral-aftershock")
    : null;
  const parts = [creature.arrival];
  if (wake.critical && Math.random() < spell.ancientFlavorChance) {
    parts.push(spell.ancientFlavor);
  }
  // One cosmetic check; the combined case never falls through to individual eggs.
  const egg = combatState.bubble && combatState.mend ? "combined"
    : combatState.bubble ? "bubble" : combatState.mend ? "mend" : null;
  if (egg && Math.random() < spell.easterEggChance) {
    parts.push(spell.easterEggs[egg]);
  }
  parts.push(`${spell.name}: ${wake.baseDamage} +${strength} Strength` +
    `${wake.astralChargeSnapshot ? " + Charge" : ""}` +
    `${wake.rhythmBonus ? " + Rhythm" : ""}` +
    `${wake.shizukisPresenceBonus ? " + Shizuki's Presence" : ""}` +
    `${wake.storytellerFinalChapter ? " + The Final Chapter" : ""}` +
    `${sparkBerry ? " + Spark Berry" : ""} → ${primaryDamage} dmg`);
  if (storytellerCriticalBonus) {
    parts.push(`The Final Chapter: +10 Final Damage | +12% Critical Damage (+${storytellerCriticalBonus})`);
  } else if (wake.storytellerFinalChapter) {
    parts.push("The Final Chapter: +10 Final Damage");
  }
  const regionalHpBefore = combatState.enemy.hp;
  if (wake.regionalGuardReduction) {
    const reduced = Math.min(primaryDamage, wake.regionalGuardReduction);
    primaryDamage -= reduced;
    parts.push(`Perk: Royal Guard — Wake damage reduced by ${reduced}.`);
  }
  damageCombatEnemy(combatState, primaryDamage);
  if (wake.astralEchoSnapshot) {
    damageCombatEnemy(combatState, echoDamage);
    parts.push(spell.echoActivationLine.replace("{echoDamage}", String(echoDamage)));
    if (echoDamage > 0 && wake.astralEchoSnapshot.naturalRoll) {
      const activeMasteries = await getActiveMasteries(levelFromXp(progress.xp));
      const result = await applyAstralEchoMastery(
        env, backpackKey, combatState, progress,
        wake.astralEchoSnapshot.naturalRoll, activeMasteries,
      );
      if (result.message) parts.push(result.message);
    }
  }
  if (aftershock) {
    damageCombatEnemy(combatState, wake.aftershockDamage);
    parts.push(aftershock.activationLine);
  }
  let masteryDamage = 0;
  const wakeMastery = (await getActiveMasteries(levelFromXp(progress.xp))).find(
    (mastery) => mastery.effect.id === "wake-creature-arrival",
  );
  const arrivalEffect = wakeMastery?.effect.creatures.find(
    (effect) => effect.creatureId === wake.creatureId,
  );
  if (arrivalEffect) {
    masteryDamage = arrivalEffect.fixedDamage;
    damageCombatEnemy(combatState, masteryDamage);
    if (arrivalEffect.protection > 0) {
      combatState.wakeMantaProtection =
        (combatState.wakeMantaProtection || 0) + arrivalEffect.protection;
    }
    if (arrivalEffect.manaRestore > 0) {
      const latestProgress = await getPlayerProgress(env, backpackKey);
      const restoredMana = Math.min(arrivalEffect.manaRestore,
        Math.max(0, getPlayerResourceCaps(latestProgress).mana - latestProgress.mana));
      progress.mana = latestProgress.mana + restoredMana;
      recordRegionalManaRecovery(combatState, restoredMana);
      await savePlayerProgress(env, backpackKey, {
        ...latestProgress, mana: progress.mana,
      });
    }
    parts.push(arrivalEffect.activationLine);
  }
  const storytellerMessage = advanceStoryteller(
    combatState,
    await getActivePerks(levelFromXp(progress.xp)),
    platform,
  );
  if (storytellerMessage) parts.push(storytellerMessage);
  finishRegionalEnemyDamage(combatState, regionalHpBefore);
  parts.push(...takeRegionalEnemyReceipts(combatState));
  delete combatState.leviathansWake;
  const message = parts.join("\n\n");
  if (combatState.enemy.hp === 0) {
    return {
      victory: await resolveCombatVictory(
        env, backpackKey, combatState, wake.finalRoll,
        primaryDamage + echoDamage + wake.aftershockDamage + masteryDamage,
        platform, message,
      ),
    };
  }
  // The caller still executes its normal action and saves the resulting turn.
  return { message };
}

function consumeFaeMischief(perk, combatState, pattern, originalDice,
  resolvedDice, dieIndex) {
  combatState.perkUses = {
    ...(combatState.perkUses || {}),
    [perk.id]: 1,
  };
  return {
    pattern,
    originalDice,
    resolvedDice,
    dieIndex,
    from: originalDice[dieIndex],
    to: resolvedDice[dieIndex],
    flavor: randomChoice(perk.flavor),
  };
}

function applyFaeMischiefToPrimaryDice(spell, spellRoll, perk, combatState) {
  if (!perk || combatState.perkUses?.[perk.id] ||
      !Array.isArray(spellRoll.naturalPatternDice)) return null;

  const originalDice = [...spellRoll.naturalPatternDice];
  let dieIndex = -1;
  let target = null;
  let pattern = null;

  if (spell.id === "moonbeam" && originalDice.length === 2) {
    const twenties = originalDice.filter((die) => die === 20).length;
    if (twenties === 1) {
      dieIndex = originalDice.findIndex((die) => die !== 20);
      target = 20;
      pattern = "Full Moon";
    }
  } else if (spell.id === "jelly" && originalDice.length === 3) {
    const counts = new Map();
    for (const die of originalDice) counts.set(die, (counts.get(die) || 0) + 1);
    const matching = [...counts.entries()].find(([, count]) => count === 2);
    if (matching) {
      dieIndex = originalDice.findIndex((die) => die !== matching[0]);
      target = matching[0];
      pattern = "Perfect Jellyfish";
    }
  } else if (spell.id === "falling-star" && originalDice.length === 3) {
    const counts = new Map();
    for (const die of originalDice) counts.set(die, (counts.get(die) || 0) + 1);
    const matching = [...counts.entries()].find(([, count]) => count === 2);
    if (matching) {
      dieIndex = originalDice.findIndex((die) => die !== matching[0]);
      target = matching[0];
      pattern = "Meteor Alignment triples";
    }
  }

  if (dieIndex < 0) return null;
  const resolvedDice = [...originalDice];
  resolvedDice[dieIndex] = target;
  spellRoll.originalNaturalPatternDice = originalDice;
  spellRoll.naturalPatternDice = resolvedDice;
  if (spell.id === "falling-star") {
    spellRoll.powerRolls = resolvedDice;
    spellRoll.powerTotal = resolvedDice.reduce((sum, die) => sum + die, 0);
  } else {
    spellRoll.rolls = resolvedDice;
    spellRoll.total = spell.id === "moonbeam"
      ? Math.max(...resolvedDice)
      : resolvedDice.reduce((sum, die) => sum + die, 0);
    if (spell.id === "moonbeam") spellRoll.keptRoll = spellRoll.total;
  }
  return consumeFaeMischief(
    perk, combatState, pattern, originalDice, resolvedDice, dieIndex,
  );
}

function applyFaeMischiefToMoonlight(spellRoll, moonbeamMastery, perk,
  combatState) {
  if (!perk || !moonbeamMastery || combatState.perkUses?.[perk.id] ||
      !Array.isArray(spellRoll.moonlightRolls) ||
      spellRoll.moonlightRolls.length !== 2) return null;
  const originalDice = [...spellRoll.moonlightRolls];
  if (originalDice[0] === originalDice[1] || originalDice[0] + originalDice[1] === 7) {
    return null;
  }
  const resolvedDice = [originalDice[0], originalDice[0]];
  spellRoll.originalMoonlightRolls = originalDice;
  spellRoll.moonlightRolls = resolvedDice;
  spellRoll.bonusDamage = resolvedDice[0] + resolvedDice[1];
  spellRoll.alignmentDamage = spellRoll.isCritical
    ? moonbeamMastery.effect.criticalDamage
    : moonbeamMastery.effect.normalDamage;
  spellRoll.damage = spellRoll.baseDamage + spellRoll.bonusDamage +
    spellRoll.alignmentDamage;
  return consumeFaeMischief(
    perk, combatState, "Lunar Alignment", originalDice, resolvedDice, 1,
  );
}

function formatFaeMischiefMessage(result, platform = "twitch") {
  const separator = platform === "discord" ? "\n\n" : " | ";
  return [
    "Fae Mischief!",
    result.flavor,
    `Original ${result.pattern}: ${result.originalDice.join(" + ")}`,
    `${result.from} → ${result.to}`,
    `Resolved ${result.pattern}: ${result.resolvedDice.join(" + ")}`,
  ].join(separator);
}

function rollSpellDamage(spell) {
  if (spell.id === "conjure-gun") {
    const rolls = Array.from(
      { length: spell.damage.dice },
      () => randomInteger(spell.damage.min, spell.damage.max),
    );
    return { rolls, total: rolls.reduce((sum, roll) => sum + roll, 0),
      naturalPatternDice: null };
  }
  if (spell.id === "tidal-wave") {
    const rolls = Array.from(
      { length: spell.damage.dice },
      () => randomInteger(1, spell.damage.sides),
    );
    return { rolls, total: rolls.reduce((sum, roll) => sum + roll, 0),
      naturalPatternDice: rolls };
  }
  if (spell.id === "falling-star") {
    const powerRolls = Array.from(
      { length: spell.power.dice },
      () => randomInteger(1, spell.power.sides),
    );
    const powerTotal = powerRolls.reduce((sum, roll) => sum + roll, 0);
    const accuracyRoll = randomInteger(1, spell.accuracy.sides);
    return {
      rolls: [accuracyRoll],
      total: accuracyRoll,
      powerRolls,
      powerTotal,
      naturalPatternDice: powerRolls,
      accuracyRoll,
      isCritical: false,
      damage: 0,
    };
  }

  if (spell.id === "moonbeam") {
    const rolls = Array.from(
      { length: spell.damage.dice },
      () => randomInteger(1, spell.damage.sides),
    );
    const keptRoll = Math.max(...rolls);

    return {
      rolls,
      total: keptRoll,
      keptRoll,
      naturalPatternDice: rolls,
      isCritical: false,
      damage: 0,
    };
  }

  const rolls = Array.from(
    { length: spell.damage.dice },
    () => randomInteger(1, spell.damage.sides),
  );

  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  const isCritical = total >= spell.criticalThreshold;

  return {
    rolls,
    total,
    naturalPatternDice: rolls,
    isCritical,
    damage: isCritical ? spell.criticalDamage : total,
  };
}

function resolveSpellRoll(spell, spellRoll, finalTotal, moonbeamMastery = null,
  allOrNothingPriorStreak = 0, meteorAlignmentMastery = null) {
  if (spell.id === "conjure-gun") {
    const baseDamage = spellRoll.total;
    return { ...spellRoll, finalTotal, baseDamage, damage: baseDamage,
      isCritical: false };
  }
  if (spell.id === "tidal-wave") {
    const tier = spell.damageTiers.find((entry) =>
      finalTotal <= entry.finalMaximum) || spell.damageTiers.at(-1);
    return {
      ...spellRoll, finalTotal, tierId: tier.id,
      isCritical: tier.id === "critical", damage: tier.baseDamage,
      baseDamage: tier.baseDamage,
    };
  }
  if (spell.id === "all-or-nothing") {
    const damage = spellRoll.total === 2
      ? spell.baseDamagePerWin * (allOrNothingPriorStreak + 1) : 0;
    return { ...spellRoll, finalTotal: spellRoll.total, isCritical: false,
      priorStreak: allOrNothingPriorStreak, damage, baseDamage: damage };
  }
  if (spell.id === "falling-star") {
    const counts = new Map();
    if (meteorAlignmentMastery) {
      for (const die of spellRoll.powerRolls) {
        counts.set(die, (counts.get(die) || 0) + 1);
      }
    }
    const matchingPower = counts.size === 1
      ? meteorAlignmentMastery.effect.triplePower
      : [...counts.values()].includes(2)
        ? meteorAlignmentMastery?.effect.doublePower || 0 : 0;
    const totalSevenPower = meteorAlignmentMastery && spellRoll.powerTotal === 7
      ? meteorAlignmentMastery.effect.totalSevenPower : 0;
    const adjustedPower = spellRoll.powerTotal + matchingPower + totalSevenPower;
    const outcome = spellRoll.accuracyRoll === 1
      ? "miss"
      : finalTotal <= 9
        ? "glancing"
        : finalTotal <= 19
          ? "direct"
          : "critical";
    const damage = outcome === "miss"
      ? 0
      : outcome === "glancing"
        ? Math.max(1, adjustedPower - spell.glancingPenalty)
        : outcome === "critical"
          ? adjustedPower + spell.criticalBonus
          : adjustedPower;
    return {
      ...spellRoll,
      finalTotal,
      outcome,
      adjustedPower,
      meteorAlignment: meteorAlignmentMastery ? {
        matchingPower, totalSevenPower,
        matchType: counts.size === 1 ? "triples"
          : matchingPower ? "pair" : null,
      } : null,
      isCritical: outcome === "critical",
      damage,
      baseDamage: damage,
    };
  }

  if (spell.id === "moonbeam") {
    const isCritical = finalTotal >= spell.criticalThreshold;
    const attackResult = getCombatRollResult(finalTotal);
    const baseDamage = isCritical
      ? spell.criticalDamage
      : attackResult.damage;
    const moonlightRolls = Array.from(
      { length: moonbeamMastery?.effect.moonlightDice || 1 },
      () => randomInteger(1, spell.damage.bonusDieSides),
    );
    const bonusDamage = moonlightRolls.reduce((sum, die) => sum + die, 0);
    const aligned = moonlightRolls.length === 2 &&
      (moonlightRolls[0] === moonlightRolls[1] || bonusDamage === 7);
    const alignmentDamage = aligned
      ? (isCritical ? moonbeamMastery.effect.criticalDamage
        : moonbeamMastery.effect.normalDamage)
      : 0;

    return {
      ...spellRoll,
      finalTotal,
      isCritical,
      category: isCritical ? "Critical" : attackResult.category,
      damageTier: isCritical ? "Critical Hit" : `${attackResult.category} Hit`,
      baseDamage,
      moonlightRolls,
      bonusDamage,
      alignmentDamage,
      damage: baseDamage + bonusDamage + alignmentDamage,
      criticalFlavor: isCritical ? getMoonbeamCriticalFlavor(spell) : null,
    };
  }

  const isCritical = finalTotal >= spell.criticalThreshold;

  return {
    ...spellRoll,
    finalTotal,
    isCritical,
    damage: isCritical ? spell.criticalDamage : spellRoll.total,
    criticalFlavor:
      spell.id === "star-spark" &&
      isCritical &&
      Math.random() < spell.criticalFlavorChance
        ? randomChoice(spell.criticalFlavor)
        : null,
  };
}

function formatSpellCastMessage(
  spell,
  spellRoll,
  effectResult,
  platform = "twitch",
) {
  if (spell.id === "conjure-gun") {
    const separator = platform === "discord" ? "\n\n" : " | ";
    const hits = spellRoll.total;
    const misses = spellRoll.rolls.length - hits;
    return [
      randomChoice(spell.flavor),
      `Shots: ${spellRoll.rolls.join(", ")}`,
      `${spellRoll.rolls.length} Shots!`,
      `${hits} ${hits === 1 ? "Hit" : "Hits"}!`,
      `${misses} ${misses === 1 ? "Miss" : "Misses"}!`,
      `Base Damage: ${spellRoll.baseDamage}`,
      ...(spellRoll.strengthBonus ? [`Strength: +${spellRoll.strengthBonus}`] : []),
      `Total Damage: ${spellRoll.damage}`,
    ].join(separator);
  }
  if (spell.id === "tidal-wave") {
    const tier = spell.damageTiers.find((entry) => entry.id === spellRoll.tierId);
    const separator = platform === "discord" ? "\n\n" : " | ";
    const modifiers = effectResult.modifierDetails.map((detail) => {
      const name = detail.name === "Fae Affinity" ? "Fae" : detail.name;
      return `${detail.value >= 0 ? "+" : "-"}${Math.abs(detail.value)} ${name}`;
    }).join(" ");
    const rollText = `Tidal Wave: ${spellRoll.rolls.join(" + ")} = ${spellRoll.total}` +
      (modifiers ? ` | ${modifiers} → ${spellRoll.finalTotal}`
        : ` → ${spellRoll.finalTotal}`);
    const damageText = `${tier.displayName} → ${tier.baseDamage} base dmg` +
      (spellRoll.strengthBonus ? ` + ${spellRoll.strengthBonus} Strength` : "") +
      ` = ${spellRoll.damage} dmg`;
    return [randomChoice(tier.scenes).join(separator), rollText, damageText]
      .join(separator);
  }
  if (spell.id === "all-or-nothing") {
    const tier = spellRoll.total === 1
      ? (spellRoll.priorStreak >= 3 ? "highStreakFailure" : "failure")
      : ["firstSuccess", "secondSuccess", "thirdSuccess", "fourthSuccess"][
          Math.min(spellRoll.priorStreak, 4)] || "fifthPlusSuccess";
    return `${spell.opener}\n\n${randomChoice(spell.flavor[tier])}` +
      `\n\nRoll ${spellRoll.total} → ${spellRoll.damage} dmg`;
  }
  if (spell.id === "falling-star") {
    return formatFallingStarCastMessage(
      spell,
      spellRoll,
      effectResult,
      platform,
    );
  }

  if (spell.id === "star-spark") {
    return formatStarSparkCastMessage(
      spell,
      spellRoll,
      effectResult,
      platform,
    );
  }

  if (spell.id === "moonbeam") {
    return formatMoonbeamCastMessage(spell, spellRoll, effectResult, platform);
  }

  const personality =
    spell.personalities.find(
      (entry) => spellRoll.total <= entry.maximumRoll,
    ) ||
    spell.personalities.at(-1);
  const followUp = spellRoll.isCritical
    ? spell.criticalText
    : personality.followUp;
  const separator = platform === "discord" ? "\n\n" : " | ";
  const resultText = spellRoll.isCritical
    ? `${separator}Result: Critical Hit!`
    : "";
  const fadeText = effectResult.consumed.length > 0
    ? `${separator}${effectResult.consumed.join(" and ")} fades after ` +
      "guiding your spell."
    : "";

  return `You throw a ${personality.adjective} ${spell.name}. ${followUp}` +
    resultText +
    fadeText +
    `${separator}${formatCompactCombatRoll(
      effectResult.naturalRoll,
      effectResult.finalTotal,
      effectResult.modifierDetails,
      spellRoll.damage,
    )}`;
}

function formatFallingStarCastMessage(
  spell,
  spellRoll,
  effectResult,
  platform,
) {
  const powerTier = spell.powerTiers.find(
    (tier) => spellRoll.powerTotal <= tier.naturalMaximum,
  );
  const narrationPool = spell.narrationPools.find(
    (pool) =>
      pool.powerTier === powerTier.id &&
      pool.outcome === spellRoll.outcome,
  );
  const modifiers = effectResult.modifierDetails.map((detail) => {
    const name = detail.name === "Fae Affinity" ? "Fae" : detail.name;
    const sign = detail.value >= 0 ? "+" : "-";
    return `${sign}${Math.abs(detail.value)} ${name}`;
  }).join("");
  const accuracyText = modifiers
    ? `${spellRoll.finalTotal} (${spellRoll.accuracyRoll}${modifiers})`
    : String(spellRoll.accuracyRoll);
  const outcomeName = {
    miss: "Miss",
    glancing: "Glancing Hit",
    direct: "Direct Hit",
    critical: "Critical Hit",
  }[spellRoll.outcome];
  const rareFlavor = spellRoll.accuracyRoll === 20 &&
      Math.random() < spell.naturalTwentyFlavorChance
    ? randomChoice(spell.naturalTwentyFlavor)
    : powerTier.id === "high" &&
        spellRoll.accuracyRoll === 1 &&
        Math.random() < spell.highPowerNaturalOneFlavorChance
      ? spell.highPowerNaturalOneFlavor
      : null;
  // Rare outcome flavor replaces the primary line, rather than adding a second
  // narration. Keep the usual selection draw so downstream RNG is unchanged.
  const narration = randomChoice(narrationPool.lines);
  const separator = platform === "discord" ? "\n\n" : " | ";
  return [
    rareFlavor || narration,
    ...(spellRoll.meteorAlignment &&
      (spellRoll.meteorAlignment.matchingPower ||
        spellRoll.meteorAlignment.totalSevenPower)
      ? [`Meteor Alignment: ${[
          spellRoll.meteorAlignment.matchingPower
            ? `${spellRoll.meteorAlignment.matchType === "triples" ? "Triples" : "Matching pair"} +${spellRoll.meteorAlignment.matchingPower} Power`
            : null,
          spellRoll.meteorAlignment.totalSevenPower
            ? `Total of 7 +${spellRoll.meteorAlignment.totalSevenPower} Power`
            : null,
        ].filter(Boolean).join(" | ")} | Adjusted Power ${spellRoll.adjustedPower}`]
      : []),
    `Power ${spellRoll.powerTotal} (${spellRoll.powerRolls.join("+")}) | ` +
      `Accuracy ${accuracyText} → ${outcomeName} | ${spellRoll.damage} dmg`,
  ].join(separator);
}

function formatStarSparkCastMessage(
  spell,
  spellRoll,
  effectResult,
  platform,
) {
  const tier = spellRoll.isCritical
    ? spell.narrationTiers.find((entry) => entry.id === "critical")
    : spell.narrationTiers.find(
        (entry) =>
          entry.id !== "critical" &&
          spellRoll.total <= entry.naturalMaximum,
      ) || spell.narrationTiers.filter(
        (entry) => entry.id !== "critical",
      ).at(-1);
  const separator = platform === "discord" ? "\n\n" : " | ";
  const details = [
    tier.narration,
    ...(spellRoll.criticalFlavor ? [spellRoll.criticalFlavor] : []),
    ...(spellRoll.appliesAstralCharge
      ? [
          spellRoll.astralChargeDamageUses > 1
            ? "Charge applied! Your next two offensive spells deal 15% more damage; the first also costs 50% less Mana."
            : "Charge applied! Your next offensive spell costs 50% less Mana and deals 15% more damage.",
        ]
      : []),
    formatCompactCombatRoll(
      effectResult.naturalRoll,
      effectResult.finalTotal,
      effectResult.modifierDetails,
      spellRoll.damage,
      spellRoll.isCritical,
    ),
  ];

  return details.join(separator);
}

function getMoonbeamCastTier(spell, { naturalKeptRoll, finalRoll, isCritical }) {
  if (isCritical || finalRoll >= spell.criticalThreshold) {
    return spell.narrationTiers.find((tier) => tier.id === "critical");
  }
  return spell.narrationTiers.find(
    (tier) => tier.id !== "critical" && naturalKeptRoll <= tier.naturalMaximum,
  );
}

function getMoonbeamCriticalFlavor(spell) {
  return Math.random() < spell.criticalFlavorChance
    ? randomChoice(spell.criticalFlavor)
    : null;
}

function formatMoonbeamCastMessage(spell, spellRoll, effectResult, platform = "twitch") {
  const tier = getMoonbeamCastTier(spell, {
    naturalKeptRoll: spellRoll.keptRoll,
    finalRoll: spellRoll.finalTotal,
    isCritical: spellRoll.isCritical,
  });
  const modifierDetails = effectResult.modifierDetails;
  const modifierLines = modifierDetails.map(
    (detail) => `${detail.name}:\n+${detail.value}`,
  );
  const strengthLine = spellRoll.strengthBonus > 0
    ? [`Strength:\n+${spellRoll.strengthBonus}`]
    : [];
  const criticalLine = spellRoll.isCritical ? ["**Critical Hit!**"] : [];
  const baseLabel = spellRoll.isCritical ? "Critical Base Damage" : "Base Damage";

  if (platform === "discord") {
    return [
      tier.narration,
      `**${tier.displayName}**`,
      `Moonbeam Rolls:\n${spellRoll.rolls[0]} and ${spellRoll.rolls[1]}`,
      `Kept Roll:\n${spellRoll.keptRoll}`,
      ...modifierLines,
      `Final Roll:\n${spellRoll.finalTotal}`,
      ...criticalLine,
      ...(!spellRoll.isCritical ? [`Damage Tier:\n${spellRoll.damageTier}`] : []),
      `${baseLabel}:\n${spellRoll.baseDamage}`,
      ...(spellRoll.moonlightRolls.length === 2
        ? [`Moonlight Rolls:\n${spellRoll.moonlightRolls[0]} and ${spellRoll.moonlightRolls[1]}`]
        : []),
      `Moonlight Bonus:\n+${spellRoll.bonusDamage}`,
      ...(spellRoll.alignmentDamage > 0
        ? [`Lunar Alignment:\n+${spellRoll.alignmentDamage}`]
        : []),
      ...strengthLine,
      `Total Damage:\n${spellRoll.damage}`,
      ...(spellRoll.criticalFlavor ? [spellRoll.criticalFlavor] : []),
    ].join("\n\n");
  }

  const modifiers = modifierDetails.map(
    (detail) => `+${detail.value} ${detail.name === "Fae Affinity" ? "Fae" : detail.name}`,
  ).join(" ");
  const rollCalculation = modifiers
    ? `${spellRoll.keptRoll} ${modifiers} = ${spellRoll.finalTotal}`
    : `${spellRoll.keptRoll}`;
  const criticalText = spellRoll.isCritical ? " — Critical Hit!" : "";
  const strengthText = spellRoll.strengthBonus > 0
    ? ` +${spellRoll.strengthBonus} Strength`
    : "";
  const flavorText = spellRoll.criticalFlavor
    ? ` ${spellRoll.criticalFlavor}`
    : "";

  if (spellRoll.moonlightRolls.length === 2) {
    const alignmentText = spellRoll.alignmentDamage > 0
      ? ` | Lunar Alignment: +${spellRoll.alignmentDamage}` : "";
    return `${tier.displayName}! Moonbeam rolls ${spellRoll.rolls[0]}/${spellRoll.rolls[1]}, ` +
      `keeps ${rollCalculation}${criticalText} — ${spellRoll.baseDamage} base` +
      ` | Moonlight Rolls: ${spellRoll.moonlightRolls[0]} and ${spellRoll.moonlightRolls[1]}` +
      ` | Moonlight Bonus: +${spellRoll.bonusDamage}${alignmentText}` +
      `${strengthText} = ${spellRoll.damage} dmg.${flavorText}`;
  }

  return `${tier.displayName}! Moonbeam rolls ${spellRoll.rolls[0]}/${spellRoll.rolls[1]}, ` +
    `keeps ${rollCalculation}${criticalText} — ${spellRoll.baseDamage} base ` +
    `+${spellRoll.bonusDamage} moonlight${strengthText} = ${spellRoll.damage} dmg.` +
    flavorText;
}

async function performEat(
  env,
  backpackKey,
  displayName,
  itemInput = "",
  platform = "twitch",
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performEatUnlocked(
      env,
      backpackKey,
      displayName,
      itemInput,
      platform,
    ),
  );
}

async function performEatUnlocked(
  env,
  backpackKey,
  displayName,
  itemInput,
  platform,
) {
  const normalizedItem = String(itemInput || "").trim().toLowerCase();

  if (normalizedItem && normalizedItem !== "berry") {
    return {
      message:
        `${displayName}, use ${normalizedItem.startsWith("/")
          ? "/eat berry"
          : "the Berry option"} to eat a Berry.`,
    };
  }

  const combatState = await getCombatState(env, backpackKey);
  const latestProgress = await getPlayerProgress(env, backpackKey);
  const adventureRun = await getActiveAdventure(env, backpackKey);
  const activeAdventure = combatState ? null : adventureRun;
  const currentHp =
    combatState?.playerHp ??
    activeAdventure?.playerHp ??
    latestProgress.hp;

  const berriesEaten = adventureRun?.berriesEaten ?? 0;
  if (adventureRun && berriesEaten >= 4) {
    return { message: "You've already eaten 4 berries during this adventure. You'll have to save the rest for later." };
  }
  if (combatState?.wanderingBattle?.berryUses >= BATTLE_BERRY_LIMIT) {
    return { message: "You've already eaten 2 berries during this battle. You'll have to save the rest for later." };
  }

  if (latestProgress.berries < 1) {
    const message = `${displayName}, you do not have any Berries to eat.`;
    return {
      message: combatState && platform === "discord"
        ? appendDiscordCombatHud(message, combatState, latestProgress)
        : message,
    };
  }

  const resourceCaps = getPlayerResourceCaps(latestProgress);
  const hpLimit = resourceCaps.hp;
  const manaLimit = resourceCaps.mana;
  const healedAmount = Math.max(
    0,
    Math.min(
      BERRY_HEAL_AMOUNT,
      hpLimit - currentHp,
    ),
  );
  const restoredMana = Math.max(
    0,
    Math.min(
      BERRY_MANA_AMOUNT,
      manaLimit - latestProgress.mana,
    ),
  );

  if (healedAmount === 0 && restoredMana === 0) {
    const message = "You're already feeling great. Better save that Berry for later!";
    return {
      message: combatState && platform === "discord"
        ? appendDiscordCombatHud(message, combatState, latestProgress)
        : message,
    };
  }

  const updatedHp = currentHp + healedAmount;
  const updatedMana = latestProgress.mana + restoredMana;
  const remainingBerries = Math.max(
    0,
    latestProgress.berries - 1,
  );
  const originalCombatState = combatState
    ? structuredClone(combatState)
    : null;
  const originalAdventureRun = adventureRun
    ? structuredClone(adventureRun)
    : null;

  if (combatState) {
    combatState.playerHp = updatedHp;
    combatState.playerMaxHp = resourceCaps.hp;
    recordRegionalManaRecovery(combatState, restoredMana);
  }

  if (activeAdventure) {
    activeAdventure.playerHp = updatedHp;
    activeAdventure.playerMaxHp = resourceCaps.hp;
    activeAdventure.updatedAt = Date.now();
  }

  if (adventureRun) adventureRun.berriesEaten = berriesEaten + 1;
  if (combatState?.wanderingBattle) combatState.wanderingBattle.berryUses++;

  try {
    if (combatState) {
      await saveCombatState(env, backpackKey, combatState);
    }

    if (adventureRun) {
      await saveActiveAdventure(env, backpackKey, adventureRun);
    }

    await savePlayerProgress(env, backpackKey, {
      ...latestProgress,
      berries: remainingBerries,
      hp: updatedHp,
      mana: updatedMana,
    });
  } catch (error) {
    try {
      await Promise.all([
        originalCombatState
          ? saveCombatState(env, backpackKey, originalCombatState)
          : Promise.resolve(),
        originalAdventureRun
          ? saveActiveAdventure(env, backpackKey, originalAdventureRun)
          : Promise.resolve(),
      ]);
    } catch (rollbackError) {
      console.error("Berry heal rollback failed:", rollbackError);
    }

    throw error;
  }

  if (isWishpocketCombat(combatState)) {
    const berryMessage = `${displayName} ate 1 Berry and restored ${healedAmount} HP and ` +
      `${restoredMana} Mana! Berries: ${remainingBerries.toLocaleString("en-US")}` +
      ` | Battle Berry Uses: ${combatState.wanderingBattle.berryUses}/${BATTLE_BERRY_LIMIT}`;
    return advanceWishpocketEscape(env, backpackKey, combatState,
      { ...latestProgress, berries: remainingBerries, hp: updatedHp, mana: updatedMana },
      platform, [berryMessage]);
  }

  return {
    healedAmount,
    restoredMana,
    berries: remainingBerries,
    playerHp: updatedHp,
    playerMaxHp: hpLimit,
    message: (combatState
      ? platform === "discord"
        ? appendDiscordCombatHud(
            `${displayName} ate 1 Berry and restored ${healedAmount} HP and ` +
            `${restoredMana} Mana! Berries: ${remainingBerries.toLocaleString("en-US")}`,
            combatState,
            { ...latestProgress, mana: updatedMana },
          )
        : `${displayName} ate 1 Berry and restored ${healedAmount} HP and ` +
          `${restoredMana} Mana! ` +
          `HP: ${updatedHp}/${hpLimit} | ` +
          `Mana: ${updatedMana}/${manaLimit} | ` +
          `Berries: ${remainingBerries.toLocaleString("en-US")}`
      : `${randomChoice(BERRY_OUTSIDE_COMBAT_MESSAGES)} | ` +
        `HP: ${updatedHp}/${hpLimit} | ` +
        `Mana: ${updatedMana}/${manaLimit} | ` +
        `Berries: ${remainingBerries.toLocaleString("en-US")}`) +
      (adventureRun ? ` | Adventure Berry Uses: ${adventureRun.berriesEaten}/4` : "") +
      (combatState?.wanderingBattle
        ? ` | Battle Berry Uses: ${combatState.wanderingBattle.berryUses}/${BATTLE_BERRY_LIMIT}` : "") +
      (combatState ? takeRegionalEnemyReceipts(combatState).map(line => ` | ${line}`).join("") : ""),
  };
}

async function resolveCombatVictory(
  env,
  backpackKey,
  combatState,
  playerRoll,
  playerDamage,
  platform = "twitch",
  playerActionMessage = null,
) {
  if (env[RUNTIME_DIAGNOSTICS]) env[RUNTIME_DIAGNOSTICS].stage = "combat.victory";
  let [currentTotal, progress] = await Promise.all([
    getBackpackTotal(env, backpackKey),
    getPlayerProgress(env, backpackKey),
  ]);
  let astralHarvestMessage = "";
  const activePerks = await getActivePerks(levelFromXp(progress.xp));
  const resourceCaps = getPlayerResourceCaps(progress);
  combatState.playerMaxHp = resourceCaps.hp;
  combatState.playerHp = Math.min(combatState.playerHp, resourceCaps.hp);
  const astralDefiance = activePerks.find(
    (perk) => perk.effect.trigger === "enemy-defeated-low-hp",
  );
  const defianceQualifies = Boolean(astralDefiance) &&
    combatState.playerHp <= resourceCaps.hp *
      astralDefiance.effect.hpThresholdPercent / 100;
  const astralReprieve = activePerks.find(
    (perk) => perk.effect.trigger === "enemy-defeated-without-stim",
  );
  const reprieveQualifies = Boolean(astralReprieve) &&
    (combatState.stimUses || 0) === 0;
  const astralHarvest = activePerks.find(
    (perk) => perk.effect.trigger === "enemy-defeated",
  );
  if (astralHarvest) {
    const hpGained = Math.min(
      astralHarvest.effect.hpRestore,
      Math.max(0, resourceCaps.hp - combatState.playerHp),
    );
    const manaGained = Math.min(
      astralHarvest.effect.manaRestore,
      Math.max(0, resourceCaps.mana - progress.mana),
    );
    combatState.playerHp += hpGained;
    progress = {
      ...progress,
      mana: progress.mana + manaGained,
    };
    const gains = [
      ...(hpGained > 0 ? [`+${hpGained} HP`] : []),
      ...(manaGained > 0 ? [`+${manaGained} Mana`] : []),
    ];
    if (gains.length > 0) {
      astralHarvestMessage = hpGained > 0 && manaGained > 0
        ? astralHarvest.activationLine
            .replace("{hpGained}", String(hpGained))
            .replace("{manaGained}", String(manaGained))
        : `Harvest activates! You gain ${gains[0]}.`;
    }
  }
  let astralDefianceMessage = "";
  if (defianceQualifies) {
    combatState.playerHp = Math.min(
      resourceCaps.hp, combatState.playerHp + astralDefiance.effect.hpRestore,
    );
    progress = {
      ...progress,
      mana: restoreManaToNormalCap(
        progress.mana, astralDefiance.effect.manaRestore, resourceCaps.mana,
      ),
    };
    astralDefianceMessage = astralDefiance.activationLine;
  }
  let astralReprieveMessage = "";
  if (reprieveQualifies) {
    progress = {
      ...progress,
      mana: restoreManaToNormalCap(
        progress.mana, astralReprieve.effect.manaRestore, resourceCaps.mana,
      ),
    };
    astralReprieveMessage = astralReprieve.activationLine;
  }
  const wishpocket = isWishpocketCombat(combatState);
  const variant = combatState.wanderingBattle?.variant;
  const candyMultiplier = variant === "Frenzied" || variant === "Fae Touched"
    ? 1.10 : 1;
  const xpMultiplier = BATTLE_VARIANTS.includes(variant) ? 1.10 : 1;
  const wishXpRoll = wishpocket ? randomInteger(
    combatState.enemy.reward.xp.min, combatState.enemy.reward.xp.max) : null;
  const baseCandyReward = randomInteger(
    combatState.enemy.reward.candies.min,
    combatState.enemy.reward.candies.max,
  );
  const jackpot = wishpocket && Math.random() < WISHPOCKET_JACKPOT_CHANCE;
  const luckReward = applyLuckToCandyReward(
    wishpocket ? baseCandyReward * (jackpot ? 3 : 1)
      : Math.floor(baseCandyReward * candyMultiplier), progress);
  const candyReward = luckReward.total;
  const xpReward = wishpocket ? wishXpRoll : Math.floor(randomInteger(
    combatState.enemy.reward.xp.min,
    combatState.enemy.reward.xp.max,
  ) * xpMultiplier);
  const xpProgression = applyXpAndStatPointProgression(progress, xpReward);
  const startingLevel = xpProgression.startingLevel;
  const startingTitle = getTitleForLevel(startingLevel);
  const startingRegion = getRegionForLevel(startingLevel);
  const newTotal = currentTotal + candyReward;
  const newXp = xpProgression.progress.xp;
  const endingLevel = xpProgression.endingLevel;
  const endingTitle = getTitleForLevel(endingLevel);
  const endingRegion = getRegionForLevel(endingLevel);
  const adventureContext = combatState.adventureContext;
  const unlockResult =
    (!adventureContext && !combatState.wanderingBattle) || adventureContext?.isBoss
      ? await unlockNextEncounterAfterVictory(
          combatState,
          progress,
        )
      : null;
  const completedAdventureNumbers =
    adventureContext?.isBoss
      ? adventureContext.adventureNumber === 30
        ? Array.from({ length: 30 }, (_, index) => index + 1)
        : [adventureContext.adventureNumber]
      : [];
  const baseBerryChance = BERRY_DROP_CHANCE_BY_REGION[combatState.regionId] ?? 0;
  const combatBerryChance = Math.min(
    1,
    baseBerryChance + getLuckBerryChanceBonus(progress),
  );
  const foundCombatBerry = !wishpocket && combatBerryChance > 0 &&
    Math.random() < combatBerryChance;
  const updatedProgress = {
    ...xpProgression.progress,
    hp: combatState.playerHp,
    berries: progress.berries + (foundCombatBerry ? 1 : 0),
    ...(adventureContext?.isBoss
      ? {
          completedAdventures: {
            ...(progress.completedAdventures || {}),
            [combatState.regionId]: [
              ...new Set([
                ...(
                  progress.completedAdventures?.[
                    combatState.regionId
                  ] || []
                ),
                ...completedAdventureNumbers,
              ]),
            ].sort((left, right) => left - right),
          },
        }
      : {}),
    ...(unlockResult
      ? { combatProgress: unlockResult.combatProgress }
      : {}),
  };

  await Promise.all([
    saveBackpackTotal(env, backpackKey, newTotal),
    savePlayerProgress(env, backpackKey, updatedProgress),
  ]);
  await deleteCombatState(env, backpackKey);

  const messageParts = [
    ...(wishpocket ? [
      "The Wishpocket bursts open!",
      jackpot
        ? "Its sack was absolutely stuffed! Star Candies scatter everywhere."
        : "Its overstuffed sack tears apart, scattering Star Candies across the path.",
      `XP: +${xpReward}`,
      `Star Candies: +${candyReward}`,
      ...(jackpot ? ["Jackpot! 3x Star Candies"] : []),
    ] : [
      `${combatState.enemy.name} defeated!`,
      playerActionMessage || `You rolled ${playerRoll} for ${playerDamage} dmg`,
    ]),
    ...(astralHarvestMessage ? [astralHarvestMessage] : []),
    ...(astralDefianceMessage ? [astralDefianceMessage] : []),
    ...(astralReprieveMessage ? [astralReprieveMessage] : []),
    ...(platform === "discord"
      ? []
      : [`Mana: ${progress.mana}/${getPlayerResourceCaps(progress).mana}`]),
    ...(wishpocket ? [] : [`+${xpReward} XP`, `+${candyReward} Star Candies`]),
    ...(luckReward.bonus > 0
      ? [`Luck Bonus: +${luckReward.bonus} Star Candies`]
      : []),
    ...(foundCombatBerry
      ? [`Found 1 Berry! Berries: ${updatedProgress.berries}`]
      : []),
    `Backpack: ${newTotal}`,
  ];

  if (endingLevel > startingLevel) {
    messageParts.push(`Level Up: Level ${endingLevel}`);
    messageParts.push(formatStatPointAward(
      xpProgression.pointsEarned,
      xpProgression.progress.unspentStatPoints,
      platform,
    ));
    messageParts.push(...await formatLevelUpUnlocks(startingLevel, endingLevel));
  }

  if (endingTitle !== startingTitle) {
    messageParts.push(`New Title: ${endingTitle}`);
  }

  if (endingRegion.id !== startingRegion.id) {
    messageParts.push(`Region Unlocked: ${endingRegion.name}`);
    const advancement = classAdvancement(xpProgression.progress);
    if (advancement) messageParts.push(advancement);
  }

  if (unlockResult?.unlockedEncounter) {
    messageParts.push(
      `Adventure ${unlockResult.unlockedEncounter.number} — ` +
      `${unlockResult.unlockedEncounter.adventureName ||
        getAdventureName(
          unlockResult.unlockedEncounter.number,
          unlockResult.unlockedEncounter.name,
        )} is now unlocked. ` +
      `Recommended Level: ${unlockResult.unlockedEncounter.recommendedLevel}. ` +
      `Use ${platform === "discord" ? "/adventure" : "!adventure"} ` +
      `${unlockResult.unlockedEncounter.number} to select it.`,
    );
  }

  if (adventureContext) {
    const adventure = await getActiveAdventure(env, backpackKey);
    const definition = await getAdventureDefinition(
      combatState.regionId,
      adventureContext.adventureNumber,
    );

    if (adventureContext.isBoss) {
      await clearActiveAdventure(env, backpackKey);
      messageParts.push(
        `Adventure Complete — ${definition.name}`,
        definition.completionText,
      );
    } else if (adventure) {
      adventure.playerHp = combatState.playerHp;
      advanceAdventureState(
        definition,
        adventure,
        adventureContext.nextRoomId,
      );
      await saveActiveAdventure(env, backpackKey, adventure);
      messageParts.push(
        formatAdventureObjective(definition, adventure, platform),
      );
    }
  }

  return {
    won: true,
    candyReward,
    xpReward,
    total: newTotal,
    xp: newXp,
    message: platform === "discord"
      ? appendDiscordCombatHud(
          messageParts.map(part => part.replaceAll(" | ", "\n")).join("\n\n"),
          combatState,
          progress,
        )
      : messageParts.join(" | "),
  };
}

async function resolveCombatDefeat(
  env,
  backpackKey,
  combatState,
) {
  const [currentTotal, progress] = await Promise.all([
    getBackpackTotal(env, backpackKey),
    getPlayerProgress(env, backpackKey),
  ]);
  const candyLoss = Math.min(
    currentTotal,
    combatState.enemy.defeatCandyLoss,
  );
  const newTotal = currentTotal - candyLoss;

  await Promise.all([
    saveBackpackTotal(env, backpackKey, newTotal),
    savePlayerProgress(env, backpackKey, {
      ...progress,
      hp: combatState.wanderingBattle ? 0 : getPlayerMaxHp(progress),
    }),
  ]);
  await deleteCombatState(env, backpackKey);

  if (combatState.adventureContext) {
    const adventure = await getActiveAdventure(env, backpackKey);

    if (adventure) {
      adventure.playerHp = getPlayerMaxHp(progress);
      adventure.playerMaxHp = getPlayerResourceCaps(progress).hp;
      adventure.status = combatState.adventureContext.isBoss
        ? "awaiting-boss-confirmation"
        : "awaiting-direction";
      adventure.currentRoomId =
        combatState.adventureContext.isBoss
          ? "boss-antechamber"
          : combatState.adventureContext.roomId;
      adventure.updatedAt = Date.now();
      await saveActiveAdventure(env, backpackKey, adventure);
    }
  }

  return {
    won: false,
    candyLoss,
    total: newTotal,
    message:
      `${combatState.enemy.name} defeated you. ` +
      `You lost ${candyLoss} Star Candies. ` +
      `Backpack: ${newTotal} Star Candies`,
  };
}

async function performExplore(env, backpackKey, platform = "twitch") {
  return withPlayerMutationLock(
    backpackKey,
    () => performExploreUnlocked(env, backpackKey, platform),
  );
}

async function performExploreUnlocked(
  env,
  backpackKey,
  platform = "twitch",
) {
  if (await getCombatState(env, backpackKey)) {
    return {
      message:
        "You cannot explore while fighting an enemy in an Adventure. " +
        `Use ${platform === "discord" ? "/attack" : "!attack"} to continue fighting.`,
    };
  }

  const progress = await getPlayerProgress(
    env,
    backpackKey,
  );

  const startingXp = progress.xp;
  const startingLevel = levelFromXp(startingXp);
  const startingTitle = getTitleForLevel(startingLevel);
  const startingRegion =
    getRegionById(progress.currentRegion) ||
    REGIONS[0];
  const startingUnlockedRegion =
    getRegionForLevel(startingLevel);

  const logs = await loadRegionLogs(startingRegion);
  const log = selectWeightedExplore(logs);

  validateExploreLog(log);

  const minimumReward = Math.floor(
    Number(log.reward.min),
  );

  const maximumReward = Math.floor(
    Number(log.reward.max),
  );

  if (minimumReward > maximumReward) {
    throw new Error(
      "An exploration reward range is invalid.",
    );
  }

  const baseReward = randomInteger(
    minimumReward,
    maximumReward,
  );
  const luckReward = applyLuckToCandyReward(baseReward, progress);
  const reward = luckReward.total;

  const earnedXp = getExploreXp(
    log,
    minimumReward,
    maximumReward,
  );

  const currentTotal = await getBackpackTotal(
    env,
    backpackKey,
  );

  let newTotal = currentTotal + reward;
  const xpProgression = applyXpAndStatPointProgression(progress, earnedXp);
  const newXp = xpProgression.progress.xp;
  const endingLevel = xpProgression.endingLevel;
  const endingTitle = getTitleForLevel(endingLevel);
  const endingUnlockedRegion = getRegionForLevel(endingLevel);

  const encounterCode = String(
    log.code || "",
  ).trim();

  const updatedDiscoveries = addDiscovery(
    progress.discoveries,
    startingRegion.name,
    encounterCode,
  );

  const noteDrop = rollTravelNote(log);
  const updatedNotes = { ...progress.notes };
  let noteWasDuplicate = false;
  let discoveredNote = null;

  if (noteDrop) {
    noteWasDuplicate = updatedNotes[noteDrop] === true;

    if (noteWasDuplicate) {
      newTotal += DUPLICATE_NOTE_CANDY_BONUS;
    } else {
      updatedNotes[noteDrop] = true;

      try {
        const noteRegionId = getNoteRegionId(noteDrop);
        discoveredNote = await findRegionNote(
          noteRegionId,
          noteDrop,
        );
      } catch (error) {
        console.error("Travel Note lookup failed:", error);
      }
    }
  }

  const berryDropChance = BERRY_DROP_CHANCE_BY_REGION[startingRegion.id] ?? 0;

  if (!(startingRegion.id in BERRY_DROP_CHANCE_BY_REGION)) {
    console.warn(
      `No Berry drop chance configured for region: ${startingRegion.id}`,
    );
  }

  const foundBerry =
    berryDropChance > 0 &&
    Math.random() < berryDropChance;
  const updatedBerryCount = progress.berries + (foundBerry ? 1 : 0);

  await saveBackpackTotal(
    env,
    backpackKey,
    newTotal,
  );

  await savePlayerProgress(
    env,
    backpackKey,
    {
      ...xpProgression.progress,
      discoveries: updatedDiscoveries,
      notes: updatedNotes,
      currentRegion: startingRegion.id,
      berries: updatedBerryCount,
    },
  );

  const adventure = log.message.replaceAll(
    "{reward}",
    String(reward),
  );

  const levelProgress = getLevelProgress(
    newXp,
    endingLevel,
  );

  const messageLines = [
    adventure,
    `+${earnedXp} XP · Level ${endingLevel} · ` +
      `${levelProgress.current}/${levelProgress.required} XP`,
    `Backpack: ${newTotal} Star Candies`,
  ];
  if (luckReward.bonus > 0) {
    messageLines.push(`Luck Bonus: +${luckReward.bonus} Star Candies`);
  }

  if (endingLevel > startingLevel) {
    messageLines.push(
      `LEVEL UP! You reached Level ${endingLevel}!`,
    );
    messageLines.push(formatStatPointAward(
      xpProgression.pointsEarned,
      xpProgression.progress.unspentStatPoints,
      platform,
    ));
    messageLines.push(...await formatLevelUpUnlocks(startingLevel, endingLevel));
  }

  if (endingTitle !== startingTitle) {
    messageLines.push(
      `Title Earned: ${endingTitle}`,
    );
  }

  if (endingUnlockedRegion.name !== startingUnlockedRegion.name) {
    messageLines.push(
      `Region Unlocked: ${endingUnlockedRegion.name}`,
    );
    const advancement = classAdvancement(xpProgression.progress);
    if (advancement) messageLines.push(advancement);
  }

  if (foundBerry) {
    messageLines.push(
      `Found 1 Berry! Berries: ${updatedBerryCount.toLocaleString("en-US")}`,
    );
  }

  if (noteDrop && noteWasDuplicate) {
    messageLines.push(
      `Duplicate Travel Note: +${DUPLICATE_NOTE_CANDY_BONUS} bonus Star Candies.`,
    );
  } else if (noteDrop) {
    const noteRegionId = getNoteRegionId(noteDrop);
    const noteRegion = getRegionById(noteRegionId);
    const noteNumber = getNoteNumber(noteDrop);
    messageLines.push(discoveredNote
      ? `Travel Note Discovered — ${noteRegion?.name || noteRegionId} #${noteNumber}: ${discoveredNote.title}\n\n${discoveredNote.text}`
      : `Travel Note discovered: ${noteRegion?.name || noteRegionId} #${noteNumber}.`);
  }

  return {
    reward,
    earnedXp,
    xp: newXp,
    level: endingLevel,
    title: endingTitle,
    region: startingRegion.name,
    note: noteDrop,
    berry: foundBerry,
    berries: updatedBerryCount,
    total: newTotal,
    message: messageLines.join(platform === "discord" ? "\n\n" : " | "),
  };
}

async function performDaily(env, backpackKey) {
  const currentTotal = await getBackpackTotal(
    env,
    backpackKey,
  );

  const newTotal = currentTotal + DAILY_REWARD;

  await saveBackpackTotal(
    env,
    backpackKey,
    newTotal,
  );

  const blessing =
    DAILY_BLESSINGS[
      randomInteger(0, DAILY_BLESSINGS.length - 1)
    ];

  return {
    reward: DAILY_REWARD,
    total: newTotal,
    message:
      `${blessing} ` +
      `+${DAILY_REWARD} Star Candies. ` +
      `Backpack: ${newTotal} Star Candies`,
  };
}

async function performGamble(
  env,
  backpackKey,
  amountValue,
  displayName,
) {
  const currentTotal = await getBackpackTotal(
    env,
    backpackKey,
  );

  if (currentTotal <= 0) {
    return {
      total: 0,
      message:
        "You do not have any Star Candies to gamble. " +
        "Backpack: 0 Star Candies",
    };
  }

  const wager = Number(amountValue);

  if (!Number.isSafeInteger(wager) || wager <= 0) {
    return {
      total: currentTotal,
      message:
        "Enter a valid whole-number amount. " +
        "Use !gamble <amount> on Twitch or /gamble amount:<amount> on Discord.",
    };
  }

  if (wager > currentTotal) {
    return {
      total: currentTotal,
      message:
        `You only have ${formatCandyAmount(currentTotal)}. ` +
        "Choose a smaller gamble. " +
        `Backpack: ${formatCandyAmount(currentTotal)}`,
    };
  }

  const won = Math.random() < 0.5;
  const newTotal = won
    ? currentTotal + wager
    : currentTotal - wager;

  await saveBackpackTotal(
    env,
    backpackKey,
    newTotal,
  );

  if (won) {
    return {
      won: true,
      wager,
      total: newTotal,
      message:
        `${displayName} won ${formatCandyAmount(wager)} in roulette ` +
        `and now has ${formatCandyAmount(newTotal)}! FeelsGoodMan`,
    };
  }

  return {
    won: false,
    wager,
    total: newTotal,
    message:
      `${displayName} lost ${formatCandyAmount(wager)} in roulette ` +
      `and now has ${formatCandyAmount(newTotal)}! FeelsBadMan`,
  };
}

async function getTipJarState(env) {
  const stored = await env.Backpack.get(TIP_JAR_STATE_KEY);
  if (stored === null) return { total: 0, cooldownUntil: 0 };
  let state;
  try { state = JSON.parse(stored); } catch { throw new Error("Tip Jar state is unavailable."); }
  if (!state || !Number.isSafeInteger(state.total) || state.total < 0 ||
      !Number.isSafeInteger(state.cooldownUntil) || state.cooldownUntil < 0) {
    throw new Error("Tip Jar state is unavailable.");
  }
  return state;
}

async function performTipJar(env, backpackKey, amountInput) {
  const raw = amountInput === null || amountInput === undefined
    ? "" : String(amountInput).trim();
  if (/^-\d+$/.test(raw) || raw === "0") {
    return { message: "Enter a whole number of at least 1 Star Candy." };
  }
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    return { message: "Enter a valid whole number of Star Candies." };
  }
  const amount = Number(raw);
  if (amount < 1) return { message: "Enter a whole number of at least 1 Star Candy." };
  const playerTotal = await getBackpackTotal(env, backpackKey);
  if (!Number.isSafeInteger(playerTotal) || playerTotal < 0) {
    return { message: "Your Star Candy balance is unavailable right now." };
  }
  if (amount > playerTotal) {
    return { message: "You do not have enough Star Candies to tip that amount." };
  }
  const jar = await getTipJarState(env);
  const now = Date.now();
  if (jar.cooldownUntil > now) {
    return { message: "The mustached shopkeeper puts a hand over the jar.\n\n" +
      '"One customer at a time. This is a highly professional establishment."\n\n' +
      "The Tip Jar is busy. Try again in a few seconds." };
  }
  const newTotal = jar.total + amount;
  if (!Number.isSafeInteger(newTotal)) {
    return { message: "The Tip Jar cannot accept that amount right now." };
  }
  // Player deduction is staged first. KV cannot atomically commit this and the
  // shared jar key, so a partial physical flush remains possible.
  await saveBackpackTotal(env, backpackKey, playerTotal - amount);
  await env.Backpack.put(TIP_JAR_STATE_KEY, JSON.stringify({
    total: newTotal, cooldownUntil: now + TIP_JAR_COOLDOWN_MS,
  }));
  const flavor = randomChoice(TIP_JAR_FLAVOR);
  const formattedAmount = amount.toLocaleString("en-US");
  return { total: newTotal, message:
    `You drop ${formattedAmount} Star Candies into the Tip Jar.\n\n` +
    "The mustached shopkeeper carefully counts them.\n\n" +
    `"${flavor}"\n\n` +
    `You tipped ${formattedAmount} Star Candies.\n` +
    `Tip Jar: ${newTotal.toLocaleString("en-US")} Star Candies` };
}

async function performShop(
  env,
  backpackKey,
  sharedIdentity,
  platform = "twitch",
) {
  const [currentTotal, progress] = await Promise.all([
    getBackpackTotal(env, backpackKey),
    getPlayerProgress(env, backpackKey),
    touchShopSession(env, sharedIdentity),
  ]);
  let tipJarLine;
  try {
    const jar = await getTipJarState(env);
    tipJarLine = `Tip Jar: ${jar.total.toLocaleString("en-US")} Star Candies`;
  } catch {
    tipJarLine = "Tip Jar: temporarily unavailable";
  }
  const introduction = randomChoice(SHOP_INTRODUCTIONS);
  const discordItemLines = Object.values(SHOP_ITEMS).map(
    (item) =>
      `${item.displayName}\n${item.description}\n` +
      `${item.price.toLocaleString("en-US")} ${item.currency}` +
      (item.permanent ? ` · ${progress.equippedWeapon === item.id ? "Equipped" : progress.ownedWeapons.includes(item.id) ? "Owned" : "Permanent"}` : " · Consumable"),
  );
  const twitchItemLines = Object.values(SHOP_ITEMS).map(
    (item) =>
      `${item.displayName} — ${item.price.toLocaleString("en-US")} ` +
      `${item.currency}${item.permanent ? ` (${progress.equippedWeapon === item.id ? "Equipped" : progress.ownedWeapons.includes(item.id) ? "Owned" : "Permanent"})` : " each"}`,
  );

  return {
    total: currentTotal,
    message: platform === "discord"
      ? `${introduction.scene}\n\n${introduction.quote}\n\n` +
        `Items for Sale\n\n${discordItemLines.join("\n\n")}\n\n` +
        (progress.classSystemUnlocked ? "Shop Service\n\nClass Change\nChange your specialization to another owned weapon's class.\n50,000 Star Candies\n\n" : "") +
        `Tip Jar\n\nA definitely ordinary shopkeeper with a suspicious mustache guards a glass jar.\n${tipJarLine}\n\n` +
        `Your Star Candies: ${currentTotal.toLocaleString("en-US")}\n\n` +
        "Use /buy to purchase a tip or item."
      : `${introduction.scene} ${introduction.quote} | ` +
        `${twitchItemLines.join(" | ")} | ` +
        (progress.classSystemUnlocked ? "Class Change — 50,000 Star Candies (Discord /buy) | " : "") +
        `${tipJarLine} | Balance: ${currentTotal.toLocaleString("en-US")} | ` +
        "Buy: !buy berry [quantity]",
  };
}

function formatShopItemQuantity(item, quantity) {
  return `${quantity.toLocaleString("en-US")} ` +
    `${quantity === 1 ? item.displayName : item.inventoryLabel}`;
}

function getLargePurchaseReaction(quantity) {
  return SHOP_LARGE_PURCHASE_REACTIONS.find(
    (reaction) => quantity >= reaction.minimumQuantity,
  )?.message || "";
}

async function performBuy(
  env,
  backpackKey,
  itemInput,
  quantityInput,
  sharedIdentity,
  platform = "twitch",
  classInput = null,
  amountInput = null,
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performBuyUnlocked(
      env,
      backpackKey,
      itemInput,
      quantityInput,
      sharedIdentity,
      platform,
      classInput,
      amountInput,
    ),
  );
}

async function performBuyUnlocked(
  env,
  backpackKey,
  itemInput,
  quantityInput,
  sharedIdentity,
  platform,
  classInput,
  amountInput,
) {
  const shopCommand = platform === "discord" ? "/shop" : "!shop";

  if (!(await hasActiveShopSession(env, sharedIdentity))) {
    return {
      message: randomChoice(SHOP_OUTSIDE_MESSAGES)(shopCommand),
    };
  }

  await touchShopSession(env, sharedIdentity);

  const itemId = String(itemInput || "").trim().toLowerCase().replace(/\s+/g, "-");
  const availableItems = Object.values(SHOP_ITEMS);
  const availableSummary = availableItems.map(
    (item) =>
      `${item.displayName} — ` +
      `${item.price.toLocaleString("en-US")} ${item.currency}`,
  ).join(" | ");

  if (itemId === "tip-jar") {
    if (platform === "discord" && quantityInput !== null &&
        quantityInput !== undefined && quantityInput !== "") {
      return { message: "Use amount, not quantity, for the Tip Jar." };
    }
    return performTipJar(env, backpackKey,
      platform === "discord" ? amountInput : quantityInput);
  }

  if (!itemId) {
    return {
      message:
        `What are you buying? Currently available: ${availableSummary}`,
    };
  }

  const quantity = quantityInput === null ||
      quantityInput === undefined ||
      quantityInput === ""
    ? 1
    : Number(quantityInput);

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    return {
      message:
        "The hooded merchant stares at the requested quantity and slowly " +
        "turns the price list right-side up. " +
        "\"Choose a whole number between 1 and 99.\"",
    };
  }

  const item = SHOP_ITEMS[itemId];

  if (itemId === "class-change") {
    if (quantityInput !== null && quantityInput !== undefined && quantityInput !== "") {
      return { message: "Class Change is a single service. Leave quantity empty." };
    }
    return performClassChangeUnlocked(env, backpackKey, classInput);
  }

  if (!item) {
    return {
      message:
        "The hooded merchant searches beneath the counter, inside her " +
        "sleeves, and behind a suspiciously shaped rock. " +
        "\"I don't sell that. Yet.\" | " +
        `Currently available: ${availableSummary}`,
    };
  }

  const [currentTotal, progress] = await Promise.all([
    getBackpackTotal(env, backpackKey),
    getPlayerProgress(env, backpackKey),
  ]);

  if (item.permanent) {
    if (quantityInput !== null && quantityInput !== undefined && quantityInput !== "") {
      return { message: "Weapons are permanent single purchases. Leave quantity empty." };
    }
    if (await getCombatState(env, backpackKey)) {
      return { message: "Finish the current fight before buying a weapon." };
    }
    if (progress.ownedWeapons.includes(item.id)) {
      return { message: `You already own ${item.displayName}. Use /equip to wield it.` };
    }
    if (currentTotal < item.price) {
      const shortfall = item.price - currentTotal;
      return { total: currentTotal, shortfall,
        message: `${randomChoice(SHOP_INSUFFICIENT_MESSAGES.slice(0, 3))(shortfall.toLocaleString("en-US"))} ` +
          `Price: ${item.price.toLocaleString("en-US")} Star Candies. ` +
          `Your Star Candies: ${currentTotal.toLocaleString("en-US")}.` };
    }
    const newTotal = currentTotal - item.price;
    const equippedWeapon = progress.equippedWeapon || item.id;
    const firstClass = !progress.activeClass && progress.ownedWeapons.length === 0;
    const updatedProgress = { ...progress, ownedWeapons: [...progress.ownedWeapons, item.id], equippedWeapon,
      classSystemUnlocked: true, activeClass: firstClass ? item.id : progress.activeClass };
    await saveBackpackTotal(env, backpackKey, newTotal);
    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
    } catch (error) {
      try { await saveBackpackTotal(env, backpackKey, currentTotal); }
      catch (rollbackError) { console.error("Weapon purchase rollback failed:", rollbackError); }
      throw error;
    }
    return { itemId: item.id, totalPrice: item.price, total: newTotal,
      message: `${item.reaction}\n\nPurchased ${item.displayName} for 20,000 Star Candies. ` +
        `You now own it.${equippedWeapon === item.id ? " Equipped automatically." : " Use /equip to wield it."} ` +
        `Star Candies remaining: ${newTotal.toLocaleString("en-US")}.` +
        (firstClass ? `\n\nClass Unlocked — ${classTitle(updatedProgress)}\nYour ${CLASS_DATA[item.id].name} specialization has begun.\n${classBonusDescription(item.id, classTier(updatedProgress))}\n\nNew Shop Service Unlocked — Class Change\nYou may change your specialization for 50,000 Star Candies.` : "") };
  }

  const totalPrice = item.price * quantity;

  if (!Number.isSafeInteger(totalPrice) || totalPrice < 0) {
    throw new Error("Shop purchase total is outside the safe integer range.");
  }

  if (currentTotal < totalPrice) {
    const shortfall = totalPrice - currentTotal;
    const insufficientMessage = randomChoice(
      SHOP_INSUFFICIENT_MESSAGES,
    )(shortfall.toLocaleString("en-US"));

    return {
      total: currentTotal,
      shortfall,
      message:
        "The hooded merchant counts your Star Candies twice, then slowly " +
        `pulls ${formatShopItemQuantity(item, quantity)} back. ` +
        `${insufficientMessage} | ` +
        `Requested: ${formatShopItemQuantity(item, quantity)} | ` +
        `Total Price: ${totalPrice.toLocaleString("en-US")} ` +
        `${item.currency} | ` +
        `Your Star Candies: ${currentTotal.toLocaleString("en-US")}`,
    };
  }

  const currentItemTotal = Math.max(
    0,
    Math.floor(Number(progress[item.inventoryField]) || 0),
  );
  const purchasedItemCount = item.purchaseQuantity * quantity;
  const newTotal = currentTotal - totalPrice;
  const newItemTotal = currentItemTotal + purchasedItemCount;
  const updatedProgress = {
    ...progress,
    [item.inventoryField]: newItemTotal,
  };

  await saveBackpackTotal(env, backpackKey, newTotal);

  try {
    await savePlayerProgress(env, backpackKey, updatedProgress);
  } catch (error) {
    try {
      await saveBackpackTotal(env, backpackKey, currentTotal);
    } catch (rollbackError) {
      console.error("Shop purchase rollback failed:", rollbackError);
    }

    throw error;
  }

  const largePurchaseReaction = getLargePurchaseReaction(
    purchasedItemCount,
  );
  const purchaseMessage = largePurchaseReaction ||
    randomChoice(SHOP_PURCHASE_MESSAGES);
  const quantityMessage = !largePurchaseReaction && quantity > 1
    ? randomChoice(SHOP_QUANTITY_MESSAGES)
    : "";
  const purchasedLabel = formatShopItemQuantity(
    item,
    purchasedItemCount,
  );

  return {
    itemId: item.id,
    quantity: purchasedItemCount,
    totalPrice,
    total: newTotal,
    itemTotal: newItemTotal,
    message: platform === "discord"
      ? `The hooded merchant accepts your Star Candies and hands you ` +
        `${purchasedLabel}.\n\n` +
        `${quantityMessage ? `${quantityMessage}\n\n` : ""}` +
        `${purchaseMessage}\n\n` +
        `Purchased: ${purchasedLabel}\n` +
        `Total Cost: ${totalPrice.toLocaleString("en-US")} ` +
        `${item.currency}\n` +
        `Star Candies Remaining: ${newTotal.toLocaleString("en-US")}\n` +
        `${item.inventoryLabel}: ` +
        `${newItemTotal.toLocaleString("en-US")}`
      : `Purchased ${purchasedLabel} for ` +
        `${totalPrice.toLocaleString("en-US")} ${item.currency}. ` +
        `${quantityMessage ? `${quantityMessage} ` : ""}` +
        `${purchaseMessage} Star Candies: ` +
        `${newTotal.toLocaleString("en-US")} | ` +
        `${item.inventoryLabel}: ` +
        `${newItemTotal.toLocaleString("en-US")}`,
  };
}

async function performClassChangeUnlocked(env, backpackKey, classInput) {
  if (await getCombatState(env, backpackKey)) {
    return { message: "Finish the current fight before changing classes." };
  }
  const progress = await getPlayerProgress(env, backpackKey);
  if (!progress.classSystemUnlocked) return { message: "Purchase a weapon to unlock Class Change." };
  const target = WEAPON_IDS.find(id => id === String(classInput || "").trim().toLowerCase() ||
    CLASS_DATA[id].name.toLowerCase() === String(classInput || "").trim().toLowerCase());
  if (!target) return { message: "Choose a class you have unlocked using the class option." };
  if (!progress.ownedWeapons.includes(target)) return { message: `You do not own the ${SHOP_ITEMS[target].displayName} needed for ${CLASS_DATA[target].name}.` };
  if (!progress.activeClass) {
    const initialized = { ...progress, activeClass: target, equippedWeapon: target, classSystemUnlocked: true };
    await savePlayerProgress(env, backpackKey, initialized);
    return { totalPrice: 0, message: `Class Unlocked — ${classTitle(initialized)}\nYour ${CLASS_DATA[target].name} specialization has begun.\n${SHOP_ITEMS[target].displayName} equipped.\n${classBonusDescription(target, classTier(initialized))}` };
  }
  if (progress.activeClass === target) return { message: `You are already a ${CLASS_DATA[target].name}. No Star Candies were spent.` };
  const currentTotal = await getBackpackTotal(env, backpackKey);
  if (currentTotal < CLASS_CHANGE_PRICE) {
    const shortfall = CLASS_CHANGE_PRICE - currentTotal;
    return { message: `${randomChoice(SHOP_INSUFFICIENT_MESSAGES.slice(0, 3))(shortfall.toLocaleString("en-US"))} Price: 50,000 Star Candies. Your Star Candies: ${currentTotal.toLocaleString("en-US")}.` };
  }
  const newTotal = currentTotal - CLASS_CHANGE_PRICE;
  const updatedProgress = { ...progress, activeClass: target, equippedWeapon: target };
  await saveBackpackTotal(env, backpackKey, newTotal);
  try { await savePlayerProgress(env, backpackKey, updatedProgress); }
  catch (error) {
    try { await saveBackpackTotal(env, backpackKey, currentTotal); }
    catch (rollbackError) { console.error("Class Change rollback failed:", rollbackError); }
    throw error;
  }
  return { totalPrice: CLASS_CHANGE_PRICE, total: newTotal,
    message: `"The hooded merchant nods as though she expected this."\n\nClass Changed — ${classTitle(updatedProgress)}\nYou've changed your specialization to ${CLASS_DATA[target].name}.\n${SHOP_ITEMS[target].displayName} equipped.\nYour specialization is synchronized to ${getRegionForLevel(levelFromXp(progress.xp)).name}.\n${classBonusDescription(target, classTier(updatedProgress))}` };
}

async function performEquip(env, backpackKey, weaponInput) {
  return withPlayerMutationLock(backpackKey, async () => {
    const weaponId = String(weaponInput || "").trim().toLowerCase();
    const item = SHOP_ITEMS[weaponId];
    if (!item?.permanent) return { message: "Choose a weapon from /equip." };
    if (await getCombatState(env, backpackKey)) {
      return { message: "Finish the current fight before changing weapons." };
    }
    const progress = await getPlayerProgress(env, backpackKey);
    if (!progress.ownedWeapons.includes(weaponId)) {
      return { message: `You do not own ${item.displayName}. Visit /shop to buy it.` };
    }
    if (progress.equippedWeapon !== weaponId) {
      await savePlayerProgress(env, backpackKey, { ...progress, equippedWeapon: weaponId });
    }
    return { message: `You've equipped your ${item.displayName}.\n\n${item.equipFlavor}` };
  });
}

async function performRest(
  env,
  backpackKey,
  sharedIdentity,
  restInput = "",
  platform = "twitch",
) {
  const normalizedInput = String(restInput || "").trim().toLowerCase();
  const restType =
    normalizedInput === "long"
      ? "long"
      : normalizedInput === "short" ||
          (platform === "twitch" && normalizedInput === "")
        ? "short"
        : "";

  if (!restType) {
    return {
      message: platform === "discord"
        ? "Choose /rest short or /rest long."
        : "Choose how you want to rest: !rest for a Short Rest or !rest long for a Long Rest.",
    };
  }

  return withPlayerMutationLock(
    backpackKey,
    () => performRestUnlocked(
      env,
      backpackKey,
      sharedIdentity,
      restType,
      platform,
    ),
  );
}

async function performRestUnlocked(
  env,
  backpackKey,
  sharedIdentity,
  restType,
  platform,
) {
  if (await getCombatState(env, backpackKey)) {
    return { message: "You cannot rest while in combat." };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const sharedCooldownAt = await getSharedRestCooldown(
    env,
    sharedIdentity,
    restType,
  );
  const savedCooldownAt = restType === "long"
    ? progress.lastLongRestAt
    : progress.lastRestAt;
  const cooldownMs = restType === "long"
    ? LONG_REST_COOLDOWN_MS
    : SHORT_REST_COOLDOWN_MS;
  const lastRestAt = Math.max(
    savedCooldownAt,
    sharedCooldownAt,
  );
  const remainingMs = cooldownMs - (Date.now() - lastRestAt);

  if (remainingMs > 0) {
    const remaining = formatDetailedDuration(remainingMs);

    return {
      message: restType === "long"
        ? platform === "discord"
          ? randomChoice(LONG_REST_COOLDOWN_SCENES)(remaining)
          : `You are still far too rested for another Long Rest. Available in: ${remaining}`
        : `You're still feeling refreshed. You can Rest again in ` +
          `${formatRemainingDuration(remainingMs)}.`,
    };
  }

  const combatState = await getCombatState(env, backpackKey);
  const activeAdventure = await getActiveAdventure(env, backpackKey);

  if (restType === "long" && activeAdventure) {
    const message =
      "You cannot begin a Long Rest during an active Adventure or fight. " +
      `Finish it before using ${platform === "discord"
        ? "/rest long"
        : "!rest long"}.`;
    return {
      message: combatState && platform === "discord"
        ? appendDiscordCombatHud(message, combatState, progress)
        : message,
    };
  }

  const now = Date.now();
  const currentHp =
    combatState?.playerHp ??
    activeAdventure?.playerHp ??
    progress.hp;
  const restBufferType = restType === "long" ? "long" : "short";
  const restProgress = { ...progress, restBufferType };
  const resourceCaps = getPlayerResourceCaps(restProgress);
  const updatedHp = Math.max(currentHp, resourceCaps.hp);
  const updatedMana = Math.max(progress.mana, resourceCaps.mana);
  const updatedProgress = {
    ...progress,
    hp: updatedHp,
    mana: updatedMana,
    restBufferType,
    temporaryResourceCap: Math.max(resourceCaps.hp, resourceCaps.mana),
    lastRestAt: now,
    ...(restType === "long" ? { lastLongRestAt: now } : {}),
  };

  if (combatState) {
    combatState.playerHp = updatedHp;
    combatState.playerMaxHp = resourceCaps.hp;
    combatState.updatedAt = Math.floor(now / 1000);
  }

  if (activeAdventure) {
    activeAdventure.playerHp = updatedHp;
    activeAdventure.playerMaxHp = resourceCaps.hp;
    activeAdventure.updatedAt = now;
  }

  await Promise.all([
    savePlayerProgress(env, backpackKey, updatedProgress),
    combatState
      ? saveCombatState(env, backpackKey, combatState)
      : Promise.resolve(),
    activeAdventure
      ? saveActiveAdventure(env, backpackKey, activeAdventure)
      : Promise.resolve(),
    saveSharedRestCooldown(env, sharedIdentity, now, "short"),
    restType === "long"
      ? saveSharedRestCooldown(env, sharedIdentity, now, "long")
      : Promise.resolve(),
  ]);

  if (restType === "short") {
    const message =
      "You take a peaceful rest beneath the moonlight. Your Health and Mana " +
      "have been restored, and you feel refreshed!" +
      (combatState && platform === "discord"
        ? ""
        : ` | HP: ${updatedHp}/${resourceCaps.hp} | ` +
          `Mana: ${updatedMana}/${resourceCaps.mana}`);
    return {
      hp: updatedHp,
      mana: updatedMana,
      message: combatState && platform === "discord"
        ? appendDiscordCombatHud(
            message,
            combatState,
            updatedProgress,
          )
        : message,
    };
  }

  const encounterTriggered = Math.random() < LONG_REST_ENCOUNTER_CHANCE;
  const longRestScene = randomChoice(LONG_REST_SCENES);
  const peacefulMessage = platform === "discord"
    ? `${longRestScene}\n\n**Long Rest Complete**\n\n` +
      `HP: ${updatedHp}/${resourceCaps.hp}\n` +
      `Mana: ${updatedMana}/${resourceCaps.mana}\n\n` +
      "You may take another Long Rest in 1 hour."
    : "Long Rest complete! You awaken thoroughly rested—and perhaps " +
      `slightly overprepared. HP: ${updatedHp}/${resourceCaps.hp} | ` +
      `Mana: ${updatedMana}/${resourceCaps.mana} | Long Rest cooldown: 1h`;

  if (!encounterTriggered) {
    return {
      hp: updatedHp,
      mana: updatedMana,
      encounter: null,
      message: peacefulMessage,
    };
  }

  try {
    const encounter = await startLongRestEncounter(
      env,
      backpackKey,
      updatedProgress,
      platform,
    );

    if (encounter) {
      const transition = platform === "discord"
        ? randomChoice(LONG_REST_ENCOUNTER_TRANSITIONS)(
            encounter.enemy.name,
          )
        : `Your peaceful morning is interrupted by a ` +
          `${encounter.enemy.name}. Combat begins!`;

      return {
        hp: updatedHp,
        mana: updatedMana,
        encounter: encounter.enemy.id,
        message:
          `${peacefulMessage}${platform === "discord" ? "\n\n" : " | "}` +
          `${transition}${platform === "discord" ? "\n\n" : " | "}` +
          encounter.message,
      };
    }
  } catch (error) {
    console.error("Long Rest encounter initialization failed:", error);
  }

  return {
    hp: updatedHp,
    mana: updatedMana,
    encounter: null,
    message: peacefulMessage,
  };
}

async function performStats(
  env,
  backpackKey,
  sharedIdentity = "",
  platform = "twitch",
) {
  return withPlayerMutationLock(backpackKey, async () => {
    const progress = await getPlayerProgress(env, backpackKey);
    const [combatState, activeAdventure, shortAt, longAt] = await Promise.all([
      getCombatState(env, backpackKey),
      getActiveAdventure(env, backpackKey),
      getSharedRestCooldown(env, sharedIdentity, "short"),
      getSharedRestCooldown(env, sharedIdentity, "long"),
    ]);
    const currentHp = combatState?.playerHp ?? activeAdventure?.playerHp ?? progress.hp;
    const level = levelFromXp(progress.xp);
    const nextLevelXp = totalXpForLevel(level + 1);
    const stats = normalizePlayerStats(progress.stats);
    const caps = getPlayerResourceCaps(progress);
    const activeEffects = formatActiveEffects(progress, platform);
    const now = Date.now();
    const shortRemaining = SHORT_REST_COOLDOWN_MS - (now - Math.max(progress.lastRestAt, shortAt));
    const longRemaining = LONG_REST_COOLDOWN_MS - (now - Math.max(progress.lastLongRestAt, longAt));
    const shortStatus = shortRemaining > 0 ? formatDetailedDuration(shortRemaining) : "Ready";
    const longStatus = longRemaining > 0 ? formatDetailedDuration(longRemaining) : "Ready";
    const buffer = progress.restBufferType === "long"
      ? "Long Rested"
      : progress.restBufferType === "short"
        ? "Rested"
        : "Not Rested";
    const specialization = progress.classSystemUnlocked && progress.activeClass
      ? classTitle(progress) || "None"
      : "None";
    const equippedWeapon = SHOP_ITEMS[progress.equippedWeapon]?.permanent
      ? SHOP_ITEMS[progress.equippedWeapon].displayName
      : "None";

    if (platform !== "discord") {
      return {
        message: `Level ${level} | XP ${progress.xp} | Title: ${getTitleForLevel(level)} | ` +
          `Specialization: ${specialization} | Equipped Weapon: ${equippedWeapon} | ` +
          `Next: ${nextLevelXp - progress.xp} XP | Points: ${progress.unspentStatPoints} | ` +
          `HP ${currentHp}/${getPlayerMaxHp(progress)} | Mana ${progress.mana}/${getPlayerMaxMana(progress)} | ` +
          `Vitality ${stats.vitality} | Focus ${stats.focus} | Strength ${stats.strength} | ` +
          `Luck ${stats.luck} | Armor ${stats.armor} | Fae ${stats.fae} | ` +
          `Buffer: ${buffer} | Caps HP ${caps.hp}, Mana ${caps.mana} | ` +
          `Short Rest: ${shortStatus} | Long Rest: ${longStatus}` +
          (activeEffects ? ` | ${activeEffects}` : ""),
      };
    }

    return {
      message: `**Astral Sea Stats**\n\n` +
        `Level: ${level}\nTitle: ${getTitleForLevel(level)}\nXP: ${progress.xp}\n` +
        `Next Level: ${nextLevelXp - progress.xp} XP\nUnspent Stat Points: ${progress.unspentStatPoints}\n\n` +
        `Specialization: ${specialization}\nEquipped Weapon: ${equippedWeapon}\n\n` +
        `**Resources**\n\nHP: ${currentHp}/${getPlayerMaxHp(progress)}\n` +
        `Mana: ${progress.mana}/${getPlayerMaxMana(progress)}\n\n` +
        `**Permanent Stats**\n\n` +
        `Vitality: ${stats.vitality}/10 — +${stats.vitality * 10} Maximum HP\n` +
        `Focus: ${stats.focus}/10 — +${stats.focus * 10} Maximum Mana\n` +
        `Strength: ${stats.strength}/10 — +${stats.strength} Damage\n` +
        `Luck: ${stats.luck}/10 — +${stats.luck * 2}% Star Candies, +${stats.luck} percentage points Combat Berry Chance\n` +
        `Armor: ${stats.armor}/10 — -${stats.armor} Enemy Damage\n` +
        `Fae Affinity: ${stats.fae}/5 — +${stats.fae} Offensive Spell Roll\n\n` +
        `**Rest Status**\n\nBuffer: ${buffer}\nHP Cap: ${caps.hp}\nMana Cap: ${caps.mana}\n` +
        `Short Rest: ${shortStatus}\nLong Rest: ${longStatus}` +
        (activeEffects ? `\n\n${activeEffects}` : ""),
    };
  });
}

async function performStatAllocation(env, backpackKey, statId, platform = "twitch") {
  return withPlayerMutationLock(backpackKey, async () => {
    const definition = PLAYER_STATS[String(statId || "").toLowerCase()];
    const progress = await getPlayerProgress(env, backpackKey);
    if (!definition) return { message: "That permanent stat does not exist." };
    if (progress.unspentStatPoints < 1) {
      return { message: platform === "discord"
        ? "You do not have an unspent Stat Point. Earn XP and reach another Level, then use /stats."
        : "No Stat Points available. Level up to earn another, then check !stats." };
    }
    const stats = normalizePlayerStats(progress.stats);
    if (stats[definition.id] >= definition.maximumRank) {
      return { message: `${definition.displayName} has reached its current maximum rank of ${definition.maximumRank}. Your Stat Point was not spent.` };
    }

    const combatState = await getCombatState(env, backpackKey);
    const adventure = await getActiveAdventure(env, backpackKey);
    const originalProgress = structuredClone(progress);
    const originalCombat = combatState ? structuredClone(combatState) : null;
    const originalAdventure = adventure ? structuredClone(adventure) : null;
    const oldMaxHp = getPlayerMaxHp(progress);
    const oldMaxMana = getPlayerMaxMana(progress);
    const oldHp = combatState?.playerHp ?? adventure?.playerHp ?? progress.hp;
    const oldMana = progress.mana;
    stats[definition.id] += 1;
    const updatedProgress = {
      ...progress,
      stats,
      unspentStatPoints: progress.unspentStatPoints - 1,
    };
    if (definition.id === "vitality") {
      updatedProgress.hp = Math.min(getPlayerResourceCaps(updatedProgress).hp, progress.hp + 10);
      if (adventure) {
        adventure.playerHp = Math.min(getPlayerResourceCaps(updatedProgress).hp, adventure.playerHp + 10);
        adventure.playerMaxHp = getPlayerResourceCaps(updatedProgress).hp;
      }
      if (combatState) {
        combatState.playerHp = Math.min(getPlayerResourceCaps(updatedProgress).hp, combatState.playerHp + 10);
        combatState.playerMaxHp = getPlayerResourceCaps(updatedProgress).hp;
      }
    }
    if (definition.id === "focus") {
      updatedProgress.mana = restoreManaToNormalCap(
        progress.mana, 10, getPlayerResourceCaps(updatedProgress).mana,
      );
    }

    try {
      await savePlayerProgress(env, backpackKey, updatedProgress);
      if (adventure) await saveActiveAdventure(env, backpackKey, adventure);
      if (combatState) await saveCombatState(env, backpackKey, combatState);
    } catch (error) {
      try {
        await savePlayerProgress(env, backpackKey, originalProgress);
        if (originalAdventure) await saveActiveAdventure(env, backpackKey, originalAdventure);
        if (originalCombat) await saveCombatState(env, backpackKey, originalCombat);
      } catch (rollbackError) {
        console.error("Stat allocation rollback failed:", rollbackError);
      }
      throw error;
    }

    const newMaxHp = getPlayerMaxHp(updatedProgress);
    const newMaxMana = getPlayerMaxMana(updatedProgress);
    const newHp = combatState?.playerHp ?? adventure?.playerHp ?? updatedProgress.hp;
    let mechanical = definition.description;
    if (definition.id === "vitality") mechanical = `Permanent Maximum HP: ${oldMaxHp} → ${newMaxHp} | Current HP: ${oldHp} → ${newHp}`;
    if (definition.id === "focus") mechanical = `Permanent Maximum Mana: ${oldMaxMana} → ${newMaxMana} | Current Mana: ${oldMana} → ${updatedProgress.mana}`;
    if (definition.id === "strength") mechanical = `Player Damage Bonus: +${stats.strength}`;
    if (definition.id === "luck") mechanical = `Eligible Star Candy Bonus: +${stats.luck * 2}% | Combat Berry Chance Bonus: +${stats.luck} percentage points`;
    if (definition.id === "armor") mechanical = `Incoming Enemy Damage Reduction: ${stats.armor}`;
    if (definition.id === "fae") mechanical = `Offensive Spell Roll Bonus: +${stats.fae}`;
    const response = randomChoice(STAT_SHIZUKI_RESPONSES[definition.id]);
    return {
      message: platform === "discord"
        ? `**${definition.displayName} Increased**\n\n` +
          `Rank: ${stats[definition.id]}/${definition.maximumRank}\n` +
          `${mechanical.replaceAll(" | ", "\n")}\n` +
          `Unspent Stat Points: ${updatedProgress.unspentStatPoints}\n\n${response}`
        : `${definition.displayName} Increased | Rank: ${stats[definition.id]}/${definition.maximumRank} | ` +
          `${mechanical} | Unspent Stat Points: ${updatedProgress.unspentStatPoints} | ${response}`,
    };
  });
}

async function performBackpack(
  env,
  backpackKey,
  sharedIdentity = "",
  platform = "twitch",
) {
  const [
    currentTotal,
    progress,
  ] = await Promise.all([
    getBackpackTotal(
      env,
      backpackKey,
    ),

    getPlayerProgress(
      env,
      backpackKey,
    ),
  ]);

  const combatState = await getCombatState(env, backpackKey);
  const activeAdventure = combatState
    ? null
    : await getActiveAdventure(env, backpackKey);
  const currentHp =
    combatState?.playerHp ??
    activeAdventure?.playerHp ??
    progress.hp;
  const [sharedShortCooldownAt, sharedLongCooldownAt] =
    await Promise.all([
      getSharedRestCooldown(env, sharedIdentity, "short"),
      getSharedRestCooldown(env, sharedIdentity, "long"),
    ]);
  const restStatus = getRestStatus(
    currentHp,
    progress,
    Math.max(progress.lastRestAt, sharedShortCooldownAt),
    Math.max(progress.lastLongRestAt, sharedLongCooldownAt),
  );
  const level =
    levelFromXp(progress.xp);

  const levelProgress =
    getLevelProgress(
      progress.xp,
      level,
    );

  const title =
    getTitleForLevel(level);

  const region =
    getRegionById(progress.currentRegion) ||
    REGIONS[0];
  const activeEffects = formatActiveEffects(progress, platform);

  return {
    total: currentTotal,
    xp: progress.xp,
    level,
    title,
    region: region.name,

    message:
      `${title} | ` +
      `Level ${level} | ` +
      `${levelProgress.current}/${levelProgress.required} XP | ` +
      `Region: ${region.name} | ` +
      `Backpack: ${currentTotal.toLocaleString("en-US")} Star Candies | ` +
      `Berries: ${progress.berries.toLocaleString("en-US")} | ` +
      `HP: ${currentHp}/${progress.maxHp} | ` +
      `Mana: ${progress.mana}/${progress.maxMana} | ` +
      `Stat Points: ${progress.unspentStatPoints} available | ` +
      restStatus +
      (activeEffects
        ? platform === "discord"
          ? `\n\n${activeEffects}`
          : ` | ${activeEffects}`
        : ""),
  };
}

async function performTravel(
  env,
  backpackKey,
  regionInput,
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performTravelUnlocked(env, backpackKey, regionInput),
  );
}

async function performTravelUnlocked(
  env,
  backpackKey,
  regionInput,
) {
  if (await getCombatState(env, backpackKey)) {
    return {
      message:
        "You cannot travel while fighting an enemy in an Adventure. " +
        "Defeat your enemy first.",
    };
  }

  const region = normalizeRegionInput(regionInput);

  if (!region) {
    return { message: unknownRegionMessage() };
  }

  const progress = await getPlayerProgress(env, backpackKey);
  const level = levelFromXp(progress.xp);

  if (level < region.level) {
    return {
      message:
        `${region.name} is locked. ` +
        `It unlocks at Level ${region.level}.`,
    };
  }

  progress.currentRegion = region.id;
  await savePlayerProgress(env, backpackKey, progress);

  return {
    region: region.id,
    message:
      `You traveled to ${region.name}! ` +
      "Your next !explore or /explore will take place there.",
  };
}

async function performJournal(
  env,
  backpackKey,
  platform = "twitch",
) {
  const progress = await getPlayerProgress(env, backpackKey);
  const level = levelFromXp(progress.xp);
  const results = await Promise.allSettled(
    REGIONS.map((region) => getRegionMetadata(region.id)),
  );
  const entries = [];
  let collectedTotal = 0;
  let availableTotal = 0;

  results.forEach((result, index) => {
    const region = REGIONS[index];

    if (result.status !== "fulfilled") {
      entries.push(`${region.name}: Unavailable`);
      return;
    }

    const metadata = result.value;
    const requirement = metadata.levelRequirement;
    availableTotal += metadata.noteCount;

    if (level < requirement) {
      entries.push(`${metadata.name}: Locked`);
      return;
    }

    const collected = getOwnedNoteNumbers(
      progress,
      region.id,
      metadata.noteCount,
    ).length;

    collectedTotal += collected;
    entries.push(`${metadata.name}: ${collected}/${metadata.noteCount}`);
  });

  const total = `Total: ${collectedTotal}/${availableTotal}`;
  const message = platform === "discord"
    ? `Shizuki's Travel Journal\n\n${entries.join("\n")}\n\n${total}`
    : `Shizuki's Travel Journal | ${entries.join(" | ")} | ${total}`;

  return { message };
}

async function performNotesList(
  env,
  backpackKey,
  regionInput,
) {
  const progress = await getPlayerProgress(env, backpackKey);
  const region = resolvePlayerRegion(progress, regionInput);

  if (!region) {
    return { message: unknownRegionMessage() };
  }

  let metadata;

  try {
    metadata = await getRegionMetadata(region.id);
  } catch (error) {
    console.error("Region metadata lookup failed:", error);
    return {
      message: `${region.name}'s journal chapter could not currently be loaded. Please try again later.`,
    };
  }

  if (levelFromXp(progress.xp) < metadata.levelRequirement) {
    return { message: `${metadata.name} has not been unlocked yet.` };
  }

  const collected = getOwnedNoteNumbers(
    progress,
    region.id,
    metadata.noteCount,
  );
  const collectedSet = new Set(collected);
  const missing = Array.from(
    { length: metadata.noteCount },
    (_, index) => index + 1,
  ).filter((number) => !collectedSet.has(number));

  const collectedText = collected.length
    ? formatNumberRanges(collected)
    : "None";
  const missingText = missing.length
    ? formatNumberRanges(missing)
    : "None — chapter complete!";
  const detailed =
    `${metadata.name} Notes: ${collected.length}/${metadata.noteCount} | ` +
    `Collected: ${collectedText} | Missing: ${missingText}`;

  return {
    message: detailed.length <= 450
      ? detailed
      : `${metadata.name} Notes: ${collected.length}/${metadata.noteCount} | Use !note ${region.id} <number> to read a collected page.`,
  };
}

async function performReadNote(
  env,
  backpackKey,
  regionInput,
  numberInput,
  platform = "twitch",
) {
  const progress = await getPlayerProgress(env, backpackKey);
  const region = resolvePlayerRegion(progress, regionInput);

  if (!region) {
    return { message: unknownRegionMessage() };
  }

  let metadata;

  try {
    metadata = await getRegionMetadata(region.id);
  } catch (error) {
    console.error("Region metadata lookup failed:", error);
    return {
      message: `${region.name}'s journal chapter could not currently be loaded. Please try again later.`,
    };
  }

  if (levelFromXp(progress.xp) < metadata.levelRequirement) {
    return { message: `${metadata.name} has not been unlocked yet.` };
  }

  const number = Number(numberInput);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > metadata.noteCount
  ) {
    return {
      message: `Choose a Travel Note number from 1 to ${metadata.noteCount}.`,
    };
  }

  const noteId =
    `${region.id}-note-${String(number).padStart(2, "0")}`;

  if (progress.notes[noteId] !== true) {
    return {
      message: `Travel Note #${number} from ${metadata.name} has not been discovered yet.`,
    };
  }

  let note;

  try {
    note = await findRegionNote(region.id, noteId);
  } catch (error) {
    console.error("Travel Note content lookup failed:", error);
  }

  if (!note) {
    return {
      message: "You collected this Travel Note, but its page could not currently be loaded. Please try again later.",
    };
  }

  return {
    message: platform === "discord"
      ? `${metadata.name} — Travel Note #${number}\n${note.title}\n\n${note.text}`
      : `${metadata.name} — Note #${number}: ${note.title} | "${note.text}"`,
  };
}

// Read-only journal view. An active adventure pins its region; otherwise the
// saved travel region is authoritative, including after the final region.
async function performReadJournal(env, backpackKey) {
  const [rawProgress, rawAdventure] = await Promise.all([
    env.Backpack.get(getProgressKey(backpackKey)),
    env.Backpack.get(getAdventureKey(backpackKey)),
  ]);
  let saved;
  try { saved = rawProgress ? JSON.parse(rawProgress) : null; }
  catch { saved = null; }
  let region = null;
  if (rawAdventure) {
    try {
      const adventure = JSON.parse(rawAdventure);
      if (isValidAdventureState(adventure)) region = getRegionById(adventure.regionId);
    } catch { /* Stale adventure state does not replace saved travel state. */ }
  }
  if (!region) {
    try {
      region = saved && Object.prototype.hasOwnProperty.call(saved, "currentRegion")
        ? getRegionById(saved.currentRegion)
        : null;
    } catch { /* Malformed progress has no trustworthy current region. */ }
  }
  if (!region) return { message: "Your current region is unavailable. Travel to a region and try again." };

  let metadata;
  let notes;
  try {
    [metadata, notes] = await Promise.all([
      getRegionMetadata(region.id), getRegionNotes(region.id),
    ]);
  } catch (error) {
    console.error("Travel Note journal lookup failed:", error);
    return { message: `${region.name}'s journal chapter could not currently be loaded. Please try again later.` };
  }
  const byNumber = new Map(notes.map((note) => [note.number, note]));
  const entries = [];
  for (let number = 1; number <= metadata.noteCount; number += 1) {
    const note = byNumber.get(number);
    const noteId = `${region.id}-note-${String(number).padStart(2, "0")}`;
    entries.push(saved?.notes?.[noteId] === true && note
      ? `${number}. ${note.title}\n${note.text}`
      : `${number}. Continue exploring to find this note.`);
  }
  return { message: `${region.name} — Travel Notes\n\n${entries.join("\n\n")}` };
}

/* ============================================================
      DISCORD DAILY COOLDOWN
   ============================================================ */

async function performDiscordDaily(
  env,
  backpackKey,
  userId,
) {
  const cooldownKey =
    `cooldown:discord:daily:${userId}`;

  const lastClaimText = await env.Backpack.get(
    cooldownKey,
  );

  const now = Math.floor(Date.now() / 1000);
  const lastClaim = Number.parseInt(
    lastClaimText || "0",
    10,
  );

  if (Number.isFinite(lastClaim) && lastClaim > 0) {
    const elapsed = now - lastClaim;
    const remaining =
      DISCORD_DAILY_COOLDOWN_SECONDS - elapsed;

    if (remaining > 0) {
      return {
        ephemeral: true,
        message:
          "Your next Astral Sea blessing will be ready in " +
          `${formatDuration(remaining)}.`,
      };
    }
  }

  const result = await performDaily(
    env,
    backpackKey,
  );

  await env.Backpack.put(
    cooldownKey,
    String(now),
    {
      expirationTtl:
        DISCORD_DAILY_COOLDOWN_SECONDS + 3600,
    },
  );

  return {
    ...result,
    ephemeral: false,
  };
}

/* ============================================================
   KV HELPERS
   ============================================================ */

async function getBackpackTotal(env, backpackKey) {
  const storedValue = await env.Backpack.get(
    backpackKey,
  );

  if (storedValue === null) {
    return 0;
  }

  const total = Number.parseInt(storedValue, 10);

  if (!Number.isFinite(total) || total < 0) {
    return 0;
  }

  return total;
}

async function saveBackpackTotal(
  env,
  backpackKey,
  total,
) {
  const safeTotal = Math.max(
    0,
    Math.floor(total),
  );

  await env.Backpack.put(
    backpackKey,
    safeTotal.toString(),
  );
}

function getCombatKey(backpackKey) {
  return `combat:${backpackKey}`;
}

function getPendingCombatKey(backpackKey) {
  return `pending-combat:${backpackKey}`;
}

function getAdventureKey(backpackKey) {
  return `adventure:${backpackKey}`;
}

// A command-local read-your-writes view. No intermediate game state reaches KV.
// The outer command lock includes the flush; existing inner action locks remain.
async function withCommandPersistence(env, backpackKey, execute) {
  return withPlayerMutationLock("command:" + backpackKey, async () => {
    const initial = new Map();
    const pending = new Map();
    const loading = new Map();
    let readFailure;
    let readFailed = false;
    const read = async (key) => {
      if (pending.has(key)) return pending.get(key).value;
      if (!initial.has(key)) {
        try {
          if (!loading.has(key)) loading.set(key, Promise.resolve().then(() => env.Backpack.get(key)));
          initial.set(key, await loading.get(key));
        } catch (error) { readFailure = error; readFailed = true; throw error; }
      }
      return initial.get(key);
    };
    const staged = new Proxy(env.Backpack, {
      get(target, property) {
        if (property === "get") return read;
        if (property === "put") return async (key, value, options) => {
          await read(key);
          pending.set(key, { value, options });
        };
        if (property === "delete") return async (key) => {
          await read(key);
          pending.set(key, { value: null });
        };
        return target[property];
      },
    });
    const commandEnv = new Proxy(env, {
      get(target, property) { return property === "Backpack" ? staged : target[property]; },
    });
    // Throws discard the entire staged view. Old gameplay rollback writes are
    // also staged, so they never generate compensating writes to rate-limited KV.
    const result = await execute(commandEnv);
    if (readFailed) throw readFailure;
    let committed = 0;
    try {
      for (const [key, change] of pending) {
        if (change.value === initial.get(key)) continue;
        if (change.value === null) await env.Backpack.delete(key);
        else await env.Backpack.put(key, change.value, change.options);
        committed++;
      }
    } catch (error) {
      // KV has no multi-key transaction. Never retry/roll back a failed flush:
      // the successful prefix may already be durable. Preserve that fact in logs.
      const diagnostic = env[RUNTIME_DIAGNOSTICS];
      if (diagnostic) diagnostic.committedKeyCount = committed;
      throw tagRuntimeError(error, "kv.command.commit");
    }
    return result;
  });
}

async function withPlayerMutationLock(backpackKey, operation) {
  const previous = PLAYER_MUTATION_CHAINS.get(backpackKey) ||
    Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const chain = previous.then(() => current);

  PLAYER_MUTATION_CHAINS.set(
    backpackKey,
    chain,
  );

  await previous;

  try {
    return await operation();
  } finally {
    release();

    if (PLAYER_MUTATION_CHAINS.get(backpackKey) === chain) {
      PLAYER_MUTATION_CHAINS.delete(backpackKey);
    }
  }
}

async function getCombatState(env, backpackKey) {
  const storedValue = await env.Backpack.get(
    getCombatKey(backpackKey),
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue);
    if (!isValidCombatState(parsed)) return null;
    const cap = getPlayerResourceCaps(await getPlayerProgress(env, backpackKey)).hp;
    if (parsed.playerMaxHp !== cap || parsed.playerHp > cap) {
      parsed.playerMaxHp = cap;
      parsed.playerHp = Math.min(parsed.playerHp, cap);
      await saveCombatState(env, backpackKey, parsed);
    }
    return parsed;
  } catch (error) {
    logRuntimeError(error, env[RUNTIME_DIAGNOSTICS], "state.combat.normalize");
    return null;
  }
}

async function saveCombatState(
  env,
  backpackKey,
  combatState,
) {
  if (!isValidCombatState(combatState)) {
    throw new Error("Combat state has an invalid format.");
  }

  await env.Backpack.put(
    getCombatKey(backpackKey),
    JSON.stringify(combatState),
    {
      expirationTtl: COMBAT_STATE_TTL_SECONDS,
    },
  );
}

async function deleteCombatState(env, backpackKey) {
  await env.Backpack.delete(getCombatKey(backpackKey));
}

async function getPendingCombat(env, backpackKey) {
  const storedValue = await env.Backpack.get(
    getPendingCombatKey(backpackKey),
  );

  if (!storedValue) {
    return { pending: null, expired: false };
  }

  try {
    const pending = JSON.parse(storedValue);
    const valid =
      getRegionById(pending?.regionId) &&
      Number.isSafeInteger(pending?.encounterNumber) &&
      pending.encounterNumber >= 1 &&
      typeof pending.enemyId === "string" &&
      /^[a-z0-9-]+$/.test(pending.enemyId) &&
      Number.isSafeInteger(pending.createdAt) &&
      pending.createdAt > 0;

    if (!valid) {
      return { pending: null, expired: false };
    }

    if (Date.now() - pending.createdAt > PENDING_COMBAT_TTL_MS) {
      return { pending: null, expired: true };
    }

    return { pending, expired: false };
  } catch {
    return { pending: null, expired: false };
  }
}

async function setPendingCombat(env, backpackKey, pending) {
  await env.Backpack.put(
    getPendingCombatKey(backpackKey),
    JSON.stringify(pending),
    {
      expirationTtl: Math.ceil(PENDING_COMBAT_TTL_MS / 1000),
    },
  );
}

async function clearPendingCombat(env, backpackKey) {
  await env.Backpack.delete(getPendingCombatKey(backpackKey));
}

async function getActiveAdventure(env, backpackKey) {
  const storedValue = await env.Backpack.get(
    getAdventureKey(backpackKey),
  );

  if (!storedValue) {
    return null;
  }

  try {
    const state = JSON.parse(storedValue);
    if (!isValidAdventureState(state)) return null;
    const cap = getPlayerResourceCaps(await getPlayerProgress(env, backpackKey)).hp;
    if (state.playerMaxHp !== cap || state.playerHp > cap) {
      state.playerMaxHp = cap;
      state.playerHp = Math.min(state.playerHp, cap);
      await saveActiveAdventure(env, backpackKey, state);
    }
    return state;
  } catch {
    return null;
  }
}

async function saveActiveAdventure(env, backpackKey, state) {
  if (!isValidAdventureState(state)) {
    throw new Error("Adventure state has an invalid format.");
  }

  await env.Backpack.put(
    getAdventureKey(backpackKey),
    JSON.stringify(state),
  );
}

async function clearActiveAdventure(env, backpackKey) {
  await env.Backpack.delete(getAdventureKey(backpackKey));
}

function isValidAdventureState(state) {
  return Boolean(
    state &&
    state.version === 1 &&
    getRegionById(state.regionId) &&
    Number.isSafeInteger(state.adventureNumber) &&
    state.adventureNumber >= 1 &&
    typeof state.adventureId === "string" &&
    typeof state.name === "string" &&
    typeof state.currentRoomId === "string" &&
    [
      "awaiting-direction",
      "in-combat",
      "awaiting-boss-confirmation",
      "boss-combat",
    ].includes(state.status) &&
    Array.isArray(state.visitedRooms) &&
    Array.isArray(state.completedRooms) &&
    Array.isArray(state.collectedRewards) &&
    (state.berriesEaten === undefined ||
      (Number.isSafeInteger(state.berriesEaten) &&
        state.berriesEaten >= 0 && state.berriesEaten <= 4)) &&
    Number.isSafeInteger(state.playerHp) &&
    Number.isSafeInteger(state.playerMaxHp) &&
    state.playerHp > 0 &&
    state.playerHp <= MAX_PLAYER_RESOURCE_CAP &&
    state.playerMaxHp >= PLAYER_COMBAT_MAX_HP &&
    Number.isSafeInteger(state.startedAt) &&
    state.startedAt > 0 &&
    Number.isSafeInteger(state.updatedAt) &&
    state.updatedAt >= state.startedAt
  );
}

/* ============================================================
   DISCORD HELPERS
   ============================================================ */

function splitDiscordContent(content, maximum = DISCORD_SAFE_CONTENT_LENGTH) {
  if (!Number.isSafeInteger(maximum) || maximum < 2 ||
      maximum > DISCORD_SAFE_CONTENT_LENGTH) {
    throw new RangeError("Invalid Discord content chunk limit.");
  }
  if (content.length <= maximum) return [content];
  const chunks = [];
  let remaining = content;
  while (remaining.length > maximum) {
    let cut = remaining.lastIndexOf("\n\n", maximum - 2);
    if (cut >= 0) cut += 2;
    else {
      cut = remaining.lastIndexOf("\n", maximum - 1);
      if (cut >= 0) cut += 1;
      else {
        cut = 0;
        for (let index = maximum - 1; index > 0; index -= 1) {
          if (/\s/u.test(remaining[index])) {
            cut = index + 1;
            break;
          }
        }
        if (!cut) cut = maximum;
      }
    }
    // Never split a UTF-16 surrogate pair at a hard or whitespace boundary.
    if (cut < remaining.length && cut > 0 &&
        /[\uD800-\uDBFF]/u.test(remaining[cut - 1]) &&
        /[\uDC00-\uDFFF]/u.test(remaining[cut])) cut -= 1;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sendDiscordFollowups(applicationId, token, chunks, flags) {
  const endpoint = `${DISCORD_API_BASE}/webhooks/` +
    `${encodeURIComponent(applicationId)}/${encodeURIComponent(token)}`;
  // Give Discord time to receive the immediate type-4 response before follow-ups.
  await new Promise((resolve) => setTimeout(resolve, 250));
  for (const content of chunks) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        ...(flags & 64 ? { flags: 64 } : {}),
        allowed_mentions: { parse: [] },
      }),
    });
    if (!response.ok) {
      throw new Error(`Discord follow-up HTTP ${response.status}.`);
    }
  }
}

function discordMessage(
  content,
  ephemeral = false,
) {
  return jsonResponse({
    type: 4,
    data: {
      content,
      ...(ephemeral ? { flags: 64 } : {}),
      allowed_mentions: {
        parse: [],
      },
    },
  });
}

function getDiscordOption(
  interaction,
  optionName,
) {
  const options = Array.isArray(
    interaction.data?.options,
  )
    ? interaction.data.options
    : [];

  return options.find(
    (option) => option.name === optionName,
  )?.value;
}

function getDiscordSubcommand(interaction) {
  const options = Array.isArray(interaction.data?.options)
    ? interaction.data.options
    : [];

  return options.find((option) => option.type === 1)?.name || "";
}

function getDiscordIntegerOption(
  interaction,
  optionName,
) {
  const options = Array.isArray(interaction.data?.options)
    ? interaction.data.options
    : [];
  const option = options.find(
    (candidate) =>
      candidate.name === optionName &&
      candidate.type === 4,
  );
  const numericValue = Number(option?.value);

  return Number.isSafeInteger(numericValue)
    ? numericValue
    : null;
}

function getDiscordDisplayName(interaction) {
  const displayName =
    interaction.member?.nick ||
    interaction.member?.user?.global_name ||
    interaction.user?.global_name ||
    interaction.member?.user?.username ||
    interaction.user?.username ||
    "Explorer";

  return escapeDiscordText(String(displayName));
}

function getDiscordRestIdentity(interaction) {
  const username =
    interaction.member?.user?.username ||
    interaction.user?.username ||
    "";

  return normalizeUsername(username);
}

function escapeDiscordText(value) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/([\\`*_{}[\]()<>#+\-.!|~])/g, "\\$1")
    .trim() || "Explorer";
}

async function verifyDiscordRequest(
  body,
  signatureHex,
  timestamp,
  publicKeyHex,
) {
  try {
    const publicKey = await crypto.subtle.importKey(
      "raw",
      hexToBytes(publicKeyHex),
      {
        name: "Ed25519",
      },
      false,
      ["verify"],
    );

    const message = new TextEncoder().encode(
      timestamp + body,
    );

    const signature = hexToBytes(signatureHex);

    return await crypto.subtle.verify(
      {
        name: "Ed25519",
      },
      publicKey,
      signature,
      message,
    );
  } catch (error) {
    console.error(
      "Discord signature verification error:",
      error,
    );

    return false;
  }
}

/* ============================================================
   GENERAL HELPERS
   ============================================================ */

function normalizeUsername(value) {
  if (!value) {
    return "";
  }

  const username = value.trim().toLowerCase();

  if (!/^[a-z0-9_]{1,25}$/.test(username)) {
    return "";
  }

  return username;
}

function getTwitchDisplayName(value) {
  return normalizeUsername(value)
    ? value.trim()
    : "Explorer";
}

function formatCandyAmount(value) {
  const formattedValue = value.toLocaleString("en-US");
  const currencyName = value === 1
    ? "Star Candy"
    : "Star Candies";

  return `${formattedValue} ${currencyName}`;
}

function formatRemainingDuration(milliseconds) {
  const totalSeconds = Math.max(
    0,
    Math.ceil(milliseconds / 1000),
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

function formatDetailedDuration(milliseconds) {
  const totalSeconds = Math.max(
    0,
    Math.ceil(milliseconds / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
}

function getRestStatus(
  hp,
  progress,
  shortRestAt,
  longRestAt,
  now = Date.now(),
) {
  const parts = [];
  const hasBonus = progress.restBufferType === "short" ||
    progress.restBufferType === "long";

  if (hasBonus) {
    parts.push(
      progress.restBufferType === "long"
        ? "Rest Status: Long Rested"
        : "Rest Status: Rested",
    );
  }

  const shortRemaining =
    SHORT_REST_COOLDOWN_MS - (now - shortRestAt);
  const longRemaining =
    LONG_REST_COOLDOWN_MS - (now - longRestAt);

  parts.push(
    shortRemaining > 0
      ? `Short Rest: ${formatDetailedDuration(shortRemaining)}`
      : "Short Rest: Ready",
    longRemaining > 0
      ? `Long Rest: ${formatDetailedDuration(longRemaining)}`
      : "Long Rest: Ready",
  );

  return parts.join(" | ");
}

function randomInteger(minimum, maximum) {
  return (
    Math.floor(
      Math.random() * (maximum - minimum + 1),
    ) + minimum
  );
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(
    0,
    Math.ceil(totalSeconds),
  );

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil(
    (seconds % 3600) / 60,
  );

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${Math.max(1, minutes)}m`;
}

function hexToBytes(hex) {
  const normalized = String(hex).trim();

  if (
    !/^[0-9a-f]+$/i.test(normalized) ||
    normalized.length % 2 !== 0
  ) {
    throw new Error("Invalid hexadecimal value.");
  }

  const bytes = new Uint8Array(
    normalized.length / 2,
  );

  for (
    let index = 0;
    index < normalized.length;
    index += 2
  ) {
    bytes[index / 2] = Number.parseInt(
      normalized.slice(index, index + 2),
      16,
    );
  }

  return bytes;
}

function timingSafeEqual(left, right) {
  const leftBytes = new TextEncoder().encode(
    String(left),
  );

  const rightBytes = new TextEncoder().encode(
    String(right),
  );

  const length = Math.max(
    leftBytes.length,
    rightBytes.length,
  );

  let difference =
    leftBytes.length ^ rightBytes.length;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    difference |=
      (leftBytes[index] || 0) ^
      (rightBytes[index] || 0);
  }

  return difference === 0;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function textResponse(message, status = 200) {
  return new Response(message, {
    status,
    headers: TEXT_HEADERS,
  });
}

function jsonResponse(value, status = 200) {
  return new Response(
    JSON.stringify(value, null, 2),
    {
      status,
      headers: JSON_HEADERS,
    },
  );
}

/* ============================================================
   REGION DATA
   ============================================================ */

function getRegionById(regionId) {
  return REGIONS.find((region) => region.id === regionId) || null;
}

function normalizeRegionInput(input) {
  const normalized = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const aliases = {
    moonlit: "moonlit-reef",
    starfall: "starfall-trench",
    whispering: "whispering-kelp-forest",
    leviathans: "leviathans-wake",
    sunken: "sunken-kings-throne",
    astral: "astral-nexus",
  };
  const regionId = aliases[normalized] || normalized;

  return REGIONS.find(
    (region) =>
      region.id === regionId ||
      region.name.toLowerCase() === String(input || "").trim().toLowerCase(),
  ) || null;
}

function resolvePlayerRegion(progress, regionInput) {
  if (String(regionInput || "").trim()) {
    return normalizeRegionInput(regionInput);
  }

  return (
    getRegionById(progress.currentRegion) ||
    getRegionForLevel(levelFromXp(progress.xp))
  );
}

function unknownRegionMessage() {
  return `Unknown region. Available regions: ${REGIONS.map((region) => region.name).join(", ")}.`;
}

function formatCombatRollMessage(attacker, roll, result) {
  const specialText =
    roll === 20
      ? " — Critical!"
      : roll === 1
        ? " — Critical Miss!"
        : "";

  return `${attacker} ${roll} → ${result.damage} dmg${specialText}`;
}

function formatPlayerAttackResolution(
  naturalRoll,
  result,
  effectResult,
  platform = "twitch",
) {
  const separator = platform === "discord" ? "\n\n" : " | ";
  const fadeText = effectResult.consumed.length > 0
    ? `${separator}${effectResult.consumed.join(" and ")} fades after ` +
      "guiding your strike."
    : "";
  const resultName =
    result.category === "Critical"
      ? "Critical Hit!"
      : result.category === "Critical Miss"
        ? "Critical Miss"
        : `${result.category} Hit`;
  const resultText = result.category === "Critical" ||
      result.category === "Critical Miss"
    ? `${separator}Result: ${resultName}`
    : "";
  return `You attack!${resultText}` +
    fadeText +
    `${separator}${formatCompactCombatRoll(
      naturalRoll,
      effectResult.finalTotal,
      effectResult.modifierDetails,
      result.damage,
    )}`;
}

function formatCompactCombatRoll(
  naturalRoll,
  finalTotal,
  modifierDetails,
  damage,
  isCritical = false,
) {
  const modifiers = modifierDetails.map((detail) => {
    const name = detail.name === "Fae Affinity" ? "Fae" : detail.name;
    const sign = detail.value >= 0 ? "+" : "-";
    return `${sign}${Math.abs(detail.value)} ${name}`;
  }).join("");

  return `Roll ${finalTotal} (${naturalRoll}${modifiers}) → ` +
    `${isCritical ? "Critical Hit! " : ""}${damage} dmg`;
}

function getCombatRollResult(roll) {
  if (roll === 1) {
    return {
      category: "Critical Miss",
      damage: COMBAT_DAMAGE.criticalMiss,
    };
  }

  if (roll <= 5) {
    return {
      category: "Weak",
      damage: COMBAT_DAMAGE.weak,
    };
  }

  if (roll <= 10) {
    return {
      category: "Normal",
      damage: COMBAT_DAMAGE.normal,
    };
  }

  if (roll <= 15) {
    return {
      category: "Strong",
      damage: COMBAT_DAMAGE.strong,
    };
  }

  if (roll <= 19) {
    return {
      category: "Heavy",
      damage: COMBAT_DAMAGE.heavy,
    };
  }

  return {
    category: "Critical",
    damage: COMBAT_DAMAGE.critical,
  };
}

function isValidIntegerRange(range, minimumAllowed = 0) {
  return Boolean(
    range &&
    Number.isSafeInteger(range.min) &&
    Number.isSafeInteger(range.max) &&
    range.min >= minimumAllowed &&
    range.max >= range.min,
  );
}

function validateEnemyDefinition(enemy, expectedEnemyId) {
  if (
    !enemy ||
    enemy.id !== expectedEnemyId ||
    !/^[a-z0-9-]+$/.test(enemy.id) ||
    typeof enemy.name !== "string" ||
    !enemy.name.trim() ||
    !Number.isSafeInteger(enemy.level) ||
    enemy.level < 1 ||
    !Number.isSafeInteger(enemy.hp) ||
    enemy.hp < 1 ||
    !isValidIntegerRange(enemy.reward?.candies) ||
    !isValidIntegerRange(enemy.reward?.xp, 1) ||
    !Number.isSafeInteger(enemy.defeatCandyLoss) ||
    enemy.defeatCandyLoss < 0
  ) {
    throw new Error(`Invalid enemy data for ${expectedEnemyId}.`);
  }

  return {
    id: enemy.id,
    name: enemy.name.trim(),
    level: enemy.level,
    hp: enemy.hp,
    damageBonus:
      Number.isSafeInteger(enemy.damageBonus) &&
      enemy.damageBonus >= 0
        ? enemy.damageBonus
        : 0,
    isBoss: enemy.isBoss === true,
    reward: {
      candies: {
        min: enemy.reward.candies.min,
        max: enemy.reward.candies.max,
      },
      xp: {
        min: enemy.reward.xp.min,
        max: enemy.reward.xp.max,
      },
    },
    defeatCandyLoss: enemy.defeatCandyLoss,
  };
}

function isValidMendState(mend) {
  return Boolean(
    mend &&
    Number.isSafeInteger(mend.naturalRoll) &&
    mend.naturalRoll >= 1 &&
    mend.naturalRoll <= 12 &&
    typeof mend.tierId === "string" &&
    mend.tierId.trim() &&
    typeof mend.displayName === "string" &&
    mend.displayName.trim() &&
    Number.isSafeInteger(mend.healingPerTrigger) &&
    mend.healingPerTrigger > 0 &&
    Number.isSafeInteger(mend.remainingTriggers) &&
    mend.remainingTriggers >= 1 &&
    mend.remainingTriggers <= 3
  );
}

function isValidBubbleState(bubble) {
  return Boolean(
    bubble &&
    Number.isSafeInteger(bubble.naturalRoll) &&
    bubble.naturalRoll >= 1 &&
    bubble.naturalRoll <= 12 &&
    typeof bubble.tierId === "string" &&
    bubble.tierId.trim() &&
    typeof bubble.displayName === "string" &&
    bubble.displayName.trim() &&
    Number.isSafeInteger(bubble.protection) &&
    bubble.protection > 0 &&
    (bubble.maxProtection === undefined ||
      (Number.isSafeInteger(bubble.maxProtection) &&
        bubble.maxProtection >= bubble.protection))
  );
}

function getAstralEcho(combatState) {
  const echo = combatState?.astralEcho;
  const damagePercent = Number(echo?.damagePercent);
  return echo &&
      Number.isSafeInteger(echo.naturalRoll) &&
      echo.naturalRoll >= 1 &&
      echo.naturalRoll <= 4 &&
      typeof echo.tierId === "string" &&
      echo.tierId.trim() &&
      typeof echo.displayName === "string" &&
      echo.displayName.trim() &&
      Number.isFinite(damagePercent) &&
      damagePercent > 0 &&
      damagePercent <= 1
    ? { ...echo, damagePercent }
    : null;
}

function isValidAstralRebound(rebound) {
  return Boolean(
    rebound &&
    typeof rebound === "object" &&
    !Array.isArray(rebound) &&
    Number(rebound.offensiveRollModifier) === 2
  );
}

function isValidAstralCuriosityBonus(bonus) {
  return Boolean(
    bonus &&
    typeof bonus === "object" &&
    !Array.isArray(bonus) &&
    Number(bonus.offensiveRollModifier) === 1
  );
}

function isValidBerryEffects(effects) {
  if (!effects || typeof effects !== "object" || Array.isArray(effects)) return false;
  const allowedBonuses = {
    "Bouncy Berry": 2,
    "Fae Berry": 1,
    "Giggling Berry": 3,
    "Astral Berry": 2,
    "Shizuki's Favorite": 4,
  };
  return Object.keys(effects).every((key) =>
    ["sleepyGuard", "protection", "rollBonuses", "sparkDamage", "shimmerDiscount"].includes(key)) &&
    (effects.sleepyGuard === undefined || effects.sleepyGuard === true) &&
    (effects.sparkDamage === undefined || effects.sparkDamage === true) &&
    (effects.shimmerDiscount === undefined || effects.shimmerDiscount === true) &&
    (effects.protection === undefined ||
      (Number.isSafeInteger(effects.protection) && effects.protection > 0)) &&
    (effects.rollBonuses === undefined ||
      (effects.rollBonuses && typeof effects.rollBonuses === "object" &&
        !Array.isArray(effects.rollBonuses) &&
        Object.entries(effects.rollBonuses).every(([name, value]) =>
          allowedBonuses[name] === value)));
}

function isValidLeviathansWake(wake) {
  const validFraction = (value) =>
    typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1;
  return Boolean(
    wake && typeof wake === "object" && !Array.isArray(wake) &&
    Number.isSafeInteger(wake.naturalRoll) && wake.naturalRoll >= 1 && wake.naturalRoll <= 20 &&
    Number.isSafeInteger(wake.finalRoll) && wake.finalRoll >= wake.naturalRoll &&
    ["wakefin", "astral-manta", "deepwake-serpent", "leviathan", "ancient-one"].includes(wake.creatureId) &&
    [1, 2].includes(wake.stage) &&
    (wake.regionalGuardReduction === undefined ||
      [0, 15, 18, 20].includes(wake.regionalGuardReduction)) &&
    Number.isSafeInteger(wake.baseDamage) && wake.baseDamage > 0 &&
    wake.critical === (wake.naturalRoll === 20) &&
    (wake.astralChargeSnapshot === null || validFraction(wake.astralChargeSnapshot?.damageIncrease)) &&
    (wake.astralEchoSnapshot === null ||
      (validFraction(wake.astralEchoSnapshot?.damagePercent) &&
        (wake.astralEchoSnapshot.naturalRoll === undefined ||
          [1, 2, 3, 4].includes(wake.astralEchoSnapshot.naturalRoll)))) &&
    (wake.rhythmBonus === undefined || wake.rhythmBonus === 0 || wake.rhythmBonus === 5) &&
    (wake.shizukisPresenceBonus === undefined ||
      wake.shizukisPresenceBonus === 0 || wake.shizukisPresenceBonus === 15) &&
    (wake.storytellerFinalChapter === undefined ||
      typeof wake.storytellerFinalChapter === "boolean") &&
    Number.isSafeInteger(wake.aftershockDamage) &&
    (wake.aftershockDamage === 0 || (wake.critical && wake.aftershockDamage === 5))
  );
}

function isValidCombatState(combatState) {
  const enemy = combatState?.enemy;

  return Boolean(
    combatState &&
    combatState.version === 1 &&
    isValidRegionalEnemyState(combatState.regionalEnemy) &&
    getRegionById(combatState.regionId) &&
    (
      combatState.encounterNumber === undefined ||
      (
        Number.isSafeInteger(combatState.encounterNumber) &&
        combatState.encounterNumber >= 1
      )
    ) &&
    Number.isSafeInteger(combatState.playerHp) &&
    Number.isSafeInteger(combatState.playerMaxHp) &&
    combatState.playerMaxHp >= PLAYER_COMBAT_MAX_HP &&
    combatState.playerHp > 0 &&
    combatState.playerHp <= MAX_PLAYER_RESOURCE_CAP &&
    (combatState.wanderingBattle === undefined ||
      (combatState.wanderingBattle &&
        ["Common", ...BATTLE_VARIANTS, "Wishpocket"].includes(combatState.wanderingBattle.variant) &&
        Number.isSafeInteger(combatState.wanderingBattle.berryUses) &&
        combatState.wanderingBattle.berryUses >= 0 &&
        combatState.wanderingBattle.berryUses <= BATTLE_BERRY_LIMIT &&
        (combatState.wanderingBattle.variant === "Fae Touched"
          ? FAE_TOUCHED_BLESSINGS.includes(combatState.wanderingBattle.blessing)
          : combatState.wanderingBattle.blessing === null) &&
        (combatState.wanderingBattle.variant === "Wishpocket"
          ? (Number.isSafeInteger(combatState.wanderingBattle.actions) &&
            combatState.wanderingBattle.actions >= 0 &&
            combatState.wanderingBattle.actions < WISHPOCKET_ESCAPE_ACTIONS &&
            enemy?.id === "wishpocket" &&
            enemy?.maxHp === WISHPOCKET_BY_REGION[combatState.regionId]?.hp)
          : (combatState.wanderingBattle.actions === undefined &&
            enemy?.id !== "wishpocket")) &&
        combatState.adventureContext === undefined && enemy?.isBoss !== true)) &&
    (
      combatState.stimUses === undefined ||
      (Number.isSafeInteger(combatState.stimUses) &&
        combatState.stimUses >= 0 && combatState.stimUses <= STIM_USES_PER_BATTLE)
    ) &&
    (
      combatState.berriesCastRound === undefined ||
      (Number.isSafeInteger(combatState.berriesCastRound) &&
        combatState.berriesCastRound >= 1 &&
        combatState.berriesCastRound <= combatState.round)
    ) &&
    (combatState.berryEffects === undefined ||
      isValidBerryEffects(combatState.berryEffects)) &&
    (combatState.stagger === undefined || [5, 6, 7, 10, 11, 12].includes(combatState.stagger)) &&
    (combatState.warbringerFury === undefined || combatState.warbringerFury === true) &&
    (combatState.titanStagger === undefined || typeof combatState.titanStagger === "boolean") &&
    (combatState.astralAwakeningSurvived === undefined ||
      (Number.isSafeInteger(combatState.astralAwakeningSurvived) &&
        combatState.astralAwakeningSurvived >= 1 &&
        combatState.astralAwakeningSurvived <= 5)) &&
    (combatState.astralAwakening === undefined ||
      combatState.astralAwakening?.offensiveRollModifier === 2) &&
    (combatState.astralEchoMastery === undefined ||
      [1, 2].includes(combatState.astralEchoMastery?.offensiveRollModifier)) &&
    (combatState.allOrNothingStreak === undefined ||
      (Number.isSafeInteger(combatState.allOrNothingStreak) &&
        combatState.allOrNothingStreak >= 0)) &&
    (combatState.faeSecondOpinion === undefined ||
      combatState.faeSecondOpinion?.offensiveRollModifier === 3) &&
    (combatState.shizukiFaeSources === undefined ||
      (Array.isArray(combatState.shizukiFaeSources) &&
        combatState.shizukiFaeSources.length >= 1 &&
        combatState.shizukiFaeSources.length <= 7 &&
        combatState.shizukiFaeSources.every((source) => [
          "elf-blessing", "fae-aid", "fae-second-opinion",
          "fae-intervention", "fae-mischief", "fae-snail", "fae-berry",
        ].includes(source)) &&
        new Set(combatState.shizukiFaeSources).size ===
          combatState.shizukiFaeSources.length)) &&
    (combatState.shizukisPresenceUsed === undefined ||
      combatState.shizukisPresenceUsed === true) &&
    (combatState.shizukisPresence === undefined ||
      (combatState.shizukisPresence?.offensiveRollModifier === 3 &&
        combatState.shizukisPresence?.bonusDamage === 15)) &&
    (combatState.helpUsed === undefined || combatState.helpUsed === true) &&
    (combatState.storytellerChapter === undefined ||
      [1, 2, 3].includes(combatState.storytellerChapter)) &&
    (combatState.storytellerActivated === undefined ||
      combatState.storytellerActivated === true) &&
    (combatState.astralRhythmPreviousSpell === undefined ||
      (typeof combatState.astralRhythmPreviousSpell === "string" &&
        /^[a-z-]+$/.test(combatState.astralRhythmPreviousSpell))) &&
    (combatState.risingPower === undefined ||
      (combatState.risingPower &&
        typeof combatState.risingPower.spellId === "string" &&
        /^[a-z-]+$/.test(combatState.risingPower.spellId) &&
        Number.isSafeInteger(combatState.risingPower.steps) &&
        combatState.risingPower.steps >= 0 && combatState.risingPower.steps <= 3)) &&
    (combatState.familiarSerial === undefined ||
      (Number.isSafeInteger(combatState.familiarSerial) &&
        combatState.familiarSerial >= 1)) &&
    (combatState.familiar === undefined ||
      (combatState.familiar &&
        Number.isSafeInteger(combatState.familiar.total) &&
        combatState.familiar.total >= 2 && combatState.familiar.total <= 12 &&
        typeof combatState.familiar.id === "string" &&
        /^[a-z-]+$/.test(combatState.familiar.id) &&
        (combatState.familiar.astralBond === undefined ||
          ["armed", "spent"].includes(combatState.familiar.astralBond)) &&
        Number.isSafeInteger(combatState.familiar.actions) &&
        combatState.familiar.actions >= 0 && combatState.familiar.actions < 5 &&
        Number.isSafeInteger(combatState.familiar.serial) &&
        combatState.familiar.serial >= 1 &&
        combatState.familiar.serial <= combatState.familiarSerial)) &&
    (combatState.familiarProtection === undefined ||
      (Array.isArray(combatState.familiarProtection) &&
        combatState.familiarProtection.length > 0 &&
        combatState.familiarProtection.every((pool) =>
          Number.isSafeInteger(pool.serial) && pool.serial >= 1 &&
          pool.serial <= combatState.familiarSerial &&
          Number.isSafeInteger(pool.amount) && pool.amount > 0 &&
          Number.isSafeInteger(pool.max) && [25, 30, 40, 48].includes(pool.max) &&
          pool.amount <= pool.max) &&
        new Set(combatState.familiarProtection.map((pool) => pool.serial)).size ===
          combatState.familiarProtection.length)) &&
    enemy &&
    typeof enemy.id === "string" &&
    /^[a-z0-9-]+$/.test(enemy.id) &&
    typeof enemy.name === "string" &&
    enemy.name.trim() &&
    Number.isSafeInteger(enemy.level) &&
    enemy.level >= 1 &&
    Number.isSafeInteger(enemy.hp) &&
    Number.isSafeInteger(enemy.maxHp) &&
    enemy.hp > 0 &&
    enemy.hp <= enemy.maxHp &&
    enemy.maxHp > 0 &&
    (enemy.protection === undefined ||
      (Number.isSafeInteger(enemy.protection) && enemy.protection >= 0)) &&
    (
      enemy.astralCharge === undefined ||
      getAstralCharge(enemy) !== null
    ) &&
    (
      combatState.mend === undefined ||
      isValidMendState(combatState.mend)
    ) &&
    (
      combatState.bubble === undefined ||
      isValidBubbleState(combatState.bubble)
    ) &&
    (
      combatState.astralEcho === undefined ||
      getAstralEcho(combatState) !== null
    ) &&
    (
      combatState.astralRebound === undefined ||
      isValidAstralRebound(combatState.astralRebound)
    ) &&
    (
      combatState.astralCuriosity === undefined ||
      isValidAstralCuriosityBonus(combatState.astralCuriosity)
    ) &&
    (
      combatState.astralPatience === undefined ||
      (combatState.astralPatience?.offensiveRollModifier === 2)
    ) &&
    (combatState.lunarPatience === undefined ||
      combatState.lunarPatience?.offensiveRollModifier === 1) &&
    (
      combatState.jellyfishResolve === undefined ||
      (
        combatState.jellyfishResolve &&
        combatState.jellyfishResolve.offensiveRollModifier === 1
      )
    ) &&
    (
      combatState.jellyfishSleepyGuard === undefined ||
      (
        combatState.jellyfishSleepyGuard &&
        combatState.jellyfishSleepyGuard.damageReduction === 5
      )
    ) &&
    (
      combatState.leviathansWake === undefined ||
      isValidLeviathansWake(combatState.leviathansWake)
    ) &&
    (combatState.wakeMantaProtection === undefined ||
      (Number.isSafeInteger(combatState.wakeMantaProtection) &&
        combatState.wakeMantaProtection > 0)) &&
    (
      combatState.perkUses === undefined ||
      (
        combatState.perkUses &&
        typeof combatState.perkUses === "object" &&
        !Array.isArray(combatState.perkUses) &&
        Object.entries(combatState.perkUses).every(([perkId, uses]) =>
          PERK_FILES[perkId] && Number.isSafeInteger(uses) && uses >= 1)
      )
    ) &&
    isValidIntegerRange(enemy.reward?.candies) &&
    isValidIntegerRange(enemy.reward?.xp, 1) &&
    Number.isSafeInteger(enemy.defeatCandyLoss) &&
    enemy.defeatCandyLoss >= 0 &&
    Number.isSafeInteger(combatState.round) &&
    combatState.round >= 1 &&
    Number.isSafeInteger(combatState.startedAt) &&
    combatState.startedAt > 0 &&
    Number.isSafeInteger(combatState.updatedAt) &&
    combatState.updatedAt >= combatState.startedAt
  );
}

async function getRegionCombatEntries(regionId) {
  const entries = await fetchCachedJson(
    `combat:${regionId}`,
    `${GITHUB_DATA_BASE}/enemies/${regionId}/index.json`,
  );

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`Invalid combat data for ${regionId}.`);
  }

  const validatedEntries = entries.map((entry, index) => {
    const encounter = Number(entry?.encounter);
    const enemy = String(entry?.enemy || "").trim();
    const savedRecommendedLevel = Number(entry?.recommendedLevel);
    const recommendedLevel =
      Number.isSafeInteger(savedRecommendedLevel) &&
      savedRecommendedLevel > 0
        ? savedRecommendedLevel
        : null;

    if (
      encounter !== index + 1 ||
      !Number.isSafeInteger(encounter) ||
      !/^[a-z0-9-]+$/.test(enemy)
    ) {
      throw new Error(`Invalid combat entry for ${regionId}.`);
    }

    return {
      encounter,
      enemy,
      recommendedLevel,
    };
  });

  return validatedEntries;
}

async function getEnemyDefinition(enemyId) {
  if (!/^[a-z0-9-]+$/.test(enemyId)) {
    throw new Error("Invalid enemy ID.");
  }

  let bossRegionId = null;
  let normalRegionId = null;

  for (const region of REGIONS) {
    const manifest = await getAdventureManifest(region.id);

    if (manifest.some((entry) => entry.bossEnemyId === enemyId)) {
      bossRegionId = region.id;
      break;
    }

    if (manifest.some((entry) => entry.enemyId === enemyId)) {
      normalRegionId = region.id;
    }
  }

  if (!bossRegionId && !normalRegionId) {
    throw new Error(`Unknown enemy ID: ${enemyId}.`);
  }

  const enemy = await fetchCachedJson(
    `enemy:${enemyId}`,
    bossRegionId
      ? `${GITHUB_DATA_BASE}/enemies/bosses/${bossRegionId}/` +
        `${enemyId}.json`
      : `${GITHUB_DATA_BASE}/enemies/${normalRegionId}/${enemyId}.json`,
  );

  return validateEnemyDefinition(enemy, enemyId);
}

function getEncounterByNumber(entries, encounterNumber) {
  if (
    !Number.isSafeInteger(encounterNumber) ||
    encounterNumber < 1
  ) {
    return null;
  }

  return entries[encounterNumber - 1] || null;
}

function getRecommendedEnemyLevel(encounter, enemy) {
  if (
    Number.isSafeInteger(encounter?.recommendedLevel) &&
    encounter.recommendedLevel > 0
  ) {
    return encounter.recommendedLevel;
  }

  if (
    Number.isSafeInteger(enemy?.level) &&
    enemy.level > 0
  ) {
    return enemy.level;
  }

  return 1;
}

async function getAdventureDefinition(regionId, adventureNumber) {
  const manifest = await getAdventureManifest(regionId);
  const manifestEntry = manifest.find(
    (entry) => entry.number === adventureNumber,
  );
  const filename = manifestEntry?.file;

  if (!filename) {
    return null;
  }

  const definition = await fetchCachedJson(
    `adventure:${regionId}:${adventureNumber}`,
    `${GITHUB_DATA_BASE}/adventures/${regionId}/${filename}`,
  );

  if (
    !definition ||
    definition.number !== adventureNumber ||
    definition.regionId !== regionId ||
    typeof definition.name !== "string" ||
    typeof definition.startRoomId !== "string" ||
    !definition.rooms?.[definition.startRoomId] ||
    typeof definition.boss?.enemyId !== "string"
  ) {
    throw new Error("Adventure data has an invalid format.");
  }

  return definition;
}

async function getAdventureManifest(regionId) {
  if (!getRegionById(regionId)) throw new Error("Unknown Adventure region.");

  const manifest = await fetchCachedJson(
    `adventure-manifest:${regionId}`,
    `${GITHUB_DATA_BASE}/adventures/${regionId}/manifest.json`,
  );

  if (
    !Array.isArray(manifest) ||
    manifest.length !== 30 ||
    manifest.some(
      (entry, index) =>
        entry?.number !== index + 1 ||
        typeof entry.id !== "string" ||
        typeof entry.name !== "string" ||
        typeof entry.enemyId !== "string" ||
        typeof entry.bossEnemyId !== "string" ||
        typeof entry.file !== "string",
    )
  ) {
    throw new Error("Adventure manifest has an invalid format.");
  }

  return manifest;
}

function getAdventureName(number, enemyName) {
  if (number === 1) return "Bubble Nibbler Hideout";
  if (number === 2) return "Silverfin Sprout Grove";
  if (number === 3) return "Tidepool Tumbler Tunnels";
  return `${enemyName} Domain`;
}

async function formatAdventureProgress(
  region,
  entries,
  highestUnlocked,
  playerLevel,
  activeAdventure,
  platform,
  requestedPage = 1,
) {
  const manifest = await getAdventureManifest(region.id);
  const pageSize = 7;
  const listedCount = Math.min(
    entries.length,
    highestUnlocked + (highestUnlocked < entries.length ? 1 : 0),
  );
  const totalPages = Math.max(1, Math.ceil(listedCount / pageSize));
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(listedCount, startIndex + pageSize);
  const visibleEntries = entries.slice(
    startIndex,
    endIndex,
  );
  const details = await Promise.all(
    visibleEntries.map(async (entry, index) => {
      const number = startIndex + index + 1;

      if (number > highestUnlocked) {
        return { number, locked: true };
      }

      const enemy = await getEnemyDefinition(entry.enemy);
      return {
        number,
        name:
          manifest[number - 1]?.name ||
          getAdventureName(number, enemy.name),
        recommendedLevel: getRecommendedEnemyLevel(entry, enemy),
      };
    }),
  );
  const parts = platform === "discord"
    ? [
        `${region.name} Adventures`,
        `Your Level: ${playerLevel}`,
        `Unlocked Adventures: ${highestUnlocked} of ${entries.length}`,
        `Page ${page} of ${totalPages}`,
      ]
    : [
        `${region.name} Adventures`,
        `Level ${playerLevel}`,
        `Unlocked ${highestUnlocked}/${entries.length}`,
        `Page ${page}/${totalPages}`,
      ];

  if (activeAdventure) {
    parts.push(
      `Current: ${activeAdventure.name} — ${activeAdventure.currentRoomId}`,
    );
  }

  for (const detail of details) {
    parts.push(
      detail.locked
        ? `${detail.number}${platform === "discord" ? "." : ""} Locked`
        : platform === "discord"
        ? `${detail.number}. ${detail.name} — ` +
          `Recommended Level ${detail.recommendedLevel}`
        : `${detail.number} ${detail.name} Lv.${detail.recommendedLevel}`,
    );
  }

  parts.push(
    platform === "discord"
      ? "Use /adventure and choose an Adventure number to begin or resume."
      : "Use !adventure <number>",
  );

  if (totalPages > 1) {
    parts.push(
      platform === "discord"
        ? `Use /adventure page:${page === totalPages ? 1 : page + 1} ` +
          "for the next page."
        : `Use !adventure list ${page === totalPages ? 1 : page + 1}`,
    );
  }

  return {
    message: parts.join(platform === "discord" ? "\n" : " | "),
  };
}

function formatAdventureRoomPrompt(definition, state, platform) {
  const room = definition.rooms[state.currentRoomId];

  if (state.status === "awaiting-boss-confirmation") {
    return platform === "discord"
      ? definition.bossPromptDiscord ||
        `${room?.prompt || "Something powerful waits ahead."}\n` +
        "Use /yes to continue or /no to retreat for now."
      : definition.bossPromptTwitch ||
        `${room?.prompt || "Something powerful waits ahead."} ` +
        "Use !yes to continue or !no to retreat for now.";
  }

  const commands = Object.keys(room?.choices || {}).map(
    (direction) =>
      `${platform === "discord" ? "/" : "!"}${direction}`,
  );
  const roomHeading =
    typeof room?.name === "string" && room.name.trim()
      ? `${room.name.trim()}: `
      : "";

  return `${roomHeading}${room?.prompt || ""} ` +
    `Choose ${commands.join(", ")}.`;
}

function formatAdventureObjective(definition, state, platform) {
  return formatAdventureRoomPrompt(definition, state, platform);
}

function getRegionCombatProgress(
  progress,
  regionId,
  encounterCount,
) {
  const savedValue =
    progress.combatProgress?.[regionId]?.highestUnlocked;
  const highestUnlocked = Number.isSafeInteger(savedValue)
    ? savedValue
    : 1;

  return Math.min(
    encounterCount,
    Math.max(1, highestUnlocked),
  );
}

function randomChoice(values) {
  return values[randomInteger(0, values.length - 1)];
}

function getAdventureChoiceXpRange(enemyLevel) {
  const level = Math.floor(Number(enemyLevel));
  const range = ADVENTURE_CHOICE_XP_BY_LEVEL[level];

  if (!range) {
    throw new Error(
      `No Adventure choice XP range is configured for enemy Level ${enemyLevel}.`,
    );
  }

  return range;
}

function normalizePlayerStats(stats) {
  const source = stats && typeof stats === "object" && !Array.isArray(stats)
    ? stats
    : {};

  return Object.fromEntries(
    Object.values(PLAYER_STATS).map((definition) => [
      definition.id,
      Math.min(
        definition.maximumRank,
        Math.max(0, Math.floor(Number(source[definition.id]) || 0)),
      ),
    ]),
  );
}

function getPlayerMaxHp(progress) {
  return PLAYER_COMBAT_MAX_HP + normalizePlayerStats(progress?.stats).vitality * 10;
}

function getPlayerMaxMana(progress) {
  return PLAYER_MAX_MANA + normalizePlayerStats(progress?.stats).focus * 10;
}

function getPlayerResourceCaps(progress) {
  const buffer = progress?.restBufferType === "long"
    ? LONG_REST_BONUS_AMOUNT
    : progress?.restBufferType === "short"
      ? REST_BONUS_AMOUNT
      : 0;

  return {
    hp: getPlayerMaxHp(progress) + buffer,
    mana: getPlayerMaxMana(progress) + buffer,
  };
}

function restoreManaToNormalCap(currentMana, amount, maximumMana, combatState = null) {
  const restored = currentMana >= maximumMana
    ? currentMana
    : Math.min(maximumMana, currentMana + amount);
  recordRegionalManaRecovery(combatState, restored - currentMana);
  return restored;
}

function getStorytellerManaCost(baseCost, combatState) {
  return combatState?.storytellerChapter === 1
    ? Math.round(baseCost * 0.8)
    : baseCost;
}

function getStorytellerChapterForEnemy(enemy) {
  if (!enemy || enemy.hp <= 0) return 0;
  if (enemy.hp * 4 < enemy.maxHp) return 3;
  if (enemy.hp * 2 < enemy.maxHp) return 2;
  if (enemy.hp * 4 < enemy.maxHp * 3) return 1;
  return 0;
}

function advanceStoryteller(combatState, activePerks, platform = "discord") {
  const storyteller = activePerks.find(
    (perk) => perk.effect.trigger === "enemy-hp-chapters",
  );
  if (!storyteller || combatState.enemy.hp <= 0) return "";
  const nextChapter = getStorytellerChapterForEnemy(combatState.enemy);
  const currentChapter = combatState.storytellerChapter || 0;
  if (nextChapter <= currentChapter) return "";
  combatState.storytellerChapter = nextChapter;
  const chapter = storyteller.effect.chapters.find(
    (entry) => entry.stage === nextChapter,
  );
  const firstActivation = combatState.storytellerActivated !== true;
  combatState.storytellerActivated = true;
  const separator = platform === "discord" ? "\n\n" : " | ";
  return [
    ...(firstActivation ? ["Storyteller Activated!"] : []),
    formatStorytellerCombatLine(chapter.heading),
    ...chapter.effects.map(formatStorytellerCombatLine),
  ].join(separator);
}

function formatStorytellerCombatLine(line) {
  return line
    .replace("Enemy Below", "Enemy below")
    .replace("THE FIRST PAGE", "The First Page")
    .replace("THE TURNING POINT", "The Turning Point")
    .replace("THE FINAL CHAPTER", "The Final Chapter")
    .replace("Mana Costs Reduced", "Mana costs reduced")
    .replace("Offensive Rolls", "offensive rolls")
    .replace("Final Damage", "final damage")
    .replace("Critical Damage", "critical damage");
}

function getStrengthDamageBonus(progress) {
  return normalizePlayerStats(progress?.stats).strength;
}

function getArmorReduction(progress) {
  return normalizePlayerStats(progress?.stats).armor;
}

function getFaeSpellRollBonus(progress) {
  return normalizePlayerStats(progress?.stats).fae;
}

function getAstralCharge(enemy) {
  const charge = enemy?.astralCharge;
  const manaReduction = Number(charge?.manaReduction);
  const damageIncrease = Number(charge?.damageIncrease);

  const remainingDamageUses = charge?.remainingDamageUses === undefined
    ? 1
    : Number(charge.remainingDamageUses);
  const manaDiscountAvailable = charge?.manaDiscountAvailable === undefined
    ? true
    : charge.manaDiscountAvailable;

  return charge &&
      typeof charge === "object" &&
      !Array.isArray(charge) &&
      Number.isFinite(manaReduction) &&
      manaReduction >= 0 &&
      manaReduction <= 1 &&
      Number.isFinite(damageIncrease) &&
      damageIncrease >= 0 &&
      Number.isSafeInteger(remainingDamageUses) &&
      remainingDamageUses >= 1 &&
      typeof manaDiscountAvailable === "boolean"
    ? {
        manaReduction,
        damageIncrease,
        remainingDamageUses,
        manaDiscountAvailable,
      }
    : null;
}

function applyPercentageDamageIncrease(damage, increase) {
  const percentage = Math.round(Number(increase) * 100);
  return Math.floor((damage * (100 + percentage) + 50) / 100);
}

function applyPercentageOfDamage(damage, percent) {
  const percentage = Math.round(Number(percent) * 100);
  return Math.floor((damage * percentage + 50) / 100);
}

function detectNaturalDiceMatch(dice) {
  if (!Array.isArray(dice) || dice.length < 2) return null;
  const counts = new Map();
  for (const die of dice) {
    if (!Number.isSafeInteger(die)) return null;
    counts.set(die, (counts.get(die) || 0) + 1);
  }
  if (dice.length === 3 && counts.size === 1) return "triple";
  return [...counts.values()].some((count) => count >= 2)
    ? "double"
    : null;
}

async function resolveAstralCuriosity(
  env,
  backpackKey,
  combatState,
  progress,
  naturalDice,
) {
  const match = detectNaturalDiceMatch(naturalDice);
  if (!match) return { progress, message: "" };
  const activePerks = await getActivePerks(levelFromXp(progress.xp));
  const curiosity = activePerks.find(
    (perk) => perk.effect.trigger === "matching-natural-dice",
  );
  if (!curiosity) return { progress, message: "" };
  if (match === "double" && combatState.perkUses?.[curiosity.id]) {
    return { progress, message: "" };
  }

  let updatedProgress = progress;
  let hpRestored = 0;
  let manaRestored = 0;
  let candiesAwarded = 0;
  let grantsOffensiveRoll = false;
  let message = "";

  if (match === "triple") {
    const rewards = curiosity.effect.tripleRewards;
    hpRestored = Math.min(
      rewards.hpRestore,
      Math.max(0, combatState.playerMaxHp - combatState.playerHp),
    );
    manaRestored = Math.min(
      rewards.manaRestore,
      Math.max(0, getPlayerResourceCaps(progress).mana - progress.mana),
    );
    candiesAwarded = rewards.candies;
    grantsOffensiveRoll = true;
    message = randomChoice(curiosity.tripleLines)
      .replace("10 HP", `${hpRestored} HP`)
      .replace("10 Mana", `${manaRestored} Mana`);
  } else {
    combatState.perkUses = {
      ...(combatState.perkUses || {}),
      [curiosity.id]: 1,
    };
    const outcome = randomChoice(curiosity.effect.doubleOutcomes);
    message = outcome.line;
    if (outcome.effectType === "restore-hp") {
      hpRestored = Math.min(
        outcome.amount,
        Math.max(0, combatState.playerMaxHp - combatState.playerHp),
      );
      message = hpRestored > 0
        ? message.replace("10 HP", `${hpRestored} HP`)
        : "Curiosity activates! The matching dice shimmer as a suspiciously familiar Fae light wraps around you. Somewhere very far away, you get the distinct impression Shizuki is pleased with herself. Your HP is already full.";
    } else if (outcome.effectType === "restore-mana") {
      manaRestored = Math.min(
        outcome.amount,
        Math.max(0, getPlayerResourceCaps(progress).mana - progress.mana),
      );
      message = manaRestored > 0
        ? message.replace("10 Mana", `${manaRestored} Mana`)
        : "Curiosity activates! The matching dice sparkle and Astral energy suddenly rushes back into you. For just a moment, you swear you hear someone quietly say, *“You're welcome~”* Your Mana is already full.";
    } else if (outcome.effectType === "award-candies") {
      candiesAwarded = outcome.amount;
    } else if (outcome.effectType === "offensive-roll") {
      grantsOffensiveRoll = true;
    }
  }

  combatState.playerHp += hpRestored;
  if (manaRestored > 0) {
    recordRegionalManaRecovery(combatState, manaRestored);
    updatedProgress = {
      ...updatedProgress,
      mana: updatedProgress.mana + manaRestored,
    };
    await savePlayerProgress(env, backpackKey, updatedProgress);
  }
  if (candiesAwarded > 0) {
    const currentTotal = await getBackpackTotal(env, backpackKey);
    await saveBackpackTotal(env, backpackKey, currentTotal + candiesAwarded);
  }
  if (grantsOffensiveRoll) {
    combatState.astralCuriosity = {
      offensiveRollModifier: curiosity.effect.offensiveRollModifier,
    };
  }
  return { progress: updatedProgress, message };
}

function applyLuckToCandyReward(baseReward, progress) {
  const rank = normalizePlayerStats(progress?.stats).luck;
  const total = Math.max(baseReward, Math.floor(baseReward * (1 + rank * 0.02)));
  return { base: baseReward, bonus: total - baseReward, total };
}

function getLuckBerryChanceBonus(progress) {
  return normalizePlayerStats(progress?.stats).luck * 0.01;
}

function applyXpAndStatPointProgression(progress, xpGained) {
  const startingLevel = levelFromXp(progress.xp);
  const xp = progress.xp + Math.max(0, Math.floor(Number(xpGained) || 0));
  const endingLevel = levelFromXp(xp);
  const grantedThrough = Math.max(
    1,
    Math.floor(Number(progress.statPointsGrantedThroughLevel) || startingLevel),
  );
  const pointsEarned = Math.max(0, endingLevel - grantedThrough);

  return {
    progress: {
      ...progress,
      xp,
      unspentStatPoints: progress.unspentStatPoints + pointsEarned,
      statPointsGrantedThroughLevel: Math.max(grantedThrough, endingLevel),
    },
    startingLevel,
    endingLevel,
    pointsEarned,
  };
}

function formatStatPointAward(pointsEarned, unspent, platform) {
  if (pointsEarned < 1) return "";
  const commands = platform === "discord"
    ? "/vitality, /focus, /strength, /luck, /armor, or /fae"
    : "!vitality, !focus, !strength, !luck, !armor, or !fae";
  return `You earned ${pointsEarned} Stat Point${pointsEarned === 1 ? "" : "s"}. ` +
    `Choose ${commands}. Unspent Stat Points: ${unspent}`;
}

function normalizeStatusEffects(
  statusEffects,
  now = Date.now(),
  activeMasteries = [],
) {
  if (
    !statusEffects ||
    typeof statusEffects !== "object" ||
    Array.isArray(statusEffects)
  ) {
    return {};
  }

  const normalized = {};

  for (const [effectId, effect] of Object.entries(statusEffects)) {
    if (
      !/^[a-z0-9_]+$/.test(effectId) ||
      !effect ||
      typeof effect !== "object" ||
      Array.isArray(effect)
    ) {
      continue;
    }

    const savedDurationType = String(
      effect.durationType || "charges",
    ).trim();
    let durationType = savedDurationType === "time"
      ? "time"
      : "charges";
    let startedAt = Math.max(
      0,
      Math.floor(Number(effect.startedAt || effect.createdAt) || 0),
    );
    let expiresAt = Math.max(
      0,
      Math.floor(Number(effect.expiresAt) || 0),
    );
    let remainingCharges = Math.max(
      0,
      Math.floor(Number(effect.remainingCharges) || 0),
    );

    const isElfBlessing = effectId === "elf_blessing";
    const elfBlessingMastery = isElfBlessing
      ? activeMasteries.find((mastery) =>
          mastery.spellId === "elf_blessing" &&
          mastery.effect.id === "elf-blessing-upgrade")
      : null;

    if (isElfBlessing && durationType === "charges") {
      durationType = "time";
      startedAt = now;
      expiresAt = now + LEGACY_ELF_BLESSING_DURATION_MS;
      remainingCharges = 0;
    }

    if (
      elfBlessingMastery &&
      durationType === "time" &&
      expiresAt > now
    ) {
      expiresAt = startedAt + elfBlessingMastery.effect.durationMs;
    }

    if (
      durationType === "time"
        ? expiresAt <= now
        : remainingCharges < 1
    ) {
      continue;
    }

    normalized[effectId] = {
      id: effectId,
      displayName:
        isElfBlessing
          ? "Elf Blessing"
          : String(effect.displayName || effectId).trim() || effectId,
      description: isElfBlessing
        ? elfBlessingMastery
          ? `+${elfBlessingMastery.effect.offensiveRollModifier} to offensive rolls`
          : String(effect.description || "+2 to offensive rolls").trim()
        : String(effect.description || "").trim(),
      category: String(effect.category || "neutral").trim(),
      source: String(effect.source || "unknown").trim(),
      visibility: effect.visibility === "hidden" ? "hidden" : "public",
      durationType,
      ...(durationType === "time"
        ? { startedAt, expiresAt }
        : { remainingCharges }),
      trigger: isElfBlessing
        ? OFFENSIVE_ROLL_TRIGGER
        : String(effect.trigger || "").trim(),
      modifiers: {
        attackRoll: elfBlessingMastery
          ? elfBlessingMastery.effect.offensiveRollModifier
          : Number.isSafeInteger(Number(effect.modifiers?.attackRoll))
            ? Number(effect.modifiers.attackRoll)
            : isElfBlessing
              ? 2
              : 0,
      },
      createdAt: Math.max(
        0,
        Math.floor(Number(effect.createdAt) || 0),
      ),
    };
  }

  return normalized;
}

function getStatusEffect(progress, effectId) {
  return normalizeStatusEffects(progress.statusEffects)[effectId] || null;
}

function hasStatusEffect(progress, effectId) {
  return Boolean(getStatusEffect(progress, effectId));
}

function addStatusEffect(progress, effect) {
  return {
    ...normalizeStatusEffects(progress.statusEffects),
    [effect.id]: normalizeStatusEffects({
      [effect.id]: effect,
    })[effect.id],
  };
}

function removeStatusEffect(progress, effectId) {
  const statusEffects = normalizeStatusEffects(progress.statusEffects);
  delete statusEffects[effectId];
  return statusEffects;
}

function createElfBlessingEffect(spell, mastery = null, now = Date.now()) {
  const modifier = mastery?.effect.offensiveRollModifier || spell.modifier;
  const durationMs = mastery?.effect.durationMs || spell.durationMs;
  return {
    id: "elf_blessing",
    displayName: "Elf Blessing",
    description: `+${modifier} to offensive rolls`,
    category: "buff",
    source: "spell",
    visibility: "public",
    durationType: "time",
    startedAt: now,
    expiresAt: now + durationMs,
    trigger: OFFENSIVE_ROLL_TRIGGER,
    modifiers: {
      attackRoll: modifier,
    },
    createdAt: now,
  };
}

function countOffensiveRollBonusSources(roll) {
  return new Set(
    roll.modifierDetails
      .filter((detail) => detail.value > 0)
      .map((detail) => detail.name),
  ).size;
}

function consumeTriggeredStatusEffects(
  progress,
  trigger,
  naturalRoll,
  combatState = null,
  offensiveSpell = false,
) {
  const statusEffects = normalizeStatusEffects(progress.statusEffects);
  const applied = [];
  const modifierDetails = [];
  const consumed = [];
  let modifier = 0;

  for (const [effectId, effect] of Object.entries(statusEffects)) {
    if (effect.trigger !== trigger) {
      continue;
    }

    modifier += effect.modifiers.attackRoll;
    applied.push(effect.displayName);
    modifierDetails.push({
      name: effect.displayName,
      value: effect.modifiers.attackRoll,
    });

    if (effect.durationType === "charges") {
      effect.remainingCharges -= 1;
      consumed.push(effect.displayName);

      if (effect.remainingCharges < 1) {
        delete statusEffects[effectId];
      }
    }
  }

  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.astralRebound) {
    const reboundModifier = combatState.astralRebound.offensiveRollModifier;
    modifier += reboundModifier;
    applied.push("Astral Rebound");
    modifierDetails.push({
      name: "Astral Rebound",
      value: reboundModifier,
    });
    delete combatState.astralRebound;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.astralCuriosity) {
    const curiosityModifier =
      combatState.astralCuriosity.offensiveRollModifier;
    modifier += curiosityModifier;
    applied.push("Curiosity");
    modifierDetails.push({
      name: "Curiosity",
      value: curiosityModifier,
    });
    delete combatState.astralCuriosity;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.jellyfishResolve) {
    const resolveModifier = combatState.jellyfishResolve.offensiveRollModifier;
    modifier += resolveModifier;
    applied.push("Jellyfish Resolve");
    modifierDetails.push({ name: "Jellyfish Resolve", value: resolveModifier });
    delete combatState.jellyfishResolve;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.astralPatience) {
    const patienceModifier = combatState.astralPatience.offensiveRollModifier;
    modifier += patienceModifier;
    applied.push("Patience");
    modifierDetails.push({ name: "Patience", value: patienceModifier });
    delete combatState.astralPatience;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.astralAwakening) {
    const awakeningModifier = combatState.astralAwakening.offensiveRollModifier;
    modifier += awakeningModifier;
    applied.push("Awakening");
    modifierDetails.push({ name: "Awakening", value: awakeningModifier });
    delete combatState.astralAwakening;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.astralEchoMastery) {
    const echoModifier = combatState.astralEchoMastery.offensiveRollModifier;
    modifier += echoModifier;
    applied.push("Echo Mastery I");
    modifierDetails.push({ name: "Echo Mastery I", value: echoModifier });
    delete combatState.astralEchoMastery;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.faeSecondOpinion) {
    const opinionModifier = combatState.faeSecondOpinion.offensiveRollModifier;
    modifier += opinionModifier;
    applied.push("Fae Second Opinion");
    modifierDetails.push({ name: "Fae Second Opinion", value: opinionModifier });
    delete combatState.faeSecondOpinion;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && offensiveSpell &&
      combatState?.shizukisPresence) {
    const presenceModifier = combatState.shizukisPresence.offensiveRollModifier;
    modifier += presenceModifier;
    applied.push("Shizuki's Presence");
    modifierDetails.push({ name: "Shizuki's Presence", value: presenceModifier });
    delete combatState.shizukisPresence;
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER &&
      combatState?.storytellerChapter === 2) {
    modifier += 2;
    applied.push("Storyteller");
    modifierDetails.push({ name: "Storyteller", value: 2 });
  }
  if (trigger === OFFENSIVE_ROLL_TRIGGER && combatState?.berryEffects?.rollBonuses) {
    for (const [name, value] of Object.entries(combatState.berryEffects.rollBonuses)) {
      if (name === "Fae Berry" && !offensiveSpell) continue;
      modifier += value;
      applied.push(name);
      modifierDetails.push({ name, value });
      delete combatState.berryEffects.rollBonuses[name];
    }
    if (Object.keys(combatState.berryEffects.rollBonuses).length === 0) {
      delete combatState.berryEffects.rollBonuses;
    }
  }

  return {
    naturalRoll,
    modifier,
    finalTotal: naturalRoll + modifier,
    applied,
    modifierDetails,
    consumed,
    statusEffects,
  };
}

function formatActiveEffects(progress, platform = "twitch") {
  const visibleEffects = Object.values(
    normalizeStatusEffects(progress.statusEffects),
  ).filter((effect) => effect.visibility === "public");

  if (visibleEffects.length === 0) {
    return "";
  }

  if (platform === "discord") {
    return "**Active Effects**\n\n" +
      visibleEffects.map(
        (effect) =>
          `- ${effect.displayName} — ${effect.description}` +
          (effect.durationType === "time"
            ? `\n  Remaining: ${formatEffectRemaining(effect)}`
            : ""),
      ).join("\n");
  }

  return "Effects: " + visibleEffects.map(
    (effect) => {
      const description = effect.description
        .replace("+2 to offensive rolls", "+2 rolls");
      const remaining = effect.durationType === "time"
        ? `, ${formatEffectRemaining(effect)}`
        : "";

      return description
        ? `${effect.displayName} (${description}${remaining})`
        : `${effect.displayName}${remaining}`;
    },
  ).join(", ");
}

function formatEffectRemaining(effect, now = Date.now()) {
  const remainingSeconds = Math.max(
    1,
    Math.ceil((Number(effect?.expiresAt) - now) / 1000),
  );
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

async function formatCombatProgress(
  region,
  entries,
  highestUnlocked,
  playerLevel,
  platform,
) {
  const visibleEntries = entries.slice(
    0,
    Math.min(entries.length, highestUnlocked + 1),
  );
  const enemyDetails = await Promise.all(
    visibleEntries.map(async (entry) => {
      try {
        const enemy = await getEnemyDefinition(entry.enemy);

        return {
          name: enemy.name,
          recommendedLevel: getRecommendedEnemyLevel(
            entry,
            enemy,
          ),
        };
      } catch {
        return {
          name: entry.enemy,
          recommendedLevel: getRecommendedEnemyLevel(entry, null),
        };
      }
    }),
  );
  const lines = platform === "discord"
    ? [
        `${region.name} Adventure Progress`,
        `Your Level: ${playerLevel}`,
        `Unlocked Adventures: ${highestUnlocked} of ${entries.length}`,
      ]
    : [
        `${region.name} | Level ${playerLevel} | ` +
        `Adventures: ${highestUnlocked}/${entries.length}`,
      ];

  for (let index = 0; index < highestUnlocked; index += 1) {
    const enemy = enemyDetails[index];
    const challenging =
      enemy.recommendedLevel > playerLevel;

    lines.push(
      platform === "discord"
        ? `${index + 1}. ${enemy.name} — ` +
          `Recommended Level ${enemy.recommendedLevel}` +
          (challenging ? " — Challenging" : "")
        : `${index + 1} ${enemy.name} Lv.${enemy.recommendedLevel}` +
          (challenging ? " [Challenging]" : ""),
    );
  }

  if (highestUnlocked < entries.length) {
    lines.push(
      platform === "discord"
        ? `${highestUnlocked + 1}. Locked`
        : `${highestUnlocked + 1} Locked`,
    );
  }

  const command = platform === "discord" ? "/adventure" : "!adventure";
  lines.push(
    platform === "discord"
      ? highestUnlocked === 1
        ? `Use ${command} 1 to select an Adventure.`
        : `Use ${command} 1 through ${command} ${highestUnlocked} ` +
          "to select an Adventure."
      : highestUnlocked === 1
        ? "Use !adventure 1"
        : `Use !adventure 1-${highestUnlocked}`,
  );

  return {
    playerLevel,
    highestUnlocked,
    totalEncounters: entries.length,
    message: lines.join(platform === "discord" ? "\n" : " | "),
  };
}

async function unlockNextEncounterAfterVictory(
  combatState,
  progress,
) {
  let entries;

  try {
    entries = await getRegionCombatEntries(combatState.regionId);
  } catch (error) {
    console.error("Combat progression lookup failed:", error);
    return null;
  }

  let encounterNumber = combatState.encounterNumber;

  if (!Number.isSafeInteger(encounterNumber)) {
    const matchingEncounters = entries.filter(
      (entry) => entry.enemy === combatState.enemy.id,
    );

    if (matchingEncounters.length !== 1) {
      return null;
    }

    encounterNumber = matchingEncounters[0].encounter;
  }

  const currentHighest = getRegionCombatProgress(
    progress,
    combatState.regionId,
    entries.length,
  );

  if (
    encounterNumber !== currentHighest ||
    currentHighest >= entries.length
  ) {
    return null;
  }

  const nextNumber = currentHighest + 1;
  const nextEncounter = getEncounterByNumber(entries, nextNumber);
  let nextEnemy;
  let nextAdventureName;

  try {
    nextEnemy = await getEnemyDefinition(nextEncounter.enemy);
    const manifest = await getAdventureManifest(combatState.regionId);
    nextAdventureName = manifest[nextNumber - 1]?.name;
  } catch (error) {
    console.error("Unlocked enemy lookup failed:", error);
    return null;
  }

  return {
    combatProgress: {
      ...(progress.combatProgress || {}),
      [combatState.regionId]: {
        highestUnlocked: nextNumber,
      },
    },
    unlockedEncounter: {
      number: nextNumber,
      name: nextEnemy.name,
      adventureName: nextAdventureName,
      recommendedLevel: getRecommendedEnemyLevel(
        nextEncounter,
        nextEnemy,
      ),
    },
  };
}

function freezeStaticDefinition(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeStaticDefinition(child);
    Object.freeze(value);
  }
  return value;
}

async function fetchCachedJson(cacheKey, url) {
  // Keep loader call sites and validation unchanged; URLs are now lookup keys only.
  const relative = String(url).startsWith(GITHUB_DATA_BASE + "/")
    ? String(url).slice(GITHUB_DATA_BASE.length + 1) : null;
  if (!relative || typeof STATIC_GAME_JSON === "undefined" ||
      !Object.prototype.hasOwnProperty.call(STATIC_GAME_JSON, relative)) {
    throw tagRuntimeError(new Error("Missing bundled game content: " +
      (relative || cacheKey) + ". Rebuild dist/worker.js."), "content.bundle");
  }
  if (!DATA_CACHE.has(relative)) {
    try {
      DATA_CACHE.set(relative, freezeStaticDefinition(JSON.parse(STATIC_GAME_JSON[relative])));
    } catch (error) {
      throw tagRuntimeError(error, "content.json");
    }
  }
  return DATA_CACHE.get(relative);
}

function validateSpellDefinition(spell, expectedId) {
  const isPositiveInteger = (value) =>
    Number.isSafeInteger(Number(value)) && Number(value) > 0;
  const isTextArray = (value) =>
    Array.isArray(value) && value.length > 0 &&
    value.every((entry) => typeof entry === "string" && entry.trim());

  if (
    !spell ||
    spell.id !== expectedId ||
    typeof spell.name !== "string" ||
    !spell.name.trim() ||
    !isTextArray(spell.aliases) ||
    !isPositiveInteger(spell.requiredLevel) ||
    !Number.isFinite(Number(spell.manaCost)) ||
    Number(spell.manaCost) < 0 ||
    ![
      "offensive",
      "timed-support",
      "healing-support",
      "defensive",
      "pre-action-support",
      "pre-action-utility",
      "mana-recovery",
      "ultimate",
    ].includes(spell.type)
  ) {
    throw new Error(`Invalid spell definition for ${expectedId}.`);
  }

  if (spell.type === "ultimate" || expectedId === "help") {
    if (expectedId !== "help" || spell.name !== "Help!" ||
        spell.type !== "ultimate" || spell.requiredLevel !== 50 ||
        spell.manaCost !== 0 || !spell.aliases.includes("help") ||
        !spell.aliases.includes("help!") || !isTextArray(spell.opening) ||
        !isTextArray(spell.successLines) || !isTextArray(spell.failureLines)) {
      throw new Error("Invalid Help! content data.");
    }
  }

  if (spell.type === "mana-recovery" && (
    spell.id !== "evocation" || spell.requiredLevel !== 5 || spell.manaCost !== 0 ||
    spell.cooldownTurns !== 7 || !isTextArray(spell.successLines) ||
    spell.successLines.length !== 26 || typeof spell.fullManaLine !== "string"
  )) throw new Error("Invalid Evocation content data.");

  if (spell.id === "berries" && (
    spell.id !== "berries" || spell.requiredLevel !== 24 ||
    spell.manaCost !== 20 || spell.damage?.dice !== 1 ||
    spell.damage?.sides !== 20 ||
    !Array.isArray(spell.outcomes) || spell.outcomes.length !== 20 ||
    spell.outcomes.some((outcome, index) =>
      outcome.roll !== index + 1 ||
      typeof outcome.text !== "string" ||
      !outcome.text.startsWith(`Roll ${index + 1} → `) ||
      outcome.text.includes("\n"))
  )) throw new Error("Invalid Berries content data.");

  if (spell.id === "familiar") {
    const expected = [
      ["astral-dragonling", "Astral Dragonling", 10, 0, 0, 0],
      ["star-crab", "Star Crab", 5, 0, 0, 5],
      ["fae-snail", "Fae Snail", 0, 8, 0, 0],
      ["moonlit-bird", "Moonlit Bird", 0, 0, 8, 0],
      ["puffer-fish", "Puffer Fish", 0, 0, 0, 8],
      ["moon-sprite", "Moon Sprite", 0, 5, 5, 0],
      ["jelly-fish", "Jelly Fish", 5, 0, 5, 0],
      ["wishshell", "Wishshell", 0, 5, 0, 5],
      ["comet-fish", "Comet Fish", 8, 0, 0, 0],
      ["fae-leaf", "Fae Leaf", 5, 10, 0, 0],
      ["astral-wyrmling", "Astral Wyrmling", 10, 10, 10, 0],
    ];
    if (spell.type !== "pre-action-utility" || spell.requiredLevel !== 30 ||
        spell.manaCost !== 30 || spell.damage?.dice !== 2 ||
        spell.damage?.sides !== 6 || !Array.isArray(spell.familiars) ||
        spell.familiars.length !== expected.length ||
        spell.familiars.some((entry, index) => {
          const [id, name, damage, hp, mana, protection] = expected[index];
          return entry.total !== index + 2 || entry.id !== id || entry.name !== name ||
            (entry.effect?.damage || 0) !== damage ||
            (entry.effect?.hp || 0) !== hp ||
            (entry.effect?.mana || 0) !== mana ||
            (entry.effect?.protection || 0) !== protection ||
            !isTextArray(entry.intros) || entry.intros.length !== 3 ||
            [entry.action2, entry.action3, entry.action4, entry.outro].some(
              (line) => typeof line !== "string" || !line.trim(),
            );
        })) throw new Error("Invalid Familiar content data.");
  }

  if (spell.type === "offensive") {
    if (spell.id !== "falling-star" && spell.id !== "conjure-gun" && (
      !isPositiveInteger(spell.damage?.dice) ||
      !isPositiveInteger(spell.damage?.sides) ||
      !isPositiveInteger(spell.criticalThreshold) ||
      !Number.isFinite(Number(spell.criticalDamage)) ||
      Number(spell.criticalDamage) < 0
    )) {
      throw new Error(`Invalid offensive spell definition for ${expectedId}.`);
    }
  }
  if (spell.id === "all-or-nothing" && (
    spell.requiredLevel !== 35 || spell.manaCost !== 20 ||
    spell.damage?.dice !== 1 || spell.damage?.sides !== 2 ||
    spell.baseDamagePerWin !== 25 || spell.opener !== "You leave it to chance." ||
    ["failure", "firstSuccess", "secondSuccess", "thirdSuccess",
      "fourthSuccess", "fifthPlusSuccess", "highStreakFailure"].some(
      (tier) => !isTextArray(spell.flavor?.[tier]))
  )) throw new Error("Invalid All or Nothing content data.");
  if (expectedId === "conjure-gun" && (
    spell.name !== "Conjure Gun" || spell.requiredLevel !== 45 ||
    spell.manaCost !== 35 || spell.type !== "offensive" ||
    spell.damage?.dice !== 140 || spell.damage?.min !== 0 ||
    spell.damage?.max !== 1 ||
    !isTextArray(spell.flavor) || spell.flavor.length !== 15 ||
    spell.levelUpLine !==
      "lvl 45 Spell 🔫 Conjure Gun: Cast Conjure Gun for 35 Mana. Conjure an Astral gun and rapidly fire 140 shots. Each shot rolls either 0 or 1. A 1 hits and deals 1 damage, while a 0 misses. Add all successful hits together, then add Strength to determine the final damage."
  )) throw new Error("Invalid Conjure Gun content data.");
  if (expectedId === "tidal-wave") {
    const tiers = [
      ["rising", "Rising Tide", 14, 40, 5],
      ["surging", "Surging Tide", 19, 50, 2],
      ["astral", "Astral Tide", 24, 55, 3],
      ["critical", "Critical Tidal Wave", null, 65, 4],
    ];
    if (spell.name !== "Tidal Wave" || spell.requiredLevel !== 40 ||
        spell.manaCost !== 30 || spell.damage?.dice !== 3 ||
        spell.damage?.sides !== 12 || spell.criticalThreshold !== 25 ||
        spell.criticalDamage !== 65 || !Array.isArray(spell.damageTiers) ||
        spell.damageTiers.length !== tiers.length ||
        spell.damageTiers.some((tier, index) => {
          const [id, displayName, finalMaximum, baseDamage, sceneCount] = tiers[index];
          return tier.id !== id || tier.displayName !== displayName ||
            tier.finalMaximum !== finalMaximum || tier.baseDamage !== baseDamage ||
            !Array.isArray(tier.scenes) || tier.scenes.length !== sceneCount ||
            tier.scenes.some((scene) => !isTextArray(scene));
        }) || spell.levelUpLine !==
        "lvl 40 Spell 🌊 Tidal Wave: Cast Tidal Wave for 30 Mana and roll 3d12. Add the dice together and apply offensive roll bonuses to determine the strength of the wave. Rolls 3-14 deal 40 damage, 15-19 deal 50 damage, 20-24 deal 55 damage, and 25+ critically hits for 65 damage.") {
      throw new Error("Invalid Tidal Wave content data.");
    }
  }

  if (spell.type === "timed-support") {
    if (
      typeof spell.effectId !== "string" ||
      !spell.effectId.trim() ||
      !isPositiveInteger(spell.durationMs) ||
      !Number.isFinite(Number(spell.modifier)) ||
      !isTextArray(spell.successScenes) ||
      !isTextArray(spell.recastScenes)
    ) {
      throw new Error(`Invalid timed support spell definition for ${expectedId}.`);
    }
  }

  if (spell.type === "healing-support") {
    if (
      spell.id !== "mend" ||
      Number(spell.damage?.dice) !== 1 ||
      Number(spell.damage?.sides) !== 12 ||
      Number(spell.triggerCount) !== 3 ||
      !Array.isArray(spell.healingTiers) ||
      spell.healingTiers.length !== 4 ||
      spell.healingTiers.some(
        (tier) =>
          typeof tier.id !== "string" ||
          typeof tier.displayName !== "string" ||
          !isPositiveInteger(tier.naturalMaximum) ||
          !isPositiveInteger(tier.healingPerTrigger) ||
          typeof tier.narration !== "string" ||
          !tier.narration.trim(),
      ) ||
      Number(spell.criticalFlavorChance) !== 0.25 ||
      !isTextArray(spell.criticalFlavor) ||
      spell.criticalFlavor.length !== 5
    ) {
      throw new Error("Invalid Mend content data.");
    }
  }

  if (spell.type === "defensive") {
    if (
      spell.id !== "bubble" ||
      Number(spell.damage?.dice) !== 1 ||
      Number(spell.damage?.sides) !== 12 ||
      !Array.isArray(spell.protectionTiers) ||
      spell.protectionTiers.length !== 4 ||
      spell.protectionTiers.some((tier) =>
        typeof tier.id !== "string" ||
        typeof tier.displayName !== "string" ||
        !isPositiveInteger(tier.naturalMaximum) ||
        !isPositiveInteger(tier.protection) ||
        typeof tier.narration !== "string" ||
        !tier.narration.trim()) ||
      !isTextArray(spell.activationLines) ||
      spell.activationLines.length !== 5 ||
      !isTextArray(spell.survivalLines) ||
      spell.survivalLines.length !== 6 ||
      Number(spell.criticalFlavorChance) !== 0.25 ||
      !isTextArray(spell.criticalFlavor) ||
      spell.criticalFlavor.length !== 5
    ) {
      throw new Error("Invalid Bubble content data.");
    }
  }

  if (spell.type === "pre-action-support") {
    if (
      spell.id !== "astral-echo" ||
      Number(spell.damage?.dice) !== 1 ||
      Number(spell.damage?.sides) !== 4 ||
      !Array.isArray(spell.echoTiers) ||
      spell.echoTiers.length !== 4 ||
      spell.echoTiers.some((tier) =>
        typeof tier.id !== "string" ||
        typeof tier.displayName !== "string" ||
        !isPositiveInteger(tier.naturalRoll) ||
        !Number.isFinite(Number(tier.damagePercent)) ||
        Number(tier.damagePercent) <= 0 ||
        Number(tier.damagePercent) > 1 ||
        typeof tier.narration !== "string" ||
        !tier.narration.trim()) ||
      typeof spell.activationLine !== "string" ||
      !spell.activationLine.includes("{echoDamage}")
    ) {
      throw new Error("Invalid Echo content data.");
    }
  }

  if (expectedId === "jelly" && (
    !Array.isArray(spell.personalities) ||
    spell.personalities.length !== 5 ||
    typeof spell.criticalText !== "string" ||
    !spell.criticalText.trim() ||
    !isTextArray(spell.legacy?.perfectJellyfishScenes) ||
    spell.legacy.perfectJellyfishScenes.length !== 2
  )) {
    throw new Error("Invalid Jellyfish narration data.");
  }

  if (expectedId === "star-spark" && (
    !Array.isArray(spell.narrationTiers) ||
    spell.narrationTiers.length !== 5 ||
    Number(spell.astralCharge?.manaReduction) !== 0.5 ||
    Number(spell.astralCharge?.damageIncrease) !== 0.15 ||
    spell.astralCharge?.stackable !== false ||
    !Number.isFinite(Number(spell.criticalFlavorChance)) ||
    Number(spell.criticalFlavorChance) < 0 ||
    Number(spell.criticalFlavorChance) > 1 ||
    !isTextArray(spell.criticalFlavor) ||
    spell.criticalFlavor.length !== 5
  )) {
    throw new Error("Invalid Star Spark content data.");
  }

  if (expectedId === "moonbeam" && (
    spell.damage.keepHighest !== true ||
    !isPositiveInteger(spell.damage.bonusDieSides) ||
    !Array.isArray(spell.narrationTiers) ||
    spell.narrationTiers.length !== 5 ||
    !Number.isFinite(Number(spell.criticalFlavorChance)) ||
    Number(spell.criticalFlavorChance) < 0 ||
    Number(spell.criticalFlavorChance) > 1 ||
    !isTextArray(spell.criticalFlavor) ||
    !isTextArray(spell.legacy?.fullMoonScenes) ||
    spell.legacy.fullMoonScenes.length !== 3
  )) {
    throw new Error("Invalid Moonbeam content data.");
  }

  if (expectedId === "falling-star" && (
    Number(spell.power?.dice) !== 3 ||
    Number(spell.power?.sides) !== 10 ||
    Number(spell.accuracy?.dice) !== 1 ||
    Number(spell.accuracy?.sides) !== 20 ||
    Number(spell.glancingPenalty) !== 5 ||
    Number(spell.criticalBonus) !== 27 ||
    !Array.isArray(spell.powerTiers) ||
    spell.powerTiers.length !== 3 ||
    !Array.isArray(spell.narrationPools) ||
    spell.narrationPools.length !== 12 ||
    spell.narrationPools.some((pool) =>
      !["low", "medium", "high"].includes(pool.powerTier) ||
      !["miss", "glancing", "direct", "critical"].includes(pool.outcome) ||
      !isTextArray(pool.lines)) ||
    Number(spell.naturalTwentyFlavorChance) !== 0.25 ||
    !isTextArray(spell.naturalTwentyFlavor) ||
    spell.naturalTwentyFlavor.length !== 2 ||
    Number(spell.highPowerNaturalOneFlavorChance) !== 0.25 ||
    typeof spell.highPowerNaturalOneFlavor !== "string" ||
    !spell.highPowerNaturalOneFlavor.trim()
  )) {
    throw new Error("Invalid Falling Star content data.");
  }

  if (expectedId === "leviathans-wake") {
    const tiers = [
      ["wakefin", 1, 12], ["astral-manta", 7, 22],
      ["deepwake-serpent", 13, 30], ["leviathan", 19, 40], ["ancient-one", 20, 55],
    ];
    if (
      spell.type !== "offensive" || spell.mechanic !== "delayed-wake" ||
      spell.requiredLevel !== 20 || spell.manaCost !== 30 ||
      spell.damage?.dice !== 1 || spell.damage?.sides !== 20 ||
      spell.criticalThreshold !== 20 || spell.criticalDamage !== 55 ||
      !Array.isArray(spell.creatureTiers) || spell.creatureTiers.length !== tiers.length ||
      spell.creatureTiers.some((tier, index) =>
        tier.id !== tiers[index][0] || tier.naturalMaximum !== tiers[index][1] ||
        tier.baseDamage !== tiers[index][2] ||
        !isTextArray([tier.displayName, tier.cast, tier.warning, tier.arrival])) ||
      spell.ancientFlavorChance !== 0.25 || spell.easterEggChance !== 0.25 ||
      !isTextArray([
        spell.duplicateCastLine, spell.ancientFlavor, spell.echoActivationLine,
        spell.easterEggs?.bubble, spell.easterEggs?.mend, spell.easterEggs?.combined,
      ]) || !spell.echoActivationLine.includes("{echoDamage}")
    ) {
      throw new Error("Invalid Leviathan's Wake content data.");
    }
  }

  return spell;
}

function validateMasteryDefinition(mastery, expectedId) {
  if (
    !mastery ||
    mastery.id !== expectedId ||
    typeof mastery.name !== "string" ||
    !mastery.name.trim() ||
    typeof mastery.spellId !== "string" ||
    !SPELL_FILES[mastery.spellId] ||
    !Number.isSafeInteger(Number(mastery.requiredLevel)) ||
    Number(mastery.requiredLevel) < 1 ||
    !Number.isSafeInteger(Number(mastery.tier)) ||
    Number(mastery.tier) < 1 ||
    typeof mastery.description !== "string" ||
    !mastery.description.trim()
  ) {
    throw new Error(`Invalid mastery definition for ${expectedId}.`);
  }

  const effect = mastery.effect;
  const validStarSparkMastery = expectedId === "starspark-mastery-1" &&
    effect?.id === "astral-charge" &&
    Number.isSafeInteger(Number(effect.damageUses)) &&
    Number(effect.damageUses) >= 1 &&
    Number.isSafeInteger(Number(effect.manaDiscountUses)) &&
    Number(effect.manaDiscountUses) >= 0 &&
    Number(effect.manaDiscountUses) <= Number(effect.damageUses);
  const validStarSparkMasteryII = expectedId === "starspark-mastery-2" &&
    mastery.spellId === "star-spark" && mastery.requiredLevel === 26 &&
    mastery.tier === 2 && effect?.id === "astral-charge-detonation" &&
    effect.damage === 20 && Array.isArray(mastery.flavor) &&
    mastery.flavor.length === 6 &&
    mastery.flavor.every((line) => typeof line === "string" && line.trim());
  const validMoonbeamMastery = expectedId === "moonbeam-mastery-1" &&
    mastery.spellId === "moonbeam" && mastery.requiredLevel === 27 &&
    mastery.tier === 1 && effect?.id === "lunar-alignment" &&
    effect.moonlightDice === 2 && effect.normalDamage === 5 &&
    effect.criticalDamage === 20;
  const validMeteorAlignment = expectedId === "falling-star-mastery-1" &&
    mastery.name === "Meteor Alignment" &&
    mastery.spellId === "falling-star" && mastery.requiredLevel === 41 &&
    mastery.tier === 1 && effect?.id === "meteor-alignment" &&
    effect.doublePower === 10 && effect.triplePower === 20 &&
    effect.totalSevenPower === 15 &&
    mastery.levelUpLine ===
      "lvl 41 Mastery ☄️ Meteor Alignment: Falling Star's Power dice can form a Meteor Alignment. If two Power dice match, add +10 Power. If all three Power dice match, add +20 Power instead. If the three Power dice total exactly 7, add +15 Power.";
  const validAstralBond = expectedId === "familiar-mastery-1" &&
    mastery.name === "Bond" && mastery.spellId === "familiar" &&
    mastery.requiredLevel === 44 && mastery.tier === 1 &&
    effect?.id === "astral-bond" && effect.maximumRisingPower === 6 &&
    effect.assistanceMultiplier === 2 &&
    mastery.levelUpLine ===
      "lvl 44 Mastery 🌌 Bond: While a Familiar is active, reaching maximum Rising Power empowers the Familiar's next assistance, doubling its effects. Activates once per Familiar.";
  const wakeMasteryEffects = [
    ["wakefin", 0, 5, 0, "Restored 5 Mana"],
    ["astral-manta", 0, 0, 5, "Gained 5 protection"],
    ["deepwake-serpent", 5, 0, 0, "+5 damage"],
    ["leviathan", 10, 5, 0, "+10 damage | Restored 5 Mana"],
    ["ancient-one", 20, 10, 0, "+20 damage | Restored 10 Mana"],
  ];
  const validWakeMastery = expectedId === "leviathans-wake-mastery-1" &&
    mastery.spellId === "leviathans-wake" && mastery.requiredLevel === 37 &&
    mastery.tier === 1 && effect?.id === "wake-creature-arrival" &&
    Array.isArray(effect.creatures) &&
    effect.creatures.length === wakeMasteryEffects.length &&
    effect.creatures.every((entry, index) => {
      const expected = wakeMasteryEffects[index];
      return entry.creatureId === expected[0] &&
        entry.fixedDamage === expected[1] &&
        entry.manaRestore === expected[2] &&
        entry.protection === expected[3] &&
        entry.activationLine === `Leviathan's Wake Mastery I: ${expected[4]}`;
    });
  const jellyfishEffectTypes = [
    "restore-mana",
    "restore-hp",
    "award-candies",
    "bonus-damage",
  ];
  const validJellyfishMastery = expectedId === "jellyfish-mastery-1" &&
    effect?.id === "jellyfish-moods" &&
    Array.isArray(effect.moods) &&
    effect.moods.length === 5 &&
    effect.moods.every((mood) =>
      typeof mood.id === "string" && mood.id.trim() &&
      Number.isSafeInteger(Number(mood.naturalMaximum)) &&
      Number(mood.naturalMaximum) >= 3 &&
      jellyfishEffectTypes.includes(mood.effectType) &&
      Number.isSafeInteger(Number(mood.amount)) &&
      Number(mood.amount) > 0 &&
      typeof mood.activationLine === "string" &&
      mood.activationLine.trim());
  const jellyfishTierTwoMoods = [
    ["sad", 4, "restore-mana", 20, 1, 0, 0, 0],
    ["sleepy", 8, "restore-hp", 20, 0, 5, 0, 0],
    ["curious", 13, "award-candies", 50, 0, 0, 1, 0],
    ["confident", 17, "bonus-damage", 8, 0, 0, 0, 5],
    ["dedicated", 24, "bonus-damage", 12, 0, 0, 0, 0],
  ];
  const validJellyfishMasteryII = expectedId === "jellyfish-mastery-2" &&
    mastery.spellId === "jelly" && mastery.requiredLevel === 21 && mastery.tier === 2 &&
    effect?.id === "jellyfish-moods" && Array.isArray(effect.moods) &&
    effect.moods.length === jellyfishTierTwoMoods.length &&
    effect.moods.every((mood, index) => {
      const expected = jellyfishTierTwoMoods[index];
      return mood.id === expected[0] && mood.naturalMaximum === expected[1] &&
        mood.effectType === expected[2] && mood.amount === expected[3] &&
        (mood.offensiveRollModifier ?? 0) === expected[4] &&
        (mood.damageReduction ?? 0) === expected[5] &&
        (mood.berries ?? 0) === expected[6] &&
        (mood.manaRestore ?? 0) === expected[7] &&
        typeof mood.activationLine === "string" && mood.activationLine.trim() &&
        (!["sad", "confident"].includes(mood.id) ||
          (typeof mood.fullManaLine === "string" && mood.fullManaLine.trim())) &&
        (mood.id !== "sleepy" ||
          (typeof mood.fullHpLine === "string" && mood.fullHpLine.trim()));
    });
  const validElfBlessingMastery =
    expectedId === "elf-blessing-mastery-1" &&
    effect?.id === "elf-blessing-upgrade" &&
    Number(effect.offensiveRollModifier) === 3 &&
    Number(effect.durationMs) === 3600000;
  const validBubbleMastery = expectedId === "bubble-mastery-1" &&
    effect?.id === "bubble-rebound" &&
    Number(effect.manaRestore) === 10 &&
    Number(effect.offensiveRollModifier) === 2;
  const validBubbleMasteryII = expectedId === "bubble-mastery-2" &&
    mastery.spellId === "bubble" && mastery.requiredLevel === 23 &&
    mastery.tier === 2 && effect?.id === "bubble-retaliation" &&
    Number(effect.damage) === 15 && Array.isArray(mastery.flavor) &&
    mastery.flavor.length === 3 &&
    mastery.flavor.every((line) => typeof line === "string" && line.trim());
  const mendHealing = effect?.healingPerTrigger;
  const validMendMastery = expectedId === "mend-mastery-1" &&
    effect?.id === "mend-upgrade" &&
    Number(effect.roll?.dice) === 2 &&
    Number(effect.roll?.sides) === 12 &&
    effect.roll?.keepHighest === true &&
    Number(mendHealing?.weak) === 7 &&
    Number(mendHealing?.gentle) === 10 &&
    Number(mendHealing?.strong) === 12 &&
    Number(mendHealing?.perfect) === 18 &&
    Array.isArray(mastery.flavor) &&
    mastery.flavor.length === 6 &&
    mastery.flavor.every((line) =>
      typeof line === "string" && line.trim());
  const echoMasteryOutcomes = [
    [1, 5, 0, "Echo Mastery I: Restored 5 Mana"],
    [2, 10, 0, "Echo Mastery I: Restored 10 Mana"],
    [3, 0, 1, "Echo Mastery I: Next offensive roll +1"],
    [4, 0, 2, "Echo Mastery I: Next offensive roll +2"],
  ];
  const validEchoMastery = expectedId === "astral-echo-mastery-1" &&
    mastery.spellId === "astral-echo" && mastery.requiredLevel === 34 &&
    mastery.tier === 1 && effect?.id === "echo-afterglow" &&
    effect.manaCost === 20 &&
    Array.isArray(effect.outcomes) &&
    effect.outcomes.length === echoMasteryOutcomes.length &&
    effect.outcomes.every((outcome, index) => {
      const expected = echoMasteryOutcomes[index];
      return outcome.naturalRoll === expected[0] &&
        (outcome.manaRestore || 0) === expected[1] &&
        (outcome.offensiveRollModifier || 0) === expected[2] &&
        outcome.activationLine === expected[3];
    });
  const shizukiSources = [
    ["elf-blessing", "Elf Blessing"], ["fae-aid", "Fae Aid"],
    ["fae-second-opinion", "Fae Second Opinion"],
    ["fae-intervention", "Fae Intervention"],
    ["fae-mischief", "Fae Mischief"], ["fae-snail", "Fae Snail"],
    ["fae-berry", "Fae Berry"],
  ];
  const validShizukisPresence = expectedId === "shizukis-presence" &&
    mastery.name === "Shizuki's Presence" && mastery.spellId === "evocation" &&
    mastery.requiredLevel === 48 && mastery.tier === 1 &&
    effect?.id === "shizukis-presence" &&
    effect.recovery?.hp === 30 && effect.recovery?.mana === 40 &&
    effect.empowerment?.offensiveRollModifier === 3 &&
    effect.empowerment?.bonusDamage === 15 &&
    effect.evocation?.threshold === 0.25 &&
    effect.evocation?.overflowMultiplier === 1.5 &&
    Array.isArray(effect.qualifyingSources) &&
    effect.qualifyingSources.length === shizukiSources.length &&
    effect.qualifyingSources.every((source, index) =>
      source.id === shizukiSources[index][0] &&
      source.name === shizukiSources[index][1]) &&
    Array.isArray(mastery.convergenceFlavor) &&
    mastery.convergenceFlavor.length === 6 &&
    mastery.convergenceFlavor.every((line) => typeof line === "string" && line.trim()) &&
    Array.isArray(mastery.evocationFlavor) &&
    mastery.evocationFlavor.length === 4 &&
    mastery.evocationFlavor.every((line) => typeof line === "string" && line.trim()) &&
    mastery.levelUpLine ===
      "lvl 48 Mastery 🌿 Shizuki's Presence: When two different Fae abilities activate during the same battle, Shizuki's Presence awakens once per battle, restoring 30 HP and 40 Mana and empowering your next offensive spell with +3 to its offensive roll and +15 damage. Casting Evocation below 25% Mana causes it to overflow your Mana to 150% of its maximum.";

  if (
    !validStarSparkMastery &&
    !validStarSparkMasteryII &&
    !validMoonbeamMastery &&
    !validMeteorAlignment &&
    !validAstralBond &&
    !validWakeMastery &&
    !validJellyfishMastery &&
    !validJellyfishMasteryII &&
    !validElfBlessingMastery &&
    !validBubbleMastery &&
    !validBubbleMasteryII &&
    !validMendMastery &&
    !validEchoMastery &&
    !validShizukisPresence
  ) {
    throw new Error(`Invalid mastery effect for ${expectedId}.`);
  }

  return mastery;
}

function validatePerkDefinition(perk, expectedId) {
  const hasActivationLines =
    Array.isArray(perk?.activationLines) &&
    perk.activationLines.length > 0 &&
    perk.activationLines.every((line) =>
      typeof line === "string" && line.trim());
  const hasSingleActivationLine =
    typeof perk?.activationLine === "string" &&
    perk.activationLine.trim();
  const hasCuriosityPresentation =
    Array.isArray(perk?.tripleLines) &&
    perk.tripleLines.length === 3 &&
    perk.tripleLines.every((line) =>
      typeof line === "string" && line.trim());
  if (
    !perk ||
    perk.id !== expectedId ||
    typeof perk.name !== "string" ||
    !perk.name.trim() ||
    perk.type !== "passive" ||
    !Number.isSafeInteger(Number(perk.requiredLevel)) ||
    Number(perk.requiredLevel) < 1 ||
    typeof perk.description !== "string" ||
    !perk.description.trim() ||
    (!hasActivationLines &&
      !hasSingleActivationLine &&
      !hasCuriosityPresentation &&
      !Array.isArray(perk.memories) &&
      expectedId !== "lunar-patience" &&
      expectedId !== "rising-power" &&
      expectedId !== "legacy" &&
      expectedId !== "fae-mischief" &&
      expectedId !== "storyteller")
  ) {
    throw new Error(`Invalid perk definition for ${expectedId}.`);
  }

  const effect = perk.effect;
  const validResilience = expectedId === "astral-resilience" &&
    hasActivationLines &&
    perk.activationLines.length === 5 &&
    effect?.trigger === "post-enemy-damage" &&
    Number(effect.hpThresholdPercent) === 25 &&
    Number(effect.manaRestore) === 10 &&
    Number(effect.usesPerBattle) === 1;
  const validMomentum = expectedId === "astral-momentum" &&
    hasActivationLines &&
    perk.activationLines.length === 5 &&
    effect?.trigger === "natural-perfect-hit" &&
    Number(effect.naturalRoll) === 20 &&
    Array.isArray(effect.eligibleActions) &&
    effect.eligibleActions.length === 2 &&
    effect.eligibleActions.includes("attack") &&
    effect.eligibleActions.includes("moonbeam") &&
    Number(effect.manaRestore) === 10 &&
    Number(effect.usesPerBattle) === 1 &&
    typeof perk.fullManaLine === "string" &&
    perk.fullManaLine.trim();
  const validHarvest = expectedId === "astral-harvest" &&
    effect?.trigger === "enemy-defeated" &&
    Number(effect.hpRestore) === 15 &&
    Number(effect.manaRestore) === 20 &&
    hasSingleActivationLine &&
    !hasActivationLines;
  const validDefiance = expectedId === "astral-defiance" &&
    perk.requiredLevel === 36 &&
    effect?.trigger === "enemy-defeated-low-hp" &&
    effect.hpThresholdPercent === 25 &&
    effect.hpRestore === 20 && effect.manaRestore === 20 &&
    perk.activationLine === "Defiance activates!\n\n+20 HP +20 Mana" &&
    hasSingleActivationLine && !hasActivationLines;
  const validReprieve = expectedId === "astral-reprieve" &&
    perk.requiredLevel === 38 &&
    effect?.trigger === "enemy-defeated-without-stim" &&
    effect.manaRestore === 30 &&
    perk.activationLine === "No Stims Used - Reprieve +30 Mana" &&
    perk.levelUpLine ===
      "lvl 38 Passive ✨ Reprieve: Defeating an enemy without using Stim during the battle restores 30 Mana." &&
    hasSingleActivationLine && !hasActivationLines;
  const validLunarPatience = expectedId === "lunar-patience" &&
    perk.requiredLevel === 39 &&
    effect?.trigger === "moonbeam-noncritical-main-roll" &&
    effect.offensiveRollModifier === 1 &&
    perk.levelUpLine ===
      "lvl 39 Passive 🌙 Lunar Patience: When Moonbeam fails to critically hit, your next Moonbeam in the same battle gains +1 to its main offensive roll. Lunar Patience does not stack and resets when Moonbeam critically hits or the battle ends." &&
    !hasSingleActivationLine && !hasActivationLines;
  const validAftershock = expectedId === "astral-aftershock" &&
    effect?.trigger === "critical-offensive-spell" &&
    Number(effect.bonusDamage) === 5 &&
    perk.activationLine === "Aftershock activates! +5 damage." &&
    hasSingleActivationLine &&
    !hasActivationLines;
  const validFaeIntervention = expectedId === "fae-intervention" &&
    perk.requiredLevel === 43 &&
    effect?.trigger === "lethal-enemy-damage" &&
    Number(effect.survivalHp) === 1 &&
    Number(effect.usesPerBattle) === 1 &&
    hasActivationLines &&
    perk.activationLines.length === 8;
  const validFaeAid = expectedId === "fae-aid" &&
    perk.requiredLevel === 17 &&
    effect?.trigger === "survived-enemy-attack-below-hp-threshold" &&
    effect.hpThresholdPercent === 15 && effect.hpRestore === 5 &&
    effect.usesPerBattle === 1 &&
    perk.activationLine === "Fae Aid activates! Restored 5 HP." &&
    hasSingleActivationLine && !hasActivationLines;
  const validAstralRhythm = expectedId === "astral-rhythm" &&
    perk.requiredLevel === 32 &&
    effect?.trigger === "different-successful-damaging-spells" &&
    effect.bonusDamage === 5 && effect.usesPerBattle === 1 &&
    perk.activationLine ===
      "two attacks in a row Rhythm Applied! +5 damage" &&
    hasSingleActivationLine && !hasActivationLines;
  const validRisingPower = expectedId === "rising-power" &&
    perk.requiredLevel === 42 &&
    effect?.trigger === "different-successful-damaging-offensive-spells" &&
    effect.damagePerStep === 2 && effect.maximumSteps === 3 &&
    perk.levelUpLine ===
      "lvl 42 Passive 🌊 Rising Power: Successfully damaging an enemy with a different offensive spell than your previous damaging spell builds Rising Power. Each step in the chain grants +2 damage to the next different offensive spell, up to +6 damage. Repeating the same offensive spell resets Rising Power." &&
    !hasSingleActivationLine && !hasActivationLines;
  const validAstralExpedition = expectedId === "astral-expedition" &&
    perk.requiredLevel === 33 &&
    effect?.trigger === "successful-offensive-roll-milestone" &&
    effect.rollsPerMilestone === 33 && effect.candies === 33 &&
    effect.offensiveRollModifier === 3 &&
    perk.activationLine ===
      "Astral Expedition\n\n" +
      "Faintly you hear \"for those who come after\" behind a bush.\n\n" +
      "33 offensive rolls reached.\n\n" +
      "33 Star Candies gained | Next offensive roll +3" &&
    hasSingleActivationLine && !hasActivationLines;
  const doubleOutcomes = effect?.doubleOutcomes;
  const tripleRewards = effect?.tripleRewards;
  const validAstralCuriosity = expectedId === "astral-curiosity" &&
    effect?.trigger === "matching-natural-dice" &&
    Number(effect.doubleUsesPerBattle) === 1 &&
    Number(effect.offensiveRollModifier) === 1 &&
    Array.isArray(doubleOutcomes) &&
    doubleOutcomes.length === 5 &&
    doubleOutcomes.every((outcome) =>
      typeof outcome.id === "string" && outcome.id.trim() &&
      ["restore-hp", "restore-mana", "award-candies", "offensive-roll", "none"]
        .includes(outcome.effectType) &&
      Number.isSafeInteger(Number(outcome.amount)) &&
      Number(outcome.amount) >= 0 &&
      typeof outcome.line === "string" && outcome.line.trim()) &&
    Number(tripleRewards?.hpRestore) === 10 &&
    Number(tripleRewards?.manaRestore) === 10 &&
    Number(tripleRewards?.candies) === 100 &&
    Number(tripleRewards?.offensiveRollModifier) === 1 &&
    hasCuriosityPresentation;
  const validAstralPatience = expectedId === "astral-patience" &&
    Number(perk.requiredLevel) === 22 &&
    effect?.trigger === "non-offensive-combat-turn" &&
    Number(effect.offensiveRollModifier) === 2 &&
    hasSingleActivationLine && !hasActivationLines;
  const validAstralAwakening = expectedId === "astral-awakening" &&
    perk.requiredLevel === 25 &&
    effect?.trigger === "survived-enemy-attack" &&
    effect.survivingAttacks === 5 &&
    effect.hpRestore === 25 && effect.manaRestore === 25 &&
    effect.offensiveRollModifier === 2 && effect.usesPerBattle === 1 &&
    perk.activationLine ===
      "5 enemy attacks survived. Awakening activates!\n\n" +
      "Restored 25 HP + 25 Mana | Next offensive roll +2" &&
    hasSingleActivationLine && !hasActivationLines;
  const validAstralHarmony = expectedId === "astral-harmony" &&
    perk.requiredLevel === 28 &&
    effect?.trigger === "successful-offensive-roll-with-distinct-bonuses" &&
    effect.minimumSources === 3 && effect.manaRestore === 15 &&
    effect.usesPerBattle === 1 &&
    perk.activationLine === "Harmony\nRestored 15 Mana" &&
    hasSingleActivationLine && !hasActivationLines;
  const validFaeSecondOpinion = expectedId === "fae-second-opinion" &&
    perk.requiredLevel === 29 &&
    effect?.trigger === "qualifying-offensive-miss" &&
    effect.offensiveRollModifier === 3 && effect.usesPerBattle === 1 &&
    perk.activationLine === "Fae Second Opinion Activates! You missed. Sad." &&
    perk.endingLine === "Next offensive roll +3" &&
    Array.isArray(perk.flavor) && perk.flavor.length === 15 &&
    perk.flavor.every((scene) => typeof scene === "string" && scene.trim());
  const validKinship = expectedId === "kinship" &&
    perk.requiredLevel === 31 &&
    effect?.trigger === "familiar-fifth-action-completed" &&
    effect.manaRestore === 15 &&
    perk.activationLine === "Kinship\n\n" +
      "As your Familiar leaves, a little of the magic that brought it to life remains with you.\n\n" +
      "Restored 15 Mana" &&
    hasSingleActivationLine && !hasActivationLines;
  const validLegacy = expectedId === "legacy" &&
    perk.name === "Legacy" && perk.requiredLevel === 46 &&
    effect?.trigger === "early-spell-legacy" &&
    effect.charge?.manaRestore === 10 &&
    effect.perfectJellyfish?.damage === 20 &&
    effect.perfectJellyfish?.hpRestore === 20 &&
    effect.perfectJellyfish?.manaRestore === 20 &&
    effect.fullMoon?.damage === 75 &&
    perk.levelUpLine ===
      "lvl 46 Passive ⭐ Legacy: The spells that began your journey have grown alongside you. Star Spark critical Charges restore 10 Mana. Matching all three natural Jellyfish dice summons a Perfect Jellyfish, dealing +20 bonus damage and restoring 20 HP + 20 Mana. If both of Moonbeam's natural main dice roll 20, a Full Moon forms and deals +75 bonus damage.";
  const validFaeMischief = expectedId === "fae-mischief" &&
    perk.name === "Fae Mischief" && perk.requiredLevel === 47 &&
    effect?.trigger === "one-die-pattern-completion" &&
    effect.usesPerBattle === 1 &&
    Array.isArray(effect.priority) &&
    effect.priority.join(",") ===
      "full-moon,perfect-jellyfish,meteor-alignment-triple,lunar-alignment" &&
    Array.isArray(perk.flavor) && perk.flavor.length === 4 &&
    perk.flavor.every((line) => typeof line === "string" && line.trim()) &&
    perk.levelUpLine ===
      "lvl 47 Passive 🌿 Fae Mischief: Once per battle, when a natural spell roll is one die away from completing a powerful dice pattern, the Fae may change that die after it lands to complete the pattern.";
  const storytellerChapters = [
    [1, "first-page", 0.8, 0, 0, 0],
    [2, "turning-point", 0, 2, 0, 0],
    [3, "final-chapter", 0, 0, 10, 1.12],
  ];
  const validStoryteller = expectedId === "storyteller" &&
    perk.name === "Storyteller" && perk.requiredLevel === 49 &&
    effect?.trigger === "enemy-hp-chapters" &&
    Array.isArray(effect.chapters) && effect.chapters.length === 3 &&
    effect.chapters.every((chapter, index) => {
      const expected = storytellerChapters[index];
      return chapter.stage === expected[0] && chapter.id === expected[1] &&
        (chapter.manaCostMultiplier || 0) === expected[2] &&
        (chapter.offensiveRollModifier || 0) === expected[3] &&
        (chapter.bonusDamage || 0) === expected[4] &&
        (chapter.criticalDamageMultiplier || 0) === expected[5] &&
        typeof chapter.heading === "string" && chapter.heading.trim() &&
        Array.isArray(chapter.effects) && chapter.effects.length > 0 &&
        chapter.effects.every((line) => typeof line === "string" && line.trim());
    }) &&
    perk.levelUpLine ===
      "lvl 49 Passive ⭐ Storyteller: As an enemy's HP falls, Storyteller progresses through three Chapters. Below 75% HP, THE FIRST PAGE reduces Mana costs by 20%. Below 50% HP, THE TURNING POINT replaces it with +2 to offensive rolls. Below 25% HP, THE FINAL CHAPTER replaces it with +10 final damage and +12% critical damage. Chapters only progress forward and reset when the battle ends.";

  if (
    !validResilience &&
    !validMomentum &&
    !validHarvest &&
    !validDefiance &&
    !validReprieve &&
    !validLunarPatience &&
    !validAftershock &&
    !validFaeIntervention &&
    !validFaeAid &&
    !validAstralRhythm &&
    !validRisingPower &&
    !validAstralExpedition &&
    !validAstralCuriosity &&
    !validAstralPatience &&
    !validAstralAwakening &&
    !validAstralHarmony &&
    !validFaeSecondOpinion &&
    !validKinship &&
    !validLegacy &&
    !validFaeMischief &&
    !validStoryteller
  ) {
    throw new Error(`Invalid perk effect for ${expectedId}.`);
  }

  return perk;
}

async function getSpellDefinition(spellId) {
  const file = SPELL_FILES[spellId];
  if (!file) return null;

  const spell = await fetchCachedJson(
    `spell:${spellId}`,
    `${GITHUB_DATA_BASE}/spells/${file}`,
  );
  try {
    return validateSpellDefinition(spell, spellId);
  } catch (error) {
    throw tagRuntimeError(error, "content.spell.validate");
  }
}

async function getSpellDefinitions() {
  return Promise.all(
    Object.keys(SPELL_FILES).map((spellId) => getSpellDefinition(spellId)),
  );
}

async function getMasteryDefinition(masteryId) {
  const file = MASTERY_FILES[masteryId];
  if (!file) return null;

  const mastery = await fetchCachedJson(
    `mastery:${masteryId}`,
    `${GITHUB_DATA_BASE}/masteries/${file}`,
  );
  try {
    return validateMasteryDefinition(mastery, masteryId);
  } catch (error) {
    throw tagRuntimeError(error, "content.mastery.validate");
  }
}

async function getMasteryDefinitions() {
  return Promise.all(
    Object.keys(MASTERY_FILES).map((masteryId) =>
      getMasteryDefinition(masteryId)),
  );
}

async function getActiveMasteries(playerLevel) {
  const level = Number(playerLevel);
  const masteries = await getMasteryDefinitions();
  return masteries.filter((mastery) => level >= mastery.requiredLevel);
}

// Approved player-facing unlock entries. Category emojis belong only in unlock output.
const CANONICAL_LEVEL_UNLOCKS = Object.freeze([
  "lvl 1 Spell 🧚 Elf Blessing: Cast Elf Blessing for 30 mana and gain +2 to offensive rolls for 30 minutes",
  "lvl 1 Command 💉 Stim: Fully restores your HP at the cost of your turn. You can use one Stim per battle.",
  "lvl 2 Spell ✨ Star Spark: Cast Star Spark for 10 Mana. Roll 1d12, critical happens at 12+ and deals 18 damage. Critical casts leave behind a Charge that empowers your next offensive spell with a 50% Mana reduction and +15% damage.",
  "lvl 3 Spell 🪼 Jellyfish: Cast Jellyfish for 10 Mana. Roll 3d8, critical happens at 24+ and deals 35 damage. Rolls determine the mood of the Jellyfish: 3-4 Sad, 5-8 Sleepy, 9-13 Curious, 14-17 Confident, 18-24 Dedicated.",
  "lvl 4 Spell 🌿 Mend: Cast Mend for 20 Mana. Fae light restores HP after the next three surviving enemy attacks. Roll 1d12 with different outcomes. 1-3 Weak Mend gives 5 HP per trigger, 4-7 Gentle Mend gives 8 HP per trigger, 8-11 Strong Mend gives 10 HP per trigger, and 12 Perfect Mend gives 15 HP per trigger. Mend is a healing support spell, so it's not affected by roll bonuses.",
  "lvl 5 Spell 🌙 Moonbeam: Cast Moonbeam for 20 Mana. Roll 2d20 and keep the highest roll. Critical happens at 20+ and deals 40 damage. In addition, after damage is calculated for the main roll, there is a bonus d6 of damage.",
  "lvl 5 Spell ✨ Evocation: Fully restores your Mana at the cost of your turn. Evocation can be used again after 7 combat turns.",
  "lvl 6 Mastery ⭐ Star Spark Mastery I: Charge now empowers two offensive spell casts. The first receives 50% Mana reduction and +15% damage. The second receives +15% damage.",
  "lvl 7 Passive Perk ✨ Resilience: Surviving an enemy attack while below 25% HP restores 10 Mana. Once per battle.",
  "lvl 8 Spell 🫧 Bubble: Cast Bubble for 15 Mana to prepare protection against damaging enemy attacks without ending your normal action. Roll 1d12 to determine its protection: 1-3 gives 5 protection, 4-7 gives 10 protection, 8-11 gives 15 protection, and 12 gives 25 protection.",
  "lvl 9 Passive Perk ✨ Momentum: Rolling a natural 20 on a qualifying offensive d20 restores 10 Mana. Activates once per battle.",
  "lvl 10 Mastery 🪼 Jellyfish Mastery I: Jellyfish moods now grant an additional effect. Sad restores Mana, Sleepy restores HP, Curious awards Star Candies, Confident deals bonus damage, and Dedicated deals even more bonus damage.",
  "lvl 11 Passive Perk ✨ Harvest: You gain 15 HP + 20 Mana after defeating an enemy.",
  "lvl 12 Spell 🌟 Echo: Cast Echo for 25 Mana. Your next offensive spell repeats part of its damage as an echo. Roll 1d4 to determine the echo bonus. 1 - Faint Echo 30% damage, 2 - Resonant Echo 35% damage, 3 - Powerful Echo 40% damage, 4 - Perfect Echo 50% damage.",
  "lvl 13 Mastery 🧚 Elf Blessing Mastery I: Elf Blessing now grants +3 to offensive rolls for 60 minutes.",
  "lvl 14 Passive Perk ⭐ Aftershock: When an offensive spell crits, deal +5 bonus damage.",
  "lvl 15 Spell ☄️ Falling Star: Cast Falling Star for 30 Mana. Roll 3d10 to determine the Power of the star and 1d20 for Accuracy. Natural 1 Accuracy misses, 2-9 is a Glancing Hit and deals Power -5 damage, 10-19 is a Direct Hit and deals full Power damage, and 20+ is a Critical Hit and deals Power +27 damage. Strength is added to successful hits. Elf Blessing and Fae increase the Accuracy roll but do not increase the Power roll.",
  "lvl 16 Mastery 🫧 Bubble Mastery I: When Bubble absorbs damage and pops, restore up to 10 Mana and gain +2 to your next offensive roll.",
  "lvl 17 Passive 🌿 Fae Aid: Once per battle, when you fall below 15% HP after surviving an enemy attack, restore 5 HP.",
  "lvl 18 Mastery 🌿 Mend Mastery I: Mend now rolls 2d12 and keeps the highest roll. Weak Mend restores 7 HP per trigger, Gentle restores 10 HP, Strong restores 12 HP, and Perfect restores 18 HP per trigger.",
  "lvl 19 Passive Perk ⭐ Curiosity: Matching natural rolls can cause an Oddity. Doubles trigger one random effect once per battle: restore 10 HP, restore 10 Mana, gain 100 Star Candies, gain +1 to your next offensive roll, or something strange happens. Triples grant all four beneficial effects and can activate multiple times per battle.",
  "lvl 20 Spell 🌊 Leviathan's Wake: Summon the distant wake of a Leviathan. The wake arrives after your next action, crashing into the enemy with power based on a 1d20 roll.",
  "lvl 21 Mastery 🪼 Jellyfish Mastery II: Jellyfish moods become stronger. Sad restores 20 Mana and grants +1 to your next offensive roll, Sleepy restores 20 HP and reduces the next enemy hit by 5, Curious finds 50 Star Candies and a Berry, Confident gains +8 damage and restores 5 Mana, and Dedicated gains +12 damage.",
  "lvl 22 Passive ✨ Patience: Whenever you end a combat turn without attacking or damaging the enemy, gain +2 to your next offensive roll. Patience does not stack.",
  "lvl 23 Mastery 🫧 Bubble Mastery II: When an enemy breaks your Bubble, the remaining magic retaliates for 15 damage.",
  "lvl 24 Spell 🍓 Berries: Cast Berries for 20 Mana without ending your normal action. Roll 1d20 to receive a random Berry effect, with each roll having a 5% chance: 1 Sour deals 10 damage, 2 Sleepy reduces the next enemy hit by 5, 3 Blue restores 30 Mana, 4 Sweet restores 15 HP, 5 Bouncy grants +2 to your next offensive roll, 6 Fae restores 20 Mana and grants +1 to your next offensive spell roll, 7 Bubble grants 10 protection, 8 Spark adds +8 damage to your next successful offensive spell, 9 Healing restores 25 HP, 10 Mana restores 50 Mana, 11 Twilight restores 15 HP + 20 Mana, 12 Giggling grants +3 to your next offensive roll, 13 Lucky gives 75 Star Candies, 14 Moon restores 15 HP + 30 Mana, 15 Shimmer restores 20 Mana and makes your next offensive spell cost 50% less Mana, 16 Guardian grants 20 protection, 17 Comet deals 25 damage, 18 Astral restores 60 Mana and grants +2 to your next offensive roll, 19 Golden restores 30 HP + 60 Mana, and 20 Shizuki's Favorite restores 40 HP + 80 Mana and grants +4 to your next offensive roll. Berries can only be used once per turn.",
  "lvl 25 Passive ✨ Awakening: After surviving 5 enemy attacks in the same battle, memories of your journey awaken the magic within you, restoring 25 HP + 25 Mana and granting +2 to your next offensive roll. Activates once per battle.",
  "lvl 26 Mastery ⭐ Star Spark Mastery II: When the second Charge empowerment is consumed, the remaining Charge detonates for 20 damage.",
  "lvl 27 Mastery 🌙 Moonbeam Mastery I: Moonbeam's bonus Moonlight damage now rolls 2d6 instead of 1d6. If the Moonlight dice match or their combined roll equals 7, Lunar Alignment deals +5 damage, or +20 damage if Moonbeam critically hits.",
  "lvl 28 Passive ✨ Harmony: When a successful offensive roll receives bonuses from 3 or more different sources, restore 15 Mana. Activates once per battle.",
  "lvl 29 Passive 🌿 Fae Second Opinion: Missing with a qualifying offensive roll causes Fae Second Opinion to activate, granting +3 to your next offensive roll. Activates once per battle.",
  "lvl 30 Spell 🌌 Familiar: Cast Familiar for 30 Mana without ending your turn. Roll 2d6 and add them together to create 1 of 11 different Familiars. Your Familiar assists you during your next 5 attacks or damaging spell casts before leaving to begin an adventure of its own.",
  "lvl 31 Passive 🌌 Kinship: When your Familiar leaves after completing all 5 of its actions, restore 15 Mana.",
  "lvl 32 Passive ✨ Rhythm: Successfully use two different damaging spells in a row to apply Rhythm, dealing +5 damage on the second spell. Activates once per battle.",
  "lvl 33 Passive ⭐ Astral Expedition: 33 successful offensive rolls in an adventure grants 33 Star Candies and +3 to your next offensive roll. The count persists across battles and continues toward the next 33-roll milestone.",
  "lvl 34 Mastery 🌟 Echo Mastery I: Echo now costs 20 Mana. After the Echo resolves, Faint Echo restores 5 Mana, Resonant Echo restores 10 Mana, Powerful Echo grants +1 to your next offensive roll, and Perfect Echo grants +2 to your next offensive roll.",
  "lvl 35 Spell 🎲 All or Nothing: Cast All or Nothing for 20 Mana and roll 1d2. Roll 1 to deal no damage. Roll 2 to deal 25 damage + Strength. Each consecutive 2 increases the next All or Nothing's damage by 25. Rolling 1 resets the streak.",
  "lvl 36 Passive ⭐ Defiance: Defeating an enemy while at or below 25% HP restores 20 HP and 20 Mana.",
  "lvl 37 Mastery 🌊 Leviathan's Wake Mastery I: The creatures summoned by Leviathan's Wake now leave an additional effect when they arrive. Wakefin restores 5 Mana, Manta grants 5 protection, Serpent deals +5 damage, Leviathan deals +10 damage and restores 5 Mana, and Ancient Leviathan deals +20 damage and restores 10 Mana.",
  "lvl 38 Passive ✨ Reprieve: Defeating an enemy without using Stim during the battle restores 30 Mana.",
  "lvl 39 Passive 🌙 Lunar Patience: When Moonbeam fails to critically hit, your next Moonbeam in the same battle gains +1 to its main offensive roll. Lunar Patience does not stack and resets when Moonbeam critically hits or the battle ends.",
  "lvl 40 Spell 🌊 Tidal Wave: Cast Tidal Wave for 30 Mana and roll 3d12. Add the dice together and apply offensive roll bonuses to determine the strength of the wave. Rolls 3-14 deal 40 damage, 15-19 deal 50 damage, 20-24 deal 55 damage, and 25+ is a critical hit for 65 damage.",
  "lvl 41 Mastery ☄️ Meteor Alignment: Falling Star's Power dice can form a Meteor Alignment. If two Power dice match, add +10 Power. If all three Power dice match, add +20 Power instead. If the three Power dice total exactly 7, add +15 Power.",
  "lvl 42 Passive 🌊 Rising Power: Successfully damaging an enemy with a different offensive spell than your previous damaging spell builds Rising Power. Each step in the chain grants +2 damage to the next different offensive spell, up to +6 damage. Repeating the same offensive spell resets Rising Power.",
  "lvl 43 Passive 🌿 Fae Intervention: Once per battle, when an enemy attack would reduce you to 0 HP, the Fae intervene and keep you alive at 1 HP.",
  "lvl 44 Mastery 🌌 Bond: While a Familiar is active, reaching maximum Rising Power empowers the Familiar's next assistance, doubling its effects. Activates once per Familiar.",
  "lvl 45 Spell 🔫 Conjure Gun: Cast Conjure Gun for 35 Mana. Conjure an Astral gun and rapidly fire 140 shots. Each shot rolls either 0 or 1. A 1 hits and deals 1 damage, while a 0 misses. Add all successful hits together, then add Strength to determine the final damage.",
  "lvl 46 Passive ⭐ Legacy: The spells that began your journey have grown alongside you. Star Spark critical hits restore 10 Mana when creating a Charge, making the cast free. Matching all three natural Jellyfish dice summons a Perfect mood Jellyfish, dealing +20 bonus damage and restoring 20 HP + 20 Mana. If both of Moonbeam's natural main dice roll 20, a Full Moon forms and deals +75 bonus damage.",
  "lvl 47 Passive 🌿 Fae Mischief: Once per battle, when a natural spell roll is one die away from completing a powerful dice pattern, the Fae may change that die after it lands to complete the pattern.",
  "lvl 48 Mastery 🌿 Shizuki's Presence: When two different Fae abilities activate during the same battle, Shizuki's Presence awakens once per battle, restoring 30 HP and 40 Mana and empowering your next offensive spell with +3 to its offensive roll and +15 damage. Casting Evocation below 25% Mana causes it to overflow your Mana to 150% of its maximum.",
  "lvl 49 Passive ⭐ Storyteller: As an enemy's HP falls, Storyteller progresses through three Chapters. Below 75% HP, THE FIRST PAGE reduces Mana costs by 20%. Below 50% HP, THE TURNING POINT replaces it with +2 to offensive rolls. Below 25% HP, THE FINAL CHAPTER replaces it with +10 final damage and +12% critical damage. Chapters only progress forward and reset when the battle ends.",
  "lvl 50 Ultimate Spell Help!: Call for some very questionable assistance. Requires at least 150 current Mana and can only be cast once per battle. Shizuki takes 50% of your current Mana to answer your call. Roll 1d20: 1–10 fails, while 11–20 succeeds and removes 50% of the enemy's current HP. Win or lose, Shizuki still takes her payment."
]);

async function formatLevelUpUnlocks(startingLevel, endingLevel) {
  return CANONICAL_LEVEL_UNLOCKS.filter((line) => {
    const level = Number(line.match(/^lvl (\d+) /)[1]);
    return level > startingLevel && level <= endingLevel;
  });
}

async function formatMasteryUnlocks(startingLevel, endingLevel) {
  return (await formatLevelUpUnlocks(startingLevel, endingLevel))
    .filter((line) => /^lvl \d+ Mastery /.test(line));
}

async function getPerkDefinition(perkId) {
  const file = PERK_FILES[perkId];
  if (!file) return null;

  const perk = await fetchCachedJson(
    `perk:${perkId}`,
    `${GITHUB_DATA_BASE}/perks/${file}`,
  );
  try {
    return validatePerkDefinition(perk, perkId);
  } catch (error) {
    throw tagRuntimeError(error, "content.perk.validate");
  }
}

async function getPerkDefinitions() {
  return Promise.all(
    Object.keys(PERK_FILES).map((perkId) => getPerkDefinition(perkId)),
  );
}

async function getActivePerks(playerLevel) {
  const level = Number(playerLevel);
  const perks = await getPerkDefinitions();
  return perks.filter((perk) => level >= perk.requiredLevel);
}

async function formatPerkUnlocks(startingLevel, endingLevel) {
  return (await formatLevelUpUnlocks(startingLevel, endingLevel))
    .filter((line) => /^lvl \d+ Passive /.test(line));
}

async function getRegionMetadata(regionId) {
  const region = getRegionById(regionId);

  if (!region) {
    throw new Error("Unknown region.");
  }

  const metadata = await fetchCachedJson(
    `region:${region.id}`,
    `${GITHUB_DATA_BASE}/regions/${region.id}.json`,
  );
  const noteCount = Number(metadata?.noteCount);
  const levelRequirement = Number(metadata?.levelRequirement);

  if (
    metadata?.id !== region.id ||
    typeof metadata.name !== "string" ||
    !metadata.name.trim() ||
    !Number.isInteger(noteCount) ||
    noteCount < 0 ||
    !Number.isInteger(levelRequirement) ||
    levelRequirement < 1
  ) {
    throw new Error(`Invalid metadata for ${region.id}.`);
  }

  return {
    id: region.id,
    name: metadata.name.trim(),
    noteCount,
    levelRequirement,
    nextRegion:
      typeof metadata.nextRegion === "string"
        ? metadata.nextRegion.trim()
        : null,
  };
}

function isValidRegionNote(note) {
  return Boolean(
    note &&
    typeof note.id === "string" &&
    note.id.trim() &&
    Number.isInteger(Number(note.number)) &&
    typeof note.title === "string" &&
    note.title.trim() &&
    typeof note.text === "string" &&
    note.text.trim(),
  );
}

async function getRegionNotes(regionId) {
  const region = getRegionById(regionId);

  if (!region) {
    throw new Error("Unknown region.");
  }

  const notes = await fetchCachedJson(
    `notes:${region.id}`,
    `${GITHUB_DATA_BASE}/notes/${region.id}.json`,
  );

  if (!Array.isArray(notes)) {
    throw new Error(`Invalid notes data for ${region.id}.`);
  }

  return notes
    .filter(isValidRegionNote)
    .map((note) => ({
      id: note.id.trim(),
      number: Number(note.number),
      title: note.title.trim(),
      text: note.text.trim(),
    }));
}

async function findRegionNote(regionId, noteId) {
  const notes = await getRegionNotes(regionId);
  return notes.find((note) => note.id === noteId) || null;
}

async function loadRegionLogs(region) {
  const logs = await fetchCachedJson(
    "explore:" + region.id, `${GITHUB_EXPLORE_BASE}/${region.file}`,
  );
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error("The exploration data contains no entries.");
  }
  return logs;
}

function validateExploreLog(log) {
  if (
    !log ||
    typeof log.message !== "string" ||
    !log.reward ||
    !Number.isFinite(
      Number(log.reward.min),
    ) ||
    !Number.isFinite(
      Number(log.reward.max),
    )
  ) {
    throw new Error(
      "An exploration entry has an invalid format.",
    );
  }
}

function selectWeightedExplore(logs) {
  const weightedLogs = logs.filter(
    (log) =>
      Number.isFinite(Number(log.weight)) &&
      Number(log.weight) > 0,
  );

  if (weightedLogs.length === 0) {
    return logs[
      randomInteger(0, logs.length - 1)
    ];
  }

  const totalWeight = weightedLogs.reduce(
    (total, log) =>
      total + Number(log.weight),
    0,
  );

  let roll = Math.random() * totalWeight;

  for (const log of weightedLogs) {
    roll -= Number(log.weight);

    if (roll <= 0) {
      return log;
    }
  }

  return weightedLogs[
    weightedLogs.length - 1
  ];
}

async function performRegionCompletion(
  env,
  backpackKey,
  region,
) {
  const [progress, manifest, metadata] = await Promise.all([
    getPlayerProgress(
      env,
      backpackKey,
    ),
    getAdventureManifest(region.id),
    getRegionMetadata(region.id),
  ]);

  if (levelFromXp(progress.xp) < metadata.levelRequirement) {
    return { message: `${metadata.name} has not been unlocked yet.` };
  }

  const completedAdventures = new Set(
    progress.completedAdventures?.[region.id] || [],
  ).size;
  const totalAdventures = manifest.length;

  const collectedNotes = getOwnedNoteNumbers(
    progress,
    region.id,
    metadata.noteCount,
  );
  const completedNotes = collectedNotes.length;
  const collectedNoteSet = new Set(collectedNotes);
  const missingNotes = Array.from(
    { length: metadata.noteCount },
    (_, index) => index + 1,
  ).filter((number) => !collectedNoteSet.has(number));
  const collectedText = collectedNotes.length
    ? formatNumberRanges(collectedNotes)
    : "None";
  const missingText = missingNotes.length
    ? formatNumberRanges(missingNotes)
    : "None — chapter complete!";

  const totalObjectives =
    totalAdventures + metadata.noteCount;

  const completedObjectives =
    completedAdventures + completedNotes;

  const completionPercent =
    totalObjectives > 0
      ? Math.floor(
          (
            completedObjectives /
            totalObjectives
          ) * 100,
        )
      : 0;

  return {
    completedAdventures,
    totalAdventures,
    completedNotes,
    totalNotes: metadata.noteCount,
    completionPercent,
    message:
      `${region.name} Completion ` +
      `Adventures: ${completedAdventures}/${totalAdventures} | ` +
      `Travel Notes: ${completedNotes}/${metadata.noteCount} | ` +
      `Collected: ${collectedText} | ` +
      `Missing: ${missingText} | ` +
      `Completion: ${completionPercent}%`,
  };
}

function getExploreXp(
  log,
  minimumReward,
  maximumReward,
) {
  /*
   * Preferred format:
   *
   * "xp": 12
   */
  if (
    Number.isFinite(
      Number(log.xp),
    )
  ) {
    return Math.max(
      1,
      Math.floor(
        Number(log.xp),
      ),
    );
  }

  /*
   * Random XP ranges are also supported:
   *
   * "xp": {
   *   "min": 10,
   *   "max": 15
   * }
   */
  if (
    log.xp &&
    Number.isFinite(
      Number(log.xp.min),
    ) &&
    Number.isFinite(
      Number(log.xp.max),
    )
  ) {
    const minimumXp =
      Math.max(
        1,
        Math.floor(
          Number(log.xp.min),
        ),
      );

    const maximumXp =
      Math.max(
        minimumXp,
        Math.floor(
          Number(log.xp.max),
        ),
      );

    return randomInteger(
      minimumXp,
      maximumXp,
    );
  }

  /*
   * Temporary compatibility for your old JSON entries.
   *
   * This allows the Worker to function before we
   * manually give every Moonlit Reef entry an XP value.
   */
  const averageReward =
    (
      minimumReward +
      maximumReward
    ) / 2;

  return Math.max(
    3,
    Math.round(
      averageReward / 8,
    ),
  );
}

/* ============================================================
   PLAYER PROGRESSION
   ============================================================ */

function getProgressKey(backpackKey) {
  return `progress:${backpackKey}`;
}

function getSharedRestCooldownKey(sharedIdentity, restType = "short") {
  return sharedIdentity
    ? restType === "long"
      ? `cooldown:long-rest:${sharedIdentity}`
      : `cooldown:rest:${sharedIdentity}`
    : "";
}

function getShopSessionKey(sharedIdentity) {
  return sharedIdentity
    ? `shop-session:${sharedIdentity}`
    : "";
}

async function touchShopSession(env, sharedIdentity) {
  const key = getShopSessionKey(sharedIdentity);

  if (!key) {
    return;
  }

  await env.Backpack.put(
    key,
    String(Date.now()),
    {
      expirationTtl: Math.ceil(SHOP_SESSION_TTL_MS / 1000),
    },
  );
}

async function hasActiveShopSession(env, sharedIdentity) {
  const key = getShopSessionKey(sharedIdentity);

  if (!key) {
    return false;
  }

  const storedValue = await env.Backpack.get(key);
  const lastActiveAt = Number(storedValue);
  const isActive =
    Number.isSafeInteger(lastActiveAt) &&
    lastActiveAt > 0 &&
    Date.now() - lastActiveAt < SHOP_SESSION_TTL_MS;

  if (!isActive && storedValue !== null) {
    await env.Backpack.delete(key);
  }

  return isActive;
}

async function closeShopSession(env, sharedIdentity) {
  const key = getShopSessionKey(sharedIdentity);

  if (key) {
    await env.Backpack.delete(key);
  }
}

async function getSharedRestCooldown(
  env,
  sharedIdentity,
  restType = "short",
) {
  const key = getSharedRestCooldownKey(sharedIdentity, restType);

  if (!key) {
    return 0;
  }

  const storedValue = await env.Backpack.get(key);
  const timestamp = Number(storedValue);

  return Number.isSafeInteger(timestamp) && timestamp > 0
    ? timestamp
    : 0;
}

async function saveSharedRestCooldown(
  env,
  sharedIdentity,
  timestamp,
  restType = "short",
) {
  const key = getSharedRestCooldownKey(sharedIdentity, restType);

  if (!key) {
    return;
  }

  await env.Backpack.put(
    key,
    String(timestamp),
    {
      expirationTtl: Math.ceil(
        (restType === "long"
          ? LONG_REST_COOLDOWN_MS
          : SHORT_REST_COOLDOWN_MS) / 1000,
      ),
    },
  );
}

function normalizeEvocationCooldown(value) {
  return Number.isSafeInteger(value) && value >= 0 ? Math.min(7, value) : 0;
}

function normalizeAstralExpeditionRolls(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function createEmptyProgress() {
  const progress = {
    xp: 0,
    berries: 0,
    hp: PLAYER_COMBAT_MAX_HP,
    maxHp: PLAYER_COMBAT_MAX_HP,
    mana: PLAYER_MAX_MANA,
    maxMana: PLAYER_MAX_MANA,
    evocationCooldownTurns: 0,
    astralExpeditionRolls: 0,
    lastRestAt: 0,
    lastLongRestAt: 0,
    restBufferType: null,
    temporaryResourceCap: PLAYER_COMBAT_MAX_HP,
    stats: normalizePlayerStats({}),
    unspentStatPoints: 0,
    statPointsGrantedThroughLevel: 1,
    statusEffects: {},
    discoveries: {},
    notes: {},
    ownedWeapons: [],
    equippedWeapon: null,
    classSystemUnlocked: false,
    activeClass: null,
    combatProgress: {},
    completedAdventures: {},
    currentRegion: "moonlit-reef",
  };
  return progress;
}

async function getPlayerProgress(
  env,
  backpackKey,
) {
  const storedValue = await env.Backpack.get(
    getProgressKey(backpackKey),
  );

  if (!storedValue) {
    return createEmptyProgress();
  }

  try {
    const parsed = JSON.parse(storedValue);

    const xp = Math.max(
      0,
      Math.floor(
        Number(parsed.xp) || 0,
      ),
    );
    const berries = Math.max(
      0,
      Math.floor(
        Number(parsed.berries) || 0,
      ),
    );
    const currentLevel = levelFromXp(xp);
    const hadStats = Boolean(
      parsed.stats && typeof parsed.stats === "object" && !Array.isArray(parsed.stats),
    );
    const stats = normalizePlayerStats(parsed.stats);
    const allocatedPoints = Object.values(stats).reduce((sum, rank) => sum + rank, 0);
    let statPointsGrantedThroughLevel = hadStats
      ? Math.max(1, Math.floor(Number(parsed.statPointsGrantedThroughLevel) || currentLevel))
      : currentLevel;
    let unspentStatPoints = hadStats
      ? Math.max(
          0,
          Math.floor(
            Number(parsed.unspentStatPoints) ||
            Math.max(0, statPointsGrantedThroughLevel - 1 - allocatedPoints),
          ),
        )
      : Math.max(0, currentLevel - 1);
    if (currentLevel > statPointsGrantedThroughLevel) {
      unspentStatPoints += currentLevel - statPointsGrantedThroughLevel;
      statPointsGrantedThroughLevel = currentLevel;
    }
    const legacyCap = Number(parsed.temporaryResourceCap);
    let restBufferType = parsed.restBufferType === "long" || legacyCap === 150
      ? "long"
      : parsed.restBufferType === "short" || legacyCap === 125
        ? "short"
        : null;
    let resourceContext = { stats, restBufferType };
    const maxHp = getPlayerMaxHp(resourceContext);
    const maxMana = getPlayerMaxMana(resourceContext);
    let resourceCaps = getPlayerResourceCaps(resourceContext);
    let hp = Object.prototype.hasOwnProperty.call(parsed, "hp")
      ? Math.min(
          resourceCaps.hp,
          Math.max(
            0,
            Math.floor(Number(parsed.hp) || 0),
          ),
        )
      : maxHp;
    const manaStorageCap = currentLevel >= 48
      ? Math.floor(resourceCaps.mana * 1.5)
      : resourceCaps.mana;
    let mana = Object.prototype.hasOwnProperty.call(parsed, "mana")
      ? Math.min(
          manaStorageCap,
          Math.max(
            0,
            Math.floor(Number(parsed.mana) || 0),
          ),
        )
      : maxMana;
    if (hp <= maxHp && mana <= maxMana) {
      restBufferType = null;
      resourceContext = { stats, restBufferType };
      resourceCaps = getPlayerResourceCaps(resourceContext);
    }
    const lastRestAt = Math.max(
      0,
      Math.floor(Number(parsed.lastRestAt) || 0),
    );
    const lastLongRestAt = Math.max(
      0,
      Math.floor(Number(parsed.lastLongRestAt) || 0),
    );
    const temporaryResourceCap = Math.max(resourceCaps.hp, resourceCaps.mana);
    const activeMasteries = await getActiveMasteries(currentLevel);
    const statusEffects = normalizeStatusEffects(
      parsed.statusEffects,
      Date.now(),
      activeMasteries,
    );
    const hasSavedRegion = Object.prototype.hasOwnProperty.call(
      parsed,
      "currentRegion",
    );
    const savedRegion = getRegionById(
      String(parsed.currentRegion || "").trim(),
    );
    const currentRegion = savedRegion
      ? savedRegion.id
      : hasSavedRegion
        ? "moonlit-reef"
        : getRegionForLevel(levelFromXp(xp)).id;

    const discoveries = {};
    const notes = {};
    const combatProgress = {};
    const completedAdventures = {};

    if (
      parsed.discoveries &&
      typeof parsed.discoveries === "object" &&
      !Array.isArray(parsed.discoveries)
    ) {
      for (
        const [regionName, regionDiscoveries]
        of Object.entries(parsed.discoveries)
      ) {
        if (!Array.isArray(regionDiscoveries)) {
          continue;
        }

        discoveries[regionName] = [
          ...new Set(
            regionDiscoveries
              .map((code) =>
                String(code).trim(),
              )
              .filter(Boolean),
          ),
        ];
      }
    }

    if (
      parsed.notes &&
      typeof parsed.notes === "object" &&
      !Array.isArray(parsed.notes)
    ) {
      for (const [noteId, owned] of Object.entries(parsed.notes)) {
        if (owned === true && isTravelNoteId(noteId)) {
          notes[noteId] = true;
        }
      }
    }

    if (
      parsed.combatProgress &&
      typeof parsed.combatProgress === "object" &&
      !Array.isArray(parsed.combatProgress)
    ) {
      for (const region of REGIONS) {
        const highestUnlocked = Math.floor(
          Number(
            parsed.combatProgress[region.id]?.highestUnlocked,
          ) || 0,
        );

        if (highestUnlocked >= 1) {
          combatProgress[region.id] = {
            highestUnlocked,
          };
        }
      }
    }

    if (
      parsed.completedAdventures &&
      typeof parsed.completedAdventures === "object" &&
      !Array.isArray(parsed.completedAdventures)
    ) {
      for (const region of REGIONS) {
        const completed = parsed.completedAdventures[region.id];

        if (Array.isArray(completed)) {
          completedAdventures[region.id] = [
            ...new Set(
              completed.filter(
                (number) =>
                  Number.isSafeInteger(number) &&
                  number >= 1 &&
                  number <= 30,
              ),
            ),
          ].sort((left, right) => left - right);
        }
      }
    }

    const normalizedProgress = {
      evocationCooldownTurns: normalizeEvocationCooldown(parsed.evocationCooldownTurns),
      astralExpeditionRolls: normalizeAstralExpeditionRolls(parsed.astralExpeditionRolls),
      xp,
      berries,
      hp,
      maxHp,
      mana,
      maxMana,
      lastRestAt,
      lastLongRestAt,
      temporaryResourceCap,
      restBufferType,
      stats,
      unspentStatPoints,
      statPointsGrantedThroughLevel,
      statusEffects,
      discoveries,
      notes,
      ownedWeapons: normalizeOwnedWeapons(parsed.ownedWeapons),
      equippedWeapon: normalizeOwnedWeapons(parsed.ownedWeapons).includes(parsed.equippedWeapon)
        ? parsed.equippedWeapon : null,
      classSystemUnlocked: Boolean(parsed.classSystemUnlocked || normalizeOwnedWeapons(parsed.ownedWeapons).length),
      activeClass: normalizeOwnedWeapons(parsed.ownedWeapons).includes(parsed.activeClass)
        ? parsed.activeClass
        : normalizeOwnedWeapons(parsed.ownedWeapons).includes(parsed.equippedWeapon)
          ? parsed.equippedWeapon
          : normalizeOwnedWeapons(parsed.ownedWeapons).length === 1
            ? normalizeOwnedWeapons(parsed.ownedWeapons)[0] : null,
      combatProgress,
      completedAdventures,
      currentRegion,
    };

    if (
      !Object.prototype.hasOwnProperty.call(parsed, "mana") ||
      !Object.prototype.hasOwnProperty.call(parsed, "maxMana") ||
      !Object.prototype.hasOwnProperty.call(parsed, "hp") ||
      !Object.prototype.hasOwnProperty.call(parsed, "maxHp") ||
      !Object.prototype.hasOwnProperty.call(parsed, "lastRestAt") ||
      !Object.prototype.hasOwnProperty.call(parsed, "lastLongRestAt") ||
      !Object.prototype.hasOwnProperty.call(parsed, "temporaryResourceCap") ||
      !Object.prototype.hasOwnProperty.call(parsed, "statusEffects") ||
      !Object.prototype.hasOwnProperty.call(parsed, "stats") ||
      parsed.restBufferType !== restBufferType ||
      Number(parsed.unspentStatPoints) !== unspentStatPoints ||
      Number(parsed.statPointsGrantedThroughLevel) !== statPointsGrantedThroughLevel ||
      JSON.stringify(parsed.stats) !== JSON.stringify(stats) ||
      Number(parsed.hp) !== hp ||
      Number(parsed.maxHp) !== maxHp ||
      Number(parsed.mana) !== mana ||
      Number(parsed.maxMana) !== maxMana ||
      Number(parsed.lastRestAt) !== lastRestAt ||
      Number(parsed.lastLongRestAt) !== lastLongRestAt ||
      Number(parsed.temporaryResourceCap) !== temporaryResourceCap ||
      JSON.stringify(parsed.statusEffects) !== JSON.stringify(statusEffects)
    ) {
      await savePlayerProgress(env, backpackKey, normalizedProgress);
    }

    return normalizedProgress;
  } catch (error) {
    logRuntimeError(error, env[RUNTIME_DIAGNOSTICS], "state.progress.normalize");
    return createEmptyProgress();
  }
}

async function savePlayerProgress(
  env,
  backpackKey,
  progress,
) {
  const safeDiscoveries = {};
  const safeNotes = {};
  const safeCombatProgress = {};
  const safeCompletedAdventures = {};

  if (
    progress.discoveries &&
    typeof progress.discoveries === "object" &&
    !Array.isArray(progress.discoveries)
  ) {
    for (
      const [regionName, regionDiscoveries]
      of Object.entries(progress.discoveries)
    ) {
      if (!Array.isArray(regionDiscoveries)) {
        continue;
      }

      safeDiscoveries[regionName] = [
        ...new Set(
          regionDiscoveries
            .map((code) =>
              String(code).trim(),
            )
            .filter(Boolean),
        ),
      ];
    }
  }

  if (
    progress.notes &&
    typeof progress.notes === "object" &&
    !Array.isArray(progress.notes)
  ) {
    for (const [noteId, owned] of Object.entries(progress.notes)) {
      if (owned === true && isTravelNoteId(noteId)) {
        safeNotes[noteId] = true;
      }
    }
  }

  if (
    progress.combatProgress &&
    typeof progress.combatProgress === "object" &&
    !Array.isArray(progress.combatProgress)
  ) {
    for (const region of REGIONS) {
      const highestUnlocked = Math.floor(
        Number(
          progress.combatProgress[region.id]?.highestUnlocked,
        ) || 0,
      );

      if (highestUnlocked >= 1) {
        safeCombatProgress[region.id] = {
          highestUnlocked,
        };
      }
    }
  }

  if (
    progress.completedAdventures &&
    typeof progress.completedAdventures === "object" &&
    !Array.isArray(progress.completedAdventures)
  ) {
    for (const region of REGIONS) {
      const completed = progress.completedAdventures[region.id];

      if (Array.isArray(completed)) {
        safeCompletedAdventures[region.id] = [
          ...new Set(
            completed.filter(
              (number) =>
                Number.isSafeInteger(number) &&
                number >= 1 &&
                number <= 30,
            ),
          ),
        ].sort((left, right) => left - right);
      }
    }
  }

  const stats = normalizePlayerStats(progress.stats);
  let restBufferType = progress.restBufferType === "long"
    ? "long"
    : progress.restBufferType === "short"
      ? "short"
      : null;
  let resourceContext = { stats, restBufferType };
  const maxHp = getPlayerMaxHp(resourceContext);
  const maxMana = getPlayerMaxMana(resourceContext);
  const requestedHp = Math.max(
    0,
    Math.floor(Number(progress.hp) || 0),
  );
  const requestedMana = Math.max(
    0,
    Math.floor(Number(progress.mana) || 0),
  );
  if (requestedHp <= maxHp && requestedMana <= maxMana) {
    restBufferType = null;
    resourceContext = { stats, restBufferType };
  }
  const resourceCaps = getPlayerResourceCaps(resourceContext);
  const temporaryResourceCap = Math.max(resourceCaps.hp, resourceCaps.mana);
  const activeMasteries = await getActiveMasteries(
    levelFromXp(Number(progress.xp) || 0),
  );
  const manaStorageCap = activeMasteries.some(
    (mastery) => mastery.effect.id === "shizukis-presence",
  )
    ? Math.floor(resourceCaps.mana * 1.5)
    : resourceCaps.mana;

  const safeProgress = {
    evocationCooldownTurns: normalizeEvocationCooldown(progress.evocationCooldownTurns),
    astralExpeditionRolls: normalizeAstralExpeditionRolls(progress.astralExpeditionRolls),
    xp: Math.max(
      0,
      Math.floor(
        Number(progress.xp) || 0,
      ),
    ),
    berries: Math.max(
      0,
      Math.floor(
        Number(progress.berries) || 0,
      ),
    ),
    maxHp,
    maxMana,
    lastRestAt: Math.max(
      0,
      Math.floor(Number(progress.lastRestAt) || 0),
    ),
    lastLongRestAt: Math.max(
      0,
      Math.floor(Number(progress.lastLongRestAt) || 0),
    ),
    temporaryResourceCap,
    restBufferType,
    stats,
    unspentStatPoints: Math.max(0, Math.floor(Number(progress.unspentStatPoints) || 0)),
    statPointsGrantedThroughLevel: Math.max(1, Math.floor(Number(progress.statPointsGrantedThroughLevel) || levelFromXp(Number(progress.xp) || 0))),
    statusEffects: normalizeStatusEffects(
      progress.statusEffects,
      Date.now(),
      activeMasteries,
    ),
    discoveries: safeDiscoveries,
    notes: safeNotes,
    ownedWeapons: normalizeOwnedWeapons(progress.ownedWeapons),
    equippedWeapon: normalizeOwnedWeapons(progress.ownedWeapons).includes(progress.equippedWeapon)
      ? progress.equippedWeapon : null,
    classSystemUnlocked: Boolean(progress.classSystemUnlocked || normalizeOwnedWeapons(progress.ownedWeapons).length),
    activeClass: normalizeOwnedWeapons(progress.ownedWeapons).includes(progress.activeClass)
      ? progress.activeClass : null,
    combatProgress: safeCombatProgress,
    completedAdventures: safeCompletedAdventures,
    currentRegion:
      getRegionById(progress.currentRegion)?.id ||
      "moonlit-reef",
  };
  safeProgress.hp = Math.min(
    resourceCaps.hp,
    requestedHp,
  );
  safeProgress.mana = Math.min(
    manaStorageCap,
    requestedMana,
  );

  await env.Backpack.put(
    getProgressKey(backpackKey),
    JSON.stringify(safeProgress),
  );
}

function addDiscovery(
  discoveries,
  regionName,
  encounterCode,
) {
  const updatedDiscoveries = {
    ...(discoveries || {}),
  };

  if (!encounterCode) {
    return updatedDiscoveries;
  }

  const regionDiscoveries = Array.isArray(
    updatedDiscoveries[regionName],
  )
    ? [...updatedDiscoveries[regionName]]
    : [];

  if (!regionDiscoveries.includes(encounterCode)) {
    regionDiscoveries.push(encounterCode);
  }

  updatedDiscoveries[regionName] =
    regionDiscoveries;

  return updatedDiscoveries;
}

function isTravelNoteId(value) {
  return /^[a-z0-9-]+-note-\d{2}$/.test(String(value || ""));
}

function isTravelNoteDrop(drop) {
  const id = String(drop?.id || "").trim();
  return (
    isTravelNoteId(id) &&
    (
      drop?.type === "travel-note" ||
      (!drop?.type && isTravelNoteId(id))
    )
  );
}

function rollTravelNote(log) {
  if (!Array.isArray(log.itemDrops)) {
    return null;
  }

  for (const drop of log.itemDrops.filter(isTravelNoteDrop)) {
    const chance = Number(drop.chance);

    if (
      Number.isFinite(chance) &&
      Math.random() < Math.min(1, Math.max(0, chance))
    ) {
      return String(drop.id).trim();
    }
  }

  return null;
}

function getNoteRegionId(noteId) {
  const match = String(noteId || "").match(
    /^([a-z0-9-]+)-note-\d{2}$/,
  );

  return match ? match[1] : "";
}

function getNoteNumber(noteId) {
  const match = String(noteId || "").match(/-note-(\d{2})$/);
  return match ? Number(match[1]) : 0;
}

function getOwnedNoteNumbers(progress, regionId, noteCount) {
  const prefix = `${regionId}-note-`;

  return Object.entries(progress.notes || {})
    .filter(
      ([noteId, owned]) =>
        owned === true &&
        noteId.startsWith(prefix) &&
        isTravelNoteId(noteId),
    )
    .map(([noteId]) => getNoteNumber(noteId))
    .filter(
      (number) =>
        Number.isInteger(number) &&
        number >= 1 &&
        number <= noteCount,
    )
    .sort((left, right) => left - right);
}

function formatNumberRanges(numbers) {
  const sorted = [...new Set(numbers)].sort((left, right) => left - right);

  if (sorted.length === 0) {
    return "";
  }

  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let index = 1; index <= sorted.length; index += 1) {
    const current = sorted[index];

    if (current === end + 1) {
      end = current;
      continue;
    }

    ranges.push(start === end ? String(start) : `${start}-${end}`);
    start = current;
    end = current;
  }

  return ranges.join(", ");
}

/*
 * Hardcore leveling curve.
 *
 * Total XP milestones:
 *
 * Level 2:       500 XP
 * Level 5:     3,200 XP
 * Level 10:   11,700 XP
 * Level 20:   43,700 XP
 * Level 35:  129,200 XP
 * Level 50:  259,700 XP
 *
 * Formula:
 *
 * Total XP =
 * 100 × (level - 1)²
 * +
 * 400 × (level - 1)
 */
function totalXpForLevel(level) {
  const safeLevel =
    Math.max(
      1,
      Math.floor(level),
    );

  const completedLevels =
    safeLevel - 1;

  return (
    100 *
      completedLevels *
      completedLevels
    +
    400 *
      completedLevels
  );
}

function levelFromXp(xp) {
  const safeXp =
    Math.max(
      0,
      Math.floor(
        Number(xp) || 0,
      ),
    );

  let low = 1;
  let high = 2;

  /*
   * Find an upper level boundary.
   */
  while (
    totalXpForLevel(high) <=
    safeXp
  ) {
    high *= 2;
  }

  /*
   * Binary search avoids looping through
   * every single level.
   */
  while (low + 1 < high) {
    const middle =
      Math.floor(
        (low + high) / 2,
      );

    if (
      totalXpForLevel(middle) <=
      safeXp
    ) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return low;
}

function getLevelProgress(
  totalXp,
  level,
) {
  const levelStart =
    totalXpForLevel(level);

  const nextLevelStart =
    totalXpForLevel(
      level + 1,
    );

  return {
    current:
      Math.max(
        0,
        totalXp - levelStart,
      ),

    required:
      nextLevelStart -
      levelStart,
  };
}

function getTitleForLevel(level) {
  return TITLES.reduce(
    (
      currentTitle,
      title,
    ) =>
      level >= title.level
        ? title.name
        : currentTitle,

    TITLES[0].name,
  );
}

function getRegionForLevel(level) {
  return REGIONS.reduce(
    (
      currentRegion,
      region,
    ) =>
      level >= region.level
        ? region
        : currentRegion,

    REGIONS[0],
  );
}
