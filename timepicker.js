class TimePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
          <style>
            .time-dropdown-wrapper {
              position: relative;
            }

            .time-input {
              font-size: 1rem;
              width: 100px;
              cursor: pointer;
            }

            .time-popup {
              position: absolute;
              top: 100%;
              left: 0;
              background: white;
              border: 1px solid #ccc;
              padding: 8px;
              display: none;
              z-index: 100;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
              white-space: nowrap;
            }

            .time-popup select {
              margin-right: 8px;
              font-size: 1rem;
            }
          </style>
          <div class="time-dropdown-wrapper">
            <input type="text" class="time-input" placeholder="HH:mm" readonly />
            <div class="time-popup">
              <select class="hour-select"></select> :
              <select class="minute-select"></select>
            </div>
          </div>
        `;
  }

  connectedCallback() {
    this.input = this.shadowRoot.querySelector('.time-input');
    this.popup = this.shadowRoot.querySelector('.time-popup');
    this.hourSelect = this.shadowRoot.querySelector('.hour-select');
    this.minuteSelect = this.shadowRoot.querySelector('.minute-select');

    // Create hidden input for form submission
    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'hidden';
    if (this.hasAttribute('name')) {
      this.hiddenInput.name = this.getAttribute('name');
    }
    this.appendChild(this.hiddenInput);

    // Initialize hour select
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = opt.text = h.toString().padStart(2, "0");
      this.hourSelect.appendChild(opt);
    }

    // Initialize minute select (0~59)
    for (let m = 0; m < 60; m++) {
      const opt = document.createElement("option");
      opt.value = opt.text = m.toString().padStart(2, "0");
      this.minuteSelect.appendChild(opt);
    }

    // Default to current hour, minute set to 00
    const now = new Date();
    this.hourSelect.value = now.getHours().toString().padStart(2, "0");
    this.minuteSelect.value = "00";
    this.updateInput();

    this.input.addEventListener('click', (e) => {
      e.stopPropagation();
      this.popup.style.display = 'block';
    });

    this.hourSelect.addEventListener('change', () => this.updateInput());
    this.minuteSelect.addEventListener('change', () => this.updateInput());

    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick = (e) => {
    if (!this.contains(e.target)) {
      this.popup.style.display = 'none';
    }
  }

  updateInput() {
    const hh = this.hourSelect.value;
    const mm = this.minuteSelect.value;
    const value = `${hh}:${mm}`;
    this.input.value = value;
    this.hiddenInput.value = value;
    this.popup.style.display = 'none';

    this.dispatchEvent(new CustomEvent("change", {
      detail: { value },
      bubbles: true
    }));
  }

  // Support this.value
  get value() {
    return this.input.value;
  }

  set value(val) {
    const [hh, mm] = val.split(":");
    if (hh && mm) {
      this.hourSelect.value = hh.padStart(2, '0');
      this.minuteSelect.value = mm.padStart(2, '0');
      this.input.value = `${hh}:${mm}`;
      this.hiddenInput.value = this.input.value;
    }
  }
}

customElements.define('time-picker', TimePicker);