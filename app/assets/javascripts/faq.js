var currentPos;

function inicialize () {
  var position = $("#type1").offset().left + $("#type1").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  currentPos = 1;
}

function changeFAQ1 () {
  var position = $("#type1").offset().left + $("#type1").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  $("#question-container").css("transform", "translate(0px)");
  currentPos = 1;
}

function changeFAQ2 () {
  var position = $("#type2").offset().left + $("#type2").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  var scroll = $("#viewer").width();
  $("#question-container").css("transform", "translate(-" + scroll + "px)");
  currentPos = 2;
}

function changeFAQ3 () {
  var position = $("#type3").offset().left + $("#type3").width()/2 - 37;
  $("#triangle").css("transform", "translate(" + position + "px)");
  var scroll = $("#viewer").width();
  $("#question-container").css("transform", "translate(-" + scroll*2 + "px)");
  currentPos = 3;
}

function jump(h){
    var url = location.href;
    location.href = "#"+h;
    history.replaceState(null,null,url);
}

function faq() {
  location.href = "/faq";
}
