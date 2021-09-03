'use strict';

var
	_ = require('underscore'),
	moment = require('moment'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

	ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js'),
	
	Ajax = require('modules/%ModuleName%/js/Ajax.js'),

	EventsOverlapUtils = {}
;

EventsOverlapUtils.getCheckParameters = function (oEventData)
{
	var
		sBrowserTimezone = moment.tz.guess(),
		sServerTimezone = UserSettings.timezone(),
		oStart = moment.tz(oEventData.start.format('YYYY-MM-DD HH:mm:ss'), sServerTimezone || sBrowserTimezone),
		oEnd = moment.tz(oEventData.end.format('YYYY-MM-DD HH:mm:ss'), sServerTimezone || sBrowserTimezone)
	;

	if (oEventData.allDay) {
		oStart.hour(0).minute(0).second(0).millisecond(0);
		oEnd.hour(23).minute(59).second(59).millisecond(0);
	}

	return {
		id: oEventData.id,
		uid: oEventData.uid,
		calendarId: oEventData.calendarId,
		allDay: oEventData.allDay ? 1 : 0,
		owner: oEventData.owner,
		start: oStart.format(),
		end: oEnd.format(),
		startTS: oStart.unix(),
		endTS: oEnd.unix()
	};
};

EventsOverlapUtils.check = function (oParameters, bNewEvent, fContinueCallback, fRevertCallback)
{
	Ajax.send('CheckIfHasEventOverlap', oParameters, function (oResponse) {
		if (oResponse && oResponse.Result === true) {
			var sOverlapConfirm = bNewEvent
					? TextUtils.i18n('%MODULENAME%/CONFIRM_CREATE_EVENT_OVERLAP')
					: TextUtils.i18n('%MODULENAME%/CONFIRM_UPDATE_EVENT_OVERLAP');
			Popups.showPopup(ConfirmPopup, [sOverlapConfirm, function (bContinue) {
				if (bContinue) {
					fContinueCallback();
				} else if (_.isFunction(fRevertCallback)) {
					fRevertCallback();
				}
			}.bind(this)]);
		} else {
			fContinueCallback();
		}
	}, this);
};

module.exports = EventsOverlapUtils;
