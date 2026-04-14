// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCt7bpZKpBYPH5iz7cxiklTfmkOOspSMTI",
  authDomain: "smartaqua-cd888.firebaseapp.com",
  databaseURL: "https://smartaqua-cd888-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartaqua-cd888",
  storageBucket: "smartaqua-cd888.firebasestorage.app",
  messagingSenderId: "360130766557",
  appId: "1:360130766557:web:801f6869b4562738c15d34"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const refData = db.ref("SmartAqua");


// =======================
// 📊 GRAPH DATA
// =======================

let labels = [];
let tdsData = [];
let turbidityData = [];
let flowData = [];

let waterLabels = [];
let waterLevelData = [];


// =======================
// 📊 COMMON OPTIONS
// =======================

const commonOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: "white" } }
  },
  scales: {
    x: { ticks: { color: "white" } },
    y: { ticks: { color: "white" } }
  }
};


// =======================
// 📈 LINE CHARTS
// =======================

const tdsChart = new Chart(document.getElementById("tdsChart"), {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "TDS (ppm)",
      data: tdsData,
      borderColor: "#00e5ff",
      backgroundColor: "rgba(0,229,255,0.2)",
      tension: 0.4,
      fill: true
    }]
  },
  options: commonOptions
});

const turbidityChart = new Chart(document.getElementById("turbidityChart"), {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Turbidity (NTU)",
      data: turbidityData,
      borderColor: "#ffcc00",
      backgroundColor: "rgba(255,204,0,0.2)",
      tension: 0.4,
      fill: true
    }]
  },
  options: commonOptions
});

const flowChart = new Chart(document.getElementById("flowChart"), {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Flow Rate (L/min)",
      data: flowData,
      borderColor: "#00ff88",
      backgroundColor: "rgba(0,255,136,0.2)",
      tension: 0.4,
      fill: true
    }]
  },
  options: commonOptions
});


// =======================
// 📊 WATER LEVEL BAR CHART
// =======================

const waterChart = new Chart(document.getElementById("waterLevelChart"), {
  type: "bar",
  data: {
    labels: waterLabels,
    datasets: [{
      label: "Water Level (%)",
      data: waterLevelData,
      backgroundColor: "#00bcd4"
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // IMPORTANT for height control

    plugins: {
      legend: {
        labels: { color: "white" }
      }
    },

    scales: {
      x: {
        ticks: { color: "white" }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "white"
        }
      }
    }
  }
});


// =======================
// 🔄 FIREBASE LISTENER
// =======================

refData.on("value", (snap) => {
  const d = snap.val();
  if (!d) return;

  // Status
  const tdsStatus = getStatus(d.tds, 200, 500);
  const turbStatus = getStatus(d.turbidity, 5, 10);
  const flowStatus = getFlowStatus(d.flow);

  // Update UI Cards
  updateSensor("tds", d.tds, "ppm", "tdsCard", tdsStatus);
  updateSensor("turbidity", d.turbidity, "NTU", "turbidityCard", turbStatus);
  updateSensor("flow", d.flow, "L/min", "flowCard", flowStatus);

  // Sensor Alerts
  updateSensorAlert("tdsAlert", "tds", tdsStatus);
  updateSensorAlert("turbidityAlert", "turbidity", turbStatus);
  updateSensorAlert("flowAlert", "flow", flowStatus);

  // Water Level
  updateWaterLevel(d.level);
  updateWaterAlert(d.level);

  // =======================
  // 📊 UPDATE LINE GRAPHS
  // =======================
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

  // =======================
  // 📊 WATER LEVEL GRAPH (HOURLY)
  // =======================
    const hour = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
    });

    waterLabels.push(hour);
    waterLevelData.push(d.level);

    if (waterLabels.length > 10) {
    waterLabels.shift();
    waterLevelData.shift();
    }

  waterChart.update();
});


// =======================
// 🧠 STATUS FUNCTIONS
// =======================

function getStatus(val, safe, moderate) {
  if (val <= safe) return "safe";
  else if (val <= moderate) return "moderate";
  else return "danger";
}

function getFlowStatus(flow) {
  if (flow === 0 || flow > 50) return "danger";
  else if (flow > 30) return "moderate";
  else return "safe";
}


// =======================
// 🎯 UI FUNCTIONS
// =======================

function updateSensor(id, val, unit, cardId, status) {
  document.getElementById(id).innerText = val + " " + unit;
  document.getElementById(cardId).className = "card " + status;
}

function updateWaterLevel(level) {
  document.getElementById("waterLevelBar").style.height = level + "%";

  // inside tank %
  document.getElementById("waterLevelInside").innerText = level + "%";

}


// =======================
// 🚨 SENSOR ALERTS
// =======================

function updateSensorAlert(id, type, status) {
  const el = document.getElementById(id);

  const messages = {
    tds: {
      safe: "😇 Good water quality",
      moderate: "😕 Moderate TDS",
      danger: "🤧 High TDS"
    },
    turbidity: {
      safe: "😇 Clear water",
      moderate: "😕 Slightly cloudy",
      danger: "🤧 Dirty water"
    },
    flow: {
      safe: "😇 Normal flow",
      moderate: "😕 High flow",
      danger: "🤧 No flow / Leak"
    }
  };

  el.innerText = messages[type][status];
  el.className = "sensor-alert " + status;
}


// =======================
// 🚰 WATER ALERT
// =======================

function updateWaterAlert(level) {
  const el = document.getElementById("waterLevelAlert");

  let status, message;

  if (level <= 20) {
    status = "danger";
    message = "🔴 Low water level";
  } 
  else if (level == 100) {
    status = "moderate";
    message = "🔴 Tank full";
  }else if (level >= 85) {
    status = "moderate";
    message = "🟡 Tank almost full";
  } else {
    status = "safe";
    message = "🟢 Water level normal";
  }

  el.innerText = message;
  el.className = "sensor-alert " + status;
}