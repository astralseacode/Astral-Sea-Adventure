# Narrative formatting audit

Baseline: b22d5ecde30ba1a468e35b16939010bc98a3da2c. Local formatting-only cleanup; no deployment, commit, push, remote registration or live data access.

Existing narrative wording was preserved exactly. No flavor text, sentences, jokes, lore, or descriptions were added, removed, or rewritten. Narrative changes were limited to whitespace/paragraph formatting and approved player-facing descriptive hyphens being replaced with spaces.

Changed 1376 player-facing strings in 267 existing files. Spacing changed in 149 files; 614 player-facing hyphens were replaced with spaces.

## Scope and examples

Adventure introductions, rooms/path outcomes, boss approaches/reveals, completion and retreat narration, visible Adventure/enemy/boss names, manifests, Explore/reward flavor, Travel Notes, spell narration and two shop flavor strings were changed. Regions, perks, masteries, help/error text and other spell/item text were audited; unrelated mechanics and existing intentional formatting remain unchanged.

- Leviathan's Wake Adventure 1 joins its first two sentences and its pillars/joints sentences into paragraphs, retaining “They're ribs.” as a standalone reveal. The original “violent crosscurrents” wording remains.
- Its room prompt and existing Choose commands render as one paragraph on both platforms.
- Wake-Rider Crossing → Wake Rider Crossing; Wake-Riding Razorfish → Wake Riding Razorfish; Bone-Crown → Bone Crown; Echo-thyme → Echo thyme.
- Elf Blessing groups related action sentences while preserving quoted dialogue and punchlines. Leviathan's Wake groups related cast/arrival narration while preserving reveals.
- Short chants, creature lists, quoted signs, ellipses, delayed jokes and major scene changes retain their breaks. Existing decorative separators were not removed because that would change punctuation.

## Preservation and validation

- All 591 JSON files parse; recursive comparison preserves keys, array order, internal strings, IDs, aliases, schema values, all numbers and rewards. Every changed narrative string passes exact wording/punctuation/case comparison after only approved dehyphenation and whitespace normalization.
- Worker diff is exactly two approved hyphen-to-space edits inside shop flavor strings; no command, combat, progression, unlock, persistence or ownership behavior changes.
- All 359 Discord/Twitch intro and boss-prompt pairs retain full narrative parity (zero pre-existing mismatches). Shared room output also passes the parity check. Twitch narration was not shortened.
- Expansion validator: PASS (180 Adventures, 180 normal enemies, 180 bosses; references and rewards valid).
- Offline regression tests: PASS (12 Jellyfish Mastery II groups, 13 Leviathan's Wake groups, and all devlevel checks).
- Worker module and new CJS tool/validator syntax: PASS.
- git diff --check: PASS.

## Intentionally retained hyphens

Ordinary idioms, numerical expressions, qualifications/negation, comic directional labels, onomatopoeia and technical/command references were retained where they fall outside descriptive fantasy naming or where removal could obscure meaning. Examples: twenty-one, five-minute, thumbs-up, hide-and-seek, clack-clack-clack, dry-ish, Up-Ish, non-secret, full-HP and the whispering-kelp-forest command reference. Internal IDs, filenames, URLs, operators and negative numbers remain untouched. The full remaining visible candidate inventory is below; no compensating rewrites were made.

| Candidate | Occurrences |
| --- | ---: |
| Adventure-specific | 1 |
| Anti-rolling-down-a-hill | 1 |
| Astronomy-related | 1 |
| Berry-based | 1 |
| Cozy-horrifying | 1 |
| Drake-free | 1 |
| Five-Star | 1 |
| Five-star | 1 |
| Flower-related | 1 |
| Fresh-looking | 1 |
| Gardener-approved | 1 |
| Gerald-approved | 2 |
| Ground-related | 1 |
| Highest-quality | 1 |
| Locksmith-related | 1 |
| Night-light | 1 |
| North-ish | 1 |
| Orion-adjacent | 1 |
| Show-off | 4 |
| Spike-related | 1 |
| Turtle-adventure | 1 |
| UP-ISH | 1 |
| Up-Ish | 1 |
| Upside-Down | 1 |
| abyss-related | 2 |
| actually-her-own | 1 |
| already-looted | 1 |
| already-open | 1 |
| ancient-machine-related | 1 |
| ankle-deep | 1 |
| anti-destiny | 1 |
| art-related | 2 |
| astronomy-related | 1 |
| biological-sounding | 1 |
| breathing-point | 1 |
| button-based | 1 |
| century-old | 1 |
| clack-clack-clack | 2 |
| concert-recovery | 1 |
| confidence-sensitive | 1 |
| confiscated-items | 1 |
| course-recovery | 1 |
| cultural-exchange | 1 |
| customer-service | 1 |
| definitely-secret | 1 |
| dizzy-looking | 1 |
| door-watching | 1 |
| dry-ish | 1 |
| emotional-break | 1 |
| face-first | 1 |
| fact-check | 1 |
| familiar-looking | 2 |
| fast-moving | 1 |
| finish-line | 1 |
| five-minute | 1 |
| five-pointed | 1 |
| five-star | 2 |
| flight-and-falling | 1 |
| follow-up | 1 |
| forest-approved | 1 |
| four-star | 1 |
| four-way | 1 |
| fourteen-hinge | 1 |
| freedom-minded | 1 |
| fresh-looking | 1 |
| friendly-looking | 1 |
| full-HP | 1 |
| full-sized | 2 |
| fully-real | 1 |
| gift-shop | 1 |
| half-empty | 1 |
| half-finished | 1 |
| half-functioning | 1 |
| half-second | 1 |
| hand-drawn | 1 |
| hide-and-seek | 1 |
| high-altitude | 1 |
| long-gone | 1 |
| low-gravity | 1 |
| mid-charge | 1 |
| mid-fight | 2 |
| multi-regional | 2 |
| neutral-zone | 1 |
| non-biting | 2 |
| non-predatory | 1 |
| non-secret | 2 |
| non-walking | 1 |
| not-quite | 1 |
| off-key | 1 |
| pastry-eating | 1 |
| pillow-storm | 1 |
| plant-bite | 1 |
| portal-tag | 1 |
| post-rematch | 1 |
| pre-race | 1 |
| propped-open | 1 |
| proud-looking | 1 |
| race-recovery | 1 |
| recovery-order | 1 |
| red-hot | 1 |
| region-themed | 1 |
| road-that-is-not-a-road | 1 |
| rock-related | 1 |
| sarcasm-compatible | 1 |
| scratched-out | 1 |
| sealed-looking | 1 |
| secret-and-song | 1 |
| self-appointed | 1 |
| shadow-side | 1 |
| shark-crossing | 1 |
| shopping-incident | 1 |
| six-pointed | 1 |
| solid-looking | 2 |
| space-friend | 1 |
| statue-related | 1 |
| terrain-related | 1 |
| thirty-foot | 2 |
| three-note | 1 |
| three-part | 1 |
| thumbs-up | 2 |
| twenty-one | 1 |
| two-star | 1 |
| upside-down | 1 |
| wall-floor | 1 |
| warm-up | 1 |
| water-slide | 2 |
| web-related | 1 |
| whispering-kelp-forest | 1 |

## Files modified

| Category | Files |
| --- | ---: |
| adventures | 182 |
| enemies | 73 |
| explore | 5 |
| notes | 4 |
| spells | 2 |
| worker.js | 1 |

- [data/adventures/astral-nexus/adventure-01-the-paradox-shoal.json](data/adventures/astral-nexus/adventure-01-the-paradox-shoal.json)
- [data/adventures/astral-nexus/adventure-02-impossible-angles.json](data/adventures/astral-nexus/adventure-02-impossible-angles.json)
- [data/adventures/astral-nexus/adventure-03-memoryglass-strand.json](data/adventures/astral-nexus/adventure-03-memoryglass-strand.json)
- [data/adventures/astral-nexus/adventure-04-portal-skip-expanse.json](data/adventures/astral-nexus/adventure-04-portal-skip-expanse.json)
- [data/adventures/astral-nexus/adventure-05-clocktide-drift.json](data/adventures/astral-nexus/adventure-05-clocktide-drift.json)
- [data/adventures/astral-nexus/adventure-06-fractured-ocean.json](data/adventures/astral-nexus/adventure-06-fractured-ocean.json)
- [data/adventures/astral-nexus/adventure-07-dream-anchor-mooring.json](data/adventures/astral-nexus/adventure-07-dream-anchor-mooring.json)
- [data/adventures/astral-nexus/adventure-08-stars-beneath-the-water.json](data/adventures/astral-nexus/adventure-08-stars-beneath-the-water.json)
- [data/adventures/astral-nexus/adventure-09-the-fae-axis.json](data/adventures/astral-nexus/adventure-09-the-fae-axis.json)
- [data/adventures/astral-nexus/adventure-10-hall-of-other-selves.json](data/adventures/astral-nexus/adventure-10-hall-of-other-selves.json)
- [data/adventures/astral-nexus/adventure-11-stormscript-tempest.json](data/adventures/astral-nexus/adventure-11-stormscript-tempest.json)
- [data/adventures/astral-nexus/adventure-12-portalroot-network.json](data/adventures/astral-nexus/adventure-12-portalroot-network.json)
- [data/adventures/astral-nexus/adventure-13-walking-constellations.json](data/adventures/astral-nexus/adventure-13-walking-constellations.json)
- [data/adventures/astral-nexus/adventure-14-the-returning-yesterday.json](data/adventures/astral-nexus/adventure-14-the-returning-yesterday.json)
- [data/adventures/astral-nexus/adventure-15-voidflower-garden.json](data/adventures/astral-nexus/adventure-15-voidflower-garden.json)
- [data/adventures/astral-nexus/adventure-16-convergent-currents.json](data/adventures/astral-nexus/adventure-16-convergent-currents.json)
- [data/adventures/astral-nexus/adventure-17-thoughtform-maze.json](data/adventures/astral-nexus/adventure-17-thoughtform-maze.json)
- [data/adventures/astral-nexus/adventure-18-astral-storm-islands.json](data/adventures/astral-nexus/adventure-18-astral-storm-islands.json)
- [data/adventures/astral-nexus/adventure-19-phaseclaw-causeway.json](data/adventures/astral-nexus/adventure-19-phaseclaw-causeway.json)
- [data/adventures/astral-nexus/adventure-20-the-memory-reef.json](data/adventures/astral-nexus/adventure-20-the-memory-reef.json)
- [data/adventures/astral-nexus/adventure-21-gravity-choir.json](data/adventures/astral-nexus/adventure-21-gravity-choir.json)
- [data/adventures/astral-nexus/adventure-22-foldspace-spiral.json](data/adventures/astral-nexus/adventure-22-foldspace-spiral.json)
- [data/adventures/astral-nexus/adventure-23-the-unbuilding-ruins.json](data/adventures/astral-nexus/adventure-23-the-unbuilding-ruins.json)
- [data/adventures/astral-nexus/adventure-24-eventide-threshold.json](data/adventures/astral-nexus/adventure-24-eventide-threshold.json)
- [data/adventures/astral-nexus/adventure-25-portal-graveyard.json](data/adventures/astral-nexus/adventure-25-portal-graveyard.json)
- [data/adventures/astral-nexus/adventure-26-the-gnawed-timeline.json](data/adventures/astral-nexus/adventure-26-the-gnawed-timeline.json)
- [data/adventures/astral-nexus/adventure-27-nexus-crown-array.json](data/adventures/astral-nexus/adventure-27-nexus-crown-array.json)
- [data/adventures/astral-nexus/adventure-28-the-first-light-memory.json](data/adventures/astral-nexus/adventure-28-the-first-light-memory.json)
- [data/adventures/astral-nexus/adventure-29-convergence-threshold.json](data/adventures/astral-nexus/adventure-29-convergence-threshold.json)
- [data/adventures/astral-nexus/adventure-30-heart-of-the-astral-sea.json](data/adventures/astral-nexus/adventure-30-heart-of-the-astral-sea.json)
- [data/adventures/astral-nexus/manifest.json](data/adventures/astral-nexus/manifest.json)
- [data/adventures/leviathans-wake/adventure-01-wake-rider-crossing.json](data/adventures/leviathans-wake/adventure-01-wake-rider-crossing.json)
- [data/adventures/leviathans-wake/adventure-02-titanbone-ribs.json](data/adventures/leviathans-wake/adventure-02-titanbone-ribs.json)
- [data/adventures/leviathans-wake/adventure-03-pressurejaw-drop.json](data/adventures/leviathans-wake/adventure-03-pressurejaw-drop.json)
- [data/adventures/leviathans-wake/adventure-04-scale-shelter-wrecks.json](data/adventures/leviathans-wake/adventure-04-scale-shelter-wrecks.json)
- [data/adventures/leviathans-wake/adventure-05-currentbreaker-run.json](data/adventures/leviathans-wake/adventure-05-currentbreaker-run.json)
- [data/adventures/leviathans-wake/adventure-06-bonegarden-spines.json](data/adventures/leviathans-wake/adventure-06-bonegarden-spines.json)
- [data/adventures/leviathans-wake/adventure-07-hullsplitter-graveyard.json](data/adventures/leviathans-wake/adventure-07-hullsplitter-graveyard.json)
- [data/adventures/leviathans-wake/adventure-08-wakefoam-tempest.json](data/adventures/leviathans-wake/adventure-08-wakefoam-tempest.json)
- [data/adventures/leviathans-wake/adventure-09-deep-scar-ravine.json](data/adventures/leviathans-wake/adventure-09-deep-scar-ravine.json)
- [data/adventures/leviathans-wake/adventure-10-the-walking-scale.json](data/adventures/leviathans-wake/adventure-10-the-walking-scale.json)
- [data/adventures/leviathans-wake/adventure-11-riptide-gauntlet.json](data/adventures/leviathans-wake/adventure-11-riptide-gauntlet.json)
- [data/adventures/leviathans-wake/adventure-12-wrecknest-passage.json](data/adventures/leviathans-wake/adventure-12-wrecknest-passage.json)
- [data/adventures/leviathans-wake/adventure-13-tectonic-shelf.json](data/adventures/leviathans-wake/adventure-13-tectonic-shelf.json)
- [data/adventures/leviathans-wake/adventure-14-roarcurrent-gorge.json](data/adventures/leviathans-wake/adventure-14-roarcurrent-gorge.json)
- [data/adventures/leviathans-wake/adventure-15-abysslung-expanse.json](data/adventures/leviathans-wake/adventure-15-abysslung-expanse.json)
- [data/adventures/leviathans-wake/adventure-16-marrowlight-ossuary.json](data/adventures/leviathans-wake/adventure-16-marrowlight-ossuary.json)
- [data/adventures/leviathans-wake/adventure-17-titanwake-delta.json](data/adventures/leviathans-wake/adventure-17-titanwake-delta.json)
- [data/adventures/leviathans-wake/adventure-18-pressure-bloom-shelf.json](data/adventures/leviathans-wake/adventure-18-pressure-bloom-shelf.json)
- [data/adventures/leviathans-wake/adventure-19-shipgrave-maze.json](data/adventures/leviathans-wake/adventure-19-shipgrave-maze.json)
- [data/adventures/leviathans-wake/adventure-20-scarfin-torrent.json](data/adventures/leviathans-wake/adventure-20-scarfin-torrent.json)
- [data/adventures/leviathans-wake/adventure-21-colossus-trail.json](data/adventures/leviathans-wake/adventure-21-colossus-trail.json)
- [data/adventures/leviathans-wake/adventure-22-thunderwake-storm.json](data/adventures/leviathans-wake/adventure-22-thunderwake-storm.json)
- [data/adventures/leviathans-wake/adventure-23-the-fallen-fang.json](data/adventures/leviathans-wake/adventure-23-the-fallen-fang.json)
- [data/adventures/leviathans-wake/adventure-24-riven-trench.json](data/adventures/leviathans-wake/adventure-24-riven-trench.json)
- [data/adventures/leviathans-wake/adventure-26-bone-crown-march.json](data/adventures/leviathans-wake/adventure-26-bone-crown-march.json)
- [data/adventures/leviathans-wake/adventure-27-wakeheart-vortex.json](data/adventures/leviathans-wake/adventure-27-wakeheart-vortex.json)
- [data/adventures/leviathans-wake/adventure-28-titan-scar-threshold.json](data/adventures/leviathans-wake/adventure-28-titan-scar-threshold.json)
- [data/adventures/leviathans-wake/adventure-29-the-scale-that-remembers.json](data/adventures/leviathans-wake/adventure-29-the-scale-that-remembers.json)
- [data/adventures/leviathans-wake/adventure-30-grave-of-the-first-wake.json](data/adventures/leviathans-wake/adventure-30-grave-of-the-first-wake.json)
- [data/adventures/leviathans-wake/manifest.json](data/adventures/leviathans-wake/manifest.json)
- [data/adventures/moonlit-reef/adventure-01-bubble-nibbler-hideout.json](data/adventures/moonlit-reef/adventure-01-bubble-nibbler-hideout.json)
- [data/adventures/moonlit-reef/adventure-02-silverfin-sprout-grove.json](data/adventures/moonlit-reef/adventure-02-silverfin-sprout-grove.json)
- [data/adventures/moonlit-reef/adventure-03-tidepool-tumbler-hollows.json](data/adventures/moonlit-reef/adventure-03-tidepool-tumbler-hollows.json)
- [data/adventures/moonlit-reef/adventure-04-moon-jelly-grotto.json](data/adventures/moonlit-reef/adventure-04-moon-jelly-grotto.json)
- [data/adventures/moonlit-reef/adventure-05-coral-button-warrens.json](data/adventures/moonlit-reef/adventure-05-coral-button-warrens.json)
- [data/adventures/moonlit-reef/adventure-06-starshell-skipper-shoals.json](data/adventures/moonlit-reef/adventure-06-starshell-skipper-shoals.json)
- [data/adventures/moonlit-reef/adventure-07-moon-puff-aerie.json](data/adventures/moonlit-reef/adventure-07-moon-puff-aerie.json)
- [data/adventures/moonlit-reef/adventure-08-lunar-current-labyrinth.json](data/adventures/moonlit-reef/adventure-08-lunar-current-labyrinth.json)
- [data/adventures/moonlit-reef/adventure-09-fae-petal-gardens.json](data/adventures/moonlit-reef/adventure-09-fae-petal-gardens.json)
- [data/adventures/moonlit-reef/adventure-10-moonglass-hermitage.json](data/adventures/moonlit-reef/adventure-10-moonglass-hermitage.json)
- [data/adventures/moonlit-reef/adventure-11-silver-shell-bastion.json](data/adventures/moonlit-reef/adventure-11-silver-shell-bastion.json)
- [data/adventures/moonlit-reef/adventure-12-starlight-anemone-observatory.json](data/adventures/moonlit-reef/adventure-12-starlight-anemone-observatory.json)
- [data/adventures/moonlit-reef/adventure-13-reef-rune-playgrounds.json](data/adventures/moonlit-reef/adventure-13-reef-rune-playgrounds.json)
- [data/adventures/moonlit-reef/adventure-14-crescent-claw-citadel.json](data/adventures/moonlit-reef/adventure-14-crescent-claw-citadel.json)
- [data/adventures/moonlit-reef/adventure-15-moonveil-stalker-fen.json](data/adventures/moonlit-reef/adventure-15-moonveil-stalker-fen.json)
- [data/adventures/moonlit-reef/adventure-16-astral-manta-hunting-grounds.json](data/adventures/moonlit-reef/adventure-16-astral-manta-hunting-grounds.json)
- [data/adventures/moonlit-reef/adventure-17-echo-reef-amphitheater.json](data/adventures/moonlit-reef/adventure-17-echo-reef-amphitheater.json)
- [data/adventures/moonlit-reef/adventure-18-star-pearl-reliquary.json](data/adventures/moonlit-reef/adventure-18-star-pearl-reliquary.json)
- [data/adventures/moonlit-reef/adventure-19-moonglass-moray-chasm.json](data/adventures/moonlit-reef/adventure-19-moonglass-moray-chasm.json)
- [data/adventures/moonlit-reef/adventure-20-constellation-crawler-orrery.json](data/adventures/moonlit-reef/adventure-20-constellation-crawler-orrery.json)
- [data/adventures/moonlit-reef/adventure-21-fae-tide-prowler-court.json](data/adventures/moonlit-reef/adventure-21-fae-tide-prowler-court.json)
- [data/adventures/moonlit-reef/adventure-22-moonstone-archon-temple.json](data/adventures/moonlit-reef/adventure-22-moonstone-archon-temple.json)
- [data/adventures/moonlit-reef/adventure-23-astral-reef-shark-expanse.json](data/adventures/moonlit-reef/adventure-23-astral-reef-shark-expanse.json)
- [data/adventures/moonlit-reef/adventure-24-moonkeeper-sentinel-vault.json](data/adventures/moonlit-reef/adventure-24-moonkeeper-sentinel-vault.json)
- [data/adventures/moonlit-reef/adventure-25-celestial-coral-wyrm-spire.json](data/adventures/moonlit-reef/adventure-25-celestial-coral-wyrm-spire.json)
- [data/adventures/moonlit-reef/adventure-26-starfall-razorfin-reach.json](data/adventures/moonlit-reef/adventure-26-starfall-razorfin-reach.json)
- [data/adventures/moonlit-reef/adventure-27-lunar-abyss-manta-deep.json](data/adventures/moonlit-reef/adventure-27-lunar-abyss-manta-deep.json)
- [data/adventures/moonlit-reef/adventure-28-moonlit-prism-serpent-palace.json](data/adventures/moonlit-reef/adventure-28-moonlit-prism-serpent-palace.json)
- [data/adventures/moonlit-reef/adventure-29-moonreef-sovereign-throne.json](data/adventures/moonlit-reef/adventure-29-moonreef-sovereign-throne.json)
- [data/adventures/starfall-trench/adventure-01-lanterns-below-the-falling-sky.json](data/adventures/starfall-trench/adventure-01-lanterns-below-the-falling-sky.json)
- [data/adventures/starfall-trench/adventure-02-craterback-descent.json](data/adventures/starfall-trench/adventure-02-craterback-descent.json)
- [data/adventures/starfall-trench/adventure-03-cometglass-shardbeds.json](data/adventures/starfall-trench/adventure-03-cometglass-shardbeds.json)
- [data/adventures/starfall-trench/adventure-04-the-weightless-ravine.json](data/adventures/starfall-trench/adventure-04-the-weightless-ravine.json)
- [data/adventures/starfall-trench/adventure-05-emberstar-ventfield.json](data/adventures/starfall-trench/adventure-05-emberstar-ventfield.json)
- [data/adventures/starfall-trench/adventure-06-nightshard-fissures.json](data/adventures/starfall-trench/adventure-06-nightshard-fissures.json)
- [data/adventures/starfall-trench/adventure-07-the-wandering-craters.json](data/adventures/starfall-trench/adventure-07-the-wandering-craters.json)
- [data/adventures/starfall-trench/adventure-08-starlit-hunting-dark.json](data/adventures/starfall-trench/adventure-08-starlit-hunting-dark.json)
- [data/adventures/starfall-trench/adventure-09-cosmic-ventworks.json](data/adventures/starfall-trench/adventure-09-cosmic-ventworks.json)
- [data/adventures/starfall-trench/adventure-10-shardwake-channels.json](data/adventures/starfall-trench/adventure-10-shardwake-channels.json)
- [data/adventures/starfall-trench/adventure-11-deep-orbit-spiral.json](data/adventures/starfall-trench/adventure-11-deep-orbit-spiral.json)
- [data/adventures/starfall-trench/adventure-12-ruins-of-the-starstone-golem.json](data/adventures/starfall-trench/adventure-12-ruins-of-the-starstone-golem.json)
- [data/adventures/starfall-trench/adventure-13-voidcurrent-crossing.json](data/adventures/starfall-trench/adventure-13-voidcurrent-crossing.json)
- [data/adventures/starfall-trench/adventure-14-crystalfang-galleries.json](data/adventures/starfall-trench/adventure-14-crystalfang-galleries.json)
- [data/adventures/starfall-trench/adventure-15-falling-light-drift.json](data/adventures/starfall-trench/adventure-15-falling-light-drift.json)
- [data/adventures/starfall-trench/adventure-16-astral-silt-labyrinth.json](data/adventures/starfall-trench/adventure-16-astral-silt-labyrinth.json)
- [data/adventures/starfall-trench/adventure-17-meteor-marked-shelf.json](data/adventures/starfall-trench/adventure-17-meteor-marked-shelf.json)
- [data/adventures/starfall-trench/adventure-18-aurora-under-the-trench.json](data/adventures/starfall-trench/adventure-18-aurora-under-the-trench.json)
- [data/adventures/starfall-trench/adventure-19-the-broken-orbit-ruins.json](data/adventures/starfall-trench/adventure-19-the-broken-orbit-ruins.json)
- [data/adventures/starfall-trench/adventure-20-star-eater-grooves.json](data/adventures/starfall-trench/adventure-20-star-eater-grooves.json)
- [data/adventures/starfall-trench/adventure-21-nebula-ink-reaches.json](data/adventures/starfall-trench/adventure-21-nebula-ink-reaches.json)
- [data/adventures/starfall-trench/adventure-22-comet-tail-run.json](data/adventures/starfall-trench/adventure-22-comet-tail-run.json)
- [data/adventures/starfall-trench/adventure-23-gravitic-deadfall.json](data/adventures/starfall-trench/adventure-23-gravitic-deadfall.json)
- [data/adventures/starfall-trench/adventure-24-celestial-ruin-march.json](data/adventures/starfall-trench/adventure-24-celestial-ruin-march.json)
- [data/adventures/starfall-trench/adventure-25-darkstar-bloomfield.json](data/adventures/starfall-trench/adventure-25-darkstar-bloomfield.json)
- [data/adventures/starfall-trench/adventure-26-meteorbone-gravepath.json](data/adventures/starfall-trench/adventure-26-meteorbone-gravepath.json)
- [data/adventures/starfall-trench/adventure-27-riftlight-fault.json](data/adventures/starfall-trench/adventure-27-riftlight-fault.json)
- [data/adventures/starfall-trench/adventure-28-trenchstar-depths.json](data/adventures/starfall-trench/adventure-28-trenchstar-depths.json)
- [data/adventures/starfall-trench/adventure-29-the-buried-celestial-engine.json](data/adventures/starfall-trench/adventure-29-the-buried-celestial-engine.json)
- [data/adventures/starfall-trench/manifest.json](data/adventures/starfall-trench/manifest.json)
- [data/adventures/sunken-kings-throne/adventure-01-the-fallen-banner-way.json](data/adventures/sunken-kings-throne/adventure-01-the-fallen-banner-way.json)
- [data/adventures/sunken-kings-throne/adventure-02-crowncoin-vaults.json](data/adventures/sunken-kings-throne/adventure-02-crowncoin-vaults.json)
- [data/adventures/sunken-kings-throne/adventure-03-palace-aqueducts.json](data/adventures/sunken-kings-throne/adventure-03-palace-aqueducts.json)
- [data/adventures/sunken-kings-throne/adventure-04-sealbound-galleries.json](data/adventures/sunken-kings-throne/adventure-04-sealbound-galleries.json)
- [data/adventures/sunken-kings-throne/adventure-05-the-mourning-promenade.json](data/adventures/sunken-kings-throne/adventure-05-the-mourning-promenade.json)
- [data/adventures/sunken-kings-throne/adventure-06-scepter-gardens.json](data/adventures/sunken-kings-throne/adventure-06-scepter-gardens.json)
- [data/adventures/sunken-kings-throne/adventure-07-crownless-barracks.json](data/adventures/sunken-kings-throne/adventure-07-crownless-barracks.json)
- [data/adventures/sunken-kings-throne/adventure-08-the-drowned-archive.json](data/adventures/sunken-kings-throne/adventure-08-the-drowned-archive.json)
- [data/adventures/sunken-kings-throne/adventure-09-thronewater-conduits.json](data/adventures/sunken-kings-throne/adventure-09-thronewater-conduits.json)
- [data/adventures/sunken-kings-throne/adventure-10-gilded-processional.json](data/adventures/sunken-kings-throne/adventure-10-gilded-processional.json)
- [data/adventures/sunken-kings-throne/adventure-11-sepulcher-cloisters.json](data/adventures/sunken-kings-throne/adventure-11-sepulcher-cloisters.json)
- [data/adventures/sunken-kings-throne/adventure-12-the-walking-statuary.json](data/adventures/sunken-kings-throne/adventure-12-the-walking-statuary.json)
- [data/adventures/sunken-kings-throne/adventure-13-dynasty-coral-halls.json](data/adventures/sunken-kings-throne/adventure-13-dynasty-coral-halls.json)
- [data/adventures/sunken-kings-throne/adventure-14-chalice-chapel.json](data/adventures/sunken-kings-throne/adventure-14-chalice-chapel.json)
- [data/adventures/sunken-kings-throne/adventure-15-taxkeeper-offices.json](data/adventures/sunken-kings-throne/adventure-15-taxkeeper-offices.json)
- [data/adventures/sunken-kings-throne/adventure-16-regal-fang-canal.json](data/adventures/sunken-kings-throne/adventure-16-regal-fang-canal.json)
- [data/adventures/sunken-kings-throne/adventure-17-the-silent-heraldry.json](data/adventures/sunken-kings-throne/adventure-17-the-silent-heraldry.json)
- [data/adventures/sunken-kings-throne/adventure-18-sealbreaker-vault.json](data/adventures/sunken-kings-throne/adventure-18-sealbreaker-vault.json)
- [data/adventures/sunken-kings-throne/adventure-19-drowned-lists.json](data/adventures/sunken-kings-throne/adventure-19-drowned-lists.json)
- [data/adventures/sunken-kings-throne/adventure-20-crownshadow-arcade.json](data/adventures/sunken-kings-throne/adventure-20-crownshadow-arcade.json)
- [data/adventures/sunken-kings-throne/adventure-21-the-ruined-menagerie.json](data/adventures/sunken-kings-throne/adventure-21-the-ruined-menagerie.json)
- [data/adventures/sunken-kings-throne/adventure-22-pearl-throne-approach.json](data/adventures/sunken-kings-throne/adventure-22-pearl-throne-approach.json)
- [data/adventures/sunken-kings-throne/adventure-23-the-usurpers-passage.json](data/adventures/sunken-kings-throne/adventure-23-the-usurpers-passage.json)
- [data/adventures/sunken-kings-throne/adventure-24-oathchain-dungeons.json](data/adventures/sunken-kings-throne/adventure-24-oathchain-dungeons.json)
- [data/adventures/sunken-kings-throne/adventure-25-the-forgotten-princes-wing.json](data/adventures/sunken-kings-throne/adventure-25-the-forgotten-princes-wing.json)
- [data/adventures/sunken-kings-throne/adventure-26-the-queens-tear.json](data/adventures/sunken-kings-throne/adventure-26-the-queens-tear.json)
- [data/adventures/sunken-kings-throne/adventure-27-the-seven-royal-seals.json](data/adventures/sunken-kings-throne/adventure-27-the-seven-royal-seals.json)
- [data/adventures/sunken-kings-throne/adventure-28-the-council-in-silence.json](data/adventures/sunken-kings-throne/adventure-28-the-council-in-silence.json)
- [data/adventures/sunken-kings-throne/adventure-29-thronebound-causeway.json](data/adventures/sunken-kings-throne/adventure-29-thronebound-causeway.json)
- [data/adventures/sunken-kings-throne/adventure-30-the-kings-festival.json](data/adventures/sunken-kings-throne/adventure-30-the-kings-festival.json)
- [data/adventures/sunken-kings-throne/manifest.json](data/adventures/sunken-kings-throne/manifest.json)
- [data/adventures/whispering-kelp-forest/adventure-01-murmurleaf-paths.json](data/adventures/whispering-kelp-forest/adventure-01-murmurleaf-paths.json)
- [data/adventures/whispering-kelp-forest/adventure-02-lanternvine-tangle.json](data/adventures/whispering-kelp-forest/adventure-02-lanternvine-tangle.json)
- [data/adventures/whispering-kelp-forest/adventure-03-whispercap-hollows.json](data/adventures/whispering-kelp-forest/adventure-03-whispercap-hollows.json)
- [data/adventures/whispering-kelp-forest/adventure-04-veilpetal-glade.json](data/adventures/whispering-kelp-forest/adventure-04-veilpetal-glade.json)
- [data/adventures/whispering-kelp-forest/adventure-05-rootcoil-channels.json](data/adventures/whispering-kelp-forest/adventure-05-rootcoil-channels.json)
- [data/adventures/whispering-kelp-forest/adventure-06-dewbell-canopy.json](data/adventures/whispering-kelp-forest/adventure-06-dewbell-canopy.json)
- [data/adventures/whispering-kelp-forest/adventure-07-briarfin-thickets.json](data/adventures/whispering-kelp-forest/adventure-07-briarfin-thickets.json)
- [data/adventures/whispering-kelp-forest/adventure-08-hushwater-trails.json](data/adventures/whispering-kelp-forest/adventure-08-hushwater-trails.json)
- [data/adventures/whispering-kelp-forest/adventure-09-fae-lure-lanterns.json](data/adventures/whispering-kelp-forest/adventure-09-fae-lure-lanterns.json)
- [data/adventures/whispering-kelp-forest/adventure-10-mosscloak-maze.json](data/adventures/whispering-kelp-forest/adventure-10-mosscloak-maze.json)
- [data/adventures/whispering-kelp-forest/adventure-11-the-singing-vines.json](data/adventures/whispering-kelp-forest/adventure-11-the-singing-vines.json)
- [data/adventures/whispering-kelp-forest/adventure-12-moonblossom-garden.json](data/adventures/whispering-kelp-forest/adventure-12-moonblossom-garden.json)
- [data/adventures/whispering-kelp-forest/adventure-13-gossipcurrent-forks.json](data/adventures/whispering-kelp-forest/adventure-13-gossipcurrent-forks.json)
- [data/adventures/whispering-kelp-forest/adventure-14-the-vanishing-grove.json](data/adventures/whispering-kelp-forest/adventure-14-the-vanishing-grove.json)
- [data/adventures/whispering-kelp-forest/adventure-15-shrinebark-pilgrimage.json](data/adventures/whispering-kelp-forest/adventure-15-shrinebark-pilgrimage.json)
- [data/adventures/whispering-kelp-forest/adventure-16-starflower-hunting-beds.json](data/adventures/whispering-kelp-forest/adventure-16-starflower-hunting-beds.json)
- [data/adventures/whispering-kelp-forest/adventure-17-dreamsap-pools.json](data/adventures/whispering-kelp-forest/adventure-17-dreamsap-pools.json)
- [data/adventures/whispering-kelp-forest/adventure-18-kelpweave-galleries.json](data/adventures/whispering-kelp-forest/adventure-18-kelpweave-galleries.json)
- [data/adventures/whispering-kelp-forest/adventure-19-willowcurrent-bend.json](data/adventures/whispering-kelp-forest/adventure-19-willowcurrent-bend.json)
- [data/adventures/whispering-kelp-forest/adventure-20-bramblejaw-understory.json](data/adventures/whispering-kelp-forest/adventure-20-bramblejaw-understory.json)
- [data/adventures/whispering-kelp-forest/adventure-21-echo-bark-trunks.json](data/adventures/whispering-kelp-forest/adventure-21-echo-bark-trunks.json)
- [data/adventures/whispering-kelp-forest/adventure-22-moonmoth-drift.json](data/adventures/whispering-kelp-forest/adventure-22-moonmoth-drift.json)
- [data/adventures/whispering-kelp-forest/adventure-23-rootbound-shrine.json](data/adventures/whispering-kelp-forest/adventure-23-rootbound-shrine.json)
- [data/adventures/whispering-kelp-forest/adventure-24-sighing-reed-marsh.json](data/adventures/whispering-kelp-forest/adventure-24-sighing-reed-marsh.json)
- [data/adventures/whispering-kelp-forest/adventure-25-glimmerpod-nursery.json](data/adventures/whispering-kelp-forest/adventure-25-glimmerpod-nursery.json)
- [data/adventures/whispering-kelp-forest/adventure-26-the-borrowed-grove.json](data/adventures/whispering-kelp-forest/adventure-26-the-borrowed-grove.json)
- [data/adventures/whispering-kelp-forest/adventure-27-thornsong-vale.json](data/adventures/whispering-kelp-forest/adventure-27-thornsong-vale.json)
- [data/adventures/whispering-kelp-forest/adventure-28-whisperroot-deeps.json](data/adventures/whispering-kelp-forest/adventure-28-whisperroot-deeps.json)
- [data/adventures/whispering-kelp-forest/adventure-29-the-forest-remembers.json](data/adventures/whispering-kelp-forest/adventure-29-the-forest-remembers.json)
- [data/adventures/whispering-kelp-forest/adventure-30-the-verdant-pursuit-station.json](data/adventures/whispering-kelp-forest/adventure-30-the-verdant-pursuit-station.json)
- [data/adventures/whispering-kelp-forest/manifest.json](data/adventures/whispering-kelp-forest/manifest.json)
- [data/enemies/astral-nexus/dream-anchor-turtle.json](data/enemies/astral-nexus/dream-anchor-turtle.json)
- [data/enemies/astral-nexus/echo-of-self-mimic.json](data/enemies/astral-nexus/echo-of-self-mimic.json)
- [data/enemies/astral-nexus/first-light-remnant.json](data/enemies/astral-nexus/first-light-remnant.json)
- [data/enemies/astral-nexus/portal-skipping-ray.json](data/enemies/astral-nexus/portal-skipping-ray.json)
- [data/enemies/bosses/astral-nexus/archive-reef-sovereign-boss.json](data/enemies/bosses/astral-nexus/archive-reef-sovereign-boss.json)
- [data/enemies/bosses/astral-nexus/between-state-clawlord-boss.json](data/enemies/bosses/astral-nexus/between-state-clawlord-boss.json)
- [data/enemies/bosses/astral-nexus/dead-gate-collector-boss.json](data/enemies/bosses/astral-nexus/dead-gate-collector-boss.json)
- [data/enemies/bosses/astral-nexus/euclidean-coilbreaker-boss.json](data/enemies/bosses/astral-nexus/euclidean-coilbreaker-boss.json)
- [data/enemies/bosses/astral-nexus/fear-made-huntress-boss.json](data/enemies/bosses/astral-nexus/fear-made-huntress-boss.json)
- [data/enemies/bosses/astral-nexus/gate-root-serpent-boss.json](data/enemies/bosses/astral-nexus/gate-root-serpent-boss.json)
- [data/enemies/bosses/astral-nexus/infinite-chamber-nautilus-boss.json](data/enemies/bosses/astral-nexus/infinite-chamber-nautilus-boss.json)
- [data/enemies/bosses/astral-nexus/nothing-bloom-mantis-boss.json](data/enemies/bosses/astral-nexus/nothing-bloom-mantis-boss.json)
- [data/enemies/bosses/astral-nexus/reality-bite-apex-boss.json](data/enemies/bosses/astral-nexus/reality-bite-apex-boss.json)
- [data/enemies/bosses/astral-nexus/under-sun-angler-boss.json](data/enemies/bosses/astral-nexus/under-sun-angler-boss.json)
- [data/enemies/bosses/leviathans-wake/bone-lantern-angler-boss.json](data/enemies/bosses/leviathans-wake/bone-lantern-angler-boss.json)
- [data/enemies/bosses/leviathans-wake/breaker-fin-alpha-boss.json](data/enemies/bosses/leviathans-wake/breaker-fin-alpha-boss.json)
- [data/enemies/bosses/leviathans-wake/fleet-eater-scuttler-boss.json](data/enemies/bosses/leviathans-wake/fleet-eater-scuttler-boss.json)
- [data/enemies/bosses/leviathans-wake/marrow-crown-urchin-boss.json](data/enemies/bosses/leviathans-wake/marrow-crown-urchin-boss.json)
- [data/enemies/bosses/leviathans-wake/quake-crown-barnacle-boss.json](data/enemies/bosses/leviathans-wake/quake-crown-barnacle-boss.json)
- [data/enemies/bosses/leviathans-wake/scale-forged-colossus-boss.json](data/enemies/bosses/leviathans-wake/scale-forged-colossus-boss.json)
- [data/enemies/bosses/leviathans-wake/scar-marked-huntmaster-boss.json](data/enemies/bosses/leviathans-wake/scar-marked-huntmaster-boss.json)
- [data/enemies/bosses/leviathans-wake/storm-ink-architeuthis-boss.json](data/enemies/bosses/leviathans-wake/storm-ink-architeuthis-boss.json)
- [data/enemies/bosses/leviathans-wake/tempest-voice-siren-boss.json](data/enemies/bosses/leviathans-wake/tempest-voice-siren-boss.json)
- [data/enemies/bosses/leviathans-wake/titan-scale-hermit-boss.json](data/enemies/bosses/leviathans-wake/titan-scale-hermit-boss.json)
- [data/enemies/bosses/moonlit-reef/echo-crowned-siren-boss.json](data/enemies/bosses/moonlit-reef/echo-crowned-siren-boss.json)
- [data/enemies/bosses/moonlit-reef/reef-rune-trickster-boss.json](data/enemies/bosses/moonlit-reef/reef-rune-trickster-boss.json)
- [data/enemies/bosses/starfall-trench/cinder-crown-urchin-boss.json](data/enemies/bosses/starfall-trench/cinder-crown-urchin-boss.json)
- [data/enemies/bosses/starfall-trench/crater-throne-hermit-boss.json](data/enemies/bosses/starfall-trench/crater-throne-hermit-boss.json)
- [data/enemies/bosses/starfall-trench/diamond-maw-snapper-boss.json](data/enemies/bosses/starfall-trench/diamond-maw-snapper-boss.json)
- [data/enemies/bosses/starfall-trench/eclipse-jaw-moray-boss.json](data/enemies/bosses/starfall-trench/eclipse-jaw-moray-boss.json)
- [data/enemies/bosses/starfall-trench/fault-crowned-serpent-boss.json](data/enemies/bosses/starfall-trench/fault-crowned-serpent-boss.json)
- [data/enemies/bosses/starfall-trench/meteor-lure-angler-boss.json](data/enemies/bosses/starfall-trench/meteor-lure-angler-boss.json)
- [data/enemies/bosses/starfall-trench/nova-fang-viperfish-boss.json](data/enemies/bosses/starfall-trench/nova-fang-viperfish-boss.json)
- [data/enemies/bosses/starfall-trench/polar-flare-wisp-boss.json](data/enemies/bosses/starfall-trench/polar-flare-wisp-boss.json)
- [data/enemies/bosses/starfall-trench/star-skull-prowler-boss.json](data/enemies/bosses/starfall-trench/star-skull-prowler-boss.json)
- [data/enemies/bosses/sunken-kings-throne/covenant-engine-boss.json](data/enemies/bosses/sunken-kings-throne/covenant-engine-boss.json)
- [data/enemies/bosses/sunken-kings-throne/crown-fang-moray-boss.json](data/enemies/bosses/sunken-kings-throne/crown-fang-moray-boss.json)
- [data/enemies/bosses/sunken-kings-throne/exchequer-krakenet-boss.json](data/enemies/bosses/sunken-kings-throne/exchequer-krakenet-boss.json)
- [data/enemies/bosses/sunken-kings-throne/funeral-wing-manta-boss.json](data/enemies/bosses/sunken-kings-throne/funeral-wing-manta-boss.json)
- [data/enemies/bosses/sunken-kings-throne/last-dance-courtesan-boss.json](data/enemies/bosses/sunken-kings-throne/last-dance-courtesan-boss.json)
- [data/enemies/bosses/sunken-kings-throne/mother-of-pearl-warden-boss.json](data/enemies/bosses/sunken-kings-throne/mother-of-pearl-warden-boss.json)
- [data/enemies/bosses/sunken-kings-throne/oath-sealed-knight-boss.json](data/enemies/bosses/sunken-kings-throne/oath-sealed-knight-boss.json)
- [data/enemies/bosses/sunken-kings-throne/sorrow-tide-queen-boss.json](data/enemies/bosses/sunken-kings-throne/sorrow-tide-queen-boss.json)
- [data/enemies/bosses/sunken-kings-throne/standard-bearer-revenant-boss.json](data/enemies/bosses/sunken-kings-throne/standard-bearer-revenant-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/briar-chorus-siren-boss.json](data/enemies/bosses/whispering-kelp-forest/briar-chorus-siren-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/chorus-fin-schoolmother-boss.json](data/enemies/bosses/whispering-kelp-forest/chorus-fin-schoolmother-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/crown-antler-stagfish-boss.json](data/enemies/bosses/whispering-kelp-forest/crown-antler-stagfish-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/first-root-guardian-boss.json](data/enemies/bosses/whispering-kelp-forest/first-root-guardian-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/forest-heart-colossus-boss.json](data/enemies/bosses/whispering-kelp-forest/forest-heart-colossus-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/many-faced-grove-mimic-boss.json](data/enemies/bosses/whispering-kelp-forest/many-faced-grove-mimic-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/oracle-shell-snail-boss.json](data/enemies/bosses/whispering-kelp-forest/oracle-shell-snail-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/pale-wing-moonmoth-boss.json](data/enemies/bosses/whispering-kelp-forest/pale-wing-moonmoth-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/reed-crowned-hunter-boss.json](data/enemies/bosses/whispering-kelp-forest/reed-crowned-hunter-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/rumor-tide-sprite-boss.json](data/enemies/bosses/whispering-kelp-forest/rumor-tide-sprite-boss.json)
- [data/enemies/bosses/whispering-kelp-forest/thicket-shell-ancient-boss.json](data/enemies/bosses/whispering-kelp-forest/thicket-shell-ancient-boss.json)
- [data/enemies/leviathans-wake/bone-crown-behemoth.json](data/enemies/leviathans-wake/bone-crown-behemoth.json)
- [data/enemies/leviathans-wake/deep-scar-prowler.json](data/enemies/leviathans-wake/deep-scar-prowler.json)
- [data/enemies/leviathans-wake/scale-shelter-hermit.json](data/enemies/leviathans-wake/scale-shelter-hermit.json)
- [data/enemies/leviathans-wake/titan-scar-guardian.json](data/enemies/leviathans-wake/titan-scar-guardian.json)
- [data/enemies/leviathans-wake/trench-rending-worm.json](data/enemies/leviathans-wake/trench-rending-worm.json)
- [data/enemies/leviathans-wake/wake-riding-razorfish.json](data/enemies/leviathans-wake/wake-riding-razorfish.json)
- [data/enemies/starfall-trench/broken-orbit-sentinel.json](data/enemies/starfall-trench/broken-orbit-sentinel.json)
- [data/enemies/starfall-trench/comet-tail-barracuda.json](data/enemies/starfall-trench/comet-tail-barracuda.json)
- [data/enemies/starfall-trench/deep-orbit-nautilus.json](data/enemies/starfall-trench/deep-orbit-nautilus.json)
- [data/enemies/starfall-trench/falling-light-medusa.json](data/enemies/starfall-trench/falling-light-medusa.json)
- [data/enemies/starfall-trench/gravity-skipping-ray.json](data/enemies/starfall-trench/gravity-skipping-ray.json)
- [data/enemies/starfall-trench/meteor-marked-lobster.json](data/enemies/starfall-trench/meteor-marked-lobster.json)
- [data/enemies/starfall-trench/star-eater-slug.json](data/enemies/starfall-trench/star-eater-slug.json)
- [data/enemies/sunken-kings-throne/pearl-throne-sentinel.json](data/enemies/sunken-kings-throne/pearl-throne-sentinel.json)
- [data/enemies/sunken-kings-throne/royal-menagerie-beast.json](data/enemies/sunken-kings-throne/royal-menagerie-beast.json)
- [data/enemies/whispering-kelp-forest/echo-bark-woodfish.json](data/enemies/whispering-kelp-forest/echo-bark-woodfish.json)
- [data/enemies/whispering-kelp-forest/fae-lure-angler.json](data/enemies/whispering-kelp-forest/fae-lure-angler.json)
- [data/enemies/whispering-kelp-forest/memory-kelp-oracle.json](data/enemies/whispering-kelp-forest/memory-kelp-oracle.json)
- [data/explore/astral-nexus.json](data/explore/astral-nexus.json)
- [data/explore/leviathans-wake.json](data/explore/leviathans-wake.json)
- [data/explore/starfall-trench.json](data/explore/starfall-trench.json)
- [data/explore/sunken-kings-throne.json](data/explore/sunken-kings-throne.json)
- [data/explore/whispering-kelp-forest.json](data/explore/whispering-kelp-forest.json)
- [data/notes/astral-nexus.json](data/notes/astral-nexus.json)
- [data/notes/leviathans-wake.json](data/notes/leviathans-wake.json)
- [data/notes/starfall-trench.json](data/notes/starfall-trench.json)
- [data/notes/sunken-kings-throne.json](data/notes/sunken-kings-throne.json)
- [data/spells/elf-blessing.json](data/spells/elf-blessing.json)
- [data/spells/leviathans-wake.json](data/spells/leviathans-wake.json)
- [worker.js](worker.js)

## Files created

- tools/format-narrative.cjs — field-scoped, baseline-pinned offline formatting recipe; preview by default, writes only with --write and refuses unrelated local edits.
- scripts/validate-narrative-formatting.cjs — offline preservation/parity validation; --report regenerates this report.
- NARRATIVE_FORMATTING_REPORT.md — this report and complete file/candidate inventory.
