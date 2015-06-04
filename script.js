var
	webview = document.getElementById("web"),
	form = document.forms[0],
$$;

nextSection();

form.onsubmit = function(e) {
	e.preventDefault();
	nextSection();
	chrome.app.window.create('login.html', {
		'bounds': {
			'width': 960,
			'height': 500
		}
	});
}

function nextSection() {
	var
		on = document.querySelector("section.on"),
		next,
	$$;

	if(on) {
		next = on.nextElementSibling;
	}
	else {
		next = document.querySelector("section");
	}

	on && on.classList.remove("on");
	next.classList.add("on");
}