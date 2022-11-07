//localStorage.clear();
if (!localStorage.getItem("hard")) {
  localStorage.setItem("hard", "false");
  localStorage.setItem("hard_crown", "false");
}

if (!localStorage.getItem("dark")) {
  localStorage.setItem("dark", "false");
}

var seconds = localStorage.getItem("time")
  ? parseInt(localStorage.getItem("time"))
  : 0;

document.getElementById("Bottom").innerHTML =
  "<b>Time: <b/>" + convertHMS(seconds);

document.getElementById("Bottom").style.color =
  localStorage.getItem("dark") === "true" ? "white" : "black";

let pts = [];
const pairs = 8;
let selected_pt = null;
let line_pts = [];

//random seed
function random(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

//no points are overlapping other points
function intersect(x0, y0, r0, x1, y1, r1) {
  return Math.hypot(x0 - x1, y0 - y1) <= r0 + r1;
}

function overlaps(x, y, pts) {
  for (let i = 0; i < pts.length; i++) {
    if (intersect(x, y, radius, pts[i][0], pts[i][1], radius)) {
      //console.log(pts[i][0], pts[i][1]);
      return true;
    }
  }

  return false;
}

//points are fully visible on screen
function offCanvas(x, y) {
  return (
    x - radius <= 0 ||
    x + radius >= canvasWidth ||
    y - radius <= 0 ||
    y + radius >= canvasHeight
  );
}

function drawLine(x1, y1, x2, y2, color, width) {
  // draw a red line
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function drawPoint(x, y, color) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = ptLineWidth;
  context.strokeStyle = ptLineColor;
  context.stroke();
}

let ptFillColor = localStorage.getItem("Dot")
  ? localStorage.getItem("Dot")
  : "blue"; //circleFillColor

if (!localStorage.getItem("Dot")) {
  localStorage.setItem("Dot", "blue");
}

let lineFillColor = localStorage.getItem("Line")
  ? localStorage.getItem("Line")
  : "red"; //lineColor

if (!localStorage.getItem("Line")) {
  localStorage.setItem("Line", "red");
}

let highlight = localStorage.getItem("Highlight")
  ? localStorage.getItem("Highlight")
  : "yellow"; //highlight Color

if (!localStorage.getItem("Highlight")) {
  localStorage.setItem("Highlight", "yellow");
}

let textColor = localStorage.getItem("text")
  ? localStorage.getItem("text")
  : "black";

if (!localStorage.getItem("text")) {
  localStorage.setItem("text", "black");
}

const canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
let dpi = window.devicePixelRatio;

let style_height = +getComputedStyle(canvas)
  .getPropertyValue("height")
  .slice(0, -2);
//get CSS width
let style_width = +getComputedStyle(canvas)
  .getPropertyValue("width")
  .slice(0, -2);

canvas.setAttribute("height", style_height * dpi);
canvas.setAttribute("width", style_width * dpi);

localStorage.setItem(
  "day",
  Math.trunc((new Date() - new Date(2022, 9, 14).setHours(0, 0, 0)) / 86400000)
);

if (!localStorage.getItem("seed")) {
  localStorage.setItem("seed", localStorage.getItem("day"));
}

let seed = parseInt(localStorage.getItem("seed"));

const ptLineColor = localStorage.getItem("dark") === "true" ? "white" : "black"; //circleLineColor
const ptLineWidth = 4; //circleLineWidth
const lineWidth = 5; //lineWidth
const maxVal = 8;
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let radius = 0.035 * Math.min(canvasHeight, canvasWidth);
const l = Math.floor(random(seed++) * maxVal) + 1;
let dist = Math.round((0.5 * Math.min(canvasHeight, canvasWidth)) / maxVal) * l;
localStorage.setItem("dist", l);
localStorage.setItem(
  "unit_dist",
  Math.round((0.5 * Math.min(canvasHeight, canvasWidth)) / maxVal)
);

//might choose a bad pair that messes everything up
//maybe if cnt goes off three times in a row then restart the whole process
let end = Date.now() + 5;

while (pts.length < pairs * 2 && end > Date.now()) {
  let x = random(seed++) * canvasWidth;
  let y = random(seed++) * canvasHeight;

  while (pts.includes([x, y]) || overlaps(x, y, pts) || offCanvas(x, y)) {
    x = random(seed++) * canvasWidth;
    y = random(seed++) * canvasHeight;
    if (end < Date.now()) {
      break;
    }
  }

  if (end < Date.now()) {
    break;
  }

  pts.push([x, y]);

  var angle = random(seed++) * Math.PI * 2;
  let x2 = x + Math.cos(angle) * dist;
  let y2 = y + Math.sin(angle) * dist;

  while (pts.includes([x2, y2]) || overlaps(x2, y2, pts) || offCanvas(x2, y2)) {
    angle = random(seed++) * Math.PI * 2;
    x2 = x + Math.cos(angle) * dist;
    y2 = y + Math.sin(angle) * dist;
    if (end < Date.now()) {
      break;
    }
  }

  pts.push([x2, y2]);
}

if (end < Date.now()) {
  localStorage.setItem("seed", seed);
  window.location.reload();
}

for (let i = 0; i < pts.length; i += 2) {
  //console.log(pts[i][0], pts[i][1]);
  //drawLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], "green", 8);
  drawPoint(pts[i][0], pts[i][1], ptFillColor);
  drawPoint(pts[i + 1][0], pts[i + 1][1], ptFillColor);
}

function reDrawCanvas() {
  //canvas.width / x and canvas.height / y
  //want these to be as close as possible

  // bounds for x are 5 to 20
  // bounds for y are 5 to 20

  // minimze abs((canvas.width / x) - (canvas.height / y ))

  let min_diff = Number.MAX_VALUE;
  let min_vals = [8, 8];

  for (let x = 8; x < 21; x++) {
    for (let y = 8; y < 21; y++) {
      if (Math.abs(canvas.width / x - canvas.height / y) < min_diff) {
        min_vals = [x, y];
        min_diff = Math.abs(canvas.width / x - canvas.height / y);
      }
    }
  }

  let width_boxes = min_vals[0];
  let height_boxes = min_vals[1];

  for (let i = 1; i < width_boxes; i++) {
    drawLine(
      i * (canvas.width / width_boxes),
      0,
      i * (canvas.width / width_boxes),
      canvasHeight,
      localStorage.getItem("dark") === "true" ? "white" : "black",
      4
    );
  }

  for (let i = 1; i < height_boxes; i++) {
    drawLine(
      0,
      i * (canvas.height / height_boxes),
      canvasWidth,
      i * (canvas.height / height_boxes),
      localStorage.getItem("dark") === "true" ? "white" : "black",
      4
    );
  }

  for (let i = 0; i < line_pts.length; i += 2) {
    drawLine(
      line_pts[i][0],
      line_pts[i][1],
      line_pts[i + 1][0],
      line_pts[i + 1][1],
      lineFillColor,
      lineWidth
    );
  }

  console.log(line_pts);
  console.log(pts);

  for (let i = 0; i < pts.length; i++) {
    if (line_pts.includes(pts[i])) {
      drawPoint(pts[i][0], pts[i][1], highlight);
    } else {
      drawPoint(pts[i][0], pts[i][1], ptFillColor);
    }
  }

  for (let i = 0; i < line_pts.length; i += 2) {
    context.beginPath();

    //radius to pixel size

    context.font = (1.8 * radius).toString() + "px serif";

    context.textAlign = "center";
    context.fillStyle = textColor;
    context.textBaseline = "middle";

    let code = "A".charCodeAt(0);
    let txt = String.fromCharCode(code + i / 2);

    console.log(txt);

    context.fillText(txt, line_pts[i][0], line_pts[i][1]);
    context.fillText(txt, line_pts[i + 1][0], line_pts[i + 1][1]);
    context.closePath();
  }

  txt = localStorage.getItem("alpha_pts")
    ? localStorage.getItem("alpha_pts").split(",")
    : [];

  console.log(line_pts);

  if (txt.length < line_pts.length) {
    console.log(line_pts);

    txt.push(pts.indexOf(line_pts[line_pts.length - 2]));
    txt.push(pts.indexOf(line_pts[line_pts.length - 1]));
  }

  localStorage.setItem("alpha_pts", txt);

  //results are in order of distances
  var test = results();
  var len = test.length;
  var indices = new Array(len);
  for (var j = 0; j < len; ++j) indices[j] = j;
  indices.sort(function (a, b) {
    return test[a] + 0.01 < test[b]
      ? -1
      : test[a] - 0.01 > test[b]
      ? 1
      : a < b
      ? -1
      : 1;
  });

  localStorage.setItem("indexes", indices);

  let asc_pts = [];
  for (let j = 0; j < len; j++) {
    let index = indices[j];
    asc_pts.push(txt[index * 2]);
    asc_pts.push(txt[1 + index * 2]);
  }

  localStorage.setItem("asc_pts", asc_pts);

  let des_pts = [];
  indices = indices.reverse();
  for (let j = 0; j < len; j++) {
    let index = indices[j];
    des_pts.push(txt[index * 2]);
    des_pts.push(txt[1 + index * 2]);
  }

  localStorage.setItem("des_pts", des_pts);
}

function results() {
  let lens = [];
  for (let i = 0; i < line_pts.length; i += 2) {
    let d = Math.sqrt(
      (line_pts[i][0] - line_pts[i + 1][0]) ** 2 +
        (line_pts[i][1] - line_pts[i + 1][1]) ** 2
    );
    lens.push(d);
  }
  return lens;
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function getRange() {
  let distances = results();

  let max_val = 0;
  let min_val = Number.MAX_VALUE;

  for (let i = 0; i < distances.length; i++) {
    let line_length = distances[i];
    if (line_length > max_val) {
      max_val = line_length;
    }

    if (line_length < min_val) {
      min_val = line_length;
    }
  }

  return max_val - min_val;
}

function rangeIndex(range) {
  if (range < 0.01) {
    return 0;
  } else if (range <= 1) {
    return 1;
  } else if (range <= 2) {
    return 2;
  } else if (range <= 3) {
    return 3;
  } else if (range <= 4) {
    return 4;
  } else if (range <= 5) {
    return 5;
  } else if (range <= 6) {
    return 6;
  } else if (range <= 7) {
    return 7;
  } else if (range <= 8) {
    return 8;
  } else {
    return 9;
  }
}

function clickCanvas(e) {
  let x = dpi * (e.pageX - canvas.getBoundingClientRect().left);
  let y = dpi * (e.pageY - canvas.getBoundingClientRect().top);
  let found = false;

  if (line_pts.length == 2 * pairs) {
    return;
  }

  for (let i = 0; i < pts.length; i++) {
    if (
      (x - pts[i][0]) ** 2 + (y - pts[i][1]) ** 2 <= radius ** 2 &&
      selected_pt != pts[i] &&
      !line_pts.includes(pts[i])
    ) {
      console.log("clicked pt");
      found = true;

      if (!selected_pt) {
        selected_pt = pts[i];

        //change selected pt_color
        drawPoint(pts[i][0], pts[i][1], highlight);
      } else {
        //change this new pt_color and draw a line
        drawPoint(pts[i][0], pts[i][1], highlight);
        //add both points to set
        line_pts.push(selected_pt);
        line_pts.push(pts[i]);

        selected_pt = null;
        reDrawCanvas();

        if (line_pts.length == pairs * 2) {
          //round win rate & range_avergae 2 decimals

          let range = getRange() / localStorage.getItem("unit_dist");
          localStorage.setItem("range", range);

          let graph_bars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          if (localStorage.getItem("range_distribution")) {
            graph_bars = localStorage.getItem("range_distribution").split(",");
          }

          graph_bars[rangeIndex(range)] =
            parseInt(graph_bars[rangeIndex(range)]) + 1;

          localStorage.setItem("range_distribution", graph_bars);

          if (!localStorage.getItem("last_day_won")) {
            localStorage.setItem("last_day_won", -1);
          }

          if (!localStorage.getItem("games_played")) {
            localStorage.setItem("games_played", 1);
          } else {
            localStorage.setItem(
              "games_played",
              parseInt(localStorage.getItem("games_played")) + 1
            );
          }

          if (!localStorage.getItem("range_total")) {
            localStorage.setItem("range_total", range);
          } else {
            localStorage.setItem(
              "range_total",
              parseFloat(localStorage.getItem("range_total")) + range
            );
          }

          localStorage.setItem(
            "avg_range",
            (
              parseFloat(localStorage.getItem("range_total")) /
              parseInt(localStorage.getItem("games_played"))
            ).toFixed(2)
          );

          if (!localStorage.getItem("games_won")) {
            localStorage.setItem("games_won", 0);
          }

          if (rangeIndex(range) == 0) {
            localStorage.setItem(
              "games_won",
              parseInt(localStorage.getItem("games_won")) + 1
            );

            if (!localStorage.getItem("current_streak")) {
              localStorage.setItem("current_streak", 1);
            } else {
              localStorage.setItem(
                "current_streak",
                1 + parseInt(localStorage.getItem("current_streak"))
              );
            }

            if (
              !localStorage.getItem("max_streak") ||
              parseInt(localStorage.getItem("max_streak")) <
                parseInt(localStorage.getItem("current_streak"))
            ) {
              localStorage.setItem(
                "max_streak",
                localStorage.getItem("current_streak")
              );
            }

            localStorage.setItem("last_day_won", localStorage.getItem("day"));
          } else {
            localStorage.setItem("current_streak", 0);
          }

          localStorage.setItem(
            "win_rate",
            (
              parseInt(localStorage.getItem("games_won")) /
              parseInt(localStorage.getItem("games_played"))
            ).toFixed(2)
          );

          window.location = "daily.html";
        }
      }

      break;
    }
  }

  if (!found && selected_pt) {
    //change selected+pt back to orginal color
    drawPoint(selected_pt[0], selected_pt[1], ptFillColor);
    selected_pt = null;
  }
}

function incrementSeconds() {
  if (
    line_pts.length < 2 * pairs &&
    window.location.pathname === "/" &&
    document.getElementById("Bottom")
  ) {
    seconds += 1;
    document.getElementById("Bottom").innerHTML =
      "<b>Time: <b/>" + convertHMS(seconds);
    localStorage.setItem("time", seconds);
  }
}

canvas.onclick = clickCanvas;
setInterval(incrementSeconds, 1000);

window.addEventListener("resize", () => {
  window.location.reload();
});

function convertHMS(value) {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (hours > 0) {
    return hours + ":" + minutes + ":" + seconds;
  } else {
    return minutes + ":" + seconds;
  }
}

window.addEventListener("orientationchange", (event) => {
  window.location.reload();
});

if (localStorage.getItem("alpha_pts")) {
  for (
    let i = 0;
    i < localStorage.getItem("alpha_pts").split(",").length;
    i++
  ) {
    line_pts.push(
      pts[parseInt(localStorage.getItem("alpha_pts").split(",")[i])]
    );
  }
}

localStorage.setItem("pts", pts);
reDrawCanvas();
