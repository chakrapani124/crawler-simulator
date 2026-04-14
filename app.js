/**
 * ============================================================
 *  RL Crawler — Telemetry Dash Logic
 *  Three.js + Chart.js
 * ============================================================
 */

'use strict';

// Constants
const GOAL_REACH_DIST = 1.2;
const MAX_STEPS = 1000000;

// Simulation State
let state = {
  running: true,
  steps: 0,
  episodes: 0,
  episodeSteps: 0,
  meanReward: 0.125,
  episodeReturn: 0,
  distance: 0,
  headingError: 0,
  velocity: 0,
  fps: 0,
  agentState: 'Seeking Target',
  chartData: Array(30).fill(0),
};

// Three.js Globals
let scene, camera, renderer, clock;
let crawler, goalCube, ground;
let crawlerParts = { 
  legs: [], 
  upperSegments: [], 
  lowerSegments: [], 
  armPivots: [], 
  forearmPivots: [] 
};
let targetPos = new THREE.Vector3(8, 0, 8);
let lastTime = 0;

// Chart.js Globals
let rewardChart;

/* ============================================================
   INITIALIZATION
   ============================================================ */
function init() {
  initThree();
  initUI();
  initChart();
  
  window.addEventListener('resize', onResize);
  requestAnimationFrame(animate);
}

function initThree() {
  const container = document.getElementById('three-container');
  const w = container.clientWidth;
  const h = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.Fog(0x05070a, 20, 100);

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera.position.set(-15, 12, -15);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Lighting
  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  scene.add(sun);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x111827,
    roughness: 0.8,
    metalness: 0.2
  });
  ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(100, 50, 0x1f2937, 0x111827);
  grid.position.y = 0.01;
  scene.add(grid);

  // Goal Cube
  const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const cubeMat = new THREE.MeshStandardMaterial({ 
    color: 0x4ade80, 
    emissive: 0x4ade80, 
    emissiveIntensity: 0.5 
  });
  goalCube = new THREE.Mesh(cubeGeo, cubeMat);
  goalCube.position.copy(targetPos);
  goalCube.position.y = 0.6;
  goalCube.castShadow = true;
  scene.add(goalCube);

  // Crawler
  buildCrawler();
}

function buildCrawler() {
  crawler = new THREE.Group();
  
  // Materials
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.1 });
  const yellowMat = new THREE.MeshStandardMaterial({ 
    color: 0xfacc15, 
    emissive: 0xfacc15, 
    emissiveIntensity: 0.3,
    metalness: 0.8, 
    roughness: 0.2 
  });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const greenMat = new THREE.MeshStandardMaterial({ 
    color: 0x4ade80, 
    emissive: 0x4ade80, 
    emissiveIntensity: 0.8 
  });

  // 1. Lower Body Ring (Blue)
  const ringGeo = new THREE.TorusGeometry(0.7, 0.15, 32, 64);
  const ring = new THREE.Mesh(ringGeo, blueMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.1;
  ring.castShadow = true;
  crawler.add(ring);

  // 2. Main Body Hub (White Core)
  const hubGeo = new THREE.CylinderGeometry(0.65, 0.6, 0.3, 32);
  const hub = new THREE.Mesh(hubGeo, whiteMat);
  hub.position.y = 0.25;
  hub.castShadow = true;
  crawler.add(hub);

  // 3. Top Yellow Disc
  const topGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32);
  const top = new THREE.Mesh(topGeo, yellowMat);
  top.position.y = 0.45;
  top.castShadow = true;
  crawler.add(top);

  // 4. Directional Indicator (Arrow)
  const arrowGroup = new THREE.Group();
  const coneGeo = new THREE.ConeGeometry(0.15, 0.4, 16);
  const cone = new THREE.Mesh(coneGeo, greenMat);
  cone.rotation.z = -Math.PI / 2; // Point forward (+Z context, but Three.js Y is up, let's rotate)
  cone.position.set(0, 0, 0.4);
  cone.rotation.x = Math.PI / 2;
  arrowGroup.add(cone);

  const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
  const shaft = new THREE.Mesh(shaftGeo, greenMat);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.1;
  arrowGroup.add(shaft);

  arrowGroup.position.y = 0.7;
  crawler.add(arrowGroup);

  // 5. Articulated Legs
  const angles = [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
  angles.forEach((angle, i) => {
    // Upper Segment Pillar (on the ring)
    const legAnchor = new THREE.Group();
    legAnchor.position.set(Math.cos(angle)*0.7, 0.1, Math.sin(angle)*0.7);
    legAnchor.rotation.y = angle;
    crawler.add(legAnchor);

    // Upper Leg (Blue)
    const upperPivot = new THREE.Group();
    legAnchor.add(upperPivot);
    crawlerParts.armPivots.push(upperPivot);

    const upperLegGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 12);
    const upperLeg = new THREE.Mesh(upperLegGeo, blueMat);
    upperLeg.rotation.z = -Math.PI / 3;
    upperLeg.position.set(0.2, 0, 0);
    upperLeg.castShadow = true;
    upperPivot.add(upperLeg);

    // Spherical Joint
    const jointGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const joint = new THREE.Mesh(jointGeo, whiteMat);
    joint.position.set(0.4, -0.35, 0); // Position at end of upper leg
    upperPivot.add(joint);

    // Lower Leg (White)
    const lowerPivot = new THREE.Group();
    lowerPivot.position.set(0.4, -0.35, 0);
    upperPivot.add(lowerPivot);
    crawlerParts.forearmPivots.push(lowerPivot);

    const lowerLegGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.0, 12);
    const lowerLeg = new THREE.Mesh(lowerLegGeo, whiteMat);
    lowerLeg.position.y = -0.5;
    lowerLeg.rotation.z = Math.PI / 6;
    lowerLeg.castShadow = true;
    lowerPivot.add(lowerLeg);
    
    // Foot
    const footGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const foot = new THREE.Mesh(footGeo, blackMat);
    foot.position.set(0.25, -0.9, 0);
    lowerPivot.add(foot);
  });

  crawler.position.y = 1.0;
  scene.add(crawler);
}

function initUI() {
  document.getElementById('btn-reset').addEventListener('click', resetEpisode);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
}

function initChart() {
  const ctx = document.getElementById('reward-chart').getContext('2d');
  rewardChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(30).fill(''),
      datasets: [{
        label: 'Reward History',
        data: state.chartData,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { 
          display: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

/* ============================================================
   SIMULATION LOGIC
   ============================================================ */
function updateSimulation(dt) {
  if (!state.running) return;

  state.steps++;
  state.episodeSteps++;

  // 1. Calculate relative vectors
  const toTarget = new THREE.Vector3().subVectors(goalCube.position, crawler.position);
  toTarget.y = 0;
  state.distance = toTarget.length();

  // 2. Calculate Heading Error
  const currentDir = new THREE.Vector3(0, 0, 1).applyQuaternion(crawler.quaternion);
  const targetDir = toTarget.clone().normalize();
  
  let angle = Math.atan2(targetDir.x, targetDir.z) - Math.atan2(currentDir.x, currentDir.z);
  if (angle > Math.PI) angle -= Math.PI * 2;
  if (angle < -Math.PI) angle += Math.PI * 2;
  state.headingError = angle * (180 / Math.PI);

  // 3. Simple Steering Behavior
  // Rotate towards target
  const turnSpeed = 2.0;
  crawler.rotation.y += angle * turnSpeed * dt;

  // Move forward
  const moveSpeed = 4.5;
  const velocity = moveSpeed * Math.max(0, Math.cos(angle)) * dt;
  state.velocity = velocity / dt;

  const velVec = currentDir.clone().multiplyScalar(velocity);
  crawler.position.add(velVec);

  // 4. Animate Articulated Legs
  const t = Date.now() * 0.008;
  crawlerParts.armPivots.forEach((pivot, i) => {
    const offset = i * (Math.PI / 2) + (i % 2 === 0 ? 0 : Math.PI);
    // Upper leg swing
    pivot.rotation.z = Math.sin(t + offset) * 0.4 - 0.2;
    // Lower leg bend (delayed/offset for natural look)
    const lowerPivot = crawlerParts.forearmPivots[i];
    lowerPivot.rotation.z = Math.cos(t + offset) * 0.5 + 0.3;
  });
  
  // Slight body bounce and tilt
  crawler.position.y = 1.1 + Math.abs(Math.sin(t * 2)) * 0.1;
  crawler.rotation.z = Math.sin(t) * 0.05;
  crawler.rotation.x = Math.cos(t) * 0.03;

  // 5. Target Reached Check
  if (state.distance < GOAL_REACH_DIST) {
    onTargetReached();
  }

  // 6. Update Rewards (Geometric Reward)
  const reward = (Math.max(0, Math.cos(angle)) * 0.5) + (Math.max(0, 1 - state.distance/20) * 0.5);
  state.episodeReturn += reward;
  state.meanReward = (state.meanReward * 0.999) + (reward * 0.001);

  // Update UI every few frames
  if (state.steps % 5 === 0) {
    updateUIElements();
  }
}

function onTargetReached() {
  state.agentState = 'Target Reached';
  document.getElementById('agent-state').innerHTML = 'Target Reached <span class="accent-green">✓</span>';
  
  const flash = document.getElementById('target-flash');
  flash.classList.remove('hidden');
  
  setTimeout(() => {
    flash.classList.add('hidden');
    state.agentState = 'Seeking Target';
    document.getElementById('agent-state').textContent = 'Seeking Target';
    relocateGoal();
  }, 2000);
}

function relocateGoal() {
  targetPos.x = (Math.random() - 0.5) * 30;
  targetPos.z = (Math.random() - 0.5) * 30;
  goalCube.position.copy(targetPos);
  goalCube.position.y = 0.6;
}

function resetEpisode() {
  crawler.position.set(0, 1, 0);
  crawler.rotation.set(0, 0, 0);
  state.episodeSteps = 0;
  state.episodeReturn = 0;
  state.episodes++;
  relocateGoal();
}

function togglePause() {
  state.running = !state.running;
  const btn = document.getElementById('btn-pause');
  const icon = document.getElementById('pause-icon');
  const text = document.getElementById('pause-text');
  
  if (state.running) {
    icon.textContent = '⏸';
    text.textContent = 'Pause';
  } else {
    icon.textContent = '▶';
    text.textContent = 'Resume';
  }
}

/* ============================================================
   UI & REFRESH
   ============================================================ */
function updateUIElements() {
  document.getElementById('mean-reward').textContent = state.meanReward.toFixed(3);
  document.getElementById('episode-return').textContent = state.episodeReturn.toFixed(2);
  document.getElementById('total-steps').textContent = state.steps.toLocaleString();
  document.getElementById('total-episodes').textContent = state.episodes.toLocaleString();
  
  document.getElementById('obs-distance').textContent = `${state.distance.toFixed(2)} m`;
  document.getElementById('obs-heading').textContent = `${state.headingError.toFixed(1)}°`;
  document.getElementById('obs-velocity').textContent = `${state.velocity.toFixed(2)} m/s`;
  
  document.getElementById('hud-fps').textContent = `${state.fps.toFixed(0)} FPS`;

  // Update Chart
  state.chartData.push(state.meanReward);
  state.chartData.shift();
  rewardChart.update('none');
}

function animate(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  if (dt > 0) state.fps = 1 / dt;

  updateSimulation(dt);

  // Camera follow
  const camOffset = new THREE.Vector3(-15, 12, -15);
  const targetCamPos = crawler.position.clone().add(camOffset);
  camera.position.lerp(targetCamPos, 0.05);
  camera.lookAt(crawler.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onResize() {
  const container = document.getElementById('three-container');
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// Start
init();
