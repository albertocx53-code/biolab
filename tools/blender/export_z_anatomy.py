# Export curated, license-filtered Z-Anatomy subsets to GLB (BioLab 3D).
import bpy, bmesh, json, re, sys, os
from mathutils import Vector
OUT = os.environ.get('OUT', './out'); os.makedirs(OUT, exist_ok=True)
ONLY = os.environ.get('ONLY')
dg = bpy.context.evaluated_depsgraph_get()
cols = {c.name.split(':')[0]: c for c in bpy.context.scene.collection.children if c.name[0].isdigit()}

# --- License exclusions (see MODEL_LICENSES.md) ---------------------------------
NONCOMMERCIAL = re.compile(r'^(Kidney|Renal pelvis)\b|cochle|vestibule|semicircular|labyrinth|utricle|saccule|ampulla|spiral organ', re.I)
# Brain parcellation meshes: provenance ("Brainder"/"White matter") has no stated licence -> excluded
BRAIN = re.compile(r'gyr|sulc|lobule|pole|Lat_Fis|cuneus|Insula|White matter|nucle|thalam|ventricle|commissure|Fornix|Hippocamp|Amygd|Caudate|Putamen|Globus|Lentiform|Corpus callosum|Septum pellucidum|Stria|Habenula|Optic tract|chiasm|geniculate|Mamillary|peduncle|Midbrain|Pons|Medulla|Olive|Pyramid|colliculus|Aqueduct|Interpeduncular|Choroid|Falx|Tentorium|cerebel|Vermis|Floccul|Hypothal|Cerebr|Septal nuclei|Temporal plane|Central canal|Sulcus|Declive|Culmen|Nodulus|Uvula of vermis|Tonsil of cerebellum', re.I)
HEART = re.compile(r'atrium|ventricle|leaflet|papillary|Pulmonary trunk', re.I)
OCCLUDERS = re.compile(r'^(Greater omentum|Lesser omentum|Mesocolon|Meso-appendix|Pleura)$|segment of liver')

VISC = [
 ('respiratorio', r'lung|Trachea|Epiglottis|bronch|laryn|Nasal cavity|Vocal|Vestibular fold|Pleura'),
 ('urinario', r'bladder|Ureter|Urethra'),
 ('reprodutor', r'Testis|Epididym|Seminal|Prostate|penis|Ductus deferens|Ejaculatory|Scrot|Bulbo-urethral|Spermatic'),
 ('endocrino', r'hypophysis|Thyroid gland|parathyroid|Suprarenal|Pineal'),
 ('digestorio', r'.'),
]
def classify_visc(n):
    for g, rx in VISC:
        if re.search(rx, n, re.I): return g

SYSTEMS = {
  # key: (collections, max polys per object, filter, group fn)
  'esqueletico':    (['1'], 2500, lambda n: True, lambda n: 'esqueletico'),
  'muscular':       (['4'], 1800, lambda n: True, lambda n: 'muscular'),
  'coracao':        (['5'], 3000, lambda n: bool(HEART.search(n)), lambda n: 'coracao'),
  'vasos':          (['5'], 900, lambda n: not HEART.search(n), lambda n: 'vasos'),
  'nervoso':        (['7'], 1500, lambda n: not BRAIN.search(n), lambda n: 'nervoso'),
  'visceral':       (['8'], 5000, lambda n: not OCCLUDERS.search(n), classify_visc),
  'linfatico':      (['6'], 1200, lambda n: True, lambda n: 'linfatico'),
  'tegumentar':     (['9'], 0, lambda n: True, lambda n: 'tegumentar'),
}

def slug(n):
    s = n.strip()
    side = ''
    m = re.search(r'\.(l|r)$', s)
    if m: side = '-' + ('esq' if m.group(1)=='l' else 'dir'); s = s[:-2]
    s = re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-').lower()
    return s + side

def eligible(o, filt):
    if o.type not in ('MESH','CURVE'): return False
    n = o.name
    if n.endswith(('.j','.g','.t')) or n.endswith("'"): return False
    if NONCOMMERCIAL.search(n): return False
    return filt(n)

def prepare_curves(objs):
    for o in objs:
        if o.type == 'CURVE':
            cu = o.data
            cu.bevel_resolution = min(cu.bevel_resolution, 2)
            cu.resolution_u = min(cu.resolution_u, 6)
    bpy.context.view_layer.update()

def mesh_of(o, dg):
    ev = o.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    return me, ev.matrix_world.copy()

def bounds_yup(me, mw):
    pts = [mw @ v.co for v in me.vertices]
    if not pts: return None
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (mn+mx)/2; s = mx-mn
    return [round(c.x,4), round(c.z,4), round(-c.y,4)], [round(s.x,4), round(s.z,4), round(s.y,4)]

manifest = {}
for key, (cids, cap, filt, grp) in SYSTEMS.items():
    if ONLY and key not in ONLY.split(','): continue
    srcs = [o for cid in cids for o in cols[cid].all_objects if eligible(o, filt)]
    prepare_curves(srcs)
    dg = bpy.context.evaluated_depsgraph_get()
    built = [(o,) + mesh_of(o, dg) for o in srcs]
    coll = bpy.data.collections.new('EXP_'+key); bpy.context.scene.collection.children.link(coll)
    for o in bpy.context.view_layer.objects: o.select_set(False)
    entries = []; used = set(); total = 0
    if key == 'tegumentar':
        bm = bmesh.new()
        for o, me, mw in built:
            if len(me.polygons) <= 1: continue
            me.transform(mw); bm.from_mesh(me); bpy.data.meshes.remove(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
        me = bpy.data.meshes.new('pele'); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new('pele', me); coll.objects.link(ob); ob.select_set(True)
        ob['za_name'] = 'Skin'; ob['grp'] = 'tegumentar'
        c, s = bounds_yup(me, ob.matrix_world)
        entries.append(dict(id='pele', za='Skin', group='tegumentar', mat='Skin', poly=len(me.polygons), c=c, s=s))
        total = len(me.polygons)
    else:
        for o, me, mw in built:
            n = len(me.polygons)
            if n <= 1: bpy.data.meshes.remove(me); continue
            sid = slug(o.name); base = sid; k = 2
            while sid in used: sid = f'{base}-{k}'; k += 1
            used.add(sid)
            ob = bpy.data.objects.new(sid, me); coll.objects.link(ob); ob.matrix_world = mw
            ob.select_set(True)
            mat = o.material_slots[0].material.name if o.material_slots and o.material_slots[0].material else ''
            g = grp(o.name)
            ob['za_name'] = o.name; ob['grp'] = g; ob['mat'] = mat
            if cap and n > cap:
                d = ob.modifiers.new('dec', 'DECIMATE'); d.ratio = max(cap / n, 0.02)
                n = int(n * d.ratio)
            total += n
            bb = bounds_yup(me, mw)
            entries.append(dict(id=sid, za=o.name, group=g, mat=mat, poly=n, c=bb[0], s=bb[1]))
    bpy.context.view_layer.update()
    path = os.path.join(OUT, key + '.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_extras=True,
        export_apply=True, export_materials='NONE', export_yup=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
        export_draco_position_quantization=14, export_draco_normal_quantization=8, export_animations=False)
    manifest[key] = entries
    print(f'## {key}: {len(entries)} objects, ~{total} polys, {os.path.getsize(path)/1e6:.2f} MB', flush=True)
    for o in list(coll.objects): bpy.data.objects.remove(o)
json.dump(manifest, open(os.path.join(OUT, 'manifest' + (('-'+ONLY.replace(',','_')) if ONLY else '') + '.json'), 'w'), ensure_ascii=False)
