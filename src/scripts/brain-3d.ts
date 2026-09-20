import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  BackSide,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  brainInitialRotation,
  brainSelectionColors,
} from "../data/brain-renderer";
import type { BrainRegionId } from "../data/brain";
export interface BrainView {
  select(id: BrainRegionId | null): void;
  reset(): void;
  dispose(): void;
}
export async function createBrainView(
  host: HTMLElement,
  select: (id: BrainRegionId) => void,
  signal?: AbortSignal,
): Promise<BrainView> {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Interactive anatomical brain. Drag or use arrow keys to rotate; Home resets the view. Select regions with the named buttons below.",
  );
  const scene = new Scene(),
    camera = new OrthographicCamera(-1.6, 1.6, 1.35, -1.35, 0.1, 30);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);
  scene.add(new AmbientLight(0xffffff, 1.6));
  const key = new DirectionalLight(0xffffff, 2);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 1);
  fill.position.set(4, -1, -3);
  scene.add(fill);
  const group = new Group();
  scene.add(group);
  let disposed = false,
    visible = true,
    selected: BrainRegionId | null = null;
  const meshes: Mesh[] = [];
  const surfaces: Mesh[] = [];
  const seams: Mesh[] = [];
  let outline: Mesh | undefined;
  const makeOutline = (mesh: Mesh, thickness: number, opacity: number) => {
    const geometry = mesh.geometry.clone();
    const positions = geometry.getAttribute("position");
    const normals = geometry.getAttribute("normal");
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(
        i,
        positions.getX(i) + normals.getX(i) * thickness,
        positions.getY(i) + normals.getY(i) * thickness,
        positions.getZ(i) + normals.getZ(i) * thickness,
      );
    }
    return new Mesh(
      geometry,
      new MeshBasicMaterial({
        color: 0x37363e,
        side: BackSide,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
  };
  const render = () => {
    if (!disposed && visible && !document.hidden)
      renderer.render(scene, camera);
  };
  const theme = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    for (const mesh of surfaces) {
      const material = mesh.material as MeshStandardMaterial;
      material.color.set(
        mesh.name === selected
          ? brainSelectionColors[selected!]
          : mesh.name === "supporting-anatomy"
            ? dark
              ? "#a4a6aa"
              : "#b6b6b3"
            : dark
              ? "#b7b9bd"
              : "#c7c7c5",
      );
      material.roughness = 0.82;
    }
    render();
  };
  try {
    const response = await fetch("/brain/atlas.glb", {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(12000)])
        : AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Brain asset unavailable");
    const gltf = await new GLTFLoader().parseAsync(
      await response.arrayBuffer(),
      "/brain/",
    );
    gltf.scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = new MeshStandardMaterial({
          color: 0xc7c7c5,
          roughness: 0.82,
          metalness: 0,
        });
        surfaces.push(object);
        if (object.name in brainSelectionColors) meshes.push(object);
      }
    });
    if (meshes.length !== 6) throw new Error("Incomplete brain regions");
    for (const mesh of meshes) {
      const seam = makeOutline(mesh, 0.004, 0.45);
      mesh.add(seam);
      seams.push(seam);
    }
    group.add(gltf.scene);
    const bounds = new Box3().setFromObject(group),
      center = bounds.getCenter(new Vector3());
    gltf.scene.position.sub(center);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  host.append(canvas);
  const reset = () => {
    const { x, y, z } = brainInitialRotation;
    group.rotation.set(x, y, z);
    host.dataset.rotation = "0";
    render();
  };
  const resize = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const ratio = width / height;
    camera.left = -1.42 * ratio;
    camera.right = 1.42 * ratio;
    camera.top = 1.42;
    camera.bottom = -1.42;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false;
    render();
  });
  intersection.observe(host);
  const mutation = new MutationObserver(theme);
  mutation.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  document.addEventListener("visibilitychange", render);
  let down:
    | { x: number; y: number; lastX: number; lastY: number; dragged: boolean }
    | undefined;
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    down = {
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      dragged: false,
    };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!down) return;
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5)
      down.dragged = true;
    if (down.dragged) {
      group.rotation.y += (event.clientX - down.lastX) * 0.008;
      group.rotation.x += (event.clientY - down.lastY) * 0.008;
      host.dataset.rotation = "changed";
      render();
    }
    down.lastX = event.clientX;
    down.lastY = event.clientY;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (down && !down.dragged) {
      const rect = canvas.getBoundingClientRect();
      const ray = new Raycaster();
      ray.setFromCamera(
        new Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObjects(surfaces, false)[0];
      if (hit && hit.object.name in brainSelectionColors)
        select(hit.object.name as BrainRegionId);
    }
    down = undefined;
  });
  canvas.addEventListener("pointercancel", () => {
    down = undefined;
  });
  canvas.addEventListener("keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      reset();
      return;
    }
    const delta = 0.16;
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    group.rotation[
      event.key === "ArrowLeft" || event.key === "ArrowRight" ? "y" : "x"
    ] += event.key === "ArrowLeft" || event.key === "ArrowUp" ? -delta : delta;
    host.dataset.rotation = "changed";
    render();
  });
  const selectRegion = (id: BrainRegionId | null) => {
    selected = id;
    if (outline) {
      outline.parent?.remove(outline);
      (outline.material as MeshStandardMaterial).dispose();
      outline.geometry.dispose();
      outline = undefined;
    }
    const mesh = meshes.find((m) => m.name === id);
    if (mesh) {
      outline = makeOutline(mesh, 0.014, 0.85);
      mesh.add(outline);
    }
    host.dataset.selected = id ?? "";
    theme();
  };
  canvas.addEventListener("webglcontextlost", (event) => {
    if (disposed) return;
    event.preventDefault();
    host.dispatchEvent(new Event("brain-renderer-failed"));
  });
  reset();
  resize();
  theme();
  return {
    select: selectRegion,
    reset,
    dispose() {
      disposed = true;
      observer.disconnect();
      intersection.disconnect();
      mutation.disconnect();
      document.removeEventListener("visibilitychange", render);
      for (const mesh of [...surfaces, ...seams]) {
        mesh.geometry.dispose();
        (mesh.material as MeshStandardMaterial).dispose();
      }
      if (outline) {
        (outline.material as MeshBasicMaterial).dispose();
        outline.geometry.dispose();
      }
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
