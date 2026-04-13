(function () {
  const script = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  const formId = script.getAttribute('data-form-id')
  if (!formId) return

  // Fix — properly get base URL
  const scriptSrc = script.src
  const url = new URL(scriptSrc)
  const baseUrl = url.origin

  // Capture UTM params
  const urlParams = new URLSearchParams(window.location.search)
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  const utmParams = {}
  utmKeys.forEach(key => {
    const val = urlParams.get(key)
    if (val) utmParams[key] = val
  })

  // Create container
  const containerId = 'formtrack-' + formId
  const container = document.createElement('div')
  container.id = containerId
  container.style.cssText = 'width:100%;max-width:480px;margin:0 auto;font-family:Inter,sans-serif;'
  script.parentNode.insertBefore(container, script.nextSibling)

  // Loading state
  container.innerHTML = '<p style="color:#6b7280;font-size:14px;">Loading form...</p>'

  // Fetch form
  fetch(baseUrl + '/api/forms/' + formId)
    .then(res => res.json())
    .then(form => {
      if (!form || form.error) {
        container.innerHTML = '<p style="color:#ef4444;font-size:14px;">Form not found.</p>'
        return
      }
      renderForm(form)
    })
    .catch(() => {
      container.innerHTML = '<p style="color:#ef4444;font-size:14px;">Failed to load form.</p>'
    })

  function renderForm(form) {
    const s = form.settings || {}
    const bgColor = s.bgColor || '#ffffff'
    const accentColor = s.accentColor || '#2563eb'
    const borderRadius = s.borderRadius || '8px'
    const fontFamily = s.fontFamily || 'Inter, sans-serif'
    const submitLabel = s.submitLabel || 'Submit'
    const successMessage = s.successMessage || 'Thank you!'

    container.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      background:${bgColor};
      border-radius:12px;
      padding:32px;
      box-shadow:0 1px 3px rgba(0,0,0,0.1);
      font-family:${fontFamily};
    `

    const title = document.createElement('h2')
    title.textContent = form.name
    title.style.cssText = 'font-size:20px;font-weight:700;color:#111827;margin:0 0 20px 0;'
    wrapper.appendChild(title)

    const values = {}
    const errorEls = {}

    form.fields.forEach(field => {
      const group = document.createElement('div')
      group.style.cssText = 'margin-bottom:16px;'

      const label = document.createElement('label')
      label.style.cssText = 'display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:4px;'
      label.textContent = field.label + (field.required ? ' *' : '')
      group.appendChild(label)

      const inputStyle = `
        width:100%;
        border:1px solid #e5e7eb;
        padding:10px 12px;
        font-size:14px;
        color:#111827;
        outline:none;
        box-sizing:border-box;
        border-radius:${borderRadius};
        font-family:${fontFamily};
        background:#fff;
      `

      let input

      if (field.type === 'textarea') {
        input = document.createElement('textarea')
        input.rows = 4
        input.style.resize = 'vertical'
      } else if (field.type === 'select') {
        input = document.createElement('select')
        input.style.cssText = inputStyle + 'cursor:pointer;'
        const defaultOpt = document.createElement('option')
        defaultOpt.value = ''
        defaultOpt.textContent = 'Select an option'
        input.appendChild(defaultOpt);
        (field.options || []).forEach(opt => {
          const o = document.createElement('option')
          o.value = opt
          o.textContent = opt
          input.appendChild(o)
        })
        input.addEventListener('change', () => { values[field.id] = input.value })
        const errEl = document.createElement('p')
        errEl.style.cssText = 'color:#ef4444;font-size:12px;margin:4px 0 0 0;display:none;'
        errorEls[field.id] = errEl
        group.appendChild(input)
        group.appendChild(errEl)
        wrapper.appendChild(group)
        return
      } else if (field.type === 'radio') {
        const radioGroup = document.createElement('div');
        (field.options || []).forEach(opt => {
          const radioLabel = document.createElement('label')
          radioLabel.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;color:#374151;margin-bottom:6px;cursor:pointer;'
          const radio = document.createElement('input')
          radio.type = 'radio'
          radio.name = field.id
          radio.value = opt
          radio.addEventListener('change', () => { values[field.id] = opt })
          radioLabel.appendChild(radio)
          radioLabel.appendChild(document.createTextNode(opt))
          radioGroup.appendChild(radioLabel)
        })
        const errEl = document.createElement('p')
        errEl.style.cssText = 'color:#ef4444;font-size:12px;margin:4px 0 0 0;display:none;'
        errorEls[field.id] = errEl
        group.appendChild(radioGroup)
        group.appendChild(errEl)
        wrapper.appendChild(group)
        return
      } else if (field.type === 'checkbox') {
        const cbGroup = document.createElement('div')
        const checked = [];
        (field.options || []).forEach(opt => {
          const cbLabel = document.createElement('label')
          cbLabel.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;color:#374151;margin-bottom:6px;cursor:pointer;'
          const cb = document.createElement('input')
          cb.type = 'checkbox'
          cb.value = opt
          cb.addEventListener('change', () => {
            if (cb.checked) checked.push(opt)
            else checked.splice(checked.indexOf(opt), 1)
            values[field.id] = checked.join(',')
          })
          cbLabel.appendChild(cb)
          cbLabel.appendChild(document.createTextNode(opt))
          cbGroup.appendChild(cbLabel)
        })
        group.appendChild(cbGroup)
        wrapper.appendChild(group)
        return
      } else {
        input = document.createElement('input')
        input.type = field.type === 'phone' ? 'tel' : field.type
      }

      input.placeholder = field.placeholder || ''
      input.style.cssText = inputStyle
      input.addEventListener('focus', () => { input.style.borderColor = accentColor })
      input.addEventListener('blur', () => { input.style.borderColor = '#e5e7eb' })
      input.addEventListener('input', () => { values[field.id] = input.value })

      const errEl = document.createElement('p')
      errEl.style.cssText = 'color:#ef4444;font-size:12px;margin:4px 0 0 0;display:none;'
      errorEls[field.id] = errEl

      group.appendChild(input)
      group.appendChild(errEl)
      wrapper.appendChild(group)
    })

    // Submit button
    const btn = document.createElement('button')
    btn.textContent = submitLabel
    btn.style.cssText = `
      width:100%;
      background:${accentColor};
      color:#ffffff;
      border:none;
      padding:12px;
      font-size:14px;
      font-weight:600;
      cursor:pointer;
      margin-top:8px;
      border-radius:${borderRadius};
      font-family:${fontFamily};
    `

    btn.addEventListener('click', () => {
      let valid = true
      form.fields.forEach(field => {
        if (field.required && !values[field.id]?.trim()) {
          valid = false
          if (errorEls[field.id]) {
            errorEls[field.id].textContent = field.label + ' is required'
            errorEls[field.id].style.display = 'block'
          }
        } else {
          if (errorEls[field.id]) {
            errorEls[field.id].style.display = 'none'
          }
        }
      })
      if (!valid) return

      btn.textContent = 'Submitting...'
      btn.disabled = true

      fetch(baseUrl + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: formId,
          data: values,
          ...utmParams,
          source_url: window.location.href,
          referrer: document.referrer,
        }),
      })
        .then(() => {
          wrapper.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px 0;">Thank you!</h3>
              <p style="color:#6b7280;font-size:14px;margin:0;">${successMessage}</p>
            </div>
          `
        })
        .catch(() => {
          btn.textContent = submitLabel
          btn.disabled = false
          alert('Something went wrong. Please try again.')
        })
    })

    wrapper.appendChild(btn)
    container.appendChild(wrapper)
  }
})()