"""
Import N01 with ONLY Hormi* filter (preserve tubos and PL*).
Restores manual additions that were overwritten.
"""
import sqlite3
import re
from datetime import datetime

DB_PATH = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/prisma/dev.db"
FILEPATH = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/public/Part_List_N01.txt"
NIVEL_ID = 1
NIVEL_NAME = "N01"

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
    """Parse Tekla part list, return list of (parte, perfil, longitud, cantidad, peso)."""
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

        # ONLY filter Hormi* (preserve tubos and PL* for N01)
        if 'Hormi' in parte or 'Hormi' in perfil:
            continue

        try:
            cantidad = int(parts[2])
            longitud = float(parts[4])
            peso = float(parts[6])
        except (ValueError, IndexError):
            continue

        perfil_limpio = re.sub(r'[^\\x00-\\x7F]', '', perfil)
        if not perfil_limpio:
            continue

        elementos.append((parte, perfil_limpio, longitud, cantidad, peso))

    return elementos

def main():
    elementos = parse_tekla_file(FILEPATH)

    if not elementos:
        print(f"{NIVEL_NAME}: No valid elements found!")
        return

    peso_total = sum(e[3] * e[4] for e in elementos)
    print(f"{NIVEL_NAME}: {len(elementos)} elements, {peso_total:.1f} kg total")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing
    cursor.execute("DELETE FROM ActividadElemento WHERE elementoId IN (SELECT id FROM MetalElement WHERE nivelId = ?)", (NIVEL_ID,))
    cursor.execute("DELETE FROM MetalElement WHERE nivelId = ?", (NIVEL_ID,))

    # Insert elements
    inserted_ids = []
    for parte, perfil, longitud, cantidad, peso in elementos:
        peso_total_elem = peso * cantidad
        cursor.execute("""
            INSERT INTO MetalElement (parte, perfil, longitud, cantidad, peso, observaciones, nivelId, pesoTotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (parte, perfil, longitud, cantidad, peso, None, NIVEL_ID, peso_total_elem))
        inserted_ids.append(cursor.lastrowid)

    conn.commit()
    print(f"Inserted {len(inserted_ids)} elements")

    # Create activity records
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    for elem_id in inserted_ids:
        for tipo, orden in ACTIVITY_TYPES:
            cursor.execute("""
                INSERT INTO ActividadElemento (tipo, estado, elementoId, orden, datos, createdAt, updatedAt)
                VALUES (?, 'Pendiente', ?, ?, '{}', ?, ?)
            """, (tipo, elem_id, orden, now, now))

    conn.commit()
    conn.close()

    print(f"Created {len(inserted_ids) * 7} activity records")
    print(f"\n{NIVEL_NAME} restored with ONLY Hormi* filter (tubos and PL* preserved)")

if __name__ == "__main__":
    main()
