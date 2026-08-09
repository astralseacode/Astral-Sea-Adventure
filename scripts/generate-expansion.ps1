$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$source = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'generate-expansion.js')

function Slug([string]$value) {
  return (($value.ToLowerInvariant() -replace "[’']", '') -replace '[^a-z0-9]+', '-').Trim('-')
}
function Lerp([int]$a, [int]$b, [int]$index) {
  return [Math]::Round($a + (($b - $a) * $index / 29.0), [MidpointRounding]::AwayFromZero)
}
function Write-JsonFile([string]$file, $value) {
  $directory = Split-Path -Parent $file
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  $json = $value | ConvertTo-Json -Depth 20
  [System.IO.File]::WriteAllText($file, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

$scaling = @{
  'starfall-trench' = @(150,220,6,8,210,360,480,720,55,260,340,9,11,360,560,750,1050,90,95,145,45,60)
  'whispering-kelp-forest' = @(215,285,8,10,340,500,700,950,80,325,410,11,13,520,760,1000,1400,120,130,200,55,72)
  'leviathans-wake' = @(280,350,10,12,480,680,900,1250,110,400,485,13,15,720,1000,1350,1800,155,175,265,68,88)
  'sunken-kings-throne' = @(345,430,12,14,650,920,1200,1650,145,475,570,15,18,980,1350,1750,2350,200,230,350,85,110)
  'astral-nexus' = @(425,510,14,18,900,1300,1600,2300,190,565,680,18,22,1350,1850,2300,3200,260,300,450,105,135)
}
$stableRenamedIds = @{
  'Starvent Crab'='cosmic-vent-crab'; 'Starforge Clawlord'='superheated-ventlord'; 'Starcoil Nautilus'='periapsis-nautilus';
  'Fallen Star Walker'='celestial-ruin-walker'; 'Celestial Corekeeper'='celestial-core-keeper'; 'Veilmoss Grouper'='camouflage-grouper';
  'Starmaw Blossom'='predatory-starflower'; 'Moonloom Weaver'='grand-loom-spider'; 'Titanwake Drake'='titanwake-crocodile';
  'Primeval Fangkeeper'='first-tooth-sentinel'; 'Songwake Phantom'='leviathan-song-echo'; 'Gilded Platefin'='gilded-armorfish';
  'Tithekeeper Octopus'='taxkeeper-octopus'; 'Crown-Caged Chimera'='royal-menagerie-beast'; 'Royal Oath Construct'='royal-seal-construct';
  'Angleweave Eel'='geometry-eel'; 'Fractured-Angle Coil'='euclidean-coilbreaker'; 'Mirror-Self Mimic'='echo-of-self-mimic';
  'Convergence Elemental'='nexus-current-elemental'; 'Fae Stoneweaver'='fae-ruin-architect'; 'Portalgrave Prowler'='portal-grave-scavenger'
}
$layouts = @(
  @(@('combat','treasure','healing'),@('treasure','combat','empty'),@('healing','treasure','combat')),
  @(@('treasure','healing','combat'),@('combat','empty','treasure'),@('treasure','combat','healing')),
  @(@('healing','combat','treasure'),@('empty','treasure','combat'),@('combat','healing','treasure')),
  @(@('combat','empty','treasure'),@('healing','combat','treasure'),@('treasure','healing','combat')),
  @(@('treasure','combat','healing'),@('combat','treasure','empty'),@('healing','combat','treasure')),
  @(@('empty','treasure','combat'),@('combat','healing','treasure'),@('treasure','combat','healing'))
)

$regionPattern = '(?s)\{\s*id: "(?<id>[^"]+)", name: "(?<name>[^"]+)", levels: \[(?<low>\d+), (?<high>\d+)\],\s*enemies: \[(?<enemies>.*?)\],\s*prompt: \[(?<prompt>.*?)\],\s*treasure: \[(?<treasure>.*?)\],\s*heal: \[(?<heal>.*?)\],\s*lore: "(?<lore>[^"]+)"'
$matches = [regex]::Matches($source, $regionPattern)
if ($matches.Count -ne 5) { throw "Expected 5 region definitions; found $($matches.Count)." }

foreach ($match in $matches) {
  $id = $match.Groups['id'].Value
  $name = $match.Groups['name'].Value
  $low = [int]$match.Groups['low'].Value
  $high = [int]$match.Groups['high'].Value
  $lore = $match.Groups['lore'].Value
  $prompts = [regex]::Matches($match.Groups['prompt'].Value, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $treasures = [regex]::Matches($match.Groups['treasure'].Value, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $heals = [regex]::Matches($match.Groups['heal'].Value, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $enemyRows = [regex]::Matches($match.Groups['enemies'].Value, '\["([^"]+)","([^"]+)","([^"]+)","([^"]+)"\]')
  if ($enemyRows.Count -ne 30) { throw "$id has $($enemyRows.Count) enemy rows." }
  $manifest = @()
  $index = @()
  $s = $scaling[$id]

  for ($i = 0; $i -lt 30; $i++) {
    $row = $enemyRows[$i]
    $enemyName,$adventureName,$bossName,$chamber = 1..4 | ForEach-Object { $row.Groups[$_].Value }
    $number = $i + 1
    $enemyId = if($stableRenamedIds.ContainsKey($enemyName)){$stableRenamedIds[$enemyName]}else{Slug $enemyName}
    $bossBaseId = if($stableRenamedIds.ContainsKey($bossName)){$stableRenamedIds[$bossName]}else{Slug $bossName}
    $bossId = $bossBaseId + '-boss'
    $adventureId = Slug $adventureName
    $level = if ($low -eq $high) { $low } else { [Math]::Round($low + (($high-$low)*$i/29.0), [MidpointRounding]::AwayFromZero) }
    $normal = [ordered]@{id=$enemyId;name=$enemyName;region=$id;level=$level;hp=(Lerp $s[0] $s[1] $i);damageBonus=(Lerp $s[2] $s[3] $i);isBoss=$false;reward=[ordered]@{candies=[ordered]@{min=(Lerp $s[4] $s[5] $i);max=(Lerp $s[6] $s[7] $i)};xp=[ordered]@{min=(Lerp $s[4] $s[5] $i);max=(Lerp ($s[4]+70) ($s[5]+100) $i)}};defeatCandyLoss=(Lerp $s[8] ($s[8]+45) $i)}
    $bossCandyMin=Lerp $s[15] $s[16] $i
    $boss = [ordered]@{id=$bossId;name=$bossName;region=$id;level=$level;hp=(Lerp $s[9] $s[10] $i);damageBonus=(Lerp $s[11] $s[12] $i);isBoss=$true;reward=[ordered]@{candies=[ordered]@{min=$bossCandyMin;max=[Math]::Round($bossCandyMin*1.4,[MidpointRounding]::AwayFromZero)};xp=[ordered]@{min=(Lerp $s[13] $s[14] $i);max=(Lerp $s[14] ($s[14]+220) $i)}};defeatCandyLoss=(Lerp $s[18] ($s[18]+70) $i)}
    Write-JsonFile (Join-Path $repo "data/enemies/$id/$enemyId.json") $normal
    Write-JsonFile (Join-Path $repo "data/enemies/bosses/$id/$bossId.json") $boss
    $index += [ordered]@{encounter=$number;enemy=$enemyId;recommendedLevel=$level}

    $roomIds = @("$adventureId-approach","$adventureId-depths","$adventureId-threshold")
    $rooms = [ordered]@{}
    $treasureN=0; $healN=0
    $layout = $layouts[$i % $layouts.Count]
    for ($stage=0; $stage -lt 3; $stage++) {
      $choices=[ordered]@{}
      $directions=@('left','right','forward')
      for ($d=0; $d -lt 3; $d++) {
        $direction=$directions[$d]; $type=$layout[$stage][$d]
        $nextRoomId=if($stage -eq 2){'boss-antechamber'}else{$roomIds[$stage+1]}
        if($type -eq 'combat'){$choices[$direction]=[ordered]@{type=$type;nextRoomId=$nextRoomId;enemyId=$enemyId;message="A shift in the current exposes $enemyName, which claims the $direction route through $adventureName."}}
        elseif($type -eq 'treasure'){$baseMin=(Lerp $s[19] $s[20] $i)+$treasureN*12;$choices[$direction]=[ordered]@{type=$type;nextRoomId=$nextRoomId;message="Beyond the $direction route, you discover $($treasures[($i+$treasureN)%3]).";reward=[ordered]@{min=$baseMin;max=$baseMin+35+[Math]::Floor($i/3)}};$treasureN++}
        elseif($type -eq 'healing'){$amount=(Lerp $s[21] $s[22] $i)+$healN*5;$choices[$direction]=[ordered]@{type=$type;nextRoomId=$nextRoomId;healAmount=$amount;message="The $direction route reaches $($heals[($i+$healN)%2]), restoring your strength.";fullHpMessage="The restorative refuge along the $direction route remains peaceful; you need no healing, but the discovery still teaches you something."};$healN++}
        else{$discovery=if($number -eq 30){"A berry cache sits beneath a terminal Shizuki renamed `"Definitely_Not_Shizuki_$id.txt.`" Its note reads: `"If you're reading this, their dramatic security system lost again. You're welcome.`""}else{"You find one of Shizuki's old trail caches beside a doodled map of $adventureName. A note says: `"If you're reading this, the sensible route was probably somewhere else. This one has a Berry, though. You've got this.`""};$choices[$direction]=[ordered]@{type='empty';nextRoomId=$nextRoomId;message=$discovery;berries=1}}
      }
      $lead=@('At the edge of','Deeper within','Near the heart of')[$stage]
      $rooms[$roomIds[$stage]]=[ordered]@{prompt="$lead $adventureName, $($prompts[($i+$stage)%3]) divide into three uncertain routes.";choices=$choices}
    }
    $rooms['boss-antechamber']=[ordered]@{name=$chamber;type='boss-prompt';prompt="A powerful guardian disturbs the water beyond the final threshold of $chamber."}
    $bossScene=if($number -eq 30){'A uniformed figure bearing an old institutional rank waits beyond a sealed command dais.'}else{"A vast silhouette moves behind the chamber's last veil."}
    $completion=if($number -eq 30){"$bossName falls, exposing preserved records among later additions defaced with Shizuki's cheerful graffiti. $lore Shizuki's newest annotation reads: `"Came back on my own. Added mustache. Left whenever I wanted.`" All 30 Adventures in $name are complete."}else{"$bossName yields, and the currents beyond $chamber open the next route through $name."}
    $adventure=[ordered]@{id=$adventureId;number=$number;name=$adventureName;regionId=$id;enemyId=$enemyId;recommendedLevel=$level;introDiscord="$adventureName lies ahead, where $($prompts[$i%3]) conceal the territory of $enemyName.";introTwitch="$adventureName lies ahead amid $($prompts[$i%3]).";startRoomId=$roomIds[0];rooms=$rooms;bossPromptDiscord="You enter $chamber. $bossScene`n`nA powerful guardian blocks the way. Its identity remains concealed.`nUse /yes to continue or /no to retreat for now.";bossPromptTwitch="$chamber`: A concealed guardian blocks the way. Use !yes to continue or !no to retreat.";bossRetreatText="You withdraw from $chamber. The hidden guardian remains beyond the threshold.";boss=[ordered]@{enemyId=$bossId;roomId='boss';revealText="The chamber's veil breaks. $bossName reveals itself!"};completionText=$completion}
    $file='adventure-{0:D2}-{1}.json' -f $number,$adventureId
    Write-JsonFile (Join-Path $repo "data/adventures/$id/$file") $adventure
    $manifest += [ordered]@{number=$number;id=$adventureId;name=$adventureName;enemyId=$enemyId;bossEnemyId=$bossId;file=$file}
  }
  Write-JsonFile (Join-Path $repo "data/adventures/$id/manifest.json") $manifest
  Write-JsonFile (Join-Path $repo "data/enemies/$id/index.json") $index
}
Write-Output 'Generated 150 Adventures, normal enemies, and bosses.'
