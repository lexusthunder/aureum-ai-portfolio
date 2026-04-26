import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ============== CONSTANTS ==============
const TILE = 12;
const GRID = 48;
const ROAD_W = TILE * 2;
const BUILDING_MIN_H = 8;
const BUILDING_MAX_H = 55;

// ============== CITY GENERATOR ==============
function generateCityData() {
  const roads = [];
  const hRoads = [4,10,16,22,28,34,40];
  const vRoads = [4,12,20,28,36,44];
  hRoads.forEach(r => roads.push({ type: "h", pos: r }));
  vRoads.forEach(c => roads.push({ type: "v", pos: c }));

  const isRoad = (r, c) => {
    return hRoads.some(hr => Math.abs(r - hr) <= 1) || vRoads.some(vc => Math.abs(c - vc) <= 1);
  };

  const buildings = [];
  const occupied = new Set();

  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (isRoad(r, c)) continue;
      if (occupied.has(`${r},${c}`)) continue;
      if (Math.random() < 0.35) continue;

      const w = Math.min(1 + Math.floor(Math.random() * 3), GRID - c);
      const d = Math.min(1 + Math.floor(Math.random() * 3), GRID - r);
      let canPlace = true;
      for (let dr = 0; dr < d; dr++) {
        for (let dc = 0; dc < w; dc++) {
          if (isRoad(r + dr, c + dc) || occupied.has(`${r+dr},${c+dc}`)) { canPlace = false; break; }
        }
        if (!canPlace) break;
      }
      if (!canPlace) continue;

      for (let dr = 0; dr < d; dr++)
        for (let dc = 0; dc < w; dc++)
          occupied.add(`${r+dr},${c+dc}`);

      const distFromCenter = Math.sqrt((r - GRID/2)**2 + (c - GRID/2)**2) / (GRID/2);
      const maxH = BUILDING_MAX_H * (1 - distFromCenter * 0.5);
      const h = BUILDING_MIN_H + Math.random() * (maxH - BUILDING_MIN_H);

      buildings.push({
        x: (c + w/2) * TILE - GRID*TILE/2,
        z: (r + d/2) * TILE - GRID*TILE/2,
        w: w * TILE - 1,
        d: d * TILE - 1,
        h,
        color: new THREE.Color().setHSL(
          0.55 + Math.random() * 0.15,
          0.15 + Math.random() * 0.2,
          0.15 + Math.random() * 0.25
        ),
        windowColor: Math.random() > 0.3 ? 0xFFE4A0 : 0x88CCFF,
      });
    }
  }

  return { buildings, hRoads, vRoads, isRoad };
}

// ============== MAIN COMPONENT ==============
export default function GTA3D() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const [hud, setHud] = useState({
    speed: 0, health: 100, money: 2500, wanted: 0, inCar: false,
    fps: 60, mission: "Explorează Vice City", score: 0, carName: ""
  });
  const hudRef = useRef(hud);

  useEffect(() => {
    if (gameRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ============== RENDERER ==============
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.003);

    // ============== CAMERA ==============
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.5, 600);
    camera.position.set(0, 25, 35);

    // ============== LIGHTING ==============
    const ambientLight = new THREE.AmbientLight(0x334455, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    sunLight.position.set(80, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x88aacc, 0x443322, 0.4);
    scene.add(hemiLight);

    // ============== SKYBOX ==============
    const skyGeo = new THREE.SphereGeometry(400, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunPos: { value: new THREE.Vector3(0, 1, 0) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunPos;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float sunDot = max(dot(dir, normalize(uSunPos)), 0.0);
          float y = dir.y * 0.5 + 0.5;
          vec3 dayTop = vec3(0.2, 0.5, 0.9);
          vec3 dayBot = vec3(0.7, 0.85, 1.0);
          vec3 nightTop = vec3(0.02, 0.02, 0.08);
          vec3 nightBot = vec3(0.05, 0.05, 0.15);
          float sunH = normalize(uSunPos).y;
          float dayFactor = smoothstep(-0.1, 0.3, sunH);
          vec3 top = mix(nightTop, dayTop, dayFactor);
          vec3 bot = mix(nightBot, dayBot, dayFactor);
          vec3 sky = mix(bot, top, y);
          vec3 sunColor = mix(vec3(1.0, 0.3, 0.1), vec3(1.0, 0.95, 0.8), dayFactor);
          sky += sunColor * pow(sunDot, 64.0) * 2.0;
          sky += sunColor * pow(sunDot, 8.0) * 0.3;
          float sunset = smoothstep(-0.05, 0.15, sunH) * (1.0 - smoothstep(0.15, 0.4, sunH));
          sky += vec3(1.0, 0.4, 0.2) * sunset * pow(1.0 - abs(dir.y), 4.0) * 0.5;
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // ============== CITY DATA ==============
    const cityData = generateCityData();
    const halfGrid = GRID * TILE / 2;

    // Ground
    const groundGeo = new THREE.PlaneGeometry(GRID * TILE + 100, GRID * TILE + 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2810, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.8 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7 });

    cityData.hRoads.forEach(r => {
      const roadGeo = new THREE.BoxGeometry(GRID * TILE, 0.15, ROAD_W);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.08, r * TILE - halfGrid);
      road.receiveShadow = true;
      scene.add(road);
      // Sidewalks
      [-1, 1].forEach(side => {
        const swGeo = new THREE.BoxGeometry(GRID * TILE, 0.4, 2);
        const sw = new THREE.Mesh(swGeo, sidewalkMat);
        sw.position.set(0, 0.2, r * TILE - halfGrid + side * (ROAD_W / 2 + 1));
        sw.receiveShadow = true;
        scene.add(sw);
      });
      // Lane markings
      const markMat = new THREE.MeshStandardMaterial({ color: 0xCCCC44 });
      for (let x = -halfGrid; x < halfGrid; x += 8) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(4, 0.17, 0.3), markMat);
        mark.position.set(x, 0.16, r * TILE - halfGrid);
        scene.add(mark);
      }
    });

    cityData.vRoads.forEach(c => {
      const roadGeo = new THREE.BoxGeometry(ROAD_W, 0.15, GRID * TILE);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(c * TILE - halfGrid, 0.08, 0);
      road.receiveShadow = true;
      scene.add(road);
      [-1, 1].forEach(side => {
        const swGeo = new THREE.BoxGeometry(2, 0.4, GRID * TILE);
        const sw = new THREE.Mesh(swGeo, sidewalkMat);
        sw.position.set(c * TILE - halfGrid + side * (ROAD_W / 2 + 1), 0.2, 0);
        sw.receiveShadow = true;
        scene.add(sw);
      });
      const markMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
      for (let z = -halfGrid; z < halfGrid; z += 8) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 4), markMat);
        mark.position.set(c * TILE - halfGrid, 0.16, z);
        scene.add(mark);
      }
    });

    // Buildings with windows
    const windowMat = new THREE.MeshStandardMaterial({ color: 0xFFE4A0, emissive: 0xFFE4A0, emissiveIntensity: 0.0 });
    const buildingMeshes = [];

    cityData.buildings.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.7, metalness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      buildingMeshes.push({ mesh, data: b });

      // Windows on two faces
      const winSize = 0.8;
      const winGap = 2.5;
      const faces = [
        { axis: "x", dir: 1, size: b.w, depth: b.d },
        { axis: "z", dir: 1, size: b.d, depth: b.w },
      ];
      faces.forEach(face => {
        for (let wy = 3; wy < b.h - 2; wy += winGap) {
          for (let wx = -face.size/2 + 2; wx < face.size/2 - 1; wx += winGap) {
            if (Math.random() < 0.25) continue;
            const winGeo = new THREE.PlaneGeometry(winSize, winSize * 1.4);
            const wMat = new THREE.MeshStandardMaterial({
              color: b.windowColor,
              emissive: b.windowColor,
              emissiveIntensity: 0,
              transparent: true,
              opacity: 0.8,
            });
            const win = new THREE.Mesh(winGeo, wMat);
            if (face.axis === "x") {
              win.position.set(b.x + face.dir * (b.w/2 + 0.05), wy, b.z + wx);
              win.rotation.y = face.dir > 0 ? 0 : Math.PI;
            } else {
              win.position.set(b.x + wx, wy, b.z + face.dir * (b.d/2 + 0.05));
              win.rotation.y = face.dir > 0 ? Math.PI/2 : -Math.PI/2;
            }
            scene.add(win);
          }
        }
      });

      // Roof details
      if (b.h > 25 && Math.random() > 0.4) {
        const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 6);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(b.x, b.h + 3, b.z);
        scene.add(antenna);
        // Blinking light
        const lightGeo = new THREE.SphereGeometry(0.3);
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2 });
        const bLight = new THREE.Mesh(lightGeo, lightMat);
        bLight.position.set(b.x, b.h + 6, b.z);
        scene.add(bLight);
      }
    });

    // Street lights
    const streetLights = [];
    const lightBulbGeo = new THREE.SphereGeometry(0.4);
    cityData.hRoads.forEach(r => {
      for (let x = -halfGrid + 15; x < halfGrid; x += 30) {
        [-1, 1].forEach(side => {
          const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 7);
          const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
          const pole = new THREE.Mesh(poleGeo, poleMat);
          const pz = r * TILE - halfGrid + side * (ROAD_W/2 + 2);
          pole.position.set(x, 3.5, pz);
          scene.add(pole);

          const armGeo = new THREE.BoxGeometry(3, 0.15, 0.15);
          const arm = new THREE.Mesh(armGeo, poleMat);
          arm.position.set(x - side * 1.5, 7, pz);
          scene.add(arm);

          const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: 0xFFDD88, emissiveIntensity: 0 });
          const bulb = new THREE.Mesh(lightBulbGeo, bulbMat);
          bulb.position.set(x - side * 3, 6.8, pz);
          scene.add(bulb);

          const sLight = new THREE.PointLight(0xFFDD88, 0, 25, 2);
          sLight.position.copy(bulb.position);
          scene.add(sLight);
          streetLights.push({ bulb, light: sLight, mat: bulbMat });
        });
      }
    });

    // ============== PLAYER ==============
    const playerGroup = new THREE.Group();
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2255CC });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    playerGroup.add(body);
    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFCCAA });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.2;
    head.castShadow = true;
    playerGroup.add(head);
    // Legs
    [-0.2, 0.2].forEach(xOff => {
      const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(xOff, 0.45, 0);
      playerGroup.add(leg);
    });
    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);

    // ============== CARS ==============
    function createCar(color, x, z, angle) {
      const group = new THREE.Group();
      // Body
      const cBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 1.2, 2.2),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
      );
      cBody.position.y = 0.9;
      cBody.castShadow = true;
      group.add(cBody);
      // Roof
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.9, 2.0),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
      );
      roof.position.set(-0.3, 1.8, 0);
      roof.castShadow = true;
      group.add(roof);
      // Windshield
      const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x88BBEE, transparent: true, opacity: 0.5, metalness: 0.9 })
      );
      windshield.position.set(0.82, 1.65, 0);
      windshield.rotation.y = 0;
      windshield.rotation.z = -0.35;
      group.add(windshield);
      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      [[-1.4, -1.15], [-1.4, 1.15], [1.4, -1.15], [1.4, 1.15]].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.4, wz);
        group.add(wheel);
      });
      // Headlights
      [0.9, -0.9].forEach(zOff => {
        const hl = new THREE.Mesh(
          new THREE.SphereGeometry(0.2),
          new THREE.MeshStandardMaterial({ color: 0xFFFFDD, emissive: 0xFFFFDD, emissiveIntensity: 0.5 })
        );
        hl.position.set(2.3, 0.8, zOff);
        group.add(hl);
      });
      // Taillights
      [0.9, -0.9].forEach(zOff => {
        const tl = new THREE.Mesh(
          new THREE.SphereGeometry(0.15),
          new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 0.3 })
        );
        tl.position.set(-2.3, 0.8, zOff);
        group.add(tl);
      });
      group.position.set(x, 0, z);
      group.rotation.y = angle;
      scene.add(group);
      return group;
    }

    const carNames = ["Infernus", "Sultan", "Banshee", "Cheetah", "Turismo", "Phoenix", "Sabre", "Sentinel", "Comet", "Buffalo"];
    const carColors = [0xCC2222, 0x2244AA, 0x22AA44, 0xAAAA22, 0x8822AA, 0xFF6600, 0x2299CC, 0x222222, 0xCC2266, 0x44AAAA];

    const cars = [];
    const carData = [];
    for (let i = 0; i < 25; i++) {
      const ri = cityData.hRoads[i % cityData.hRoads.length];
      const ci = cityData.vRoads[i % cityData.vRoads.length];
      const horiz = i % 2 === 0;
      const x = horiz ? (Math.random() * GRID * TILE - halfGrid) : (ci * TILE - halfGrid + (Math.random()-0.5)*ROAD_W*0.5);
      const z = horiz ? (ri * TILE - halfGrid + (Math.random()-0.5)*ROAD_W*0.5) : (Math.random() * GRID * TILE - halfGrid);
      const angle = horiz ? 0 : Math.PI / 2;
      const color = carColors[i % carColors.length];
      const car = createCar(color, x, z, angle);
      cars.push(car);
      carData.push({
        speed: 0,
        maxSpeed: 2 + Math.random() * 3,
        angle: angle,
        ai: true,
        occupied: false,
        name: carNames[i % carNames.length],
        turnTimer: 0,
      });
    }

    // ============== NPCs ==============
    const npcGroup = [];
    const npcColors = [0xCC4444, 0x44CC44, 0x4444CC, 0xCCCC44, 0xCC44CC, 0x44CCCC, 0xFF8844, 0x8844FF];
    for (let i = 0; i < 40; i++) {
      const ri = cityData.hRoads[Math.floor(Math.random() * cityData.hRoads.length)];
      const ci = cityData.vRoads[Math.floor(Math.random() * cityData.vRoads.length)];
      const x = ci * TILE - halfGrid + (Math.random()-0.5) * ROAD_W;
      const z = ri * TILE - halfGrid + (Math.random()-0.5) * ROAD_W;
      const g = new THREE.Group();
      const nb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: npcColors[i % npcColors.length] })
      );
      nb.position.y = 0.95;
      nb.castShadow = true;
      g.add(nb);
      const nh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xFFCCAA })
      );
      nh.position.y = 1.9;
      g.add(nh);
      g.position.set(x, 0, z);
      scene.add(g);
      npcGroup.push({ mesh: g, vx: (Math.random()-0.5)*0.6, vz: (Math.random()-0.5)*0.6, timer: Math.random()*200, alive: true });
    }

    // ============== PICKUPS ==============
    const pickups = [];
    const pickupMeshes = [];
    for (let i = 0; i < 20; i++) {
      const ri = cityData.hRoads[Math.floor(Math.random() * cityData.hRoads.length)];
      const ci = cityData.vRoads[Math.floor(Math.random() * cityData.vRoads.length)];
      const x = (Math.random() > 0.5 ? ci * TILE - halfGrid : (Math.random()*GRID*TILE - halfGrid));
      const z = (Math.random() > 0.5 ? ri * TILE - halfGrid : (Math.random()*GRID*TILE - halfGrid));
      const isMoney = i < 14;
      const geo = isMoney ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(0.6);
      const mat = new THREE.MeshStandardMaterial({
        color: isMoney ? 0x44DD44 : 0xFF4444,
        emissive: isMoney ? 0x44DD44 : 0xFF4444,
        emissiveIntensity: 0.5,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, 1.5, z);
      scene.add(m);
      pickups.push({ type: isMoney ? "money" : "health", amount: isMoney ? (100 + Math.floor(Math.random()*200)) : 25, active: true });
      pickupMeshes.push(m);
    }

    // ============== TREES ==============
    for (let i = 0; i < 80; i++) {
      const r = Math.floor(Math.random() * GRID);
      const c = Math.floor(Math.random() * GRID);
      if (cityData.isRoad(r,c)) continue;
      const x = c * TILE - halfGrid;
      const z = r * TILE - halfGrid;
      // Check not inside building
      if (cityData.buildings.some(b => Math.abs(x-b.x)<b.w/2+1 && Math.abs(z-b.z)<b.d/2+1)) continue;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x554422 })
      );
      trunk.position.set(x, 1.25, z);
      trunk.castShadow = true;
      scene.add(trunk);
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + Math.random(), 8, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.28 + Math.random()*0.08, 0.6, 0.25 + Math.random()*0.15) })
      );
      foliage.position.set(x, 3.5 + Math.random(), z);
      foliage.castShadow = true;
      scene.add(foliage);
    }

    // ============== GAME STATE ==============
    const state = {
      player: { x: 0, z: 0, y: 0, angle: 0, speed: 0, health: 100, money: 2500, inCar: -1 },
      wanted: 0, wantedTimer: 0, score: 0, time: 0,
      camAngle: 0, camDist: 18, camHeight: 10, camTargetAngle: 0,
    };

    // ============== COLLISION HELPERS ==============
    const isOnRoad = (x, z) => {
      const gr = (z + halfGrid) / TILE;
      const gc = (x + halfGrid) / TILE;
      return cityData.hRoads.some(hr => Math.abs(gr - hr) < 1.2) || cityData.vRoads.some(vc => Math.abs(gc - vc) < 1.2);
    };

    const isWalkablePos = (x, z) => {
      // Check building collision
      for (const b of cityData.buildings) {
        if (Math.abs(x - b.x) < b.w/2 + 0.8 && Math.abs(z - b.z) < b.d/2 + 0.8) return false;
      }
      return true;
    };

    // ============== GAME LOOP ==============
    const clock = new THREE.Clock();
    let lastFps = 60, fpsCounter = 0, fpsTime = 0;

    function gameLoop() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const keys = keysRef.current;
      const p = state.player;
      state.time += dt;
      fpsCounter++;
      fpsTime += dt;
      if (fpsTime >= 0.5) { lastFps = Math.round(fpsCounter / fpsTime); fpsCounter = 0; fpsTime = 0; }

      // Day/night
      const dayAngle = state.time * 0.05;
      const sunY = Math.sin(dayAngle);
      const sunX = Math.cos(dayAngle) * 80;
      sunLight.position.set(sunX, Math.max(sunY * 100, 5), 50);
      sunLight.intensity = Math.max(0.1, sunY * 1.4);
      ambientLight.intensity = 0.2 + Math.max(0, sunY) * 0.5;
      skyMat.uniforms.uTime.value = state.time;
      skyMat.uniforms.uSunPos.value.set(sunX, sunY * 100, 50);

      const isNight = sunY < 0.1;
      renderer.toneMappingExposure = 0.5 + Math.max(0, sunY) * 0.8;
      scene.fog.density = isNight ? 0.005 : 0.003;

      // Street lights
      streetLights.forEach(sl => {
        const intensity = isNight ? 1.5 : 0;
        sl.light.intensity = intensity;
        sl.mat.emissiveIntensity = isNight ? 1.5 : 0;
      });

      // ============== PLAYER UPDATE ==============
      if (p.inCar >= 0) {
        const car = cars[p.inCar];
        const cd = carData[p.inCar];

        // Exit
        if (keys["f"] || keys["e"]) {
          keys["f"] = false; keys["e"] = false;
          cd.occupied = false; cd.ai = false; cd.speed = 0;
          p.x = car.position.x + Math.cos(cd.angle + Math.PI/2) * 4;
          p.z = car.position.z + Math.sin(cd.angle + Math.PI/2) * 4;
          p.inCar = -1;
          playerGroup.visible = true;
        } else {
          const accel = 8 * dt;
          const brake = 12 * dt;
          const turnSpeed = 2.0 * dt;

          if (keys["w"] || keys["arrowup"]) cd.speed = Math.min(cd.speed + accel, cd.maxSpeed);
          else if (keys["s"] || keys["arrowdown"]) cd.speed = Math.max(cd.speed - brake, -cd.maxSpeed * 0.4);
          else cd.speed *= (1 - 2 * dt);

          if (Math.abs(cd.speed) > 0.3) {
            const turnMul = Math.min(Math.abs(cd.speed) / cd.maxSpeed, 1);
            if (keys["a"] || keys["arrowleft"]) cd.angle += turnSpeed * turnMul * (cd.speed > 0 ? 1 : -1);
            if (keys["d"] || keys["arrowright"]) cd.angle -= turnSpeed * turnMul * (cd.speed > 0 ? 1 : -1);
          }

          const nx = car.position.x + Math.sin(cd.angle) * cd.speed;
          const nz = car.position.z + Math.cos(cd.angle) * cd.speed;

          if (isWalkablePos(nx, nz)) {
            car.position.x = nx;
            car.position.z = nz;
          } else {
            cd.speed *= -0.3;
          }

          car.rotation.y = cd.angle;
          p.x = car.position.x;
          p.z = car.position.z;
          p.angle = cd.angle;

          // Hit NPCs
          npcGroup.forEach(npc => {
            if (!npc.alive) return;
            const dx = npc.mesh.position.x - car.position.x;
            const dz = npc.mesh.position.z - car.position.z;
            if (Math.sqrt(dx*dx+dz*dz) < 3 && Math.abs(cd.speed) > 1) {
              npc.alive = false;
              npc.mesh.visible = false;
              state.wanted = Math.min(state.wanted + 1, 5);
              state.wantedTimer = 20;
            }
          });
        }
      } else {
        // Walking
        const spd = (keys[" "] ? 10 : 5) * dt;
        let dx = 0, dz = 0;
        if (keys["w"] || keys["arrowup"]) dz = -spd;
        if (keys["s"] || keys["arrowdown"]) dz = spd;
        if (keys["a"] || keys["arrowleft"]) dx = -spd;
        if (keys["d"] || keys["arrowright"]) dx = spd;

        // Camera-relative movement
        if (dx || dz) {
          const moveAngle = Math.atan2(dx, dz) + state.camAngle;
          const nx = p.x + Math.sin(moveAngle) * Math.sqrt(dx*dx+dz*dz);
          const nz = p.z + Math.cos(moveAngle) * Math.sqrt(dx*dx+dz*dz);
          if (isWalkablePos(nx, nz)) { p.x = nx; p.z = nz; }
          p.angle = moveAngle;
        }

        playerGroup.position.set(p.x, 0, p.z);
        playerGroup.rotation.y = p.angle;

        // Enter car
        if (keys["f"] || keys["e"]) {
          keys["f"] = false; keys["e"] = false;
          cars.forEach((car, ci) => {
            if (carData[ci].occupied) return;
            const dx = car.position.x - p.x;
            const dz = car.position.z - p.z;
            if (Math.sqrt(dx*dx+dz*dz) < 5) {
              carData[ci].occupied = true;
              carData[ci].ai = false;
              p.inCar = ci;
              playerGroup.visible = false;
            }
          });
        }
      }

      // Camera orbit with mouse-style Q/E
      if (keys["q"]) state.camTargetAngle += 2.5 * dt;
      if (keys["r"]) state.camTargetAngle -= 2.5 * dt;
      state.camAngle += (state.camTargetAngle - state.camAngle) * 3 * dt;

      const camOffX = Math.sin(state.camAngle + p.angle) * state.camDist;
      const camOffZ = Math.cos(state.camAngle + p.angle) * state.camDist;
      const targetCamX = p.x + camOffX;
      const targetCamZ = p.z + camOffZ;
      const targetCamY = state.camHeight + (p.inCar >= 0 ? 4 : 0);

      camera.position.x += (targetCamX - camera.position.x) * 3 * dt;
      camera.position.y += (targetCamY - camera.position.y) * 3 * dt;
      camera.position.z += (targetCamZ - camera.position.z) * 3 * dt;
      camera.lookAt(p.x, 2, p.z);

      // Shadow follows player
      sunLight.target.position.set(p.x, 0, p.z);
      sunLight.target.updateMatrixWorld();

      // NPC AI
      npcGroup.forEach(npc => {
        if (!npc.alive) return;
        npc.timer -= dt;
        if (npc.timer <= 0) {
          npc.vx = (Math.random()-0.5) * 0.6;
          npc.vz = (Math.random()-0.5) * 0.6;
          npc.timer = 2 + Math.random() * 4;
        }
        const nx = npc.mesh.position.x + npc.vx * dt * 20;
        const nz = npc.mesh.position.z + npc.vz * dt * 20;
        if (isWalkablePos(nx, nz)) {
          npc.mesh.position.x = nx;
          npc.mesh.position.z = nz;
        } else {
          npc.vx *= -1; npc.vz *= -1;
        }
      });

      // Car AI
      carData.forEach((cd, ci) => {
        if (cd.occupied || ci === p.inCar) return;
        cd.turnTimer -= dt;
        cd.speed = Math.min(cd.speed + 2 * dt, 1.2);
        const nx = cars[ci].position.x + Math.sin(cd.angle) * cd.speed;
        const nz = cars[ci].position.z + Math.cos(cd.angle) * cd.speed;
        if (isWalkablePos(nx, nz) && isOnRoad(nx, nz)) {
          cars[ci].position.x = nx;
          cars[ci].position.z = nz;
        } else {
          cd.angle += Math.PI/2 + (Math.random()-0.5)*0.4;
          cd.speed = 0;
        }
        cars[ci].rotation.y = cd.angle;
      });

      // Pickups
      pickups.forEach((pk, pi) => {
        if (!pk.active) return;
        const m = pickupMeshes[pi];
        m.rotation.y += dt * 2;
        m.position.y = 1.5 + Math.sin(state.time * 3 + pi) * 0.4;
        const dx = m.position.x - p.x;
        const dz = m.position.z - p.z;
        if (Math.sqrt(dx*dx+dz*dz) < 3) {
          pk.active = false;
          m.visible = false;
          if (pk.type === "money") { p.money += pk.amount; state.score += pk.amount; }
          else p.health = Math.min(100, p.health + pk.amount);
        }
      });

      // Wanted decay
      if (state.wantedTimer > 0) state.wantedTimer -= dt;
      else if (state.wanted > 0) {
        state.wantedTimer = 15;
        state.wanted--;
      }

      // Render
      renderer.render(scene, camera);

      // HUD update every few frames
      if (Math.round(state.time * 60) % 6 === 0) {
        const h = {
          speed: p.inCar >= 0 ? Math.abs(Math.round(carData[p.inCar].speed * 40)) : 0,
          health: p.health,
          money: p.money,
          wanted: state.wanted,
          inCar: p.inCar >= 0,
          fps: lastFps,
          mission: state.score > 2000 ? "Boss! Total domination!" : state.score > 500 ? "Colectează mai mulți bani" : "Explorează Vice City",
          score: state.score,
          carName: p.inCar >= 0 ? carData[p.inCar].name : "",
        };
        hudRef.current = h;
        setHud(h);
      }

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
    gameRef.current = { renderer, scene };

    const handleKey = (e) => {
      keysRef.current[e.key.toLowerCase()] = e.type === "keydown";
      if (["w","a","s","d","f","e","q","r"," ","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{
      background: "#000",
      width: "100%",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');`}</style>

      <div ref={mountRef} style={{ width: "100%", height: "100%" }} tabIndex={0} />

      {/* HUD Overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none", padding: 16 }}>
        {/* Top bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 8,
        }}>
          {/* Health & Wanted */}
          <div style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 200,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#FC8181", fontSize: 14 }}>♥</span>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${hud.health}%`,
                  background: hud.health > 50 ? "linear-gradient(90deg, #48BB78, #68D391)" : hud.health > 25 ? "#ECC94B" : "#FC8181",
                  borderRadius: 4,
                  transition: "width 0.3s",
                }} />
              </div>
              <span style={{ color: "#A1A1AA", fontSize: 11 }}>{hud.health}</span>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({length:5}).map((_,i)=>(
                <span key={i} style={{
                  color: i < hud.wanted ? "#FC8181" : "rgba(255,255,255,0.15)",
                  fontSize: 16,
                  textShadow: i < hud.wanted ? "0 0 8px #FC8181" : "none",
                }}>★</span>
              ))}
            </div>
          </div>

          {/* Money & Score */}
          <div style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "right",
          }}>
            <div style={{ color: "#48BB78", fontSize: 20, fontWeight: 800 }}>$ {hud.money.toLocaleString()}</div>
            <div style={{ color: "#A1A1AA", fontSize: 11 }}>{hud.score} pts · {hud.fps} FPS</div>
          </div>
        </div>

        {/* Car HUD */}
        {hud.inCar && (
          <div style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            padding: "10px 24px",
            borderRadius: 10,
            border: "1px solid rgba(100,180,255,0.3)",
            textAlign: "center",
          }}>
            <div style={{ color: "#63B3ED", fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>{hud.carName}</div>
            <div style={{ color: "#FFF", fontSize: 28, fontWeight: 800 }}>{hud.speed} <span style={{ fontSize: 12, color: "#A1A1AA" }}>km/h</span></div>
          </div>
        )}

        {/* Mission */}
        <div style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid rgba(255,200,100,0.2)",
          fontSize: 12,
          color: "#FBD38D",
        }}>
          🎯 {hud.mission}
        </div>

        {/* Controls hint */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 10,
          color: "#71717A",
          lineHeight: 1.8,
          textAlign: "right",
        }}>
          <span style={{color:"#A1A1AA"}}>WASD</span> mișcare · <span style={{color:"#A1A1AA"}}>F</span> intră/ieși mașină<br/>
          <span style={{color:"#A1A1AA"}}>SPACE</span> sprint · <span style={{color:"#A1A1AA"}}>Q/R</span> rotește camera
        </div>
      </div>
    </div>
  );
}
