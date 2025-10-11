document.addEventListener('DOMContentLoaded', function () {
  var bookBtn = document.getElementById('bookBtn');
  var checkinBtn = document.getElementById('checkinBtn');
  var overlay = document.getElementById('overlay');
  var overlayText = document.getElementById('overlay-text');
  var overlayCloseBtn = document.getElementById('overlayCloseBtn');

  if (bookBtn) {
    // Anchor has href fallback; JS ensures smooth navigation
    bookBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.assign('booking.html');
    });
  }

  if (checkinBtn) {
    checkinBtn.addEventListener('click', function () {
      overlay.classList.remove('hidden');
      overlayText.innerText = 'Check-in time is from 2:00 PM. Check-out is by 11:00 AM. We look forward to welcoming you!';
    });
  }

  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener('click', function () {
      overlay.classList.add('hidden');
    });
  }
});