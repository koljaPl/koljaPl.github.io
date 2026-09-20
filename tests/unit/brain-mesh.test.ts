import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("atlas exports six closed, consistently wound regions and supporting anatomy within budget", () => {
  const file = readFileSync(
    new URL("../../public/brain/atlas.glb", import.meta.url),
  );
  assert.ok(file.length < 750_000);
  assert.equal(file.readUInt32LE(0), 0x46546c67);
  const jsonLength = file.readUInt32LE(12);
  const gltf = JSON.parse(file.subarray(20, 20 + jsonLength).toString());
  const binaryStart = 28 + jsonLength;
  const read = (id: number): number[] => {
    const accessor = gltf.accessors[id];
    const view = gltf.bufferViews[accessor.bufferView];
    const start =
      binaryStart + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const count = accessor.count * (accessor.type === "VEC3" ? 3 : 1);
    return Array.from({ length: count }, (_, i) =>
      accessor.componentType === 5126
        ? file.readFloatLE(start + i * 4)
        : file.readUInt16LE(start + i * 2),
    );
  };
  assert.deepEqual(
    gltf.meshes.map((m: { name: string }) => m.name).sort(),
    [
      "frontal",
      "parietal",
      "temporal",
      "occipital",
      "cerebellum",
      "brainstem",
      "supporting-anatomy",
    ].sort(),
  );
  for (const mesh of gltf.meshes) {
    const p = mesh.primitives[0];
    const positions = read(p.attributes.POSITION);
    const normals = read(p.attributes.NORMAL);
    const indices = read(p.indices);
    assert.equal(positions.length, normals.length);
    assert.ok(positions.every(Number.isFinite));
    assert.ok(normals.every(Number.isFinite));
    const edges = new Map<number, { count: number; direction: number }>();
    const faces = new Set<string>();
    let volume = 0;
    for (let i = 0; i < normals.length; i += 3)
      assert.ok(
        Math.abs(
          Math.hypot(normals[i]!, normals[i + 1]!, normals[i + 2]!) - 1,
        ) < 0.01,
        `${mesh.name}: unit normals`,
      );
    for (let i = 0; i < indices.length; i += 3) {
      const triangle = indices.slice(i, i + 3);
      assert.equal(new Set(triangle).size, 3, `${mesh.name}: collapsed face`);
      assert.ok(triangle.every((n) => n * 3 < positions.length));
      const face = [...triangle].sort((a, b) => a - b).join(":");
      assert.ok(!faces.has(face), `${mesh.name}: duplicate face`);
      faces.add(face);
      for (let e = 0; e < 3; e++) {
        const a = triangle[e]!,
          b = triangle[(e + 1) % 3]!;
        const key = Math.min(a, b) * 65536 + Math.max(a, b);
        const edge = edges.get(key) ?? { count: 0, direction: 0 };
        edge.count++;
        edge.direction += a < b ? 1 : -1;
        edges.set(key, edge);
      }
      const [a, b, c] = triangle.map((n) =>
        positions.slice(n * 3, n * 3 + 3),
      ) as [number[], number[], number[]];
      const cross = [
        b[1]! * c[2]! - b[2]! * c[1]!,
        b[2]! * c[0]! - b[0]! * c[2]!,
        b[0]! * c[1]! - b[1]! * c[0]!,
      ];
      volume += a.reduce((sum, n, j) => sum + n * cross[j]!, 0) / 6;
    }
    assert.ok(volume > 0, `${mesh.name}: outward winding`);
    for (const edge of edges.values()) {
      assert.equal(edge.count, 2, `${mesh.name}: closed manifold edge`);
      assert.equal(edge.direction, 0, `${mesh.name}: consistent winding`);
    }
  }
});
