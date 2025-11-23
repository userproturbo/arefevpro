const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const form = document.querySelector('.cta__form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    if (!email) return;
    alert(`Спасибо! Мы свяжемся с вами по адресу ${email}.`);
    form.reset();
  });
}
