var slideIndex = 1;
var timeout;

function getDataHomePage() {
  $.getJSON("procedure/proceduresTotal", function(count) {
    count = count.toLocaleString('pt-BR');
    $("#procedure-data").html(count);
  });

  $.getJSON("/health_centre_count", function(count) {
    $("#hospital-data").html(count.toLocaleString('pt-BR'));
  });

  $.getJSON("/total_distance_average", function(average) {
    average = average.toLocaleString('pt-BR');
    $("#spec-data").html("9"); // should get this number
    $("#desloc-data").html(average + " Km");
  });
}

function plusDivs(n) {
  slideIndex += n
  showDivs();
}

function showDivs() {
  clearTimeout(timeout);
  var i;
  var x = document.getElementsByClassName("slider-img");
  if (slideIndex > x.length) {
    slideIndex = 1
  }
  if (slideIndex < 1) {
    slideIndex = x.length
  }
  for (i = 0; i < x.length; i++) {
    $(x[i]).removeClass("active");
    $(x[i]).removeClass("right");
    $(x[i]).removeClass("left");
  }
  $(x[slideIndex-1]).addClass("active");
  if (slideIndex == 1) {
    $(x[x.length - 1]).addClass("right");
  }
  else {
    $(x[slideIndex-2]).addClass("right");
  }
  if (slideIndex == x.length) {
    $(x[0]).addClass("left");
  }
  else {
    $(x[slideIndex]).addClass("left");
  }
  timeout = setTimeout(function() { plusDivs(-1) }, 5000);
}
