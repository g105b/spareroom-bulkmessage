"use strict";
var
	MAXUSERS = 100,
	x,
	searchForm = document.forms[0],
	filterForm = document.forms[1],
	authForm = document.forms[2],
	w = document.createElement("webview"),
	output = document.querySelector("#output"),
	progress = document.querySelector("progress"),

	page = 1,
	flatshareIdArray = [],
	currentIdIndex = 0,
$$;

w.addEventListener("dialog", function(e) {
	output.value += "\n\nDIALOG: " + e.messageType + "\n"
		+ e.messageText + "\n\n";
	e.dialog.ok("thanks");
});

setInterval(function() {
	output.scrollTop += 100;
}, 100);

chrome.storage.local.get("formData", function(obj) {
	var
		formData = obj.formData,
	$$;

	if(!formData || !formData["message"]) {
		return;
	}
	searchForm["message"].value = formData.message;
	searchForm["type"].value = formData.type;
	searchForm["location"].value = formData.location;
	searchForm["miles"].value = formData.miles;
	searchForm["mincost"].value = formData.mincost;
	searchForm["maxcost"].value = formData.maxcost;

	authForm["email"].value = formData.email;
	authForm["password"].value = formData.password;
});

document.body.appendChild(w);
w.setAttribute("partition", "P" + (+new Date));
w.setAttribute("src", "http://www.spareroom.co.uk");

nextSection();

searchForm.onsubmit = function(e) {
	e.preventDefault();
	nextSection();
}

filterForm.onsubmit = function(e) {
	e.preventDefault();
	nextSection();
}

authForm.onsubmit = function(e) {
	e.preventDefault();
	saveData();
	nextSection();
	authenticate();
}

function saveData() {
	var
		data = {},
	$$;

	data["message"] = searchForm["message"].value;
	data["type"] = searchForm["type"].value;
	data["location"] = searchForm["location"].value;
	data["miles"] = searchForm["miles"].value;
	data["mincost"] = searchForm["mincost"].value;
	data["maxcost"] = searchForm["maxcost"].value;

	data["email"] = authForm["email"].value;
	data["password"] = authForm["password"].value;

	chrome.storage.local.set({formData: data});
}

function authenticate() {
	var
		code = ''
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

	w.executeScript({code: code}, function(r) {
		output.value += "Logging in as " + authForm["email"].value + "\n";
		w.addEventListener("loadstop", authenticate_cb);
	});
}

function authenticate_cb(e) {
	var
		uriName = this.src,
		content = "",
	$$;
	uriName = uriName.substr(this.src.lastIndexOf("/"))
	uriName = uriName.substr(0, uriName.indexOf("."));

	w.executeScript({code: "document.documentElement.innerHTML;"}, function(r) {
		//"window.isLoggedIn = false";
		//"window.isLoggedIn = true";
		if(r[0].indexOf("window.isLoggedIn") === -1) {
			return;
		}

		w.removeEventListener("loadstop", authenticate_cb);

		if(r[0].indexOf("window.isLoggedIn = true") >= 0) {
			// Correct authentication.
			output.value += "Successful log in!\n";

			startSearch();
		}
		else {
			// Incorrect authentication.
			output.value += "Incorrect log in details.\n";
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

function startSearch() {
	var
		searchUri = "http://www.spareroom.co.uk/flatshare/search.pl"
			+"?flatshare_type={SEARCHTYPE}"
			+"&location_type=area"
			+"&search={LOCATION}"
			+"&miles_from_max={MILES}"
			+"&showme_rooms=Y&showme_1beds=Y&showme_buddyup_properties=Y"
			+"&min_rent={MINCOST}"
			+"&max_rent={MAXCOST}"
			+"&per=pcm&no_of_rooms=&min_term=0&max_term=0"
			+"&available_search=N&day_avail=&mon_avail=&year_avail="
			+"&min_age_req=&max_age_req=&min_beds=&max_beds=&keyword="
			+"&searchtype=advanced&editing=&mode=&nmsq_mode="

			+"&rooms_for={ROOMS_FOR}"
			+"&genderfilter={GENDERFILTER}"
			+"&room_types={ROOM_TYPES}"
			+"&keyword={KEYWORD}"
			+"&ensuite={ENSUITE}"
			+"&smoking={SMOKING}"
			+"&parking={PARKING}"

			+"&action=search&templateoveride=&show_results=&submit=",
	$$;

	searchUri = searchUri.replace("{SEARCHTYPE}", searchForm["type"].value);
	searchUri = searchUri.replace("{LOCATION}", searchForm["location"].value);
	searchUri = searchUri.replace("{MILES}", searchForm["miles"].value);
	searchUri = searchUri.replace("{MINCOST}", searchForm["mincost"].value);
	searchUri = searchUri.replace("{MAXCOST}", searchForm["maxcost"].value);

	searchUri = searchUri.replace("{ROOMS_FOR}",
		filterForm["rooms_for"].value);
	searchUri = searchUri.replace("{GENDERFILTER}", 
		filterForm["genderfilter"].value);
	searchUri = searchUri.replace("{ROOM_TYPES}", 
		filterForm["room_types"].value);
	searchUri = searchUri.replace("{KEYWORD}", 
		encodeURI(filterForm["keyword"].value));
	searchUri = searchUri.replace("{ENSUITE}", 
		filterForm["ensuite"].value);
	searchUri = searchUri.replace("{SMOKING}", 
		filterForm["smoking"].value);
	searchUri = searchUri.replace("{PARKING}", 
		filterForm["parking"].value);

	output.value += "Searching using this URI:\n" + searchUri + "\n\n\n\n";

	w.addEventListener("loadstop", startSearch_cb);

	setTimeout(function() {
		w.setAttribute("src", searchUri);
	}, 1000);
}

function startSearch_cb() {
	w.executeScript({code: 'document.documentElement.innerHTML;'}, function(r) {
		var
			numResults = 0,
		$$;

		if(r[0].indexOf('body class="PAGElistings"') < 0) {
			output.value += "Searching...\n";
			return;
		}

		numResults = r[0].match(/([0-9]+)<\/strong> results/);
		if(!numResults) {
			output.value += "No results for your search. Ending.\n\n";
			return;
		}
		output.value += "Search complete. Found "
			+ numResults[1]
			+ " results!\n";

		w.removeEventListener("loadstop", startSearch_cb);

		progress.setAttribute("max", numResults[1] * 2);
		setTimeout(getFlatshareIDs, 1000);
	});
}

function getFlatshareIDs_before() {
	w.removeEventListener("loadstop", getFlatshareIDs_before);
	setTimeout(getFlatshareIDs, 1750);
}

function getFlatshareIDs() {
	w.executeScript({code: ''
		+ 'hrefArray = [];\n'

		+ '[].forEach.call(document.querySelectorAll("a.listing_title"),\n'
		+ 'function(el) {\n'
		+ '  var id = el.href.substr(el.href.indexOf("flatshare_id="));\n'
		+ '  id = id.substring(0, id.indexOf("&"));\n'
		+ '  id = id.substring("flatshare_id=".length);\n'
		+ '  hrefArray.push(id);\n'
		+ '});\n'

		+ '[].forEach.call(document.querySelectorAll("a.tooltip_item"),\n'
		+ 'function(el) {\n'
		+ '  if(el.textContent.trim() == "Contacted") {\n'
		+ '    var id = el.href.substr(el.href.indexOf("flatshare_id="));\n'
		+ '    id = id.substring(0, id.indexOf("&"));\n'
		+ '    id = id.substring("flatshare_id=".length);\n'
		+ '    if(hrefArray.indexOf(id) >= 0) {\n'
		+ '      hrefArray.splice(hrefArray.indexOf(id), 1);\n'
		+ '    }\n'
		+ '  }\n'
		+ '});\n'

		+ '[].forEach.call(document.querySelectorAll("li.listing_result"),\n'
		+ 'function(el) {\n'
		+ '  if(!el.querySelector(".listing_contactable")\n'
		+ '  || el.querySelector(".listing_contactable").textContent.trim() != "Free to Contact" ) {\n'
		+ '    var li = el;\n'
		+ '    var li_href = li.getAttribute("data-href");\n'
		+ '    var id = li_href.substr(li_href.indexOf("flatshare_id="));\n'
		+ '    id = id.substring(0, id.indexOf("&"));\n'
		+ '    id = id.substring("flatshare_id=".length);\n'
		+ '    if(hrefArray.indexOf(id) >= 0) {\n'
		+ '      hrefArray.splice(hrefArray.indexOf(id), 1);\n'
		+ '    }\n'

	+ '  }\n'
		+ '});\n'

		+ 'hrefArray;\n'
	}, function(r) {
		flatshareIdArray = flatshareIdArray.concat(r[0]);
		output.value += r[0].length + " new users found on page " + page + "\n";
		progress.value += 10;
		setTimeout(nextSearchPage, 1000);
	});
}

function nextSearchPage() {
	w.addEventListener("loadstop", getFlatshareIDs_before);

	w.executeScript({code: ''
	+'var numContacted = 0;\n'
	+'[].forEach.call(document.querySelectorAll("a.tooltip_item"),\n'
	+'function(el) {\n'
	+'  if(el.textContent.trim() == "Contacted") {\n'
	+'    numContacted++;\n'
	+'  }\n'
	+'});\n'

	+'if(numContacted>=10) {\n'
	+'  "NO NEW USERS";\n'
	+'}\n'
	+'else {\n'
	+'  document.querySelector("ul.navnext a").click();\n'
	+'}\n'
	},
	function(r) {
		if(r[0] == "NO NEW USERS") {
			output.value += "\n\nAll following users already contacted.\n";
			progress.value = progress.getAttribute("max") / 2;
			output.value += "Sending messages...\n\n";
			w.removeEventListener("loadstop", getFlatshareIDs_before);
			sendMessages();
		}
		else if(flatshareIdArray.length > MAXUSERS) {
			output.value += "\n\nFound max users, stopping search.\n";
			progress.setAttribute("max", flatshareIdArray.length * 2);
			progress.value = progress.getAttribute("max") / 2;
			output.value += "Sending messages...\n\n";
			w.removeEventListener("loadstop", getFlatshareIDs_before);
			output.value += "Message IDs to send: "
				+ flatshareIdArray.toString()
				+ "\n";
			sendMessages();
		}
		else {
			page++;
			output.value += "Moving to page " + page + "...\n";
		}
	});
}

function sendMessages() {
	var
		nextID = flatshareIdArray.shift(),
		url = "http://www.spareroom.co.uk/flatshare/flatmate_detail.pl"
		+"?flatshare_id={ID}"
		+"&mode=contact&submode=byemail"
		,
	$$;

	if(!nextID) {
		output.value += "\n\nSent all messages!\n\n";
		progress.value = progress.getAttribute("max");
		document.getElementById("outputButton").textContent = "DONE!";
		return;
	}

	url = url.replace("{ID}", nextID);
	w.addEventListener("loadstop", send);

	setTimeout(function() {
		w.setAttribute("src", url);
	}, 1000);
}

function send() {
	w.executeScript({
		code: ''
		+ 'var el = document.querySelector("#messagefieldinput textarea");\n'
		+ 'if(el) { el.tagName } else { "NO".toString(); }\n'
	}, function(r) {
		if(r[0].toUpperCase().indexOf("TEXTAREA") >= 0) {
			w.removeEventListener("loadstop", send);
			setTimeout(typeMessage, 2000);
		}
		else {
			console.log(r[0]);
		}
	});
}

function typeMessage() {
	var
		msg = searchForm["message"].value,
	$$;

	while(msg.indexOf(String.fromCharCode(10)) >= 0) {
		msg = msg.replace(String.fromCharCode(10), "\\n");
	}

	w.executeScript({
		code: ''
		// + 'document.documentElement.innerHTML;'
		+ 'var el = document.querySelector("#messagefieldinput textarea");\n'
		+ 'el.value = "'
		+ msg
		+ '";\n'
		// + 'el.tagName;'
		+ 'document.querySelector("#messagefieldinput textarea").value;\n'
	}, function(r) {
		console.log("typeMessage output", r[0]);
		output.value += "Sending message...\n";
		setTimeout(clickSend, 500);
	});
}

function clickSend() {
	w.executeScript({
		code: 'document.forms[0].submit();'
	}, function() {
		output.value += "...message sent!\n";
		progress.value += 1;
		setTimeout(sendMessages, 2000);
	});
}
