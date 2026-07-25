const GITHUB_EXPLORE_BASE =
  "https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data/explore";
const GITHUB_DATA_BASE =
  "https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data";
const DATA_CACHE_TTL_MS = 5 * 60 * 1000;
const DUPLICATE_NOTE_CANDY_BONUS = 40;
const COMBAT_STATE_TTL_SECONDS = 24 * 60 * 60;
const PENDING_COMBAT_TTL_MS = 5 * 60 * 1000;
const PLAYER_COMBAT_MAX_HP = 100;
const BERRY_HEAL_AMOUNT = 20;
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
    level: 35,
    name: "Sunken King's Throne",
    file: "sunken-kings-throne.json",
  },
  {
    id: "astral-nexus",
    level: 50,
    name: "Astral Nexus",
    file: "astral-nexus.json",
  },
];

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

  "Shizuki found an ancient relic, admired it for five seconds, then gave it to you.",

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

  "A starlit current revealed relics untouched for countless ages.",

  "The spirits of forgotten navigators guided you toward hidden fortune.",

  "A celestial bloom unfolded beneath the waves, revealing long-lost riches.",

  "The Astral Tide carried an ancient blessing across the sea just for you.",

  "Moonlight pooled across the ocean like silver glass before forming a hidden treasure.",

  "The stars above mirrored those below as another blessing found its way to your Backpack.",
];

const DISCORD_COMMANDS = [
  {
    name: "combat",
    description: "View or select an unlocked combat expedition.",
    type: 1,
    options: [
      {
        type: 4,
        name: "encounter",
        description: "Expedition number to challenge",
        required: false,
        min_value: 1,
      },
    ],
  },
  {
    name: "yes",
    description: "Begin your selected combat expedition",
    type: 1,
  },
  {
    name: "no",
    description: "Cancel your selected combat expedition",
    type: 1,
  },
  {
    name: "attack",
    description: "Attack the enemy in your current battle.",
    type: 1,
  },
  {
    name: "eat",
    description: "Eat a Berry during combat to restore 20 HP without using a turn.",
    type: 1,
  },
  {
    name: "explore",
    description: "Venture into the Astral Sea and find Star Candies.",
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
  {
    name: "moonlitreef",
    description:
      "View your Moonlit Reef exploration and relic completion.",
    type: 1,
  },
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

/* ============================================================
   WORKER ENTRY POINT
   ============================================================ */

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/discord/interactions") {
        return await handleDiscordInteraction(request, env);
      }

      if (url.pathname === "/discord/register") {
        return await handleDiscordRegistration(request, env);
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

      return await handleTwitchRequest(url, env);
    } catch (error) {
      console.error("Astral Sea Worker error:", error);

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

  switch (action) {
    case "combat":
      return textResponse(
        (
          await performCombat(
            env,
            backpackKey,
            url.searchParams.get("encounter") ||
              argumentParts[0] ||
              "",
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
        (await cancelPendingCombat(env, backpackKey)).message,
      );

    case "attack":
      return textResponse(
        (await performAttack(env, backpackKey, "twitch")).message,
      );

    case "eat":
      return textResponse(
        (
          await performEat(
            env,
            backpackKey,
            displayName,
            argumentParts.length > 0,
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
        (await performBackpack(env, backpackKey)).message,
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

    case "moonlitreef":
      return textResponse(
        (
          await performRegionCompletion(
            env,
            backpackKey,
            REGIONS[0],
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
      return textResponse(
        "Commands: !combat [number] — view/select expeditions, !yes — begin, !no — cancel, !attack, !eat, !explore, !daily, !gamble, !backpack, !travel, !journal, !notes, !note.",
        400,
      );
  }
}

/* ============================================================
      DISCORD INTERACTIONS ROUTER
   ============================================================ */

async function handleDiscordInteraction(request, env) {
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
  const userId =
    interaction.member?.user?.id ||
    interaction.user?.id;

  if (!userId || !/^\d{5,30}$/.test(userId)) {
    return discordMessage(
      "I could not identify your Discord account.",
      true,
    );
  }

  const backpackKey = `backpack:discord:${userId}`;
  const displayName = getDiscordDisplayName(interaction);

  try {
    switch (commandName) {
      case "combat":
        return discordMessage(
          (
            await performCombat(
              env,
              backpackKey,
              getDiscordOption(interaction, "encounter"),
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
          (await cancelPendingCombat(env, backpackKey)).message,
        );

      case "attack":
        return discordMessage(
          (await performAttack(env, backpackKey, "discord")).message,
        );

      case "eat":
        return discordMessage(
          (
            await performEat(
              env,
              backpackKey,
              displayName,
              Array.isArray(interaction.data?.options) &&
                interaction.data.options.length > 0,
            )
          ).message,
        );

      case "explore":
        return discordMessage(
          (await performExplore(env, backpackKey, "discord")).message,
        );

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
          (await performBackpack(env, backpackKey)).message,
          true,
        );

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

      case "moonlitreef":
        return discordMessage(
          (
            await performRegionCompletion(
              env,
              backpackKey,
              REGIONS[0],
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
        return discordMessage(
          "Commands: /combat [number] — view/select expeditions, /yes — begin, /no — cancel, /attack, /eat, /explore, /daily, /gamble, /backpack, /travel, /journal, /notes, /note.",
          true,
        );
    }
  } catch (error) {
    console.error(`Discord /${commandName} error:`, error);

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
  if (request.method !== "POST") {
    return textResponse(
      "Send a POST request to this route to register the commands.",
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
    "DISCORD_GUILD_ID",
    "DISCORD_BOT_TOKEN",
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

  // Guild commands update immediately, which is best while developing.
  const endpoint =
    `${DISCORD_API_BASE}/applications/` +
    `${env.DISCORD_APPLICATION_ID}/guilds/` +
    `${env.DISCORD_GUILD_ID}/commands`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(DISCORD_COMMANDS),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    console.error(
      "Discord command registration failed:",
      responseBody,
    );

    return jsonResponse(
      {
        ok: false,
        status: response.status,
        error: safeJsonParse(responseBody),
      },
      response.status,
    );
  }

  return jsonResponse({
    ok: true,
    message: "Discord commands registered successfully.",
    commands: safeJsonParse(responseBody),
  });
}

/* ============================================================
   SHARED GAME ACTIONS
   ============================================================ */

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
    return {
      message:
        `You are already fighting ${existingCombat.enemy.name}. ` +
        `HP: ${existingCombat.playerHp}/${existingCombat.playerMaxHp} | ` +
        `Enemy HP: ${existingCombat.enemy.hp}/${existingCombat.enemy.maxHp} | ` +
        `Use ${platform === "discord" ? "/attack" : "!attack"} to continue.`,
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
        `Combat expeditions are not available in ${region.name} right now.`,
    };
  }

  if (combatEntries.length === 0) {
    return {
      message:
        `${region.name} does not have any combat expeditions yet.`,
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
          ? "Usage: /combat <expedition number>\n" +
            "Use /combat to view your unlocked expeditions."
          : "Usage: !combat <expedition number> | " +
            "Use !combat to view your unlocked expeditions.",
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
        `That expedition does not exist. Choose a number from ` +
        `1 to ${combatEntries.length}.`,
    };
  }

  if (encounterNumber > highestUnlocked) {
    return {
      message:
        `Expedition ${encounterNumber} is locked. ` +
        `Defeat Expedition ${encounterNumber - 1} first.`,
    };
  }

  const encounter = getEncounterByNumber(
    combatEntries,
    encounterNumber,
  );
  const enemy = await getEnemyDefinition(encounter.enemy);
  const isChallenging =
    encounter.recommendedLevel > playerLevel;
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
        ? `Expedition ${encounterNumber}: Are you sure you want to fight ` +
          `${enemy.name}?!\n` +
          (isChallenging
            ? `Your Level: ${playerLevel} | Recommended Level: ` +
              `${encounter.recommendedLevel} — Challenging\n`
            : `Recommended Level: ${encounter.recommendedLevel}\n`) +
          "Use /yes to begin or /no to cancel."
        : `Expedition ${encounterNumber}: Fight ${enemy.name}? ` +
          (isChallenging
            ? `Your Level: ${playerLevel} | Recommended: ` +
              `${encounter.recommendedLevel} [Challenging]. `
            : `Recommended Level: ${encounter.recommendedLevel}. `) +
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

  const pendingResult = await getPendingCombat(env, backpackKey);

  if (pendingResult.expired) {
    await clearPendingCombat(env, backpackKey);

    return {
      message:
        `That expedition selection expired. Use ` +
        `${platform === "discord" ? "/combat <number>" : "!combat <number>"} again.`,
    };
  }

  const pending = pendingResult.pending;

  if (!pending) {
    return {
      message:
        "You do not have an expedition waiting for confirmation.",
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
        `${platform === "discord" ? "/combat <number>" : "!combat <number>"} again.`,
    };
  }

  let combatEntries;

  try {
    combatEntries = await getRegionCombatEntries(region.id);
  } catch (error) {
    console.error(`Combat confirmation failed for ${region.id}:`, error);

    return {
      message:
        `Combat expeditions are not available in ${region.name} right now.`,
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
        `That expedition is no longer available. Use ` +
        `${platform === "discord" ? "/combat" : "!combat"} again.`,
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

async function cancelPendingCombat(env, backpackKey) {
  return withPlayerMutationLock(
    backpackKey,
    async () => {
      const pendingResult = await getPendingCombat(env, backpackKey);

      if (!pendingResult.pending) {
        if (pendingResult.expired) {
          await clearPendingCombat(env, backpackKey);
        }

        return {
          message:
            "You do not have an expedition waiting for confirmation.",
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
          `Combat cancelled. The ${enemyName} has been left alone... for now.`,
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
) {
  const now = Math.floor(Date.now() / 1000);
  const combatState = {
    version: 1,
    regionId: region.id,
    encounterNumber,
    playerHp: PLAYER_COMBAT_MAX_HP,
    playerMaxHp: PLAYER_COMBAT_MAX_HP,
    enemy: {
      ...enemy,
      hp: enemy.hp,
      maxHp: enemy.hp,
    },
    round: 1,
    startedAt: now,
    updatedAt: now,
  };

  await saveCombatState(env, backpackKey, combatState);

  return {
    message:
      platform === "discord"
        ? `Expedition ${encounterNumber} begins!\n\n` +
          `${enemy.name} appears in ${region.name}.\n` +
          `Enemy HP: ${enemy.hp}\n` +
          `Your HP: ${PLAYER_COMBAT_MAX_HP}\n\n` +
          "Use /attack to strike."
        : `Expedition ${encounterNumber} begins! ${enemy.name} appears. ` +
          `Enemy HP: ${enemy.hp} | Your HP: ${PLAYER_COMBAT_MAX_HP} | ` +
          "Use !attack to strike.",
  };
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
    return {
      message:
        "You are not currently in a battle. " +
        `Use ${platform === "discord" ? "/combat" : "!combat"} to find an opponent.`,
    };
  }

  const playerRoll = randomInteger(1, 20);
  const playerAttack = getCombatRollResult(playerRoll);
  combatState.enemy.hp = Math.max(
    0,
    combatState.enemy.hp - playerAttack.damage,
  );

  const messageParts = [
    formatCombatRollMessage("You", playerRoll, playerAttack),
  ];

  if (combatState.enemy.hp === 0) {
    const victory = await resolveCombatVictory(
      env,
      backpackKey,
      combatState,
      playerRoll,
      playerAttack.damage,
      platform,
    );

    return {
      ...victory,
      message: victory.message,
    };
  }

  const enemyRoll = randomInteger(1, 20);
  const enemyAttack = getCombatRollResult(enemyRoll);
  combatState.playerHp = Math.max(
    0,
    combatState.playerHp - enemyAttack.damage,
  );

  messageParts.push(
    formatCombatRollMessage("Enemy", enemyRoll, enemyAttack),
  );

  if (combatState.playerHp === 0) {
    const defeat = await resolveCombatDefeat(
      env,
      backpackKey,
      combatState,
    );

    messageParts.push(defeat.message);

    return {
      ...defeat,
      message: messageParts.join(" | "),
    };
  }

  combatState.round += 1;
  combatState.updatedAt = Math.floor(Date.now() / 1000);
  await saveCombatState(env, backpackKey, combatState);

  messageParts.push(
    `HP: ${combatState.playerHp}/${combatState.playerMaxHp}`,
    `Enemy HP: ${combatState.enemy.hp}/${combatState.enemy.maxHp}`,
  );

  return {
    message: messageParts.join(" | "),
  };
}

async function performEat(
  env,
  backpackKey,
  displayName,
  hasArguments = false,
) {
  return withPlayerMutationLock(
    backpackKey,
    () => performEatUnlocked(
      env,
      backpackKey,
      displayName,
      hasArguments,
    ),
  );
}

async function performEatUnlocked(
  env,
  backpackKey,
  displayName,
  hasArguments,
) {
  const combatState = await getCombatState(env, backpackKey);

  if (!combatState) {
    return {
      message:
        `${displayName}, you can only eat Berries while fighting an enemy.`,
    };
  }

  if (hasArguments) {
    return {
      message:
        `${displayName}, use this command without an amount.`,
    };
  }

  const progress = await getPlayerProgress(env, backpackKey);

  if (progress.berries < 1) {
    return {
      message:
        `${displayName}, you do not have any Berries to eat.`,
    };
  }

  if (combatState.playerHp >= combatState.playerMaxHp) {
    return {
      message:
        `${displayName}, your HP is already full. No Berry was consumed.`,
    };
  }

  const latestProgress = await getPlayerProgress(env, backpackKey);

  if (latestProgress.berries < 1) {
    return {
      message:
        `${displayName}, you do not have any Berries to eat.`,
    };
  }

  const originalCombatState = structuredClone(combatState);
  const healedAmount = Math.min(
    BERRY_HEAL_AMOUNT,
    combatState.playerMaxHp - combatState.playerHp,
  );
  combatState.playerHp += healedAmount;
  const remainingBerries = Math.max(
    0,
    latestProgress.berries - 1,
  );

  await saveCombatState(env, backpackKey, combatState);

  try {
    await savePlayerProgress(env, backpackKey, {
      ...latestProgress,
      berries: remainingBerries,
    });
  } catch (error) {
    try {
      await saveCombatState(env, backpackKey, originalCombatState);
    } catch (rollbackError) {
      console.error("Berry heal rollback failed:", rollbackError);
    }

    throw error;
  }

  return {
    healedAmount,
    berries: remainingBerries,
    playerHp: combatState.playerHp,
    playerMaxHp: combatState.playerMaxHp,
    message:
      `${displayName} ate 1 Berry and restored ${healedAmount} HP! ` +
      `HP: ${combatState.playerHp}/${combatState.playerMaxHp} | ` +
      `Berries: ${remainingBerries.toLocaleString("en-US")}`,
  };
}

async function resolveCombatVictory(
  env,
  backpackKey,
  combatState,
  playerRoll,
  playerDamage,
  platform = "twitch",
) {
  const [currentTotal, progress] = await Promise.all([
    getBackpackTotal(env, backpackKey),
    getPlayerProgress(env, backpackKey),
  ]);
  const candyReward = randomInteger(
    combatState.enemy.reward.candies.min,
    combatState.enemy.reward.candies.max,
  );
  const xpReward = randomInteger(
    combatState.enemy.reward.xp.min,
    combatState.enemy.reward.xp.max,
  );
  const startingLevel = levelFromXp(progress.xp);
  const startingTitle = getTitleForLevel(startingLevel);
  const startingRegion = getRegionForLevel(startingLevel);
  const newTotal = currentTotal + candyReward;
  const newXp = progress.xp + xpReward;
  const endingLevel = levelFromXp(newXp);
  const endingTitle = getTitleForLevel(endingLevel);
  const endingRegion = getRegionForLevel(endingLevel);
  const unlockResult = await unlockNextEncounterAfterVictory(
    combatState,
    progress,
  );
  const updatedProgress = {
    ...progress,
    xp: newXp,
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
    `${combatState.enemy.name} defeated!`,
    playerRoll === 20
      ? `You rolled 20 → Critical! ${playerDamage} dmg`
      : `You rolled ${playerRoll} → ${playerDamage} dmg`,
    `+${xpReward} XP`,
    `+${candyReward} Star Candies`,
    `Backpack: ${newTotal}`,
  ];

  if (endingLevel > startingLevel) {
    messageParts.push(`Level Up: Level ${endingLevel}`);
  }

  if (endingTitle !== startingTitle) {
    messageParts.push(`New Title: ${endingTitle}`);
  }

  if (endingRegion.id !== startingRegion.id) {
    messageParts.push(`Region Unlocked: ${endingRegion.name}`);
  }

  if (unlockResult?.unlockedEncounter) {
    messageParts.push(
      `Expedition ${unlockResult.unlockedEncounter.number} — ` +
      `${unlockResult.unlockedEncounter.name} is now unlocked. ` +
      `Recommended Level: ${unlockResult.unlockedEncounter.recommendedLevel}. ` +
      `Use ${platform === "discord" ? "/combat" : "!combat"} ` +
      `${unlockResult.unlockedEncounter.number} to select it.`,
    );
  }

  return {
    won: true,
    candyReward,
    xpReward,
    total: newTotal,
    xp: newXp,
    message: messageParts.join(" | "),
  };
}

async function resolveCombatDefeat(
  env,
  backpackKey,
  combatState,
) {
  const currentTotal = await getBackpackTotal(env, backpackKey);
  const candyLoss = Math.min(
    currentTotal,
    combatState.enemy.defeatCandyLoss,
  );
  const newTotal = currentTotal - candyLoss;

  await saveBackpackTotal(env, backpackKey, newTotal);
  await deleteCombatState(env, backpackKey);

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
        "You cannot explore during an active battle. " +
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

  const reward = randomInteger(
    minimumReward,
    maximumReward,
  );

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
  const newXp = startingXp + earnedXp;
  const endingLevel = levelFromXp(newXp);
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

  const relicDrop = rollUniqueRelic(
    log,
    progress.relics,
  );

  let updatedRelics = [...progress.relics];
  let foundNewRelic = false;

  if (relicDrop) {
    const relicResult = addUniqueRelic(
      updatedRelics,
      relicDrop,
    );

    updatedRelics = relicResult.relics;
    foundNewRelic = relicResult.isNew;
  }

  const berryDropChance =
    BERRY_DROP_CHANCE_BY_REGION[startingRegion.id] ?? 0;

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
      ...progress,
      xp: newXp,
      relics: updatedRelics,
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
    `+${earnedXp} XP | ` +
      `Level ${endingLevel} | ` +
      `${levelProgress.current}/${levelProgress.required} XP`,
    `Backpack: ${newTotal} Star Candies`,
  ];

  if (endingLevel > startingLevel) {
    messageLines.push(
      `LEVEL UP! You reached Level ${endingLevel}!`,
    );
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
  }

  if (foundNewRelic && relicDrop) {
    messageLines.push(
      `RELIC DISCOVERED: ${formatRelicName(relicDrop)}`,
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
    const title = discoveredNote
      ? ` — ${discoveredNote.title}`
      : "";
    const readCommand = platform === "discord"
      ? ` Use /note region:${noteRegionId} number:${noteNumber} to read it.`
      : ` Use !note ${noteRegionId} ${noteNumber} to read it.`;

    messageLines.push(
      `Travel Note discovered: ${noteRegion?.name || noteRegionId} #${noteNumber}${title}!${discoveredNote ? readCommand : ""}`,
    );
  }

  if (foundBerry) {
    messageLines.push(
      `Found 1 Berry! Berries: ${updatedBerryCount.toLocaleString("en-US")}`,
    );
  }

  return {
    reward,
    earnedXp,
    xp: newXp,
    level: endingLevel,
    title: endingTitle,
    region: startingRegion.name,
    relic: foundNewRelic ? relicDrop : null,
    note: noteDrop,
    berry: foundBerry,
    berries: updatedBerryCount,
    total: newTotal,
    message: messageLines.join(" | "),
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

async function performBackpack(
  env,
  backpackKey,
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
      `Berries: ${progress.berries.toLocaleString("en-US")}`,
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
        "You cannot travel during an active battle. " +
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
    return isValidCombatState(parsed) ? parsed : null;
  } catch {
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

/* ============================================================
   DISCORD HELPERS
   ============================================================ */

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

  return `${attacker} rolled ${roll} → ${result.damage} dmg${specialText}`;
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

function isValidCombatState(combatState) {
  const enemy = combatState?.enemy;

  return Boolean(
    combatState &&
    combatState.version === 1 &&
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
    combatState.playerMaxHp === PLAYER_COMBAT_MAX_HP &&
    combatState.playerHp > 0 &&
    combatState.playerHp <= combatState.playerMaxHp &&
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
    `${GITHUB_DATA_BASE}/enemies/${regionId}.json`,
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
        : encounter;

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

  const enemy = await fetchCachedJson(
    `enemy:${enemyId}`,
    `${GITHUB_DATA_BASE}/enemies/${enemyId}.json`,
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
        return {
          name: (await getEnemyDefinition(entry.enemy)).name,
          recommendedLevel: entry.recommendedLevel,
        };
      } catch {
        return {
          name: entry.enemy,
          recommendedLevel: entry.recommendedLevel,
        };
      }
    }),
  );
  const lines = platform === "discord"
    ? [
        `${region.name} Combat Progress`,
        `Your Level: ${playerLevel}`,
        `Expeditions Unlocked: ${highestUnlocked} of ${entries.length}`,
      ]
    : [
        `${region.name} | Level ${playerLevel} | ` +
        `Expeditions: ${highestUnlocked}/${entries.length}`,
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

  const command = platform === "discord" ? "/combat" : "!combat";
  lines.push(
    platform === "discord"
      ? highestUnlocked === 1
        ? `Use ${command} 1 to select an expedition.`
        : `Use ${command} 1 through ${command} ${highestUnlocked} ` +
          "to select an expedition."
      : highestUnlocked === 1
        ? "Use !combat 1"
        : `Use !combat 1-${highestUnlocked}`,
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

  try {
    nextEnemy = await getEnemyDefinition(nextEncounter.enemy);
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
      recommendedLevel: nextEncounter.recommendedLevel,
    },
  };
}

async function fetchCachedJson(cacheKey, url) {
  const cached = DATA_CACHE.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  let response;

  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "Astral-Sea-Adventure-Worker",
      },
    });
  } catch (error) {
    throw new Error(`Could not fetch ${cacheKey}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Could not fetch ${cacheKey}: HTTP ${response.status}`);
  }

  let value;

  try {
    value = await response.json();
  } catch {
    throw new Error(`Could not parse ${cacheKey}.`);
  }

  DATA_CACHE.set(cacheKey, {
    value,
    expiresAt: Date.now() + DATA_CACHE_TTL_MS,
  });

  return value;
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
  const regionUrl =
    `${GITHUB_EXPLORE_BASE}/${region.file}`;

  let response = await fetch(
    regionUrl,
    {
      headers: {
        "User-Agent":
          "Astral-Sea-Adventure-Worker",
      },
    },
  );

  /*
   * Temporary protection:
   *
   * Until a future region's JSON file exists,
   * the Worker uses Moonlit Reef instead of
   * breaking the explore command.
   */
  if (
    !response.ok &&
    region.level > 1
  ) {
    console.warn(
      `Could not load ${region.name}. ` +
      "Falling back to Moonlit Reef.",
    );

    response = await fetch(
      `${GITHUB_EXPLORE_BASE}/moonlit-reef.json`,
      {
        headers: {
          "User-Agent":
            "Astral-Sea-Adventure-Worker",
        },
      },
    );
  }

  if (!response.ok) {
    throw new Error(
      "Could not load exploration data: " +
      response.status,
    );
  }

  const logs =
    await response.json();

  if (
    !Array.isArray(logs) ||
    logs.length === 0
  ) {
    throw new Error(
      "The exploration data contains no entries.",
    );
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
  const [progress, logs] = await Promise.all([
    getPlayerProgress(
      env,
      backpackKey,
    ),
    loadRegionLogs(region),
  ]);

  const validExploreCodes = [
    ...new Set(
      logs
        .map((log) =>
          String(log.code || "").trim(),
        )
        .filter(Boolean),
    ),
  ];

  const regionRelicIds = [
    ...new Set(
      logs.flatMap((log) =>
        Array.isArray(log.itemDrops)
          ? log.itemDrops
              .map((drop) =>
                String(
                  drop?.id || "",
                ).trim(),
              )
              .filter(Boolean)
          : [],
      ),
    ),
  ];

  const discoveredCodes = new Set(
    progress.discoveries?.[region.name] || [],
  );

  const ownedRelics = new Set(
    progress.relics || [],
  );

  const completedExplores =
    validExploreCodes.filter(
      (code) => discoveredCodes.has(code),
    ).length;

  const completedRelics =
    regionRelicIds.filter(
      (relicId) => ownedRelics.has(relicId),
    ).length;

  const totalExplores =
    validExploreCodes.length;

  const totalRelics =
    regionRelicIds.length;

  const totalObjectives =
    totalExplores + totalRelics;

  const completedObjectives =
    completedExplores + completedRelics;

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
    completedExplores,
    totalExplores,
    completedRelics,
    totalRelics,
    completionPercent,
    message:
      `${region.name} Completion\n` +
      `Explores: ${completedExplores}/${totalExplores} | ` +
      `Relics: ${completedRelics}/${totalRelics} | ` +
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

function createEmptyProgress() {
  return {
    xp: 0,
    berries: 0,
    relics: [],
    discoveries: {},
    notes: {},
    combatProgress: {},
    currentRegion: "moonlit-reef",
  };
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

    const relics = Array.isArray(parsed.relics)
      ? [
          ...new Set(
            parsed.relics
              .map((relicId) =>
                String(relicId).trim(),
              )
              .filter(Boolean),
          ),
        ]
      : [];

    const discoveries = {};
    const notes = {};
    const combatProgress = {};

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

    return {
      xp,
      berries,
      relics,
      discoveries,
      notes,
      combatProgress,
      currentRegion,
    };
  } catch {
    return createEmptyProgress();
  }
}

async function savePlayerProgress(
  env,
  backpackKey,
  progress,
) {
  const safeRelics = [
    ...new Set(
      Array.isArray(progress.relics)
        ? progress.relics
            .map((relicId) =>
              String(relicId).trim(),
            )
            .filter(Boolean)
        : [],
    ),
  ];

  const safeDiscoveries = {};
  const safeNotes = {};
  const safeCombatProgress = {};

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

  const safeProgress = {
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
    relics: safeRelics,
    discoveries: safeDiscoveries,
    notes: safeNotes,
    combatProgress: safeCombatProgress,
    currentRegion:
      getRegionById(progress.currentRegion)?.id ||
      "moonlit-reef",
  };

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

function addUniqueRelic(
  relics,
  relicId,
) {
  const updatedRelics = Array.isArray(relics)
    ? [...relics]
    : [];

  if (!updatedRelics.includes(relicId)) {
    updatedRelics.push(relicId);

    return {
      relics: updatedRelics,
      isNew: true,
    };
  }

  return {
    relics: updatedRelics,
    isNew: false,
  };
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

function rollUniqueRelic(
  log,
  ownedRelics,
) {
  if (!Array.isArray(log.itemDrops)) {
    return null;
  }

  const owned = new Set(
    Array.isArray(ownedRelics)
      ? ownedRelics
      : [],
  );

  const availableDrops = log.itemDrops.filter(
    (drop) => {
      const relicId = String(
        drop?.id || "",
      ).trim();

      const chance = Number(
        drop?.chance,
      );

      return (
        relicId &&
        !isTravelNoteDrop(drop) &&
        Number.isFinite(chance) &&
        chance > 0 &&
        !owned.has(relicId)
      );
    },
  );

  for (const drop of availableDrops) {
    const chance = Math.min(
      1,
      Math.max(
        0,
        Number(drop.chance),
      ),
    );

    if (Math.random() < chance) {
      return String(drop.id).trim();
    }
  }

  return null;
}

function formatRelicName(relicId) {
  return relicId
    .split("_")
    .map((word) =>
      word.length > 0
        ? word[0].toUpperCase() +
          word.slice(1)
        : word,
    )
    .join(" ")
    .replace(/\bShizukis\b/g, "Shizuki's")
    .replace(/\bMoonkeepers\b/g, "Moonkeeper's")
    .replace(/\bNavigators\b/g, "Navigator's");
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

