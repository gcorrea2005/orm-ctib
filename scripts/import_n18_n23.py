"""
Import Tekla files N18-N23 into orm-ctib database.
Filters: Hormi* (concrete), tubos ([]*), platinas (PL*).
"""
import sqlite3
import re
from datetime import datetime

DB_PATH = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/prisma/dev.db"
BASE_PATH = "/mnt/c/Users/gcorrea/Desktop/myProg/orm-ctib-main/public"

FILES = [
    ("Part_List_N08.txt", 8, "N08"),
    ("Part_List_N09.txt", 9, "N09"),
    ("Part_List_N10.txt", 10, "N10"),
    ("Part_List_N11.txt", 11, "N11"),
    ("Part_List_N12.txt", 12, "N12"),
    ("Part_List_N13.txt", 13, "N13"),
    ("Part_List_N14.txt", 14, "N14"),
    ("Part_List_N01.txt", 1, "N01"),
    ("Part_List_N15.txt", 15, "N15"),
    ("Part_List_N16.txt", 16, "N16"),
    ("Part_List_N17.txt", 17, "N17"),
    ("Part_List_N18.txt", 18, "N18"),
    ("Part_List_N19.txt", 19, "N19"),
    ("Part_List_N20.txt", 20, "N20"),
    ("Part_List_N21.txt", 21, "N21"),
    ("Part_List_N22.txt", 22, "N22"),
    ("Part_List_N23.txt", 23, "N23"),
]

# 7 activity types for TimelineBar (sin INFO, Almacenamiento, limpieza; excluye 'entrega')
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
        # Skip headers, footers, separators
        if not line or line.startswith('-') or line.startswith('TEKLA') or \
           line.startswith('CONTRACT') or line.startswith('PartPos') or \
           line.startswith('Total') or line.startswith('for'):
            continue

        # Split by whitespace - should be 7 columns
        parts = re.split(r'\s+', line)
        if len(parts) < 7:
            continue

        parte = parts[0]
        perfil = parts[1]

        # Filter Hormi* (concrete), tubos ([]*), platinas (PL*)
        if 'Hormi' in parte or 'Hormi' in perfil:
            continue
        if perfil.startswith('[]') or perfil.startswith('PL'):
            continue

        try:
            cantidad = int(parts[2])
            longitud = float(parts[4])
            peso = float(parts[6])
        except (ValueError, IndexError):
            continue

        # Clean non-ASCII from perfil
        perfil_limpio = re.sub(r'[^\x00-\x7F]', '', perfil)
        if not perfil_limpio:
            continue

        elementos.append((parte, perfil_limpio, longitud, cantidad, peso))

    return elementos

def import_file(filename, nivel_id, nivel_name):
    """Import a single Tekla file into a Nivel."""
    filepath = f"{BASE_PATH}/{filename}"
    elementos = parse_tekla_file(filepath)

    if not elementos:
        print(f"  {nivel_name}: No valid elements found!")
        return 0

    peso_total = sum(e[3] * e[4] for e in elementos)
    print(f"  {nivel_name}: {len(elementos)} elements, {peso_total:.1f} kg total")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing — delete activities first, then elements
    cursor.execute("DELETE FROM ActividadElemento WHERE elementoId IN (SELECT id FROM MetalElement WHERE nivelId = ?)", (nivel_id,))
    cursor.execute("DELETE FROM MetalElement WHERE nivelId = ?", (nivel_id,))

    # Insert elements
    inserted_ids = []
    for parte, perfil, longitud, cantidad, peso in elementos:
        peso_total_elem = peso * cantidad
        cursor.execute("""
            INSERT INTO MetalElement (parte, perfil, longitud, cantidad, peso, observaciones, nivelId, pesoTotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (parte, perfil, longitud, cantidad, peso, None, nivel_id, peso_total_elem))
        inserted_ids.append(cursor.lastrowid)

    conn.commit()
    print(f"  Inserted {len(inserted_ids)} elements")

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

    print(f"  Created {len(inserted_ids) * 9} activity records")
    return len(inserted_ids)

def main():
    total_elements = 0
    for filename, nivel_id, nivel_name in FILES:
        print(f"Processing {filename} -> {nivel_name} (ID={nivel_id})")
        count = import_file(filename, nivel_id, nivel_name)
        total_elements += count
        print()

    print(f"=== Import Complete ===")
    print(f"Total elements imported: {total_elements}")

if __name__ == "__main__":
    main()
