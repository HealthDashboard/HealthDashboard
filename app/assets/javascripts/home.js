var slideIndex = 1;
showDivs(slideIndex);
getData();

function getData() {
  $.getJSON("/distance_metric.json", data, function(result) {
    sum = 0;
    $.each(result,function(key, value) {
        sum += parseInt(value, 10);
    });
    sum = sum.toLocaleString('pt-BR');
    $("#procedure-data").html(sum);
  });
  $.getJSON("/points", data, function(result) {
    $("#hospital-data").html(result.length);
  });
  $.getJSON("/specialties_procedure_distance_average", data, function(result) {
    distances = Object.values(result);
    nspec = distances.length;
    med = 0;
    for (var i = 0; i < nspec; i++) {
      med += distances[i];
    }
   med = med/nspec;
   med = Math.round(med * 100) / 100;
   med = med.toLocaleString('pt-BR');
   $("#spec-data").html(nspec);
   $("#desloc-data").html(med + " km");
  });
}

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
