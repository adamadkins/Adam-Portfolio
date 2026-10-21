(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const select = document.getElementById("contact-type");
  const choices = {essential:"Website Essentials ($750)",lifetime:"Website + Lifetime Support ($1500)"};
  const choice = new URLSearchParams(location.search).get("package");
  if (select && Object.prototype.hasOwnProperty.call(choices,choice)) select.value=choices[choice];
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
      form.reset();
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
