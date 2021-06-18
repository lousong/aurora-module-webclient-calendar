import settings from '../../CalendarWebclient/vue/settings'

export default {
  moduleName: 'CalendarWebclient',

  requiredModules: ['Calendar'],

  init (appData) {
    settings.init(appData)
  },

  getAdminSystemTabs () {
    return [
      {
        tabName: 'calendar',
        title: 'CALENDARWEBCLIENT.LABEL_SETTINGS_TAB',
        component () {
          return import('src/../../../CalendarWebclient/vue/components/CalendarAdminSettings')
        },
      },
    ]
  },
}
