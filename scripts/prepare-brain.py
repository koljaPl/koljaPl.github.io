"""Reconstruct closed regional solids from the pinned SPL/NAC atlas.

Build-only: vtk 9.6.0, numpy 2.4.3, scipy 1.17.1, pymeshlab 2025.7.post1. No downloaded code executes.
Each source surface is rasterized independently before union, avoiding overlapping
internal faces. A submillimetre grid preserves folds; a light scalar smoothing
removes ambiguous voxel contacts. Topology is preserved during simplification.
"""
import concurrent.futures
import json
import pathlib
import struct
import urllib.parse
import urllib.request

import numpy as np
from scipy.ndimage import gaussian_filter
import vtk
import pymeshlab
from vtk.util.numpy_support import numpy_to_vtk, vtk_to_numpy

ROOT = pathlib.Path("artifacts/research")
ROOT.mkdir(parents=True, exist_ok=True)
REVISION = "bec24db25aad5f7600e2df3becfb1f883e61ff56"
BASE = f"https://raw.githubusercontent.com/mhalle/spl-brain-atlas/{REVISION}/slicer/"
OUT = pathlib.Path("public/brain")
OUT.mkdir(exist_ok=True)
structure = ROOT / "atlas-structure.json"
if not structure.exists():
    structure.write_bytes(urllib.request.urlopen(BASE + "atlasStructure.json", timeout=60).read())
objects = json.loads(structure.read_text())
index = {o["@id"]: o for o in objects}


def sources(key, seen=None):
    seen = set() if seen is None else seen
    if key in seen:
        return set()
    seen.add(key)
    obj = index.get(key, {})
    result = set()
    if obj.get("@type") == "DataSource" and obj.get("source", "").endswith(".vtk"):
        result.add(obj["source"])
    for member in obj.get("member", []):
        result |= sources(member, seen)
    for selector in obj.get("sourceSelector", []):
        if "GeometrySelector" in selector.get("@type", []):
            result |= sources(selector.get("dataSource", ""), seen)
    return result


regions = {r: set().union(*(sources(f"#{side}_{r}_lobe") for side in ["left", "right"]))
           for r in ["frontal", "parietal", "temporal", "occipital"]}
regions["cerebellum"] = sources("#cerebellum")
regions["brainstem"] = set().union(*(sources("#" + k) for k in ["pons", "medulla_oblongata", "part_of_midbrain"]))
for name in regions:
    regions[name] = {p for p in regions[name] if not any(word in p.lower() for word in
                     ["sulcus", "white_matter", "nucleus", "nuclei", "claustrum"])}
# Supporting anatomy stays unlabelled/unselectable: do not assign insula or medial
# structures to a lobe simply to fill a gap in this six-region educational view.
regions["supporting-anatomy"] = {o["source"] for o in objects
    if o.get("source", "").endswith(".vtk") and any(word in o["source"] for word in
    ["white_matter", "_insula.vtk", "limen_insulae", "cingulate_gyrus", "corpus_callosum"])}
folder = ROOT / "atlas-models"
folder.mkdir(exist_ok=True)


def fetch(path):
    destination = folder / pathlib.Path(path).name
    if not destination.exists():
        destination.write_bytes(urllib.request.urlopen(BASE + urllib.parse.quote(path), timeout=60).read())


with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    list(executor.map(fetch, sorted(set().union(*regions.values()))))

SPACING = 0.65  # millimetres in atlas RAS coordinates
TARGETS = dict(frontal=6500, parietal=4800, temporal=5500, occipital=3500,
               cerebellum=6500, brainstem=1400, **{"supporting-anatomy": 6000})


def topology(poly):
    triangles = vtk_to_numpy(poly.GetPolys().GetConnectivityArray()).reshape(-1, 3)
    edges = np.sort(np.concatenate([triangles[:, [0, 1]], triangles[:, [1, 2]], triangles[:, [2, 0]]]), axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    return int(np.count_nonzero(counts == 1)), int(np.count_nonzero(counts > 2))


def reconstruct(paths, target):
    surfaces = []
    for path in sorted(paths):
        reader = vtk.vtkPolyDataReader()
        reader.SetFileName(str(folder / pathlib.Path(path).name))
        reader.Update()
        surfaces.append(reader.GetOutput())
    bounds = np.array([surface.GetBounds() for surface in surfaces])
    origin = np.floor(bounds[:, [0, 2, 4]].min(axis=0) / SPACING) * SPACING - 3 * SPACING
    maximum = bounds[:, [1, 3, 5]].max(axis=0) + 3 * SPACING
    dims = np.ceil((maximum - origin) / SPACING).astype(int) + 1
    volume = np.zeros(tuple(dims[::-1]), dtype=np.uint8)
    # Independent stencils OR together, rather than interpreting intersecting
    # source shells as a single surface with contradictory inside/outside signs.
    for surface in surfaces:
        b = np.array(surface.GetBounds()).reshape(3, 2)
        low = np.maximum(0, np.floor((b[:, 0] - origin) / SPACING).astype(int) - 1)
        high = np.minimum(dims - 1, np.ceil((b[:, 1] - origin) / SPACING).astype(int) + 1)
        extent = tuple(int(n) for pair in zip(low, high) for n in pair)
        stencil = vtk.vtkPolyDataToImageStencil()
        stencil.SetInputData(surface)
        stencil.SetOutputOrigin(*origin)
        stencil.SetOutputSpacing(SPACING, SPACING, SPACING)
        stencil.SetOutputWholeExtent(*extent)
        image = vtk.vtkImageStencilToImage()
        image.SetInputConnection(stencil.GetOutputPort())
        image.SetInsideValue(1)
        image.SetOutsideValue(0)
        image.SetOutputScalarTypeToUnsignedChar()
        image.Update()
        local = vtk_to_numpy(image.GetOutput().GetPointData().GetScalars()).reshape(tuple((high - low + 1)[::-1]))
        volume[low[2]:high[2]+1, low[1]:high[1]+1, low[0]:high[0]+1] |= local
    field = gaussian_filter(volume.astype(np.float32), sigma=0.7)
    image = vtk.vtkImageData()
    image.SetDimensions(*(int(n) for n in dims))
    image.SetOrigin(*origin)
    image.SetSpacing(SPACING, SPACING, SPACING)
    image.GetPointData().SetScalars(numpy_to_vtk(field.ravel(), deep=True))
    contour = vtk.vtkFlyingEdges3D()
    contour.SetInputData(image)
    contour.SetValue(0, 0.5001)
    contour.ComputeNormalsOff()
    contour.Update()
    raw = contour.GetOutput()
    meshset = pymeshlab.MeshSet()
    meshset.add_mesh(pymeshlab.Mesh(
        vertex_matrix=vtk_to_numpy(raw.GetPoints().GetData()).astype(np.float64),
        face_matrix=vtk_to_numpy(raw.GetPolys().GetConnectivityArray()).reshape(-1, 3)))
    meshset.meshing_decimation_quadric_edge_collapse(
        targetfacenum=target, preservetopology=True, preserveboundary=True,
        preservenormal=True, optimalplacement=True, autoclean=True)
    reduced = meshset.current_mesh()
    reduced_poly = vtk.vtkPolyData()
    points = vtk.vtkPoints()
    points.SetData(numpy_to_vtk(reduced.vertex_matrix(), deep=True))
    reduced_poly.SetPoints(points)
    triangles = vtk.vtkCellArray()
    triangles.SetData(numpy_to_vtk(np.arange(0, reduced.face_number()*3+1, 3, dtype=np.int64), deep=True),
                      numpy_to_vtk(reduced.face_matrix().ravel().astype(np.int64), deep=True))
    reduced_poly.SetPolys(triangles)
    smooth = vtk.vtkWindowedSincPolyDataFilter()
    smooth.SetInputData(reduced_poly)
    smooth.SetNumberOfIterations(8)
    smooth.SetPassBand(0.15)
    smooth.BoundarySmoothingOff()
    smooth.NormalizeCoordinatesOn()
    normals = vtk.vtkPolyDataNormals()
    normals.SetInputConnection(smooth.GetOutputPort())
    normals.SplittingOff()
    normals.ConsistencyOn()
    normals.AutoOrientNormalsOn()
    normals.Update()
    poly = normals.GetOutput()
    boundary, nonmanifold = topology(poly)
    if boundary or nonmanifold:
        raise ValueError(f"Invalid repaired topology: {boundary} open, {nonmanifold} non-manifold edges")
    positions = vtk_to_numpy(poly.GetPoints().GetData()).astype("<f4")
    normal_array = vtk_to_numpy(poly.GetPointData().GetNormals()).astype("<f4")
    indices = vtk_to_numpy(poly.GetPolys().GetConnectivityArray()).reshape(-1, 3)
    if len(positions) > 65535 or not np.isfinite(positions).all():
        raise ValueError("Invalid or oversized mesh")
    return positions, normal_array, indices.astype("<u2")


parts = []
report = {}
for name, paths in regions.items():
    pos, norm, cells = reconstruct(paths, TARGETS[name])
    parts.append((name, pos, norm, cells))
    report[name] = {"vertices": len(pos), "triangles": len(cells), "boundaryEdges": 0, "nonManifoldEdges": 0}
    print(name, report[name], flush=True)

all_positions = np.concatenate([part[1] for part in parts])
center = (all_positions.max(axis=0) + all_positions.min(axis=0)) / 2
scale = 2.5 / (all_positions.max(axis=0) - all_positions.min(axis=0)).max()
gltf = {"asset": {"version": "2.0", "generator": "SPL/NAC closed regional reconstruction; 3D Slicer license"},
        "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [], "buffers": [], "bufferViews": [], "accessors": []}
blob = bytearray()


def accessor(array, kind, component):
    while len(blob) % 4:
        blob.extend(b"\0")
    offset = len(blob)
    blob.extend(array.tobytes())
    view = len(gltf["bufferViews"])
    gltf["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": array.nbytes})
    data = {"bufferView": view, "componentType": component, "count": len(array), "type": kind}
    if kind == "VEC3":
        data.update(min=array.min(axis=0).tolist(), max=array.max(axis=0).tolist())
    gltf["accessors"].append(data)
    return len(gltf["accessors"]) - 1


for name, pos, norm, cells in parts:
    pos = (pos - center) * scale
    pos = np.column_stack([-pos[:, 1], pos[:, 2], -pos[:, 0]]).astype("<f4")
    norm = np.column_stack([-norm[:, 1], norm[:, 2], -norm[:, 0]]).astype("<f4")
    primitive = {"attributes": {"POSITION": accessor(pos, "VEC3", 5126), "NORMAL": accessor(norm, "VEC3", 5126)},
                 "indices": accessor(cells.flatten(), "SCALAR", 5123)}
    i = len(gltf["meshes"])
    gltf["meshes"].append({"name": name, "primitives": [primitive]})
    gltf["nodes"].append({"name": name, "mesh": i, "extras": {"selectable": name != "supporting-anatomy"}})
    gltf["scenes"][0]["nodes"].append(i)
while len(blob) % 4:
    blob.extend(b"\0")
gltf["buffers"] = [{"byteLength": len(blob)}]
js = json.dumps(gltf, separators=(",", ":")).encode()
js += b" " * ((-len(js)) % 4)
data = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(blob), 0x004E4942) + blob
if len(data) >= 750_000:
    raise ValueError(f"Model exceeds budget: {len(data)}")
(OUT / "atlas.glb").write_bytes(data)
(OUT / "region-mapping.json").write_text(json.dumps({k: sorted(v) for k, v in regions.items()}, indent=2) + "\n")
(ROOT / "brain-topology.json").write_text(json.dumps(report, indent=2) + "\n")
print("GLB bytes", len(data), flush=True)
