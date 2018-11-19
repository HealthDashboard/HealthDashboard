//= include app/assets/javascripts/about.js
//= require about.js

describe("Testing show_email of About", function() {

    beforeAll(function() {

        if (document.getElementById("sandbox") == null) {
            document.body.innerHTML += '<div id="sandbox"></div>';
        }
        
        var sandbox = document.getElementById("sandbox");
        sandbox.innerHTML = '<i id="buttonEmail" class="fas fa-lg fa-envelope-square" onclick="show_email(this)"></i><p id="txtEmail"class="email">nobody@healthdashboard</p>'
    });
    
    afterAll(function() {
        var sandbox = document.getElementById("sandbox");
        sandbox.innerHTML = '';
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
