function show_email(e) {
  var elem = e.nextElementSibling;
  if (elem.style.display === "block"){
    elem.style.display = "none";
    elem = elem.nextElementSibling
    while (elem) {
      elem.style.display = "block";
      elem = elem.nextElementSibling;
    }
  }
  else {
    elem.style.display = "block";
    elem = elem.nextElementSibling
    while (elem) {
      elem.style.display = "none";
      elem = elem.nextElementSibling;
    }
  }
}
