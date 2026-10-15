// Starter template behaviour: mobile navigation and contact-form validation.
// Works without JavaScript too: the nav is visible and forms submit natively.
(function () {
  document.documentElement.classList.add("js");

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var close = function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
    });
    nav.addEventListener("click", function (ev) { if (ev.target.closest("a")) close(); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && nav.classList.contains("open")) { close(); toggle.focus(); }
    });
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (n) { n.remove(); });
    form.querySelectorAll("[aria-invalid]").forEach(function (n) {
      n.removeAttribute("aria-invalid");
      var ids = (n.getAttribute("aria-describedby") || "").split(" ").filter(function (id) { return !/-error$/.test(id); });
      if (ids.length) n.setAttribute("aria-describedby", ids.join(" ")); else n.removeAttribute("aria-describedby");
    });
  }

  function markInvalid(control) {
    var msg = document.createElement("span");
    msg.className = "field-error";
    msg.id = control.id + "-error";
    msg.textContent = control.validity.valueMissing ? "This field is required."
      : control.validity.typeMismatch ? "Please check the format." : control.validationMessage;
    control.setAttribute("aria-invalid", "true");
    var described = control.getAttribute("aria-describedby");
    control.setAttribute("aria-describedby", (described ? described + " " : "") + msg.id);
    control.parentNode.appendChild(msg);
  }

  document.querySelectorAll("form.form").forEach(function (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (ev) {
      clearErrors(form);
      var bad = Array.prototype.filter.call(form.elements, function (c) { return c.willValidate && !c.checkValidity(); });
      if (bad.length) {
        ev.preventDefault();
        bad.forEach(markInvalid);
        bad[0].focus();
        status.textContent = bad.length === 1 ? "One field needs attention." : bad.length + " fields need attention.";
        return;
      }
      var trap = form.querySelector('[name="company_website"]');
      if (trap && trap.value) { ev.preventDefault(); return; }
      if (form.dataset.demo === "true") {
        ev.preventDefault();
        status.textContent = form.dataset.success + " (Demonstration only: nothing was sent.)";
        form.reset();
      }
    });
  });
})();
