import "./index.css";

// Market Benchmark averages by category
const CATEGORY_AVERAGES: Record<string, number> = {
  "ART_AND_DESIGN": 4.35, "AUTO_AND_VEHICLES": 4.19, "BEAUTY": 4.27, "BOOKS_AND_REFERENCE": 4.34, "BUSINESS": 4.12, 
  "COMICS": 4.15, "COMMUNICATION": 4.15, "DATING": 3.97, "EDUCATION": 4.38, "ENTERTAINMENT": 4.12, "EVENTS": 4.43, "FINANCE": 4.13, 
  "FOOD_AND_DRINK": 4.16, "HEALTH_AND_FITNESS": 4.27, "HOUSE_AND_HOME": 4.19, "LIBRARIES_AND_DEMO": 4.17, "LIFESTYLE": 4.09, 
  "GAME": 4.28, "FAMILY": 4.19, "MEDICAL": 4.18, "SOCIAL": 4.25, "SHOPPING": 4.25, "PHOTOGRAPHY": 4.19, "TOOLS": 4.04, "PERSONALIZATION": 4.33, 
  "PRODUCTIVITY": 4.21, "PARENTING": 4.30, "WEATHER": 4.24, "VIDEO_PLAYERS": 4.06, "NEWS_AND_MAGAZINES": 4.13, "MAPS_AND_NAVIGATION": 4.05
};

document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById("theme-toggle") as HTMLButtonElement;
  const sunIcon = document.getElementById("theme-sun-icon") as HTMLElement;
  const moonIcon = document.getElementById("theme-moon-icon") as HTMLElement;

  // Tabs Elements
  const tabUrlModeBtn = document.getElementById("tab-url-mode") as HTMLButtonElement;
  const tabNameModeBtn = document.getElementById("tab-name-mode") as HTMLButtonElement;
  const urlModeContent = document.getElementById("url-mode-content") as HTMLElement;
  const nameModeContent = document.getElementById("name-mode-content") as HTMLElement;

  // Input Elements: URL Mode
  const urlInput = document.getElementById("url-input") as HTMLInputElement;
  const fetchUrlBtn = document.getElementById("fetch-url-btn") as HTMLButtonElement;
  const clearUrlBtn = document.getElementById("clear-url-btn") as HTMLButtonElement;

  // Input Elements: App Name Mode
  const nameInput = document.getElementById("name-input") as HTMLInputElement;
  const extractNameBtn = document.getElementById("extract-name-btn") as HTMLButtonElement;
  const clearNameBtn = document.getElementById("clear-name-btn") as HTMLButtonElement;

  // Resolved configuration elements
  const resolvedBanner = document.getElementById("resolved-banner") as HTMLElement;
  const resolvedAppName = document.getElementById("resolved-app-name") as HTMLElement;

  // App Specifications Form elements
  const specsForm = document.getElementById("specs-form") as HTMLFormElement;
  const appNameInput = document.getElementById("app-name") as HTMLInputElement;
  const categorySelect = document.getElementById("category") as HTMLSelectElement;
  const installsSelect = document.getElementById("installs") as HTMLSelectElement;
  const sizeInput = document.getElementById("size") as HTMLInputElement;
  const priceInput = document.getElementById("price") as HTMLInputElement;
  const appTypeSelect = document.getElementById("app-type") as HTMLSelectElement;
  const adsHiddenInput = document.getElementById("ads") as HTMLInputElement;
  const toggleAdsYesBtn = document.getElementById("toggle-ads-yes") as HTMLButtonElement;
  const toggleAdsNoBtn = document.getElementById("toggle-ads-no") as HTMLButtonElement;
  const contentRatingSelect = document.getElementById("content-rating") as HTMLSelectElement;
  const reviewsInput = document.getElementById("reviews") as HTMLInputElement;
  const lastUpdatedInput = document.getElementById("last-updated") as HTMLInputElement;
  const warningBox = document.getElementById("warning-box") as HTMLElement;
  const clearBtn = document.getElementById("clear-btn") as HTMLButtonElement;

  // What-If Simulation Elements
  const wiReviewsInput = document.getElementById("wi-reviews") as HTMLInputElement;
  const wiInstallsSelect = document.getElementById("wi-installs") as HTMLSelectElement;
  const wiSizeInput = document.getElementById("wi-size") as HTMLInputElement;
  const wiLastUpdatedInput = document.getElementById("wi-last-updated") as HTMLInputElement;
  const wiAdsHiddenInput = document.getElementById("wi-ads") as HTMLInputElement;
  const toggleWiAdsYesBtn = document.getElementById("toggle-wi-ads-yes") as HTMLButtonElement;
  const toggleWiAdsNoBtn = document.getElementById("toggle-wi-ads-no") as HTMLButtonElement;
  const simulateBtn = document.getElementById("simulate-btn") as HTMLButtonElement;
  const simulationResultBox = document.getElementById("simulation-result-box") as HTMLElement;
  const wiImpactBadge = document.getElementById("wi-impact-badge") as HTMLElement;
  const wiRatingBase = document.getElementById("wi-rating-base") as HTMLElement;
  const wiRatingSim = document.getElementById("wi-rating-sim") as HTMLElement;
  const wiRatingDiff = document.getElementById("wi-rating-diff") as HTMLElement;
  const wiExplanation = document.getElementById("wi-explanation") as HTMLElement;

  // Result Section Elements
  const emptyState = document.getElementById("empty-state") as HTMLElement;
  const loadingState = document.getElementById("loading-state") as HTMLElement;
  const resultContent = document.getElementById("result-content") as HTMLElement;
  const resultTitle = document.getElementById("result-title") as HTMLElement;
  const ratingMetric = document.getElementById("rating-metric") as HTMLElement;
  const sourceMetric = document.getElementById("source-metric") as HTMLElement;
  const confidenceMetric = document.getElementById("confidence-metric") as HTMLElement;

  // Market Trend Elements
  const marketVariancePill = document.getElementById("market-variance-pill") as HTMLElement;
  const trendAppScore = document.getElementById("trend-app-score") as HTMLElement;
  const trendCatName = document.getElementById("trend-cat-name") as HTMLElement;
  const trendCatScore = document.getElementById("trend-cat-score") as HTMLElement;
  const trendAppBar = document.getElementById("trend-app-bar") as HTMLElement;
  const trendCatBar = document.getElementById("trend-cat-bar") as HTMLElement;

  // SHAP and Recommendations Elements
  const shapBarsContainer = document.getElementById("shap-bars") as HTMLElement;
  const recommendationsCard = document.getElementById("recommendations-card") as HTMLElement;
  const recommendationsList = document.getElementById("recommendations-list") as HTMLElement;

  // Keep track of the current base prediction rating for simulation comparison
  let activeBaseRating = 4.15;

  // Single source of truth for the last rating prediction result
  let lastPredictionData: {
    category: string;
    rating: number;
    installs: number;
    reviews: number;
    appName: string;
    confidence?: number;
    shap_values?: Record<string, number>;
    updates?: number;
    ads?: string;
    size?: number;
  } | null = null;

  // ----------------- SaaS CUSTOM ENGINE EXTENSIONS -----------------
  let sessionPredictionsCount = 0;

  // ----------------- FRONTEND AUTH SYSTEM (UI-ONLY) -----------------
  let isLoggedIn = localStorage.getItem("rateiq_logged_in") === "true";
  let loggedInUserEmail = localStorage.getItem("rateiq_user_email") || "ponesakki0308@gmail.com";

  // ----------------- THEME SYSTEM -----------------
  function initializeTheme() {
    const savedTheme = localStorage.getItem("rateiq_theme") || "light";
    setTheme(savedTheme as "light" | "dark");
  }

  function setTheme(theme: "light" | "dark") {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
    localStorage.setItem("rateiq_theme", theme);
  }

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  });

  initializeTheme();

  // ----------------- DUAL INPUT TABS -----------------
  let currentInputMode: "url" | "name" = "url";

  function switchTab(mode: "url" | "name") {
    currentInputMode = mode;
    if (mode === "url") {
      tabUrlModeBtn.classList.add("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "dark:border-indigo-400");
      tabUrlModeBtn.classList.remove("border-transparent", "text-slate-500", "dark:text-slate-400");
      tabNameModeBtn.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400");
      tabNameModeBtn.classList.remove("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "dark:border-indigo-400");
      urlModeContent.classList.remove("hidden");
      nameModeContent.classList.add("hidden");
    } else {
      tabNameModeBtn.classList.add("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "dark:border-indigo-400");
      tabNameModeBtn.classList.remove("border-transparent", "text-slate-500", "dark:text-slate-400");
      tabUrlModeBtn.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400");
      tabUrlModeBtn.classList.remove("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "dark:border-indigo-400");
      nameModeContent.classList.remove("hidden");
      urlModeContent.classList.add("hidden");
    }
  }

  tabUrlModeBtn?.addEventListener("click", () => switchTab("url"));
  tabNameModeBtn?.addEventListener("click", () => switchTab("name"));

  // ----------------- TOGGLE BUTTON SWITCHES -----------------
  function updateAdsToggle(value: "Yes" | "No") {
    if (adsHiddenInput) {
      adsHiddenInput.value = value;
    }
    if (value === "Yes") {
      toggleAdsYesBtn.className = "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-indigo-600 text-white dark:bg-indigo-500";
      toggleAdsNoBtn.className = "flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
    } else {
      toggleAdsYesBtn.className = "flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
      toggleAdsNoBtn.className = "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-indigo-600 text-white dark:bg-indigo-500";
    }
  }

  toggleAdsYesBtn?.addEventListener("click", () => updateAdsToggle("Yes"));
  toggleAdsNoBtn?.addEventListener("click", () => updateAdsToggle("No"));

  function updateWiAdsToggle(value: "Yes" | "No") {
    if (wiAdsHiddenInput) {
      wiAdsHiddenInput.value = value;
    }
    if (value === "Yes") {
      toggleWiAdsYesBtn.className = "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-indigo-600 text-white dark:bg-indigo-500";
      toggleWiAdsNoBtn.className = "flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
    } else {
      toggleWiAdsYesBtn.className = "flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
      toggleWiAdsNoBtn.className = "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-indigo-600 text-white dark:bg-indigo-500";
    }
  }

  toggleWiAdsYesBtn?.addEventListener("click", () => updateWiAdsToggle("Yes"));
  toggleWiAdsNoBtn?.addEventListener("click", () => updateWiAdsToggle("No"));

  // ----------------- FORM SYNCS -----------------
  // Free vs Paid Price dependency
  appTypeSelect?.addEventListener("change", () => {
    if (appTypeSelect.value === "Free" && priceInput) {
      priceInput.value = "0.00";
    }
  });

  priceInput?.addEventListener("input", () => {
    if (parseFloat(priceInput.value) > 0 && appTypeSelect) {
      appTypeSelect.value = "Paid";
    }
  });

  // Validate reviews count relative to installs
  function checkInstallsAndReviews() {
    if (!installsSelect || !reviewsInput || !warningBox) return;
    const installs = parseInt(installsSelect.value) || 0;
    const reviews = parseInt(reviewsInput.value) || 0;
    
    if (reviews > installs && installs > 0) {
      warningBox.classList.remove("hidden");
    } else {
      warningBox.classList.add("hidden");
    }
  }

  installsSelect?.addEventListener("change", checkInstallsAndReviews);
  reviewsInput?.addEventListener("input", checkInstallsAndReviews);

  // ----------------- METADATA FETCH & POPULATE -----------------
  async function triggerMetadataFetch(queryParam: string, queryValue: string, btnElement: HTMLButtonElement, originalHtml: string) {
    if (!queryValue) {
      alert(`Please enter a valid target for extraction.`);
      return;
    }

    btnElement.disabled = true;
    btnElement.innerHTML = `
      <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Extracting...</span>
    `;

    try {
      const res = await fetch(`/api/fetch-metadata?${queryParam}=${encodeURIComponent(queryValue)}`);
      if (!res.ok) throw new Error("Metadata extraction failed.");
      
      const data = await res.json();

      // Populate Specifications Form
      if (appNameInput && data.appName !== undefined) appNameInput.value = data.appName;
      if (categorySelect && data.category !== undefined) categorySelect.value = data.category;
      if (sizeInput && data.size !== undefined) sizeInput.value = String(data.size);
      
      // Select appropriate installs option
      if (installsSelect && data.installs !== undefined) {
        installsSelect.value = String(data.installs);
      }

      if (reviewsInput && data.reviews !== undefined) reviewsInput.value = String(data.reviews);
      if (contentRatingSelect && data.contentRating !== undefined) contentRatingSelect.value = data.contentRating;
      if (lastUpdatedInput && data.lastUpdatedDays !== undefined) lastUpdatedInput.value = String(data.lastUpdatedDays);
      
      if (data.ads !== undefined) {
        updateAdsToggle(data.ads);
      }

      if (appTypeSelect && data.appType !== undefined) appTypeSelect.value = data.appType;
      if (priceInput && data.price !== undefined) priceInput.value = Number(data.price).toFixed(2);

      // Sync resolved banner
      if (resolvedAppName && data.appName !== undefined) {
        resolvedAppName.textContent = data.appName;
      }
      resolvedBanner.classList.remove("hidden");

      // Populate What-If Inputs with matching starting conditions
      if (wiReviewsInput) wiReviewsInput.value = String(data.reviews ?? 250);
      if (wiInstallsSelect) wiInstallsSelect.value = String(data.installs ?? 10000);
      if (wiSizeInput) wiSizeInput.value = String(data.size ?? 24.5);
      if (wiLastUpdatedInput) wiLastUpdatedInput.value = String(data.lastUpdatedDays ?? 30);
      updateWiAdsToggle(data.ads || "Yes");

      checkInstallsAndReviews();
    } catch (err) {
      alert("Store metadata extraction failed. Please check the URL or App Name.");
    } finally {
      btnElement.disabled = false;
      btnElement.innerHTML = originalHtml;
    }
  }

  fetchUrlBtn?.addEventListener("click", () => {
    triggerMetadataFetch("url", urlInput.value.trim(), fetchUrlBtn, "Fetch Store Data");
  });

  extractNameBtn?.addEventListener("click", () => {
    triggerMetadataFetch("name", nameInput.value.trim(), extractNameBtn, "Extract From Name");
  });

  // Independent Clears
  clearUrlBtn?.addEventListener("click", () => {
    urlInput.value = "";
  });

  clearNameBtn?.addEventListener("click", () => {
    nameInput.value = "";
  });

  // ----------------- RENDER SHAP BARS -----------------
  function renderShapBars(shapValues: Record<string, number>) {
    if (!shapBarsContainer) return;
    shapBarsContainer.innerHTML = "";

    const maxVal = 0.5;

    Object.entries(shapValues).forEach(([feature, val]) => {
      const absPercent = Math.min(Math.round((Math.abs(val) / maxVal) * 100), 100);
      const isPositive = val >= 0;
      const valStr = isPositive ? `+${val.toFixed(2)}` : val.toFixed(2);
      const textColorClass = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
      const barColorClass = isPositive ? "bg-emerald-500" : "bg-rose-500";

      const barRow = document.createElement("div");
      barRow.className = "space-y-1.5";

      barRow.innerHTML = `
        <div class="flex justify-between items-center text-xs font-semibold">
          <span class="text-slate-700 dark:text-slate-300">${feature}</span>
          <span class="${textColorClass}">${valStr}</span>
        </div>
        <div class="relative w-full h-3.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-800">
          <!-- Left side: Negative impact bar -->
          <div class="w-1/2 flex justify-end h-full border-r border-dashed border-slate-300 dark:border-slate-800">
            ${!isPositive ? `<div class="${barColorClass} h-full" style="width: ${absPercent}%"></div>` : ""}
          </div>
          <!-- Right side: Positive impact bar -->
          <div class="w-1/2 flex justify-start h-full">
            ${isPositive ? `<div class="${barColorClass} h-full" style="width: ${absPercent}%"></div>` : ""}
          </div>
        </div>
      `;

      shapBarsContainer.appendChild(barRow);
    });
  }

  // ----------------- RENDER STRUCTURED RECOMMENDATIONS -----------------
  function renderRecommendations(shapValues: Record<string, number>, adsValue: string, reviewsValue: number, installsValue: number, lastUpdatedDays: number) {
    if (!recommendationsList) return;
    recommendationsList.innerHTML = "";

    const recommendations: Array<{
      level: "high" | "medium" | "positive";
      levelLabel: string;
      title: string;
      reason: string;
    }> = [];

    // Rule 1: High Impact Ads frequency reduction
    if (adsValue === "Yes" && shapValues["Ad Presence"] < 0) {
      recommendations.push({
        level: "high",
        levelLabel: "High Impact",
        title: "Reduce ads frequency",
        reason: "Reason: Ads negatively affect rating"
      });
    }

    // Rule 2: High Impact Review volume increment
    const ratio = installsValue > 0 ? reviewsValue / installsValue : 0.0;
    if (ratio < 0.02 && shapValues["Engagement Ratio"] < 0) {
      recommendations.push({
        level: "high",
        levelLabel: "High Impact",
        title: "Increase reviews",
        reason: "Reason: Below category benchmark"
      });
    }

    // Rule 3: Medium Impact update schedule
    if (lastUpdatedDays > 90 && shapValues["Update Recency"] < 0) {
      recommendations.push({
        level: "medium",
        levelLabel: "Medium Impact",
        title: "Update app more frequently",
        reason: "Reason: Last update is outdated"
      });
    }

    // Rule 4: Positive Signal installs
    if (installsValue >= 1000000) {
      recommendations.push({
        level: "positive",
        levelLabel: "Positive Signal",
        title: "Strong installs",
        reason: "Reason: Supports rating stability"
      });
    }

    // Default recommendation if empty
    if (recommendations.length === 0) {
      recommendations.push({
        level: "positive",
        levelLabel: "Positive Signal",
        title: "App structure fully optimized",
        reason: "Reason: Features align exceptionally with top benchmark criteria"
      });
    }

    // Dynamically build clean visual containers without emojis
    recommendations.forEach(rec => {
      let badgeStyles = "";
      if (rec.level === "high") {
        badgeStyles = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/30";
      } else if (rec.level === "medium") {
        badgeStyles = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30";
      } else {
        badgeStyles = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30";
      }

      const itemBox = document.createElement("div");
      itemBox.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30 gap-2";

      itemBox.innerHTML = `
        <div class="space-y-0.5">
          <div class="text-sm font-bold text-slate-900 dark:text-white">${rec.title}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">${rec.reason}</div>
        </div>
        <div>
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeStyles}">
            ${rec.levelLabel}
          </span>
        </div>
      `;

      recommendationsList.appendChild(itemBox);
    });

    recommendationsCard.classList.remove("hidden");
  }

  // ----------------- RENDER MARKET TREND COMPARISON -----------------
  function renderMarketTrend(category: string, rating: number) {
    const catAvg = CATEGORY_AVERAGES[category] || 4.15;
    const variance = rating - catAvg;
    const isPositive = variance >= 0;

    // Set text scores
    if (trendAppScore) trendAppScore.textContent = rating.toFixed(1);
    if (trendCatScore) trendCatScore.textContent = catAvg.toFixed(1);
    if (trendCatName) trendCatName.textContent = `${category.replace(/_/g, " ")} Domain Avg`;

    // Set bars width
    if (trendAppBar) trendAppBar.style.width = `${(rating / 5.0) * 100}%`;
    if (trendCatBar) trendCatBar.style.width = `${(catAvg / 5.0) * 100}%`;

    // Set variance pill banner
    if (marketVariancePill) {
      marketVariancePill.textContent = `${isPositive ? "+" : ""}${variance.toFixed(2)} Market Variance`;
      if (isPositive) {
        marketVariancePill.className = "text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-md";
      } else {
        marketVariancePill.className = "text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 rounded-md";
      }
    }
  }

  // ----------------- RENDER COMPETITOR ANALYSIS -----------------
  async function renderCompetitorAnalysis(category: string, rating: number, installs: number, reviews: number, appName: string) {
    const competitorCard = document.getElementById("competitor-card") as HTMLElement;
    const competitorCategoryBadge = document.getElementById("competitor-category-badge") as HTMLElement;
    const competitorInsightText = document.getElementById("competitor-insight-text") as HTMLElement;
    const competitorRankVal = document.getElementById("competitor-rank-val") as HTMLElement;
    const competitorAvgRatingVal = document.getElementById("competitor-avg-rating-val") as HTMLElement;
    const competitorInstallTier = document.getElementById("competitor-install-tier") as HTMLElement;
    const competitorInstallMin = document.getElementById("competitor-install-min") as HTMLElement;
    const competitorInstallAvg = document.getElementById("competitor-install-avg") as HTMLElement;
    const competitorInstallMax = document.getElementById("competitor-install-max") as HTMLElement;
    const competitorsListContainer = document.getElementById("competitors-list-container") as HTMLElement;

    const compLoading = document.getElementById("comp-loading-state");
    const compEmpty = document.getElementById("comp-empty-state");

    if (!competitorCard) return;

    if (compLoading) compLoading.classList.remove("hidden");
    if (compEmpty) compEmpty.classList.add("hidden");
    competitorCard.classList.add("hidden");

    try {
      const response = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rating, installs, reviews, appName })
      });

      if (!response.ok) throw new Error("Competitor API failed");

      const data = await response.json();

      const formatInstalls = (num: number) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(0) + "B";
        if (num >= 1000000) return (num / 1000000).toFixed(0) + "M";
        if (num >= 1000) return (num / 1000).toFixed(0) + "K";
        return num.toString();
      };

      if (competitorCategoryBadge) {
        competitorCategoryBadge.textContent = category.replace(/_/g, " ");
      }

      if (competitorInsightText) {
        competitorInsightText.textContent = data.insight;
      }

      if (competitorRankVal) {
        competitorRankVal.textContent = `Top ${data.topPercentile}%`;
      }

      if (competitorAvgRatingVal) {
        competitorAvgRatingVal.textContent = data.averageRating.toFixed(2);
      }

      if (competitorInstallTier) {
        const tier = installs >= data.installAvg ? "High Volume" : "Low Volume";
        competitorInstallTier.textContent = tier;
        if (installs >= data.installAvg) {
          competitorInstallTier.className = "text-sm font-black text-emerald-600 dark:text-emerald-400 block";
        } else {
          competitorInstallTier.className = "text-sm font-black text-rose-600 dark:text-rose-400 block";
        }
      }

      if (competitorInstallMin) competitorInstallMin.textContent = formatInstalls(data.installMin);
      if (competitorInstallAvg) competitorInstallAvg.textContent = formatInstalls(data.installAvg);
      if (competitorInstallMax) competitorInstallMax.textContent = formatInstalls(data.installMax);

      if (competitorsListContainer) {
        competitorsListContainer.innerHTML = "";

        if (data.competitors && data.competitors.length > 0) {
          data.competitors.forEach((comp: any) => {
            const compRow = document.createElement("div");
            compRow.className = "flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/20";
            compRow.innerHTML = `
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">${comp.appName}</div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  ${formatInstalls(comp.installs)} Installs &bull; ${comp.reviews.toLocaleString()} Reviews
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${comp.rating.toFixed(1)}</span>
                <svg class="h-3 w-3 text-amber-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            `;
            competitorsListContainer.appendChild(compRow);
          });
        } else {
          competitorsListContainer.innerHTML = `
            <div class="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
              No competitors in dataset.
            </div>
          `;
        }
      }

      competitorCard.classList.remove("hidden");
    } catch (err) {
      console.error("Competitor analysis rendering failed:", err);
      if (compEmpty) compEmpty.classList.remove("hidden");
      competitorCard.classList.add("hidden");
    } finally {
      if (compLoading) compLoading.classList.add("hidden");
    }
  }

  // Helper: Save prediction result to backend history
  async function savePredictionToHistory(payload: any, rating: number, confidence: number, shap_values: Record<string, number>) {
    try {
      const compRes = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: payload.category,
          rating: rating,
          installs: payload.installs,
          reviews: payload.reviews,
          appName: payload.app_name
        })
      });
      let categoryAverage = 4.2;
      let percentileRank = 50;
      if (compRes.ok) {
        const compData = await compRes.json();
        categoryAverage = compData.averageRating || 4.2;
        percentileRank = compData.percentileRank !== undefined ? compData.percentileRank : 50;
      }

      const inputMode = (currentInputMode === "url") ? "URL" : "Manual";

      const historyRecord = {
        userEmail: isLoggedIn ? loggedInUserEmail : "ponesakki0308@gmail.com",
        appName: payload.app_name,
        category: payload.category,
        rating: rating,
        confidence: confidence,
        inputMode: inputMode,
        payload: {
          installs: payload.installs,
          size: payload.size,
          price: payload.price,
          app_type: payload.app_type,
          contains_ads: payload.contains_ads,
          content_rating: payload.content_rating,
          reviews: payload.reviews,
          last_updated_days: payload.last_updated_days
        },
        shap_values: shap_values,
        percentileRank: percentileRank,
        categoryAverage: categoryAverage
      };

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historyRecord)
      });
    } catch (e) {
      console.error("Failed to automatically save prediction history:", e);
    }
  }

  // ----------------- SUBMIT FORM & RUN PREDICTION -----------------
  specsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!emptyState || !loadingState || !resultContent) return;

    // Transition elements visibility
    emptyState.classList.add("hidden");
    resultContent.classList.add("hidden");
    recommendationsCard.classList.add("hidden");
    const competitorCard = document.getElementById("competitor-card");
    if (competitorCard) competitorCard.classList.add("hidden");
    loadingState.classList.remove("hidden");

    // Gather payloads with basic validation
    const appName = appNameInput.value.trim();
    if (!appName) {
      showToast("Please enter an application name.", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    const size = parseFloat(sizeInput.value);
    if (isNaN(size) || size <= 0) {
      showToast("Please enter a valid positive size (MB).", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    const price = parseFloat(priceInput.value);
    if (isNaN(price) || price < 0) {
      showToast("Please enter a valid non-negative price.", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    const reviews = parseInt(reviewsInput.value);
    if (isNaN(reviews) || reviews < 0) {
      showToast("Please enter a valid non-negative reviews count.", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    const lastUpdatedDays = parseInt(lastUpdatedInput.value);
    if (isNaN(lastUpdatedDays) || lastUpdatedDays <= 0) {
      showToast("Please enter a valid positive number of days since last update.", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    const category = categorySelect.value;
    const installs = parseInt(installsSelect.value) || 10000;
    const appType = appTypeSelect.value;
    const ads = adsHiddenInput.value;
    const contentRating = contentRatingSelect.value;

    const payload = {
      app_name: appName,
      category: category,
      installs: installs,
      size: size,
      app_type: appType,
      content_rating: contentRating,
      reviews: reviews,
      last_updated_days: lastUpdatedDays,
      contains_ads: ads,
      price: price
    };

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("API call error.");

      const data = await response.json();
      const rating = Number(data.rating || 4.3);
      activeBaseRating = rating; // Save to compare with simulation

      // Save to global competitor analysis store
      lastPredictionData = {
        category,
        rating,
        installs,
        reviews,
        appName,
        confidence: data.confidence || 92,
        shap_values: data.shap_values || {},
        updates: lastUpdatedDays,
        ads,
        size
      };

      // Populate KPI elements
      if (resultTitle) resultTitle.textContent = `${appName} Analysis Report`;
      if (ratingMetric) ratingMetric.textContent = `${rating.toFixed(1)} / 5.0`;
      if (sourceMetric) sourceMetric.textContent = `Source: ${data.source || "Predictive Model Fallback"}`;
      if (confidenceMetric) confidenceMetric.textContent = `${data.confidence || 92}%`;

      // Determine Primary Strength and Risk Profile based on SHAP impacts
      let primaryStrength = "Optimized MB Size";
      let riskProfile = "High Reviews Ratio";
      const shaps = data.shap_values || {};
      let maxShapVal = -999;
      let minShapVal = 999;
      
      const formatKeyName = (k: string) => {
        const mapping: Record<string, string> = {
          "installs": "User Install Volume",
          "reviews": "Review Density",
          "size": "App Footprint (MB)",
          "price": "Pricing Model",
          "contains_ads": "In-App Ad Density",
          "last_updated_days": "Update Frequency",
          "category": "Market Segment Context",
          "app_type": "Subscription Tier"
        };
        return mapping[k] || k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      };

      Object.entries(shaps).forEach(([key, val]) => {
        const numVal = Number(val);
        if (numVal > maxShapVal && numVal > 0) {
          maxShapVal = numVal;
          primaryStrength = formatKeyName(key);
        }
        if (numVal < minShapVal && numVal < 0) {
          minShapVal = numVal;
          riskProfile = formatKeyName(key);
        }
      });

      const strengthMetric = document.getElementById("strength-metric");
      const riskMetric = document.getElementById("risk-metric");
      if (strengthMetric) strengthMetric.textContent = primaryStrength;
      if (riskMetric) riskMetric.textContent = riskProfile;

      // Draw SHAP and market compare
      renderShapBars(data.shap_values || {});
      renderMarketTrend(category, rating);
      renderRecommendations(data.shap_values || {}, ads, reviews, installs, lastUpdatedDays);
      await renderCompetitorAnalysis(category, rating, installs, reviews, appName);

      // Save prediction report automatically in history
      await savePredictionToHistory(payload, rating, data.confidence || 92, data.shap_values || {});

      // Increment active predictions session counter
      sessionPredictionsCount++;
      updateHomeDashboard();

      // Show professional smart toast alerts
      showToast(`Prediction generated successfully for ${appName}.`, "success");

      // Set visibility
      loadingState.classList.add("hidden");
      resultContent.classList.remove("hidden");
    } catch (err) {
      showToast("Error occurred contacting rating API engine. Please verify configurations.", "error");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
    }
  });

  // Reset/Clear Form Handler
  clearBtn?.addEventListener("click", () => {
    specsForm.reset();
    urlInput.value = "";
    nameInput.value = "";
    resolvedBanner.classList.add("hidden");
    updateAdsToggle("Yes");
    
    if (warningBox) {
      warningBox.classList.add("hidden");
    }

    // Reset results views
    if (emptyState && loadingState && resultContent) {
      resultContent.classList.add("hidden");
      recommendationsCard.classList.add("hidden");
      const competitorCard = document.getElementById("competitor-card");
      if (competitorCard) competitorCard.classList.add("hidden");
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden");
    }

    // Reset global competitor data
    lastPredictionData = null;
    const compEmpty = document.getElementById("comp-empty-state");
    if (compEmpty) compEmpty.classList.remove("hidden");
  });

  // ----------------- WHAT-IF SIMULATION FLOW -----------------
  simulateBtn?.addEventListener("click", async () => {
    // Collect active general specifications as baseline, and overlay What-If fields
    const appName = appNameInput.value.trim() || "What-If Simulator App";
    const category = categorySelect.value;
    const contentRating = contentRatingSelect.value;
    const price = parseFloat(priceInput.value) || 0.0;
    const appType = appTypeSelect.value;

    // What-If Overlays with basic validation
    const wiReviews = parseInt(wiReviewsInput.value);
    if (isNaN(wiReviews) || wiReviews < 0) {
      showToast("Please enter a valid non-negative What-If Reviews value.", "error");
      return;
    }

    const wiSize = parseFloat(wiSizeInput.value);
    if (isNaN(wiSize) || wiSize <= 0) {
      showToast("Please enter a valid positive What-If Size (MB) value.", "error");
      return;
    }

    const wiLastUpdated = parseInt(wiLastUpdatedInput.value);
    if (isNaN(wiLastUpdated) || wiLastUpdated <= 0) {
      showToast("Please enter a valid positive What-If Update Recency value.", "error");
      return;
    }

    const wiInstalls = parseInt(wiInstallsSelect.value) || 10000;
    const wiAds = wiAdsHiddenInput.value;

    simulateBtn.disabled = true;
    simulateBtn.textContent = "Simulating Model Outcomes...";

    const payload = {
      app_name: appName,
      category: category,
      installs: wiInstalls,
      size: wiSize,
      app_type: appType,
      content_rating: contentRating,
      reviews: wiReviews,
      last_updated_days: wiLastUpdated,
      contains_ads: wiAds,
      price: price
    };

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Simulation error.");

      const data = await response.json();
      const simRating = Number(data.rating || 4.1);

      // Perform delta calculation against saved active base prediction score
      const baseRating = activeBaseRating;
      const delta = simRating - baseRating;
      const absDelta = Math.abs(delta);

      // Impact Level definition
      let impactLevel: "High" | "Medium" | "Low" = "Low";
      let impactClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      
      if (absDelta >= 0.2) {
        impactLevel = "High";
        impactClass = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30";
      } else if (absDelta >= 0.05) {
        impactLevel = "Medium";
        impactClass = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30";
      } else {
        impactClass = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30";
      }

      // Generate dynamic short professional explanation string
      let explanationStr = "";
      if (delta > 0.02) {
        explanationStr = `Optimizations successfully increased rating forecast by ${delta.toFixed(2)}. Reducing ads, compressed package footprint, or regular updates provides a powerful accelerant to overall user success index.`;
      } else if (delta < -0.02) {
        explanationStr = `Simulated adjustments reduced the rating forecast by ${delta.toFixed(2)}. Heavy advertisement layout, outdated release schedules, or elevated payload sizes introduces significant rating drag.`;
      } else {
        explanationStr = `Simulated specifications are stable relative to baseline, yielding minimal variance. Benchmark trajectory holds steady across Category domains.`;
      }

      // Populate simulation views
      if (wiRatingBase) wiRatingBase.textContent = baseRating.toFixed(1);
      if (wiRatingSim) wiRatingSim.textContent = simRating.toFixed(1);
      if (wiRatingDiff) {
        wiRatingDiff.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`;
        if (delta >= 0) {
          wiRatingDiff.className = "text-base font-black text-emerald-600 dark:text-emerald-400";
        } else {
          wiRatingDiff.className = "text-base font-black text-rose-600 dark:text-rose-400";
        }
      }

      if (wiImpactBadge) {
        wiImpactBadge.textContent = `${impactLevel} Impact`;
        wiImpactBadge.className = `text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${impactClass}`;
      }

      if (wiExplanation) wiExplanation.textContent = explanationStr;

      simulationResultBox.classList.remove("hidden");
    } catch (err) {
      alert("Failed to compute Sandbox prediction outcomes. Ensure baseline metrics are defined.");
    } finally {
      simulateBtn.disabled = false;
      simulateBtn.textContent = "Simulate Rating Change";
    }
  });

  // ----------------- SIDEBAR PAGE NAVIGATION -----------------
  const pages = ["page-home", "page-prediction", "page-competitor", "page-trend", "page-advisor", "page-eda-insights", "page-eda-dashboard", "page-history", "page-about", "page-signup", "page-profile", "page-settings"];
  const navButtons: Record<string, HTMLElement | null> = {
    "page-home": document.getElementById("nav-home"),
    "page-prediction": document.getElementById("nav-prediction"),
    "page-competitor": document.getElementById("nav-competitor"),
    "page-trend": document.getElementById("nav-trend"),
    "page-advisor": document.getElementById("nav-advisor"),
    "page-eda-insights": document.getElementById("nav-eda-insights"),
    "page-eda-dashboard": document.getElementById("nav-eda-dashboard"),
    "page-history": document.getElementById("nav-history"),
    "page-about": document.getElementById("nav-about"),
    "page-signup": null,
    "page-profile": null,
    "page-settings": null
  };

  function updateCompetitorView() {
    const compEmpty = document.getElementById("comp-empty-state");
    const competitorCard = document.getElementById("competitor-card");
    const compLoading = document.getElementById("comp-loading-state");

    if (lastPredictionData) {
      if (compEmpty) compEmpty.classList.add("hidden");
      renderCompetitorAnalysis(
        lastPredictionData.category,
        lastPredictionData.rating,
        lastPredictionData.installs,
        lastPredictionData.reviews,
        lastPredictionData.appName
      );
    } else {
      if (competitorCard) competitorCard.classList.add("hidden");
      if (compLoading) compLoading.classList.add("hidden");
      if (compEmpty) {
        compEmpty.classList.remove("hidden");
      }
    }
  }

  async function updateTrendView() {
    const trendEmpty = document.getElementById("trend-empty-state");
    const trendLoading = document.getElementById("trend-loading-state");
    const trendContent = document.getElementById("trend-content-container");

    if (!lastPredictionData) {
      if (trendContent) trendContent.classList.add("hidden");
      if (trendLoading) trendLoading.classList.add("hidden");
      if (trendEmpty) trendEmpty.classList.remove("hidden");
      return;
    }

    if (trendEmpty) trendEmpty.classList.add("hidden");
    if (trendContent) trendContent.classList.add("hidden");
    if (trendLoading) trendLoading.classList.remove("hidden");

    try {
      const response = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: lastPredictionData.category,
          rating: lastPredictionData.rating,
          installs: lastPredictionData.installs,
          reviews: lastPredictionData.reviews,
          appName: lastPredictionData.appName
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trend data");
      }

      const data = await response.json();
      const categoryApps = data.competitors || [];
      const category = lastPredictionData.category;
      const predRating = lastPredictionData.rating;
      const catAvg = data.averageRating;

      // 1. App Position Setup
      const diff = predRating - catAvg;
      
      const badgeEl = document.getElementById("trend-category-badge");
      if (badgeEl) badgeEl.textContent = category.replace(/_/g, " ");

      const predValEl = document.getElementById("trend-predicted-val");
      if (predValEl) predValEl.textContent = predRating.toFixed(2);

      const avgValEl = document.getElementById("trend-average-val");
      if (avgValEl) avgValEl.textContent = catAvg.toFixed(2);

      const diffBadgeEl = document.getElementById("trend-diff-badge");
      const posLabelEl = document.getElementById("trend-position-label");
      const posDescEl = document.getElementById("trend-position-desc");

      let positionLabel = "Near Average";
      let positionClass = "text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider";
      let diffText = (diff >= 0 ? "+" : "") + diff.toFixed(2);
      let diffClass = diff >= 0 ? "text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/10" : "text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/10";
      let positionDesc = "";

      if (diff > 0.1) {
        positionLabel = "Above Average";
        positionDesc = `Your application's predicted rating of **${predRating.toFixed(2)}** is **+${diff.toFixed(2)}** points above the category average of **${catAvg.toFixed(2)}**. This suggests your feature configurations and specifications are highly competitive and possess robust quality factors that exceed standard category benchmarks.`;
      } else if (diff < -0.1) {
        positionLabel = "Below Average";
        positionDesc = `Your application's predicted rating of **${predRating.toFixed(2)}** is **${diff.toFixed(2)}** points below the category baseline average of **${catAvg.toFixed(2)}**. We recommend reviewing negative SHAP impact factors (such as ad presence, excessive file size, or update recency) to close this performance gap.`;
      } else {
        positionLabel = "Near Average";
        positionDesc = `Your application's predicted rating of **${predRating.toFixed(2)}** is highly aligned with the category baseline average of **${catAvg.toFixed(2)}** (within a **${Math.abs(diff).toFixed(2)}** points deviation). Minor optimization tweaks to update frequency or ad configurations could easily push your product into the superior above-average tier.`;
      }

      if (diffBadgeEl) {
        diffBadgeEl.textContent = diffText;
        diffBadgeEl.className = "text-xs font-bold px-2.5 py-1 rounded-full border " + diffClass;
      }
      if (posLabelEl) {
        posLabelEl.textContent = positionLabel;
        posLabelEl.className = "text-xs font-bold uppercase tracking-wider " + (diff > 0.1 ? "text-emerald-600 dark:text-emerald-400" : diff < -0.1 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400");
      }
      if (posDescEl) {
        posDescEl.innerHTML = positionDesc.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      }

      // If categoryApps is empty, use a fallback list
      const safeCategoryApps = categoryApps.length > 0 ? categoryApps : [
        { appName: "App A", rating: 4.2, installs: 100000, reviews: 2000 },
        { appName: "App B", rating: 4.5, installs: 500000, reviews: 12000 },
        { appName: "App C", rating: 3.9, installs: 10000, reviews: 200 }
      ];

      // 2. Compute Category Rating Trend over time
      const ratingTrend = calculateCategoryRatingTrend(safeCategoryApps);
      drawLineChart("chart-rating-trend", ratingTrend);

      const r2021 = ratingTrend[0].avg;
      const r2026 = ratingTrend[5].avg;
      const rDiff = r2026 - r2021;
      let ratingInsight = "";
      if (rDiff > 0.02) {
        ratingInsight = `The category average has exhibited a clear **increasing trend** of **+${rDiff.toFixed(2)}** points over the last 5 years, rising from ${r2021.toFixed(2)} to ${r2026.toFixed(2)}. This reflects aggregate quality improvement and rising user standards across the competitive landscape.`;
      } else if (rDiff < -0.02) {
        ratingInsight = `The category average shows a clear **decreasing trend** of **${rDiff.toFixed(2)}** points over the last 5 years, dropping from ${r2021.toFixed(2)} to ${r2026.toFixed(2)}. This suggests intensifying user fatigue, higher critical scrutiny, or saturation of competitive quality.`;
      } else {
        ratingInsight = `The category average exhibits a highly **stable trend**, hovering around a consolidated average of ${r2026.toFixed(2)} with less than ${Math.abs(rDiff).toFixed(2)} fluctuation. User feedback expectations remain highly consistent and predictable over time.`;
      }
      const riEl = document.getElementById("trend-rating-insight");
      if (riEl) {
        riEl.innerHTML = ratingInsight.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      }

      // 3. Compute Install Growth Trend
      const installTrend = calculateInstallGrowthTrend(safeCategoryApps);
      drawInstallGrowthChart("chart-install-trend", installTrend);

      // Analyze relationship between installs and rating from raw categoryApps
      let highRatingAvgInstalls = 0;
      let highRatingCount = 0;
      let lowRatingAvgInstalls = 0;
      let lowRatingCount = 0;

      safeCategoryApps.forEach(app => {
        if (app.rating >= 4.3) {
          highRatingAvgInstalls += app.installs;
          highRatingCount++;
        } else {
          lowRatingAvgInstalls += app.installs;
          lowRatingCount++;
        }
      });

      const highAvg = highRatingCount > 0 ? highRatingAvgInstalls / highRatingCount : 0;
      const lowAvg = lowRatingCount > 0 ? lowRatingAvgInstalls / lowRatingCount : 0;

      let installRatingInsight = "";
      if (highAvg > lowAvg * 1.1) {
        installRatingInsight = `High-rated applications (≥ 4.3) average **${Math.round(highAvg).toLocaleString()}** installs, which is significantly superior to lower-rated apps (**${Math.round(lowAvg).toLocaleString()}**). This demonstrates a clear compounding return where superior user reviews catalyze organic referral loops and lower user acquisition costs over time.`;
      } else if (lowAvg > highAvg * 1.1) {
        installRatingInsight = `Interestingly, lower-rated applications in this category average **${Math.round(lowAvg).toLocaleString()}** installs, while highly-rated ones sit at **${Math.round(highAvg).toLocaleString()}**. This indicates that legacy first-mover advantages or aggressive programmatic advertising distribution channels dominate user acquisition over pure rating scores.`;
      } else {
        installRatingInsight = `Average installations are roughly similar between high-rated (**${Math.round(highAvg).toLocaleString()}**) and standard-rated apps (**${Math.round(lowAvg).toLocaleString()}**). User volume is driven evenly by product utility demands or specific localized marketing rather than being hyper-sensitive to rating disparities.`;
      }
      const iiEl = document.getElementById("trend-install-insight");
      if (iiEl) {
        iiEl.innerHTML = installRatingInsight.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      }

      // 4. Update Frequency VS Rating
      const updateFreqTrend = calculateUpdateFrequencyTrend(safeCategoryApps);
      drawUpdateFrequencyChart("chart-frequency-trend", updateFreqTrend);

      const sortedFreqs = [...updateFreqTrend].sort((a, b) => b.avg - a.avg);
      const bestFreq = sortedFreqs[0];
      const updateInsight = `The highest-performing cohort comprises apps updated on a **${bestFreq.label}** schedule, achieving a category-best average of **${bestFreq.avg.toFixed(2)} / 5.0**. This highlights how continuous quality assurance, agile feedback loops, and prompt functional releases maximize user sentiment in the **${category.replace(/_/g, " ")}** domain.`;
      const fiEl = document.getElementById("trend-frequency-insight");
      if (fiEl) {
        fiEl.innerHTML = updateInsight.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      }

      if (trendLoading) trendLoading.classList.add("hidden");
      if (trendContent) trendContent.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      if (trendLoading) trendLoading.classList.add("hidden");
      if (trendEmpty) trendEmpty.classList.remove("hidden");
    }
  }

  // Helper Trend Calculation Functions
  function calculateCategoryRatingTrend(categoryApps: any[]) {
    const years = [2021, 2022, 2023, 2024, 2025, 2026];
    return years.map(year => {
      let totalRating = 0;
      categoryApps.forEach(app => {
        const hash = app.appName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const trendDirection = (hash % 5 === 0) ? -1 : (hash % 5 === 1 ? 0 : 1); 
        const changeRate = 0.02 + (hash % 8) * 0.01;
        const yearsDiff = 2026 - year;
        let yearlyRating = app.rating - (trendDirection * changeRate * yearsDiff);
        yearlyRating = Math.max(1.0, Math.min(5.0, yearlyRating));
        totalRating += yearlyRating;
      });
      const avg = totalRating / categoryApps.length;
      return { year, avg: Number(avg.toFixed(2)) };
    });
  }

  function calculateInstallGrowthTrend(categoryApps: any[]) {
    const years = [2021, 2022, 2023, 2024, 2025, 2026];
    return years.map(year => {
      let totalInstalls = 0;
      categoryApps.forEach(app => {
        const hash = app.appName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const baseGrowthRate = 0.2 + (hash % 6) * 0.05;
        const yearsDiff = 2026 - year;
        const factor = Math.pow(1 / (1 + baseGrowthRate), yearsDiff);
        const yearlyInstalls = Math.round(app.installs * factor);
        totalInstalls += Math.max(1, yearlyInstalls);
      });
      return { year, installs: totalInstalls };
    });
  }

  function calculateUpdateFrequencyTrend(categoryApps: any[]) {
    const groups = {
      weekly: { sum: 0, count: 0, label: "Weekly (<14d)" },
      monthly: { sum: 0, count: 0, label: "Monthly (14-45d)" },
      quarterly: { sum: 0, count: 0, label: "Quarterly (>45d)" }
    };

    categoryApps.forEach(app => {
      const hash = app.appName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const freq = hash % 3;
      if (freq === 0) {
        groups.weekly.sum += app.rating;
        groups.weekly.count++;
      } else if (freq === 1) {
        groups.monthly.sum += app.rating;
        groups.monthly.count++;
      } else {
        groups.quarterly.sum += app.rating;
        groups.quarterly.count++;
      }
    });

    return [
      { key: "weekly", label: groups.weekly.label, avg: groups.weekly.count > 0 ? Number((groups.weekly.sum / groups.weekly.count).toFixed(2)) : 0.0 },
      { key: "monthly", label: groups.monthly.label, avg: groups.monthly.count > 0 ? Number((groups.monthly.sum / groups.monthly.count).toFixed(2)) : 0.0 },
      { key: "quarterly", label: groups.quarterly.label, avg: groups.quarterly.count > 0 ? Number((groups.quarterly.sum / groups.quarterly.count).toFixed(2)) : 0.0 }
    ];
  }

  // SVG Chart Draw Functions
  function drawLineChart(containerId: string, data: { year: number, avg: number }[]) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 500;
    const height = 200;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const ratings = data.map(d => d.avg);
    const minR = Math.max(1.0, Math.min(...ratings) - 0.15);
    const maxR = Math.min(5.0, Math.max(...ratings) + 0.15);

    const xScale = (year: number) => {
      const idx = year - 2021;
      return paddingLeft + (idx / 5) * (width - paddingLeft - paddingRight);
    };

    const yScale = (val: number) => {
      if (maxR === minR) return height / 2;
      return height - paddingBottom - ((val - minR) / (maxR - minR)) * (height - paddingTop - paddingBottom);
    };

    const points = data.map(d => `${xScale(d.year)},${yScale(d.avg)}`).join(" ");

    let svgContent = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
        <!-- Grid Lines -->
        <line x1="${paddingLeft}" y1="${yScale(minR)}" x2="${width - paddingRight}" y2="${yScale(minR)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${paddingLeft}" y1="${yScale((minR + maxR) / 2)}" x2="${width - paddingRight}" y2="${yScale((minR + maxR) / 2)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${paddingLeft}" y1="${yScale(maxR)}" x2="${width - paddingRight}" y2="${yScale(maxR)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />

        <!-- Y Axis Labels -->
        <text x="${paddingLeft - 8}" y="${yScale(minR) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${minR.toFixed(1)}</text>
        <text x="${paddingLeft - 8}" y="${yScale((minR + maxR) / 2) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${((minR + maxR) / 2).toFixed(1)}</text>
        <text x="${paddingLeft - 8}" y="${yScale(maxR) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${maxR.toFixed(1)}</text>

        <!-- Main Line -->
        <polyline points="${points}" fill="none" class="stroke-indigo-600 dark:stroke-indigo-400" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Dots and X Labels -->
    `;

    data.forEach(d => {
      const x = xScale(d.year);
      const y = yScale(d.avg);
      svgContent += `
        <circle cx="${x}" cy="${y}" r="4" class="fill-white stroke-indigo-600 dark:stroke-indigo-400" stroke-width="2" />
        <text x="${x}" y="${y - 8}" class="fill-indigo-600 dark:fill-indigo-400 text-[9px] font-black" text-anchor="middle">${d.avg.toFixed(2)}</text>
        <text x="${x}" y="${height - 12}" class="fill-slate-400 text-[9px] font-mono" text-anchor="middle">${d.year}</text>
      `;
    });

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  }

  function drawInstallGrowthChart(containerId: string, data: { year: number, installs: number }[]) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 500;
    const height = 200;
    const paddingLeft = 55;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const installs = data.map(d => d.installs);
    const minI = Math.min(...installs);
    const maxI = Math.max(...installs);

    const xScale = (year: number) => {
      const idx = year - 2021;
      return paddingLeft + (idx / 5) * (width - paddingLeft - paddingRight);
    };

    const yScale = (val: number) => {
      if (maxI === minI) return height / 2;
      return height - paddingBottom - ((val - minI) / (maxI - minI)) * (height - paddingTop - paddingBottom);
    };

    const formatInstalls = (num: number) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(0) + "K";
      return num.toString();
    };

    const points = data.map(d => `${xScale(d.year)},${yScale(d.installs)}`).join(" ");
    const areaPoints = `${xScale(2021)},${height - paddingBottom} ` + points + ` ${xScale(2026)},${height - paddingBottom}`;

    let svgContent = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="installGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${paddingLeft}" y1="${yScale(minI)}" x2="${width - paddingRight}" y2="${yScale(minI)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${paddingLeft}" y1="${yScale((minI + maxI) / 2)}" x2="${width - paddingRight}" y2="${yScale((minI + maxI) / 2)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${paddingLeft}" y1="${yScale(maxI)}" x2="${width - paddingRight}" y2="${yScale(maxI)}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />

        <!-- Y Axis Labels -->
        <text x="${paddingLeft - 8}" y="${yScale(minI) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${formatInstalls(minI)}</text>
        <text x="${paddingLeft - 8}" y="${yScale((minI + maxI) / 2) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${formatInstalls((minI + maxI) / 2)}</text>
        <text x="${paddingLeft - 8}" y="${yScale(maxI) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">${formatInstalls(maxI)}</text>

        <!-- Area fill -->
        <polygon points="${areaPoints}" fill="url(#installGrad)" />

        <!-- Main Line -->
        <polyline points="${points}" fill="none" class="stroke-emerald-500 dark:stroke-emerald-400" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Dots and X Labels -->
    `;

    data.forEach(d => {
      const x = xScale(d.year);
      const y = yScale(d.installs);
      svgContent += `
        <circle cx="${x}" cy="${y}" r="4" class="fill-white stroke-emerald-500 dark:stroke-emerald-400" stroke-width="2" />
        <text x="${x}" y="${y - 8}" class="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-black" text-anchor="middle">${formatInstalls(d.installs)}</text>
        <text x="${x}" y="${height - 12}" class="fill-slate-400 text-[9px] font-mono" text-anchor="middle">${d.year}</text>
      `;
    });

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  }

  function drawUpdateFrequencyChart(containerId: string, data: { label: string, avg: number }[]) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const width = container.clientWidth || 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const minA = 3.0;
    const maxA = 5.0;

    const colWidth = Math.min(65, (width - paddingLeft - paddingRight) / 4);
    const colSpacing = (width - paddingLeft - paddingRight - (colWidth * data.length)) / (data.length + 1);

    let svgContent = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
        <!-- Grid Lines -->
        <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" />
        <line x1="${paddingLeft}" y1="${paddingTop}" x2="${width - paddingRight}" y2="${paddingTop}" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" stroke-dasharray="2 2" />

        <!-- Y Axis Labels -->
        <text x="${paddingLeft - 8}" y="${height - paddingBottom + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">3.0</text>
        <text x="${paddingLeft - 8}" y="${((paddingTop + height - paddingBottom) / 2) + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">4.0</text>
        <text x="${paddingLeft - 8}" y="${paddingTop + 4}" class="fill-slate-400 text-[9px] font-mono" text-anchor="end">5.0</text>
    `;

    data.forEach((d, idx) => {
      const x = paddingLeft + colSpacing + idx * (colWidth + colSpacing);
      const ratingHeight = ((d.avg - minA) / (maxA - minA)) * (height - paddingTop - paddingBottom);
      const y = height - paddingBottom - ratingHeight;

      svgContent += `
        <!-- Column Bar -->
        <rect x="${x}" y="${y}" width="${colWidth}" height="${ratingHeight}" rx="6" class="fill-indigo-500/10 dark:fill-indigo-400/10 stroke-indigo-600 dark:stroke-indigo-400" stroke-width="1.5" />
        <text x="${x + colWidth / 2}" y="${y - 8}" class="fill-indigo-600 dark:fill-indigo-400 text-[9px] font-black" text-anchor="middle">${d.avg.toFixed(2)}</text>
        <text x="${x + colWidth / 2}" y="${height - 12}" class="fill-slate-400 text-[9px] font-sans font-semibold" text-anchor="middle">${d.label}</text>
      `;
    });

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  }

  async function updateAdvisorView() {
    const emptyState = document.getElementById("advisor-empty-state");
    const loadingState = document.getElementById("advisor-loading-state");
    const contentContainer = document.getElementById("advisor-content-container");

    if (!lastPredictionData) {
      if (contentContainer) contentContainer.classList.add("hidden");
      if (loadingState) loadingState.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (contentContainer) contentContainer.classList.add("hidden");
    if (loadingState) loadingState.classList.remove("hidden");

    try {
      const response = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: lastPredictionData.category,
          rating: lastPredictionData.rating,
          installs: lastPredictionData.installs,
          reviews: lastPredictionData.reviews,
          appName: lastPredictionData.appName
        })
      });

      if (!response.ok) throw new Error("Failed competitor analysis fetch");

      const data = await response.json();
      const catAvg = data.averageRating || 4.15;
      const percentileRank = data.percentileRank ?? 85;
      const topPercentile = data.topPercentile ?? 15;
      const predRating = lastPredictionData.rating;
      const appName = lastPredictionData.appName;
      const category = lastPredictionData.category;
      const confidence = lastPredictionData.confidence || 92;

      // 1. FINAL VERDICT
      // Labels: Strong Launch / Needs Optimization / High Potential / Above Avg
      let verdictLabel = "Above Avg";
      let verdictClass = "text-indigo-600 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20";
      
      if (predRating >= 4.4 && predRating >= catAvg) {
        verdictLabel = "Strong Launch";
        verdictClass = "text-emerald-600 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20";
      } else if (predRating >= catAvg) {
        verdictLabel = "Above Avg";
        verdictClass = "text-indigo-600 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20";
      } else if (predRating < catAvg && predRating >= 4.0) {
        verdictLabel = "High Potential";
        verdictClass = "text-amber-600 border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20";
      } else {
        verdictLabel = "Needs Optimization";
        verdictClass = "text-rose-600 border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20";
      }

      const verdictBadge = document.getElementById("advisor-verdict-badge");
      if (verdictBadge) {
        verdictBadge.textContent = verdictLabel;
        verdictBadge.className = `inline-flex items-center text-sm font-black px-3.5 py-1.5 rounded-full border ${verdictClass}`;
      }

      const confidenceEl = document.getElementById("advisor-confidence");
      if (confidenceEl) confidenceEl.textContent = `${confidence}%`;

      // 2. AI SUMMARY
      const diffVal = predRating - catAvg;
      const diffSign = diffVal >= 0 ? "+" : "";
      const summaryTextEl = document.getElementById("advisor-summary-text");
      
      let relativePosition = "near the category benchmark";
      if (diffVal > 0.1) relativePosition = "firmly above standard benchmarks";
      else if (diffVal < -0.1) relativePosition = "slightly trailing behind category norms";

      let summaryExplanation = `Based on predictive analysis, <strong>${appName}</strong> is positioned for a <strong>${verdictLabel}</strong> in the <strong>${category.replace(/_/g, " ")}</strong> category. With a predicted rating of <strong>${predRating.toFixed(2)}</strong>, your product sits ${relativePosition} (average: <strong>${catAvg.toFixed(2)}</strong>). The model has evaluated this configuration with a high confidence rating of <strong>${confidence}%</strong>. By leveraging the specific positive impacts of your feature mix while proactively correcting the friction areas outlined below, you can further secure a top-tier market release.`;
      
      if (summaryTextEl) summaryTextEl.innerHTML = summaryExplanation;

      // 3. MARKET POSITION
      const catAvgEl = document.getElementById("advisor-cat-avg");
      if (catAvgEl) catAvgEl.textContent = catAvg.toFixed(2);

      const ratingDiffEl = document.getElementById("advisor-rating-diff");
      if (ratingDiffEl) {
        ratingDiffEl.textContent = `${diffSign}${diffVal.toFixed(2)}`;
        ratingDiffEl.className = `text-xl font-black ${diffVal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`;
      }

      const percentileRankEl = document.getElementById("advisor-percentile-rank");
      if (percentileRankEl) {
        percentileRankEl.textContent = `Top ${topPercentile}%`;
        percentileRankEl.className = `text-xl font-black ${topPercentile <= 20 ? "text-emerald-600 dark:text-emerald-400" : topPercentile <= 50 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"}`;
      }

      const categoryBadge = document.getElementById("advisor-category-badge");
      if (categoryBadge) categoryBadge.textContent = category.replace(/_/g, " ");

      const positionExplanationEl = document.getElementById("advisor-position-explanation");
      let positionText = "";
      if (diffVal > 0.1) {
        positionText = `Your application is in an exceptionally strong position, outperforming <strong>${percentileRank}%</strong> of competitors in the <strong>${category.replace(/_/g, " ")}</strong> space. This places you in the elite <strong>Top ${topPercentile}%</strong>. Users are projected to appreciate your feature configuration, suggesting a highly reception-ready launch state.`;
      } else if (diffVal < -0.1) {
        positionText = `Your application is currently trailing <strong>${100 - percentileRank}%</strong> of category competitors, resulting in a ranking in the <strong>bottom ${100 - percentileRank}%</strong>. Immediate feature corrections in ad presentation, package file optimization, or update scheduling are highly recommended to match category baseline expectations.`;
      } else {
        positionText = `Your application is highly aligned with standard category averages, outperforming approximately <strong>${percentileRank}%</strong> of competitor options. Minor, high-leverage modifications to your release frequency or monetisation strategy can quickly elevate your predicted score into a premium Above Average position.`;
      }
      if (positionExplanationEl) positionExplanationEl.innerHTML = positionText;

      // 4. STRENGTHS & RISKS
      const shapDict = lastPredictionData.shap_values || {};
      const strengthsListEl = document.getElementById("advisor-strengths-list");
      const risksListEl = document.getElementById("advisor-risks-list");

      if (strengthsListEl) strengthsListEl.innerHTML = "";
      if (risksListEl) risksListEl.innerHTML = "";

      const shapDescriptions: Record<string, { positive: string; negative: string }> = {
        "Engagement Ratio": {
          positive: "Your high ratio of active reviews relative to total installations indicates users are highly motivated to engage and leave positive feedback.",
          negative: "A low reviews-to-installs ratio indicates users find the app less engaging or lack easy prompting triggers to rate it."
        },
        "Type & Pricing": {
          positive: "Your pricing configuration aligns perfectly with consumer expectations for this category, minimizing download friction.",
          negative: "The current pricing model may introduce friction compared to free or cheaper competitors in this specific category."
        },
        "Package Size": {
          positive: "The optimized, compact package size ensures rapid downloads, low storage overhead, and fewer uninstalls on budget devices.",
          negative: "The heavy file size footprint can lead to installation drop-offs, slow downloads, and device storage pressure."
        },
        "Ad Presence": {
          positive: "Operating without intrusive advertisements provides a seamless, high-quality user experience that directly raises user sentiment.",
          negative: "Integrating ad modules can disrupt the user flow, leading to negative feedback regarding usability and polish."
        },
        "Update Recency": {
          positive: "A fresh update history signals active maintenance, rapid bug resolution, and strong developer commitment to the product.",
          negative: "A delayed update cycle suggests potential compatibility issues, outstanding bugs, and stagnation to users."
        },
        "Category Fit": {
          positive: "Your app specifications naturally align with high-performing, organic-demand niches within this specific category.",
          negative: "Slight market category mismatch, exposing your application to standard genre-level audience friction."
        },
        "Content Suitability": {
          positive: "Broad content suitability ensures accessibility to the widest demographic, increasing mass-market satisfaction.",
          negative: "Restrictive content rating limits absolute audience size and exposes your app to specialized criticism."
        }
      };

      let positiveCount = 0;
      let negativeCount = 0;

      Object.entries(shapDict).forEach(([feature, val]) => {
        const descObj = shapDescriptions[feature] || {
          positive: `Your configuration for ${feature} has a beneficial effect on user sentiment.`,
          negative: `Your configuration for ${feature} is presenting minor friction to user rating performance.`
        };

        if (val > 0) {
          positiveCount++;
          const item = document.createElement("div");
          item.className = "p-3 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl space-y-1";
          item.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">${feature}</span>
              <span class="text-[10px] font-mono font-black text-emerald-600 bg-emerald-100/40 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">+${val.toFixed(2)}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${descObj.positive}</p>
          `;
          if (strengthsListEl) strengthsListEl.appendChild(item);
        } else if (val < 0) {
          negativeCount++;
          const item = document.createElement("div");
          item.className = "p-3 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-xl space-y-1";
          item.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-700 dark:text-rose-400">${feature}</span>
              <span class="text-[10px] font-mono font-black text-rose-600 bg-rose-100/40 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">${val.toFixed(2)}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${descObj.negative}</p>
          `;
          if (risksListEl) risksListEl.appendChild(item);
        }
      });

      if (positiveCount === 0 && strengthsListEl) {
        strengthsListEl.innerHTML = `
          <p class="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No active positive contributors identified. Try adjusting app attributes.</p>
        `;
      }
      if (negativeCount === 0 && risksListEl) {
        risksListEl.innerHTML = `
          <p class="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No active negative contributors identified. Excellent feature configurations.</p>
        `;
      }

      // 5. ACTIONABLE IMPROVEMENTS
      const improvementsListEl = document.getElementById("advisor-improvements-list");
      if (improvementsListEl) improvementsListEl.innerHTML = "";

      const improvements: string[] = [];

      // Check ad presence and impact
      if (lastPredictionData.ads === "Yes" && shapDict["Ad Presence"] < 0) {
        improvements.push(`
          <div class="flex items-start space-x-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">01</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Ad Presence Optimization</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ads are currently lowering your score by <strong>${Math.abs(shapDict["Ad Presence"]).toFixed(2)}</strong> points. Consider introducing a premium ad-free subscription or reducing interstitial frequency. The category average rating is <strong>${catAvg.toFixed(2)}</strong>, and ad-free competitors in this category show a 0.20 rating advantage.</p>
            </div>
          </div>
        `);
      }

      // Check update recency
      const updatesDays = lastPredictionData.updates || 30;
      if (updatesDays > 45 && shapDict["Update Recency"] < 0) {
        improvements.push(`
          <div class="flex items-start space-x-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">${improvements.length + 1}</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Accelerate Release Schedule</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Your update frequency of <strong>${updatesDays} days</strong> is dragging your rating down by <strong>${Math.abs(shapDict["Update Recency"]).toFixed(2)}</strong> points. Release updates every 14 days or less to address bug fixes. Competitors in <strong>${category.replace(/_/g, " ")}</strong> with bi-weekly updates enjoy a stronger score retention.</p>
            </div>
          </div>
        `);
      }

      // Check package size
      const appSize = lastPredictionData.size || 25;
      if (appSize > 50 && shapDict["Package Size"] < 0) {
        improvements.push(`
          <div class="flex items-start space-x-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">${improvements.length + 1}</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Reduce Package Overhead</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">At <strong>${appSize}MB</strong>, your binary footprint reduces your rating by <strong>${Math.abs(shapDict["Package Size"]).toFixed(2)}</strong> points. Compress visual assets, employ code-splitting, or utilize dynamic resources delivery to bring the size under 20MB. Smaller sizes see a significant increase in day-1 retention and rating metrics in this category.</p>
            </div>
          </div>
        `);
      }

      // Check engagement
      const appRatio = lastPredictionData.installs > 0 ? lastPredictionData.reviews / lastPredictionData.installs : 0;
      if (appRatio < 0.02 && shapDict["Engagement Ratio"] < 0) {
        improvements.push(`
          <div class="flex items-start space-x-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">${improvements.length + 1}</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Boost Review Capture</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Your reviews-to-installs ratio of <strong>${(appRatio * 100).toFixed(2)}%</strong> is penalizing your predicted rating by <strong>${Math.abs(shapDict["Engagement Ratio"]).toFixed(2)}</strong> points. Implement targeted in-app review prompts (e.g., using standard popups) exactly when the user achieves a positive action. This increases high-quality review volume and elevates average ratings.</p>
            </div>
          </div>
        `);
      }

      // Add a category specific improvement if the list is empty or short
      if (improvements.length < 2) {
        improvements.push(`
          <div class="flex items-start space-x-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">${improvements.length + 1}</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Category Specific Polish</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Since your overall parameters are solid, focus on localized premium polish. Continuous optimization of user onboarding flows for <strong>${category.replace(/_/g, " ")}</strong> apps can yield up to a <strong>+0.15</strong> rating uplift, cementing your above-average standing.</p>
            </div>
          </div>
        `);
      }

      if (improvementsListEl) {
        improvementsListEl.innerHTML = improvements.join("");
      }

      if (loadingState) loadingState.classList.add("hidden");
      if (contentContainer) contentContainer.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      if (loadingState) loadingState.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
    }
  }

  async function updateEdaInsightsView() {
    const loadingState = document.getElementById("eda-loading-state");
    const contentContainer = document.getElementById("eda-content");

    if (loadingState) loadingState.classList.remove("hidden");
    if (contentContainer) contentContainer.classList.add("hidden");

    try {
      const response = await fetch("/api/eda-insights");
      if (!response.ok) throw new Error("Failed to fetch EDA insights");
      const data = await response.json();

      // 1. Dataset Overview
      const totalAppsEl = document.getElementById("eda-total-apps");
      const totalCategoriesEl = document.getElementById("eda-total-categories");
      const avgRatingEl = document.getElementById("eda-avg-rating");
      const avgInstallsEl = document.getElementById("eda-avg-installs");
      const avgReviewsEl = document.getElementById("eda-avg-reviews");
      const datasetDescriptionEl = document.getElementById("eda-dataset-description");

      if (totalAppsEl) totalAppsEl.textContent = data.overview.totalApps.toString();
      if (totalCategoriesEl) totalCategoriesEl.textContent = data.overview.totalCategories.toString();
      if (avgRatingEl) avgRatingEl.textContent = data.overview.avgRating.toFixed(2);
      if (avgInstallsEl) avgInstallsEl.textContent = data.overview.avgInstalls.toLocaleString();
      if (avgReviewsEl) avgReviewsEl.textContent = data.overview.avgReviews.toLocaleString();
      if (datasetDescriptionEl) datasetDescriptionEl.textContent = data.overview.description;

      // 8. Key Takeaways
      const takeawaysEl = document.getElementById("eda-takeaways");
      if (takeawaysEl) {
        takeawaysEl.innerHTML = data.takeaways.map((takeaway: string, idx: number) => `
          <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start space-x-3">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 text-xs">${idx + 1}.</span>
            <span>${takeaway}</span>
          </div>
        `).join("");
      }

      // 2. Rating Insights
      const ratingBinsEl = document.getElementById("eda-rating-bins");
      if (ratingBinsEl) {
        const total = data.overview.totalApps;
        ratingBinsEl.innerHTML = Object.entries(data.ratingInsights.bins).map(([bin, cnt]: [string, any]) => {
          const pct = ((cnt / total) * 100);
          return `
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>${bin}</span>
                <span>${cnt} (${pct.toFixed(1)}%)</span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }).join("");
      }

      const pctAboveFourEl = document.getElementById("eda-pct-above-four");
      const pctBelowThreeFiveEl = document.getElementById("eda-pct-below-three-five");
      const ratingExplanationEl = document.getElementById("eda-rating-explanation");

      if (pctAboveFourEl) pctAboveFourEl.textContent = `${data.ratingInsights.percentAboveFour}%`;
      if (pctBelowThreeFiveEl) pctBelowThreeFiveEl.textContent = `${data.ratingInsights.percentBelowThreePointFive}%`;
      if (ratingExplanationEl) ratingExplanationEl.innerHTML = data.ratingInsights.explanation;

      // 3. Category Performance
      const topCategoriesEl = document.getElementById("eda-top-categories");
      if (topCategoriesEl) {
        topCategoriesEl.innerHTML = data.categoryPerformance.topCategories.map((cat: any, idx: number) => `
          <div class="flex justify-between items-center py-2 text-xs border-b border-slate-50 dark:border-slate-850 last:border-0">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold text-slate-400 w-4">${idx + 1}</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 capitalize">${cat.category.toLowerCase().replace(/_/g, " ")}</span>
            </div>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">${cat.avgRating.toFixed(2)}</span>
          </div>
        `).join("");
      }

      const bottomCategoriesEl = document.getElementById("eda-bottom-categories");
      if (bottomCategoriesEl) {
        bottomCategoriesEl.innerHTML = data.categoryPerformance.bottomCategories.map((cat: any, idx: number) => `
          <div class="flex justify-between items-center py-2 text-xs border-b border-slate-50 dark:border-slate-850 last:border-0">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold text-slate-400 w-4">${idx + 1}</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 capitalize">${cat.category.toLowerCase().replace(/_/g, " ")}</span>
            </div>
            <span class="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">${cat.avgRating.toFixed(2)}</span>
          </div>
        `).join("");
      }

      const categoryExplanationEl = document.getElementById("eda-category-explanation");
      if (categoryExplanationEl) categoryExplanationEl.innerHTML = data.categoryPerformance.explanation;

      // 4. User Engagement
      const highInstallsRatingEl = document.getElementById("eda-high-installs-rating");
      const lowInstallsRatingEl = document.getElementById("eda-low-installs-rating");
      const highReviewsRatingEl = document.getElementById("eda-high-reviews-rating");
      const lowReviewsRatingEl = document.getElementById("eda-low-reviews-rating");
      const engagementExplanationEl = document.getElementById("eda-engagement-explanation");

      if (highInstallsRatingEl) highInstallsRatingEl.textContent = data.userEngagement.highInstallsAvgRating.toFixed(2);
      if (lowInstallsRatingEl) lowInstallsRatingEl.textContent = data.userEngagement.lowInstallsAvgRating.toFixed(2);
      if (highReviewsRatingEl) highReviewsRatingEl.textContent = data.userEngagement.highReviewsAvgRating.toFixed(2);
      if (lowReviewsRatingEl) lowReviewsRatingEl.textContent = data.userEngagement.lowReviewsAvgRating.toFixed(2);
      if (engagementExplanationEl) engagementExplanationEl.innerHTML = data.userEngagement.explanation;

      // 5. Update Insights
      const freqUpdatesRatingEl = document.getElementById("eda-freq-updates-rating");
      const rareUpdatesRatingEl = document.getElementById("eda-rare-updates-rating");
      const updateRatingCorrEl = document.getElementById("eda-update-rating-corr");
      const updateExplanationEl = document.getElementById("eda-update-explanation");

      if (freqUpdatesRatingEl) freqUpdatesRatingEl.textContent = data.updateInsights.freqAvgRating.toFixed(2);
      if (rareUpdatesRatingEl) rareUpdatesRatingEl.textContent = data.updateInsights.rareAvgRating.toFixed(2);
      if (updateRatingCorrEl) updateRatingCorrEl.textContent = (data.updateInsights.updateRatingCorr >= 0 ? '+' : '') + data.updateInsights.updateRatingCorr.toFixed(2);
      if (updateExplanationEl) updateExplanationEl.innerHTML = data.updateInsights.explanation;

      // 6. Ads & Pricing
      const noAdsRatingEl = document.getElementById("eda-no-ads-rating");
      const adsRatingEl = document.getElementById("eda-ads-rating");
      const paidRatingEl = document.getElementById("eda-paid-rating");
      const freeRatingEl = document.getElementById("eda-free-rating");
      const monetizationExplanationEl = document.getElementById("eda-monetization-explanation");

      if (noAdsRatingEl) noAdsRatingEl.textContent = data.adsAndPricing.noAdsAvgRating.toFixed(2);
      if (adsRatingEl) adsRatingEl.textContent = data.adsAndPricing.adsAvgRating.toFixed(2);
      if (paidRatingEl) paidRatingEl.textContent = data.adsAndPricing.paidAvgRating.toFixed(2);
      if (freeRatingEl) freeRatingEl.textContent = data.adsAndPricing.freeAvgRating.toFixed(2);
      if (monetizationExplanationEl) monetizationExplanationEl.innerHTML = data.adsAndPricing.explanation;

      // 7. Feature Relationships (Correlations)
      const correlationListEl = document.getElementById("eda-correlation-list");
      if (correlationListEl) {
        correlationListEl.innerHTML = data.correlations.map((feat: any) => {
          const coeff = feat.coefficient;
          return `
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-300">${feat.feature}</span>
                <span class="font-bold px-1.5 py-0.5 rounded text-[10px] ${coeff >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}">${coeff >= 0 ? '+' : ''}${coeff.toFixed(2)}</span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div class="w-1/2 flex justify-end bg-slate-100 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-700">
                  ${coeff < 0 ? `<div class="h-full bg-rose-400 rounded-l" style="width: ${Math.abs(coeff) * 100}%"></div>` : ''}
                </div>
                <div class="w-1/2 flex justify-start bg-slate-100 dark:bg-slate-800/40">
                  ${coeff >= 0 ? `<div class="h-full bg-emerald-400 rounded-r" style="width: ${coeff * 100}%"></div>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join("");
      }

      if (loadingState) loadingState.classList.add("hidden");
      if (contentContainer) contentContainer.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      if (loadingState) loadingState.classList.add("hidden");
    }
  }

  // Bind Recalculate Button click
  const edaRefreshBtn = document.getElementById("eda-refresh-btn");
  if (edaRefreshBtn) {
    edaRefreshBtn.addEventListener("click", updateEdaInsightsView);
  }

  // Visual EDA Dashboard Implementation (Section 1-5)
  async function updateEdaDashboardView() {
    const loadingState = document.getElementById("eda-dash-loading-state");
    const contentContainer = document.getElementById("eda-dash-content");

    if (loadingState) loadingState.classList.remove("hidden");
    if (contentContainer) contentContainer.classList.add("hidden");

    try {
      const response = await fetch("/api/eda-dashboard-data");
      if (!response.ok) throw new Error("Failed to fetch EDA dashboard data");
      const data = await response.json();

      // Section 1: KPIs
      const dashKpiApps = document.getElementById("dash-kpi-apps");
      const dashKpiCategories = document.getElementById("dash-kpi-categories");
      const dashKpiRating = document.getElementById("dash-kpi-rating");
      const dashKpiReviews = document.getElementById("dash-kpi-reviews");
      const dashKpiInstalls = document.getElementById("dash-kpi-installs");

      if (dashKpiApps) dashKpiApps.textContent = data.kpis.totalApps.toLocaleString();
      if (dashKpiCategories) dashKpiCategories.textContent = data.kpis.categories.toLocaleString();
      if (dashKpiRating) dashKpiRating.textContent = data.kpis.avgRating.toFixed(2);
      if (dashKpiReviews) dashKpiReviews.textContent = data.kpis.totalReviews.toLocaleString();
      if (dashKpiInstalls) dashKpiInstalls.textContent = data.kpis.totalInstalls.toLocaleString();

      // Section 2: Rating Distribution Histogram
      const histContainer = document.getElementById("dash-hist-container");
      if (histContainer) {
        histContainer.innerHTML = "";
        
        const rect = histContainer.getBoundingClientRect();
        const width = rect.width || 450;
        const height = rect.height || 180;
        
        const padding = { top: 25, right: 15, bottom: 25, left: 35 };
        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;
        
        const histData = data.ratingDistribution;
        const maxCount = Math.max(...histData.map((d: any) => d.count), 1);
        
        const getX = (index: number) => padding.left + (index / histData.length) * innerWidth;
        const getY = (count: number) => height - padding.bottom - (count / maxCount) * innerHeight;
        
        let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="overflow-visible font-sans text-slate-700 dark:text-slate-300">`;
        
        // Grids and Y-Axis Ticks
        const tickCount = 4;
        for (let i = 0; i <= tickCount; i++) {
          const val = Math.round((i / tickCount) * maxCount);
          const ty = getY(val);
          svgContent += `
            <line x1="${padding.left}" y1="${ty}" x2="${width - padding.right}" y2="${ty}" stroke="currentColor" class="text-slate-100 dark:text-slate-800/80" stroke-width="1" stroke-dasharray="2 2" />
            <text x="${padding.left - 6}" y="${ty + 3}" text-anchor="end" class="text-[9px] font-bold fill-slate-400 dark:fill-slate-500">${val}</text>
          `;
        }
        
        // X-Axis Baseline
        svgContent += `
          <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1.5" />
        `;
        
        // Render bars
        const barWidth = (innerWidth / histData.length) * 0.85;
        histData.forEach((d: any, idx: number) => {
          const bx = getX(idx) + (innerWidth / histData.length - barWidth) / 2;
          const by = getY(d.count);
          const barHeight = height - padding.bottom - by;
          
          svgContent += `
            <rect x="${bx}" y="${by}" width="${barWidth}" height="${Math.max(barHeight, 2)}" rx="3"
              class="fill-indigo-500 dark:fill-indigo-400 hover:fill-indigo-600 dark:hover:fill-indigo-300 transition-colors duration-150 cursor-pointer" />
            <text x="${bx + barWidth / 2}" y="${height - padding.bottom + 14}" text-anchor="middle" class="text-[8px] font-bold fill-slate-400 dark:fill-slate-500">${d.label}</text>
          `;
        });
        
        // Mean marker
        const meanRating = data.kpis.avgRating;
        const meanFraction = (meanRating - 1.0) / (5.0 - 1.0);
        const meanX = padding.left + meanFraction * innerWidth;
        
        svgContent += `
          <!-- Mean Dotted Line -->
          <line x1="${meanX}" y1="${padding.top}" x2="${meanX}" y2="${height - padding.bottom}" stroke="currentColor" class="text-indigo-600 dark:text-indigo-400" stroke-width="2" stroke-dasharray="3 3" />
          
          <!-- Mean Badge -->
          <rect x="${meanX - 25}" y="${padding.top - 18}" width="50" height="15" rx="4" class="fill-indigo-600 dark:fill-indigo-500" />
          <text x="${meanX}" y="${padding.top - 8}" text-anchor="middle" class="text-[8px] font-extrabold fill-white">μ = ${meanRating.toFixed(2)}</text>
        `;
        
        svgContent += `</svg>`;
        histContainer.innerHTML = svgContent;
      }

      // Section 3: Category Analysis Horizontal Bar
      const barContainer = document.getElementById("dash-bar-container");
      if (barContainer) {
        barContainer.innerHTML = data.categoryAnalysis.map((cat: any, idx: number) => {
          const pct = (cat.avgRating / 5.0) * 100;
          return `
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-700 dark:text-slate-300 capitalize text-[11px]">${idx + 1}. ${cat.category.toLowerCase()}</span>
                <span class="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">${cat.avgRating.toFixed(2)}</span>
              </div>
              <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }).join("");
      }

      // Section 4: Relationships Scatter plots
      renderScatter("dash-scatter-reviews", data.scatterPoints, "reviews", "Reviews");
      renderScatter("dash-scatter-installs", data.scatterPoints, "installs", "Installs");

      // Bind Scatter dots tooltips
      const tooltip = document.getElementById("scatter-tooltip");
      if (tooltip) {
        document.querySelectorAll(".scatter-dot").forEach(dot => {
          dot.addEventListener("mouseenter", (e: any) => {
            const d = e.target;
            const name = d.getAttribute("data-name");
            const cat = d.getAttribute("data-category");
            const rating = d.getAttribute("data-rating");
            const yval = d.getAttribute("data-yval");
            const ylabel = d.getAttribute("data-ylabel");
            
            tooltip.innerHTML = `
              <span class="text-indigo-400 dark:text-indigo-300 font-bold">${name}</span>
              <span class="text-[9px] text-slate-400">${cat}</span>
              <div class="border-t border-slate-700/50 mt-1 pt-1 flex flex-col space-y-0.5 text-slate-300">
                <span>Rating: <strong class="text-white">${rating}</strong></span>
                <span>${ylabel}: <strong class="text-white">${yval}</strong></span>
              </div>
            `;
            
            tooltip.classList.remove("hidden");
            
            const rect = d.getBoundingClientRect();
            const parentRect = document.body.getBoundingClientRect();
            tooltip.style.left = `${rect.left - parentRect.left + 12}px`;
            tooltip.style.top = `${rect.top - parentRect.top - 12}px`;
          });
          
          dot.addEventListener("mouseleave", () => {
            tooltip.classList.add("hidden");
          });
        });
      }

      // Section 5: Correlation Heatmap
      const heatmapContainer = document.getElementById("dash-heatmap-container");
      if (heatmapContainer) {
        heatmapContainer.innerHTML = "";
        
        const labels = data.labels;
        const matrix = data.correlationMatrix;
        
        let html = `
          <div class="grid grid-cols-7 gap-1 md:gap-1.5 text-center font-sans">
            <!-- Top Header corner cell -->
            <div></div>
            <!-- Top headers -->
            ${labels.map((l: string) => `
              <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight py-1 select-none flex items-center justify-center break-all text-center leading-tight">${l}</div>
            `).join("")}
        `;
        
        labels.forEach((rowLabel: string) => {
          html += `
            <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight pr-1 flex items-center justify-end select-none break-all text-right leading-tight">${rowLabel}</div>
          `;
          
          labels.forEach((colLabel: string) => {
            const cell = matrix.find((m: any) => m.x === colLabel && m.y === rowLabel);
            const val = cell ? cell.value : 0;
            
            let bgClass = "";
            let textClass = "";
            const absVal = Math.abs(val);
            
            if (val === 1.0) {
              bgClass = "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700";
              textClass = "text-slate-700 dark:text-slate-300 font-extrabold";
            } else if (val > 0) {
              if (absVal > 0.6) {
                bgClass = "bg-emerald-500 dark:bg-emerald-600 border-emerald-600";
                textClass = "text-white font-bold";
              } else if (absVal > 0.4) {
                bgClass = "bg-emerald-400 dark:bg-emerald-500 border-emerald-500";
                textClass = "text-white font-semibold";
              } else if (absVal > 0.2) {
                bgClass = "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
                textClass = "text-emerald-700 dark:text-emerald-400 font-medium";
              } else {
                bgClass = "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/20";
                textClass = "text-emerald-600 dark:text-emerald-500";
              }
            } else {
              if (absVal > 0.6) {
                bgClass = "bg-rose-500 dark:bg-rose-600 border-rose-600";
                textClass = "text-white font-bold";
              } else if (absVal > 0.4) {
                bgClass = "bg-rose-400 dark:bg-rose-500 border-rose-500";
                textClass = "text-white font-semibold";
              } else if (absVal > 0.2) {
                bgClass = "bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900";
                textClass = "text-rose-700 dark:text-rose-400 font-medium";
              } else {
                bgClass = "bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-950/20";
                textClass = "text-rose-600 dark:text-rose-500";
              }
            }
            
            html += `
              <div class="aspect-square flex flex-col items-center justify-center border rounded-lg text-[9px] md:text-xs transition-all hover:scale-105 shadow-2xs select-none ${bgClass} ${textClass}">
                <span>${val >= 0 ? '+' : ''}${val.toFixed(2)}</span>
              </div>
            `;
          });
        });
        
        html += `</div>`;
        heatmapContainer.innerHTML = html;
      }

      if (loadingState) loadingState.classList.add("hidden");
      if (contentContainer) contentContainer.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      if (loadingState) loadingState.classList.add("hidden");
    }
  }

  function renderScatter(containerId: string, points: any[], yKey: 'reviews' | 'installs', yLabel: string) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    const rect = container.getBoundingClientRect();
    const width = rect.width || 450;
    const height = rect.height || 220;
    
    const padding = { top: 15, right: 20, bottom: 35, left: 55 };
    
    const minX = 1.0;
    const maxX = 5.0;
    
    const maxY = Math.max(...points.map((p: any) => p[yKey]), 1);
    const minY = 0;
    
    const getX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * (width - padding.left - padding.right);
    const getY = (y: number) => height - padding.bottom - ((y - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);
    
    let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="overflow-visible font-sans text-slate-700 dark:text-slate-300">`;
    
    // Grid tick lines
    for (let r = 1; r <= 5; r++) {
      const tx = getX(r);
      svgContent += `
        <line x1="${tx}" y1="${padding.top}" x2="${tx}" y2="${height - padding.bottom}" stroke="currentColor" class="text-slate-100 dark:text-slate-800/80" stroke-width="1" stroke-dasharray="2 2" />
        <text x="${tx}" y="${height - padding.bottom + 16}" text-anchor="middle" class="text-[9px] font-bold fill-slate-400 dark:fill-slate-500">${r.toFixed(1)}</text>
      `;
    }
    
    for (let i = 0; i <= 3; i++) {
      const val = minY + (i / 3) * (maxY - minY);
      const ty = getY(val);
      let formattedVal = "";
      if (val >= 1e9) formattedVal = (val / 1e9).toFixed(0) + "B";
      else if (val >= 1e6) formattedVal = (val / 1e6).toFixed(0) + "M";
      else if (val >= 1e3) formattedVal = (val / 1e3).toFixed(0) + "K";
      else formattedVal = val.toFixed(0);
      
      svgContent += `
        <line x1="${padding.left}" y1="${ty}" x2="${width - padding.right}" stroke="currentColor" class="text-slate-100 dark:text-slate-800/80" stroke-width="1" stroke-dasharray="2 2" />
        <text x="${padding.left - 8}" y="${ty + 3}" text-anchor="end" class="text-[8px] font-bold fill-slate-400 dark:fill-slate-500">${formattedVal}</text>
      `;
    }
    
    // Axes border lines
    svgContent += `
      <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1.5" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1.5" />
    `;
    
    svgContent += `
      <text x="${padding.left + 5}" y="${padding.top + 8}" class="text-[8px] font-bold tracking-wider uppercase fill-indigo-500 dark:fill-indigo-400">${yLabel}</text>
      <text x="${width - padding.right}" y="${height - padding.bottom - 4}" text-anchor="end" class="text-[8px] font-bold tracking-wider uppercase fill-slate-400">Rating</text>
    `;
    
    points.forEach((p: any) => {
      const cx = getX(p.rating);
      const cy = getY(p[yKey]);
      
      svgContent += `
        <circle cx="${cx}" cy="${cy}" r="4.5" 
          class="fill-indigo-500/70 dark:fill-indigo-400/70 hover:fill-indigo-600 dark:hover:fill-indigo-300 hover:scale-130 cursor-pointer transition-all duration-100 scatter-dot" 
          data-name="${p.name.replace(/"/g, '&quot;')}" 
          data-category="${p.category}" 
          data-rating="${p.rating}" 
          data-yval="${p[yKey].toLocaleString()}" 
          data-ylabel="${yLabel}" />
      `;
    });
    
    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  }

  // Bind EDA Dashboard Refresh Button
  const edaDashRefreshBtn = document.getElementById("eda-dash-refresh-btn");
  if (edaDashRefreshBtn) {
    edaDashRefreshBtn.addEventListener("click", updateEdaDashboardView);
  }

  // ==========================================
  // PHASE 11: DIAGNOSTIC HISTORY WORKSPACE
  // ==========================================
  let loadedHistoryRecords: any[] = [];
  let selectedHistoryIds: string[] = [];

  // Elements
  const historyCompareBtn = document.getElementById("history-compare-btn") as HTMLButtonElement;
  const historyRefreshBtn = document.getElementById("history-refresh-btn");
  const historyFilterSearch = document.getElementById("history-filter-search") as HTMLInputElement;
  const historyFilterCategory = document.getElementById("history-filter-category") as HTMLSelectElement;
  const historyFilterMode = document.getElementById("history-filter-mode") as HTMLSelectElement;
  const historySort = document.getElementById("history-sort") as HTMLSelectElement;
  const historyClearFilters = document.getElementById("history-clear-filters");

  const historyLoadingState = document.getElementById("history-loading-state");
  const historyEmptyState = document.getElementById("history-empty-state");
  const historyGridContainer = document.getElementById("history-grid-container");

  // Modals
  const historyDetailModal = document.getElementById("history-detail-modal");
  const historyDetailClose = document.getElementById("history-detail-close");
  const historyCompareModal = document.getElementById("history-compare-modal");
  const historyCompareClose = document.getElementById("history-compare-close");

  async function updateHistoryView() {
    if (!historyLoadingState || !historyEmptyState || !historyGridContainer) return;
    
    const historyLoggedOutState = document.getElementById("history-logged-out-state");
    if (!isLoggedIn) {
      if (historyLoggedOutState) historyLoggedOutState.classList.remove("hidden");
      historyLoadingState.classList.add("hidden");
      historyEmptyState.classList.add("hidden");
      historyGridContainer.classList.add("hidden");
      return;
    } else {
      if (historyLoggedOutState) historyLoggedOutState.classList.add("hidden");
    }

    historyLoadingState.classList.remove("hidden");
    historyEmptyState.classList.add("hidden");
    historyGridContainer.classList.add("hidden");
    selectedHistoryIds = [];
    updateCompareButtonState();

    try {
      const response = await fetch(`/api/history?email=${encodeURIComponent(isLoggedIn ? loggedInUserEmail : "ponesakki0308@gmail.com")}`);
      if (!response.ok) throw new Error("Failed to load history list");
      loadedHistoryRecords = await response.json();
      renderHistoryItems();
    } catch (e) {
      console.error(e);
      loadedHistoryRecords = [];
      renderHistoryItems();
    } finally {
      historyLoadingState.classList.add("hidden");
    }
  }

  function updateCompareButtonState() {
    if (!historyCompareBtn) return;
    historyCompareBtn.textContent = `Compare Selected (${selectedHistoryIds.length}/2)`;
    historyCompareBtn.disabled = selectedHistoryIds.length !== 2;
  }

  function renderHistoryItems() {
    if (!historyGridContainer || !historyEmptyState) return;

    const query = historyFilterSearch ? historyFilterSearch.value.toLowerCase().trim() : "";
    const category = historyFilterCategory ? historyFilterCategory.value : "ALL";
    const mode = historyFilterMode ? historyFilterMode.value : "ALL";
    const sortBy = historySort ? historySort.value : "LATEST";

    // Filter
    let filtered = loadedHistoryRecords.filter((item: any) => {
      const matchSearch = item.appName ? item.appName.toLowerCase().includes(query) : false;
      const matchCategory = category === "ALL" || item.category === category;
      const matchMode = mode === "ALL" || item.inputMode === mode;
      return matchSearch && matchCategory && matchMode;
    });

    // Sort
    if (sortBy === "LATEST") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "HIGHEST_RATING") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "HIGHEST_CONFIDENCE") {
      filtered.sort((a, b) => b.confidence - a.confidence);
    }

    if (filtered.length === 0) {
      historyGridContainer.classList.add("hidden");
      historyEmptyState.classList.remove("hidden");
      return;
    }

    historyEmptyState.classList.add("hidden");
    historyGridContainer.classList.remove("hidden");
    historyGridContainer.innerHTML = "";

    filtered.forEach((item: any) => {
      const isChecked = selectedHistoryIds.includes(item.id);
      
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative hover:shadow-md transition-all flex flex-col justify-between space-y-4";
      
      // Format Date
      const dateStr = item.date ? new Date(item.date).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) : "Unknown Date";

      const modeBadgeClass = item.inputMode === "URL" 
        ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30"
        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";

      card.innerHTML = `
        <div class="space-y-2">
          <!-- Card Header & Checkbox -->
          <div class="flex items-start justify-between">
            <div class="flex flex-wrap gap-1.5 items-center">
              <span class="px-2 py-0.5 text-[8px] font-bold rounded-md ${modeBadgeClass}">${item.inputMode || "Manual"}</span>
              <span class="px-2 py-0.5 text-[8px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">${(item.category || "").replace(/_/g, " ")}</span>
            </div>
            <input 
              type="checkbox" 
              data-id="${item.id}"
              class="history-card-checkbox rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              ${isChecked ? "checked" : ""}
            />
          </div>

          <!-- App details -->
          <div>
            <h4 class="text-sm font-black text-slate-900 dark:text-white truncate" title="${item.appName}">${item.appName}</h4>
            <span class="text-[9px] font-semibold text-slate-400 block">${dateStr}</span>
          </div>

          <!-- Forecast Output Row -->
          <div class="grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50">
            <div>
              <span class="text-[8px] font-bold text-slate-400 block uppercase">Forecast rating</span>
              <span class="text-base font-black text-slate-800 dark:text-white">${Number(item.rating).toFixed(2)}</span>
            </div>
            <div>
              <span class="text-[8px] font-bold text-slate-400 block uppercase">Confidence</span>
              <span class="text-base font-black text-indigo-600 dark:text-indigo-400">${item.confidence}%</span>
            </div>
          </div>
        </div>

        <!-- Action row -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            class="history-view-details-btn text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            data-id="${item.id}"
          >
            <span>View Details</span>
          </button>
          
          <button 
            type="button"
            class="history-delete-btn text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center space-x-1"
            data-id="${item.id}"
          >
            <span>Delete</span>
          </button>
        </div>
      `;

      // Checkbox listener
      const checkbox = card.querySelector(".history-card-checkbox") as HTMLInputElement;
      if (checkbox) {
        checkbox.addEventListener("change", () => {
          const id = checkbox.getAttribute("data-id")!;
          if (checkbox.checked) {
            if (selectedHistoryIds.length >= 2) {
              checkbox.checked = false;
              alert("You can select exactly 2 records to execute Side-by-Side Application Audit comparison.");
              return;
            }
            if (!selectedHistoryIds.includes(id)) {
              selectedHistoryIds.push(id);
            }
          } else {
            selectedHistoryIds = selectedHistoryIds.filter((item) => item !== id);
          }
          updateCompareButtonState();
        });
      }

      // View details listener
      const viewDetailsBtn = card.querySelector(".history-view-details-btn");
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener("click", () => {
          const id = viewDetailsBtn.getAttribute("data-id")!;
          showHistoryDetails(id);
        });
      }

      // Delete listener
      const deleteBtn = card.querySelector(".history-delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          const id = deleteBtn.getAttribute("data-id")!;
          if (confirm("Are you sure you want to permanently delete this diagnostic forecast record?")) {
            try {
              const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
              if (res.ok) {
                loadedHistoryRecords = loadedHistoryRecords.filter((h) => h.id !== id);
                selectedHistoryIds = selectedHistoryIds.filter((item) => item !== id);
                updateCompareButtonState();
                renderHistoryItems();
              }
            } catch (err) {
              console.error(err);
            }
          }
        });
      }

      historyGridContainer.appendChild(card);
    });
  }

  function showHistoryDetails(id: string) {
    const record = loadedHistoryRecords.find((r) => r.id === id);
    if (!record || !historyDetailModal) return;

    // Set Header
    const appNameEl = document.getElementById("detail-app-name");
    const categoryBadge = document.getElementById("detail-category-badge");
    const inputModeBadge = document.getElementById("detail-input-mode-badge");
    const dateEl = document.getElementById("detail-date");

    if (appNameEl) appNameEl.textContent = record.appName;
    if (categoryBadge) categoryBadge.textContent = (record.category || "").replace(/_/g, " ");
    
    if (inputModeBadge) {
      inputModeBadge.textContent = `${record.inputMode || "Manual"} MODE`;
      if (record.inputMode === "URL") {
        inputModeBadge.className = "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400";
      } else {
        inputModeBadge.className = "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400";
      }
    }

    if (dateEl) {
      dateEl.textContent = record.date ? `EXECUTED ON ${new Date(record.date).toLocaleString()}` : "";
    }

    // Set Outputs
    const ratingEl = document.getElementById("detail-rating");
    const confidenceEl = document.getElementById("detail-confidence");
    const catAvgEl = document.getElementById("detail-category-avg");
    const percentileEl = document.getElementById("detail-percentile");

    if (ratingEl) ratingEl.textContent = Number(record.rating).toFixed(2);
    if (confidenceEl) confidenceEl.textContent = `${record.confidence}%`;
    if (catAvgEl) catAvgEl.textContent = `${Number(record.categoryAverage || 4.2).toFixed(2)} Rating`;
    if (percentileEl) percentileEl.textContent = `Top ${Number(record.percentileRank || 50).toFixed(0)}%`;

    // Set Specs
    const payload = record.payload || {};
    const specInstalls = document.getElementById("detail-spec-installs");
    const specReviews = document.getElementById("detail-spec-reviews");
    const specSize = document.getElementById("detail-spec-size");
    const specContentRating = document.getElementById("detail-spec-content-rating");
    const specAds = document.getElementById("detail-spec-ads");
    const specPrice = document.getElementById("detail-spec-price");
    const specUpdated = document.getElementById("detail-spec-updated");

    if (specInstalls) specInstalls.textContent = formatInstallsHelper(payload.installs || 10000);
    if (specReviews) specReviews.textContent = Number(payload.reviews || 0).toLocaleString();
    if (specSize) specSize.textContent = `${(payload.size || 25).toFixed(1)} MB`;
    if (specContentRating) specContentRating.textContent = payload.content_rating || "Everyone";
    if (specAds) specAds.textContent = payload.contains_ads === "Yes" ? "Yes (With Ads)" : "No (Ad-Free)";
    if (specPrice) specPrice.textContent = Number(payload.price || 0) === 0 ? "Free App" : `$${Number(payload.price).toFixed(2)}`;
    
    if (specUpdated) {
      const days = payload.last_updated_days || 30;
      let text = `${days} Days ago`;
      if (days <= 7) text += " (Weekly Update)";
      else if (days <= 30) text += " (Monthly Update)";
      else if (days <= 180) text += " (Semi-annual)";
      else text += " (Stale App)";
      specUpdated.textContent = text;
    }

    // Render SHAP Rows inside Detail View
    const shapContainer = document.getElementById("detail-shap-container");
    if (shapContainer) {
      shapContainer.innerHTML = "";
      const shap = record.shap_values || {};
      const items = Object.entries(shap).map(([key, val]) => ({ key, val: Number(val) }));
      items.sort((a, b) => Math.abs(b.val) - Math.abs(a.val)); // Sort by impact

      items.forEach((item) => {
        const isPositive = item.val >= 0;
        const absVal = Math.abs(item.val);
        const widthPercent = Math.min(100, Math.max(8, absVal * 150));
        const colorClass = isPositive 
          ? "bg-emerald-500 dark:bg-emerald-600" 
          : "bg-rose-500 dark:bg-rose-600";
        const signStr = isPositive ? "+" : "-";

        const row = document.createElement("div");
        row.className = "space-y-1";
        row.innerHTML = `
          <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span class="capitalize">${item.key.replace(/_/g, " ")}</span>
            <span class="${isPositive ? 'text-emerald-500' : 'text-rose-500'} font-semibold">${signStr}${absVal.toFixed(3)}</span>
          </div>
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full ${colorClass} rounded-full" style="width: ${widthPercent}%"></div>
          </div>
        `;
        shapContainer.appendChild(row);
      });
    }

    // Render Recommendations inside Detail View
    const recContainer = document.getElementById("detail-recommendations");
    if (recContainer) {
      recContainer.innerHTML = "";
      const shap = record.shap_values || {};
      const ads = payload.contains_ads;
      const reviews = payload.reviews || 0;
      const installs = payload.installs || 0;
      const days = payload.last_updated_days || 30;

      const tactics: string[] = [];
      
      if (days > 90) {
        tactics.push("<strong>Deploy Storefront Refresh:</strong> Update the binary footprint immediately. Models indicate update latency of >90 days exposes storefront to ranking churn.");
      } else {
        tactics.push("<strong>Healthy Update Cadence:</strong> Maintaining binary updates within 90 days prevents storefront depreciation.");
      }

      if (ads === "Yes" && (shap["Ad Presence"] || 0) < 0) {
        tactics.push("<strong>Ad-Free Option Model:</strong> Introduce a premium tier removing interstitial storefront ads to recover rating dampening.");
      }

      if (installs < 100000) {
        tactics.push("<strong>Acquisition Campaign Boost:</strong> Storefront installs tier is low. Boosting downloads to over 100k can statistically yield category multiplier.");
      }

      if (shap.reviews && shap.reviews < 0) {
        tactics.push("<strong>Frictionless Feedback Loop:</strong> Prompt in-app rating reviews during high-delight moments to minimize review degradation.");
      } else {
        tactics.push("<strong>Review Density Optimization:</strong> Capitalize on high user satisfaction ratios to solidify current performance.");
      }

      tactics.forEach((t) => {
        const div = document.createElement("div");
        div.className = "text-[10px] text-slate-600 dark:text-slate-400 leading-normal border-l-2 border-indigo-500/50 pl-2.5 py-0.5 bg-slate-100/30 dark:bg-slate-850/30 rounded-r-lg";
        div.innerHTML = t;
        recContainer.appendChild(div);
      });
    }

    // Show Modal
    historyDetailModal.classList.remove("hidden");
  }

  function formatInstallsHelper(num: number): string {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}B+`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return `${num}+`;
  }

  // Side-by-Side Comparison Logic
  if (historyCompareBtn) {
    historyCompareBtn.addEventListener("click", () => {
      if (selectedHistoryIds.length !== 2 || !historyCompareModal) return;

      const appA = loadedHistoryRecords.find((r) => r.id === selectedHistoryIds[0]);
      const appB = loadedHistoryRecords.find((r) => r.id === selectedHistoryIds[1]);

      if (!appA || !appB) return;

      // Populate Column A
      const compNameA = document.getElementById("compare-name-a");
      const compRatingA = document.getElementById("compare-rating-a");
      const compConfidenceA = document.getElementById("compare-confidence-a");
      const compPositionA = document.getElementById("compare-position-a");
      const compInstallsA = document.getElementById("compare-installs-a");
      const compReviewsA = document.getElementById("compare-reviews-a");
      const compSizeA = document.getElementById("compare-size-a");
      const compUpdatedA = document.getElementById("compare-updated-a");
      const compAdsA = document.getElementById("compare-ads-a");
      const compPriceA = document.getElementById("compare-price-a");

      if (compNameA) compNameA.textContent = appA.appName;
      if (compRatingA) compRatingA.textContent = `${Number(appA.rating).toFixed(2)} / 5.0`;
      if (compConfidenceA) compConfidenceA.textContent = `${appA.confidence}%`;
      if (compPositionA) compPositionA.textContent = `Top ${Number(appA.percentileRank || 50).toFixed(0)}%`;
      if (compInstallsA) compInstallsA.textContent = formatInstallsHelper(appA.payload?.installs || 0);
      if (compReviewsA) compReviewsA.textContent = Number(appA.payload?.reviews || 0).toLocaleString();
      if (compSizeA) compSizeA.textContent = `${(appA.payload?.size || 0).toFixed(1)} MB`;
      if (compUpdatedA) compUpdatedA.textContent = `${appA.payload?.last_updated_days || 0} Days`;
      if (compAdsA) compAdsA.textContent = appA.payload?.contains_ads === "Yes" ? "Has Ads" : "Ad-Free";
      if (compPriceA) compPriceA.textContent = Number(appA.payload?.price || 0) === 0 ? "Free" : `$${Number(appA.payload.price).toFixed(2)}`;

      // Populate Column B
      const compNameB = document.getElementById("compare-name-b");
      const compRatingB = document.getElementById("compare-rating-b");
      const compConfidenceB = document.getElementById("compare-confidence-b");
      const compPositionB = document.getElementById("compare-position-b");
      const compInstallsB = document.getElementById("compare-installs-b");
      const compReviewsB = document.getElementById("compare-reviews-b");
      const compSizeB = document.getElementById("compare-size-b");
      const compUpdatedB = document.getElementById("compare-updated-b");
      const compAdsB = document.getElementById("compare-ads-b");
      const compPriceB = document.getElementById("compare-price-b");

      if (compNameB) compNameB.textContent = appB.appName;
      if (compRatingB) compRatingB.textContent = `${Number(appB.rating).toFixed(2)} / 5.0`;
      if (compConfidenceB) compConfidenceB.textContent = `${appB.confidence}%`;
      if (compPositionB) compPositionB.textContent = `Top ${Number(appB.percentileRank || 50).toFixed(0)}%`;
      if (compInstallsB) compInstallsB.textContent = formatInstallsHelper(appB.payload?.installs || 0);
      if (compReviewsB) compReviewsB.textContent = Number(appB.payload?.reviews || 0).toLocaleString();
      if (compSizeB) compSizeB.textContent = `${(appB.payload?.size || 0).toFixed(1)} MB`;
      if (compUpdatedB) compUpdatedB.textContent = `${appB.payload?.last_updated_days || 0} Days`;
      if (compAdsB) compAdsB.textContent = appB.payload?.contains_ads === "Yes" ? "Has Ads" : "Ad-Free";
      if (compPriceB) compPriceB.textContent = Number(appB.payload?.price || 0) === 0 ? "Free" : `$${Number(appB.payload.price).toFixed(2)}`;

      // Visual Highlighting based on which app is better
      const isRatingBetterA = Number(appA.rating) >= Number(appB.rating);
      if (compRatingA && compRatingB) {
        if (isRatingBetterA) {
          compRatingA.className = "text-lg font-black text-emerald-600 dark:text-emerald-400";
          compRatingB.className = "text-lg font-bold text-slate-500 dark:text-slate-400";
        } else {
          compRatingA.className = "text-lg font-bold text-slate-500 dark:text-slate-400";
          compRatingB.className = "text-lg font-black text-emerald-600 dark:text-emerald-400";
        }
      }

      const isConfidenceBetterA = Number(appA.confidence) >= Number(appB.confidence);
      if (compConfidenceA && compConfidenceB) {
        if (isConfidenceBetterA) {
          compConfidenceA.className = "font-black text-slate-900 dark:text-white";
          compConfidenceB.className = "font-medium text-slate-400 dark:text-slate-500";
        } else {
          compConfidenceA.className = "font-medium text-slate-400 dark:text-slate-500";
          compConfidenceB.className = "font-black text-slate-900 dark:text-white";
        }
      }

      // Synthesis logic
      const synthWinner = document.getElementById("compare-synth-winner");
      const synthAdvantages = document.getElementById("compare-synth-advantages");
      const synthRisks = document.getElementById("compare-synth-risks");

      const winnerApp = Number(appA.rating) >= Number(appB.rating) ? appA : appB;
      const loserApp = Number(appA.rating) >= Number(appB.rating) ? appB : appA;

      if (synthWinner) {
        synthWinner.textContent = `${winnerApp.appName} (${Number(winnerApp.rating).toFixed(2)} / 5.0)`;
      }

      if (synthAdvantages) {
        synthAdvantages.innerHTML = "";
        const advantages: string[] = [];

        if ((winnerApp.payload?.installs || 0) > (loserApp.payload?.installs || 0)) {
          advantages.push(`Larger distribution scale (${formatInstallsHelper(winnerApp.payload?.installs || 0)}) limits rating volatility.`);
        }
        if ((winnerApp.payload?.last_updated_days || 30) < (loserApp.payload?.last_updated_days || 30)) {
          advantages.push(`Faster update cadence (${winnerApp.payload?.last_updated_days || 0} days) shows higher publisher commitment.`);
        }
        if (winnerApp.payload?.contains_ads !== "Yes" && loserApp.payload?.contains_ads === "Yes") {
          advantages.push(`Ad-free user experience prevents rating drag.`);
        }
        if ((winnerApp.payload?.reviews || 0) > (loserApp.payload?.reviews || 0)) {
          advantages.push(`Stronger review density builds algorithmic feedback loop confidence.`);
        }

        if (advantages.length === 0) {
          advantages.push("Marginal optimization advantages across basic parameters.");
        }

        advantages.forEach((adv) => {
          const li = document.createElement("li");
          li.className = "mb-1 text-[10px] text-slate-600 dark:text-slate-400 list-none leading-relaxed pl-3 border-l-2 border-emerald-500";
          li.textContent = adv;
          synthAdvantages.appendChild(li);
        });
      }

      if (synthRisks) {
        synthRisks.innerHTML = "";
        const risks: string[] = [];

        if (loserApp.payload?.contains_ads === "Yes") {
          risks.push(`Interstitial ad fatigue model detected on ${loserApp.appName}.`);
        }
        if ((loserApp.payload?.last_updated_days || 0) > 90) {
          risks.push(`Update latency on ${loserApp.appName} exceeded threshold of 90 days.`);
        }
        if ((loserApp.payload?.installs || 0) < 10000) {
          risks.push(`Low distribution volume (${formatInstallsHelper(loserApp.payload?.installs || 0)}) poses niche ranking risks.`);
        }

        if (risks.length === 0) {
          risks.push("No major critical risks identified on current models.");
        }

        risks.forEach((rk) => {
          const li = document.createElement("li");
          li.className = "mb-1 text-[10px] text-slate-600 dark:text-slate-400 list-none leading-relaxed pl-3 border-l-2 border-rose-500";
          li.textContent = rk;
          synthRisks.appendChild(li);
        });
      }

      historyCompareModal.classList.remove("hidden");
    });
  }

  // Bind close buttons
  historyDetailClose?.addEventListener("click", () => {
    historyDetailModal?.classList.add("hidden");
  });
  historyCompareClose?.addEventListener("click", () => {
    historyCompareModal?.classList.add("hidden");
  });

  // Bind refresh click
  if (historyRefreshBtn) {
    historyRefreshBtn.addEventListener("click", updateHistoryView);
  }

  // Bind filter controls
  if (historyFilterSearch) {
    historyFilterSearch.addEventListener("input", renderHistoryItems);
  }
  if (historyFilterCategory) {
    historyFilterCategory.addEventListener("change", renderHistoryItems);
  }
  if (historyFilterMode) {
    historyFilterMode.addEventListener("change", renderHistoryItems);
  }
  if (historySort) {
    historySort.addEventListener("change", renderHistoryItems);
  }
  if (historyClearFilters) {
    historyClearFilters.addEventListener("click", () => {
      if (historyFilterSearch) historyFilterSearch.value = "";
      if (historyFilterCategory) historyFilterCategory.value = "ALL";
      if (historyFilterMode) historyFilterMode.value = "ALL";
      if (historySort) historySort.value = "LATEST";
      renderHistoryItems();
    });
  }

  function switchPage(activePageId: string) {
    // Dynamic breadcrumb text mapping
    const breadcrumbCurrentTab = document.getElementById("breadcrumb-current-tab");
    if (breadcrumbCurrentTab) {
      const pageNamesMap: Record<string, string> = {
        "page-home": "Home Console",
        "page-prediction": "Prediction Engine",
        "page-competitor": "Competitor Analysis",
        "page-trend": "Trend Analysis",
        "page-advisor": "AI Advisor Solutions",
        "page-eda-insights": "Market EDA Insights",
        "page-eda-dashboard": "EDA Empirical Dashboard",
        "page-history": "Diagnostic History",
        "page-about": "System Information",
        "page-signup": "Create Account",
        "page-profile": "Account Profile",
        "page-settings": "System Settings"
      };
      breadcrumbCurrentTab.textContent = pageNamesMap[activePageId] || "Dashboard";
    }

    pages.forEach((pageId) => {
      const pageEl = document.getElementById(pageId);
      if (pageEl) {
        if (pageId === activePageId) {
          pageEl.classList.remove("hidden");
          if (pageId === "page-prediction") {
            pageEl.className = "page-container p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8";
          } else {
            pageEl.className = "page-container p-4 md:p-8 space-y-6";
          }
        } else {
          pageEl.classList.add("hidden");
        }
      }

      const btn = navButtons[pageId];
      if (btn) {
        if (pageId === activePageId) {
          btn.className = "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-left transition-all duration-200";
        } else {
          btn.className = "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 text-left";
        }
      }
    });

    if (activePageId === "page-competitor") {
      updateCompetitorView();
    }

    if (activePageId === "page-profile") {
      const profileEmailText = document.getElementById("profile-email-text");
      if (profileEmailText) {
        profileEmailText.textContent = loggedInUserEmail;
      }
      const profileNameTitle = document.getElementById("profile-name-title");
      const profileFullNameInput = document.getElementById("profile-full-name") as HTMLInputElement | null;
      const savedName = localStorage.getItem("rateiq_profile_name") || loggedInUserEmail.split("@")[0];
      const displayName = savedName.charAt(0).toUpperCase() + savedName.slice(1);
      if (profileNameTitle) {
        profileNameTitle.textContent = displayName;
      }
      if (profileFullNameInput) {
        profileFullNameInput.value = savedName;
      }
      
      const profileCompanyText = document.getElementById("profile-company-text");
      const profileCompanyInput = document.getElementById("profile-company") as HTMLInputElement | null;
      const savedCompany = localStorage.getItem("rateiq_profile_company") || "RateIQ Enterprise";
      if (profileCompanyText) {
        profileCompanyText.textContent = savedCompany;
      }
      if (profileCompanyInput) {
        profileCompanyInput.value = savedCompany;
      }
      
      const profileAvatarBig = document.getElementById("profile-avatar-big");
      if (profileAvatarBig) {
        profileAvatarBig.textContent = displayName.slice(0, 2).toUpperCase();
      }
    }
    if (activePageId === "page-trend") {
      updateTrendView();
    }
    if (activePageId === "page-advisor") {
      updateAdvisorView();
    }
    if (activePageId === "page-eda-insights") {
      updateEdaInsightsView();
    }
    if (activePageId === "page-eda-dashboard") {
      updateEdaDashboardView();
    }
    if (activePageId === "page-history") {
      updateHistoryView();
    }

    if (window.innerWidth < 768) {
      const sidebarEl = document.getElementById("sidebar");
      if (sidebarEl) {
        sidebarEl.classList.add("hidden");
        sidebarEl.classList.remove("flex");
      }
    }
  }

  // Register Click handlers
  Object.keys(navButtons).forEach((pageId) => {
    const btn = navButtons[pageId];
    if (btn) {
      btn.addEventListener("click", () => switchPage(pageId));
    }
  });

  // ----------------- AUTHENTICATION & SIDEBAR WORKFLOWS -----------------
  const loginModal = document.getElementById("login-modal");
  const loginModalClose = document.getElementById("login-modal-close");
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const historyLoginTrigger = document.getElementById("history-login-trigger");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarEl = document.getElementById("sidebar");

  function updateAuthUI() {
    const loggedOutEl = document.getElementById("auth-logged-out");
    const loggedInEl = document.getElementById("auth-logged-in");
    
    if (isLoggedIn) {
      if (loggedOutEl) loggedOutEl.classList.add("hidden");
      if (loggedInEl) loggedInEl.classList.remove("hidden");
      
      const headerEmailEl = document.getElementById("header-email");
      const dropdownEmailEl = document.getElementById("dropdown-user-email");
      const headerUsernameEl = document.getElementById("header-username");
      const headerAvatarEl = document.getElementById("header-avatar");
      
      if (headerEmailEl) headerEmailEl.textContent = loggedInUserEmail;
      if (dropdownEmailEl) dropdownEmailEl.textContent = loggedInUserEmail;
      
      const savedName = localStorage.getItem("rateiq_profile_name");
      const username = savedName || loggedInUserEmail.split("@")[0];
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);
      if (headerUsernameEl) headerUsernameEl.textContent = displayName;
      
      const initials = username.slice(0, 2).toUpperCase();
      if (headerAvatarEl) headerAvatarEl.textContent = initials || "U";
    } else {
      if (loggedOutEl) loggedOutEl.classList.remove("hidden");
      if (loggedInEl) loggedInEl.classList.add("hidden");
    }
    
    // Refresh dashboard values to display correct scoping
    updateHomeDashboard();
  }

  // Show login modal with dynamic field clearing and autocomplete control
  const openLoginModal = () => {
    const loginEmailInputOnLoad = document.getElementById("login-email") as HTMLInputElement | null;
    const loginPasswordInputOnLoad = document.getElementById("login-password") as HTMLInputElement | null;
    if (loginEmailInputOnLoad) {
      loginEmailInputOnLoad.value = "";
      loginEmailInputOnLoad.setAttribute("autocomplete", "off");
    }
    if (loginPasswordInputOnLoad) {
      loginPasswordInputOnLoad.value = "";
      loginPasswordInputOnLoad.setAttribute("autocomplete", "new-password");
    }
    if (loginModal) loginModal.classList.remove("hidden");
  };

  // Clear login fields and set autocomplete attributes immediately on file load
  const loginEmailInputInitial = document.getElementById("login-email") as HTMLInputElement | null;
  const loginPasswordInputInitial = document.getElementById("login-password") as HTMLInputElement | null;
  if (loginEmailInputInitial) {
    loginEmailInputInitial.value = "";
    loginEmailInputInitial.setAttribute("autocomplete", "off");
  }
  if (loginPasswordInputInitial) {
    loginPasswordInputInitial.value = "";
    loginPasswordInputInitial.setAttribute("autocomplete", "new-password");
  }

  // Delegate Sign In Trigger Click handlers (robust delegation)
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target && (target.id === "header-login-btn" || target.closest("#header-login-btn") || target.id === "history-login-trigger" || target.closest("#history-login-trigger") || target.id === "home-activity-login-btn" || target.closest("#home-activity-login-btn"))) {
      openLoginModal();
    }
  });

  // Close login modal
  if (loginModalClose) {
    loginModalClose.addEventListener("click", () => {
      if (loginModal) loginModal.classList.add("hidden");
    });
  }

  // Link to trigger signup from login modal
  const loginCreateAccountLink = document.getElementById("login-create-account-link");
  if (loginCreateAccountLink) {
    loginCreateAccountLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.classList.add("hidden");
      switchPage("page-signup");
    });
  }

  // Link to trigger login from signup page
  const signupLoginLink = document.getElementById("signup-login-link");
  if (signupLoginLink) {
    signupLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage("page-home");
      openLoginModal();
    });
  }

  // Handle Signup form submit
  const signupForm = document.getElementById("signup-form") as HTMLFormElement | null;
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const signupEmailInput = document.getElementById("signup-email") as HTMLInputElement | null;
      const signupNameInput = document.getElementById("signup-name") as HTMLInputElement | null;
      
      if (signupEmailInput) {
        loggedInUserEmail = signupEmailInput.value.trim() || "ponesakki0308@gmail.com";
        localStorage.setItem("rateiq_user_email", loggedInUserEmail);
      }
      if (signupNameInput) {
        localStorage.setItem("rateiq_profile_name", signupNameInput.value.trim());
      }
      
      isLoggedIn = true;
      localStorage.setItem("rateiq_logged_in", "true");
      
      showToast("Account created successfully!", "success");
      updateAuthUI();
      switchPage("page-home");
    });
  }

  // Handle Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      isLoggedIn = true;
      localStorage.setItem("rateiq_logged_in", "true");
      
      const loginEmailInput = document.getElementById("login-email") as HTMLInputElement;
      if (loginEmailInput) {
        loggedInUserEmail = loginEmailInput.value.trim() || "ponesakki0308@gmail.com";
        localStorage.setItem("rateiq_user_email", loggedInUserEmail);
      }
      
      if (loginModal) loginModal.classList.add("hidden");
      updateAuthUI();
      // If we are currently on the history page, update the view
      updateHistoryView();
      showToast(`Successfully logged in as ${loggedInUserEmail}.`, "success");
    });
  }

  // Unified Logout Flow
  function handleLogout() {
    isLoggedIn = false;
    
    // Clear session, localStorage, and cache
    localStorage.clear();
    sessionStorage.clear();
    if (window.caches) {
      window.caches.keys().then((keys) => {
        keys.forEach((key) => window.caches.delete(key));
      });
    }

    loggedInUserEmail = "ponesakki0308@gmail.com"; // Reset to default
    
    // Empty login fields
    const loginEmailInput = document.getElementById("login-email") as HTMLInputElement | null;
    const loginPasswordInput = document.getElementById("login-password") as HTMLInputElement | null;
    if (loginEmailInput) loginEmailInput.value = "";
    if (loginPasswordInput) loginPasswordInput.value = "";
    
    // Close the dropdown
    const dropdown = document.getElementById("three-dot-dropdown");
    if (dropdown) dropdown.classList.add("hidden");
    
    updateAuthUI();
    // If we are currently on the history page, update the view (which will redirect or hide content)
    updateHistoryView();
    
    // Redirect/switch page to Home Console
    switchPage("page-home");
    showToast("Logged out successfully.", "success");
  }

  // Password Show/Hide Toggle Setup
  const loginPassword = document.getElementById("login-password") as HTMLInputElement | null;
  const passwordToggle = document.getElementById("login-password-toggle");
  const eyeOpenIcon = document.getElementById("eye-open-icon");
  const eyeClosedIcon = document.getElementById("eye-closed-icon");

  if (passwordToggle && loginPassword && eyeOpenIcon && eyeClosedIcon) {
    passwordToggle.addEventListener("click", () => {
      if (loginPassword.type === "password") {
        loginPassword.type = "text";
        eyeOpenIcon.classList.add("hidden");
        eyeClosedIcon.classList.remove("hidden");
      } else {
        loginPassword.type = "password";
        eyeOpenIcon.classList.remove("hidden");
        eyeClosedIcon.classList.add("hidden");
      }
    });
  }

  // Handle Mobile Sidebar toggle
  if (sidebarToggle && sidebarEl) {
    sidebarToggle.addEventListener("click", () => {
      sidebarEl.classList.toggle("hidden");
      sidebarEl.classList.toggle("flex");
    });
  }

  // System 3-Dot (⋮) Menu Interaction Logic
  const threeDotBtn = document.getElementById("three-dot-menu-btn");
  const threeDotDropdown = document.getElementById("three-dot-dropdown");

  if (threeDotBtn && threeDotDropdown) {
    threeDotBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      threeDotDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!threeDotBtn.contains(e.target as Node) && !threeDotDropdown.contains(e.target as Node)) {
        threeDotDropdown.classList.add("hidden");
      }
    });
  }

  // System Dropdown Action Hooks
  const menuOptProfile = document.getElementById("menu-opt-profile");
  if (menuOptProfile) {
    menuOptProfile.addEventListener("click", () => {
      threeDotDropdown?.classList.add("hidden");
      switchPage("page-profile");
    });
  }

  const menuOptSettings = document.getElementById("menu-opt-settings");
  if (menuOptSettings) {
    menuOptSettings.addEventListener("click", () => {
      threeDotDropdown?.classList.add("hidden");
      switchPage("page-settings");
    });
  }

  // Profile Edit Form Handler
  const profileEditForm = document.getElementById("profile-edit-form") as HTMLFormElement | null;
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const profileFullNameInput = document.getElementById("profile-full-name") as HTMLInputElement | null;
      const profileCompanyInput = document.getElementById("profile-company") as HTMLInputElement | null;
      if (profileFullNameInput) {
        localStorage.setItem("rateiq_profile_name", profileFullNameInput.value.trim());
      }
      if (profileCompanyInput) {
        localStorage.setItem("rateiq_profile_company", profileCompanyInput.value.trim());
      }
      updateAuthUI(); // Updates header avatar/name dynamically!
      
      // Update profile page view titles as well
      const profileNameTitle = document.getElementById("profile-name-title");
      if (profileNameTitle && profileFullNameInput) {
        const displayName = profileFullNameInput.value.trim();
        profileNameTitle.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        const profileAvatarBig = document.getElementById("profile-avatar-big");
        if (profileAvatarBig) {
          profileAvatarBig.textContent = displayName.slice(0, 2).toUpperCase();
        }
      }
      const profileCompanyText = document.getElementById("profile-company-text");
      if (profileCompanyText && profileCompanyInput) {
        profileCompanyText.textContent = profileCompanyInput.value.trim();
      }

      showToast("Profile updated successfully!", "success");
    });
  }

  // Settings Interaction Handlers
  const settingsThemeToggle = document.getElementById("settings-theme-toggle");
  if (settingsThemeToggle) {
    settingsThemeToggle.addEventListener("click", () => {
      // Trigger the main theme toggle btn click!
      if (themeToggleBtn) {
        themeToggleBtn.click();
        showToast("Theme settings updated.", "success");
      }
    });
  }

  const settingsResetStorage = document.getElementById("settings-reset-storage");
  if (settingsResetStorage) {
    settingsResetStorage.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all application storage? This cannot be undone.")) {
        handleLogout();
        showToast("All local application data has been reset.", "success");
      }
    });
  }

  const menuOptLogout = document.getElementById("menu-opt-logout");
  if (menuOptLogout) {
    menuOptLogout.addEventListener("click", () => {
      handleLogout();
    });
  }

  // Initial Auth UI State
  updateAuthUI();

  // ----------------- SaaS CUSTOM ENGINE EXTENSIONS -----------------

  // Smart Alert Toast System
  function showToast(message: string, type: "success" | "error" | "info" = "success") {
    // Check if toast container exists
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed bottom-5 right-5 space-y-2 z-50 pointer-events-none max-w-sm w-full px-4";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `p-3.5 rounded-xl border shadow-lg flex items-start space-x-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto text-xs bg-white dark:bg-slate-900 ${
      type === "success" 
        ? "border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200" 
        : type === "error"
        ? "border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-200"
        : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
    }`;

    // Dynamic icon markup
    const successIcon = `<div class="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg></div>`;
    const errorIcon = `<div class="h-4 w-4 text-rose-500 shrink-0 mt-0.5"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0" /></svg></div>`;
    const infoIcon = `<div class="h-4 w-4 text-indigo-500 shrink-0 mt-0.5"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0" /></svg></div>`;

    toast.innerHTML = `
      ${type === "success" ? successIcon : type === "error" ? errorIcon : infoIcon}
      <div class="flex-1">
        <p class="font-bold uppercase tracking-wider text-[9px] text-slate-400 dark:text-slate-500">${type}</p>
        <p class="mt-0.5 font-medium leading-relaxed">${message}</p>
      </div>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 50);

    // Animate out and remove
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-[-10px]");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // Home Page Metrics and Activity feed updater
  async function updateHomeDashboard() {
    const predictionsCountEl = document.getElementById("home-metric-predictions");
    if (predictionsCountEl) {
      predictionsCountEl.textContent = String(sessionPredictionsCount);
    }

    try {
      // Fetch dynamic total app stats and category counts from backend dataset.json file
      const datasetRes = await fetch("/api/eda-insights");
      if (datasetRes.ok) {
        const datasetData = await datasetRes.json();
        const totalApps = datasetData.total_apps || 1250;
        const totalCats = datasetData.categories_analyzed || 33;
        
        const totalAppsEl = document.getElementById("home-metric-total-apps");
        const categoriesEl = document.getElementById("home-metric-categories");
        if (totalAppsEl) totalAppsEl.textContent = totalApps.toLocaleString();
        if (categoriesEl) categoriesEl.textContent = String(totalCats);
      }
    } catch (e) {
      // Keep static defaults on error
    }

    // Populate Recent Activity Feed dynamically from history
    try {
      const emptyStateEl = document.getElementById("home-activity-empty");
      const listEl = document.getElementById("home-activity-list");

      if (!isLoggedIn) {
        if (emptyStateEl) {
          emptyStateEl.innerHTML = `
            <span class="text-xs text-slate-400 dark:text-slate-500 block font-semibold">Sign in to view activity</span>
            <button id="home-activity-login-btn" type="button" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors cursor-pointer">
              Sign In
            </button>
          `;
          emptyStateEl.classList.remove("hidden");
        }
        if (listEl) listEl.classList.add("hidden");
        return;
      }

      const historyRes = await fetch(`/api/history?email=${encodeURIComponent(loggedInUserEmail)}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();

        if (historyData && historyData.length > 0) {
          if (emptyStateEl) emptyStateEl.classList.add("hidden");
          if (listEl) {
            listEl.classList.remove("hidden");
            // Show up to 3 most recent records
            const recent = historyData.slice(0, 3);
            listEl.innerHTML = recent.map((item: any) => {
              const recordDate = item.date || item.timestamp || new Date().toISOString();
              const formattedTime = new Date(recordDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const itemRating = item.rating || item.predictedRating || 4.3;
              return `
                <div class="flex items-start justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50">
                  <div class="space-y-0.5 truncate">
                    <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">${item.appName || 'Unknown App'}</span>
                    <span class="text-[9px] text-slate-400 dark:text-slate-500 block">${item.category || 'Tools'} • ${formattedTime}</span>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block">${Number(itemRating).toFixed(1)} ★</span>
                    <span class="text-[8px] font-mono text-slate-400 block">${item.confidence || 92}% conf</span>
                  </div>
                </div>
              `;
            }).join("");
          }
        } else {
          if (emptyStateEl) {
            emptyStateEl.innerHTML = `
              <span class="text-xs text-slate-400 dark:text-slate-500 block font-semibold">No recent operations</span>
              <button onclick="document.getElementById('nav-prediction').click()" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                Run Prediction
              </button>
            `;
            emptyStateEl.classList.remove("hidden");
          }
          if (listEl) listEl.classList.add("hidden");
        }
      }
    } catch (e) {
      // Suppress activity list error gracefully
    }
  }

  // Global Search Autocomplete Logic
  const searchInput = document.getElementById("global-search-input") as HTMLInputElement;
  const searchAutocomplete = document.getElementById("search-autocomplete");

  if (searchInput && searchAutocomplete) {
    // Static searchable database of index pages, segment categories
    const searchableIndex = [
      { type: "screen", label: "Prediction Engine", id: "page-prediction" },
      { type: "screen", label: "Competitor Analysis", id: "page-competitor" },
      { type: "screen", label: "Market Trend Comparison", id: "page-trend" },
      { type: "screen", label: "AI Advisor Expert", id: "page-advisor" },
      { type: "screen", label: "Market EDA Insights", id: "page-eda-insights" },
      { type: "screen", label: "EDA Empirical Dashboard", id: "page-eda-dashboard" },
      { type: "screen", label: "Diagnostic History", id: "page-history" },
      { type: "screen", label: "System Information (About)", id: "page-about" },
      { type: "category", label: "Game Segment Insights", id: "page-eda-insights", term: "GAME" },
      { type: "category", label: "Productivity Apps Benchmark", id: "page-eda-insights", term: "PRODUCTIVITY" },
      { type: "category", label: "Tools Niche Analysis", id: "page-eda-insights", term: "TOOLS" },
      { type: "category", label: "Medical Market Demographics", id: "page-eda-insights", term: "MEDICAL" },
      { type: "category", label: "Finance Segment Trends", id: "page-eda-insights", term: "FINANCE" }
    ];

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) {
        searchAutocomplete.classList.add("hidden");
        return;
      }

      // Filter matches
      const matches = searchableIndex.filter(item => 
        item.label.toLowerCase().includes(query) || 
        (item.term && item.term.toLowerCase().includes(query))
      ).slice(0, 5);

      if (matches.length > 0) {
        searchAutocomplete.innerHTML = matches.map(item => `
          <div data-id="${item.id}" data-term="${item.term || ''}" class="autocomplete-item px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer text-xs flex justify-between items-center transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span class="font-medium text-slate-800 dark:text-slate-200">${item.label}</span>
            <span class="text-[8px] uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30">${item.type}</span>
          </div>
        `).join("");
        searchAutocomplete.classList.remove("hidden");

        // Add event listeners to autocomplete items
        searchAutocomplete.querySelectorAll(".autocomplete-item").forEach(itemEl => {
          itemEl.addEventListener("click", () => {
            const pageId = itemEl.getAttribute("data-id") || "page-home";
            const term = itemEl.getAttribute("data-term");
            
            // Navigate directly to selected screen
            switchPage(pageId);
            
            if (term && pageId === "page-eda-insights") {
              const edaSelect = document.getElementById("eda-insights-category") as HTMLSelectElement;
              if (edaSelect) {
                edaSelect.value = term;
                // Trigger refresh if needed
                edaSelect.dispatchEvent(new Event("change"));
              }
            }

            // Clear & close
            searchInput.value = "";
            searchAutocomplete.classList.add("hidden");
          });
        });
      } else {
        searchAutocomplete.innerHTML = `
          <div class="px-3 py-3 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            No matching resources found.
          </div>
        `;
        searchAutocomplete.classList.remove("hidden");
      }
    });

    // Close autocomplete on clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target as Node) && !searchAutocomplete.contains(e.target as Node)) {
        searchAutocomplete.classList.add("hidden");
      }
    });
  }

  // PDF & CSV Export Function Handlers
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const exportCsvBtn = document.getElementById("export-csv-btn");

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      if (!lastPredictionData) {
        showToast("No active prediction data report to export. Please run a forecast first.", "error");
        return;
      }

      try {
        const reportTitle = `${lastPredictionData.appName} Specification Analysis`;
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          showToast("Failed to open report window due to popup blocker constraints.", "error");
          return;
        }

        const shapHtml = Object.entries(lastPredictionData.shap_values || {}).map(([key, val]) => {
          const numVal = Number(val);
          const colorClass = numVal >= 0 ? "text-emerald-600" : "text-rose-600";
          const sign = numVal >= 0 ? "+" : "";
          return `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${key}</td><td style="padding:8px; border-bottom:1px solid #eee;" class="${colorClass}">${sign}${numVal.toFixed(4)}</td></tr>`;
        }).join("");

        printWindow.document.write(`
          <html>
            <head>
              <title>RateIQ Diagnostic Report - ${lastPredictionData.appName}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; }
                .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
                .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
                .metric { background: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 12px; }
                .value { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
                .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                .title { font-size: 20px; font-weight: 900; margin: 0; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
                th { text-align: left; background: #f1f5f9; padding: 8px; }
                .text-emerald-600 { color: #059669; font-weight: bold; }
                .text-rose-600 { color: #dc2626; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <span class="label" style="color: #6366f1;">RateIQ ML Report</span>
                  <h1 class="title">${reportTitle}</h1>
                </div>
                <div class="grid">
                  <div class="metric">
                    <span class="label">Predicted Rating</span>
                    <div class="value">${Number(lastPredictionData.rating).toFixed(2)} ★</div>
                  </div>
                  <div class="metric">
                    <span class="label">Model Confidence</span>
                    <div class="value">${lastPredictionData.confidence || 92}%</div>
                  </div>
                </div>
                <h3>SHAP Parameter Contributions</h3>
                <table>
                  <thead>
                    <tr><th>Specification Property</th><th>Impact Force</th></tr>
                  </thead>
                  <tbody>
                    ${shapHtml}
                  </tbody>
                </table>
                <div style="margin-top:32px; font-size:10px; color:#94a3b8; text-align:center;">
                  Generated securely by RateIQ Enterprise Predictive Analytics Workspace on ${new Date().toLocaleDateString()}.
                </div>
              </div>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        showToast("PDF report preview sent to compiler window.", "success");
      } catch (err) {
        showToast("Popup blocked. Allow popups to download PDF specifications reports.", "error");
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      if (!lastPredictionData) {
        showToast("No active prediction data report to export. Please run a forecast first.", "error");
        return;
      }

      try {
        const rows = [
          ["Parameter Property", "Value", "SHAP Impact Value"],
          ["App Name", lastPredictionData.appName, ""],
          ["Market Category", lastPredictionData.category, lastPredictionData.shap_values?.["Category Fit"] || 0],
          ["Installs Volume", lastPredictionData.installs, lastPredictionData.shap_values?.["Engagement Ratio"] || 0],
          ["Review Influx Density", lastPredictionData.reviews, ""],
          ["Size Payload (MB)", lastPredictionData.size, lastPredictionData.shap_values?.["Package Size"] || 0],
          ["Contains In-App Ads", lastPredictionData.ads, lastPredictionData.shap_values?.["Ad Presence"] || 0],
          ["Model Predicted Rating Target", lastPredictionData.rating, ""],
          ["Statistical Classification Confidence", lastPredictionData.confidence || 92, ""]
        ];

        const csvContent = "data:text/csv;charset=utf-8," 
          + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rateiq_report_${lastPredictionData.appName.replace(/\s+/g, "_").toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("CSV data specs sheet exported successfully.", "success");
      } catch (err) {
        showToast("An error occurred compiling the CSV dataset schema.", "error");
      }
    });
  }

  // ----------------- CONTACT FORM SYSTEM -----------------
  const contactForm = document.getElementById("contact-form") as HTMLFormElement | null;
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("contact-name") as HTMLInputElement | null;
      const emailInput = document.getElementById("contact-email") as HTMLInputElement | null;
      const messageInput = document.getElementById("contact-message") as HTMLTextAreaElement | null;
      const feedbackEl = document.getElementById("contact-feedback");
      const submitBtn = document.getElementById("contact-submit-btn") as HTMLButtonElement | null;
      const submitText = document.getElementById("contact-submit-text");

      if (!nameInput || !emailInput || !messageInput || !feedbackEl) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        feedbackEl.textContent = "All fields are required.";
        feedbackEl.className = "text-xs font-medium p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400";
        feedbackEl.classList.remove("hidden");
        return;
      }

      // Valid email check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        feedbackEl.textContent = "Please enter a valid email address.";
        feedbackEl.className = "text-xs font-medium p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400";
        feedbackEl.classList.remove("hidden");
        return;
      }

      // Hide previous feedback
      feedbackEl.classList.add("hidden");

      // Retrieve EmailJS configuration
      const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || "";
      const templateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || "";
      const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || "";

      // Disable button and show sending status
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = "Sending...";

      try {
        if (!serviceId || !templateId || !publicKey) {
          throw new Error("EmailJS configuration is missing. Please define VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.");
        }

        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              from_name: name,
              from_email: email,
              message: message,
              to_email: "ramumurugan0806@gmail.com",
            },
          }),
        });

        if (response.ok) {
          feedbackEl.textContent = "Message sent successfully!";
          feedbackEl.className = "text-xs font-medium p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400";
          feedbackEl.classList.remove("hidden");
          contactForm.reset();
          showToast("Message sent successfully!", "success");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "EmailJS delivery failed");
        }
      } catch (err: any) {
        console.error("EmailJS Error:", err);
        feedbackEl.textContent = `Error: ${err?.message || "Failed to send message."}`;
        feedbackEl.className = "text-xs font-medium p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400";
        feedbackEl.classList.remove("hidden");
        showToast(err?.message || "Failed to send message.", "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = "Send Message";
      }
    });
  }

  // Pre-load Home Dashboard values once at start
  updateHomeDashboard();

  // Default page is home
  switchPage("page-home");

});
