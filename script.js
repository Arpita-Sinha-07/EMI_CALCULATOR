// ── DOM refs ──
    const loanAmountEl      = document.getElementById('loanAmount');
    const loanAmountSlider  = document.getElementById('loanAmountSlider');
    const loanAmountBadge   = document.getElementById('loanAmountBadge');
    const interestRateEl     = document.getElementById('interestRate');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const interestRateBadge  = document.getElementById('interestRateBadge');
    const tenureEl     = document.getElementById('tenure');
    const tenureSlider = document.getElementById('tenureSlider');
    const tenureBadge  = document.getElementById('tenureBadge');
    const emiValueEl          = document.getElementById('emiValue');
    const totalInterestValueEl = document.getElementById('totalInterestValue');
    const totalPaymentValueEl  = document.getElementById('totalPaymentValue');
    const interestPercentEl    = document.getElementById('interestPercent');
    const donutCenterValueEl   = document.getElementById('donutCenterValue');
    const principalArc = document.getElementById('principalArc');
    const interestArc  = document.getElementById('interestArc');
    const CIRCUMFERENCE = 2 * Math.PI * 62; // ≈ 389.56
    // ── Formatters ──
    function formatCurrency(n) {
      if (n >= 10_000_000) return '₹' + (n / 10_000_000).toFixed(2) + ' Cr';
      if (n >= 100_000)    return '₹' + (n / 100_000).toFixed(2) + ' L';
      return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }
    function formatFull(n) {
      return '₹' + Math.round(n).toLocaleString('en-IN');
    }
    // ── EMI Calculation ──
    function calculateEMI(P, annualRate, tenureYears) {
      const R = annualRate / 12 / 100;
      const N = tenureYears * 12;
      if (R === 0) {
        const emi = P / N;
        return { emi, totalPayment: P, totalInterest: 0 };
      }
      const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
      const totalPayment = emi * N;
      const totalInterest = totalPayment - P;
      return { emi, totalPayment, totalInterest };
    }
    // ── Animate value update ──
    function animatePulse(el) {
      el.classList.remove('pulse');
      void el.offsetWidth; // reflow
      el.classList.add('pulse');
    }
    // ── Update slider fill ──
    function updateSliderFill(slider) {
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const val = parseFloat(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #6366f1 ${pct}%, rgba(255,255,255,0.10) ${pct}%)`;
    }
    // ── Update donut chart ──
    function updateDonut(principal, totalInterest) {
      const total = principal + totalInterest;
      if (total === 0) {
        principalArc.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;
        interestArc.style.strokeDasharray   = `0 ${CIRCUMFERENCE}`;
        donutCenterValueEl.textContent = '0%';
        return;
      }
      const principalPct = principal / total;
      const interestPct  = totalInterest / total;
      const principalLen = principalPct * CIRCUMFERENCE;
      const interestLen  = interestPct  * CIRCUMFERENCE;
      // Principal arc: starts at offset 0
      principalArc.style.strokeDasharray  = `${principalLen} ${CIRCUMFERENCE - principalLen}`;
      principalArc.style.strokeDashoffset = '0';
      // Interest arc: starts after principal
      interestArc.style.strokeDasharray  = `${interestLen} ${CIRCUMFERENCE - interestLen}`;
      interestArc.style.strokeDashoffset = `-${principalLen}`;
      const interestPctRounded = Math.round(interestPct * 100);
      donutCenterValueEl.textContent = interestPctRounded + '%';
    }
    // ── Main update function ──
    function update() {
      const P    = parseFloat(loanAmountEl.value) || 0;
      const rate = parseFloat(interestRateEl.value) || 0;
      const yrs  = parseFloat(tenureEl.value) || 0;
      // Update badges
      loanAmountBadge.textContent  = formatCurrency(P);
      interestRateBadge.textContent = rate.toFixed(1) + '%';
      tenureBadge.textContent       = yrs + (yrs === 1 ? ' Yr' : ' Yrs');
      // Clamp sliders
      loanAmountSlider.value  = Math.min(P, parseFloat(loanAmountSlider.max));
      interestRateSlider.value = rate;
      tenureSlider.value       = yrs;
      updateSliderFill(loanAmountSlider);
      updateSliderFill(interestRateSlider);
      updateSliderFill(tenureSlider);
      if (P <= 0 || rate <= 0 || yrs <= 0) {
        emiValueEl.textContent          = '₹—';
        totalInterestValueEl.textContent = '₹—';
        totalPaymentValueEl.textContent  = '₹—';
        interestPercentEl.textContent    = '—';
        updateDonut(0, 0);
        return;
      }
      const { emi, totalPayment, totalInterest } = calculateEMI(P, rate, yrs);
      // Animate updates
      [emiValueEl, totalInterestValueEl, totalPaymentValueEl].forEach(animatePulse);
      emiValueEl.textContent           = formatFull(emi);
      totalInterestValueEl.textContent  = formatFull(totalInterest);
      totalPaymentValueEl.textContent   = formatFull(totalPayment);
      interestPercentEl.textContent     = Math.round((totalInterest / P) * 100) + '% of principal';
      updateDonut(P, totalInterest);
    }
    // ── Sync: number input → slider ──
    function syncInputToSlider(input, slider) {
      input.addEventListener('input', () => {
        slider.value = Math.min(Math.max(parseFloat(input.value) || 0, parseFloat(slider.min)), parseFloat(slider.max));
        update();
      });
    }
    // ── Sync: slider → number input ──
    function syncSliderToInput(slider, input) {
      slider.addEventListener('input', () => {
        input.value = slider.value;
        update();
      });
    }
    syncInputToSlider(loanAmountEl, loanAmountSlider);
    syncSliderToInput(loanAmountSlider, loanAmountEl);
    syncInputToSlider(interestRateEl, interestRateSlider);
    syncSliderToInput(interestRateSlider, interestRateEl);
    syncInputToSlider(tenureEl, tenureSlider);
    syncSliderToInput(tenureSlider, tenureEl);
    // ── Initial render ──
    update();