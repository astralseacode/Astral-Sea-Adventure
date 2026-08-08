$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
$regions=@('starfall-trench','whispering-kelp-forest','leviathans-wake','sunken-kings-throne','astral-nexus')
$allIds=@{};$failures=[System.Collections.Generic.List[string]]::new();$report=@()
function Fail($message){$failures.Add($message)}
foreach($region in $regions){
  $dir=Join-Path $repo "data/adventures/$region"
  $adventureFiles=@(Get-ChildItem $dir -Filter 'adventure-*.json')
  $manifest=Get-Content -Raw (Join-Path $dir 'manifest.json')|ConvertFrom-Json
  $index=Get-Content -Raw (Join-Path $repo "data/enemies/$region.json")|ConvertFrom-Json
  $bossFiles=@(Get-ChildItem (Join-Path $repo "data/enemies/bosses/$region") -Filter '*.json')
  if($adventureFiles.Count-ne 30){Fail "$region adventure files: $($adventureFiles.Count)"}
  if($manifest.Count-ne 30){Fail "$region manifest entries: $($manifest.Count)"}
  if($index.Count-ne 30){Fail "$region index entries: $($index.Count)"}
  if($bossFiles.Count-ne 30){Fail "$region boss files: $($bossFiles.Count)"}
  $levels=@()
  for($i=0;$i-lt 30;$i++){
    $n=$i+1;$m=$manifest[$i];$entry=$index[$i]
    if($m.number-ne$n-or$entry.encounter-ne$n){Fail "$region ordering at $n"}
    $file=Join-Path $dir ([string]$m.file)
    if(!(Test-Path $file)){Fail "$region missing $($m.file)";continue}
    $a=Get-Content -Raw $file|ConvertFrom-Json
    if($a.number-ne$n-or$a.regionId-ne$region-or$a.enemyId-ne$m.enemyId-or$a.boss.enemyId-ne$m.bossEnemyId){Fail "$region reference mismatch $n"}
    if($a.name-ne$m.name){Fail "$region name mismatch $n"}
    $normalFile=Join-Path $repo "data/enemies/$($a.enemyId).json";$bossFile=Join-Path $repo "data/enemies/bosses/$region/$($a.boss.enemyId).json"
    if(!(Test-Path $normalFile)){Fail "$region missing normal $($a.enemyId)";continue};if(!(Test-Path $bossFile)){Fail "$region missing boss $($a.boss.enemyId)";continue}
    $normal=Get-Content -Raw $normalFile|ConvertFrom-Json;$boss=Get-Content -Raw $bossFile|ConvertFrom-Json
    if($normal.isBoss-ne$false-or$boss.isBoss-ne$true){Fail "$region boss flag $n"};if($normal.region-ne$region-or$boss.region-ne$region){Fail "$region enemy region $n"}
    foreach($enemyDefinition in @($normal,$boss)){if($enemyDefinition.hp-lt1-or$enemyDefinition.damageBonus-lt0-or$enemyDefinition.reward.xp.min-lt1-or$enemyDefinition.reward.xp.max-lt$enemyDefinition.reward.xp.min-or$enemyDefinition.reward.candies.min-lt0-or$enemyDefinition.reward.candies.max-lt$enemyDefinition.reward.candies.min-or$enemyDefinition.defeatCandyLoss-lt0){Fail "$region invalid enemy reward/stat range $n ($($enemyDefinition.id))"}}
    if($boss.hp-le$normal.hp-or$boss.damageBonus-lt$normal.damageBonus-or$boss.reward.xp.min-lt$normal.reward.xp.min-or$boss.reward.candies.min-lt$normal.reward.candies.min){Fail "$region boss weaker than normal $n"}
    if($entry.enemy-ne$normal.id){Fail "$region index reference $n"};$levels+=$normal.level
    foreach($id in @($a.id,$normal.id,$boss.id)){if($allIds.ContainsKey($id)){Fail "duplicate id $id"}else{$allIds[$id]=$true}}
    $passages=@($a.rooms.psobject.Properties|Where-Object{$_.Value.type-ne'boss-prompt'})
    $bossRooms=@($a.rooms.psobject.Properties|Where-Object{$_.Value.type-eq'boss-prompt'})
    if($passages.Count-ne3-or$bossRooms.Count-ne1){Fail "$region room structure $n"}
    if($bossRooms[0].Value.name-eq $null-or[string]::IsNullOrWhiteSpace($bossRooms[0].Value.name)){Fail "$region unnamed boss chamber $n"}
    $types=@();foreach($room in $passages){if($room.Value.psobject.Properties.Name-contains'name'){Fail "$region player-facing intermediate name $n"};$choices=@($room.Value.choices.psobject.Properties);if($choices.Count-ne3){Fail "$region choices $n"};$types+=$choices.Value.type}
    if(($types|Where-Object{$_-eq'combat'}).Count-ne3-or($types|Where-Object{$_-eq'treasure'}).Count-ne3-or($types|Where-Object{$_-eq'healing'}).Count-ne2-or($types|Where-Object{$_-eq'empty'}).Count-ne1){Fail "$region outcome distribution $n"}
    if($a.bossPromptDiscord-match[regex]::Escape($boss.name)-or$a.bossPromptTwitch-match[regex]::Escape($boss.name)){Fail "$region revealed boss before yes $n"}
    if($n-eq30-and$a.completionText-match'Adventure 31'){Fail "$region finale unlocks Adventure 31"}
  }
  if(($levels | Select-Object -Last 1)-ne($(if($region-eq'astral-nexus'){50}elseif($region-eq'starfall-trench'){10}elseif($region-eq'whispering-kelp-forest'){20}elseif($region-eq'leviathans-wake'){30}else{50}))){Fail "$region final level"}
  for($i=1;$i-lt$levels.Count;$i++){if($levels[$i]-lt$levels[$i-1]){Fail "$region non-monotonic levels"}}
  $report+=[pscustomobject]@{Region=$region;Adventures=$adventureFiles.Count;Normals=$index.Count;Bosses=$bossFiles.Count;Levels=(($levels|Group-Object|ForEach-Object{"$($_.Name)x$($_.Count)"})-join', ')}
}
$jsonFiles=@(Get-ChildItem (Join-Path $repo 'data') -Recurse -Filter '*.json');foreach($file in $jsonFiles){try{Get-Content -Raw $file.FullName|ConvertFrom-Json|Out-Null}catch{Fail "JSON parse: $($file.FullName)"}}
$adventureTotal=@(Get-ChildItem (Join-Path $repo 'data/adventures') -Recurse -Filter 'adventure-*.json').Count
$normalTotal=0;foreach($file in Get-ChildItem (Join-Path $repo 'data/enemies') -File -Filter '*.json'){try{$j=Get-Content -Raw $file.FullName|ConvertFrom-Json;if($j -isnot [array] -and $j.id -and $j.isBoss -ne $true){$normalTotal++}}catch{}}
$bossTotal=@(Get-ChildItem (Join-Path $repo 'data/enemies/bosses') -Recurse -Filter '*.json').Count
if($adventureTotal-ne180){Fail "global adventures $adventureTotal"};if($normalTotal-ne180){Fail "global normals $normalTotal"};if($bossTotal-ne180){Fail "global bosses $bossTotal"}
$badText=rg -n 'TODO|PLACEHOLDER|Enemy [0-9]+|Boss [0-9]+|Adventure 31|�' data/adventures data/enemies 2>$null;if($LASTEXITCODE-eq0){Fail "placeholder/encoding matches: $badText"}
$worker=Get-Content -Raw (Join-Path $repo 'worker.js');$chars=$worker.ToCharArray();foreach($pair in @(@('(',')'),@('[',']'),@('{','}'))){$open=($chars|Where-Object{$_-eq$pair[0]}).Count;$close=($chars|Where-Object{$_-eq$pair[1]}).Count;if($open-ne$close){Fail "worker delimiter count $($pair[0])=$open $($pair[1])=$close"}}
$report|Format-Table -AutoSize
Write-Output "Totals: Adventures=$adventureTotal NormalEnemies=$normalTotal Bosses=$bossTotal JSON=$($jsonFiles.Count)"
if($failures.Count){$failures|ForEach-Object{Write-Error $_};exit 1};Write-Output 'VALIDATION PASSED'
