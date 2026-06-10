import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Read .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const csvPath = path.join(process.cwd(), 'jugadores.csv');
// Read file and replace null bytes from raw file text first
const rawText = fs.readFileSync(csvPath, 'utf8');
const cleanedText = rawText.replace(/\u0000/g, ''); // strip all null bytes

const lines = cleanedText.split('\n').filter(Boolean);

const players = [];

lines.forEach((line, idx) => {
  const cols = line.split(',');
  
  const teamField = cols[0];
  const teamMatch = teamField.match(/\(([A-Z]{3})\)/);
  if (!teamMatch) {
    throw new Error(`Line ${idx + 1}: Could not parse team code from "${teamField}"`);
  }
  let equipoId = teamMatch[1];
  if (equipoId === 'CUW') {
    equipoId = 'CUR';
  }

  const posicion = cols[2]?.trim() || null;
  const nombre = cols[3]?.trim();
  if (!nombre) {
    throw new Error(`Line ${idx + 1}: Empty player name`);
  }

  let d = -1;
  cols.forEach((col, colIdx) => {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(col.trim())) {
      d = colIdx;
    }
  });

  if (d === -1) {
    throw new Error(`Line ${idx + 1}: Date not found in cols: ${line}`);
  }

  const dateStr = cols[d].trim();
  const dateParts = dateStr.split('/');
  const day = dateParts[0].padStart(2, '0');
  const month = dateParts[1].padStart(2, '0');
  const year = dateParts[2];
  const fechaNacimiento = `${year}-${month}-${day}`;

  const club = cols[d + 1]?.trim() || null;

  const heightStr = cols[d + 2]?.trim();
  let estatura = null;
  if (heightStr) {
    const parsedHeight = parseInt(heightStr, 10);
    if (!isNaN(parsedHeight)) {
      estatura = parsedHeight;
    }
  }

  players.push({
    equipo_id: equipoId,
    nombre,
    posicion,
    fecha_nacimiento: fechaNacimiento,
    club,
    estatura
  });
});

async function run() {
  console.log(`Parsed ${players.length} players from CSV.`);
  
  console.log("Deleting existing players from database...");
  const { error: deleteError } = await supabase.from('jugadores').delete().neq('nombre', '');
  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`);
  }
  console.log("Existing players deleted successfully.");

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize);
    console.log(`Inserting batch ${i / batchSize + 1}...`);
    const { error: insertError } = await supabase.from('jugadores').insert(batch);
    if (insertError) {
      throw new Error(`Insert failed at batch starting at index ${i}: ${insertError.message}`);
    }
  }
  
  console.log("All players imported successfully!");
}

run().catch(err => {
  console.error("Error during import:", err);
  process.exit(1);
});
