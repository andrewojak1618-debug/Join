/**
 * Shows the currently signed-in user on the protected summary page.
 */
function initSummaryUser() {
  const user = getStoredUser();
  if (!user) return;

  setSummaryText("summaryGreeting", getSummaryDisplayName(user));
  setSummaryText("summaryUserType", getSummaryUserTypeText(user));
  setSummaryText("summaryUserInitials", getSummaryInitials(user));
  setSummaryText("summaryGreetingTime", getTimeGreeting());
}


/**
 * Returns the display name for the summary greeting.
 */
function getSummaryDisplayName(user) {
  return user.name || "Guest";
}


/**
 * Builds short initials for the user button in the header.
 */
function getSummaryInitials(user) {
  return getSummaryDisplayName(user)
    .split(" ")
    .map((namePart) => namePart.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


/**
 * Returns greeting appropriate to the time of day.
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good night,";

  if (hour >= 5 && hour < 12) greeting = "Good morning,";
  else if (hour >= 12 && hour < 18) greeting = "Good afternoon,";
  else if (hour >= 18 && hour < 22) greeting = "Good evening,";

  return greeting;
}


/**
 * Explains whether the current session belongs to a guest or regular user.
 */
function getSummaryUserTypeText(user) {
  if (user.type === "firebase-guest" || user.type === "guest") {
    return "You are signed in as a guest.";
  }

  return "You are signed in with your account.";
}


/**
 * Updates a summary text element only when it exists on the page.
 */
function setSummaryText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = text;
}


/**
 * Loads tasks from the task store and fills the summary metric cards.
 * Renders a cached snapshot instantly to avoid a flash of empty values.
 */
async function initSummaryMetrics() {
  const cachedTasks = getCachedTasksSnapshot();
  if (cachedTasks) renderSummaryMetrics(cachedTasks);
  else setSummaryMetricsLoading(true);

  try {
    renderSummaryMetrics(await loadTasksFromStore());
  } catch (error) {
    setSummaryLoadError("Task overview could not be loaded.");
  } finally {
    setSummaryMetricsLoading(false);
  }
}


/**
 * Fills every summary metric card with counts from the given tasks.
 * @param {Object[]} tasks - Tasks to summarize.
 */
function renderSummaryMetrics(tasks) {
  setSummaryText("summaryTodoCount", countTasksByStatus(tasks, "todo"));
  setSummaryText("summaryProgressCount", countTasksByStatus(tasks, "in-progress"));
  setSummaryText("summaryFeedbackCount", countTasksByStatus(tasks, "feedback"));
  setSummaryText("summaryDoneCount", countTasksByStatus(tasks, "done"));
  setSummaryText("summaryBoardCount", tasks.length);
  setSummaryText("summaryUrgentCount", countTasksByPriority(tasks, "urgent"));
  setSummaryText("summaryDeadlineDate", getUpcomingDeadlineText(tasks));
}


/**
 * Toggles the loading style and neutral placeholders on the summary metrics.
 * @param {boolean} isLoading - True while no task data is available yet.
 */
function setSummaryMetricsLoading(isLoading) {
  const metrics = document.querySelector(".summary-metrics");
  if (metrics) metrics.classList.toggle("summary-metrics--loading", isLoading);
  if (isLoading) blankSummaryMetricValues();
}


/**
 * Replaces the static placeholder numbers with a neutral loading marker.
 */
function blankSummaryMetricValues() {
  const metricIds = [
    "summaryTodoCount", "summaryDoneCount", "summaryUrgentCount",
    "summaryBoardCount", "summaryProgressCount", "summaryFeedbackCount",
  ];
  metricIds.forEach((id) => setSummaryText(id, "–"));
  setSummaryText("summaryDeadlineDate", "–");
}


/**
 * Shows a page-level error when the summary task request fails.
 * @param {string} message - Error text shown to the user.
 */
function setSummaryLoadError(message) {
  const error = document.getElementById("summaryLoadError");
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
}


/**
 * Counts how many tasks are in the given board status.
 */
function countTasksByStatus(tasks, status) {
  return tasks.filter((task) => task.status === status).length;
}


/**
 * Counts how many tasks have the given priority.
 */
function countTasksByPriority(tasks, priority) {
  return tasks.filter((task) => task.priority === priority).length;
}


/**
 * Returns the closest valid due date from unfinished tasks.
 */
function getUpcomingDeadlineText(tasks, today = new Date()) {
  const upcomingDeadline = getUpcomingDeadline(tasks, today);
  if (!upcomingDeadline) return "No upcoming deadline";

  return upcomingDeadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/**
 * Selects the earliest upcoming date from unfinished tasks.
 */
function getUpcomingDeadline(tasks, today) {
  const startOfToday = getStartOfDay(today);
  return getOpenTaskDueDates(tasks)
    .filter((dueDate) => dueDate && dueDate >= startOfToday)
    .sort((firstDate, secondDate) => firstDate - secondDate)[0];
}


/**
 * Returns midnight in the local timezone for date comparisons.
 */
function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


/**
 * Collects parsed due dates from tasks that are not done.
 */
function getOpenTaskDueDates(tasks) {
  return tasks
    .filter((task) => task.status !== "done")
    .map((task) => parseTaskDueDate(task.dueDate));
}


