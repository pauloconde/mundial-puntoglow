const fs = require('fs');

const readCsv = (filename) => {
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    return headers.reduce((acc, header, index) => {
      acc[header.trim()] = values[index] ? values[index].trim() : '';
      return acc;
    }, {});
  });
};

const cities = readCsv('cities.csv').reduce((acc, c) => {
  let name = c.city_name;
  if (name === 'Mexico City') name = 'Ciudad de México';
  if (name === 'New York/New Jersey') name = 'Nueva York/Nueva Jersey';
  if (name === 'San Francisco Bay Area') name = 'Área de la Bahía de San Francisco';
  acc[c.id] = name;
  return acc;
}, {});

const stagesMap = {
  'Group Stage': 'Fase de Grupos',
  'Round of 32': 'Dieciséisavos de Final',
  'Round of 16': 'Octavos de Final',
  'Quarterfinals': 'Cuartos de Final',
  'Semifinals': 'Semifinales',
  'Third Place Playoff': 'Tercer Puesto',
  'Final': 'Final'
};

const stages = readCsv('stages.csv').reduce((acc, s) => {
  acc[s.id] = stagesMap[s.stage_name] || s.stage_name;
  return acc;
}, {});

const teams = readCsv('teams.csv').reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

const matchesCsv = readCsv('matches.csv');

const matches = matchesCsv.map(m => {
  const num = parseInt(m.match_number, 10);
  const round = stages[m.stage_id] || '';
  
  let date = '';
  let time = '';
  if (m.kickoff_at) {
    const [dPart, tPart] = m.kickoff_at.split(' ');
    const [day, month, year] = dPart.split('/');
    const fullYear = `20${year}`;
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    date = `${fullYear}-${paddedMonth}-${paddedDay}`;
    time = tPart;
  }
  
  let team1 = '';
  let team2 = '';
  let group = '';
  
  if (m.home_team_id && teams[m.home_team_id]) {
    team1 = teams[m.home_team_id].fifa_code;
    group = `Grupo ${teams[m.home_team_id].group_letter}`;
  }
  
  if (m.away_team_id && teams[m.away_team_id]) {
    team2 = teams[m.away_team_id].fifa_code;
  }
  
  if (!team1 && !team2) {
    const labelParts = m.match_label.split(' vs ');
    if (labelParts.length === 2) {
      team1 = labelParts[0];
      team2 = labelParts[1];
    } else {
      team1 = m.match_label;
    }
  }

  const ground = cities[m.city_id] || '';

  const matchObj = {
    num,
    round,
    date,
    time,
    team1,
    team2
  };
  
  if (group) {
    matchObj.group = group;
  }
  
  matchObj.ground = ground;

  return matchObj;
});

const output = {
  name: "FIFA World Cup 2026",
  matches
};

fs.writeFileSync('worldcup2026.json', JSON.stringify(output, null, 2));
console.log('worldcup2026.json created successfully.');
