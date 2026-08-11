const leaderBoard = document.querySelector("#leaderboard");
const snapArea = document.querySelector("#snaparea");
const shop = document.querySelector("#shop");
const profileInfo = document.querySelector("#profileinfo");
const loadingScreen = document.querySelector("#loading-screen");
const loadingMessage = document.querySelector("#loading-message");
const retryButton = document.querySelector("#retry-button");

const SHOP_ITEMS = [
  { id: "power2", name: "Double Strike", description: "Permanent base: +2 per snap", price: 999 },
  { id: "power4", name: "Cosmic Strike", description: "Permanent base: +4 per snap", price: 9999 },
  { id: "power8", name: "Infinity Strike", description: "Permanent base: +8 per snap", price: 99999 },
  { id: "weeklyBoost", name: "Time Stone Rush", description: "Keep half your points, then x2 for 1 minute", price: null }
];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let playerName = "";
let clickCount = 0;
let clickPower = 1;
let ownedItems = { power2: false, power4: false, power8: false };
let boostUsedAt = null;
let boostUntil = null;
let leaderBoardData = [];
let saveScoreTimer;
let shopTimer;
let retryAction = null;

const unsnapImage = document.createElement("img");
unsnapImage.id = "gauntlet-image";
unsnapImage.src = "assets/unsnap.png";
unsnapImage.alt = "Unsnap";
unsnapImage.width = 400;
unsnapImage.draggable = false;
snapArea.append(unsnapImage);
disableGame();

retryButton.addEventListener("click", () => retryAction?.());

unsnapImage.addEventListener("pointerdown", (event) => {
  unsnapImage.setPointerCapture(event.pointerId);
  unsnapImage.src = "assets/snap.png";
  unsnapImage.alt = "Snap";
  unsnapImage.width = 430;
  snapArea.style.backgroundColor = "#ff9901";
});

unsnapImage.addEventListener("pointerup", (event) => {
  resetGauntlet();
  const pointsEarned = clickPower * (isBoostActive() ? 2 : 1);
  clickCount += pointsEarned;
  updateProfileInfo();
  updateCurrentPlayerInLeaderBoard();
  queueLeaderBoardUpdate();
  snapBubble(event, pointsEarned);
});

unsnapImage.addEventListener("pointercancel", resetGauntlet);

function resetGauntlet() {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
  snapArea.style.backgroundColor = "#1b1b1b";
}

function isBoostActive() {
  return Boolean(boostUntil && Date.now() < new Date(boostUntil).getTime());
}

function snapBubble(event, pointsEarned) {
  const rect = snapArea.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const bubble = document.createElement("div");
  bubble.className = "snap-bubble";
  bubble.textContent = `+${pointsEarned}`;
  bubble.style.left = `${clickX}px`;
  bubble.style.top = `${clickY}px`;
  snapArea.append(bubble);

  const effect = document.createElement("img");
  effect.className = "snapping-effect";
  effect.src = "assets/snapping.png";
  effect.alt = "";
  effect.style.left = `${clickX}px`;
  effect.style.top = `${clickY}px`;
  snapArea.append(effect);
  bubble.addEventListener("animationend", () => bubble.remove());
  effect.addEventListener("animationend", () => effect.remove());
}

function queueLeaderBoardUpdate() {
  clearTimeout(saveScoreTimer);
  saveScoreTimer = setTimeout(() => saveCurrentScore().catch(handleSaveError), 500);
}

function handleSaveError(error) {
  console.error("Could not save score:", error);
  showLoadingScreen("Could not save your score. Check your connection.", initializeGame);
}

function updateCurrentPlayerInLeaderBoard() {
  const current = leaderBoardData.find((player) => player.name === playerName);
  if (current) current.score = clickCount;
  else leaderBoardData.push({ name: playerName, score: clickCount });
  leaderBoardData.sort((first, second) => second.score - first.score);
  renderLeaderBoard();
}

async function saveCurrentScore() {
  clearTimeout(saveScoreTimer);
  const result = await requestApi("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-score", name: playerName, score: clickCount })
  });
  applyPlayer(result.player);
}

async function loadLeaderBoard() {
  const result = await requestApi("/api/leaderboard");
  leaderBoardData = result.data;
  renderLeaderBoard();
}

async function loadPlayer() {
  const result = await requestApi("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get-player", name: playerName })
  });
  applyPlayer(result.player);
}

function applyPlayer(player) {
  clickCount = player.score;
  clickPower = player.clickPower;
  ownedItems = player.owned;
  boostUsedAt = player.boostUsedAt;
  boostUntil = player.boostUntil;
  saveShopCookie();
  updateProfileInfo();
  updateCurrentPlayerInLeaderBoard();
  renderShop();
}

function renderLeaderBoard() {
  leaderBoard.innerHTML = "";
  leaderBoardData.forEach((player, index) => {
    const row = document.createElement("div");
    const name = document.createElement("span");
    const score = document.createElement("span");
    name.textContent = `${index + 1}. ${player.name}`;
    score.textContent = player.score;
    row.className = "leaderboard-row";
    row.append(name, score);
    leaderBoard.append(row);
  });
}

function renderShop() {
  shop.innerHTML = "";
  const boostStatus = document.createElement("p");
  boostStatus.className = "boost-status";
  boostStatus.textContent = isBoostActive()
    ? `Time Stone active: x2 for ${formatDuration(new Date(boostUntil).getTime() - Date.now())}`
    : `Current snap power: +${clickPower}`;
  shop.append(boostStatus);

  SHOP_ITEMS.forEach((item) => {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const price = document.createElement("p");
    const button = document.createElement("button");
    const isWeekly = item.id === "weeklyBoost";
    const owned = !isWeekly && ownedItems[item.id];
    const availableAt = boostUsedAt ? new Date(boostUsedAt).getTime() + WEEK_MS : 0;
    const cooldownMs = Math.max(0, availableAt - Date.now());

    card.className = "shop-card";
    title.textContent = item.name;
    description.textContent = item.description;
    price.className = "shop-price";
    price.textContent = isWeekly ? "÷2 points " : `${item.price.toLocaleString()} points`;
    button.type = "button";
    button.className = "shop-buy-button";

    if (owned) {
      button.textContent = `Owned by ${playerName}`;
      button.disabled = true;
      card.classList.add("owned");
    } else if (isWeekly && cooldownMs > 0) {
      button.textContent = `Ready in ${formatDuration(cooldownMs)}`;
      button.disabled = true;
    } else {
      button.textContent = isWeekly ? "ACTIVATE" : "BUY";
      button.disabled = !isWeekly && clickCount < item.price;
      button.addEventListener("click", () => buyShopItem(item.id));
    }

    card.append(title, description, price, button);
    shop.append(card);
  });
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function buyShopItem(itemId) {
  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  const message = itemId === "weeklyBoost"
    ? "Spend half your current points for x2 power during 1 minute?"
    : `Buy ${item.name} for ${item.price.toLocaleString()} points?`;
  if (!confirm(message)) return;

  disableGame();
  setShopDisabled(true);
  try {
    await saveCurrentScore();
    const action = itemId === "weeklyBoost" ? "buy-boost" : "buy-item";
    const result = await requestApi("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, name: playerName, itemId })
    });
    applyPlayer(result.player);
    if (itemId === "weeklyBoost") {
      await runBoostCountdown();
    }
  } catch (error) {
    alert(error.message);
  } finally {
    enableGame();
    renderShop();
  }
}

async function runBoostCountdown() {
  showLoadingScreen("Time Stone ready...");

  for (let count = 3; count >= 1; count -= 1) {
    loadingMessage.textContent = String(count);
    await wait(1000);
  }

  loadingMessage.textContent = "SNAP!";
  await wait(400);
  hideLoadingScreen();
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function setShopDisabled(disabled) {
  shop.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
}

function updateProfileInfo() {
  const primaryLine = document.createElement("span");
  const secondaryLine = document.createElement("span");
  const boostActive = isBoostActive();

  primaryLine.className = "profile-primary";
  primaryLine.textContent = `${playerName} snapped away ${clickCount} people`;
  secondaryLine.className = "profile-secondary";
  secondaryLine.textContent = boostActive
    ? `Snap power: +${clickPower} × 2 = +${clickPower * 2} per snap`
    : `Snap power: +${clickPower} per snap`;

  profileInfo.replaceChildren(primaryLine, secondaryLine);
}

async function requestApi(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };
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

function getCookie(cookieName) {
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${cookieName}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}

function setCookie(cookieName, value, days) {
  document.cookie = `${cookieName}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax`;
}

function saveShopCookie() {
  setCookie("marvelShopState", JSON.stringify({
    name: playerName,
    clickPower,
    owned: ownedItems,
    boostUsedAt,
    boostUntil
  }), 365);
}

function loadShopCookie() {
  try {
    const cached = JSON.parse(getCookie("marvelShopState") || "null");
    if (!cached || cached.name !== playerName) return;
    clickPower = cached.clickPower || 1;
    ownedItems = cached.owned || ownedItems;
    boostUsedAt = cached.boostUsedAt || null;
    boostUntil = cached.boostUntil || null;
  } catch {
    setCookie("marvelShopState", "", -1);
  }
}

async function choosePlayerName() {
  const savedPlayerName = getCookie("playerName");
  if (savedPlayerName) {
    playerName = savedPlayerName;
    loadShopCookie();
    return;
  }

  while (!playerName) {
    const newPlayerName = prompt("Enter your player name")?.trim();
    if (!newPlayerName) continue;
    try {
      await requestApi("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    renderShop();
    await Promise.all([loadLeaderBoard(), loadPlayer()]);
    enableGame();
    hideLoadingScreen();
    clearInterval(shopTimer);
    shopTimer = setInterval(() => {
      renderShop();
      updateProfileInfo();
    }, 1000);
  } catch (error) {
    console.error("Could not start game:", error);
    showLoadingScreen("Cannot connect to database. Run supabase-shop.sql, then try again.", initializeGame);
  }
}

initializeGame();
