// ============== НАСТРОЙКИ ==============
const FORMSUBMIT_EMAIL = 'promvent.perm@gmail.com'; // ← УКАЖИ СВОЮ ПОЧТУ

// ============== INIT AOS ==============
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80
    });
  }
});

// ============== MODAL ==============
function openModal() {
  document.getElementById('modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ============== SCROLL TO FORM ==============
function scrollToForm() {
  document.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeModal();
}

// ============== FAQ ==============
function toggleFaq(el) {
  const item = el.parentElement;
  const isActive = item.classList.contains('active');
  // Закрыть все остальные (аккордеон)
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
  if (!isActive) item.classList.add('active');
}

// ============== FORM SUBMIT ==============
async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Отправка...';
  btn.disabled = true;

  // Honeypot проверка
  const honey = form.querySelector('[name="_honey"]');
  if (honey?.value) {
    setTimeout(() => {
      alert('✅ Спасибо! Ваша заявка принята.');
      form.reset();
      btn.innerHTML = originalContent;
      btn.disabled = false;
      closeModal();
    }, 600);
    return;
  }

  // Собираем данные БЕЗ honeypot-поля
  const formData = new FormData(form);
  formData.delete('_honey'); // ← ВАЖНО: убираем, чтобы не конфликтовать с FormSubmit

  formData.append('_subject', '🔔 Новая заявка с сайта КлиматПрофи');
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');
  formData.append('Источник', document.title);
  formData.append('Дата', new Date().toLocaleString('ru-RU'));

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    // Пытаемся прочитать JSON, но не падаем если его нет
    let json = {};
    try { json = await res.json(); } catch (_) {}

    // Считаем успехом ЛЮБОЙ 2xx ответ — это надёжнее, чем смотреть на json.success
    if (res.ok) {
      alert('✅ Спасибо! Ваша заявка принята.\nМы перезвоним вам в течение 15 минут.');
      form.reset();
      closeModal();
    } else {
      console.error('FormSubmit response:', res.status, json);
      alert('⚠️ Не удалось отправить заявку. Позвоните нам по телефону.');
    }
  } catch (err) {
    console.error(err);
    alert('⚠️ Ошибка отправки. Проверьте интернет или позвоните нам.');
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
}

// ============== PHONE MASK ==============
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', function(e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    e.target.value = !x[2] ? x[1]
      : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
  });
});

// ============== HEADER SCROLL EFFECT ==============
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');

  if (window.scrollY > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
});

// ============== BACK TO TOP ==============
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============== BURGER MENU (mobile) ==============
const burger = document.getElementById('burger');
const contactBlock = document.querySelector('.contact-block');
if (burger) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    contactBlock.classList.toggle('mobile-open');
  });
}

// ============== SMOOTH ANCHOR SCROLL ==============
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Закрыть мобильное меню
        if (burger && burger.classList.contains('active')) {
          burger.classList.remove('active');
          contactBlock.classList.remove('mobile-open');
        }
      }
    }
  });
});
