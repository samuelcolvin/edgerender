function set_theme(dark) {
  if (dark) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
  localStorage.dark = JSON.stringify(dark)
}

if (localStorage.dark) {
  set_theme(JSON.parse(localStorage.dark))
} else {
  set_theme(matchMedia('(prefers-color-scheme: dark)').matches)
}

document.getElementById('slider').onclick = () => {
  set_theme(!document.body.classList.contains('dark'))
}
