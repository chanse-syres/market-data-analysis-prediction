/**
 * Market Data Analysis Interface
 * 
 * This file holds all the client-side behavior for the first frontend prototype:
 * It includes: ticker parsing, placeholder visibility, loading/status feedback, temporary
 * analysis generation, and result rendering.
 *
 * The current analysis functions are just deterministic frontend placeholders. 
 * When the live market data layer is added, runFrontendAnalysis() will be replaced with an
 * API call that returns the same result shape that's used by renderResults().
 */

/**
 * Cached DOM references. Keeps selectors in one place and makes future markup
 * changes easier to review because all JavaScript dependencies are visible here.
 */
const form = document.querySelector("#analysis-form");
const input = document.querySelector("#ticker-input");
const exampleText = document.querySelector("#example-text");
const resultsList = document.querySelector("#results-list");
const statusLine = document.querySelector("#form-status");
const runButton = document.querySelector(".run-button");

/**
 * Temporary frontend limit for ticker symbols.
 */
const maxTickers = 10;

/**
 * Toggles the visibility of the example placeholder text.
 */
function syncExampleText() {
  exampleText.classList.toggle(
    "is-hidden",
    document.activeElement === input || input.value.trim().length > 0,
  );
}

/**
 * Converts user input into a unique list of ticker-like symbols.
 *
 * Users can type in comma-separated or space-separated values.
 *
 * Letters, numbers, dots, and dashes so symbols like BRK.B or BF-B can be
 * represented when the real market data layer is connected.
 *
 * @param {string} rawValue - Raw text from the ticker input.
 * @returns {string[]} Ordered, deduplicated ticker symbols.
 */
function parseTickers(rawValue) {
  return [
    ...new Set(
      rawValue
        .toUpperCase()
        .split(/[,\s]+/)
        .map((ticker) => ticker.replace(/[^A-Z0-9.-]/g, ""))
        .filter(Boolean),
    ),
  ].slice(0, maxTickers);
}

/**
 * Produces a stable numeric seed from ticker symbol.
 * Scaffolded for the temporary frontend analysis. 
 * Allows repeated searches for the same symbol.
 *
 * @param {string} symbol - Normalized ticker symbol.
 * @returns {number} Deterministic numeric seed.
 */
function symbolSeed(symbol) {
  return [...symbol].reduce((total, char, index) => {
    return total + char.charCodeAt(0) * (index + 11);
  }, symbol.length * 97);
}

/**
 * Restricts a number to an inclusive range.
 *
 * @param {number} value - Candidate value.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} Value constrained to the requested range.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a deterministic demo analysis result for a ticker.
 *
 * Important: this is not investment logic and not live market data. It is a
 * temporary UI adapter that reflects the type of object the real data layer should
 * eventually return: symbol, direction/result, confidence, and measured metrics.
 *
 * @param {string} symbol - Normalized ticker symbol.
 * @returns {{
 *   symbol: string,
 *   result: string,
 *   confidence: number,
 *   grows: boolean,
 *   metrics: Array<{ label: string, value: string }>
 * }} Result object consumed by renderResults().
 */
function analyzeTicker(symbol) {
  const seed = symbolSeed(symbol);
  const momentum = ((seed % 37) - 18) / 10;
  const volumeTrend = ((Math.floor(seed / 3) % 31) - 15) / 10;
  const relativeStrength = ((Math.floor(seed / 7) % 35) - 17) / 10;
  const volatility = 0.8 + ((Math.floor(seed / 11) % 22) / 10);
  const score =
    momentum * 0.42 +
    volumeTrend * 0.22 +
    relativeStrength * 0.28 -
    volatility * 0.08;
  const grows = score >= 0;
  const confidence = clamp(Math.round(58 + Math.abs(score) * 12), 52, 91);

  return {
    symbol,
    result: grows ? "Grows" : "Decreases",
    confidence,
    grows,
    metrics: [
      { label: "Momentum", value: `${momentum > 0 ? "+" : ""}${momentum.toFixed(1)}%` },
      { label: "Volume", value: `${volumeTrend > 0 ? "+" : ""}${volumeTrend.toFixed(1)}x` },
      { label: "Strength", value: `${relativeStrength > 0 ? "+" : ""}${relativeStrength.toFixed(1)}` },
      { label: "Volatility", value: `${volatility.toFixed(1)}%` },
    ],
  };
}

/**
 * Renders the analysis results into accessible result rows.
 *
 * The DOM is created with document.createElement instead of string templates to ensure that
 * future APId text will be safely inserted as textContent instead of HTML.
 *
 * @param {ReturnType<typeof analyzeTicker>[]} results - Analysis results.
 */
function renderResults(results) {
  resultsList.replaceChildren(
    ...results.map((analysis) => {
      const row = document.createElement("article");
      row.className = `result-row${analysis.grows ? "" : " is-negative"}`;

      const symbol = document.createElement("span");
      symbol.className = "result-symbol";
      symbol.textContent = analysis.symbol;

      const outcome = document.createElement("span");
      outcome.className = "result-outcome";
      outcome.textContent = `Result: ${analysis.result}`;

      const confidence = document.createElement("span");
      confidence.className = "result-confidence";
      confidence.textContent = `Confidence: ${analysis.confidence}%`;

      const metrics = document.createElement("div");
      metrics.className = "metric-strip";

      metrics.replaceChildren(
        ...analysis.metrics.map((item) => {
          const metric = document.createElement("span");
          metric.className = "metric";

          const label = document.createElement("span");
          label.className = "metric-label";
          label.textContent = item.label;

          const value = document.createElement("span");
          value.textContent = item.value;

          metric.replaceChildren(label, value);
          return metric;
        }),
      );

      row.replaceChildren(symbol, outcome, confidence, metrics);
      return row;
    }),
  );
}

/**
 * Updates the form status message and toggles error styling.
 *
 * @param {string} message - User-facing status text.
 * @param {boolean} [isError=false] - Whether the message represents an error.
 */
function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-error", isError);
}

/**
 * Temporary analysis entry point.
 *
 * To be replaced with live data-layer integration.
 * Function calls a backend endpoint, then normalize the API
 * response into the same array shape that renderResults() expects.
 *
 * @param {string[]} tickers - Normalized ticker symbols.
 * @returns {Promise<ReturnType<typeof analyzeTicker>[]>} Analysis results.
 */
async function runFrontendAnalysis(tickers) {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return tickers.map(analyzeTicker);
}

/**
 * Main form workflow:
 * 1. Prevents the browser from reloading the page.
 * 2. Parses and validates ticker input.
 * 3. Disables the action button while analysis is running.
 * 4. Displays results or reports a recoverable error.
 */
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const tickers = parseTickers(input.value);

  if (!tickers.length) {
    resultsList.replaceChildren();
    setStatus("Enter at least one ticker symbol.", true);
    input.focus();
    return;
  }

  runButton.disabled = true;
  setStatus(`Analyzing ${tickers.join(", ")}...`);

  try {
    const results = await runFrontendAnalysis(tickers);
    renderResults(results);
    setStatus(`${results.length} analysis result${results.length === 1 ? "" : "s"} generated.`);
  } catch (error) {
    resultsList.replaceChildren();
    setStatus("Analysis failed. Try again.", true);
  } finally {
    runButton.disabled = false;
  }
});

/*
  * Syncs the example placeholder text visibility.
*/
input.addEventListener("focus", syncExampleText);
input.addEventListener("blur", syncExampleText);
input.addEventListener("input", syncExampleText);

/* Establishes the correct initial placeholder state on first page load. */
syncExampleText();
