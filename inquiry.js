(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const radios = [...form.querySelectorAll('input[type="radio"][name="plan"]')];
  const choices = {essential:"Website Essentials ($750)",lifetime:"Website + Lifetime Support ($1500)","event-page":"Event Page ($150 + $15/mo)","event-site":"Event Site ($250 + $20/mo)"};
  const choice = new URLSearchParams(location.search).get("package");
  if (Object.prototype.hasOwnProperty.call(choices,choice)) radios.forEach(radio => { radio.checked = radio.value === choices[choice]; });
  // Phone fields show (606) 555-0123 as digits are typed; a leading 1 or +1 is dropped.
  const formatPhone = value => {
    let digits = value.replace(/\D/g,"");
    if (digits.length > 10 && digits.startsWith("1")) digits = digits.slice(1);
    digits = digits.slice(0,10);
    if (digits.length < 4) return digits.length ? "(" + digits : "";
    if (digits.length < 7) return "(" + digits.slice(0,3) + ") " + digits.slice(3);
    return "(" + digits.slice(0,3) + ") " + digits.slice(3,6) + "-" + digits.slice(6);
  };
  form.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener("input",event => {
      if (event.inputType && event.inputType.startsWith("delete")) return;
      input.value = formatPhone(input.value);
    });
    input.addEventListener("blur",() => { input.value = formatPhone(input.value); });
  });
  const button = form.querySelector('[type="submit"]');
  const feedback = document.getElementById("inquiry-feedback");
  let submitting = false;
  form.addEventListener("submit",async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting=true;
    button.disabled=true;
    button.textContent="Sending your idea…";
    form.setAttribute("aria-busy","true");
    feedback.hidden=true;
    try {
      const response = await fetch(form.action,{
        method:"POST",
        headers:{"Accept":"application/json","Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:new URLSearchParams(new FormData(form)),
      });
      const result = await response.json();
      if (!response.ok || !result.accepted) throw new Error(result.message || "Your inquiry couldn’t be submitted. Please try again later.");
      const submitted = new FormData(form);
      form.reset();
      form.dispatchEvent(new CustomEvent("inquiry:sent",{detail:{fields:submitted}}));
      feedback.dataset.state="success";
      const heading=document.createElement("strong");
      heading.textContent="A little idea. A great beginning.";
      const detail=document.createElement("p");
      detail.textContent=result.message;
      feedback.replaceChildren(heading,detail);
      button.textContent="Send another inquiry ↗";
    } catch (error) {
      feedback.dataset.state="error";
      const heading=document.createElement("strong");
      heading.textContent="Let’s try that again.";
      const detail=document.createElement("p");
      detail.textContent=(error instanceof TypeError || error instanceof SyntaxError) ? "We couldn’t confirm your submission. Your message is still here. Check your connection or email hello@tlt-studios.com." : error.message;
      feedback.replaceChildren(heading,detail);
      button.textContent="Try sending again ↗";
    } finally {
      submitting=false;
      button.disabled=false;
      form.removeAttribute("aria-busy");
      feedback.hidden=false;
      feedback.focus({preventScroll:true});
      feedback.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
    }
  });
})();
