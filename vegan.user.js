// ==UserScript==
// @name         VeggieBot
// @namespace    https://discord.gg/grHtzeRFAf
// @version      1.83
// @description  Bot for vegan banners on pixelcanvas.io
// @author       Vegans
// @match        https://pixelcanvas.io/*
// @icon         https://pixelcanvas.io/favicon.ico
// @updateURL    https://home.vcheftasha.tk/vegan.user.js
// @downloadURL  https://home.vcheftasha.tk/vegan.user.js
// @grant        none
// ==/UserScript==

//jshint esversion: 10
(function() {
    'use strict';


//check or generate bot ID
const botID = getCookie("z") ? getCookie("z") : randomInteger(1000, 9999); //if cookie exists, get botID from there. otherwise create new ID.
setCookie("z", botID, 1); //save botID to cookie

//load library for png manipulation
const pngLib = document.createElement("script");
pngLib.src = "https://www.thechristmasstation.org/veggiebot/pngtoy.min.js";
pngLib.type = "application/javascript";
document.body.appendChild(pngLib);

//info panel popup
const infoPanel = document.createElement("div");
infoPanel.classList.add("infoPanel");
infoPanel.style.display = "none";
infoPanel.innerHTML = '<div style="position: absolute;z-index: 999;width: 100vw;height: 100vh;background-color: #000a;display: flex;justify-content: center;align-items: center;"><div style="background-color: white;padding: 20px;border-radius: 10px;"><strong>Debug Info</strong><br>Version: <span class="version">a</span><br>Bot ID: <span class="botID">123</span><br><button class="closeInfoButton" style="background-color: cornflowerblue;padding: 10px;border-radius: 6px;margin-top: 15px;">Close</button></div></div>';
document.body.appendChild(infoPanel);

//close button function
document.querySelector(".closeInfoButton").onclick = function closeInfo() {document.querySelector(".infoPanel").style.display = "none";};

//load values into info panel
document.querySelector(".botID").innerHTML = botID;
document.querySelector(".version").innerHTML = GM_info.script.version;

//create flex container for UI
const flex = document.createElement("div");
flex.style = "position: absolute; display: flex; flex-flow: row wrap; gap: 5px; padding: 5px; background-color: black; border-radius: 0 0 13px 0;";
document.body.appendChild(flex);

//add loading indicator
const loadingIndicator = document.createElement("div");
loadingIndicator.innerHTML = "Loading...";
loadingIndicator.style = "background-color: cornflowerblue; border-radius: 10px; padding: 10px;";
flex.appendChild(loadingIndicator);

//add pixels placed counter to UI
const pixelCounter = document.createElement("div");
pixelCounter.style = "background-color: cornflowerblue; border-radius: 10px; padding: 10px; display: none;";
let oldCount;
if (getCookie("pixelCounter")) { //if pixel count cookie exists
  oldCount = getCookie("pixelCounter"); //old count is cookie value
}
else {
  oldCount = 0; //otherwise 0
}
pixelCounter.innerHTML = "Pixels placed: " + oldCount;
flex.appendChild(pixelCounter);

//add todo counter to UI
const todoCounter = document.createElement("div");
todoCounter.style = "background-color: cornflowerblue; border-radius: 10px; padding: 10px; display: none;";
todoCounter.innerHTML = "Loading...";
flex.appendChild(todoCounter);

//add info button to UI
const infoButton = document.createElement("button");
infoButton.style = "background-color: cornflowerblue; border-radius: 10px; padding: 10px; font-weight: 900; width: 44px; text-align: center;";
infoButton.onclick = function showInfo() {document.querySelector(".infoPanel").style.display = "block";};
infoButton.innerHTML = "?";
flex.appendChild(infoButton);


let pngtoy;
const designArray = []; //array of design objects

//when page is done loading, start bot
window.onload = async function() {

  pngtoy = new PngToy();

  const rawDesignArray = [
    {
      url: "https://home.vcheftasha.tk/images/pixil-frame-0.png",
      xCoord: -148,
      yCoord: 9950,
    },
    {
      url: "https://www.thechristmasstation.org/veggiebot/train1.png",
      xCoord: 27,
      yCoord: 10053,
    },
  ];

  for (const design of rawDesignArray) { //for each design
    design.pixels = await designPixelArray(design);
    console.log(design);
    designArray.push(design); //add design to processed designs array
  }
  console.log(designArray);

  //hide loading indicator and display UI
  loadingIndicator.style.display = "none";
  pixelCounter.style.display = "block";
  todoCounter.style.display = "block";

  webhook(`Connected.`); //send connection message to webhook
  pixelTimer(); //start pixel placement loop

  setTimeout(refresh, (30 * 60 * 1000)); //refresh page after 30 mins
};

async function designPixelArray(design) { //adds pixel array to design object
  design.data = await pngtoy.fetch(design.url).then(() => pngtoy.decode()).then(bmp => bmp); //png data
  const pixels = [];
  for (var x = 0; x < design.data.width; x++) { //for each pixel column of the design
    for(var y = 0; y < design.data.height; y++) { //for each pixel row of the design
      const color = getPixelColor(design, x, y); //get pixel color
      const pixel = { //create pixel object
        x: x + design.xCoord,
        y: y + design.yCoord,
        color: color,
      };
      pixels.push(pixel); //add pixel to array
    }
  }
  return pixels;
}

function getPixelColor(design, x, y) { //returns color code for given pixel in a design, by design-level coordinates
  const rawColors = design.data.bitmap; //rbg array from canvas
  const offset = (design.data.width*y+x)*4;

  let pixelColor = null;

  const colorOptions = [
    {
      name: "white",
      id: 0,
      rgb: [255, 255, 255],
    },
    {
      name: "light grey",
      id: 1,
      rgb: [228, 228, 228],
    },
    {
      name: "dark grey",
      id: 2,
      rgb: [136, 136, 136],
    },
    {
      name: "black",
      id: 3,
      rgb: [34, 34, 34],
    },
    {
      name: "pink",
      id: 4,
      rgb: [255, 167, 209],
    },
    {
      name: "red",
      id: 5,
      rgb: [229, 0, 0],
    },
    {
      name: "orange",
      id: 6,
      rgb: [229, 149, 0],
    },
    {
      name: "brown",
      id: 7,
      rgb: [160, 106, 66],
    },
    {
      name: "yellow",
      id: 8,
      rgb: [229, 217, 0],
    },
    {
      name: "light green",
      id: 9,
      rgb: [148, 224, 68],
    },
    {
      name: "dark green",
      id: 10,
      rgb: [2, 190, 1],
    },
    {
      name: "light blue",
      id: 11,
      rgb: [0, 211, 221],
    },
    {
      name: "middle blue",
      id: 12,
      rgb: [0, 131, 199],
    },
    {
      name: "dark blue",
      id: 13,
      rgb: [0, 0, 234],
    },
    {
      name: "light purple",
      id: 14,
      rgb: [207, 110, 228],
    },
    {
      name: "dark purple",
      id: 15,
      rgb: [130, 0, 128],
    },
  ];
  for (const color of colorOptions) { //for each possible color
    if ( //if each r g b value is within 10 of the actual color
      rawColors[offset + 0] < (color.rgb[0] + 10) && rawColors[offset + 0] > (color.rgb[0] - 10) &&
      rawColors[offset + 1] < (color.rgb[1] + 10) && rawColors[offset + 1] > (color.rgb[1] - 10) &&
      rawColors[offset + 2] < (color.rgb[2] + 10) && rawColors[offset + 2] > (color.rgb[2] - 10)
    ) {
      pixelColor = color.id; //pixel is this color
    }
  }
  if (pixelColor === null) {
    console.log(`${rawColors[offset + 0]}, ${rawColors[offset + 1]}, ${rawColors[offset + 2]}`);
    console.log(`No color found at coordinates ${x}, ${y}.`);
  }
  return pixelColor;
}

function getIncorrectPixels () { //returns an array of the pixel objects that need to be painted
  const incorrectPixels = [];
  const state = store.getState();

  for (const design of designArray) { //for each design
    for (const pixel of design.pixels) { //for each pixel in design's pixel array
      if (!isSameColorIn(state,[pixel.x, pixel.y], pixel.color)) { //if pixel isn't correct
        incorrectPixels.push(pixel); //add pixel to incorrect pixel array
      }
    }
  }

  todoCounter.innerHTML = "Pixels todo: " + incorrectPixels.length; //update pixel todo counter
  return incorrectPixels;
}

async function pixelTimer() { //the loop responsible for placing pixels

  const pixel = choosePixel(); //get a random pixel object to be painted

  if (pixel) { //if a pixel was returned
    const noDelay = await placePixel(pixel);

    if (noDelay) {
      console.log("Pixel is already correct, trying another...");
      setTimeout(pixelTimer, (0.3 * 1000)); //run again after 0.3 seconds
    }
    else {
      const randomDelay = Math.round(Math.random() * 5 * 1000); //random number of milliseconds to delay, up to 5 seconds
      setTimeout(pixelTimer, (60 * 1000) + randomDelay); //run again after one minute plus random delay
    }
  }
  else { //if no pixel was returned (design is complete)
    setTimeout(pixelTimer, (30 * 1000)); //run again in 30 seconds
  }
}

function choosePixel() { //selects the pixel to write
  const incorrectPixels = getIncorrectPixels(); //get array of pixels that need to be painted
  return incorrectPixels[randomInteger(1, incorrectPixels.length) - 1]; //return random pixel from array
}

async function placePixel(pixel) { //attempts to place a pixel. returns true if the pixel is already there.
  console.log("Building pixel:" + JSON.stringify(pixel));

  const state = store.getState();
  if (isSameColorIn(state,[pixel.x, pixel.y], pixel.color)) { //if pixel is already there
    // console.log("isSameColorIn = true");
    return true;
  }

  const fingerprint = await getFingerprint();
  const firebaseToken = (await getToken$1(appCheck, !1)).token;

  const wasabi = pixel.x + pixel.y + 2342;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "appCheckToken": firebaseToken,
    "color": pixel.color,
    "fingerprint": fingerprint,
    "wasabi": wasabi,
    "x": pixel.x,
    "y": pixel.y,
  });

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://pixelcanvas.io/api/pixel", requestOptions)
  .then(response => response.text())
  .then(result => {
    if (JSON.parse(result).result?.data.success) { //if server says the pixel was placed

      console.log("Success");

      //update pixels placed counter in ui
      let newCount;
      if (getCookie("pixelCounter")) {
        newCount = parseInt(getCookie("pixelCounter")) + 1; //new count = old count + 1
      }
      else {
        newCount = 1;
      }
      setCookie("pixelCounter", newCount, 3); //update cookie
      const numregex = /[0-9]{1,}/;
      pixelCounter.innerHTML = pixelCounter.innerHTML.replace(numregex, newCount); //change count in ui

      //send message to webhook
      webhook("Pixel placed.");
    }
    else { //server returned 200 but gives an error message
      console.log(result);
    }
  })
  .catch(error => console.log('error', error)); //network error
}

function webhook(content) { //sends log/error message to discord webhook
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const webhookBody = JSON.stringify({
    "content": `\`${botID}\` \`v${GM_info.script.version}\`: ` + content,
  });
  const webhookOpts = {
    method: 'POST',
    headers: headers,
    body: webhookBody,
  };
  fetch("https://discord.com/api/webhooks/962127487519834152/9yWREq9fItx7dnaWfvzPZ5B7euCqd_UwvVat8YyhZTK-fdIAvb4i8TUMwieokms1Wz3J", webhookOpts);
}

function randomInteger(min, max) { //returns random int between min and max inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCookie(cname) { //returns value of cookie by name
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) { //sets cookie
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function refresh() {
  window.location.reload();
}

})();