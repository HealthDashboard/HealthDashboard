//= include app/assets/javascripts/about.js
//= require about.js

describe("Testing show_email of About", function() {

    beforeAll(function() {
        html = '<i id="buttonEmail" class="fas fa-lg fa-envelope-square" onclick="show_email(this)"></i><p id="txtEmail"class="email">dciriaco@ime.usp.br</p>'
        document.body.innerHTML += html;
    });

    beforeEach(function() {
        document.getElementById("buttonEmail").onclick();
    });

    it("testing one click", function() {
        result = document.getElementById("txtEmail").style.display;
        expect(result).toBe("block");
      });

      it("testing two clickes", function() {
        result = document.getElementById("txtEmail").style.display;
        expect(result).toBe("none");
      });

      it("testing three clickes", function() {
        result = document.getElementById("txtEmail").style.display;
        expect(result).toBe("block");
      });

});
