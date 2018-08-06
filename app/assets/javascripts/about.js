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

function scroll_left() {
  var elem = document.getElementById("membros-container")
  var current = elem.scrollLeft - 270;
  $("#membros-container").animate({scrollLeft: current}, 200);
}

function scroll_right() {
  var elem = document.getElementById("membros-container")
  var current = elem.scrollLeft + 270;
  $("#membros-container").animate({scrollLeft: current}, 200);
}
