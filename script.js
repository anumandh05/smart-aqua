// 🔥 YOUR FIREBASE CONFIG (REAL)
const firebaseConfig = {
  apiKey: "AIzaSyCt7bpZKpBYPH5iz7cxiklTfmkOOspSMTI",
  authDomain: "smartaqua-cd888.firebaseapp.com",
  databaseURL: "https://smartaqua-cd888-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartaqua-cd888",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const refData = db.ref("SmartAqua");

// DATA
let labels = [];
let tdsData = [];
let turbidityData = [];
let flowData = [];
let waterLabels = [];
let waterLevelData = [];

// CHART OPTIONS
const options = {
  responsive: true,
  scales: {
    x: { ticks: { color: "white" } },
    y: { ticks: { color: "white" } }
  },
  plugins: {
    legend: { labels: { color: "white" } }
  }
};

// CHARTS
const tdsChart = new Chart(document.getElementById("tdsChart"), {
  type: "line",
  data: { labels, datasets: [{ label: "TDS", data: tdsData, borderColor: "cyan" }] },
  options
});

const turbidityChart = new Chart(document.getElementById("turbidityChart"), {
  type: "line",
  data: { labels, datasets: [{ label: "Turbidity", data: turbidityData, borderColor: "yellow" }] },
  options
});

const flowChart = new Chart(document.getElementById("flowChart"), {
  type: "line",
  data: { labels, datasets: [{ label: "Flow", data: flowData, borderColor: "lime" }] },
  options
});

const waterChart = new Chart(document.getElementById("waterLevelChart"), {
  type: "bar",
  data: { labels: waterLabels, datasets: [{ label: "Water Level", data: waterLevelData, backgroundColor: "cyan" }] },
  options
});

// UPDATE FUNCTION
function updateAll(d) {
  document.getElementById("tds").innerText = d.tds + " ppm";
  document.getElementById("turbidity").innerText = d.turbidity + " NTU";
  document.getElementById("flow").innerText = d.flow + " L/min";

  document.getElementById("waterLevelBar").style.height = d.level + "%";
  document.getElementById("waterLevelInside").innerText = d.level + "%";

  const time = new Date().toLocaleTimeString();

  labels.push(time);
  tdsData.push(d.tds);
  turbidityData.push(d.turbidity);
  flowData.push(d.flow);

  if (labels.length > 10) {
    labels.shift();
    tdsData.shift();
    turbidityData.shift();
    flowData.shift();
  }

  tdsChart.update();
  turbidityChart.update();
  flowChart.update();

  waterLabels.push(time);
  waterLevelData.push(d.level);

  if (waterLabels.length > 10) {
    waterLabels.shift();
    waterLevelData.shift();
  }

  waterChart.update();
}

// 🔥 FIREBASE LISTENER
refData.on("value", (snap) => {
  const d = snap.val();
  console.log("Firebase Data:", d);

  if (d) {
    updateAll(d);
  }
});
