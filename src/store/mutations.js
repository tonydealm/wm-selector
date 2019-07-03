import Vue from 'vue';

export default {
  ADD_PRINT_ITEM (state, index) {
    state.printItems.push(state.printableItems[index]);
    state.printableItems.splice(index, 1);
  },
  CLEAR_ERRORS (state) {
    state.errors.length = 0;
  },
  PUSH_ERROR (state, error) {
    state.errors.push(error);
  },
  REMOVE_PRINT_ITEM (state, index) {
    state.printableItems.push(state.printItems[index]);
    state.printItems.splice(index, 1);
  },
  SET_ACTIVE_ARMY_LIST_GROUP_TAB (state, activeArmyListGroupTab) {
    state.activeArmyListGroupTab = activeArmyListGroupTab;
  },
  SET_ARMY_LIST (state, armyList) {
    state.armyList = armyList;
  },
  SET_ARMY_RULES (state, armyRules) {
    state.armyRules = armyRules;
  },
  SET_JSON_PATH (state, jsonPath) {
    state.jsonPath = jsonPath;
  },
  SET_LABEL (state, label) {
    state.label = label;
  },
  SET_MAGIC (state, magic) {
    state.magic = magic;
  },
  SET_PRINT_ITEMS (state, printItems) {
    state.printItems = printItems;
  },
  SET_PRINTABLE_ITEMS (state, printableItems) {
    state.printableItems = printableItems;
  },
  SET_SPECIAL_RULES (state, specialRules) {
    state.specialRules = specialRules;
  },
  SET_SPELLS (state, spells) {
    state.spells = spells;
  },
  SET_UNIT_NUMBER (state, payload) {
    state.units[payload.unitID].number = payload.number;
  },
  SET_UNIT_POINTS_COST (state, payload) {
    var
      unit = state.units[payload.unitID],
      unitPointsCost = unit.number * +unit.points;

    try {
      unit.pointsCost = Object.values(unit.upgrades)
        .reduce((pointsCost, upgrade) => pointsCost + upgrade.pointsCost, unitPointsCost);
    } catch {
      unit.pointsCost = unitPointsCost;
    }
  },
  SET_UNIT_UPGRADE_NUMBER_AND_POINTS_COST (state, payload) {
    var unitUpgrade = state.units[payload.unitID].upgrades[payload.upgradeID];

    unitUpgrade.number = payload.number;
    unitUpgrade.pointsCost = payload.number * +state.upgrades[payload.upgradeID].points;
  },
  SET_UNITS (state, units) {
    var unit;

    state.units = units;

    for (var unitID in units) {
      unit = state.units[unitID];

      Vue.set(unit, 'number', 0);
      Vue.set(unit, 'pointsCost', 0);
      Vue.set(unit, 'minMax', minMax(unit));

      // add any upgrades as defined by the army's upgrade constraints
      state.upgradeConstraints.forEach((upgradeConstraint) => {
        if (upgradeConstraint.unitType.includes(unit.type) &&
            !unit.noUpgrades &&
            !(unit.noMagic && upgradeConstraint.magic)) {
          try {
            Vue.set(unit, 'upgrades', unit.upgrades.concat(upgradeConstraint.upgrades));
          } catch {
            Vue.set(unit, 'upgrades', upgradeConstraint.upgrades);
          }
        }
      });

      // change the unit's array of upgrade IDs into an object storing unit upgrade numbers
      if (unit.upgrades) {
        Vue.set(unit, 'upgrades', unit.upgrades.reduce((upgrades, upgradeID) => {
          upgrades[upgradeID] = {
            number: 0,
            pointsCost: 0
          };

          return upgrades;
        }, {}));
      }
    }
  },
  SET_UPGRADE_CONSTRAINTS (state, upgradeConstraints) {
    state.upgradeConstraints = upgradeConstraints;
  },
  SET_UPGRADE_NUMBER (state, payload) {
    state.upgrades[payload.upgradeID].number = payload.number;
  },
  SET_UPGRADES (state, upgrades) {
    state.upgrades = upgrades;

    for (var upgradeID in upgrades) {
      var upgrade = state.upgrades[upgradeID];

      Vue.set(upgrade, 'number', 0);
      Vue.set(upgrade, 'minMax', minMax(upgrade));
    }
  },
  SET_VERSION (state, version) {
    state.version = version;
  }
};

function minMax(troop) {
  var minMax;

  if (troop.elite) {
    minMax = 'elite'
  } else if (troop.armyMin || troop.armyMax) {
    if (troop.armyMin) {
      minMax = troop.armyMin;

      if (troop.armyMax && troop.armyMin !== troop.armyMax) {
        minMax += '–' + troop.armyMax;
      }
    } else {
      minMax = '0–' + troop.armyMax;
    }
  } else {
    minMax = (troop.min || '-') + '/' + (troop.max || '-');
  }

  return minMax;
}