import fs from 'node:fs';
import path from 'node:path';

const csvPath = path.join(process.cwd(), 'jugadores.csv');
const sqlOutputPath = path.join(process.cwd(), 'scratch/insert-players.sql');

const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);

let sqlContent = `--- SQL script to clear and re-populate the jugadores table
DELETE FROM jugadores;

`;

const players = [];

lines.forEach((line, idx) => {
  const cols = line.split(',');
  
  // 1. Extract team code
  const teamField = cols[0];
  const teamMatch = teamField.match(/\(([A-Z]{3})\)/);
  if (!teamMatch) {
    throw new Error(`Line ${idx + 1}: Could not parse team code from "${teamField}"`);
  }
  let equipoId = teamMatch[1];
  if (equipoId === 'CUW') {
    equipoId = 'CUR'; // Map to DB code for Curazao
  }

  // 2. Position
  const posicion = cols[2]?.trim() || null;

  // 3. Name (4th field)
  const nombre = cols[3]?.trim();
  if (!nombre) {
    throw new Error(`Line ${idx + 1}: Empty player name`);
  }

  // 4. Find date index
  let d = -1;
  cols.forEach((col, colIdx) => {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(col.trim())) {
      d = colIdx;
    }
  });

  if (d === -1) {
    throw new Error(`Line ${idx + 1}: Date not found in cols: ${line}`);
  }

  // 5. Parse Date
  const dateStr = cols[d].trim();
  const dateParts = dateStr.split('/');
  const day = dateParts[0].padStart(2, '0');
  const month = dateParts[1].padStart(2, '0');
  const year = dateParts[2];
  const fechaNacimiento = `${year}-${month}-${day}`;

  // 6. Club (d + 1)
  const club = cols[d + 1]?.trim() || null;

  // 7. Estatura (d + 2)
  const heightStr = cols[d + 2]?.trim();
  let estatura = null;
  if (heightStr) {
    const parsedHeight = parseInt(heightStr, 10);
    if (!isNaN(parsedHeight)) {
      estatura = parsedHeight;
    }
  }

  players.push({
    equipoId,
    nombre,
    posicion,
    fechaNacimiento,
    club,
    estatura
  });
});

console.log(`Successfully parsed ${players.length} players.`);

// Helper to escape SQL string values
function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

// Chunk size for inserts
const chunkSize = 200;
for (let i = 0; i < players.length; i += chunkSize) {
  const chunk = players.slice(i, i + chunkSize);
  
  sqlContent += `INSERT INTO jugadores (equipo_id, nombre, posicion, fecha_nacimiento, club, estatura) VALUES\n`;
  
  const valuesLines = chunk.map(p => {
    return `  (${escapeSql(p.equipoId)}, ${escapeSql(p.nombre)}, ${escapeSql(p.posicion)}, ${escapeSql(p.fechaNacimiento)}, ${escapeSql(p.club)}, ${p.estatura === null ? 'NULL' : p.estatura})`;
  });

  sqlContent += valuesLines.join(',\n') + ';\n\n';
}

fs.writeFileSync(sqlOutputPath, sqlContent, 'utf8');
console.log(`Generated SQL script at ${sqlOutputPath}`);
