import { format } from 'date-fns';
import { doesTeamExist, addMatchToDatabase } from './database.js';

/**
 * Match object with the names and scores for the two teams that participated in the match.
 * @typedef {object} Match
 * @property {number} id - id of the match
 * @property {string} date - date of which the match was played, in ISO 8601 form (e.g. 2024-01-01T00:00:00.000Z)
 * @property {number} home - the id of the home team
 * @property {number} away - the id of the away team
 * @property {number} home_score
 * @property {number} away_score
 * @property {string} home_team - the name of the home team
 * @property {string} away_team - the name of the away team
 */

/**
 * @typedef {object} TeamStanding
 * @property {string} name - the name of the team
 * @property {number} score - the score of the team
 */

/**
 * calculates the scores that each eam should get based on the outcome of the match.
 * 3 scores for winning, 1 score for a tie, and 0 for loosing.
 * @param {Match} match
 * @returns {number[]} list of length 2, with the score each team will get for the match
 */
function calculateScores(match){
  if (match.home_score > match.away_score) return [3,0];
  if (match.home_score < match.away_score) return [0,3];
  return [1,1];
}

/**
 * gets in a list of type GameFile and calculates the score for each team
 * @returns {TeamStanding[]} ordered list of teamstandings
 */
export function calculateStandings(matches) {
  const teams = [];

  for(const match of matches){
    const scores = calculateScores(match); // scores to add to home team and away team

    if(teams.filter(e => e.name === match.home_team).length === 0){ // if the home team is not in teams list
      const newTeamStanding = {name: match.home_team, score: scores[0]};
      teams.push(newTeamStanding);
    }else if (scores[0] > 0){ // home team already exists in the list and there is score to add to the team
      const homeTeam = teams.find(team => team.name === match.home_team);
      if(homeTeam) homeTeam.score += scores[0];
      else console.warn('ERROR: did not find home team');
    }

    if(teams.filter(e => e.name === match.away_team).length === 0){ // if the away team is not in teams list
      const newTeamStanding = {name: match.away_team, score: scores[1]};
      teams.push(newTeamStanding)
    }else if (scores[1] > 0){ // away team already exists in the list and there is score to add to the team
      const awayTeam = teams.find(team => team.name === match.away_team);
      if(awayTeam) awayTeam.score += scores[1];
      else console.warn('ERROR: did not find away team');
    }
  }

  return teams.sort((a,b) => b.score - a.score);
}

/**
 * gets in a list of matches and does the following to each match in the list:
 *     - orders them by date (oldest first)
 *     - changes the date to the correct format
 * it then returns the list
 * @param {*} matches
 * @returns matches, ordered by date and with correct date format
 */
export function getMatches(matches){
  matches.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  for(const match of matches){
    const d = new Date(match.date);
    const formattedDate = format(d, 'dd/MM/yyyy HH:mm:ss');
    match.date = formattedDate;
  }

  return matches;
}

/**
 * @param {Date} date
 * @returns {string} returns the date as a string in the form of: yyyy-mm-dd hh:mm:ss
 */
function formatDate(date){
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


/**
 * Adds a new match to the database if the input is valid.
 * @param {*} date
 * @param {*} home
 * @param {*} away
 * @param {*} homeScore
 * @param {*} awayScore
 * @returns an error message if the input is invalid, returns nothing otherwise
 */
export async function addMatch(date, home, away, homeScore, awayScore){
  const dateTime = new Date(date);
  const dateNow = new Date();
  if(!date){
    return 'Þú verður að velja dagsetningu';
  }
  if (dateTime > dateNow){
    return 'Dagsetningin getur ekki verið í framtíðinni';
  }

  const twoMonthsAgo = new Date(dateNow.setMonth(dateNow.getMonth() - 2));
  if (dateTime < twoMonthsAgo){
    return 'Dagsetningin getur ekki verið eldri en tveir mánuðir';
  }

  if (!await doesTeamExist(home)) return 'Heimalið er ekki til';
  if (!await doesTeamExist(away)) return 'Útilið er ekki til';

  const homeNum = Number(homeScore);
  const awayNum = Number(awayScore);
  if(!Number.isInteger(homeNum) || !Number.isInteger(awayNum) || homeNum < 0 || awayNum < 0){
    return 'Stig liðanna verða að vera jákvæð heiltala eða 0';
  }

  const errorMessage = addMatchToDatabase(formatDate(dateTime), home, away, homeScore, awayScore);
  if(errorMessage) return errorMessage;
}

