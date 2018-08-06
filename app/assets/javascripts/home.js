var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("slider-img");
  if (n > x.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = x.length
  }
  for (i = 0; i < x.length; i++) {
    $(x[i]).removeClass("active");
    $(x[i]).removeClass("right");
    $(x[i]).removeClass("left");
  }
  $(x[slideIndex-1]).addClass("active");
  if (slideIndex == 1) {
    $(x[3]).addClass("right");
  }
  else {
    $(x[slideIndex-2]).addClass("right");
  }
  if (slideIndex == 4) {
    $(x[0]).addClass("left");
  }
  else {
    $(x[slideIndex]).addClass("left");
  }
}
