import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { shopConfig } from '../config';

type DeviceSceneProps = {
  progress: number;
  activeService: string;
  reducedMotion: boolean;
  language?: 'fr' | 'ar';
  onUnavailable: () => void;
};

type FocusMaterial = {
  material: THREE.MeshStandardMaterial;
  services: string[];
  color: THREE.Color;
  emissive: THREE.Color;
};

type MovingPart = {
  object: THREE.Object3D;
  origin: THREE.Vector3;
  movement: THREE.Vector3;
};

const ORANGE = '#f47c42';

/** Every surface and component is built here; no models or remote textures. */
function createStudio(mobile: boolean, language: 'fr' | 'ar', onTextureReady: () => void) {
  const studio = new THREE.Group();
  const movingParts: MovingPart[] = [];
  const focusMaterials: FocusMaterial[] = [];
  const textures: THREE.Texture[] = [];
  const arabic = language === 'ar';
  const screenCopy = arabic ? {
    diagnostic: 'نظام التشخيص',
    beginning: 'بداية جديدة.',
    care: 'عناية. إصلاح. من جديد.',
    ready: 'جاهز لحياة جديدة.',
  } : {
    diagnostic: 'SYSTÈME DE DIAGNOSTIC',
    beginning: 'Un nouveau départ.',
    care: 'PRENDRE SOIN. RÉPARER. RECOMMENCER.',
    ready: 'Prêt pour une nouvelle vie.',
  };
  const displayFont = arabic ? '"Noto Sans Arabic", Arial, sans-serif' : 'Arial, sans-serif';

  const material = (color: string, metalness = 0, roughness = 0.5, services: string[] = []) => {
    const result = new THREE.MeshStandardMaterial({ color, metalness, roughness });
    if (services.length) focusMaterials.push({ material: result, services, color: result.color.clone(), emissive: result.emissive.clone() });
    return result;
  };
  const graphite = material('#2a2b2d', 0.77, 0.34);
  const aluminium = material('#9b9e9c', 0.88, 0.26);
  const edge = material('#d9d9d2', 0.9, 0.24);
  const dark = material('#111419', 0.35, 0.49);
  const orange = material(ORANGE, 0.25, 0.41);
  const copper = material('#b88951', 0.78, 0.3);
  const circuit = material('#203d37', 0.37, 0.52, ['data', 'software']);
  const battery = material('#393b3f', 0.45, 0.37, ['battery']);
  const cooling = material('#989e9d', 0.83, 0.3, ['cooling']);
  const screenRim = material('#505052', 0.8, 0.29, ['screen']);
  const charging = material('#a6a7a1', 0.82, 0.26, ['charging']);
  const chip = material('#14161a', 0.42, 0.46, ['software', 'data']);

  function roundedGeometry(width: number, height: number, depth: number, radius = 0.04) {
    const x = -width / 2;
    const y = -height / 2;
    const r = Math.min(radius, width / 3, height / 3);
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + width - r, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r);
    shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: Math.min(depth * 0.23, 0.012),
      bevelSize: Math.min(depth * 0.2, 0.013),
      bevelSegments: mobile ? 1 : 2,
      curveSegments: mobile ? 4 : 6,
      steps: 1,
    });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  function rounded(parent: THREE.Object3D, width: number, height: number, depth: number, mat: THREE.Material, x = 0, y = 0, z = 0, horizontal = false, radius = 0.04) {
    const mesh = new THREE.Mesh(roundedGeometry(width, height, depth, radius), mat);
    mesh.position.set(x, y, z);
    if (horizontal) mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function box(parent: THREE.Object3D, width: number, height: number, depth: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function cylinder(parent: THREE.Object3D, radius: number, height: number, mat: THREE.Material, x: number, y: number, z: number, segments = 24) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function movable(object: THREE.Object3D, x: number, y: number, z: number) {
    movingParts.push({ object, origin: object.position.clone(), movement: new THREE.Vector3(x, y, z) });
  }

  function canvasTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    paint(context);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = mobile ? 2 : 4;
    textures.push(texture);
    if (arabic && document.fonts) {
      // Canvas does not automatically repaint when a web font becomes ready.
      // Keep an immediate fallback, then redraw this original artwork once.
      void document.fonts.load('400 55px "Noto Sans Arabic"', screenCopy.beginning).then(() => {
        if (texture.userData.disposed) return;
        context.clearRect(0, 0, width, height);
        context.textAlign = 'left';
        context.direction = 'ltr';
        paint(context);
        texture.needsUpdate = true;
        onTextureReady();
      }).catch(() => {});
    }
    return texture;
  }

  const laptopTexture = canvasTexture(1280, 800, (ctx) => {
    ctx.fillStyle = '#15191c';
    ctx.fillRect(0, 0, 1280, 800);
    const light = ctx.createRadialGradient(900, 220, 10, 760, 450, 720);
    light.addColorStop(0, '#efad76');
    light.addColorStop(0.25, '#bf6c45');
    light.addColorStop(0.57, '#572f29');
    light.addColorStop(1, '#14191d');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, 1280, 800);
    ctx.save();
    ctx.translate(860, 425);
    ctx.rotate(-0.4);
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 195 + i * 36, 310 + i * 24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,224,188,.45)' : 'rgba(255,213,176,.15)';
      ctx.lineWidth = i === 0 ? 3 : 1;
      ctx.stroke();
    }
    ctx.restore();
    ctx.textAlign = arabic ? 'right' : 'left';
    ctx.direction = 'ltr';
    const textX = arabic ? 1210 : 70;
    ctx.fillStyle = '#f0ece2';
    ctx.font = '500 28px Arial, sans-serif';
    ctx.fillText(shopConfig.name, textX, 76);
    ctx.direction = arabic ? 'rtl' : 'ltr';
    ctx.fillStyle = 'rgba(245,235,218,.63)';
    ctx.font = `400 18px ${displayFont}`;
    ctx.fillText(screenCopy.diagnostic, textX, 108);
    ctx.font = `400 55px ${displayFont}`;
    ctx.fillStyle = '#f8f2e8';
    ctx.fillText(screenCopy.beginning, textX, 654);
    ctx.fillStyle = 'rgba(250,236,216,.67)';
    ctx.font = `400 21px ${displayFont}`;
    ctx.fillText(screenCopy.care, textX, 703);
    ctx.fillStyle = '#f7ad76';
    ctx.beginPath();
    ctx.arc(arabic ? 75 : 1175, 71, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.27)';
    ctx.fillRect(0, 777, 1280, 1);
  });

  const phoneTexture = canvasTexture(480, 960, (ctx) => {
    ctx.fillStyle = '#191c1e';
    ctx.fillRect(0, 0, 480, 960);
    const gradient = ctx.createLinearGradient(0, 320, 470, 820);
    gradient.addColorStop(0, '#f5c697');
    gradient.addColorStop(0.5, '#de8b56');
    gradient.addColorStop(1, '#6d3a2b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(280, 685, 240, 340, -0.5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(295, 660, 125 + i * 22, 220 + i * 27, -0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,232,207,.23)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = '#f8eee0';
    ctx.textAlign = 'center';
    ctx.font = '300 91px Arial, sans-serif';
    ctx.fillText('09:41', 240, 239);
    ctx.direction = arabic ? 'rtl' : 'ltr';
    ctx.font = `400 22px ${displayFont}`;
    ctx.fillText(screenCopy.ready, 240, 285);
    ctx.direction = 'ltr';
    ctx.font = '19px Arial, sans-serif';
    ctx.fillText(shopConfig.name, 240, 850);
    ctx.fillStyle = 'rgba(250,243,230,.8)';
    ctx.beginPath();
    ctx.roundRect(170, 908, 140, 5, 3);
    ctx.fill();
    ctx.fillRect(48, 50, 12, 9);
    ctx.fillRect(66, 46, 12, 13);
    ctx.fillRect(84, 41, 12, 18);
    ctx.strokeStyle = '#eee6d9';
    ctx.lineWidth = 3;
    ctx.strokeRect(389, 42, 38, 18);
    ctx.fillRect(393, 46, 28, 10);
  });

  // A restrained repair mat provides scale, believable contact shadows, and a
  // quiet coordinate system beneath the hovering devices.
  const matTexture = canvasTexture(1024, 640, (ctx) => {
    ctx.fillStyle = '#282d2d';
    ctx.fillRect(0, 0, 1024, 640);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(177,194,184,.10)';
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke();
    }
    for (let y = 0; y < 640; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(231,148,91,.38)';
    ctx.strokeRect(28, 28, 968, 584);
    ctx.strokeRect(44, 44, 936, 552);
    ctx.fillStyle = 'rgba(236,223,200,.4)';
    ctx.font = '15px monospace';
    ctx.fillText(`${shopConfig.name} / PRECISION WORKSPACE`, 64, 578);
    ctx.fillStyle = 'rgba(236,223,200,.3)';
    ctx.font = '12px monospace';
    for (let i = 0; i < 12; i++) ctx.fillText(String(i + 1).padStart(2, '0'), 74 + i * 73, 62);
    for (let x = 100; x < 1000; x += 170) {
      ctx.beginPath(); ctx.moveTo(x - 7, 320); ctx.lineTo(x + 7, 320);
      ctx.moveTo(x, 313); ctx.lineTo(x, 327); ctx.stroke();
    }
  });
  rounded(studio, 5.25, 3.5, 0.12, material('#252728', 0.65, 0.45), 0, -0.68, 0.15, true, 0.18);
  const mat = rounded(studio, 5.02, 3.27, 0.04, material('#343937', 0.1, 0.8), 0, -0.595, 0.15, true, 0.15);
  const matFace = new THREE.Mesh(new THREE.PlaneGeometry(4.94, 3.19), new THREE.MeshStandardMaterial({ map: matTexture, roughness: 0.91, metalness: 0.08 }));
  matFace.rotation.x = -Math.PI / 2;
  matFace.position.set(0, -0.562, 0.15);
  matFace.receiveShadow = true;
  studio.add(matFace);
  mat.receiveShadow = true;

  const laptop = new THREE.Group();
  laptop.position.set(-0.57, 0.11, -0.25);
  laptop.rotation.y = -0.18;
  studio.add(laptop);
  rounded(laptop, 3.12, 2.02, 0.115, graphite, 0, 0, 0, true, 0.11);
  rounded(laptop, 3.09, 1.99, 0.035, aluminium, 0, 0.075, 0, true, 0.095);
  // Precisely machined front edge and recessed connection ports.
  box(laptop, 1.65, 0.02, 0.04, edge, 0, 0.013, 1.021);
  for (const z of [-0.57, -0.22, 0.04]) {
    box(laptop, 0.024, 0.038, z === 0.04 ? 0.16 : 0.21, dark, -1.566, 0.028, z);
  }
  box(laptop, 0.02, 0.036, 0.16, charging, 1.567, 0.022, -0.53);
  box(laptop, 0.021, 0.023, 0.12, dark, 1.581, 0.022, -0.53);

  const internals = new THREE.Group();
  internals.position.y = -0.01;
  laptop.add(internals);
  movable(internals, 0, 0.35, 0);
  rounded(internals, 2.89, 1.78, 0.025, circuit, 0, 0, -0.015, true, 0.04);
  // Two long lithium cells and their orange flex connectors.
  for (const x of [-0.65, 0.65]) {
    rounded(internals, 1.22, 0.57, 0.075, battery, x, 0.05, 0.51, true, 0.035);
    box(internals, 0.64, 0.008, 0.014, aluminium, x, 0.094, 0.49);
    box(internals, 0.34, 0.008, 0.011, aluminium, x, 0.094, 0.55);
    box(internals, 0.13, 0.018, 0.25, orange, x + 0.42, 0.055, 0.11);
  }
  rounded(internals, 0.55, 0.4, 0.055, chip, 0, 0.055, -0.35, true, 0.02);
  rounded(internals, 0.36, 0.26, 0.007, cooling, 0, 0.09, -0.35, true, 0.012);
  for (const x of [-0.94, 0.94]) {
    cylinder(internals, 0.31, 0.055, dark, x, 0.055, -0.38, mobile ? 24 : 40);
    cylinder(internals, 0.27, 0.015, cooling, x, 0.09, -0.38, mobile ? 24 : 40);
    const bladeGeometry = new THREE.BoxGeometry(0.014, 0.018, 0.20);
    const fanBlades = new THREE.InstancedMesh(bladeGeometry, dark, mobile ? 12 : 20);
    const bladeMatrix = new THREE.Object3D();
    const bladeCount = mobile ? 12 : 20;
    for (let index = 0; index < bladeCount; index++) {
      const angle = (index / bladeCount) * Math.PI * 2;
      bladeMatrix.position.set(x + Math.cos(angle) * 0.15, 0.106, -0.38 + Math.sin(angle) * 0.15);
      bladeMatrix.rotation.y = -angle + 0.55;
      bladeMatrix.updateMatrix();
      fanBlades.setMatrixAt(index, bladeMatrix.matrix);
    }
    internals.add(fanBlades);
    cylinder(internals, 0.055, 0.025, aluminium, x, 0.113, -0.38, 16);
  }
  for (const x of [-0.47, 0.47]) {
    const pipe = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.036, 8, 28, Math.PI * 0.8), copper);
    pipe.rotation.x = Math.PI / 2;
    pipe.rotation.z = x < 0 ? 0.4 : Math.PI + 0.4;
    pipe.position.set(x, 0.112, -0.3);
    internals.add(pipe);
  }
  // Memory banks, solder pads, sockets, and restrained circuit traces.
  for (let i = 0; i < 6; i++) {
    box(internals, 0.19, 0.035, 0.11, chip, -0.53 + i * 0.21, 0.045, -0.71);
    box(internals, 0.10, 0.025, 0.05, copper, -1.21 + i * 0.43, 0.045, 0.01);
  }
  for (let i = 0; i < 7; i++) box(internals, 0.018, 0.006, 0.22, copper, -0.24 + i * 0.08, 0.019, -0.04);
  for (const x of [-1.31, 1.31]) for (const z of [-0.78, 0.78]) cylinder(internals, 0.027, 0.018, edge, x, 0.032, z, 12);

  const deck = new THREE.Group();
  deck.position.y = 0.166;
  laptop.add(deck);
  movable(deck, -0.35, 0.98, -0.10);
  rounded(deck, 3.09, 1.98, 0.035, aluminium, 0, 0, 0, true, 0.095);
  rounded(deck, 2.58, 0.89, 0.013, dark, 0, 0.027, -0.40, true, 0.05);
  const keyGeometry = roundedGeometry(0.174, 0.135, 0.033, 0.022);
  keyGeometry.rotateX(-Math.PI / 2);
  const keyMat = material('#242729', 0.2, 0.54);
  const keys = new THREE.InstancedMesh(keyGeometry, keyMat, 60);
  const keyTransform = new THREE.Object3D();
  for (let row = 0; row < 5; row++) for (let col = 0; col < 12; col++) {
    keyTransform.position.set(-1.134 + col * 0.206, 0.053, -0.739 + row * 0.174);
    keyTransform.updateMatrix();
    keys.setMatrixAt(row * 12 + col, keyTransform.matrix);
  }
  keys.castShadow = true;
  deck.add(keys);
  rounded(deck, 0.89, 0.143, 0.019, keyMat, 0, 0.060, 0.041, true, 0.02);
  rounded(deck, 0.95, 0.55, 0.012, material('#7f8584', 0.8, 0.38), 0, 0.027, 0.57, true, 0.047);
  rounded(deck, 0.92, 0.52, 0.013, aluminium, 0, 0.032, 0.57, true, 0.045);
  // Speaker perforations rendered with one instanced geometry.
  const speaker = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 5), dark, mobile ? 64 : 128);
  const speakerDot = new THREE.Object3D();
  const rows = mobile ? 16 : 32;
  for (let side = 0; side < 2; side++) for (let row = 0; row < rows; row++) for (let col = 0; col < 2; col++) {
    const id = side * rows * 2 + row * 2 + col;
    speakerDot.position.set((side ? 1 : -1) * (1.37 + col * 0.044), 0.032, -0.77 + row * (0.72 / rows));
    speakerDot.updateMatrix();
    speaker.setMatrixAt(id, speakerDot.matrix);
  }
  deck.add(speaker);

  const lid = new THREE.Group();
  lid.position.set(0, 0.14, -0.92);
  lid.rotation.x = -0.24;
  laptop.add(lid);
  movable(lid, -0.04, 0.43, -0.17);
  rounded(lid, 3.16, 1.94, 0.095, graphite, 0, 0.97, 0, false, 0.095);
  rounded(lid, 3.10, 1.88, 0.022, screenRim, 0, 0.97, 0.058, false, 0.08);
  rounded(lid, 2.95, 1.69, 0.012, dark, 0, 1.0, 0.08, false, 0.034);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(2.89, 1.625), new THREE.MeshBasicMaterial({ map: laptopTexture, toneMapped: false }));
  display.position.set(0, 1.01, 0.091);
  lid.add(display);
  const webcam = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), dark);
  webcam.position.set(0, 1.888, 0.077);
  lid.add(webcam);
  for (const x of [-1.02, 1.02]) {
    const hinge = cylinder(laptop, 0.073, 0.47, graphite, x, 0.145, -0.94);
    hinge.rotation.z = Math.PI / 2;
  }

  const phone = new THREE.Group();
  phone.position.set(1.43, 0.60, 0.96);
  phone.rotation.set(-0.18, 0.10, -0.17);
  studio.add(phone);
  const phoneBack = new THREE.Group();
  phone.add(phoneBack);
  movable(phoneBack, -0.09, -0.03, -0.25);
  rounded(phoneBack, 0.95, 1.98, 0.106, graphite, 0, 0, 0, false, 0.135);
  rounded(phoneBack, 0.913, 1.94, 0.015, aluminium, 0, 0, 0.061, false, 0.12);
  box(phoneBack, 0.042, 0.17, 0.04, edge, 0.487, 0.36, 0);
  box(phoneBack, 0.04, 0.24, 0.035, edge, -0.488, 0.34, 0);
  box(phoneBack, 0.04, 0.12, 0.035, edge, -0.488, 0.63, 0);

  const phoneBoard = new THREE.Group();
  phoneBoard.position.z = 0.081;
  phone.add(phoneBoard);
  movable(phoneBoard, 0, 0.03, 0.10);
  rounded(phoneBoard, 0.81, 1.78, 0.018, circuit, 0, 0, 0, false, 0.10);
  rounded(phoneBoard, 0.56, 0.33, 0.035, chip, 0.09, 0.62, 0.036, false, 0.025);
  for (let i = 0; i < 5; i++) box(phoneBoard, 0.07, 0.042, 0.025, copper, -0.31 + i * 0.14, 0.82, 0.028);
  rounded(phoneBoard, 0.32, 0.20, 0.028, chip, 0.17, -0.71, 0.029, false, 0.02);
  // Two optically coated lenses and their machined camera rings.
  for (const y of [0.56, 0.78]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.056, 24), aluminium);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(-0.245, y, 0.060);
    phoneBoard.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.061, 24), material('#0b202b', 0.67, 0.14));
    lens.position.set(-0.245, y, 0.090);
    phoneBoard.add(lens);
    const reflection = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), material('#637d86', 0.65, 0.1));
    reflection.position.set(-0.264, y + 0.022, 0.092);
    phoneBoard.add(reflection);
  }
  const phoneBattery = new THREE.Group();
  phoneBattery.position.set(0, -0.125, 0.109);
  phone.add(phoneBattery);
  movable(phoneBattery, -0.09, -0.05, 0.28);
  rounded(phoneBattery, 0.70, 1.03, 0.055, battery, 0, 0, 0, false, 0.05);
  rounded(phoneBattery, 0.44, 0.29, 0.006, material('#737975', 0.2, 0.7), 0, 0.09, 0.033, false, 0.01);
  box(phoneBattery, 0.25, 0.012, 0.008, edge, 0, 0.15, 0.039);
  box(phoneBattery, 0.18, 0.008, 0.008, edge, 0, 0.11, 0.039);
  box(phoneBattery, 0.30, 0.008, 0.008, edge, 0, 0.03, 0.039);
  box(phoneBattery, 0.09, 0.22, 0.018, orange, 0.2, 0.55, 0.01);

  const phoneDisplay = new THREE.Group();
  phoneDisplay.position.z = 0.154;
  phone.add(phoneDisplay);
  movable(phoneDisplay, 0.78, 0.21, 0.40);
  rounded(phoneDisplay, 0.925, 1.956, 0.045, screenRim, 0, 0, 0, false, 0.132);
  rounded(phoneDisplay, 0.856, 1.862, 0.012, dark, 0, 0, 0.033, false, 0.11);
  // ShapeGeometry keeps the phone's displayed image inside its rounded glass.
  const phoneScreenShape = new THREE.Shape();
  const sw = 0.818; const sh = 1.818; const sr = 0.085;
  phoneScreenShape.moveTo(-sw / 2 + sr, -sh / 2);
  phoneScreenShape.lineTo(sw / 2 - sr, -sh / 2);
  phoneScreenShape.quadraticCurveTo(sw / 2, -sh / 2, sw / 2, -sh / 2 + sr);
  phoneScreenShape.lineTo(sw / 2, sh / 2 - sr);
  phoneScreenShape.quadraticCurveTo(sw / 2, sh / 2, sw / 2 - sr, sh / 2);
  phoneScreenShape.lineTo(-sw / 2 + sr, sh / 2);
  phoneScreenShape.quadraticCurveTo(-sw / 2, sh / 2, -sw / 2, sh / 2 - sr);
  phoneScreenShape.lineTo(-sw / 2, -sh / 2 + sr);
  phoneScreenShape.quadraticCurveTo(-sw / 2, -sh / 2, -sw / 2 + sr, -sh / 2);
  const screenGeometry = new THREE.ShapeGeometry(phoneScreenShape, 8);
  const positions = screenGeometry.getAttribute('position');
  const uv = screenGeometry.getAttribute('uv');
  for (let i = 0; i < positions.count; i++) uv.setXY(i, (positions.getX(i) + sw / 2) / sw, (positions.getY(i) + sh / 2) / sh);
  const phoneScreen = new THREE.Mesh(screenGeometry, new THREE.MeshBasicMaterial({ map: phoneTexture, toneMapped: false }));
  phoneScreen.position.z = 0.043;
  phoneDisplay.add(phoneScreen);
  rounded(phoneDisplay, 0.25, 0.049, 0.009, dark, 0, 0.835, 0.052, false, 0.022);
  const selfie = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), material('#182b34', 0.75, 0.2));
  selfie.position.set(0.083, 0.835, 0.060);
  phoneDisplay.add(selfie);
  const port = rounded(phoneBack, 0.15, 0.037, 0.028, charging, 0, -0.993, 0, false, 0.009);
  port.rotation.x = Math.PI / 2;
  const portHole = rounded(phoneBack, 0.108, 0.018, 0.030, dark, 0, -1.009, 0, false, 0.005);
  portHole.rotation.x = Math.PI / 2;
  for (const x of [-0.28, -0.23, -0.18, 0.18, 0.23, 0.28]) {
    const hole = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), dark);
    hole.scale.y = 0.3;
    hole.position.set(x, -0.999, 0);
    phoneBack.add(hole);
  }

  // Original hand tools and fasteners remain secondary to the devices.
  const screwdriver = new THREE.Group();
  screwdriver.position.set(2.05, -0.49, -0.46);
  screwdriver.rotation.z = Math.PI / 2;
  screwdriver.rotation.y = 0.28;
  studio.add(screwdriver);
  cylinder(screwdriver, 0.070, 0.47, orange, 0, 0, 0, 20);
  cylinder(screwdriver, 0.049, 0.20, dark, 0, -0.32, 0, 16);
  cylinder(screwdriver, 0.025, 0.45, edge, 0, -0.63, 0, 12);
  cylinder(screwdriver, 0.085, 0.06, graphite, 0, 0.26, 0, 20);
  for (let i = 0; i < 5; i++) cylinder(screwdriver, 0.073, 0.009, dark, 0, -0.13 + i * 0.069, 0, 20);
  const tweezers = new THREE.Group();
  tweezers.position.set(-1.73, -0.505, 1.22);
  tweezers.rotation.y = 0.25;
  studio.add(tweezers);
  const tweezerLeft = box(tweezers, 0.034, 0.032, 0.93, aluminium, -0.050, 0, 0);
  tweezerLeft.rotation.y = -0.08;
  const tweezerRight = box(tweezers, 0.034, 0.032, 0.93, aluminium, 0.050, 0, 0);
  tweezerRight.rotation.y = 0.08;
  box(tweezers, 0.18, 0.026, 0.05, edge, 0, 0, -0.47);
  if (!mobile) {
    const tray = new THREE.Group();
    tray.position.set(1.84, -0.525, -1.04);
    studio.add(tray);
    rounded(tray, 0.79, 0.52, 0.05, graphite, 0, 0, 0, true, 0.08);
    rounded(tray, 0.65, 0.38, 0.008, dark, 0, 0.03, 0, true, 0.04);
    for (let i = 0; i < 6; i++) {
      const x = -0.21 + (i % 3) * 0.20;
      const z = -0.10 + Math.floor(i / 3) * 0.17;
      cylinder(tray, 0.021, 0.018, aluminium, x, 0.05, z, 10);
      box(tray, 0.024, 0.003, 0.005, dark, x, 0.061, z);
    }
  }
  for (let i = 0; i < (mobile ? 3 : 5); i++) {
    const x = 0.78 + Math.sin(i * 2.31) * 0.24;
    const z = 1.45 + Math.cos(i * 1.47) * 0.09;
    cylinder(studio, 0.022, 0.024, aluminium, x, -0.54, z, 10);
    box(studio, 0.026, 0.003, 0.004, dark, x, -0.526, z);
  }

  return { studio, laptop, phone, movingParts, focusMaterials, textures };
}

export default function DeviceScene({ progress, activeService, reducedMotion, language = 'fr', onUnavailable }: DeviceSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ progress, activeService, reducedMotion });
  const unavailable = useRef(onUnavailable);
  const invalidate = useRef<() => void>(() => {});
  state.current = { progress, activeService, reducedMotion };
  unavailable.current = onUnavailable;

  useEffect(() => { invalidate.current(); }, [progress, activeService, reducedMotion]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.devicePixelRatio <= 1.5, powerPreference: 'low-power' });
    } catch {
      unavailable.current();
      return;
    }

    const mobile = window.matchMedia('(max-width: 760px)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const reflectionRoom = new RoomEnvironment();
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    let environment: THREE.WebGLRenderTarget;
    try {
      environment = environmentGenerator.fromScene(reflectionRoom, 0.04, 0.1, 100, { size: mobile ? 128 : 256 });
    } catch {
      reflectionRoom.dispose();
      environmentGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      unavailable.current();
      return;
    }
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.85;
    reflectionRoom.dispose();
    environmentGenerator.dispose();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 60);
    const cameraTarget = new THREE.Vector3(0, 0.59, 0.08);
    const cameraBase = new THREE.Vector3(3.8, 3.9, 8.3);
    camera.position.copy(cameraBase);
    camera.lookAt(cameraTarget);
    scene.add(new THREE.HemisphereLight('#e8e2d4', '#343b3c', 2.1));
    const keyLight = new THREE.DirectionalLight('#fff0d8', 4.1);
    keyLight.position.set(-3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.normalBias = 0.025;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight('#ff9c62', 3.0);
    rimLight.position.set(4, 3, -4);
    scene.add(rimLight);
    const fill = new THREE.DirectionalLight('#c6d5db', 1.8);
    fill.position.set(4, 1.5, 6);
    scene.add(fill);

    let built: ReturnType<typeof createStudio>;
    try {
      built = createStudio(mobile, language, () => invalidate.current());
      scene.add(built.studio);
    } catch {
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      unavailable.current();
      return;
    }

    const pointer = new THREE.Vector2();
    const currentPointer = new THREE.Vector2();
    const highlight = new THREE.Color(ORANGE);
    let smoothedProgress = reducedMotion ? 0 : Math.min(1, Math.max(0, progress));
    let lastService = '';
    let animationFrame = 0;
    let inView = true;
    let disposed = false;
    let failed = false;
    let lastTime = performance.now();
    let elapsed = 0;
    let lastShadowProgress = -1;

    invalidate.current = () => {
      if (!disposed && !failed && inView && !document.hidden && !animationFrame) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    };

    function fail() {
      if (failed || disposed) return;
      failed = true;
      cancelAnimationFrame(animationFrame);
      unavailable.current();
    }

    function resize() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      // Preserve the full repair mat on narrow screens without shrinking the
      // devices excessively in the tall desktop panel.
      camera.fov = camera.aspect < 0.80 ? 41 : camera.aspect > 1.22 ? 34 : 37;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (!animationFrame && inView && !document.hidden) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (mobile || state.current.reducedMotion) return;
      const rect = container!.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width - 0.5) * 2, ((event.clientY - rect.top) / rect.height - 0.5) * 2);
    }

    function onPointerLeave() { pointer.set(0, 0); }

    function render(now: number) {
      animationFrame = 0;
      if (disposed || failed || !inView || document.hidden) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const reduced = state.current.reducedMotion;
      if (!reduced) elapsed += delta;
      const targetProgress = reduced ? 0 : Math.min(1, Math.max(0, state.current.progress));
      const blend = 1 - Math.exp(-delta * 5);
      smoothedProgress = reduced ? 0 : THREE.MathUtils.lerp(smoothedProgress, targetProgress, blend);
      const explode = smoothedProgress * smoothedProgress * (3 - 2 * smoothedProgress);
      // Reuse the contact shadow while the pose is stable. The very small idle
      // float does not justify another full shadow pass on every frame.
      if (Math.abs(explode - lastShadowProgress) > 0.006) {
        renderer.shadowMap.needsUpdate = true;
        lastShadowProgress = explode;
      }
      for (const part of built.movingParts) {
        part.object.position.copy(part.origin).addScaledVector(part.movement, explode);
      }
      const idle = reduced ? 0 : Math.sin(elapsed * 0.70) * 0.028;
      built.laptop.position.y = 0.11 + idle;
      built.phone.position.y = 0.60 + (reduced ? 0 : Math.sin(elapsed * 0.70 + 1.2) * 0.036);

      if (lastService !== state.current.activeService) {
        lastService = state.current.activeService;
        for (const focus of built.focusMaterials) {
          const active = focus.services.includes(lastService);
          focus.material.color.copy(focus.color);
          if (active) focus.material.color.lerp(highlight, 0.52);
          focus.material.emissive.copy(active ? highlight : focus.emissive);
          focus.material.emissiveIntensity = active ? 0.12 : 0;
        }
      }
      currentPointer.lerp(reduced ? pointer.set(0, 0) : pointer, blend);
      camera.position.copy(cameraBase);
      camera.position.x += currentPointer.x * 0.22;
      camera.position.y -= currentPointer.y * 0.17;
      camera.position.z += explode * 0.38;
      cameraTarget.y = 0.59 + explode * 0.22;
      camera.lookAt(cameraTarget);
      try {
        renderer.render(scene, camera);
      } catch {
        fail();
        return;
      }
      if (!reduced) animationFrame = requestAnimationFrame(render);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (inView && !animationFrame && !failed) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      fail();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (!animationFrame && !document.hidden && !failed) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    }, { rootMargin: '80px' });
    intersectionObserver.observe(container);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibilityChange);
    resize();

    return () => {
      disposed = true;
      invalidate.current = () => {};
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          for (const mat of objectMaterials) materials.add(mat);
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const mat of materials) mat.dispose();
      for (const texture of built.textures) {
        texture.userData.disposed = true;
        texture.dispose();
      }
      environment.dispose();
      keyLight.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [language]);

  return <div className="device-scene-canvas" ref={host} aria-hidden="true" data-scene-progress={reducedMotion ? 0 : Number(progress.toFixed(3))} style={{ width: '100%', height: '100%' }} />;
}
