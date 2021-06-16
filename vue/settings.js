import _ from 'lodash'

import typesUtils from 'src/utils/types'

class CalendarSettings {
  constructor (appData) {
    const calendarWebclientData = typesUtils.pObject(appData.Calendar)
    if (!_.isEmpty(calendarWebclientData)) {
      this.AllowTasks = typesUtils.pBool(calendarWebclientData.AllowTasks, this.AllowTasks);
      this.DefaultTab = typesUtils.pString(calendarWebclientData.DefaultTab, this.DefaultTab); // 1 - day, 2 - week, 3 - month
      this.HighlightWorkingDays = typesUtils.pBool(calendarWebclientData.HighlightWorkingDays, this.HighlightWorkingDays);
      this.HighlightWorkingHours = typesUtils.pBool(calendarWebclientData.HighlightWorkingHours, this.HighlightWorkingHours);
      this.PublicCalendarId = typesUtils.pString(calendarWebclientData.PublicCalendarId, this.PublicCalendarId);
      this.WeekStartsOn = typesUtils.pString(calendarWebclientData.WeekStartsOn, this.WeekStartsOn); // 0 - sunday
      this.WorkdayEnds = typesUtils.pString(calendarWebclientData.WorkdayEnds, this.WorkdayEnds);
      this.WorkdayStarts = typesUtils.pString(calendarWebclientData.WorkdayStarts, this.WorkdayStarts);
    }
  }

  saveCalendarSettings ({ HighlightWorkingDays, HighlightWorkingHours, WorkdayStarts, WorkdayEnds, WeekStartsOn, DefaultTab }) {
    this.DefaultTab = DefaultTab
    this.HighlightWorkingDays = HighlightWorkingDays
    this.HighlightWorkingHours = HighlightWorkingHours
    this.WeekStartsOn = WeekStartsOn
    this.WorkdayEnds = WorkdayEnds
    this.WorkdayStarts = WorkdayStarts
  }
}

let settings = null

export default {
  init (appData) {
    settings = new CalendarSettings(appData)
  },
  saveCalendarSettings (data) {
    settings.saveCalendarSettings(data)
  },
  getCalendarSettings () {
    return {
      HighlightWorkingDays: settings.HighlightWorkingDays,
      HighlightWorkingHours: settings.HighlightWorkingHours,
      WorkdayStarts: settings.WorkdayStarts,
      WorkdayEnds: settings.WorkdayEnds,
      WeekStartsOn: settings.WeekStartsOn,
      DefaultTab: settings.DefaultTab
    }
  },

}
