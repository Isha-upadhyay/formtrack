(function () {
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  var formId = script.getAttribute('data-form-id')
  if (!formId) return

  var baseUrl = new URL(script.src).origin

  // ─── UTM Cookie Helpers ─────────────────────────────────────────────────────
  function setCookie(name, value, days) {
    var d = new Date()
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/'
  }
  function getCookie(name) {
    var nameEQ = name + '='
    var parts = document.cookie.split(';')
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim()
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length))
    }
    return null
  }

  // Persist fresh UTMs from URL into cookies (30 days), then read back from cookies
  // This ensures UTMs survive multi-page journeys (ad click -> browse -> submit)
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  var urlParams = new URLSearchParams(window.location.search)
  var utmParams = {}

  utmKeys.forEach(function (key) {
    var fromUrl = urlParams.get(key)
    if (fromUrl) setCookie('ft_' + key, fromUrl, 30)
    var val = getCookie('ft_' + key)
    if (val) utmParams[key] = val
  })

  // ─── Container ──────────────────────────────────────────────────────────────
  var container = document.createElement('div')
  container.style.cssText = 'width:100%;max-width:480px;margin:0 auto;'
  script.parentNode.insertBefore(container, script.nextSibling)
  container.innerHTML = '<p style="color:#6b7280;font-size:14px;">Loading form...</p>'

  fetch(baseUrl + '/api/forms/' + formId)
    .then(function (r) { return r.json() })
    .then(function (form) {
      if (!form || form.error) { container.innerHTML = '<p style="color:#ef4444;">Form not found.</p>'; return }
      renderForm(form)
    })
    .catch(function () { container.innerHTML = '<p style="color:#ef4444;">Failed to load form.</p>' })

  function renderForm(form) {
    var s = form.settings || {}
    var bg = s.bgColor || '#fff', accent = s.accentColor || '#2563eb'
    var br = s.borderRadius || '8px', ff = s.fontFamily || 'Inter,sans-serif'
    var submitLabel = s.submitLabel || 'Submit'
    var successMsg = s.successMessage || 'Thank you!'

    container.innerHTML = ''
    var wrapper = document.createElement('div')
    wrapper.style.cssText = 'background:' + bg + ';border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);font-family:' + ff
    var h2 = document.createElement('h2')
    h2.textContent = form.name
    h2.style.cssText = 'font-size:20px;font-weight:700;color:#111827;margin:0 0 20px 0'
    wrapper.appendChild(h2)

    var values = {}, errEls = {}
    var IS = 'width:100%;border:1px solid #e5e7eb;padding:10px 12px;font-size:14px;color:#111827;outline:none;box-sizing:border-box;border-radius:' + br + ';font-family:' + ff + ';background:#fff;'
    var submitting = false  // duplicate-submit guard

    form.fields.forEach(function (f) {
      var g = document.createElement('div'); g.style.marginBottom = '16px'
      var lbl = document.createElement('label')
      lbl.style.cssText = 'display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:4px'
      lbl.textContent = f.label + (f.required ? ' *' : '')
      g.appendChild(lbl)

      var err = document.createElement('p')
      err.style.cssText = 'color:#ef4444;font-size:12px;margin:4px 0 0 0;display:none'
      errEls[f.id] = err

      if (f.type === 'textarea') {
        var ta = document.createElement('textarea'); ta.rows = 4; ta.style.cssText = IS; ta.placeholder = f.placeholder || ''; ta.style.resize = 'vertical'
        ta.addEventListener('input', function () { values[f.id] = ta.value })
        g.appendChild(ta)
      } else if (f.type === 'select') {
        var sel = document.createElement('select'); sel.style.cssText = IS + 'cursor:pointer'
        var def = document.createElement('option'); def.value = ''; def.textContent = 'Select an option'; sel.appendChild(def);
        (f.options || []).forEach(function (o) { var op = document.createElement('option'); op.value = o; op.textContent = o; sel.appendChild(op) })
        sel.addEventListener('change', function () { values[f.id] = sel.value })
        g.appendChild(sel)
      } else if (f.type === 'radio') {
        var rg = document.createElement('div');
        (f.options || []).forEach(function (o) {
          var rl = document.createElement('label'); rl.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;color:#374151;margin-bottom:6px;cursor:pointer'
          var ri = document.createElement('input'); ri.type = 'radio'; ri.name = f.id; ri.value = o
          ri.addEventListener('change', function () { values[f.id] = o })
          rl.appendChild(ri); rl.appendChild(document.createTextNode(o)); rg.appendChild(rl)
        }); g.appendChild(rg)
      } else if (f.type === 'checkbox') {
        var cg = document.createElement('div'), chkd = [];
        (f.options || []).forEach(function (o) {
          var cl = document.createElement('label'); cl.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;color:#374151;margin-bottom:6px;cursor:pointer'
          var ci = document.createElement('input'); ci.type = 'checkbox'; ci.value = o
          ci.addEventListener('change', function () {
            if (ci.checked) chkd.push(o); else chkd.splice(chkd.indexOf(o), 1)
            values[f.id] = chkd.join(',')
          })
          cl.appendChild(ci); cl.appendChild(document.createTextNode(o)); cg.appendChild(cl)
        }); g.appendChild(cg)
      } else {
        var inp = document.createElement('input'); inp.type = f.type === 'phone' ? 'tel' : f.type
        inp.placeholder = f.placeholder || ''; inp.style.cssText = IS
        inp.addEventListener('focus', function () { inp.style.borderColor = accent })
        inp.addEventListener('blur', function () { inp.style.borderColor = '#e5e7eb' })
        inp.addEventListener('input', function () { values[f.id] = inp.value })
        g.appendChild(inp)
      }
      g.appendChild(err); wrapper.appendChild(g)
    })

    var btn = document.createElement('button')
    btn.textContent = submitLabel
    btn.style.cssText = 'width:100%;background:' + accent + ';color:#fff;border:none;padding:12px;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;border-radius:' + br + ';font-family:' + ff

    btn.addEventListener('click', function () {
      if (submitting) return  // prevent double-submit
      var valid = true
      form.fields.forEach(function (f) {
        if (f.required && !values[f.id]?.trim()) {
          valid = false
          errEls[f.id].textContent = f.label + ' is required'; errEls[f.id].style.display = 'block'
        } else { errEls[f.id].style.display = 'none' }
      })
      if (!valid) return

      submitting = true; btn.textContent = 'Submitting...'; btn.disabled = true

      fetch(baseUrl + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ form_id: formId, data: values, source_url: window.location.href, referrer: document.referrer }, utmParams))
      })
        .then(function () {
          wrapper.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">✅</div><h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px 0">Thank you!</h3><p style="color:#6b7280;font-size:14px;margin:0">' + successMsg + '</p></div>'
        })
        .catch(function () {
          submitting = false; btn.textContent = submitLabel; btn.disabled = false
          alert('Something went wrong. Please try again.')
        })
    })
    wrapper.appendChild(btn); container.appendChild(wrapper)
  }
})()