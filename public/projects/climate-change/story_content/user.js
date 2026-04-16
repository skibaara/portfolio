window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
var getKeyDown = player.getKeyDown;
var keydown = player.keydown;
var keyup = player.keyup;
window.Script1 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script2 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script3 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script4 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script5 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script6 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script7 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script8 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script9 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script10 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script11 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script12 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script13 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script14 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script15 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script16 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script17 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script18 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script19 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script20 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script21 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script22 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script23 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script24 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script25 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script26 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script27 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script28 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script29 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script30 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script31 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script32 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script33 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script34 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script35 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script36 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script37 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script38 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script39 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script40 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script41 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script42 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script43 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script44 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script45 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script46 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script47 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script48 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script49 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script50 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script51 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script52 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script53 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script54 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script55 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script56 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script57 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script58 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script59 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script60 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script61 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script62 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script63 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script64 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script65 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script66 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script67 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script68 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script69 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script70 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script71 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script72 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script73 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script74 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script75 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script76 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script77 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script78 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script79 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script80 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script81 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script82 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script83 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script84 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script85 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script86 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script87 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script88 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script89 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script90 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script91 = function()
{
  // Get the Storyline player object
var player = GetPlayer();

// Get the current value from the slider and make sure it's numeric
var sliderValue = Number(player.GetVar("Slider1"));

// Update the Fahrenheit variable
player.SetVar("FehrenheitDegree", sliderValue);

var livingFeh = sliderValue + 12;
var kitchenFeh = sliderValue + 15;
var upstairsFeh = sliderValue + 25;
// Set livingFehrn to match the Fahrenheit degree
player.SetVar("livingFehrn", livingFeh);
player.SetVar("kitchenFeh", kitchenFeh);
player.SetVar("upstairsFeh", upstairsFeh);

// Convert Fahrenheit to Celsius
var livinCel = ((sliderValue + 12) - 32) * (5/9);
var CelDeg = (sliderValue - 32) * (5/9);
var kitchenCel = ((sliderValue + 15) - 32) * (5/9);
var upstairsCel = ((sliderValue + 25) - 32) * (5/9);


// Update the Celsius variable in Storyline
player.SetVar("livinCel", livinCel.toFixed(0)); // keep one decimal
player.SetVar("CelDeg", CelDeg.toFixed(0)); // keep one decimal
player.SetVar("kitchenCel", kitchenCel.toFixed(0)); // keep one decimal
player.SetVar("upstairsCel", upstairsCel.toFixed(0)); // keep one decimal

}

window.Script92 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script93 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script94 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script95 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script96 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script97 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script98 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script99 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script100 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script101 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script102 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script103 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script104 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script105 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script106 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script107 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script108 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script109 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script110 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script111 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script112 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script113 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script114 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script115 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script116 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script117 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script118 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script119 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script120 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script121 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Making Sense of Climate Change for Better Response";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script122 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script123 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script124 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script125 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script126 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script127 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script128 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script129 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script130 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script131 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script132 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script133 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script134 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script135 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script136 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script137 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script138 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script139 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script140 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script141 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	let trackingContext = contextInfo ? contextInfo.data : null;
	let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	if (trackingContext) {
		if (trackingContext.display_name) {
			learnerName = trackingContext.display_name;
		}
		if (trackingContext.email) {
			learnerEmail = trackingContext.email;
		}
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	if (wordPressContext && wordPressContext.userId) {
		userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	}

	if (
		trackingContext &&
		typeof trackingContext.user_id !== "undefined" &&
		trackingContext.user_id !== null
	) {
		userID = String(trackingContext.user_id);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		wpUserId:
			wordPressContext && wordPressContext.userId
				? wordPressContext.userId
				: null,
		wpCourseId:
			wordPressContext && wordPressContext.courseId
				? wordPressContext.courseId
				: null,
		wpDisplayName:
			wordPressContext && wordPressContext.displayName
				? wordPressContext.displayName
				: null,
		wpEmail:
			wordPressContext && wordPressContext.email
				? wordPressContext.email
				: null,
		wpPageUrl:
			wordPressContext && wordPressContext.pageUrl
				? wordPressContext.pageUrl
				: null,
		wpLoggedIn:
			wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
				? wordPressContext.loggedIn
				: null,
		wpContextSource: wordPressContext
			? wordPressContext.source
			: contextSource || null,
		wpContextTimestamp:
			wordPressContext && wordPressContext.timestamp
				? wordPressContext.timestamp
				: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script142 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script143 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script144 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script145 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script146 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script147 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script148 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script149 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script150 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script151 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script152 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script153 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script154 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script155 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script156 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script157 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script158 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script159 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script160 = function()
{
  (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	//============================================================================================

	// NEW CODE (Ken): --------wordpress code starts here

	//============================================================================================

	// var wordPressContext = getWordPressContext(); // NEW CODE (Ken): central helper for WP fields.
	// let contextInfo = resolveTrackingContext(); // Keep for backwards compatibility.
	// let trackingContext = contextInfo ? contextInfo.data : null;
	// let contextSource = contextInfo ? contextInfo.source : null;

	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// if (trackingContext) {
	// 	if (trackingContext.display_name) {
	// 		learnerName = trackingContext.display_name;
	// 	}
	// 	if (trackingContext.email) {
	// 		learnerEmail = trackingContext.email;
	// 	}
	// }

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	//============================================================================================

	// NEW CODE (Ken): wordpress code --- Override SCORM userID with WordPress user ID if available.=

	//==============================================================================================

	// if (wordPressContext && wordPressContext.userId) {
	// 	userID = String(wordPressContext.userId); // NEW CODE (Ken): override SCORM ID with WP user ID.
	// }

	// if (
	// 	trackingContext &&
	// 	typeof trackingContext.user_id !== "undefined" &&
	// 	trackingContext.user_id !== null
	// ) {
	// 	userID = String(trackingContext.user_id);
	// }

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
		//============================================================================================

		// NEW CODE (Ken): WordPress context injected via SCORM Tracking Context plugin.

		//============================================================================================

		// wpUserId:
		// 	wordPressContext && wordPressContext.userId
		// 		? wordPressContext.userId
		// 		: null,
		// wpCourseId:
		// 	wordPressContext && wordPressContext.courseId
		// 		? wordPressContext.courseId
		// 		: null,
		// wpDisplayName:
		// 	wordPressContext && wordPressContext.displayName
		// 		? wordPressContext.displayName
		// 		: null,
		// wpEmail:
		// 	wordPressContext && wordPressContext.email
		// 		? wordPressContext.email
		// 		: null,
		// wpPageUrl:
		// 	wordPressContext && wordPressContext.pageUrl
		// 		? wordPressContext.pageUrl
		// 		: null,
		// wpLoggedIn:
		// 	wordPressContext && typeof wordPressContext.loggedIn !== "undefined"
		// 		? wordPressContext.loggedIn
		// 		: null,
		// wpContextSource: wordPressContext
		// 	? wordPressContext.source
		// 	: contextSource || null,
		// wpContextTimestamp:
		// 	wordPressContext && wordPressContext.timestamp
		// 		? wordPressContext.timestamp
		// 		: null,
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();

}

window.Script161 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script162 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script163 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script164 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script165 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script166 = function()
{
  var player = GetPlayer();

// إزالة أي listener قديم (احتياطي)
if (window.handleVisibilityChange) {
    document.removeEventListener(
        "visibilitychange",
        window.handleVisibilityChange
    );
}

// Reset القيم
window.activeTime = 0;           // الوقت المحسوب (ms)
window.lastActiveStart = null;   // آخر وقت Active

// تعريف الفانكشن Global
window.handleVisibilityChange = function () {
    if (document.visibilityState === "visible") {
        window.lastActiveStart = Date.now();
    } else {
        if (window.lastActiveStart !== null) {
            window.activeTime += Date.now() - window.lastActiveStart;
            window.lastActiveStart = null;
        }
    }
};

// بداية الشريحة (لو التاب Active)
if (document.visibilityState === "visible") {
    window.lastActiveStart = Date.now();
}

// تشغيل المراقبة
document.addEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);
}

window.Script167 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script168 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

window.Script169 = function()
{
  var player = GetPlayer();

// إنهاء آخر Session Active
if (window.lastActiveStart !== null) {
    window.activeTime += Date.now() - window.lastActiveStart;
    window.lastActiveStart = null;
}

// تحويل من ms إلى seconds
var timeSpentSeconds = Math.round(window.activeTime / 1000);

// إرسال القيمة لـ Storyline
player.SetVar("SlideDuration", timeSpentSeconds);

// إيقاف المراقبة
document.removeEventListener(
    "visibilitychange",
    window.handleVisibilityChange
);

}

window.Script170 = function()
{
    (function () {
	// ---------- 0) تهيئة المتغيرات الأساسية ----------
	let player = null;
	let learnerName = "Unknown";
	let learnerEmail = "Unknown";
	
	try {
		player = GetPlayer();
		if (!player) {
			console.error("GetPlayer() returned null or undefined");
		}
	} catch (e) {
		console.error("Error getting player:", e);
	}

	// ---------- 1) الحصول على اسم المستخدم من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentName) {
			let getLearnerName = lmsAPI.GetStudentName();
			if (getLearnerName && typeof getLearnerName === "string") {
				let array = getLearnerName.split(",");
				if (array.length >= 2) {
					// إذا كان الاسم بالتنسيق: العائلي, الشخصي
					learnerName = (array[1].trim() + " " + array[0].trim()).trim();
				} else {
					// إذا كان الاسم بتنسيق مختلف
					learnerName = getLearnerName.trim();
				}
			}
		} else {
			console.warn("lmsAPI.GetStudentName is not available");
		}
	} catch (e) {
		console.error("Error getting learner name:", e);
		learnerName = "ErrorGettingName";
	}

	// ---------- 2) الحصول على البريد الإلكتروني من LMS ----------
	try {
		if (typeof lmsAPI !== "undefined" && lmsAPI.GetStudentID) {
			let email = lmsAPI.GetStudentID();
			if (email && typeof email === "string") {
				learnerEmail = email.trim();
			}
		} else {
			console.warn("lmsAPI.GetStudentID is not available");
		}
	} catch (e) {
		console.error("Error getting learner email:", e);
		learnerEmail = "ErrorGettingEmail";
	}

	// ---------- 3) البحث عن SCORM API ----------
	function findAPI(win) {
		if (!win) return null;
		try {
			if (typeof win.API !== "undefined")
				return { api: win.API, version: "1.2" };
			if (typeof win.API_1484_11 !== "undefined")
				return { api: win.API_1484_11, version: "2004" };
		} catch (e) {
			return null;
		}
		return null;
	}

	function getAPI() {
		let w = window;
		let apiObj = null;
		let searchFrames = [w, w.parent, w.top, w.parent.parent, w.opener];
		for (let i = 0; i < searchFrames.length; i++) {
			try {
				apiObj = findAPI(searchFrames[i]);
				if (apiObj) return apiObj;
			} catch (e) {}
		}
		return null;
	}

	let apiInfo = getAPI();
	let api = apiInfo ? apiInfo.api : null;
	let scormVersion = apiInfo ? apiInfo.version : null;

	function scormGet(name) {
		try {
			if (!api) return "";
			if (scormVersion === "2004") {
				return api.GetValue(name) || "";
			} else {
				return api.LMSGetValue(name) || "";
			}
		} catch (e) {
			return "";
		}
	}

	// ---------- 4) الحصول على user ID من SCORM ----------
	let userID = "UnknownUserID";
	try {
		let scormID = scormGet("cmi.learner_id") || scormGet("cmi.core.student_id");
		if (scormID && scormID.trim() !== "") {
			userID = scormID.trim();
		}
	} catch (e) {
		console.error("Error getting user ID from SCORM:", e);
	}

	// ---------- 5) الحصول على بيانات السؤال ----------
	let lessonName = "";
	let slideName = "";
	let eventType = "";
	let interactionID = "";
	let questionText = "";
	let learnerResponse = "";
	let correctAnswer = "";
	let result = "";
	let attempts = "";
	let courseName = "Making Sense of Climate Change for Better Response";
	let slideDuration = "0";

	try {
		if (player) {
			interactionID = player.GetVar("InteractionID") || "";
			questionText = player.GetVar("QuestionText") || "";
			correctAnswer = player.GetVar("CorrectAnswer") || "";
			learnerResponse = player.GetVar("LearnerResponse") || "";
			result = player.GetVar("Result") || "";
			attempts = player.GetVar("Attempt") || "";
			eventType = player.GetVar("EventType") || "";
			slideName = player.GetVar("SlideName") || "";
			lessonName = player.GetVar("LessonName") || "";
			courseName = "Achieving Financial Wellbeing";
			slideDuration = player.GetVar("SlideDuration") || "";
			console.log("working");
		} else {
			console.error("Player is not available for getting question data");
		}
	} catch (e) {
		console.error("Error getting question data:", e);
	}

	let timestamp = new Date().toISOString();

	// ---------- 6) بناء البيانات المرسلة ----------
	let payload = {
		// بيانات المستخدم
		userID: userID,
		learnerName: learnerName,
		learnerEmail: learnerEmail,

		// بيانات السؤال
		interactionID: interactionID,
		correctAnswer: correctAnswer,
		questionText: questionText,
		learnerResponse: learnerResponse,
		Result: result,
		attempts: attempts,
		eventType: eventType,
		slideName: slideName,
		timestamp: timestamp,
		courseName: courseName,
		lessonName: lessonName,
		slideDuration: slideDuration,

		// معلومات إضافية للتتبع
		scormVersion: scormVersion,
		hasAPI: api ? "Yes" : "No",
		hasLMSAPI: typeof lmsAPI !== "undefined" ? "Yes" : "No",
	};

	// ---------- 7) إرسال البيانات إلى Google Sheet ----------
	let url =
		"https://script.google.com/macros/s/AKfycbyopzBurszTk_YAdFz2J0ZDC8QH25IOtb5_4y1DjdlYm6A_7MKfl4LIV2Yqwh-tfMBl/exec";

	try {
		console.log("Sending data to Google Sheet:", payload);

		fetch(url, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(() => {
				console.log("Data sent successfully to Google Sheet");
			})
			.catch((err) => {
				console.error("Network error while sending data:", err);
			});
	} catch (e) {
		console.error("Fetch error:", e);
	}

	// ---------- 8) إرجاع البيانات (اختياري للتحقق) ----------
	return {
		success: true,
		message: "Data processed successfully",
		data: payload,
	};
})();
}

};
