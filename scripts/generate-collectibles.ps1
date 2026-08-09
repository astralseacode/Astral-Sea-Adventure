$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
function Write-Json($path,$value){$json=$value|ConvertTo-Json -Depth 12;[IO.File]::WriteAllText($path,$json+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))}

$notes=@{
'starfall-trench'=@(
'The Falling Calendar|Trench keepers once dated years by the color of falling fragments; blue-white showers marked safe navigation seasons.',
'Stone That Remembers Heat|Fresh starstone remains warm for decades, and its inner light brightens when returned near its original crater.',
'A Bent Plumb Line|A surveyor recorded that every weight leaned east here, although east changed whenever the largest fragment pulsed.',
'Crystalline Nursery|Tiny glass-finned fish shelter inside meteor cracks because larger predators cannot tolerate the harmonic ringing.',
'Do Not Lick the Comet|A handwritten addition reads: "It tastes like cold lightning. This warning exists because I made a scientific mistake. --Shizuki"',
'Annex Transit Mark|A faded cargo seal matches Moonlit Lab workmanship but bears a trench designation and a much later revision number.',
'The Quiet Impact|One crater contains no debris, only a perfect absence where sound and current vanish at its rim.',
'Ventkeeper Record|Old divers harvested cosmic vent glass with copper tools; iron implements became too heavy to lift near the plume.',
'Borrowed Constellations|Celestial fragments on the seabed form patterns absent from the sky, suggesting they fell from somewhere else.',
'Helpful Arrow Number Seven|Shizuki drew seven arrows toward seven different tunnels and labeled all of them "probably the shortcut."',
'Deep-Orbit Shell|A nautilus shell records a spiral matching the orbit of a star no modern chart recognizes.',
'Ruin Without a Sky|The oldest celestial arch was built before the surrounding impact, yet its carvings depict the fragment arriving.',
'Meteorwake Song|When several shards resonate together, their notes reproduce a navigation hymn used by vanished trench settlements.',
'Gravity-Sick Journal|An explorer learned to sleep tied to the floor after waking on the ceiling three mornings in succession.',
'Emergency Mustache Protocol|A facility notice has been amended: "Facial disguise ineffective against security constructs. Still stylish. --S"',
'Buried Observation Lens|A cracked lens magnifies not distance but age, showing nearby ruins as they looked roughly a century ago.',
'The Star-Eater Trail|Smooth grooves end at empty sockets where luminous fragments once rested, each surrounded by silver residue.',
'Unsent Cargo Complaint|An annex quartermaster objected to receiving sealed specimen crates without origin papers or living-content warnings.',
'Aurora Below|Trench auroras rise from the seabed rather than descending from above and briefly reverse weak currents.',
'An Older Insignia|A corroded badge bears the organization mark beneath another emblem that someone deliberately filed away.',
'Cometglass Etiquette|Local tradition held that taking the first shard from a new crater invited every falling stone to notice you.',
'The Weightless Camp|Bedrolls remain tied around a floating stone where travelers once waited for gravity to remember its direction.',
'Security Revision Forty-Two|The annex repeatedly upgraded its pursuit protocols long after Moonlit Lab should have ceased operating.',
'Starwalker Footprints|A trail of fused footprints crosses molten-looking stone without approaching or leaving the site.',
'Return Visit|Shizuki wrote over a warning placard: "I came back voluntarily, moved your furniture, and left voluntarily. Important distinction."',
'The Trench Map|A celestial map marks other facilities as dim points beyond the reef, but water damage erased their names.',
'Corekeeper Memorandum|A maintenance order describes an artificial body expected to remain functional beyond the lifespan of its makers.',
'The Missing Shipment|Records mention "Subject Seven transfer materials," although the destination field has been cut from the page.',
'Annex Night Watch|A guard log ends with reports of laughter in sealed ducts and every Officer portrait acquiring a paper mustache.',
'Not an Isolated Laboratory|The final surviving ledger confirms the Starfall Annex and Moonlit Lab reported to the same unseen authority.'
);
'whispering-kelp-forest'=@(
'The Forest Repeats|Whispering currents retain short phrases for years, but the roots change their meaning by altering the pauses.',
'Lanternvine Courtesy|Fae lights dim when approached directly and brighten when travelers politely pretend not to notice them.',
'Rootway Agreement|Ancient residents marked safe paths by braiding three living vines without cutting any stem.',
'Pollen Moon|Silver spores rise once each cycle and cause nearby flowers to imitate whatever constellation hangs overhead.',
'Please Stop Teaching the Vines|Shizuki wrote: "They learned to open buckles. I accept some responsibility and none of the blame."',
'Search Team Marker|A metal tag beneath the moss identifies a pursuit unit assigned to recover escaped experimental subjects.',
'The Listening Grove|Travelers avoided speaking names here because the forest whispered them back in unfamiliar voices.',
'Dreamsap Warning|Fresh dreamsap closes wounds, while old dreamsap preserves the last nightmare of anything that touched it.',
'Shrine Beneath the Roots|A Fae altar predates the surrounding forest; the oldest roots curve around it without crossing its shadow.',
'An Excellent Hiding Place|Shizuki annotated a search map: "They checked this grove six times. I was in the map cabinet."',
'Moonmoth Migration|Moonmoths navigate by reflected starlight even where the canopy has hidden the surface for centuries.',
'Briar Treaty|A carved tablet grants one grove the right to defend itself against axes, fire, and rude singing.',
'The Borrowed Voice|One vine repeats a researcher''s command phrase, but records identify that researcher as dead for eighty years.',
'Greenwater Apothecary|Forest healers collected remedies only from plants that voluntarily released a leaf when thanked.',
'Definitely a Normal Bush|A doodled sign reads: "No escaped elf behind this shrub. Please direct search teams elsewhere. --Not Shizuki"',
'Pursuit Ledger Fragment|The teams tracked unusual Fae signatures from Moonlit Reef into the forest, then lost the trail among thousands of false echoes.',
'Memory in the Bark|A cut root grew rings around a metal restraint and eventually crushed it into harmless flakes.',
'Whispercap Consensus|A colony of whispercaps repeats warnings by majority vote, making urgent messages take several hours.',
'Grovekeeper''s Law|Visitors may harvest fallen pods, but taking a living bloom without permission forfeits the thief''s sense of direction.',
'Searchlight Spores|Shizuki''s note says: "Their detection spores make you glow. Rolling in blue pollen makes you glow differently. Problem solved."',
'The Unseen Shrine|A shrine becomes visible only in reflections and disappears whenever anyone attempts to measure it.',
'Rootbound Effigy|The effigy contains no bones or machinery, only compacted letters from travelers who asked the forest for guidance.',
'Team Twelve''s Last Report|A pursuit captain reported that the target could not be distinguished from the forest''s own Fae magic.',
'The Moving Boundary|Survey stones migrate several paces each night while the trees insist, through whispers, that they have not moved.',
'Returned Access Card|Shizuki returned an old card decades later with flowers painted over the authorization stripe.',
'Glimmerpod Nursery|Glimmerpods open around patient visitors and snap shut near active facility weapons.',
'The Search Continued|Successor records show the organization renewed its escaped-subject search under new personnel and inherited ranks.',
'Forest Countermeasure|Roots learned to mimic pursuit signals, sending search constructs in circles until their power failed.',
'No Recapture Record|Every surviving ledger lists Subject Seven as outstanding; none records a successful recovery.',
'The Forest Keeps Secrets|The final root archive closes around names connected to the rebellion, preserving them without revealing their fate.'
);
'leviathans-wake'=@(
'Rib Older Than Maps|The smallest exposed rib is longer than a palace corridor and predates every chart of the Wake.',
'Pressure Language|Deep shelters mark danger with dents rather than ink because written signs fracture under the pressure.',
'The Feeding Scar|A smooth trench across the seabed records where a leviathan once dragged its jaw through solid stone.',
'Scale-Shelter Rule|Wreck crews survived storms by anchoring beneath shed scales, never beneath bones that might still move.',
'Do Not Knock|Shizuki wrote on a colossal tooth: "Something knocked back. We are leaving this mystery unsolved."',
'Specimen Harness|A broken restraint is sized for a creature larger than any vessel and bears the organization''s later insignia.',
'Wakewatch Log|Observers measured current changes days before a leviathan passed, allowing settlements to evacuate without seeing it.',
'Marrowlight Ecology|Small luminous creatures nest in hollow bones and defend them as though the skeleton were alive.',
'The Crushed Fleet|Seven ships lie compressed into one another, all pointing away from the same unseen source.',
'Research Annotation|Shizuki added: "Calling it a controllable asset did not make it controllable. The wall demonstrates this."',
'Pressure Bell|A bronze bell rings only when the surrounding water reaches a depth dangerous to unprotected divers.',
'Migration Without Bodies|Currents follow ancient routes even though the leviathans that carved them have vanished.',
'Titan Scale Census|Each recovered scale carries a different celestial pattern, suggesting the Wake held several distinct species.',
'Weaponization Proposal|A damaged proposal recommends directing leviathan movement toward rebellious settlements and rival facilities.',
'Emergency Exit, Enlarged|Shizuki''s handwriting reads: "I improved the exit after the test subject improved the wall."',
'The Listening Bone|One vertebra amplifies distant songs from far beyond the mapped Wake.',
'Hullsplitter Report|Salvagers blamed a predator until tooth marks proved the wreck had been bitten after it sank.',
'Sedated Thunder|A research log describes a heartbeat heard through three sealed pressure doors.',
'Wakeheart Current|The central current accelerates in a rhythm too regular to be explained by tides.',
'Tiny Warning Sign|Shizuki attached a miniature sign to an enormous claw: "Danger: very large personal space."',
'Program Designation|The Behemoth Program inherited staff titles and equipment from several older annex operations.',
'Failed Command Tone|Constructs broadcast a control signal that nearby creatures learned to imitate back at them.',
'Ancient Tooth Record|Growth bands within the tooth contain traces of regions that no longer exist.',
'The Weapon Refused|A final trial report admits the altered creature ignored its target and destroyed the observation platform instead.',
'Later Correction|Shizuki wrote: "It was never their weapon. It was an animal in pain. Write that part larger."',
'Gravewing Route|Mantas still avoid the corridor once used to transport restrained leviathan specimens.',
'Artificial Scale|One scale is built from layered metal and living coral, with attachment points facing inward.',
'Program Survivors|Personnel records continue across generations, stasis cycles, and replacement bodies without clarifying which method was used.',
'The Empty Holding Sea|The largest enclosure stands open, its restraints broken outward and its inhabitant unrecorded.',
'A Continuing Wake|The final program ledger sends results onward to a central project rather than recording the work as complete.'
);
'sunken-kings-throne'=@(
'Law of the First Fountain|Citizens could petition the crown by placing a silver shell in the eastern palace fountain.',
'Banner Order|Royal banners displayed civic duties by knot pattern, allowing decrees to be read through dark water.',
'The Empty Coronation|A court record describes a crown placed on an empty throne while every noble swore loyalty anyway.',
'Sealkeeper''s Oath|Breaking a royal seal required three witnesses, a tide-priest, and a written apology to the door.',
'Portrait Improvement|Shizuki wrote: "The king looked too serious, so I supplied the traditional mustache. Tradition began today."',
'Foreign Compact|An embassy ledger records the arrival of researchers offering preservation methods in exchange for royal protection.',
'Drowned Market Law|Merchants were forbidden to sell memories, shadows, or weather captured outside the kingdom.',
'The Queen''s Measure|Public fountains were calibrated against the queen''s chalice and still fill to precisely the same depth.',
'Court of Echoes|Petitioners spoke through carved masks so the throne judged arguments without recognizing rank.',
'Unhelpful Palace Map|Shizuki labeled every stairway "up-ish" and every sealed treasury "probably snacks."',
'The Tax on Pearls|Pearls formed inside royal waters belonged one-third to the finder, one-third to the crown, and one-third to the sea.',
'Treaty Chamber Draft|The organization promised defensive constructs while reserving unrestricted access to royal ruins and prisoners.',
'The Crownless Guard|After the palace fell, surviving guards removed their crests but continued patrolling the evacuation routes.',
'Banquet Protocol|Guests received seven utensils, three of which were ceremonial and one of which was reportedly alive.',
'Returned Embassy Key|Shizuki''s annotation reads: "Borrowed during an emergency. Returned during a different century. Still counts."',
'Royal Archive Flooding|Archivists deliberately flooded the lowest stacks to hide politically dangerous records in salt-preserved cases.',
'The Prince Without a Name|One nursery ledger removes an heir from every succession list without explaining whether he died or was erased.',
'Covenant Engine Clause|A treaty permits royal seals to command facility constructs, but only while the ancient bloodline endures.',
'Law Beneath the Law|An older tablet states that no crown may own a living mind, contradicting several later royal decrees.',
'Officer Portrait Gallery|Shizuki added paper crowns to the Officers and a note: "Now everyone is equally overqualified."',
'The Menagerie Petition|Keepers begged the court to release creatures altered by visiting researchers; the petition was denied.',
'Council Vote|Three ministers opposed the Compact, two vanished, and the surviving record lists the decision as unanimous.',
'Seal Number Seven|The seventh seal bears both royal script and the same Subject Seven notation used in facility records.',
'The Last Public Notice|Citizens were ordered away from the palace while research personnel received protected passage inward.',
'Throne Room Correction|Shizuki scratched out "eternal authority" and wrote "very temporary furniture."',
'The Drowned Constitution|Fragments preserve rights to safe currents, honest measures, and freedom from magical alteration.',
'Compact Renewal|Successor rulers renewed the organization''s privileges long after the original signatories should have died.',
'The Royal Price|A private letter suggests the crown exchanged political prisoners for defenses against an approaching Astral threat.',
'Embassy Closure|The final embassy log seals its staff inside under Continuance orders rather than royal command.',
'No Throne Is Forever|An unknown clerk wrote that kingdoms drown, institutions change names, and records remember both.'
);
'astral-nexus'=@(
'The Same Door Twice|A portal opens onto both sides of the same corridor, but travelers return carrying different memories.',
'Stars Underfoot|The lights below are not reflections; several respond when addressed by forgotten constellation names.',
'Borrowed Yesterday|A physical memory of rainfall persists in one chamber despite the Astral Sea never having weather there.',
'The Folded Mile|Surveyors walked one hundred steps forward and returned behind their starting marker.',
'Please Ignore Future Me|Shizuki wrote: "If another version of me says this sign is safe, ask which one touched it first."',
'Continuance Route|Facility traffic records converge here from annexes separated by distance, politics, and nearly a century.',
'Memory Coral|The coral grows scenes instead of branches and sheds them when someone recognizes the people depicted.',
'Portal Etiquette|Old Fae instructions advise greeting a doorway before asking where it leads.',
'The Missing Minute|Every clock loses the same minute near the central convergence, though witnesses remember spending hours inside it.',
'Terminal Name Updated|Shizuki renamed the central terminal "Definitely_Not_Shizuki.txt" and replaced its alert tone with applause.',
'Subject Index Fragment|Entries One through Six end in failure codes; Subject Seven''s result field redirects to a sealed project file.',
'Architecture in Reverse|One structure is assembled from its roof downward while foundations appear only after rooms are entered.',
'The Other Ocean|A portal briefly shows an Astral Sea with no Moonlit Reef and a different arrangement of stars.',
'Century Counter|A project clock measures from the original escape rather than from the facility''s construction.',
'Emotionally Out of Order|Shizuki''s label on a security construct reads: "Technically functional. Spiritually having a difficult day."',
'Convergence Law|Objects from all six regions drift toward the Nexus but stop before touching, held in a permanent almost-collision.',
'White-Haired Figure|A damaged memory projection shows someone kneeling beside a small elf, but the face and spoken name are missing.',
'Portal Root|Living Fae roots pass through sealed geometry without puncturing it, connecting rooms that cannot share space.',
'The Viability Question|Researchers repeatedly ask why Seven survived procedures that killed or destabilized earlier subjects.',
'Helpful Future Warning|Shizuki wrote: "Do not enter the blue portal until yesterday. You will understand later, unfortunately."',
'Replacement Personnel|Staff records continue through descendants, constructed bodies, and unexplained identity transfers.',
'The Kindness Gap|Several records were removed by someone with authorized access immediately after Subject Seven received a personal name.',
'Central Objective|The project sought a stable living connection among Fae magic, memory, and Astral currents, but its intended use is redacted.',
'A Room Remembering Shizuki|The chamber recreates an empty berry pouch and laughter, evidence of a later visit made freely.',
'Access Card With Doodles|Shizuki returned an executive card covered in stars and wrote: "Your security remains adorable."',
'Timeline Scar|One corridor contains overlapping evacuation alarms from events separated by eighty-three years.',
'The Unresolved Name|A file confirms someone named Subject Seven but removes every clue identifying that person.',
'Continuance Directive|The organization ordered all surviving annexes to send results here even after their original leaders disappeared.',
'Why Seven Endured|The answer field is intact but encrypted by a Fae pattern that changes whenever it is observed.',
'The Open Convergence|The final record promises a next phase beyond the Nexus while leaving its architects and purpose unknown.'
)
}

$shizukiSlots=@(4,9,14,19,24,29)
foreach($region in $notes.Keys){$out=@();for($i=0;$i-lt30;$i++){$parts=$notes[$region][$i]-split'\|',2;$text=$parts[1];if($shizukiSlots-contains$i){$text="A page in Shizuki's familiar handwriting says: $text"}elseif($i%4-eq0){$text="A damaged traveler journal records: $text"}elseif($i%4-eq1){$text="An old field report states: $text"}elseif($i%4-eq2){$text="A local record preserves this account: $text"}else{$text="An unsigned observation reads: $text"};$out+= [ordered]@{id="$region-note-$('{0:D2}'-f($i+1))";number=$i+1;title=$parts[0];text=$text}};Write-Json (Join-Path $repo "data/notes/$region.json") $out}

$exploreSeeds=@{
'whispering-kelp-forest'=@('Murmuring Rootway','Lanternvine Crossing','Whispercap Circle','Veilpetal Drift','Rootcoil Bend','Dewbell Canopy','Briarfin Trail','Hushwater Grove','Fae-Lure Lights','Mosscloak Hollow','Singing Vineway','Moonblossom Clearing','Gossipcurrent Fork','Vanishing Grove','Shrinebark Shrine','Starflower Patch','Dreamsap Pool','Kelpweave Arch','Willowcurrent Turn','Bramblejaw Understory','Echo-Bark Stand','Moonmoth Cloud','Rootbound Effigy','Sighing Reedbed','Glimmerpod Nursery','Borrowed Grove','Thornsong Vale','Whisperroot Deep','Memory-Kelp Pool','Verdant Station Trace');
'leviathans-wake'=@('Wake-Rider Current','Titanbone Arch','Pressurejaw Drop','Sheltering Scale','Currentbreaker Run','Bonegarden Field','Hullsplitter Wreck','Wakefoam Surge','Deep-Scar Path','Walking Scale','Riptide Crossing','Wrecknest Gap','Tectonic Shelf','Roarcurrent Gorge','Abysslung Shadow','Marrowlight Ossuary','Titanwake Delta','Pressure Bloom','Shipgrave Maze','Scarfin Torrent','Colossus Trail','Thunderwake Storm','Fallen Fang','Riven Trench','Last Leviathan Song','Bone-Crown Reach','Wakeheart Vortex','Titan-Scar Gate','Remembering Scale','Behemoth Hold Trace');
'sunken-kings-throne'=@('Fallen Banner Square','Crowncoin Arcade','Palace Aqueduct','Sealbound Gallery','Mourning Promenade','Scepter Garden','Crownless Barracks','Drowned Archive','Thronewater Cistern','Gilded Processional','Sepulcher Cloister','Walking Statuary','Dynasty Coral Hall','Chalice Chapel','Taxkeeper Office','Royal Hunting Canal','Silent Heraldry','Sealbreaker Vault','Drowned Lists','Crownshadow Arcade','Ruined Menagerie','Pearl-Throne Gate','Usurper Passage','Oathchain Dungeon','Forgotten Prince Wing','Queen''s Tear Fountain','Seven Royal Seals','Silent Council','Thronebound Causeway','Compact Embassy Trace');
'astral-nexus'=@('Paradox Shoal','Impossible Angles','Memoryglass Strand','Portal-Skip Expanse','Clocktide Drift','Fractured Ocean','Dream-Anchor Mooring','Stars Below','Fae Axis','Hall of Other Selves','Stormscript Front','Portalroot Junction','Walking Constellation','Returning Yesterday','Voidflower Garden','Convergent Currents','Thoughtform Maze','Astral Storm Island','Phaseclaw Causeway','Memory Reef','Gravity Choir','Foldspace Spiral','Unbuilding Ruins','Eventide Threshold','Portal Graveyard','Gnawed Timeline','Nexus Crown Array','First-Light Memory','Convergence Threshold','Continuance Core Trace')
}
$descriptors=@{
'whispering-kelp-forest'=@('living roots fold aside to reveal a pocket of Star Candies','whispering currents guide you beneath a curtain of silver fronds','Fae lights gather around a cache hidden inside a hollow vine','glowing spores outline a path to an overlooked forest offering','moving vines uncover a moonlit coffer and carefully close behind you');
'leviathans-wake'=@('a violent current tears open an old wreck compartment filled with Star Candies','you shelter beneath an enormous scale and find a forgotten supply cache','pressure-lit creatures lead you between colossal bones to a sealed strongbox','an ancient wake exposes treasure lodged inside a scar in the seabed','a calm pocket behind a titanic rib holds a navigator''s abandoned Candies');
'sunken-kings-throne'=@('a drowned civic marker opens to reveal a carefully counted Candy reserve','you follow faded banners into a hall where a royal offering remains untouched','an old seal releases a modest treasury cache when you approach','a haunted fountain clears long enough to expose Star Candies beneath its basin','court tiles shift into an obsolete ceremonial pattern and reveal hidden payment');
'astral-nexus'=@('folded space returns your own footsteps carrying a pouch of Star Candies','a portal deposits a cache from somewhere that has not happened yet','physical memories gather into Candies when you recognize the scene','impossible stars align beneath you and illuminate a hidden convergence offering','a Fae structure unfolds one extra room containing a stable Candy cache')
}
$economy=@{'whispering-kelp-forest'=@(140,5,140,45,2);'leviathans-wake'=@(200,7,180,75,3);'sunken-kings-throne'=@(280,9,240,110,4);'astral-nexus'=@(380,12,320,150,5)}
foreach($region in $exploreSeeds.Keys){$rows=@();$econ=$economy[$region];for($i=0;$i-lt30;$i++){$min=$econ[0]+$econ[1]*$i;$max=$min+$econ[2];$rows+=[ordered]@{id=$i+1;code=(@{'whispering-kelp-forest'='WKF';'leviathans-wake'='LW';'sunken-kings-throne'='SKT';'astral-nexus'='AN'}[$region])+'-'+('{0:D3}'-f($i+1));category='explore';region=(@{'whispering-kelp-forest'='Whispering Kelp Forest';'leviathans-wake'="Leviathan's Wake";'sunken-kings-throne'="Sunken King's Throne";'astral-nexus'='Astral Nexus'}[$region]);rarity=(@('common','common','common','uncommon','uncommon','rare','common','common','uncommon','epic')[$i%10]);weight=[Math]::Max(20,100-$i*2);title=$exploreSeeds[$region][$i];reward=[ordered]@{min=$min;max=$max};xp=$econ[3]+$econ[4]*$i;message="explored $($exploreSeeds[$region][$i]), where $($descriptors[$region][$i%5]), recovering {reward} Star Candies.";itemDrops=@([ordered]@{id="$region-note-$('{0:D2}'-f($i+1))";chance=(0.18+0.02*($i%5));type='travel-note'})}};Write-Json (Join-Path $repo "data/explore/$region.json") $rows}

$starPath=Join-Path $repo 'data/explore/starfall-trench.json';$parsedStar=Get-Content -Raw $starPath|ConvertFrom-Json;$star=@();foreach($entry in $parsedStar){$star+=$entry};for($i=0;$i-lt$star.Count;$i++){$drop=@([pscustomobject][ordered]@{id=('starfall-trench-note-{0:D2}'-f($i+1));chance=0.22;type='travel-note'});$star[$i]|Add-Member -NotePropertyName itemDrops -NotePropertyValue $drop -Force};$starTitles=@('Meteor Scar Crossing','Starstone Rain','Crystalline Shoal','Gravity Fold','Cosmic Vent Bloom','Buried Sky-Ruin','Cometglass Shelf','Darkstar Current','Falling-Light Curtain','Broken Orrery','Deep Crater Garden','Celestial Fault','Annex Signal');for($n=18;$n-le30;$n++){$min=110+($n-18)*5;$star+=[pscustomobject][ordered]@{id=$n;code=('ST-{0:D3}'-f$n);category='explore';region='Starfall Trench';rarity=(@('common','uncommon','common','rare','common')[$n%5]);weight=[Math]::Max(30,100-2*$n);title=$starTitles[$n-18];reward=[ordered]@{min=$min;max=$min+130};xp=22+($n-17);message="crossed $($starTitles[$n-18]) as celestial debris shifted through the trench, revealing {reward} Star Candies beneath luminous starstone.";itemDrops=@([ordered]@{id=('starfall-trench-note-{0:D2}'-f$n);chance=(0.18+0.02*($n%5));type='travel-note'})}};Write-Json $starPath $star
