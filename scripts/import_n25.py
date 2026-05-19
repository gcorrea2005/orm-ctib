"""
Import Part_List_N25_bajantes.txt into orm-ctib database.
- Only bajantes (b/ entries) - hormigon and columnas already filtered
- pesoTotal = peso * cantidad
- Inicializa 7 procesos (Planos a Montaje) por elemento
"""
import sqlite3
import re
from datetime import datetime

DB_PATH = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/prisma/dev.db"
FILE = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/public/Part_List_N25_bajantes.txt"
NIVEL_ID = 25
NIVEL_NAME = "N25"

# 7 activity types for TimelineBar
ACTIVITY_TYPES = [
    ("Planos", 1),
    ("Corte", 2),
    ("Armado", 3),
    ("Soldadura", 4),
    ("Sandblasting", 5),
    ("Pintura", 6),
    ("Montaje", 7),
]

def parse_tekla_file(filepath):
    elementos = []
    with open(filepath, 'r', encoding='latin-1') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or line.startswith('-') or line.startswith('TEKLA') or \
           line.startswith('CONTRACT') or line.startswith('PartPos') or \
           line.startswith('Total') or line.startswith('for'):
            continue

        parts = re.split(r'\s+', line)
        if len(parts) < 7:
            continue

        parte = parts[0]
        perfil = parts[1]

        # No filtering needed - file already has only bajantes
        # But still skip if somehow Hormi passed through
        if 'Hormi' in parte or 'Hormi' in perfil:
            continue

        try:
            cantidad = int(parts[2])
            longitud = float(parts[4])
            peso = float(parts[6])
        except (ValueError, IndexError):
            continue

        perfil_limpio = re.sub(r'[^\x00-\x7F]', '', perfil)
        if not perfil_limpio:
            continue

        elementos.append((parte, perfil_limpio, longitud, cantidad, peso))

    return elementos

def main():
    print(f"Importing {FILE} -> {NIVEL_NAME} (ID={NIVEL_ID})")
    print()

    elementos = parse_tekla_file(FILE)
    if not elementos:
        print("No valid elements found!")
        return

    peso_total = sum(e[3] * e[4] for e in elementos)
    print(f"Parsed: {len(elementos)} elements, {peso_total:.1f} kg total")
    print()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing
    cursor.execute("DELETE FROM ActividadElemento WHERE elementoId IN (SELECT id FROM MetalElement WHERE nivelId = ?)", (NIVEL_ID,))
    cursor.execute("DELETE FROM MetalElement WHERE nivelId = ?", (NIVEL_ID,))
    conn.commit()
    print("Cleared existing elements & activities")

    # Insert elements
    inserted_ids = []
    for parte, perfil, longitud, cantidad, peso in elementos:
        peso_total_elem = peso * cantidad  # <<< peso * cantidad
        cursor.execute("""
            INSERT INTO MetalElement (parte, perfil, longitud, cantidad, peso, observaciones, nivelId, pesoTotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (parte, perfil, longitud, cantidad, peso, None, NIVEL_ID, peso_total_elem))
        inserted_ids.append(cursor.lastrowid)

    conn.commit()
    print(f"Inserted {len(inserted_ids)} elements with pesoTotal = peso * cantidad")

    # Create actividades (init processes)
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    for elem_id in inserted_ids:
        for tipo, orden in ACTIVITY_TYPES:
            cursor.execute("""
                INSERT INTO ActividadElemento (tipo, estado, elementoId, orden, datos, createdAt, updatedAt)
                VALUES (?, 'Pendiente', ?, ?, '{}', ?, ?)
            """, (tipo, elem_id, orden, now, now))

    conn.commit()
    conn.close()
    print(f"Created {len(inserted_ids) * 7} activity records (Planos..Montaje)")
    print()
    print("=== Import Complete ===")

if __name__ == "__main__":
    main()
