//= require jquery
//= require dashboard.js
describe("Tests for filters_show() method", function() {

    beforeAll(function() {
		
		if (document.getElementById("sandbox") == null) {
			document.body.innerHTML += '<div id="sandbox"></div>';
		}
		
		var sandbox = document.getElementById("sandbox");
		sandbox.innerHTML = '<div id="filters-text"></div>'
    });
	
	afterAll(function() {
		var sandbox = document.getElementById("sandbox");
		sandbox.innerHTML = '';
	});

    it("All filters null", function() {
        // Prepare
        filters_text = [];
        genders = [];
        start_date = null;
        end_date = null;
        dist_min = null;
        dist_max = null;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><br>");
    });

	it("Filter with health center", function() {
        // Prepare
        filters_text = ['EstabelecimentoDummy'];
        genders = [];
        start_date = null;
        end_date = null;
        dist_min = null;
        dist_max = null;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><strong>Estabelecimento de ocorrência: </strong>EstabelecimentoDummy<br><br>");
    });
	
	it("Filter with competence", function() {
        // Prepare
        filters_text = [null,'201812'];
        genders = [];
        start_date = null;
        end_date = null;
        dist_min = null;
        dist_max = null;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><strong>Competência (aaaamm): </strong>201812<br><br>");
    });
	
	it("Filter with gender", function() {
        // Prepare
        filters_text = [];
        genders = ['Masculino', 'Feminino'];
        start_date = null;
        end_date = null;
        dist_min = null;
        dist_max = null;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><strong>Sexo:</strong> Masculino, Feminino<br><br>");
    });
	
	it("Filter with dates", function() {
        // Prepare
        filters_text = [];
        genders = [];
        start_date = '2018/01/01';
        end_date = '2018/12/31';
        dist_min = null;
        dist_max = null;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><strong>Data mínima:</strong> 2018/01/01<br><strong>Data máxima:</strong> 2018/12/31<br><br>");
    });
	
	it("Filter with distances", function() {
        // Prepare
        filters_text = [];
        genders = [];
        start_date = null;
        end_date = null;
        dist_min = 1;
        dist_max = 42;

        // Execute
        filters_show();

        // Verify
		var filtersText = document.getElementById("filters-text");
        expect(filtersText.innerHTML).toBe("<br><strong>Distância mínima:</strong> 1<br><strong>Distância máxima:</strong> 42<br><br>");
    });
	
});
