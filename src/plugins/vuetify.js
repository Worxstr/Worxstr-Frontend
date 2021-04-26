import Vue from 'vue';
import Vuetify, { colors } from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#3b7bef',
                secondary: colors.deepPurple.darken1,
            },
            dark: {
                primary: '#3b7bef',
                secondary: colors.deepPurple.darken1,
            },
        },
    },
});
