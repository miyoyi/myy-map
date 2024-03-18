<template>
  <div class="history">
    <span class="historyItem" @click="toWorld()">地球</span>
    <span class="historyItem" @click="historyClick()"> > 中华人民共和国</span>
    <span class="historyItem" v-if="data.codeList[1]" @click="historyClick(data.codeList[1])"> >
      {{ data.codeNameList[0] }}
    </span>
    <span class="historyItem" v-if="data.codeList.length > 2"
      @click="historyClick(data.codeList[data.codeList.length - 1])"> >
      {{ data.codeNameList[data.codeNameList.length - 1] }}
    </span>
  </div>
  <div id="map"></div>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { reactive, onMounted } from "vue";
import { useRouter } from 'vue-router';
import * as d3 from "d3";

const router = useRouter();

const data: any = reactive({
  code: 100000,
  codeList: [],
  codeNameList: []
})

const offsetXY = d3.geoMercator();

const toWorld = () => {
  router.replace({ name: 'world' });
}

const historyClick = (code?: number) => {
  if (code) {
    const idx = data.codeList.findIndex((item: number) => code === item)
    data.codeList = data.codeList.slice(0, idx)
    const url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
    init(url)
  } else {
    window.location.reload()
  }
}
const createMap = (data: { features: any[]; }, count: number) => {
  const map = new THREE.Object3D();
  const center = data.features[0].properties.centroid;
  offsetXY.center(center).translate([0, 0]);
  data.features.forEach((feature: { properties: { centroid: any; center: any; name: any; }; geometry: { coordinates: any; type: any; }; }) => {
    const unit = new THREE.Object3D();
    const { centroid, center, name } = feature.properties;
    const { coordinates, type } = feature.geometry;
    const point = centroid || center || [0, 0];

    const color = new THREE.Color(`hsl(
      ${365},
      ${Math.random() * 30 + 55}%,
      ${Math.random() * 30 + 55}%)`).getHex();
    const depth = count * Math.random() * 0.3;

    const label = createLabel(name, point, depth);

    coordinates.forEach((coordinate: any[]) => {
      const createGeo = (coordinate: any) => {
        unit.name = name;
        const mesh = createMesh(coordinate, color, depth);
        const line = createLine(coordinate, depth);
        unit.add(mesh, ...line);
      }
      if (type === "MultiPolygon") coordinate.forEach((item: any) => createGeo(item));
      if (type === "Polygon") createGeo(coordinate);

    });
    map.add(unit, label);
    setCenter(map);
  });
  return map;
};
const createMesh = (data: any[], color: number, depth: number) => {
  const shape = new THREE.Shape();
  data.forEach((item: any, idx: number) => {
    const [x, y]: any = offsetXY(item);

    if (idx === 0) shape.moveTo(x, -y);
    else shape.lineTo(x, -y);
  });

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };
  const materialSettings = {
    color: color,
    emissive: 0x000000,
    roughness: 0.45,
    metalness: 0.8,
    transparent: true,
    side: THREE.DoubleSide
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material: any = new THREE.MeshStandardMaterial(materialSettings);
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
};
const createLine = (data: any[], depth: number) => {
  const points: any = [];
  data.forEach((item: any) => {
    const [x, y]: any = offsetXY(item);
    points.push(new THREE.Vector3(x, -y, 0));
  });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const uplineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const downlineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const upLine: any = new THREE.Line(lineGeometry, uplineMaterial);
  const downLine: any = new THREE.Line(lineGeometry, downlineMaterial);
  downLine.position.z = -0.0001;
  upLine.position.z = depth + 0.0001;
  return [upLine, downLine];
};
const createLabel = (name: string | null, point: any, depth: number) => {
  const div = document.createElement("div");
  div.style.color = "#fff";
  div.style.fontSize = "12px";
  div.style.textShadow = "1px 1px 2px #047cd6";
  div.textContent = name;
  const label: any = new CSS2DObject(div);
  label.scale.set(0.01, 0.01, 0.01);
  const [x, y]: any = offsetXY(point);
  label.position.set(x, -y, depth);
  return label;
};
const setCenter = (map: any) => {
  map.rotation.x = -Math.PI / 2;
  const box = new THREE.Box3().setFromObject(map);
  const center = box.getCenter(new THREE.Vector3());

  const offset = [0, 0];
  map.position.x = map.position.x - center.x - offset[0];
  map.position.z = map.position.z - center.z - offset[1];
};
const init = (url: string, name?: string) => {
  const mapContainer: any = document.getElementById("map");
  mapContainer.replaceChildren();

  const regex = /\/(\d+)_full\.json$/;
  const match: any = url.match(regex);
  const count = match ? match[1].split("0").length : 0
  data.code = match ? match[1] : 100000
  if (!data.codeList.includes(data.code)) {
    data.codeList.push(data.code)
  }
  if (name) {
    data.codeNameList.push(name)
  }

  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(0xd4e7fd, 4);
  scene.add(ambientLight);
  const directionalLight: any = new THREE.DirectionalLight(0xe8eaeb, 0.2);
  directionalLight.position.set(0, 10, 5);
  const directionalLight2 = directionalLight.clone();
  directionalLight2.position.set(0, 10, -5);
  const directionalLight3 = directionalLight.clone();
  directionalLight3.position.set(5, 10, 0);
  const directionalLight4 = directionalLight.clone();
  directionalLight4.position.set(-5, 10, 0);
  scene.add(directionalLight);
  scene.add(directionalLight2);
  scene.add(directionalLight3);
  scene.add(directionalLight4);

  const camera: any = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, count * 4, count * 4);


  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  mapContainer.appendChild(labelRenderer.domElement);

  const renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  mapContainer.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };
  animate();
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  fetch(url)
    .then((res) => res.json())
    .then((params) => {
      params.features = params.features.filter((item: { properties: { name: any; }; }) => item.properties.name);
      const map = createMap(params, count);
      scene.add(map);

      let intersect = null;
      const mouseFilter = (event: MouseEvent) => {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        return raycaster
          .intersectObjects(map.children)
          .filter((item) => item.object.type !== "Line");
      }
      window.addEventListener("dblclick", (event) => {
        const intersects: any = mouseFilter(event)
        if (intersects[0]?.object?.type !== "Sprite") {
          const item = params.features.find((item: { properties: { name: any; }; }) => intersects[0]?.object.parent.name === item.properties.name)
          const name = item?.properties?.name
          const code = count > 4 ? item?.properties.adcode : +match[1]
          const url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
          if (code) {
            init(url, name)
          }
        }
      });
      window.addEventListener("pointerdown", (event) => {
        const intersects: any = mouseFilter(event)
        if (intersects.length > 0) {
          if (intersects[0].object.type === "Mesh") {
            if (intersect) isAplha(intersect, 1);
            intersect = intersects[0].object.parent;
            isAplha(intersect, 0.4);
          }
        } else {
          if (intersect) isAplha(intersect, 1);
        }
        function isAplha(intersect: any, opacity: number) {
          intersect.children.forEach((item: { type: string; material: { opacity: any; }; }) => {
            if (item.type === "Mesh") {
              item.material.opacity = opacity;
            }
          });
        }
      });
    });
}

onMounted(() => {
  const url = `https://geo.datav.aliyun.com/areas_v3/bound/${data.code}_full.json`
  init(url)
});
</script>

<style>
#map {
  background-color: #040D21;
}

.history {
  position: fixed;
  top: 50px;
  left: 50px;
  color: #fff;
  font-weight: bolder;
  font-size: 20px;
  z-index: 9999;
}

.historyItem {
  cursor: pointer;
}
</style>
