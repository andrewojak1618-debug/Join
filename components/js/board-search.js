/**
 * Wires the board search input once the board page has been rendered.
 */
function initBoardSearch() {
  const searchInput = document.getElementById("boardSearchInput");
  if (!searchInput || searchInput.dataset.searchReady === "true") return;

  searchInput.addEventListener("input", handleBoardSearchInput);
  searchInput.dataset.searchReady = "true";
}

function handleBoardSearchInput(event) {
  const searchTerm = event.target.value.trim().toLowerCase();
  const filteredTasks = getBoardSearchResults(searchTerm);

  renderBoardColumns(filteredTasks);
  initBoardTaskDetails(filteredTasks);
  toggleBoardNoResultsMessage(searchTerm, filteredTasks);
}

function getBoardSearchResults(searchTerm) {
  if (searchTerm.length < 2) return activeBoardTasks;
  return activeBoardTasks.filter((task) => taskMatchesSearch(task, searchTerm));
}

function toggleBoardNoResultsMessage(searchTerm, filteredTasks) {
  const noResultsElement = document.getElementById("boardSearchNoResults");
  const columnsElement = document.querySelector(".board-columns");
  if (!noResultsElement || !columnsElement) return;

  const showMessage = searchTerm.length >= 2 && filteredTasks.length === 0;

  noResultsElement.hidden = !showMessage;
  columnsElement.hidden = showMessage;
}

function taskMatchesSearch(task, searchTerm) {
  const title = (task.title || "").toLowerCase();
  const description = (task.description || "").toLowerCase();
  return title.includes(searchTerm) || description.includes(searchTerm);
}
