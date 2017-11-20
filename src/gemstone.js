/*
**  GemstoneJS -- Gemstone JavaScript Technology Stack
**  Copyright (c) 2016-2017 Gemstone Project <http://gemstonejs.com>
**  Licensed under Apache License 2.0 <https://spdx.org/licenses/Apache-2.0>
*/

/*
 *  The external dependencies
 */

/* eslint import/first: off */

import                                "normalize.css"
import                                "animate.css"

export { default as $ } from          "jquery"
import $ from                         "jquery"
import                                "jquery-stage"
import                                "jquery.transit"

export { default as cs } from         "componentjs"
import cs from                        "componentjs"
import                                "componentjs/component.plugin.vue.js"
import                                "componentjs/component.plugin.localstorage.js"
import                                "componentjs/component.plugin.testdrive.js"
import                                "componentjs/component.plugin.debugger.js"

export { default as mvc } from        "componentjs-mvc"
import mvc from                       "componentjs-mvc"

export { default as vue } from        "vue"
import vue from                       "vue"
import vueParams from                 "vue-params"
import vueI18Next from                "vue-i18next"

export { default as i18next } from    "i18next"
import i18next from                   "i18next"

export { default as uri } from        "urijs"
import uri from                       "urijs"

export { default as router5 } from    "router5"
import router5 from                   "router5"

export { default as mousetrap } from  "mousetrap"
import mousetrap from                 "mousetrap"

export { default as hammer } from     "hammerjs"
import hammer from                    "hammerjs"

export { default as howler } from     "howler"
import howler from                    "howler"

export { default as store } from      "store"
import store from                     "store"

export { default as axios } from      "axios"
import axios from                     "axios"

export { default as uuid } from       "pure-uuid"
import uuid from                      "pure-uuid"

export { default as sprintf } from    "sprintfjs"
import sprintf from                   "sprintfjs"

export { default as numeral } from    "numeral"
import numeral from                   "numeral"

/*
 *  The Gemstone API
 */

import Latching from "latching"

let latching = new Latching()

export default class Gemstone {
    /*  latching integration  */
    at      (...args) { return latching.at(...args) }
    latch   (...args) { return latching.latch(...args) }
    unlatch (...args) { return latching.unlatch(...args) }

    /*  convenience short-hands properties  */
    static get $         () { return $ }
    static get cs        () { return cs }
    static get mvc       () { return mvc }
    static get vue       () { return vue }
    static get i18next   () { return i18next }
    static get uri       () { return uri }
    static get router5   () { return router5 }
    static get mousetrap () { return mousetrap }
    static get hammer    () { return hammer }
    static get howler    () { return howler }
    static get store     () { return store }
    static get axios     () { return axios }
    static get uuid      () { return uuid }
    static get sprintf   () { return sprintf }
    static get numeral   () { return numeral }

    /*  the bootstrapping API method  */
    static async boot (options) {
        latching.hook("boot-enter", "pass", options)

        /*  default options  */
        options = Object.assign({
            app:    "example",
            config: { env: "development", tag: "", hash: "", time: "" },
            ui:     () => [ "root", {}, "visible" ],
            sv:     (url, cid) => ({})
        }, options)
        latching.hook("boot-options", "pass", options)

        /*  give information in development environment  */
        if (options.config.env === "development") {
            /* eslint no-console: off */
            console.info(
                `Gemstone Application (app: ${options.app}, env: ${options.config.env}, ` +
                `tag: "${options.config.tag}", hash: ${options.config.hash}, time: ${options.config.time})\n` +
                "Notice: You are driving Gemstone in development mode. " +
                "Make sure to turn on production mode when deploying for production.\n" +
                "Hint: See the Gemstone documentation under https://gemstonejs.com/docs for help.")
        }

        /*  sanity check environment  */
        if (!store.enabled)
            throw new Error("no localStorage available")

        /*  bootstrap component system  */
        cs.bootstrap()
        let root = cs("/")
        mvc.ComponentJS = cs
        mvc.jQuery      = $
        mvc.Plugin()
        latching.hook("boot-componentjs", "pass", root)

        /*  determine current URL query info  */
        let url = new uri()
        let queryInfo = url.query(true)
        latching.hook("boot-url", "pass", url)

        /*  determine a persistent and overridable parameter  */
        const app = options.app.toLowerCase().replace(/[^a-z0-9]+/, "")
        const persistParam = (name, value) => {
            store.set(`gs-${app}-${name}`, value)
        }
        const determineParam = (name, make) => {
            let value = queryInfo[name]
            if (value)
                persistParam(name, value)
            else {
                value = store.get(`gs-${app}-${name}`)
                if (!value) {
                    value = make()
                    persistParam(name, value)
                }
            }
            return value
        }

        /*  determine client id  */
        let cid = determineParam("cid", () => {
            /* eslint new-cap: off */
            return (new uuid(1).format())
        })
        latching.hook("boot-cid", "pass", cid)

        /*  determine language  */
        let lang = determineParam("lang", () => {
            var langs = []
            if (navigator.languages)
                for (var i = 0; i < navigator.languages.length; i++)
                    langs.push(navigator.languages[i])
            if (navigator.userLanguage)
                langs.push(navigator.userLanguage)
            if (navigator.language)
                langs.push(navigator.language)
            let lang = "en"
            for (let i = 0; i < langs.length; i++) {
                if (typeof langs[i] === "string" && langs[i].match(/^[a-z]{2}$/)) {
                    lang = langs[i]
                    break
                }
            }
            return lang
        })
        latching.hook("boot-lang", "pass", lang)

        /*  determine theme  */
        let theme = determineParam("theme", () => {
            return "default"
        })
        latching.hook("boot-theme", "pass", theme)

        /*  provide a ComponentJS root model  */
        root.model({
            "gsConfig": { value: options.config, valid: "{ env: string, tag: string, hash: string, time: string }" },
            "gsCID":    { value: cid,            valid: "string" },
            "gsLang":   { value: lang,           valid: "string" },
            "gsTheme":  { value: theme,          valid: "string" },
            "gsStage": {
                value: {
                    w: 0, h: 0, dp: 0, dppx: 0, ppi: 0, di: 0,
                    orientation: "", size: ""
                },
                valid: `{
                    w: number, h: number, dp: number, dppx: number, ppi: number, di: number,
                    orientation: string, size: string
                }`
            }
        })
        latching.hook("boot-model", "none")

        /*  await DOM to be ready  */
        await new Promise((resolve) => {
            $(document).ready(resolve)
        })
        latching.hook("boot-dom-ready", "none")

        /*  configure I18Next/Vue for locale translations  */
        i18next.init({
            lng:         lang,
            fallbackLng: "en",
            defaultNS:   "global",
            fallbackNS:  "global"
        })
        i18next.addResourceBundle(lang, "global", {}, true, true)
        i18next.addResourceBundle("en", "global", {}, true, true)
        vue.use(vueParams)
        vue.use(vueI18Next)
        root.observe({
            name: "gsLang", boot: true, func: (ev, lang, langOld) => {
                /*  set global i18Next language for vue-i18next  */
                vue.params.i18nextLanguage = lang

                /*  provide language on DOM  */
                $("body")
                    .removeClass(`gs-lang-${langOld}`)
                    .addClass(`gs-lang-${lang}`)

                /*  persist value  */
                persistParam("lang", lang)
            }
        })
        i18next.addResourceBundles = (id, bundles, deep = true, overwrite = true) => {
            if (typeof bundles !== "object")
                throw new Error("invalid I18N resource bundles object")
            Object.keys(bundles).forEach((lng) => {
                i18next.addResourceBundle(lng, id, bundles[lng], deep, overwrite)
            })
        }
        mvc.latch("mask:vue-options", ({ id, options }) => {
            /*  set mask-local i18Next namespace for vue-i18next  */
            options.i18nextNamespace = id

            /*  inject language translation  */
            i18next.addResourceBundle("en", id, {}, true, true)
            i18next.addResourceBundles(id, options.i18n)
        })
        latching.hook("boot-i18n", "none")

        /*  setup service layer  */
        let sv = options.sv(url, cid)
        root.property("sv", sv)
        if (typeof sv === "object" && typeof sv.boot === "function")
            await sv.boot()
        latching.hook("boot-sv", "pass", sv)

        /*  optionally open ComponentJS debugger  */
        if (options.config.env === "development") {
            let hash = url.hash()
            let csdebugEnabled = (hash === "#debug" || queryInfo.debug !== undefined)
            cs.debug(csdebugEnabled ? 9 : 0)
            cs.debug_window({
                enable:    csdebugEnabled,
                natural:   true,
                autoclose: false,
                name:      options.app,
                width:     800,
                height:    1000
            })

            /*  SHAMELESS HACK FOR DEBUGGING: provide some helpers  */
            if (csdebugEnabled || cs.debug_instrumented()) {
                window.cs = cs
                window.$  = $
            }
        }
        latching.hook("boot-debugger", "none")

        /*  provide stage information  */
        $.stage.settings({
            ppi: {
                "100": "dp > 1024 && dppx <= 1.0",
                "130": "*",
                "160": "dp < 1024 && dppx >= 2.0"
            },
            size: {
                "smallPhone": "0.0 <= di && di <  4.1",
                "phone":      "4.1 <= di && di <  6.0",
                "tablet":     "6.0 <= di && di < 12.0",
                "desktop":    "*"
            },
            orientation: {
                "portrait":  "h > w * 1.2",
                "square":    "*",
                "landscape": "w > h * 1.2"
            }
        })
        const updateStage = (stage, stageOld) => {
            /*  deliver stage information  */
            root.value("gsStage.w",           stage.w)
            root.value("gsStage.h",           stage.h)
            root.value("gsStage.dp",          stage.dp)
            root.value("gsStage.dppx",        stage.dppx)
            root.value("gsStage.ppi",         stage.ppi)
            root.value("gsStage.di",          stage.di)
            root.value("gsStage.size",        stage.size)
            root.value("gsStage.orientation", stage.orientation)

            /*  provide Stage information on DOM  */
            if (stageOld !== null)
                $("body")
                    .removeClass(`gs-stage-${stageOld.size}`)
                    .removeClass(`gs-stage-${stageOld.orientation}`)
            $("body")
                .addClass(`gs-stage-${stage.size}`)
                .addClass(`gs-stage-${stage.orientation}`)
        }
        $(window).bind("stage", (ev, stage, stageOld) => {
            updateStage(stage, stageOld)
        })
        updateStage($.stage(), null)
        latching.hook("boot-stage", "none")

        /*  prevent rubberband effect on app swipes (in iOS Safari)  */
        $("body").on("touchmove", (ev) => {
            ev.preventDefault()
        })

        /*  provide Theme information on DOM  */
        root.observe({
            name: "gsTheme", boot: true, func: (ev, themeNew, themeOld) => {
                /*  store information in DOM  */
                $("body")
                    .removeClass(`gs-theme-${themeOld}`)
                    .addClass(`gs-theme-${themeNew}`)

                /*  persist value  */
                persistParam("theme", themeNew)
            }
        })

        /*  provide top-level DOM socket  */
        root.socket($("body"))
        latching.hook("boot-socket", "none")

        /*  create and make visible the root component  */
        let [ name, comp, state ] = options.ui()
        root.create(name, comp).state(state)
        latching.hook("boot-leave", "none")
    }

    /*  the shutdown API method  */
    static async shutdown () {
        latching.hook("shutdown-enter", "none")

        /*  determine root component  */
        let root = cs("/")

        /*  shutdown service layer  */
        let sv = root.property("sv")
        if (typeof sv === "object" && typeof sv.shutdown === "function")
            await sv.shutdown()

        /*  shutdown component tree  */
        await new Promise((resolve) => {
            root.state("created", resolve)
        })

        /*  shutdown component system  */
        cs.shutdown()

        /*  cleanup DOM  */
        $("body").attr("class").split(/\s+/).forEach((cls) => {
            if (cls.match(/^gs-/))
                $("body").removeClass(cls)
        })
        if ($("body").attr("class") === "")
            $("body").removeAttr("class")
        latching.hook("shutdown-leave", "none")
    }
}

