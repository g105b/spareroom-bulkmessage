"use strict";
var
	x,
	searchForm = document.forms[0],
	authForm = document.forms[1],
	w = document.createElement("webview"),
	output = document.querySelector("#output"),
$$;

document.body.appendChild(w);
w.setAttribute("partition", "P" + (+new Date));
w.setAttribute("src", "http://www.spareroom.co.uk");

nextSection();

searchForm.onsubmit = function(e) {
	e.preventDefault();
	nextSection();
}

authForm.onsubmit = function(e) {
	e.preventDefault();
	nextSection();
	authenticate();
}

function authenticate() {
	var
		code = ''
		+ 'document.documentElement.innerHTML;\n'
		+ 'if(!document.querySelector(".login_box_menu")) {\n'
		+ 'document.querySelector(".login_box_button_text").click();\n'
		+ 'document.querySelector("#loginemail").click();\n'
		+ 'document.querySelector("#loginemail").value = "{EMAIL}";\n'
		+ 'document.querySelector("#loginpass").value = "{PASSWORD}";\n'
		+ 'document.querySelector("#loginbutton_popUpBox").click();\n'
		+ '}',
	$$;

	code = code.replace("{EMAIL}", authForm["email"].value);
	code = code.replace("{PASSWORD}", authForm["password"].value);

	output.value += "Logging in as " + authForm["email"].value + "\n";

	w.executeScript({code: code}, function(r) {
		console.log(r[0]);
		w.addEventListener("loadstop", authenticate_cb);
	});
}

function authenticate_cb(e) {

	// w.removeEventListener("loadstop", authenticate_cb);
	console.log(this.src);
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