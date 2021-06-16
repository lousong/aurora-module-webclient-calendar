import settings from "../../CalendarWebclient/vue/settings";
export default {
    name: 'CalendarWebclient',
   init (appData) {
        settings.init(appData)
    },
    getAdminSystemTabs () {
        return [
            {
                name: 'calendar',
                title: 'CALENDARWEBCLIENT.LABEL_SETTINGS_TAB',
                component () {
                    return import('src/../../../CalendarWebclient/vue/components/CalendarAdminSettings')
                },
            },
        ]
    },
}
