const leaderBoard = document.querySelector("#leaderboard");
const snapArea = document.querySelector("#snaparea");
const profileInfo = document.querySelector("#profileinfo");
const loadingScreen = document.querySelector("#loading-screen");
const loadingMessage = document.querySelector("#loading-message");
const retryButton = document.querySelector("#retry-button");

let playerName = "";
let clickCount = 0;
let leaderBoardData = [];
let saveScoreTimer;
let retryAction = null;

const unsnapImage = document.createElement("img");
unsnapImage.id = "gauntlet-image";
unsnapImage.src = "assets/unsnap.png";
unsnapImage.alt = "Unsnap";
unsnapImage.width = 400;
unsnapImage.draggable = false;
snapArea.append(unsnapImage);
disableGame();

retryButton.addEventListener("click", () => {
  retryAction?.();
});

unsnapImage.addEventListener("pointerdown", (event) => {
  unsnapImage.setPointerCapture(event.pointerId);
  unsnapImage.src = "assets/snap.png";
  unsnapImage.alt = "Snap";
  unsnapImage.width = 430;
  snapArea.style.backgroundColor = "#ac6701";
});

unsnapImage.addEventListener("pointerup", (event) => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
  snapArea.style.backgroundColor = "#1b1b1b";

  clickCount += 1;
  updateProfileInfo();
  updateCurrentPlayerInLeaderBoard();
  queueLeaderBoardUpdate();
  snapBubble(event);
});

unsnapImage.addEventListener("pointercancel", () => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
  snapArea.style.backgroundColor = "#1b1b1b";
});

function snapBubble(event) {
  const snapAreaRect = snapArea.getBoundingClientRect();
  const clickX = event.clientX - snapAreaRect.left;
  const clickY = event.clientY - snapAreaRect.top;

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

  bubble.addEventListener("animationend", () => bubble.remove());
  snappingEffect.addEventListener("animationend", () => snappingEffect.remove());
}

function queueLeaderBoardUpdate() {
  clearTimeout(saveScoreTimer);

  saveScoreTimer = setTimeout(() => {
    updateLeaderBoard(playerName, clickCount);
  }, 500);
}

function updateCurrentPlayerInLeaderBoard() {
  const currentPlayer = leaderBoardData.find(
    (player) => player.name === playerName
  );

  if (currentPlayer) {
    currentPlayer.score = clickCount;
  } else {
    leaderBoardData.push({ name: playerName, score: clickCount });
  }

  leaderBoardData.sort((firstPlayer, secondPlayer) => {
    return secondPlayer.score - firstPlayer.score;
  });

  renderLeaderBoard();
}

async function updateLeaderBoard(name, score) {
  try {
    await requestApi("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "save-score", name, score })
    });

    hideLoadingScreen();
  } catch (error) {
    console.error("Could not save score:", error);
    showLoadingScreen(
      "Could not save your score. Check your connection.",
      () => updateLeaderBoard(playerName, clickCount)
    );
  }
}

async function loadLeaderBoard() {
  const result = await requestApi("/api/leaderboard");

  leaderBoardData = result.data;
  renderLeaderBoard();
}

function loadPlayerScore() {
  const currentPlayer = leaderBoardData.find(
    (player) => player.name === playerName
  );

  clickCount = currentPlayer?.score || 0;
  updateProfileInfo();
}

function renderLeaderBoard() {
  leaderBoard.innerHTML = "";

  leaderBoardData.forEach((player, index) => {
    const playerRow = document.createElement("div");
    const playerNameElement = document.createElement("span");
    const playerScoreElement = document.createElement("span");

    playerNameElement.textContent = `${index + 1}. ${player.name}`;
    playerScoreElement.textContent = player.score;

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

function updateProfileInfo() {
  profileInfo.textContent =
    `${playerName} was snapped! Total removed: ${clickCount}`;
}

async function requestApi(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const result = await readApiResponse(response);

    if (!response.ok) {
      const error = new Error(result.error || "Request failed");
      error.status = response.status;
      throw error;
    }

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return { error: await response.text() };
}

function getCookie(cookieName) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}

function setCookie(cookieName, value, days) {
  const maxAge = days * 24 * 60 * 60;

  document.cookie =
    `${cookieName}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

async function choosePlayerName() {
  const savedPlayerName = getCookie("playerName");

  if (savedPlayerName) {
    playerName = savedPlayerName;
    return;
  }

  while (!playerName) {
    const newPlayerName = prompt("Enter your player name")?.trim();

    if (!newPlayerName) {
      continue;
    }

    try {
      await requestApi("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "register", name: newPlayerName })
      });
    } catch (error) {
      if (error.status === 409) {
        alert("This name is already in use. Please choose another name.");
        continue;
      }

      throw error;
    }

    playerName = newPlayerName;
    setCookie("playerName", playerName, 365);
  }
}

function disableGame() {
  unsnapImage.style.pointerEvents = "none";
  unsnapImage.style.opacity = "0.6";
}

function enableGame() {
  unsnapImage.style.pointerEvents = "auto";
  unsnapImage.style.opacity = "1";
}

function showLoadingScreen(message, action = null) {
  loadingScreen.hidden = false;
  loadingMessage.textContent = message;
  retryAction = action;
  retryButton.hidden = action === null;
}

function hideLoadingScreen() {
  loadingScreen.hidden = true;
  retryAction = null;
}

async function initializeGame() {
  showLoadingScreen("Connecting to database...");
  disableGame();

  try {
    await choosePlayerName();
    updateProfileInfo();
    await loadLeaderBoard();
    loadPlayerScore();
    enableGame();
    hideLoadingScreen();
  } catch (error) {
    console.error("Could not start game:", error);
    showLoadingScreen(
      "Cannot connect to database. Please try again.",
      initializeGame
    );
  }
}

initializeGame();
