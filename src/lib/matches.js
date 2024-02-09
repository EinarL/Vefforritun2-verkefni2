import { format } from 'date-fns';

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
