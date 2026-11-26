/* Enquiry form.
   If the form has a data-endpoint (a form service such as Formspree), the enquiry is sent there.
   Without one, the visitor's email app opens with their details filled in, so it always works. */
(function () {
  "use strict";
  var form = document.getElementById("enquiry");
  if (!form) return;
  var status = document.getElementById("form-status");
  var to = form.getAttribute("data-email");

  function say(text, ok) {
    status.textContent = text;
    status.className = "form-status " + (ok ? "ok" : "err");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website && form.website.value) return; // spam trap: people never fill this in
    var data = new FormData(form);
    var name = (data.get("name") || "").trim();
    var email = (data.get("email") || "").trim();
    var business = (data.get("business") || "").trim();
    if (!name || !email || !business) { say("Please fill in your name, business and email.", false); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say("That email address does not look quite right.", false); return; }

    var endpoint = form.getAttribute("data-endpoint");
    if (endpoint) {
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          say("Thanks, " + name + ". Your enquiry has arrived and you will hear back within one working day.", true);
        })
        .catch(function () { say("Sorry, that did not send. Please email " + to + " instead.", false); })
        .then(function () { button.disabled = false; });
      return;
    }

    var body = [
      "Name: " + name,
      "Business: " + business,
      "Email: " + email,
      "Phone: " + ((data.get("phone") || "").trim() || "not given"),
      "",
      (data.get("message") || "").trim(),
    ].join("\n");
    window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Website preview request: " + business) +
      "&body=" + encodeURIComponent(body);
    say("Your email app should open with your details filled in. Just press send.", true);
  });
})();
