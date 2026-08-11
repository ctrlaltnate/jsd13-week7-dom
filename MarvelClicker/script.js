const leaderBoard = document.querySelector("#leaderboard");
const snapArea = document.querySelector("#snaparea");
const profileInfo = document.querySelector("#profileinfo");
//NatelocalStorage.clear();
let playerName = localStorage.getItem("playerName");
let clickCount = Number(localStorage.getItem("clickCount")) || 0;

let leaderBoardData =
  JSON.parse(localStorage.getItem("leaderBoardData")) || [];
renderLeaderBoard();
while (!playerName) {
  playerName = prompt("กรุณากรอกชื่อผู้เล่น")?.trim();

  if (playerName) {
    localStorage.setItem("playerName", playerName);
  }
}

const unsnapImage = document.createElement("img");
unsnapImage.id = "gauntlet-image";
unsnapImage.src = "assets/unsnap.png";
unsnapImage.alt = "Unsnap";
unsnapImage.width = 400;
snapArea.append(unsnapImage);
profileInfo.textContent = `${playerName} was snapped! Total removed: ${clickCount}`;

unsnapImage.addEventListener("pointerdown", (event) => {
  unsnapImage.setPointerCapture(event.pointerId);
  unsnapImage.draggable = false;
  unsnapImage.src = "assets/snap.png";
  unsnapImage.alt = "Snap";
  unsnapImage.width = 430;
});

unsnapImage.addEventListener("pointerup", (e) => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;

  clickCount += 1;
  localStorage.setItem("clickCount", clickCount);
  updateLeaderBoard(playerName, clickCount);
  snapBubble(e);
  profileInfo.textContent =
    `${playerName} was snapped! Total removed: ${clickCount}`;
});

unsnapImage.addEventListener("pointercancel", () => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
});


function snapBubble(e) {
  const snapAreaRect = snapArea.getBoundingClientRect();

  const clickX = e.clientX - snapAreaRect.left;
  const clickY = e.clientY - snapAreaRect.top;


  const bubble = document.createElement("div");

  bubble.classList.add("snap-bubble");
  bubble.textContent = "+1";
  bubble.style.left = `${clickX}px`;
  bubble.style.top = `${clickY}px`;

  snapArea.append(bubble);

 
  const snappingEffect = document.createElement("img");

  snappingEffect.classList.add("snapping-effect");
  snappingEffect.src = "assets/snapping.png";
  snappingEffect.alt = "";
  snappingEffect.style.left = `${clickX}px`;
  snappingEffect.style.top = `${clickY}px`;

  snapArea.append(snappingEffect);


  bubble.addEventListener("animationend", () => {
    bubble.remove();
  });

  snappingEffect.addEventListener("animationend", () => {
    snappingEffect.remove();
  });
}


function updateLeaderBoard(name, score) {
  const player = leaderBoardData.find((item) => {
    return item.name === name;
  });

  if (player) {
    player.score = score;
  } else {
    leaderBoardData.push({
      name: name,
      score: score
    });
  }

  leaderBoardData.sort((a, b) => b.score - a.score);

  localStorage.setItem(
    "leaderBoardData",
    JSON.stringify(leaderBoardData)
  );

  renderLeaderBoard();
}

function renderLeaderBoard() {
  leaderBoard.innerHTML = "";

  leaderBoardData.forEach((player, index) => {
    const playerRow = document.createElement("div");
    const playerNameElement = document.createElement("span");
    const playerScoreElement = document.createElement("span");

    playerNameElement.textContent = `${index + 1}. ${player.name}`;
    playerScoreElement.textContent = player.score;

    // จัดชื่ออยู่ซ้ายและคะแนนอยู่ขวา
    playerRow.style.display = "flex";
    playerRow.style.justifyContent = "space-between";
    playerRow.style.alignItems = "center";
    playerRow.style.width = "100%";
    playerRow.style.fontSize = "3em";
    playerRow.style.borderBottom = "1px solid #ebebeb";

    playerRow.append(playerNameElement, playerScoreElement);
    leaderBoard.append(playerRow);
  });
}