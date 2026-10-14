(() => {
      const SAVE_KEY = 'kevins-cookie-shop-tycoon-v1';
      const BAKE_COST = 0.5;
      const markets = [
        { name: 'Sunny and busy', icon: '☀️', foot: 1.2, mood: 'The sidewalk is buzzing.' },
        { name: 'Steady foot traffic', icon: '☀️', foot: 1, mood: 'A nice, normal day in the neighborhood.' },
        { name: 'A little drizzle', icon: '🌦️', foot: 0.82, mood: 'A few fewer people are out and about.' },
        { name: 'Market day nearby', icon: '🎈', foot: 1.35, mood: 'The neighborhood market is bringing a crowd.' },
        { name: 'Quiet weekday', icon: '☁️', foot: 0.7, mood: 'It is a slower day on the block.' },
        { name: 'Local buzz', icon: '✨', foot: 1.1, mood: 'Word about your cookies is spreading.' }
      ];
      const $ = (id) => document.getElementById(id);
      const money = (value) => '$' + Number(value).toFixed(2);
      const initialState = () => ({ day: 1, cash: 100, cumulativeProfit: 0, sold: 0, reputation: 3, history: [], marketSeed: Math.floor(Math.random() * 6), finished: false });
      let state = loadState();
      let animating = false;

      function loadState() {
        try {
          const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
          if (saved && Number.isInteger(saved.day) && Array.isArray(saved.history) && saved.history.length <= 30) return saved;
        } catch (_) {}
        return initialState();
      }
      function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} }
      function marketForDay(day) { return markets[(state.marketSeed + day - 1) % markets.length]; }
      function expectedDemand(price, ad, market) {
        const base = Math.max(4, 48 * Math.pow(2 / price, 0.82));
        return Math.max(1, Math.round((base + Math.sqrt(ad) * 2.3) * market.foot));
      }
      function setInputs() {
        const bake = Math.max(0, parseInt($('bake-input').value, 10) || 0);
        const price = Math.max(0, Number($('price-input').value) || 0);
        const ad = Math.max(0, Number($('ad-input').value) || 0);
        const total = bake * BAKE_COST + ad;
        $('cost-preview').textContent = money(total);
        $('bake-max').textContent = 'Up to ' + Math.floor(Math.max(0, state.cash - ad) / BAKE_COST);
        $('ad-max').textContent = 'Max ' + money(Math.max(0, state.cash - bake * BAKE_COST));
        $('open-button').disabled = state.finished || total > state.cash + 0.00001 || !Number.isFinite(price) || price < 0.25 || price > 20;
        $('decision-note').textContent = total > state.cash ? 'That plan costs more than your cash. Adjust your batch or advertising.' : state.finished ? 'The 30-day season is over. Start over to play again.' : 'Your ingredient and ad costs come out of today\'s cash.';
        const market = marketForDay(state.day);
        const demand = expectedDemand(price || 2, ad, market);
        $('market-tag').textContent = market.icon + ' ' + market.name;
        $('market-tag').title = market.mood + ' Estimated demand at this price: about ' + demand + ' cookies.';
      }
      function updateDashboard() {
        $('day-pill').textContent = state.finished ? 'SEASON COMPLETE' : 'DAY ' + state.day + ' OF 30';
        $('cash-stat').textContent = money(state.cash);
        $('profit-stat').textContent = money(state.cumulativeProfit);
        $('sold-stat').innerHTML = state.sold + ' <span class="stat-note">cookies</span>';
        $('rep-stat').innerHTML = '⭐ ' + state.reputation.toFixed(1) + ' <span class="stat-note">out of 5</span>';
        $('history-count').textContent = state.history.length + (state.history.length === 1 ? ' day closed' : ' days closed');
        $('history-content').innerHTML = state.history.length
          ? '<div class="history-list">' + state.history.slice(-7).reverse().map((h) => '<div class="history-row"><span>Day ' + h.day + '</span><span class="detail">' + h.sold + ' sold · ' + money(h.revenue) + ' sales</span><strong class="' + (h.profit >= 0 ? 'positive' : 'negative') + '">' + (h.profit >= 0 ? '+' : '−') + money(Math.abs(h.profit)) + '</strong></div>').join('') + '</div>'
          : 'Your first day in business is just ahead.';
      }
      function showOutcome(result) {
        $('outcome-subhead').textContent = 'Day ' + result.day + ' · ' + result.market.name;
        const isUp = result.profit >= 0;
        $('outcome-content').innerHTML = '<div class="result-banner ' + (isUp ? 'positive' : 'negative') + '"><p class="result-title">' + (isUp ? 'A profitable day!' : 'A tougher day at the shop') + '</p><p class="result-copy">' + result.market.mood + ' ' + result.sold + ' of ' + result.baked + ' cookies found a home.</p></div>' +
          '<div class="result-list"><div class="result-row"><span>Cookies sold</span><strong>' + result.sold + ' / ' + result.baked + '</strong></div><div class="result-row"><span>Revenue</span><strong>' + money(result.revenue) + '</strong></div><div class="result-row"><span>Ingredients (' + result.baked + ' × $0.50)</span><strong>−' + money(result.ingredients) + '</strong></div><div class="result-row"><span>Advertising</span><strong>−' + money(result.ad) + '</strong></div><div class="result-row total"><span>Day ' + result.day + ' profit</span><strong class="' + (isUp ? 'positive' : 'negative') + '">' + (isUp ? '+' : '−') + money(Math.abs(result.profit)) + '</strong></div><div class="result-row"><span>Cash remaining</span><strong>' + money(result.cashAfter) + '</strong></div></div><p class="footnote">You paid for every cookie you baked, even the ones left on the tray. ' + (result.leftover ? result.leftover + ' unsold cookies were wasted.' : 'Everything you baked sold!') + '</p>';
      }
      function customerWaves(cookieCount) {
        const buyers = [];
        let remaining = cookieCount;
        while (remaining > 0) {
          const purchase = remaining <= 3 ? remaining : 1 + Math.floor(Math.random() * 3);
          buyers.push(purchase);
          remaining -= purchase;
        }
        const waveCount = Math.min(12, buyers.length);
        const waves = Array.from({ length: waveCount }, () => []);
        buyers.forEach((purchase, index) => waves[Math.floor(index * waveCount / buyers.length)].push(purchase));
        return waves.map((group) => ({ people: group.length, cookies: group.reduce((sum, count) => sum + count, 0) }));
      }
      function animateCustomers(result, onComplete) {
        const waves = customerWaves(result.sold);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const delay = reducedMotion ? 90 : 520;
        const faces = ['🙂', '🧑🏽', '👩🏻', '🧔🏾', '👩🏿', '🧑🏻', '👨🏼', '👩🏽'];
        $('outcome-subhead').textContent = 'Day ' + result.day + ' · ' + result.market.name;
        $('outcome-content').innerHTML = '<div class="shop-scene" aria-live="polite"><div class="shop-scene-header"><span>🍪 Kevin\'s Cookie Shop</span><span class="open-sign">OPEN</span></div><div class="shop-floor"><span class="shop-door" aria-hidden="true">🚪</span><div class="customer-arrival" id="customer-arrival" aria-hidden="true"><span class="customer-face">🙂</span><span class="customer-cookie">🍪</span></div><span class="shop-counter" aria-hidden="true">🧺</span></div><div class="shop-scene-status" id="shop-scene-status">' + (result.sold ? 'The shop is open! Here come the first neighbors.' : 'The shop is open. Let\'s see who stops by!') + '</div><div class="shop-scene-counts"><span id="customer-progress">0 customers</span><span id="cookie-progress">0 of ' + result.sold + ' cookies sold</span></div><div class="shop-progress"><span id="shop-progress-bar"></span></div></div>';
        let index = 0;
        let arrived = 0;
        let cookies = 0;
        const arrival = $('customer-arrival');
        const finish = () => window.setTimeout(onComplete, reducedMotion ? 140 : 480);
        if (!waves.length) {
          $('shop-scene-status').textContent = 'A quiet day. No customers came by, but tomorrow is a fresh batch.';
          finish();
          return;
        }
        const visitNext = () => {
          const wave = waves[index];
          const face = faces[index % faces.length];
          arrived += wave.people;
          cookies += wave.cookies;
          arrival.innerHTML = '<span class="customer-face">' + face + '</span><span class="customer-cookie">🍪 ×' + wave.cookies + '</span>';
          arrival.classList.remove('customer-visit');
          void arrival.offsetWidth;
          arrival.classList.add('customer-visit');
          $('customer-progress').textContent = arrived + (arrived === 1 ? ' customer' : ' customers');
          $('cookie-progress').textContent = cookies + ' of ' + result.sold + ' cookies sold';
          $('shop-progress-bar').style.width = (cookies / result.sold * 100) + '%';
          $('shop-scene-status').textContent = wave.people === 1
            ? face + ' picked up ' + wave.cookies + (wave.cookies === 1 ? ' cookie. Yum!' : ' cookies. Yum!')
            : wave.people + ' neighbors popped in and bought ' + wave.cookies + ' cookies!';
          index++;
          if (index < waves.length) window.setTimeout(visitNext, delay);
          else finish();
        };
        visitNext();
      }
      function finishDay(result) {
        state.cash = Math.round((state.cash + result.profit) * 100) / 100;
        state.cumulativeProfit = Math.round((state.cumulativeProfit + result.profit) * 100) / 100;
        state.sold += result.sold;
        const fill = result.baked ? result.sold / result.baked : 0;
        const reputationChange = result.sold === 0 ? -0.15 : fill > 0.85 ? 0.18 : fill > 0.55 ? 0.08 : -0.04;
        state.reputation = Math.min(5, Math.max(1, Math.round((state.reputation + reputationChange) * 10) / 10));
        result.cashAfter = state.cash;
        state.history.push(result);
        if (state.day >= 30) state.finished = true;
        else state.day++;
        animating = false;
        $('restart-button').disabled = false;
        $('plan-form').querySelectorAll('input, button').forEach((input) => { input.disabled = false; });
        save();
        render();
      }
      function render() {
        updateDashboard();
        if (state.history.length) {
          const last = state.history[state.history.length - 1];
          showOutcome(last);
        }
        if (state.finished) {
          $('decision-title').textContent = 'Your 30-day season is complete';
          $('plan-form').hidden = true;
          $('outcome-subhead').textContent = 'Final report · 30 days in business';
          $('outcome-content').innerHTML += '<div class="game-over"><div class="icon">🏆</div><h3>' + (state.cash >= 100 ? 'What a neighborhood favorite!' : 'Thanks for giving it a go!') + '</h3><p>You finished with ' + money(state.cash) + ' cash and ' + state.sold + ' cookies sold. ' + (state.cash >= 100 ? 'You grew your original $100 by ' + money(state.cash - 100) + '.' : 'Every great baker learns a little more with each batch.') + '</p><button class="primary-button" type="button" onclick="document.getElementById(\'restart-button\').click()">Play again</button></div>';
        } else {
      $('decision-title').textContent = `Day ${state.day}'s game plan`;
          $('plan-form').hidden = false;
          setInputs();
        }
      }
      function closeDay(event) {
        event.preventDefault();
        if (animating || state.finished) return;
        const baked = Math.max(0, Math.floor(Number($('bake-input').value) || 0));
        const price = Math.round(Number($('price-input').value) * 100) / 100;
        const ad = Math.round(Math.max(0, Number($('ad-input').value) || 0) * 100) / 100;
        const expenses = baked * BAKE_COST + ad;
        if (expenses > state.cash + 0.00001 || price < 0.25 || price > 20) return;
        const market = marketForDay(state.day);
        const demand = expectedDemand(price, ad, market);
        const variation = 0.85 + Math.random() * 0.3;
        const sold = Math.min(baked, Math.max(0, Math.round(demand * variation)));
        const revenue = Math.round(sold * price * 100) / 100;
        const ingredients = Math.round(baked * BAKE_COST * 100) / 100;
        const profit = Math.round((revenue - ingredients - ad) * 100) / 100;
        const result = { day: state.day, baked, sold, revenue, ingredients, ad, profit, cashAfter: state.cash, leftover: baked - sold, market };
        animating = true;
        $('restart-button').disabled = true;
        $('plan-form').querySelectorAll('input, button').forEach((input) => { input.disabled = true; });
        animateCustomers(result, () => finishDay(result));
      }
      $('plan-form').addEventListener('submit', closeDay);
      ['bake-input', 'price-input', 'ad-input'].forEach((id) => $(id).addEventListener('input', setInputs));
      $('restart-button').addEventListener('click', () => {
        if (animating) return;
        if (state.history.length && !window.confirm('Start a new 30-day season? Your current shop will be reset.')) return;
        state = initialState();
        try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
        $('bake-input').value = 40;
        $('price-input').value = '2.00';
        $('ad-input').value = 10;
        $('outcome-subhead').textContent = 'Your daily report will appear here after closing time.';
        $('outcome-content').innerHTML = '<div class="empty-state"><div class="icon" aria-hidden="true">📒</div><strong>Ready when you are</strong><span>Make a plan and open your shop to see how the day goes.</span></div>';
        render();
      });
      render();
    })();

