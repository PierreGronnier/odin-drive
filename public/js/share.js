function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  
  try {
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Link copied!');
  } catch (err) {
    document.body.removeChild(input);
    alert('Please copy manually: ' + text);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      copyToClipboard(this.getAttribute('data-copy'));
    });
  });
  
  document.querySelectorAll('.share-link-input').forEach(input => {
    input.addEventListener('click', function() {
      this.select();
    });
  });
});