import { Item } from "./item";
import { SkillName } from "./skill";
import { Quest } from "./quest";
import { utility } from "../utility";
import { SkillGraph } from "../skill-graph/skill-graph";
import { GroupData } from "./group-data";
import { AchievementDiary } from "./diaries";

class ExampleData {
  constructor() {
    Item.gePrices = {
      26386: 450355946,
      26382: 229822222,
      26384: 481017546,
      6685: 7251,
    };
    Item.itemDetails = {
      995: {
        name: "Coins",
        highalch: 0,
        stacks: [
          {
            id: 996,
            count: 2,
          },
          {
            id: 997,
            count: 3,
          },
          {
            id: 998,
            count: 4,
          },
          {
            id: 999,
            count: 5,
          },
          {
            id: 1000,
            count: 25,
          },
          {
            id: 1001,
            count: 100,
          },
          {
            id: 1002,
            count: 250,
          },
          {
            id: 1003,
            count: 1000,
          },
          {
            id: 1004,
            count: 10000,
          },
        ],
        id: 995,
      },
      26382: {
        name: "Torva full helm",
        highalch: 120000,
        stacks: null,
        id: "26382",
      },
      26384: {
        name: "Torva platebody",
        highalch: 360000,
        stacks: null,
        id: "26384",
      },
      26386: {
        name: "Torva platelegs",
        highalch: 240000,
        stacks: null,
        id: "26386",
      },
      6685: {
        name: "Saradomin brew(4)",
        highalch: 120,
        stacks: null,
        id: "6685",
      },
      563: {
        name: "Law rune",
        highalch: 144,
        stacks: null,
        id: "563",
      },
      561: {
        name: "Nature rune",
        highalch: 108,
        stacks: null,
        id: "561",
      },
      554: {
        name: "Fire rune",
        highalch: 2,
        stacks: null,
        id: "554",
      },
      12791: {
        name: "Rune pouch",
        highalch: 0,
        stacks: null,
        id: "12791",
      },
    };
  }

  enable() {
    this.disable();
    this.reset();
    this.intervals = [
      utility.callOnInterval(this.doHealthUpdate.bind(this), 3000),
      utility.callOnInterval(this.doXpDrop.bind(this), 2000),
    ];
  }

  disable() {
    if (this.intervals) {
      for (const interval of this.intervals) {
        clearInterval(interval);
      }

      this.intervals = [];
    }
  }

  reset() {
    this.members = {
      Zezima: {
        quests: Quest.randomQuestStates(),
        bank: [995, Math.floor(Math.random() * 25000000)],
        stats: [99, 99, 99, 99, 100, 100, 330],
        skills: Object.values(SkillName).map(() => Math.floor(Math.random() * 14000000)),
        equipment: Item.randomItems(14, 1),
        inventory: Item.randomItems(28),
        coordinates: [3029, 3000, 0],
        last_updated: "2022-01-23T01:34:06.104Z",
        diary_vars: AchievementDiary.randomDiaries(),
      },
      "group alt two": {
        rune_pouch: [563, 1922, 561, 5, 554, 15194],
        quests: Quest.randomQuestStates(),
        coordinates: [3129, 3100, 0],
        stats: [55, 93, 13, 70, 75, 100, 330],
        skills: Object.values(SkillName).map(() => Math.floor(Math.random() * 14000000)),
        bank: [995, Math.floor(Math.random() * 5000000)],
        diary_vars: AchievementDiary.randomDiaries(),
        inventory: [
          26382,
          1,
          26384,
          1,
          26386,
          1,
          12791,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          6685,
          1,
          995,
          Math.floor(Math.random() * 5000000),
        ],
        equipment: [26382, 1, 0, 0, 0, 0, 0, 0, 26384, 1, 0, 0, 0, 0, 26386, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      "Bank alt": {
        bank: [995, Math.floor(Math.random() * 5000000), ...Item.randomItems(500)],
        skills: Object.values(SkillName).map(() => Math.floor(Math.random() * 14000000)),
        stats: [7, 10, 10, 10, 100, 100, 309],
        equipment: Item.randomItems(14, 1),
        coordinates: [3103, 3025, 0],
        quests: Quest.randomQuestStates(),
        diary_vars: AchievementDiary.randomDiaries(),
        interacting: {
          last_updated: "2050-01-01T00:00:00.000Z",
          name: "Goblin",
          ratio: 25,
          scale: 30,
          location: {
            x: 3104,
            y: 3025,
            plane: 0,
          },
        },
      },
      "@SHARED": {
        bank: [995, 1000000],
      },
    };
  }

  getGroupData() {
    const groupData = Object.entries(this.members).map(([name, data]) => {
      return { name, ...data };
    });
    this.members = {
      "group alt two": {
        skills: this.members["group alt two"].skills,
      },
      Zezima: [],
      "Bank alt": [],
      "@SHARED": [],
    };
    return groupData;
  }

  doXpDrop() {
    this.members["group alt two"].skills[0] += 50;
  }

  doHealthUpdate() {
    this.members["group alt two"].stats = [Math.floor(Math.max(1, Math.random() * 93)), 93, 13, 70, 75, 100, 330];
  }

  getSkillData(period, groupData) {
    const dates = SkillGraph.datesForPeriod(period);
    const result = [];
    const skillNames = Object.values(SkillName);
    skillNames.sort((a, b) => a.localeCompare(b));

    for (const member of groupData.members.values()) {
      if (!member.skills) continue;
      const skillData = [];
      let s = skillNames.map((skillName) => member.skills[skillName].xp);

      for (const date of dates) {
        skillData.push({
          time: date.toISOString(),
          data: s,
        });
        s = s.map((x) => (Math.random() > 0.9 ? Math.round(x + Math.random() * 10000) : x));
      }

      const transformed = GroupData.transformSkillsFromStorage(s);
      for (const [skillName, xp] of Object.entries(transformed)) {
        member.skills[skillName].xp = xp;
      }

      if (this.members[member.name].skills) {
        this.members[member.name].skills = s;
      }

      result.push({
        name: member.name,
        skill_data: skillData,
      });
    }

    return result;
  }
}

const exampleData = new ExampleData();

export { exampleData };
