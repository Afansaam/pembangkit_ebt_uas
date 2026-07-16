import * as THREE from 'three';
import { KHRLightsPunctual } from '@gltf-transform/extensions';
import {
  doc, buffer, rootNode, animation,
  makeMeshNode, makeGroup, makeCable3D, makeTextNode,
  addSpin, addSmokePuff, addFall, addBlink, addFloat,
  matRumput, matTanah1, matTanah2, matKayu, matKrem, matMerah, matDaun,
  matBatu, matAsap, matSolar, matAir, matLedHijau, matLedOranye,
  matKabelHijau, matKabelOranye,
  matBeton, matLogam, matLogamGelap, matUap, matBioTangki, matBioKubah,
  matBaterai, matKuning, matAirLaut, matLavaGlow, matTeks,
} from './build.js';

const rand = (a, b) => a + Math.random() * (b - a);

// ============================================================
// 1. PULAU BESAR / ALAS MAKET + AIR LAUT
// ============================================================
const R_AIR = 17.0, R_RUMPUT = 14.5, R_TANAH1 = 14.5, R_TANAH2 = 14.2;

makeMeshNode('Air_Laut',
  new THREE.CylinderGeometry(R_AIR, R_AIR, 0.1, 48),
  matAir, [0, -0.4, 0]);

makeMeshNode('Rumput_Permukaan',
  new THREE.CylinderGeometry(R_RUMPUT, R_RUMPUT, 0.5, 32),
  matRumput, [0, -0.25, 0]);

makeMeshNode('Lapisan_Tanah_1',
  new THREE.CylinderGeometry(R_TANAH1, R_TANAH1, 0.8, 20),
  matTanah1, [0, -0.9, 0]);

makeMeshNode('Lapisan_Tanah_2',
  new THREE.CylinderGeometry(R_TANAH2, R_TANAH2, 0.8, 16),
  matTanah2, [0, -1.7, 0]);

// Bukit-bukit kecil (dihindari area zona utama)
const zonaLarangan = [
  [0, 8, 5], [8.5, 3, 4.5], [-8.5, 2, 4.5], [5, -2, 3.5], [7, -6, 3.5],
  [2, -8, 4], [-3.5, -5.5, 3], [-6.5, -5, 3], [-3, 3, 2.5],
];
function bebasZona(x, z, margin = 0.5) {
  return zonaLarangan.every(([zx, zz, zr]) => Math.hypot(x - zx, z - zz) > zr + margin);
}

let bukitCount = 0;
for (let i = 0; i < 22 && bukitCount < 12; i++) {
  const bx = rand(-12, 12), bz = rand(-12, 12);
  if (Math.hypot(bx, bz) < 13 && bebasZona(bx, bz)) {
    makeMeshNode('Bukit_' + bukitCount,
      new THREE.IcosahedronGeometry(rand(0.4, 1.3), 1),
      matRumput, [bx, -0.1, bz], [0, 0, 0], [1.6, 0.5, 1.6]);
    bukitCount++;
  }
}

let batuCount = 0;
for (let i = 0; i < 30 && batuCount < 16; i++) {
  const bx = rand(-13, 13), bz = rand(-13, 13);
  if (Math.hypot(bx, bz) < 13.5 && bebasZona(bx, bz, 0.2)) {
    makeMeshNode('Batu_' + batuCount,
      new THREE.IcosahedronGeometry(rand(0.15, 0.35), 1),
      matBatu, [bx, 0.05, bz], [0, 0, 0], [1, rand(0.5, 1), rand(0.7, 1.3)]);
    batuCount++;
  }
}

// ============================================================
// 2. POHON PINUS (tersebar di sekeliling pulau)
// ============================================================
function buatPohon(name, x, z, skala) {
  const grup = makeGroup(name, [x, 0, z]);
  makeMeshNode(name + '_Batang',
    new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8),
    matKayu, [0, 0.3 * skala, 0], [0, 0, 0], [skala, skala, skala], grup);
  [0.5, 0.9, 1.3].forEach((zOff, i) => {
    makeMeshNode(name + '_Daun' + i,
      new THREE.ConeGeometry(0.6 - i * 0.1, 0.8, 7),
      matDaun, [0, zOff * skala, 0], [0, rand(0, Math.PI * 2), 0],
      [skala, skala, skala], grup);
  });
}
let pohonCount = 0;
for (let i = 0; i < 60 && pohonCount < 26; i++) {
  const sudut = rand(0, Math.PI * 2);
  const jarak = rand(9, 13.5);
  const px = Math.cos(sudut) * jarak, pz = Math.sin(sudut) * jarak;
  if (bebasZona(px, pz, 0.8)) {
    buatPohon('Pohon_' + pohonCount, px, pz, rand(0.8, 1.5));
    pohonCount++;
  }
}

// ============================================================
// 3. PLTB — KINCIR ANGIN KLASIK (BERPUTAR)
// ============================================================
function buatKincir(name, x, z, skala, spinDuration) {
  const grup = makeGroup(name, [x, 0, z]);

  makeMeshNode(name + '_Badan',
    new THREE.CylinderGeometry(0.5, 0.8, 2.5, 8),
    matKrem, [0, 1.25 * skala, 0], [0, 0, 0], [skala, skala, skala], grup);

  makeMeshNode(name + '_Atap',
    new THREE.ConeGeometry(0.6, 1.0, 8),
    matMerah, [0, 2.7 * skala, 0], [0, 0, 0], [skala, skala, skala], grup);

  makeMeshNode(name + '_Pintu',
    new THREE.BoxGeometry(1, 1, 1),
    matKayu, [0.75 * skala, 0.4 * skala, 0], [0, 0, 0], [0.1, 0.8 * skala, 0.4 * skala], grup);

  const poros = makeGroup(name + '_Poros', [0.6 * skala, 2.5 * skala, 0], [0, 0, 0], grup);
  makeMeshNode(name + '_PorosInti',
    new THREE.BoxGeometry(1, 1, 1),
    matKayu, [0, 0, 0], [0, 0, 0], [0.2, 0.2, 0.2], poros);

  for (let i = 0; i < 4; i++) {
    const sudut = (i * Math.PI) / 2;
    const lengan = makeGroup(name + '_Lengan' + i, [0, 0, 0], [sudut, 0, 0], poros);
    makeMeshNode(name + '_LenganBatang' + i,
      new THREE.BoxGeometry(1, 1, 1),
      matKayu, [0.1 * skala, 0, 0], [0, 0, 0], [1.8 * skala, 0.05, 0.05], lengan);
    makeMeshNode(name + '_LenganLayar' + i,
      new THREE.BoxGeometry(1, 1, 1),
      matMerah, [0.5 * skala, 0.2 * skala, 0], [0, 0, 0], [0.8 * skala, 0.3 * skala, 0.02], lengan);
  }
  addSpin(poros, [1, 0, 0], spinDuration, 24);
  return grup;
}
buatKincir('PLTB_Kincir_1', -6.5, -5.0, 1.6, 2.2);
buatKincir('PLTB_Kincir_2', -3.0, 3.0, 1.1, 3.0);

// ============================================================
// 4. PUSAT KONTROL & DISTRIBUSI (hub) + LED + CEROBONG + ASAP
// ============================================================
const stasiun = makeGroup('Pusat_Kontrol', [5.0, 0, -2.0]);

makeMeshNode('Kontrol_Badan',
  new THREE.BoxGeometry(2, 2, 2),
  matKrem, [0, 1.0, 0], [0, 0, 0], [1.2, 1.0, 1.0], stasiun);

makeMeshNode('Kontrol_Atap',
  new THREE.ConeGeometry(2.0, 1.5, 4),
  matMerah, [0, 2.7, 0], [0, Math.PI / 4, 0], [0.9, 1.0, 1.0], stasiun);

makeMeshNode('Kontrol_Pintu',
  new THREE.BoxGeometry(1, 1, 1),
  matKayu, [-1.3, 0.5, 0], [0, 0, 0], [0.1, 1.0, 0.6], stasiun);

const led1 = makeMeshNode('Kontrol_LED_Hijau',
  new THREE.IcosahedronGeometry(0.1, 1),
  matLedHijau, [-1.2, 1.5, -0.5], [0, 0, 0], [1, 1, 1], stasiun);
addBlink(led1, 1.6, 16, 0.7, 1.3);

const led2 = makeMeshNode('Kontrol_LED_Oranye',
  new THREE.IcosahedronGeometry(0.1, 1),
  matLedOranye, [-1.2, 1.5, -0.1], [0, 0, 0], [1, 1, 1], stasiun);
addBlink(led2, 2.1, 16, 0.7, 1.3);

makeMeshNode('Kontrol_Cerobong',
  new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8),
  matBatu, [0.5, 3.2, 0.7], [0, 0, 0], [1, 1, 1], stasiun);

for (let i = 0; i < 3; i++) {
  const asap = makeMeshNode('Kontrol_Asap_' + i,
    new THREE.IcosahedronGeometry(0.25, 1),
    matAsap, [0.5, 3.7, 0.7], [0, 0, 0], [1, 1, 1], stasiun);
  addSmokePuff(asap, 1.8, 4.0, i * (Math.PI * 2 / 3));
}

// ============================================================
// 5. PLTS — PANEL SURYA (GLOWING BLUE) — SUSUNAN 3x3
// ============================================================
const dudukan = makeGroup('PLTS_Dudukan', [2.0, 0, -8.0]);
makeMeshNode('PLTS_Alas',
  new THREE.BoxGeometry(1, 1, 1),
  matKrem, [0, 0.2, 0], [0, 0, 0], [3.6, 0.1, 2.2], dudukan);

[-1.2, 0, 1.2].forEach((xOff) => {
  [-0.7, 0, 0.7].forEach((zOff) => {
    makeMeshNode('PLTS_Tiang_' + xOff + '_' + zOff,
      new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
      matKayu, [xOff, 0.4, zOff], [0, 0, 0], [1, 1, 1], dudukan);
    makeMeshNode('PLTS_Panel_' + xOff + '_' + zOff,
      new THREE.BoxGeometry(1, 1, 1),
      matSolar, [xOff, 0.6, zOff], [(20 * Math.PI) / 180, 0, 0],
      [0.55, 0.05, 0.55], dudukan);
    makeMeshNode('PLTS_Bingkai_' + xOff + '_' + zOff,
      new THREE.BoxGeometry(1, 1, 1),
      matKrem, [xOff, 0.58, zOff], [(20 * Math.PI) / 180, 0, 0],
      [0.6, 0.05, 0.6], dudukan);
  });
});

// ============================================================
// 6. PLTA — BENDUNGAN (GRAVITY DAM) + WADUK + AIR TERJUN + RUMAH TURBIN
// ============================================================
const plta = makeGroup('PLTA_Zona', [0, 0, 9.0]);

// Dua bukit pengapit (abutment) kiri-kanan — dibuat lebih tinggi supaya
// benar-benar "memeluk" lembah tempat waduk berada (bukan cuma gundukan kecil)
[-2.7, 2.7].forEach((dx, i) => {
  makeMeshNode('PLTA_Bukit_' + i,
    new THREE.IcosahedronGeometry(1.3, 2),
    matRumput, [dx, 0.9, -0.3], [0, 0, 0], [1.4, 1.9, 2.6], plta);
});

// Dinding bendungan gravitasi — 3 tingkat menyempit ke atas (trapesium)
const tingkatBendungan = [
  { oz: 0.55, lx: 4.6, ly: 1.1, lz: 1.1 },
  { oz: 1.30, lx: 3.8, ly: 0.85, lz: 0.45 },
  { oz: 1.68, lx: 3.0, ly: 0.65, lz: 0.30 },
];
tingkatBendungan.forEach(({ oz, lx, ly, lz }, i) => {
  makeMeshNode('PLTA_DindingBendungan_' + i,
    new THREE.BoxGeometry(1, 1, 1),
    matBeton, [0, oz, 0], [0, 0, 0], [lx, lz, ly], plta);
});
const damCrestZ = 1.68 + 0.30 / 2; // puncak bendungan ~1.83

// "Dataran" tanah padat di bawah waduk — ini yang bikin airnya terlihat
// duduk di atas tanah/cekungan sungguhan, bukan melayang di udara
const plateauTop = damCrestZ - 0.19; // pas menyentuh dasar air
makeMeshNode('PLTA_DataranWaduk',
  new THREE.BoxGeometry(1, 1, 1),
  matTanah1, [0, plateauTop / 2, -1.05], [0, 0, 0], [4.1, plateauTop, 2.2], plta);
makeMeshNode('PLTA_DataranWaduk_Tepi',
  new THREE.BoxGeometry(1, 1, 1),
  matRumput, [0, plateauTop - 0.03, -1.05], [0, 0, 0], [4.2, 0.1, 2.3], plta);

// Waduk (reservoir) — sekarang duduk tepat di atas dataran, bukan melayang
makeMeshNode('PLTA_Waduk',
  new THREE.BoxGeometry(1, 1, 1),
  matAir, [0, plateauTop + 0.04, -1.05], [0, 0, 0], [3.8, 0.08, 1.9], plta);

// Pipa pesat (penstock) di sisi hilir menyalurkan air ke rumah turbin
[-0.9, 0.9].forEach((dx) => {
  makeMeshNode('PLTA_PipaPesat_' + dx,
    new THREE.CylinderGeometry(0.18, 0.18, 2.3, 10),
    matLogam, [dx, damCrestZ - 1.1, 0.75], [Math.PI * 28 / 180, 0, 0], [1, 1, 1], plta);
});

// Rumah turbin di dasar sisi hilir
makeMeshNode('PLTA_Rumah_Turbin',
  new THREE.BoxGeometry(2.2, 1.4, 1.4),
  matKrem, [0, 0.4, 2.0], [0, 0, 0], [1, 1, 1], plta);
makeMeshNode('PLTA_Rumah_Turbin_Atap',
  new THREE.ConeGeometry(1.7, 0.8, 4),
  matMerah, [0, 1.5, 2.0], [0, Math.PI / 4, 0], [1, 1, 1], plta);

// Turbin yang berputar (terlihat dari sisi rumah turbin)
const turbinPoros = makeGroup('PLTA_Turbin_Poros', [1.2, 0.6, 2.0], [0, 0, Math.PI / 2], plta);
makeMeshNode('PLTA_Turbin_Roda',
  new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16),
  matLogamGelap, [0, 0, 0], [0, 0, 0], [1, 1, 1], turbinPoros);
for (let i = 0; i < 6; i++) {
  const sd = (i * Math.PI) / 3;
  makeMeshNode('PLTA_Turbin_Sudu_' + i,
    new THREE.BoxGeometry(1, 1, 1),
    matLogam, [Math.cos(sd) * 0.25, Math.sin(sd) * 0.25, 0], [0, 0, sd],
    [0.35, 0.08, 0.1], turbinPoros);
}
addSpin(turbinPoros, [0, 0, 1], 1.4, 24);

// Kolam penampung (tailrace) di bawah air terjun, dengan tepi batu supaya
// tidak terlihat seperti air ngambang di rumput
makeMeshNode('PLTA_KolamBawah_Tepi',
  new THREE.CylinderGeometry(1.6, 1.6, 0.12, 20),
  matBatu, [0, -0.06, 2.9], [0, 0, 0], [1, 1, 1], plta);
makeMeshNode('PLTA_Kolam_Bawah',
  new THREE.CylinderGeometry(1.45, 1.45, 0.1, 20),
  matAir, [0, 0.01, 2.9], [0, 0, 0], [1, 1, 1], plta);

// Air terjun / spillway di tengah wajah hilir bendungan
for (let i = 0; i < 4; i++) {
  const drop = makeMeshNode('PLTA_AirTerjun_' + i,
    new THREE.IcosahedronGeometry(0.16, 0),
    matAir, [0, damCrestZ - 0.1, 0.5], [0, 0, 0], [1, 1.6, 1], plta);
  addFall(drop, damCrestZ, 1.6, i * 0.4);
}

// ============================================================
// 7. PLTP — PANAS BUMI: MENARA PENDINGIN + SUMUR UAP
// ============================================================
const pltp = makeGroup('PLTP_Zona', [9.0, 0, 3.5]);

// Menara pendingin (bentuk hiperboloid via LatheGeometry)
const profilMenara = [
  [1.4, 0], [1.05, 0.9], [0.85, 1.9], [0.78, 2.8],
  [0.88, 3.7], [1.1, 4.5], [1.3, 5.2],
].map(([x, y]) => new THREE.Vector2(x, y));
makeMeshNode('PLTP_MenaraPendingin',
  new THREE.LatheGeometry(profilMenara, 20),
  matBeton, [0, 0, 0], [0, 0, 0], [1, 1, 1], pltp);

// Bangunan turbin uap
makeMeshNode('PLTP_Rumah_Turbin',
  new THREE.BoxGeometry(1.8, 1.2, 1.4),
  matKrem, [2.2, 0.6, 0.3], [0, 0, 0], [1, 1, 1], pltp);
makeMeshNode('PLTP_Rumah_Turbin_Atap',
  new THREE.ConeGeometry(1.4, 0.7, 4),
  matMerah, [2.2, 1.55, 0.3], [0, Math.PI / 4, 0], [1, 1, 1], pltp);

// Pipa uap dari sumur ke menara & rumah turbin
makeMeshNode('PLTP_Pipa_1',
  new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8),
  matLogam, [1.1, 0.5, 0.15], [0, 0, Math.PI / 2], [1, 1, 1], pltp);

// Sumur uap (2) dengan uap mengepul
[[3.3, -1.2], [3.6, 1.6]].forEach(([sx, sz], i) => {
  makeMeshNode('PLTP_SumurUap_' + i,
    new THREE.CylinderGeometry(0.18, 0.22, 0.4, 10),
    matLogamGelap, [sx, 0.2, sz], [0, 0, 0], [1, 1, 1], pltp);
  for (let j = 0; j < 2; j++) {
    const uap = makeMeshNode('PLTP_Uap_' + i + '_' + j,
      new THREE.IcosahedronGeometry(0.22, 1),
      matUap, [sx, 0.45, sz], [0, 0, 0], [1, 1, 1], pltp);
    addSmokePuff(uap, 1.6, 3.2, j * 1.6 + i * 0.5);
  }
});

// Indikator panas (glow oranye di dasar menara)
makeMeshNode('PLTP_Indikator_Panas',
  new THREE.CylinderGeometry(1.35, 1.35, 0.05, 20),
  matLavaGlow, [0, 0.03, 0], [0, 0, 0], [1, 1, 1], pltp);

// ============================================================
// 8. PLT BIOMASSA / BIOGAS — DIGESTER + SILO + GENERATOR
// ============================================================
const bio = makeGroup('Biomassa_Zona', [-9.0, 0, 2.5]);

// Dua tangki digester (tabung + kubah)
[[-1.0, 0], [1.0, 0.3]].forEach(([bx, bz], i) => {
  makeMeshNode('Bio_Tangki_' + i,
    new THREE.CylinderGeometry(0.9, 0.9, 1.6, 16),
    matBioTangki, [bx, 0.8, bz], [0, 0, 0], [1, 1, 1], bio);
  makeMeshNode('Bio_Kubah_' + i,
    new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    matBioKubah, [bx, 1.6, bz], [0, 0, 0], [1, 1, 1], bio);
});

// Silo penyimpanan (tabung ramping + tutup kerucut)
makeMeshNode('Bio_Silo',
  new THREE.CylinderGeometry(0.45, 0.45, 2.2, 12),
  matKrem, [-2.4, 1.1, 0.6], [0, 0, 0], [1, 1, 1], bio);
makeMeshNode('Bio_Silo_Atap',
  new THREE.ConeGeometry(0.5, 0.5, 12),
  matMerah, [-2.4, 2.45, 0.6], [0, 0, 0], [1, 1, 1], bio);

// Pipa penghubung tangki-tangki
makeCable3D('Bio_Pipa_Tangki', [-1.0, 0.8, 0], [1.0, 0.8, 0.3], 0.08, matLogam, bio);

// Rumah generator + cerobong dengan asap
makeMeshNode('Bio_Rumah_Generator',
  new THREE.BoxGeometry(1.6, 1.2, 1.2),
  matKrem, [0, 0.6, 1.8], [0, 0, 0], [1, 1, 1], bio);
makeMeshNode('Bio_Rumah_Generator_Atap',
  new THREE.ConeGeometry(1.3, 0.6, 4),
  matMerah, [0, 1.5, 1.8], [0, Math.PI / 4, 0], [1, 1, 1], bio);
makeMeshNode('Bio_Cerobong',
  new THREE.CylinderGeometry(0.13, 0.13, 0.9, 8),
  matBatu, [0.6, 2.1, 2.2], [0, 0, 0], [1, 1, 1], bio);
for (let i = 0; i < 3; i++) {
  const asap = makeMeshNode('Bio_Asap_' + i,
    new THREE.IcosahedronGeometry(0.22, 1),
    matAsap, [0.6, 2.6, 2.2], [0, 0, 0], [1, 1, 1], bio);
  addSmokePuff(asap, 1.6, 3.6, i * 1.2);
}

// ============================================================
// 9. PLT OMBAK — PELAMPUNG GELOMBANG LAUT MENGAMBANG
// ============================================================
const ombak = makeGroup('PLT_Ombak_Zona', [-8.5, 0, -9.5]);

// Kotak sambungan di darat
makeMeshNode('Ombak_KotakSambungan',
  new THREE.BoxGeometry(0.6, 0.5, 0.6),
  matLogamGelap, [1.5, 0.25, -1.0], [0, 0, 0], [1, 1, 1], ombak);

// 4 pelampung mengapung di laut, naik-turun meniru ombak, kabel ke darat
const posisiPelampung = [[-1.0, -3.2], [-2.3, -4.0], [0.4, -4.6], [-1.4, -5.6]];
posisiPelampung.forEach(([px, pz], i) => {
  const pelampung = makeGroup('Ombak_Pelampung_' + i, [px, -0.3, pz], [0, 0, 0], ombak);
  makeMeshNode('Ombak_Pelampung_Body_' + i,
    new THREE.CylinderGeometry(0.4, 0.5, 0.35, 14),
    matAirLaut, [0, 0, 0], [0, 0, 0], [1, 1, 1], pelampung);
  makeMeshNode('Ombak_Pelampung_Tiang_' + i,
    new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
    matLogam, [0, 0.45, 0], [0, 0, 0], [1, 1, 1], pelampung);
  const lampu = makeMeshNode('Ombak_Pelampung_Lampu_' + i,
    new THREE.IcosahedronGeometry(0.07, 1),
    matLedOranye, [0, 0.75, 0], [0, 0, 0], [1, 1, 1], pelampung);
  addBlink(lampu, 1.4 + i * 0.2, 12, 0.6, 1.3);
  addFloat(pelampung, 0.18, 2.4 + i * 0.3, 16, i * 1.5);
});

// Kabel bawah laut dari pelampung ke kotak sambungan
posisiPelampung.forEach(([px, pz], i) => {
  makeCable3D('Ombak_Kabel_' + i, [1.5, -0.05, -1.0], [px, -0.35, pz], 0.03, matKabelOranye, ombak);
});

// ============================================================
// 10. GARDU INDUK (SUBSTATION) + BATERAI PENYIMPANAN (BESS)
// ============================================================
const gardu = makeGroup('GarduInduk_Zona', [7.0, 0, -6.0]);

// Platform gardu
makeMeshNode('Gardu_Platform',
  new THREE.BoxGeometry(1, 1, 1),
  matBeton, [0, 0.05, 0], [0, 0, 0], [3.4, 0.1, 2.6], gardu);

// Pagar sudut (tiang kuning-hitam sebagai penanda area berbahaya)
[[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]].forEach(([px, pz], i) => {
  makeMeshNode('Gardu_TiangPagar_' + i,
    new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8),
    matKuning, [px, 0.55, pz], [0, 0, 0], [1, 1, 1], gardu);
});

// Trafo (transformer) x2 dengan insulator di atas
[-0.9, 0.9].forEach((tx, i) => {
  makeMeshNode('Gardu_Trafo_' + i,
    new THREE.BoxGeometry(0.9, 0.7, 0.9),
    matLogam, [tx, 0.45, -0.4], [0, 0, 0], [1, 1, 1], gardu);
  for (let k = 0; k < 3; k++) {
    makeMeshNode('Gardu_Isolator_' + i + '_' + k,
      new THREE.CylinderGeometry(0.05, 0.06, 0.25, 8),
      matKrem, [tx - 0.25 + k * 0.25, 0.92, -0.4], [0, 0, 0], [1, 1, 1], gardu);
  }
});

// Baterai penyimpanan energi (BESS) — 3 kontainer
[-1.0, 0, 1.0].forEach((bx, i) => {
  makeMeshNode('Baterai_Kontainer_' + i,
    new THREE.BoxGeometry(0.8, 0.8, 1.4),
    matBaterai, [bx, 0.4, 1.0], [0, 0, 0], [1, 1, 1], gardu);
  const ledB = makeMeshNode('Baterai_LED_' + i,
    new THREE.IcosahedronGeometry(0.05, 1),
    matLedHijau, [bx, 0.85, 1.6], [0, 0, 0], [1, 1, 1], gardu);
  addBlink(ledB, 1.2 + i * 0.3, 12, 0.6, 1.3);
});

// ============================================================
// 11. MENARA TRANSMISI (SUTET) — GARDU INDUK KE TEPI PULAU
// ============================================================
function buatMenaraTransmisi(name, x, z, tinggi) {
  const grup = makeGroup(name, [x, 0, z]);
  makeMeshNode(name + '_Tiang',
    new THREE.CylinderGeometry(0.06, 0.18, tinggi, 6),
    matLogamGelap, [0, tinggi / 2, 0], [0, 0, 0], [1, 1, 1], grup);
  [0.75, 0.55].forEach((frac, i) => {
    makeMeshNode(name + '_Palang_' + i,
      new THREE.BoxGeometry(1, 1, 1),
      matLogamGelap, [0, tinggi * frac, 0], [0, 0, 0],
      [1.4 - i * 0.3, 0.05, 0.05], grup);
  });
  return { grup, top: [x, tinggi * 0.78, z] };
}
const menara1 = buatMenaraTransmisi('Menara_1', 8.5, -8.5, 2.6);
const menara2 = buatMenaraTransmisi('Menara_2', 10.5, -10.0, 2.3);
const menara3 = buatMenaraTransmisi('Menara_3', 12.5, -11.5, 2.0);

makeCable3D('Kabel_Gardu_Menara1', [7.0, 1.0, -6.9], menara1.top, 0.03, matLogamGelap);
makeCable3D('Kabel_Menara1_Menara2', menara1.top, menara2.top, 0.03, matLogamGelap);
makeCable3D('Kabel_Menara2_Menara3', menara2.top, menara3.top, 0.03, matLogamGelap);

// ============================================================
// 12. JALUR KABEL ENERGI LOKAL (GLOWING) ANTAR PEMBANGKIT & HUB
// ============================================================
function buatJalurEnergi(name, start, end, material) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const jarak = Math.hypot(dx, dz);
  const sudutY = Math.atan2(dx, dz);
  const midX = start[0] + dx / 2;
  const midZ = start[1] + dz / 2;
  makeMeshNode(name,
    new THREE.CylinderGeometry(0.04, 0.04, jarak, 6),
    material, [midX, 0.05, midZ], [0, sudutY, Math.PI / 2]);
}
buatJalurEnergi('Kabel_Kincir1_ke_Kontrol', [-6.5, -5.0], [5.0, -2.0], matKabelHijau);
buatJalurEnergi('Kabel_Kincir2_ke_Kontrol', [-3.0, 3.0], [5.0, -2.0], matKabelHijau);
buatJalurEnergi('Kabel_PLTS_ke_Kontrol', [2.0, -8.0], [5.0, -2.0], matKabelOranye);
buatJalurEnergi('Kabel_Kontrol_ke_Gardu', [5.0, -2.0], [7.0, -6.0], matKabelOranye);
buatJalurEnergi('Kabel_PLTA_ke_Kontrol', [0, 9.0], [5.0, -2.0], matKabelHijau);
buatJalurEnergi('Kabel_PLTP_ke_Gardu', [9.0, 3.5], [7.0, -6.0], matKabelOranye);
buatJalurEnergi('Kabel_Bio_ke_Kontrol', [-9.0, 2.5], [5.0, -2.0], matKabelHijau);

// ============================================================
// 13. LABEL TEKS 3D MENGAMBANG DI SETIAP ZONA
// ============================================================
function buatLabel(nama, teks, x, z, tinggi, faseFloat) {
  const grup = makeGroup(nama, [x, tinggi, z]);
  makeMeshNode(nama + '_Tiang',
    new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6),
    matKayu, [0, -0.35, 0], [0, 0, 0], [1, 1, 1], grup);
  makeTextNode(teks, [0, 0, 0], matTeks, { size: 0.42, extrude: 0.06, tiltDeg: -18, parent: grup });
  addFloat(grup, 0.12, 3.5, 16, faseFloat);
  return grup;
}
buatLabel('Label_PLTB', 'PLTB - TURBIN ANGIN', -6.5, -5.0, 6.4, 0);
buatLabel('Label_PLTS', 'PLTS - PANEL SURYA', 2.0, -8.0, 3.0, 2.1);
buatLabel('Label_Kontrol', 'PUSAT KONTROL', 5.0, -2.0, 4.9, 4.2);
buatLabel('Label_PLTA', 'PLTA - BENDUNGAN AIR', 0, 9.0, 6.6, 1.0);
buatLabel('Label_PLTP', 'PLTP - PANAS BUMI', 9.0, 3.5, 7.0, 3.0);
buatLabel('Label_Biomassa', 'BIOMASSA / BIOGAS', -9.0, 2.5, 4.8, 5.0);
buatLabel('Label_Ombak', 'PLT OMBAK LAUT', -8.5, -9.5, 2.4, 2.6);
buatLabel('Label_GarduBaterai', 'GARDU INDUK + BATERAI', 7.0, -6.0, 3.2, 0.8);

// ============================================================
// 14. LAMPU MATAHARI (KHR_lights_punctual)
// ============================================================
const lightsExt2 = doc.createExtension(KHRLightsPunctual);
const sunLight = lightsExt2.createLight('Matahari')
  .setType('directional')
  .setIntensity(3.5)
  .setColor([1.0, 0.96, 0.88]);
const sunNode = doc.createNode('Matahari_Node')
  .setExtension('KHR_lights_punctual', sunLight)
  .setRotation([0.25, 0.15, 0, 0.95]);
rootNode.addChild(sunNode);

console.log('Scene lengkap (PLTB, PLTS, PLTA, PLTP, Biomassa, Ombak, Gardu+Baterai, SUTET) selesai dibangun.');
console.log('Total node:', doc.getRoot().listNodes().length);
console.log('Total mesh:', doc.getRoot().listMeshes().length);
console.log('Total animasi channel:', animation.listChannels().length);

export { doc, buffer, animation };
