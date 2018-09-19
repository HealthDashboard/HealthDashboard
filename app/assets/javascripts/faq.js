function changeFAQ1 () {
  var position = $("#type1").offset().left + $("#type1").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  $("#question-container").css("transform", "translate(0px)");

}

function changeFAQ2 () {
  var position = $("#type2").offset().left + $("#type2").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  var scroll = $("#viewer").width();
  $("#question-container").css("transform", "translate(-" + scroll + "px)");
  console.log(scroll)
}

function changeFAQ3 () {
  var position = $("#type3").offset().left + $("#type3").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  var scroll = $("#viewer").width();
  $("#question-container").css("transform", "translate(-" + scroll*2 + "px)");
}
