/*  Diplomacy 5 Battle Calculator,
--  Version - v1.0
--  Code Developer:	Cathal O'Connor
--
--  
--  File: BattleCalculator.gs
--  Last Updated: 2024-08-23 v1.0
*/

//Spreadsheet Info Global
var ss = SpreadsheetApp.getActiveSpreadsheet();
var inputSheet = ss.getSheetByName('Battle Calculator'); //Location of Selected Ships
var outputSheet = ss.getSheetByName('Battle Results'); //Where to place the reslts
var shipTable = ss.getSheetByName('Ship Tracker'); //Tracker of all Ship Values
var shipDataRange = shipTable.getRange('A2:Z200'); //Table location of Ship data
var data = shipDataRange.getValues();

//Main Function Call
function calculateBattle() {
  // Clear previous results
  outputSheet.getRange('F7:F').clearContent();
  outputSheet.getRange('K7:K').clearContent();

  var leftSideAttack = inputSheet.getRange('R9').getValue();
  var rightSideAttack = inputSheet.getRange('S9').getValue();

  var leftHits = calcHits(leftSideAttack);
  var rightHits = calcHits(rightSideAttack);

  var leftShips = filterAndSortShips(inputSheet.getRange('I4:K'));
  var rightShips = filterAndSortShips(inputSheet.getRange('M4:O'));

  var leftOutputShipStartRow = 7;
  var rightOutputShipStartRow = 7;

  // Process left ships
  processShips(leftShips, rightHits.hits, leftOutputShipStartRow, 6);

  // Process right ships
  processShips(rightShips, leftHits.hits, rightOutputShipStartRow, 11);

  outputSheet.getRange('F2').setValue(leftHits.hits);
  outputSheet.getRange('F3').setValue(leftHits.misses);
  outputSheet.getRange('F4').setValue(leftHits.attackArray.join(', '));

  outputSheet.getRange('K2').setValue(rightHits.hits);
  outputSheet.getRange('K3').setValue(rightHits.misses);
  outputSheet.getRange('K4').setValue(rightHits.attackArray.join(', '));
}

function processShips(ships, hits, startRow, healthColumn) {
  var remainingHits = hits;
  var shipNum = 0;

  while (shipNum < ships.length) {
    var ship = ships[shipNum];
    var shipHealth = ship[1]; // Assuming ship health second column

    // Calculate remaining health after applying hits
    var newHealth;
    if (remainingHits > 0) {
      newHealth = Math.max(shipHealth - remainingHits, 0);
      remainingHits -= (shipHealth - newHealth); // Reduce remaining hits by the amount of health reduced
    } else {
      newHealth = shipHealth; // No hits left, so health remains the same
    }

    // Output the remaining health to the spreadsheet
    outputSheet.getRange(startRow + shipNum, healthColumn).setValue(newHealth);

    shipNum++;
  }
}

function calcHits(attacks) {
  var attackArray = [];
  var hits = 0;
  var misses = 0;

  // Convert the number to a string and split into integer and decimal parts
  var parts = attacks.toString().split('.');
  var integerPart = parseInt(parts[0], 10);
  var decimalPart = parts[1] || '00';  // Default to '00' if no decimal part exists
  var tenthsPart = parseInt(decimalPart.substring(0, 1), 10);
  var hundredthsPart = parseInt(decimalPart.substring(1, 2), 10);
  
  // Handle the integer part of the attacks
  for (var i = 0; i < integerPart; i++) {
    var result = diceRoll();
    attackArray.push(result);
    if (result === "Hit") {
      hits++;
    } else {
      misses++;
    }
  }

  // Tenths place
  attackArray.push("Start of Tenths Attacks")
  for (var i = 0; i < tenthsPart; i++) {
    var result = diceRoll();
    attackArray.push(result);
    if (result === "Hit") {
      hits += 0.1;
    } else {
      misses += 0.1;
    }
  }

  // Hundredths place
  attackArray.push("Start of Hundredths Attacks")
  for (var i = 0; i < hundredthsPart; i++) {
    var result = diceRoll();
    attackArray.push(result);
    if (result === "Hit") {
      hits += 0.01;
    } else {
      misses += 0.01;
    }
  }

  return {
    hits: roundTo(hits, 2), // Round to account for errors in floating point arithmetic
    misses: roundTo(misses, 2), // Round to account for errors in floating point arithmetic
    attackArray: attackArray
  };
}

function filterAndSortShips(range) {
  // Get the values from the provided range
  var allShips = range.getValues();

  // Filter out rows where the first column is empty
  var filteredShips = allShips.filter(function(row) {
    return row[0]; // row[0] corresponds to the first column of the provided range
  });

  // Sort the remaining rows by the last column of the provided range
  filteredShips.sort(function(a, b) {
    return a[2] - b[2];
  });

  return filteredShips;
}

function diceRoll() {
  return Math.random() < 0.5 ? "Miss" : "Hit";
}

function roundTo(num, precision) {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}
