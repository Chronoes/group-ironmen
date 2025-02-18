const jsdom = require("jsdom");
const { JSDOM } = require('jsdom');
const axios = require("axios");
const fs = require('fs');

const questsMapping = require('./quest-mapping.json');
const questNameToIdMap = new Map();
for (const [questId, questName] of Object.entries(questsMapping)) {
  questNameToIdMap.set(questName, parseInt(questId));
}

function getQuestTableData(table) {
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const result = [];
  const ths = Array.from(table.querySelectorAll('th'));
  const headers = ths.map((th) => th.textContent.trim());
  for (const row of rows) {
    const tds = Array.from(row.querySelectorAll('td'));
    if (tds.length === 0) continue;
    const name = tds[headers.indexOf('Name')].textContent.trim();
    const difficulty = tds[headers.indexOf('Difficulty')].textContent.trim();
    const points = tds[headers.indexOf('')]?.textContent.trim() || 0;
    result.push({
      name,
      difficulty,
      points
    });
  }

  return result;
}

async function run() {
  const questsListHtml = await axios.get("https://oldschool.runescape.wiki/w/Quests/List");
  const dom = new JSDOM(questsListHtml.data);

  const questTables = Array.from(dom.window.document.querySelectorAll("table")).filter((table) => {
    const ths = Array.from(table.querySelectorAll('th'));
    if (ths.length === 0) return false;

    const headerText = ths.map((th) => th.textContent.trim()).join('');
    if (headerText.endsWith('NameDifficultyLengthSeriesRelease date')) return true;
    return false;
  });

  const freeToPlayQuestTable = questTables[0];
  const memberQuestTable = questTables[1];
  const miniQuestTable = questTables[2];

  const freeToPlayQuests = getQuestTableData(freeToPlayQuestTable);
  freeToPlayQuests.forEach((quest) => quest.member = false);
  const memberQuests = getQuestTableData(memberQuestTable);
  memberQuests.forEach((quest) => quest.member = true);
  const miniQuests = getQuestTableData(miniQuestTable);
  miniQuests.forEach((quest) => {
    quest.member = true
    quest.miniquest = true;
  });

  const knownUnknownQuests = new Set([
    `Recipe for Disaster/Another Cook's Quest`,
    `Recipe for Disaster/Freeing the Goblin generals`,
    `Recipe for Disaster/Freeing the Mountain Dwarf`,
    `Recipe for Disaster/Freeing Evil Dave`,
    `Recipe for Disaster/Freeing Pirate Pete`,
    `Recipe for Disaster/Freeing the Lumbridge Guide`,
    `Recipe for Disaster/Freeing Sir Amik Varze`,
    `Recipe for Disaster/Freeing King Awowogei`,
    `Recipe for Disaster/Freeing Skrach Uglogwee`,
    `Recipe for Disaster/Defeating the Culinaromancer`
  ]);
  const result = {};
  for (const quest of [...freeToPlayQuests, ...memberQuests, ...miniQuests]) {
    if (!questNameToIdMap.has(quest.name)) {
      if (!knownUnknownQuests.has(quest.name)) {
        console.error(`quest mapping is missing quest ${quest.name} from the wiki`);
      }
      continue;
    }
    result[questNameToIdMap.get(quest.name)] = quest;
  }


  fs.writeFileSync('./public/data/quest_data.json', JSON.stringify(result));
}

run();
