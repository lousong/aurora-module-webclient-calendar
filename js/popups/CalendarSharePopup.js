'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	Utils = require('%PathToCoreWebclientModule%/js/utils/Common.js'),
	AddressUtils = require('%PathToCoreWebclientModule%/js/utils/Address.js'),

	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),
	AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js'),
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js')
;


/**
 * @constructor
 */
function CCalendarSharePopup()
{
	CAbstractPopup.call(this);
	
	this.guestsDom = ko.observable();
	this.guestsDom.subscribe(function (a) {
		this.initInputosaurus(this.guestsDom, this.guests, this.guestsLock);
	}, this);
	this.ownersDom = ko.observable();
	this.ownersDom.subscribe(function () {
		this.initInputosaurus(this.ownersDom, this.owners, this.ownersLock);
	}, this);

	this.guestsLock = ko.observable(false);
	this.guests = ko.observable('').extend({'reversible': true});
	this.guests.subscribe(function () {
		if (!this.guestsLock())
		{
			$(this.guestsDom()).val(this.guests());
			$(this.guestsDom()).inputosaurus('refresh');
		}
	}, this);
	this.ownersLock = ko.observable(false);
	this.owners = ko.observable('').extend({'reversible': true});
	this.owners.subscribe(function () {
		if (!this.ownersLock())
		{
			$(this.ownersDom()).val(this.owners());
			$(this.ownersDom()).inputosaurus('refresh');
		}
	}, this);


	this.fCallback = null;

	this.calendarId = ko.observable(null);
	this.selectedColor = ko.observable('');
	this.calendarUrl = ko.observable('');
	this.exportUrl = ko.observable('');
	this.icsLink = ko.observable('');
	this.isPublic = ko.observable(false);
	this.shares = ko.observableArray([]);
	this.owner = ko.observable('');

	this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
	this.whomAnimate = ko.observable('');

	this.newShare = ko.observable('');
	this.newShareFocus = ko.observable(false);
	this.newShareAccess = ko.observable(Enums.CalendarAccess.Read);
	this.sharedToAll = ko.observable(false);
	this.sharedToAllAccess = ko.observable(Enums.CalendarAccess.Read);
	this.canAdd = ko.observable(false);
	this.aAccess = [
		{'value': Enums.CalendarAccess.Read, 'display': TextUtils.i18n('%MODULENAME%/LABEL_CAN_SEE')},
		{'value': Enums.CalendarAccess.Write, 'display': TextUtils.i18n('%MODULENAME%/LABEL_CAN_EDIT')}
	];

	this.showGlobalContacts = false; // todo:!!AppData.User.ShowGlobalContacts;
}

_.extendOwn(CCalendarSharePopup.prototype, CAbstractPopup.prototype);

CCalendarSharePopup.prototype.PopupTemplate = '%ModuleName%_CalendarSharePopup';


/**
 * @param {Function} fCallback
 * @param {Object} oCalendar
 */
CCalendarSharePopup.prototype.onOpen = function (fCallback, oCalendar)
{
	if (_.isFunction(fCallback))
	{
		this.fCallback = fCallback;
	}
	if (!_.isUndefined(oCalendar))
	{
		this.selectedColor(oCalendar.color());
		this.calendarId(oCalendar.id);
		this.calendarUrl(oCalendar.davUrl() + oCalendar.url());
		this.exportUrl(oCalendar.exportUrl());
		this.icsLink(oCalendar.davUrl() + oCalendar.url() + '?export');
		this.isPublic(oCalendar.isPublic());
		this.owner(oCalendar.owner());

		this.populateShares(oCalendar.shares());
		this.sharedToAll(oCalendar.isSharedToAll());
		this.sharedToAllAccess(oCalendar.sharedToAllAccess);
	}
};

CCalendarSharePopup.prototype.onSaveClick = function ()
{
	if (this.fCallback)
	{
		this.fCallback(this.calendarId(), this.isPublic(), this.getShares(), this.sharedToAll(), this.sharedToAllAccess());
	}
	this.closePopup();
};

CCalendarSharePopup.prototype.onEscHandler = function ()
{
	this.onCancelClick();
};

CCalendarSharePopup.prototype.onClose = function ()
{
	this.cleanAll();
};

CCalendarSharePopup.prototype.cleanAll = function ()
{
	this.newShare('');
	this.newShareAccess(Enums.CalendarAccess.Read);
	this.shareToAllAccess = ko.observable(Enums.CalendarAccess.Read);
	//this.shareAutocompleteItem(null);
	this.canAdd(false);
};

/**
 * @param {string} sTerm
 * @param {Function} fResponse
 */
CCalendarSharePopup.prototype.autocompleteCallback = function (sTerm, fResponse)
{
	var	oParameters = {
			'Search': sTerm,
			'SortField': Enums.ContactSortField.Frequency,
			'SortOrder': 1,
			'Storage': 'team'
		}
	;
	
	Ajax.send('Contacts', 'GetContacts', oParameters, function (oData) {
		var aList = [];
		if (oData && oData.Result && oData.Result && oData.Result.List)
		{
			aList = _.map(oData.Result.List, function (oItem) {
				return oItem && oItem.ViewEmail && oItem.ViewEmail !== this.owner() ?
					(oItem.Name && 0 < Utils.trim(oItem.Name).length ?
						oItem.ForSharedToAll ? {value: oItem.Name, name: oItem.Name, email: oItem.ViewEmail, frequency: oItem.Frequency} :
						{value:'"' + oItem.Name + '" <' + oItem.ViewEmail + '>', name: oItem.Name, email: oItem.ViewEmail, frequency: oItem.Frequency} : {value: oItem.ViewEmail, name: '', email: oItem.ViewEmail, frequency: oItem.Frequency}) : null;
			}, this);

			aList = _.sortBy(_.compact(aList), function(num){
				return num.frequency;
			}).reverse();
		}

		fResponse(aList);

	}, this);
};

/**
 * @param {string} sEmail
 */
CCalendarSharePopup.prototype.itsMe = function (sEmail)
{
	return (sEmail === App.getUserPublicId());
};

CCalendarSharePopup.prototype.initInputosaurus = function (koDom, ko, koLock)
{
	if (koDom() && $(koDom()).length > 0)
	{
		$(koDom()).inputosaurus({
			width: 'auto',
			parseOnBlur: true,
			autoCompleteSource: _.bind(function (oData, fResponse) {
				this.autocompleteCallback(oData.term, fResponse);
			}, this),
			change : _.bind(function (ev) {
				koLock(true);
				this.setRecipient(ko, ev.target.value);
				koLock(false);
			}, this),
			copy: _.bind(function (sVal) {
				this.inputosaurusBuffer = sVal;
			}, this),
			paste: _.bind(function () {
				var sInputosaurusBuffer = this.inputosaurusBuffer || '';
				this.inputosaurusBuffer = '';
				return sInputosaurusBuffer;
			}, this),
			mobileDevice: App.isMobile()
		});
	}
};

CCalendarSharePopup.prototype.setRecipient = function (koRecipient, sRecipient)
{
	if (koRecipient() === sRecipient)
	{
		koRecipient.valueHasMutated();
	}
	else
	{
		koRecipient(sRecipient);
	}
};

CCalendarSharePopup.prototype.getShares = function ()
{
	return $.merge(_.map(AddressUtils.getArrayRecipients(this.guests(), false), function(oGuest){
			return {
				name: oGuest.name,
				email: oGuest.email,
				access: Enums.CalendarAccess.Read
			};
		}),
		_.map(AddressUtils.getArrayRecipients(this.owners(), false), function(oOwner){
			return {
				name: oOwner.name,
				email: oOwner.email,
				access: Enums.CalendarAccess.Write
			};
		}));
};

CCalendarSharePopup.prototype.populateShares = function (aShares)
{
	var
		sGuests = '',
		sOwners = ''
	;

	_.each(aShares, function (oShare) {
		if (oShare.access === Enums.CalendarAccess.Read)
		{
			sGuests = oShare.name !== '' && oShare.name !== oShare.email ? 
						sGuests + '"' + oShare.name + '" <' + oShare.email + '>,' : 
						sGuests + oShare.email + ', ';
		}
		else if (oShare.access === Enums.CalendarAccess.Write)
		{
			sOwners = oShare.name !== '' && oShare.name !== oShare.email ? 
						sOwners + '"' + oShare.name + '" <' + oShare.email + '>,' : 
						sOwners + oShare.email + ', ';
		}
	}, this);

	this.setRecipient (this.guests, sGuests);
	this.setRecipient (this.owners, sOwners);
};

module.exports = new CCalendarSharePopup();